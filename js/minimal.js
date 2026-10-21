/**
 * BORNOBAZAR (বর্ণবাজার) — MINIMAL LUXURY JAVASCRIPT ENGINE
 * Inspired by Fishtown Pickles • Fast • Reactive • Zero External Dependencies
 */

(function () {
  'use strict';

  const fmtPrice = (amount) => '৳' + Number(amount || 0).toLocaleString('bn-BD');
  const escHtml = (str) => String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));

  const FREE_SHIPPING_THRESHOLD = 999;

  window.BornobazarMinimal = {
    products: window.BORNOBAZAR_PRODUCTS || [],
    cart: [],
    deliveryArea: 'inside_dhaka',

    init: function () {
      this.loadCart();
      this.bindGlobalEvents();
      this.updateCartBadges();

      // Page-specific initializers
      if (document.getElementById('home-featured-grid')) {
        this.initHomePage();
      }
      if (document.getElementById('catalog-grid')) {
        this.initCatalogPage();
      }
      if (document.getElementById('pdp-app')) {
        this.initProductPage();
      }
      if (document.getElementById('cart-page-app')) {
        this.initCartPage();
      }
      if (document.getElementById('checkout-form')) {
        this.initCheckoutPage();
      }
      if (document.getElementById('order-success-app')) {
        this.initOrderSuccessPage();
      }
    },

    /* ==========================================================================
       CART & STORAGE
       ========================================================================== */
    loadCart: function () {
      try {
        const stored = localStorage.getItem('bb_minimal_cart');
        this.cart = stored ? JSON.parse(stored) : [];
      } catch (e) {
        this.cart = [];
      }
    },

    saveCart: function () {
      try {
        localStorage.setItem('bb_minimal_cart', JSON.stringify(this.cart));
      } catch (e) {}
      this.updateCartBadges();
      this.renderCartDrawer();
    },

    addToCart: function (productId, weight, qty) {
      qty = Math.max(1, parseInt(qty, 10) || 1);
      const prod = this.findProduct(productId);
      if (!prod) return;

      const selWeight = weight || (prod.weights && prod.weights[0]) || 'স্ট্যান্ডার্ড';
      const price = (prod.weight_pricing && prod.weight_pricing[selWeight])
        ? prod.weight_pricing[selWeight]
        : prod.sale_price;

      const existing = this.cart.find(item => item.id === prod.id && item.weight === selWeight);
      if (existing) {
        existing.qty += qty;
      } else {
        this.cart.push({
          id: prod.id,
          name_bn: prod.name_bn,
          name_en: prod.name_en,
          image: prod.primary_image || 'Logo/bornobazar-logo.png',
          weight: selWeight,
          price: price,
          qty: qty
        });
      }

      this.saveCart();
      this.showToast(`"${prod.name_bn}" কার্টে যোগ করা হয়েছে!`);
      this.openCart();
    },

    updateCartQty: function (index, delta) {
      if (!this.cart[index]) return;
      this.cart[index].qty += delta;
      if (this.cart[index].qty <= 0) {
        this.cart.splice(index, 1);
      }
      this.saveCart();
      if (document.getElementById('cart-page-app')) {
        this.initCartPage();
      }
    },

    removeFromCart: function (index) {
      if (!this.cart[index]) return;
      this.cart.splice(index, 1);
      this.saveCart();
      if (document.getElementById('cart-page-app')) {
        this.initCartPage();
      }
    },

    getCartSubtotal: function () {
      return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    getCartItemCount: function () {
      return this.cart.reduce((sum, item) => sum + item.qty, 0);
    },

    updateCartBadges: function () {
      const count = this.getCartItemCount();
      document.querySelectorAll('.bb-cart-count-badge').forEach(el => {
        el.textContent = count;
      });
    },

    /* ==========================================================================
       CART DRAWER
       ========================================================================== */
    openCart: function () {
      const drawer = document.getElementById('cart-drawer');
      const backdrop = document.getElementById('drawer-backdrop');
      if (drawer) drawer.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.renderCartDrawer();
    },

    closeCart: function () {
      const drawer = document.getElementById('cart-drawer');
      const backdrop = document.getElementById('drawer-backdrop');
      if (drawer) drawer.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
    },

    renderCartDrawer: function () {
      const bodyEl = document.getElementById('cart-drawer-body');
      const subtotalEl = document.getElementById('drawer-subtotal-val');
      const freeShipFill = document.getElementById('drawer-free-ship-fill');
      const freeShipText = document.getElementById('drawer-free-ship-text');
      if (!bodyEl) return;

      const subtotal = this.getCartSubtotal();
      if (subtotalEl) subtotalEl.textContent = fmtPrice(subtotal);

      // Free shipping progress
      if (freeShipFill && freeShipText) {
        const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
        if (remaining <= 0) {
          freeShipFill.style.width = '100%';
          freeShipText.innerHTML = '🎉 অভিনন্দন! আপনি <strong>ফ্রি হোম ডেলিভারি</strong> পাচ্ছেন!';
        } else {
          const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
          freeShipFill.style.width = pct + '%';
          freeShipText.innerHTML = `আর মাত্র <strong>${fmtPrice(remaining)}</strong> টাকার অর্ডার করলেই <strong>ফ্রি ডেলিভারি</strong>!`;
        }
      }

      if (this.cart.length === 0) {
        bodyEl.innerHTML = `
          <div style="text-align: center; padding: 48px 0;">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin: 0 auto 12px; color: var(--bb-text-light);">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <div style="font-family: var(--font-display); font-size: 18px; text-transform: uppercase; color: var(--bb-forest); margin-bottom: 6px;">আপনার শপিং ব্যাগ খালি</div>
            <p style="font-size: 14px; color: var(--bb-text-muted); font-family: var(--font-bn); margin-bottom: 20px;">আমাদের খাঁটি ছোট-ব্যাচের আচার ও ঘরোয়া খাদ্যসম্ভার দেখতে শপ ব্রাউজ করুন।</p>
            <a href="shop.html" class="btn-pill btn-forest btn-sm" onclick="BornobazarMinimal.closeCart()">শপ ব্রাউজ করুন &rarr;</a>
          </div>
        `;
        return;
      }

      bodyEl.innerHTML = this.cart.map((item, idx) => `
        <div class="bb-cart-item">
          <img src="${item.image}" alt="${escHtml(item.name_bn)}" class="bb-cart-thumb">
          <div>
            <a href="product.html?id=${item.id}" class="bb-cart-item-title">${escHtml(item.name_bn)}</a>
            <div class="bb-cart-item-weight">${escHtml(item.weight)}</div>
            <div class="bb-cart-qty-ctrl">
              <button type="button" class="bb-cart-qty-btn" onclick="BornobazarMinimal.updateCartQty(${idx}, -1)">&minus;</button>
              <span class="bb-cart-qty-num">${item.qty}</span>
              <button type="button" class="bb-cart-qty-btn" onclick="BornobazarMinimal.updateCartQty(${idx}, 1)">&plus;</button>
            </div>
          </div>
          <div class="bb-cart-item-price">
            <div>${fmtPrice(item.price * item.qty)}</div>
            <button type="button" onclick="BornobazarMinimal.removeFromCart(${idx})" style="font-size: 11px; color: #DC2626; text-decoration: underline; margin-top: 6px; cursor: pointer;">মুছুন</button>
          </div>
        </div>
      `).join('');
    },

    /* ==========================================================================
       PRODUCT HELPER & CARDS
       ========================================================================== */
    findProduct: function (queryId) {
      if (!queryId) return this.products[0];
      const q = String(queryId).trim();
      const num = Number(q);
      if (!isNaN(num) && num > 0) {
        const byWc = this.products.find(p => p.wc_id === num);
        if (byWc) return byWc;
      }
      const byId = this.products.find(p => p.id === q);
      if (byId) return byId;
      const bySku = this.products.find(p => (p.sku && p.sku.toLowerCase() === q.toLowerCase()) || (p.slug && p.slug === q));
      if (bySku) return bySku;
      return this.products[0];
    },

    renderProductCardHtml: function (p) {
      const weights = p.weights || ['স্ট্যান্ডার্ড'];
      const defaultWeight = weights[0];
      const price = (p.weight_pricing && p.weight_pricing[defaultWeight]) ? p.weight_pricing[defaultWeight] : p.sale_price;
      const regPrice = (p.regular_price && p.regular_price > price) ? p.regular_price : null;
      const badge = p.category === 'স্পেশাল কম্বো' ? 'কম্বো অফার' : (p.on_sale ? 'ছোট ব্যাচ' : 'খাঁটি সরিষার তেল');

      return `
        <div class="bb-product-card" data-id="${p.id}" data-selected-weight="${defaultWeight}">
          <div class="bb-card-media">
            <span class="bb-card-badge">${badge}</span>
            <a href="product.html?id=${p.id}" style="display: contents;">
              <img src="${p.primary_image || 'Logo/bornobazar-logo.png'}" alt="${escHtml(p.name_bn)}" loading="lazy">
            </a>
          </div>
          <div class="bb-card-content">
            <div class="bb-card-cat">${escHtml(p.category)}</div>
            <a href="product.html?id=${p.id}">
              <h3 class="bb-card-title">${escHtml(p.name_bn)}</h3>
            </a>
            <div class="bb-card-rating">
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span>4.9 (৩৬ রিভিউ)</span>
            </div>
            
            ${weights.length > 1 ? `
              <div class="bb-card-variants">
                ${weights.map((w, idx) => `
                  <button type="button" class="bb-card-variant-btn ${idx === 0 ? 'active' : ''}" 
                    data-weight="${escHtml(w)}"
                    onclick="BornobazarMinimal.handleCardVariantSelect('${p.id}', '${escHtml(w)}', this)">
                    ${escHtml(w)}
                  </button>
                `).join('')}
              </div>
            ` : ''}

            <div class="bb-card-footer">
              <div class="bb-card-price-col">
                <span class="bb-card-price" id="card-price-${p.id}">${fmtPrice(price)}</span>
                ${regPrice ? `<span class="bb-card-regular-price">${fmtPrice(regPrice)}</span>` : ''}
              </div>
              <button type="button" class="bb-card-quick-add" onclick="BornobazarMinimal.handleCardQuickAdd('${p.id}', this)">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                <span>কার্ট</span>
              </button>
            </div>
          </div>
        </div>
      `;
    },

    handleCardVariantSelect: function (productId, weight, btn) {
      const card = btn.closest('.bb-product-card');
      if (!card) return;
      card.querySelectorAll('.bb-card-variant-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      card.setAttribute('data-selected-weight', weight);

      const p = this.findProduct(productId);
      if (p) {
        const pr = (p.weight_pricing && p.weight_pricing[weight]) ? p.weight_pricing[weight] : p.sale_price;
        const priceEl = card.querySelector(`#card-price-${p.id}`);
        if (priceEl) priceEl.textContent = fmtPrice(pr);
      }
    },

    handleCardQuickAdd: function (productId, btn) {
      const card = btn.closest('.bb-product-card');
      const weight = card ? card.getAttribute('data-selected-weight') : null;
      this.addToCart(productId, weight, 1);
    },

    /* ==========================================================================
       HOMEPAGE
       ========================================================================== */
    initHomePage: function () {
      const container = document.getElementById('home-featured-grid');
      if (!container) return;

      const featured = this.products.slice(0, 8);
      container.innerHTML = featured.map(p => this.renderProductCardHtml(p)).join('');

      // Filter tabs on homepage
      const tabs = document.querySelectorAll('.bb-filter-pill');
      tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const cat = tab.getAttribute('data-cat');
          const filtered = (cat === 'all')
            ? this.products.slice(0, 8)
            : this.products.filter(p => p.category === cat).slice(0, 8);
          container.innerHTML = filtered.map(p => this.renderProductCardHtml(p)).join('');
        });
      });
    },

    /* ==========================================================================
       CATALOG / SHOP PAGE
       ========================================================================== */
    initCatalogPage: function () {
      const container = document.getElementById('catalog-grid');
      const searchInput = document.getElementById('catalog-search');
      const countEl = document.getElementById('catalog-count');
      if (!container) return;

      const params = new URLSearchParams(window.location.search);
      let activeCat = params.get('cat') || 'all';

      // Set active filter pill
      document.querySelectorAll('.bb-filter-pill').forEach(pill => {
        const c = pill.getAttribute('data-cat');
        pill.classList.toggle('active', c === activeCat);
        pill.addEventListener('click', () => {
          document.querySelectorAll('.bb-filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          activeCat = c;
          render();
        });
      });

      const render = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let list = this.products;

        if (activeCat && activeCat !== 'all') {
          list = list.filter(p => p.category === activeCat);
        }

        if (query) {
          list = list.filter(p => 
            p.name_bn.toLowerCase().includes(query) ||
            (p.name_en && p.name_en.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query))
          );
        }

        if (countEl) countEl.textContent = `${list.length}টি পণ্য`;

        if (list.length === 0) {
          container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
              <h3 style="font-size: 20px; margin-bottom: 8px;">কোনো পণ্য খুঁজে পাওয়া যায়নি</h3>
              <p style="color: var(--bb-text-muted); font-family: var(--font-bn);">অন্য কিওয়ার্ড দিয়ে সার্চ করুন অথবা সকল পণ্য ব্রাউজ করুন।</p>
            </div>
          `;
          return;
        }

        container.innerHTML = list.map(p => this.renderProductCardHtml(p)).join('');
      };

      if (searchInput) {
        searchInput.addEventListener('input', render);
      }

      render();
    },

    /* ==========================================================================
       PRODUCT DETAIL PAGE (PDP)
       ========================================================================== */
    initProductPage: function () {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('id') || 'BB-ACH-002';
      const p = this.findProduct(queryId);
      if (!p) return;

      document.title = p.name_bn + ' — বর্ণবাজার (Bornobazar)';

      let selVariantIndex = 0;
      let qty = 1;
      let bundleMode = 'single'; // single, duo, trio

      const variants = (p.weights || ['স্ট্যান্ডার্ড']).map(w => {
        const price = (p.weight_pricing && p.weight_pricing[w]) ? p.weight_pricing[w] : p.sale_price;
        const reg = (p.regular_price > price) ? p.regular_price : price;
        return { w, price, reg };
      });

      // Gallery Images
      const images = (p.images && p.images.length > 0) ? p.images : [p.primary_image || 'Logo/bornobazar-logo.png'];
      const mainImg = document.getElementById('pdp-main-img');
      const thumbsBox = document.getElementById('pdp-thumbs');

      if (mainImg) mainImg.src = images[0];
      if (thumbsBox && images.length > 1) {
        thumbsBox.innerHTML = images.map((src, i) => `
          <button type="button" class="bb-pdp-thumb-btn ${i === 0 ? 'active' : ''}" onclick="BornobazarMinimal.switchPdpImage('${src}', this)">
            <img src="${src}" alt="${escHtml(p.name_bn)} ${i+1}">
          </button>
        `).join('');
      }

      // Populate Meta Info
      const titleEl = document.getElementById('pdp-title');
      const catEl = document.getElementById('pdp-cat');
      const descEl = document.getElementById('pdp-desc');
      if (titleEl) titleEl.textContent = p.name_bn;
      if (catEl) catEl.textContent = p.category;
      if (descEl) descEl.textContent = p.description;

      // Weight Selector Pills
      const weightChips = document.getElementById('pdp-weights');
      if (weightChips) {
        weightChips.innerHTML = variants.map((v, i) => `
          <button type="button" class="btn-pill btn-outline btn-sm ${i === 0 ? 'active' : ''}" 
            style="border-radius: var(--radius-pill); font-family: var(--font-bn); ${i === 0 ? 'background: var(--bb-forest); color: #fff;' : ''}"
            onclick="BornobazarMinimal.setPdpVariant(${i})">
            ${escHtml(v.w)}
          </button>
        `).join('');
      }

      const paint = () => {
        const v = variants[selVariantIndex];
        let finalPrice = v.price * qty;
        let discountNote = '';

        if (bundleMode === 'duo') {
          finalPrice = Math.round(v.price * 2 * 0.9); // 10% off
          discountNote = ' (১০% সেভার ছাড়)';
        } else if (bundleMode === 'trio') {
          finalPrice = Math.round(v.price * 3 * 0.85); // 15% off
          discountNote = ' (১৫% মেগা সেভার ছাড়)';
        }

        const priceEl = document.getElementById('pdp-price');
        if (priceEl) priceEl.textContent = fmtPrice(finalPrice) + discountNote;

        // Sync sticky bar
        const stickyImg = document.getElementById('sticky-bar-img');
        const stickyTitle = document.getElementById('sticky-bar-title');
        const stickyPrice = document.getElementById('sticky-bar-price');
        const stickyWeight = document.getElementById('sticky-bar-weight');

        if (stickyImg) stickyImg.src = p.primary_image || 'Logo/bornobazar-logo.png';
        if (stickyTitle) stickyTitle.textContent = p.name_bn;
        if (stickyPrice) stickyPrice.textContent = fmtPrice(finalPrice);
        if (stickyWeight) stickyWeight.textContent = v.w;
      };

      this.setPdpVariant = (idx) => {
        selVariantIndex = idx;
        const chips = document.querySelectorAll('#pdp-weights .btn-pill');
        chips.forEach((c, i) => {
          c.style.background = i === idx ? 'var(--bb-forest)' : 'transparent';
          c.style.color = i === idx ? '#fff' : 'var(--bb-forest)';
        });
        paint();
      };

      this.switchPdpImage = (src, btn) => {
        if (mainImg) mainImg.src = src;
        document.querySelectorAll('.bb-pdp-thumb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      };

      // Quantity controls
      const qtyMinus = document.getElementById('pdp-qty-minus');
      const qtyPlus = document.getElementById('pdp-qty-plus');
      const qtyVal = document.getElementById('pdp-qty-val');

      if (qtyMinus && qtyPlus && qtyVal) {
        qtyMinus.onclick = () => {
          if (qty > 1) { qty--; qtyVal.textContent = qty; paint(); }
        };
        qtyPlus.onclick = () => {
          qty++; qtyVal.textContent = qty; paint();
        };
      }

      // Bundle Tiers
      document.querySelectorAll('.bb-bundle-card').forEach(card => {
        card.addEventListener('click', () => {
          document.querySelectorAll('.bb-bundle-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          bundleMode = card.getAttribute('data-bundle-mode') || 'single';
          paint();
        });
      });

      // Add to Cart Action
      const addCartBtn = document.getElementById('pdp-add-cart');
      const buyNowBtn = document.getElementById('pdp-buy-now');

      const triggerAdd = () => {
        const v = variants[selVariantIndex];
        this.addToCart(p.id, v.w, qty);
      };

      const triggerBuyNow = () => {
        triggerAdd();
        window.location.href = 'checkout.html';
      };

      if (addCartBtn) addCartBtn.onclick = triggerAdd;
      if (buyNowBtn) buyNowBtn.onclick = triggerBuyNow;

      // Sticky Bar Buttons
      const stickyAdd = document.getElementById('sticky-bar-add');
      const stickyBuy = document.getElementById('sticky-bar-buy');
      if (stickyAdd) stickyAdd.onclick = triggerAdd;
      if (stickyBuy) stickyBuy.onclick = triggerBuyNow;

      paint();
    },

    /* ==========================================================================
       CART PAGE
       ========================================================================== */
    initCartPage: function () {
      const container = document.getElementById('cart-page-app');
      if (!container) return;

      if (this.cart.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 80px 20px;">
            <h1 class="h2" style="margin-bottom: 12px;">আপনার ব্যাগ বর্তমানে খালি</h1>
            <p style="color: var(--bb-text-muted); font-family: var(--font-bn); margin-bottom: 24px;">আমাদের খাঁটি ঐতিহ্যবাহী খাদ্যসম্ভার অর্ডার করতে শপ ভিজিট করুন।</p>
            <a href="shop.html" class="btn-pill btn-forest">শপিং করুন &rarr;</a>
          </div>
        `;
        return;
      }

      const subtotal = this.getCartSubtotal();

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 36px;" class="bb-cart-page-grid">
          <div style="background: #FFFFFF; border: 1px solid var(--bb-border); border-radius: var(--radius-card); padding: 24px;">
            <h2 class="h3" style="margin-bottom: 20px; border-bottom: 1px solid var(--bb-border); padding-bottom: 14px;">ব্যাগ আইটেমসমূহ (${this.getCartItemCount()})</h2>
            <div style="display: flex; flex-direction: column; gap: 18px;">
              ${this.cart.map((item, idx) => `
                <div style="display: grid; grid-template-columns: 80px 1fr auto; gap: 16px; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--bb-border);">
                  <img src="${item.image}" alt="${escHtml(item.name_bn)}" style="width: 80px; height: 80px; object-fit: contain; border-radius: var(--radius-md); background: var(--bb-surface-muted); border: 1px solid var(--bb-border);">
                  <div>
                    <a href="product.html?id=${item.id}" style="font-family: var(--font-bn); font-weight: 700; font-size: 16px; color: var(--bb-forest);">${escHtml(item.name_bn)}</a>
                    <div style="font-size: 13px; color: var(--bb-text-muted); margin: 2px 0 8px;">${escHtml(item.weight)}</div>
                    <div class="bb-cart-qty-ctrl">
                      <button type="button" class="bb-cart-qty-btn" onclick="BornobazarMinimal.updateCartQty(${idx}, -1)">&minus;</button>
                      <span class="bb-cart-qty-num">${item.qty}</span>
                      <button type="button" class="bb-cart-qty-btn" onclick="BornobazarMinimal.updateCartQty(${idx}, 1)">&plus;</button>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-family: var(--font-display); font-size: 20px; color: var(--bb-forest);">${fmtPrice(item.price * item.qty)}</div>
                    <button type="button" onclick="BornobazarMinimal.removeFromCart(${idx})" style="font-size: 12px; color: #DC2626; text-decoration: underline; margin-top: 8px; cursor: pointer;">মুছুন</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid var(--bb-border); border-radius: var(--radius-card); padding: 24px; height: fit-content;">
            <h3 class="h4" style="margin-bottom: 16px; border-bottom: 1px solid var(--bb-border); padding-bottom: 12px;">অর্ডার সামারি</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px;">
              <span style="color: var(--bb-text-muted);">সাবটোটাল</span>
              <span style="font-family: var(--font-display); font-size: 18px; color: var(--bb-forest);">${fmtPrice(subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 18px; font-size: 15px;">
              <span style="color: var(--bb-text-muted);">ডেলিভারি চার্জ</span>
              <span style="color: var(--bb-text-muted);">চেকআউট পেজে নির্ধারিত হবে</span>
            </div>
            <a href="checkout.html" class="btn-pill btn-lime btn-full" style="text-align: center; margin-bottom: 12px;">চেকআউট করুন &rarr;</a>
            <a href="shop.html" class="btn-pill btn-outline btn-full" style="text-align: center;">আরও পণ্য যোগ করুন</a>
          </div>
        </div>
      `;
    },

    /* ==========================================================================
       CHECKOUT PAGE
       ========================================================================== */
    initCheckoutPage: function () {
      const summaryEl = document.getElementById('checkout-items');
      const subtotalEl = document.getElementById('summary-subtotal');
      const shipEl = document.getElementById('summary-shipping');
      const totalEl = document.getElementById('summary-total');

      if (this.cart.length === 0) {
        alert('আপনার ব্যাগ খালি! শপিং শুরু করতে শপ ভিজিট করুন।');
        window.location.href = 'shop.html';
        return;
      }

      const update = () => {
        const sub = this.getCartSubtotal();
        const ship = (this.deliveryArea === 'inside_dhaka') ? 70 : 130;
        const total = sub + ship;

        if (subtotalEl) subtotalEl.textContent = fmtPrice(sub);
        if (shipEl) shipEl.textContent = fmtPrice(ship);
        if (totalEl) totalEl.textContent = fmtPrice(total);
      };

      if (summaryEl) {
        summaryEl.innerHTML = this.cart.map(item => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--bb-border);">
            <div>
              <div style="font-family: var(--font-bn); font-weight: 700; color: var(--bb-forest);">${escHtml(item.name_bn)}</div>
              <div style="font-size: 13px; color: var(--bb-text-muted);">${escHtml(item.weight)} &times; ${item.qty}</div>
            </div>
            <div style="font-family: var(--font-display); font-size: 16px; color: var(--bb-forest);">${fmtPrice(item.price * item.qty)}</div>
          </div>
        `).join('');
      }

      const dhakaRadio = document.getElementById('ship_inside');
      const outsideRadio = document.getElementById('ship_outside');
      if (dhakaRadio && outsideRadio) {
        dhakaRadio.onchange = () => { this.deliveryArea = 'inside_dhaka'; update(); };
        outsideRadio.onchange = () => { this.deliveryArea = 'outside_dhaka'; update(); };
      }

      update();

      const form = document.getElementById('checkout-form');
      if (form) {
        form.onsubmit = (e) => {
          e.preventDefault();
          const orderId = 'BB-' + Math.floor(100000 + Math.random() * 900000);
          const orderData = {
            orderId: orderId,
            items: this.cart,
            subtotal: this.getCartSubtotal(),
            shipping: (this.deliveryArea === 'inside_dhaka') ? 70 : 130,
            date: new Date().toLocaleDateString('bn-BD'),
            customerName: document.getElementById('cust_name')?.value || 'গ্রাহক',
            phone: document.getElementById('cust_phone')?.value || '',
            address: document.getElementById('cust_address')?.value || ''
          };
          try {
            localStorage.setItem('bb_last_order', JSON.stringify(orderData));
          } catch (e) {}

          this.cart = [];
          this.saveCart();
          window.location.href = 'order-success.html?order=' + orderId;
        };
      }
    },

    /* ==========================================================================
       ORDER SUCCESS
       ========================================================================== */
    initOrderSuccessPage: function () {
      const container = document.getElementById('order-success-app');
      if (!container) return;
      try {
        const order = JSON.parse(localStorage.getItem('bb_last_order') || '{}');
        const id = order.orderId || 'BB-849201';
        container.innerHTML = `
          <div style="text-align: center; max-width: 560px; margin: 60px auto; padding: 40px 24px; background: #FFFFFF; border: 1px solid var(--bb-border); border-radius: var(--radius-card); box-shadow: var(--shadow-md);">
            <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--bb-lime); color: var(--bb-forest); display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h1 class="h2" style="margin-bottom: 8px;">অর্ডার সফল হয়েছে!</h1>
            <p style="font-family: var(--font-bn); color: var(--bb-text-muted); font-size: 16px; margin-bottom: 24px;">ধন্যবাদ! আপনার অর্ডারটি আমরা গ্রহণ করেছি। খুব শীঘ্রই আমাদের কাস্টমার প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।</p>
            <div style="background: var(--bb-surface-muted); padding: 16px; border-radius: var(--radius-md); font-family: var(--font-display); font-size: 16px; margin-bottom: 28px;">
              অর্ডার নম্বর: <span style="color: var(--bb-forest);">${id}</span>
            </div>
            <a href="index.html" class="btn-pill btn-forest">হোমে ফিরে যান</a>
          </div>
        `;
      } catch (e) {}
    },

    /* ==========================================================================
       GLOBAL UTILS & TOAST
       ========================================================================== */
    showToast: function (msg) {
      let toast = document.getElementById('bb-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'bb-toast';
        toast.className = 'bb-toast';
        toast.innerHTML = `
          <span class="bb-toast-icon">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
          </span>
          <span class="bb-toast-text"></span>
        `;
        document.body.appendChild(toast);
      }
      toast.querySelector('.bb-toast-text').textContent = msg;
      toast.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    },

    bindGlobalEvents: function () {
      // Cart drawer triggers
      document.querySelectorAll('.js-open-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.openCart();
        });
      });

      document.querySelectorAll('.js-close-cart').forEach(btn => {
        btn.addEventListener('click', () => this.closeCart());
      });

      const backdrop = document.getElementById('drawer-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          this.closeCart();
          this.closeMobileMenu();
        });
      }

      // Mobile Menu
      const menuBtn = document.querySelector('.js-open-mobile-menu');
      if (menuBtn) {
        menuBtn.addEventListener('click', () => this.openMobileMenu());
      }
      const menuClose = document.querySelector('.js-close-mobile-menu');
      if (menuClose) {
        menuClose.addEventListener('click', () => this.closeMobileMenu());
      }

      // Escape key closes modals/drawers
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeCart();
          this.closeMobileMenu();
        }
      });
    },

    openMobileMenu: function () {
      const menu = document.getElementById('mobile-drawer');
      const backdrop = document.getElementById('drawer-backdrop');
      if (menu) menu.classList.add('active');
      if (backdrop) backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    },

    closeMobileMenu: function () {
      const menu = document.getElementById('mobile-drawer');
      const backdrop = document.getElementById('drawer-backdrop');
      if (menu) menu.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.BornobazarMinimal.init());
  } else {
    window.BornobazarMinimal.init();
  }
})();
