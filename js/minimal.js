/**
 * BORNOBAZAR (বর্ণবাজার) — MINIMAL LUXURY JAVASCRIPT ENGINE
 * Inspired by Fishtown Pickles • Fast • Reactive • Zero External Dependencies
 */

(function () {
  'use strict';

  const fmtPrice = (amount) => '৳' + Number(amount || 0).toLocaleString('en-US');
  const escHtml = (str) => String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));

  const FREE_SHIPPING_THRESHOLD = 999;

  const BORNOBAZAR_REELS = [
    {
      id: 'reel_1',
      title: 'Artisanal Garlic Achar Cured in Pure Mustard Oil',
      shortTitle: 'Garlic Achar Special',
      videoSrc: 'videos/reel_1.mp4',
      poster: 'videos/poster_1.jpg',
      productId: 'BB-ACH-012',
      productName: 'Garlic Achar (Special Twist)',
      productThumb: 'All images/761355190_1034052569236062_78667506752820005_n.jpg',
      price: 240,
      regularPrice: 280,
      weight: '200 gm'
    },
    {
      id: 'reel_2',
      title: 'Royal Tang & Nostalgic Aroma — Alubokhara Achar',
      shortTitle: 'Alubokhara Achar',
      videoSrc: 'videos/reel_2.mp4',
      poster: 'videos/poster_2.jpg',
      productId: 'BB-ACH-002',
      productName: 'Royal Alubokhara Achar',
      productThumb: 'All images/779787836_1049495257691793_4108399455579486072_n.jpg',
      price: 240,
      regularPrice: 280,
      weight: '200 gm'
    },
    {
      id: 'reel_3',
      title: 'Three Heritage Flavors — Nutri Immunity Achar Combo',
      shortTitle: 'Nutri Achar Combo',
      videoSrc: 'videos/reel_3.mp4',
      poster: 'videos/poster_3.jpg',
      productId: 'BB-COM-006',
      productName: 'Nutri Immunity Achar Combo',
      productThumb: 'All images/788601539_1056888763619109_5968941487902862885_n.jpg',
      price: 890,
      regularPrice: 1090,
      weight: '800 gm'
    },
    {
      id: 'reel_4',
      title: 'Authentic Village Spices & Zest — Pure Tamarind Achar',
      shortTitle: 'Tamarind Achar',
      videoSrc: 'videos/reel_4.mp4',
      poster: 'videos/poster_4.jpg',
      productId: 'BB-ACH-016',
      productName: 'Tamarind Achar (Premium Jar)',
      productThumb: 'All images/813976083_1073010388673613_8899924605867364727_n.jpg',
      price: 380,
      regularPrice: 420,
      weight: '400 gm'
    },
    {
      id: 'reel_5',
      title: 'Everyday Dining Joy — Boro Achar Sweet & Sour Crush',
      shortTitle: 'Boro Achar Crush',
      videoSrc: 'videos/reel_5.mp4',
      poster: 'videos/poster_5.jpg',
      productId: 'BB-ACH-018',
      productName: 'Boro Achar (Sweet & Sour Crush)',
      productThumb: 'All images/807386813_1076326418342010_1423256031986250910_n.jpg',
      price: 380,
      regularPrice: 420,
      weight: '400 gm'
    },
    {
      id: 'reel_6',
      title: 'Essential Companion — Garlic & Black Seed Achar',
      shortTitle: 'Garlic & Black Seed',
      videoSrc: 'videos/reel_6.mp4',
      poster: 'videos/poster_6.jpg',
      productId: 'BB-ACH-025',
      productName: 'Garlic & Black Seed Premium Achar',
      productThumb: 'All images/778279709_1047741551200497_8987538511452370084_n.jpg',
      price: 380,
      regularPrice: 450,
      weight: '400 gm'
    },
    {
      id: 'reel_7',
      title: 'Authentic Village Taste — Tamarind & Boro Mix Achar',
      shortTitle: 'Tamarind & Boro Mix',
      videoSrc: 'videos/reel_7.mp4',
      poster: 'videos/poster_7.jpg',
      productId: 'BB-ACH-008',
      productName: 'Tamarind & Boro Mix Achar',
      productThumb: 'All images/772204431_1039984018642917_4214701317489319558_n.jpg',
      price: 190,
      regularPrice: 220,
      weight: '200 gm'
    },
    {
      id: 'reel_8',
      title: 'Commercial Achar vs Pure Bornobazar — 6-Pack Combo Gift Box',
      shortTitle: '6-Pack Gift Box',
      videoSrc: 'videos/reel_8.mp4',
      poster: 'videos/poster_8.jpg',
      productId: 'BB-COM-001',
      productName: '6-Pack Heritage Achar Gift Box',
      productThumb: 'All images/724500930_995387276435925_6032589404291467890_n.jpg',
      price: 1190,
      regularPrice: 1260,
      weight: '1.2 kg'
    }
  ];

  window.BornobazarMinimal = {
    products: window.BORNOBAZAR_PRODUCTS || [],
    reels: BORNOBAZAR_REELS,
    currentReelIndex: 0,
    cart: [],
    deliveryArea: 'inside_dhaka',

    init: function () {
      this.loadCart();
      this.bindGlobalEvents();
      this.updateCartBadges();
      this.initReelsModalEvents();

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

      const selWeight = weight || (prod.weights && prod.weights[0]) || 'Standard';
      const price = (prod.weight_pricing && prod.weight_pricing[selWeight])
        ? prod.weight_pricing[selWeight]
        : prod.sale_price;

      const displayName = prod.name_en || prod.name_bn;
      const existing = this.cart.find(item => item.id === prod.id && item.weight === selWeight);
      if (existing) {
        existing.qty += qty;
      } else {
        this.cart.push({
          id: prod.id,
          name_bn: displayName,
          name_en: prod.name_en || displayName,
          image: prod.primary_image || 'Logo/bornobazar-logo.png',
          weight: selWeight,
          price: price,
          qty: qty
        });
      }

      this.saveCart();
      this.showToast(`"${displayName}" added to your bag!`);
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
          freeShipText.innerHTML = '🎉 Congratulations! You unlocked <strong>FREE NATIONWIDE DELIVERY</strong>!';
        } else {
          const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
          freeShipFill.style.width = pct + '%';
          freeShipText.innerHTML = `Add only <strong>${fmtPrice(remaining)}</strong> more to unlock <strong>FREE DELIVERY</strong>!`;
        }
      }

      if (this.cart.length === 0) {
        bodyEl.innerHTML = `
          <div style="text-align: center; padding: 48px 0;">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="margin: 0 auto 12px; color: var(--bb-text-light);">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <div style="font-family: var(--font-display); font-size: 18px; text-transform: uppercase; color: var(--bb-forest); margin-bottom: 6px;">Your Shopping Bag is Empty</div>
            <p style="font-size: 14px; color: var(--bb-text-muted); font-family: var(--font-body); margin-bottom: 20px;">Explore our small-batch handcrafted Achar and pure artisanal pantry items.</p>
            <a href="shop.html" class="btn-pill btn-forest btn-sm" onclick="BornobazarMinimal.closeCart()">Browse Achar &rarr;</a>
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
            <button type="button" onclick="BornobazarMinimal.removeFromCart(${idx})" style="font-size: 11px; color: #DC2626; text-decoration: underline; margin-top: 6px; cursor: pointer;">Remove</button>
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
      const weights = p.weights || ['Standard'];
      const defaultWeight = weights[0];
      const price = (p.weight_pricing && p.weight_pricing[defaultWeight]) ? p.weight_pricing[defaultWeight] : p.sale_price;
      const regPrice = (p.regular_price && p.regular_price > price) ? p.regular_price : null;
      const badge = p.category === 'স্পেশাল কম্বো' ? 'Combo Set' : (p.on_sale ? 'Small Batch' : 'Pure Mustard Oil');
      const displayName = p.name_en || p.name_bn;
      const displayCategory = p.category === 'স্পেশাল কম্বো' ? 'Special Combo' : (p.category === 'শুটকি ভর্তা' ? 'Dry Fish Bhorta' : 'Artisanal Achar');

      return `
        <div class="bb-product-card" data-id="${p.id}" data-selected-weight="${defaultWeight}">
          <div class="bb-card-media">
            <span class="bb-card-badge">${badge}</span>
            <a href="product.html?id=${p.id}" style="display: contents;">
              <img src="${p.primary_image || 'Logo/bornobazar-logo.png'}" alt="${escHtml(displayName)}" loading="lazy">
            </a>
          </div>
          <div class="bb-card-content">
            <div class="bb-card-cat">${escHtml(displayCategory)}</div>
            <a href="product.html?id=${p.id}">
              <h3 class="bb-card-title">${escHtml(displayName)}</h3>
            </a>
            <div class="bb-card-rating">
              <svg width="13" height="13" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span>4.9 (36 Reviews)</span>
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
              <button type="button" class="bb-card-quick-add" onclick="BornobazarMinimal.handleCardQuickAdd('${p.id}', this)" aria-label="Add ${escHtml(displayName)} to Bag">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                <span>Add</span>
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
      if (container) {
        const featured = this.products.slice(0, 8);
        container.innerHTML = featured.map(p => this.renderProductCardHtml(p)).join('');

        // Filter tabs on homepage
        const tabs = document.querySelectorAll('.bb-filter-pill');
        tabs.forEach(tab => {
          tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.getAttribute('data-cat');
            let filtered;
            if (cat === 'all') {
              filtered = this.products.slice(0, 8);
            } else if (cat === 'আচার' || cat === 'Achar') {
              filtered = this.products.filter(p => p.category === 'আচার' || p.category === 'Achar').slice(0, 8);
            } else if (cat === 'স্পেশাল কম্বো' || cat === 'Special Combo') {
              filtered = this.products.filter(p => p.category === 'স্পেশাল কম্বো' || p.category === 'Special Combo').slice(0, 8);
            } else if (cat === 'শুটকি ভর্তা' || cat === 'Dry Fish Bhorta') {
              filtered = this.products.filter(p => p.category === 'শুটকি ভর্তা' || p.category === 'Dry Fish Bhorta').slice(0, 8);
            } else if (cat === 'ঘি ও তেল' || cat === 'Ghee & Oil') {
              filtered = this.products.filter(p => p.category === 'ঘি ও তেল' || p.category === 'Ghee & Oil').slice(0, 8);
            } else {
              filtered = this.products.filter(p => p.category === cat).slice(0, 8);
            }
            container.innerHTML = filtered.map(p => this.renderProductCardHtml(p)).join('');
          });
        });
      }

      // Render Video Carousel
      if (document.getElementById('home-reels-section')) {
        this.renderReelsSection('home-reels-section');
      }

      // Initialize Desktop Background Slider
      this.initHeroSlider();
    },

    initHeroSlider: function () {
      const slides = document.querySelectorAll('.bb-hero-slide');
      const dots = document.querySelectorAll('.bb-hero-dot');
      const slider = document.getElementById('hero-slider');
      if (!slides.length) return;

      let currentIndex = 0;
      let intervalId = null;

      const goToSlide = (idx) => {
        if (idx < 0) idx = slides.length - 1;
        if (idx >= slides.length) idx = 0;
        currentIndex = idx;

        slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
        dots.forEach((d, i) => {
          d.classList.toggle('active', i === currentIndex);
          d.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
        });
      };

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
          goToSlide(idx);
          restartTimer();
        });
      });

      const startTimer = () => {
        if (slides.length <= 1) return;
        intervalId = setInterval(() => goToSlide(currentIndex + 1), 5000);
      };

      const stopTimer = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      };

      const restartTimer = () => {
        stopTimer();
        startTimer();
      };

      if (slider) {
        slider.addEventListener('mouseenter', stopTimer);
        slider.addEventListener('mouseleave', startTimer);
      }

      startTimer();
    },

    /* ==========================================================================
       SHOPPABLE VIDEO REELS & MODAL
       ========================================================================== */
    renderReelsSection: function (containerId) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const carouselId = 'carousel-' + containerId;

      const cardsHtml = this.reels.map((r, idx) => `
        <div class="bb-reel-card" data-reel-idx="${idx}" onclick="if(!event.target.closest('.bb-reel-product-card')) BornobazarMinimal.openReelModal(${idx})">
          <img class="bb-reel-poster" src="${r.poster}" alt="${escHtml(r.title)}" loading="lazy">
          <div class="bb-reel-overlay"></div>
          <div class="bb-reel-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span>VIDEO REVIEW</span>
          </div>
          <button type="button" class="bb-reel-play-btn" aria-label="Play video" onclick="BornobazarMinimal.openReelModal(${idx}); event.stopPropagation();">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="8 5 19 12 8 19 8 5"/>
            </svg>
          </button>
          <div class="bb-reel-product-card" onclick="event.stopPropagation()">
            <div class="bb-reel-product-top">
              <img class="bb-reel-product-thumb" src="${r.productThumb}" alt="${escHtml(r.productName)}" loading="lazy">
              <div class="bb-reel-product-details">
                <div class="bb-reel-product-title" title="${escHtml(r.productName)}">${escHtml(r.shortTitle || r.productName)}</div>
                <div class="bb-reel-product-price">${fmtPrice(r.price)} ${r.regularPrice > r.price ? `<s style="font-size: 11px; color: var(--bb-text-light);">${fmtPrice(r.regularPrice)}</s>` : ''}</div>
              </div>
              <a href="product.html?id=${r.productId}" class="bb-reel-ext-btn" title="View Details">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
              </a>
            </div>
            <div class="bb-reel-btn-row">
              <button type="button" class="bb-reel-add-cart-btn" onclick="BornobazarMinimal.addToCart('${r.productId}', '${r.weight}', 1)">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div class="bb-container">
          <div class="bb-reels-header">
            <div>
              <span class="bb-reels-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>
                WATCH &amp; SHOP &bull; REAL ACHAR IN MOTION
              </span>
              <h2 class="h2 bb-reels-title">WATCH RAW TEXTURES &amp; VERIFIED CUSTOMER REVIEWS</h2>
              <p class="bb-reels-subtitle">See the golden mustard oil sizzle and hear the real crunch before ordering</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="bb-reels-nav-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: -270, behavior: 'smooth'})" aria-label="Previous">&larr;</button>
              <button type="button" class="bb-reels-nav-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: 270, behavior: 'smooth'})" aria-label="Next">&rarr;</button>
            </div>
          </div>
          <div class="bb-reels-carousel" id="${carouselId}">
            ${cardsHtml}
          </div>
        </div>
      `;
    },

    openReelModal: function (idx) {
      if (idx < 0) idx = this.reels.length - 1;
      if (idx >= this.reels.length) idx = 0;
      this.currentReelIndex = idx;
      const r = this.reels[idx];
      if (!r) return;

      const modal = document.getElementById('reel-modal');
      const iframeWrap = document.getElementById('reel-iframe-container');
      const drawer = document.getElementById('reel-modal-drawer');
      if (!modal || !iframeWrap) return;

      iframeWrap.innerHTML = `
        <video id="reel-native-video" src="${r.videoSrc}" poster="${r.poster}" controls autoplay loop playsinline preload="auto" style="width:100%; height:100%; object-fit:cover; display:block; background:#000;">
          <source src="${r.videoSrc}" type="video/mp4">
        </video>
      `;

      const videoEl = document.getElementById('reel-native-video');
      if (videoEl) {
        const p = videoEl.play();
        if (p !== undefined) {
          p.catch(() => {
            videoEl.muted = true;
            videoEl.play();
          });
        }
      }

      if (drawer) {
        drawer.innerHTML = `
          <div class="bb-reel-modal-p-info">
            <img src="${r.productThumb}" alt="${escHtml(r.productName)}" class="bb-reel-modal-p-img">
            <div>
              <div style="font-family: var(--font-display); font-weight: 700; font-size: 15px; color: var(--bb-forest); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">
                ${escHtml(r.productName)}
              </div>
              <div style="font-family: var(--font-display); font-size: 15px; color: var(--bb-forest);">
                ${fmtPrice(r.price)}
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn-pill btn-lime btn-sm" onclick="BornobazarMinimal.addToCart('${r.productId}', '${r.weight}', 1)">
              Order Now
            </button>
          </div>
        `;
      }

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    },

    closeReelModal: function () {
      const modal = document.getElementById('reel-modal');
      const iframeWrap = document.getElementById('reel-iframe-container');
      const videoEl = document.getElementById('reel-native-video');
      if (videoEl) {
        try {
          videoEl.pause();
          videoEl.removeAttribute('src');
          videoEl.load();
        } catch (e) {}
      }
      if (modal) modal.classList.remove('open');
      if (iframeWrap) iframeWrap.innerHTML = '';
      document.body.style.overflow = '';
    },

    initReelsModalEvents: function () {
      const modal = document.getElementById('reel-modal');
      if (!modal) return;
      const closeBtn = document.getElementById('reel-modal-close');
      const prevBtn = document.getElementById('reel-modal-prev');
      const nextBtn = document.getElementById('reel-modal-next');

      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeReelModal();
        });
      }
      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openReelModal(this.currentReelIndex - 1);
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openReelModal(this.currentReelIndex + 1);
        });
      }
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeReelModal();
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
          if (activeCat === 'Achar' || activeCat === 'আচার') {
            list = list.filter(p => p.category === 'আচার' || p.category === 'Achar');
          } else if (activeCat === 'Special Combo' || activeCat === 'স্পেশাল কম্বো') {
            list = list.filter(p => p.category === 'স্পেশাল কম্বো' || p.category === 'Special Combo');
          } else if (activeCat === 'Dry Fish Bhorta' || activeCat === 'শুটকি ভর্তা') {
            list = list.filter(p => p.category === 'শুটকি ভর্তা' || p.category === 'Dry Fish Bhorta');
          } else if (activeCat === 'Ghee & Oil' || activeCat === 'ঘি ও তেল') {
            list = list.filter(p => p.category === 'ঘি ও তেল' || p.category === 'Ghee & Oil');
          } else {
            list = list.filter(p => p.category === activeCat);
          }
        }

        if (query) {
          list = list.filter(p => 
            (p.name_en && p.name_en.toLowerCase().includes(query)) ||
            p.name_bn.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
          );
        }

        if (countEl) countEl.textContent = `${list.length} Products`;

        if (list.length === 0) {
          container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
              <h3 style="font-size: 20px; margin-bottom: 8px;">No Products Found</h3>
              <p style="color: var(--bb-text-muted); font-family: var(--font-body);">Try searching with another keyword or explore our complete catalog.</p>
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

      const displayName = p.name_en || p.name_bn;
      document.title = displayName + ' — Bornobazar';

      let selVariantIndex = 0;
      let qty = 1;
      let bundleMode = 'single'; // single, duo, trio

      const variants = (p.weights || ['Standard']).map(w => {
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
            <img src="${src}" alt="${escHtml(displayName)} ${i+1}">
          </button>
        `).join('');
      }

      // Populate Meta Info
      const titleEl = document.getElementById('pdp-title');
      const catEl = document.getElementById('pdp-cat');
      const descEl = document.getElementById('pdp-desc');
      const displayCategory = p.category === 'স্পেশাল কম্বো' ? 'Special Combo' : (p.category === 'শুটকি ভর্তা' ? 'Dry Fish Bhorta' : 'Artisanal Achar');
      if (titleEl) titleEl.textContent = displayName;
      if (catEl) catEl.textContent = displayCategory;
      if (descEl) descEl.textContent = p.description;

      // Weight Selector Pills
      const weightChips = document.getElementById('pdp-weights');
      if (weightChips) {
        weightChips.innerHTML = variants.map((v, i) => `
          <button type="button" class="btn-pill btn-outline btn-sm ${i === 0 ? 'active' : ''}" 
            style="border-radius: var(--radius-pill); font-family: var(--font-body); ${i === 0 ? 'background: var(--bb-forest); color: #fff;' : ''}"
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
          discountNote = ' (10% Saver Discount)';
        } else if (bundleMode === 'trio') {
          finalPrice = Math.round(v.price * 3 * 0.85); // 15% off
          discountNote = ' (15% Mega Saver Discount)';
        }

        const priceEl = document.getElementById('pdp-price');
        if (priceEl) priceEl.textContent = fmtPrice(finalPrice) + discountNote;

        // Sync sticky bar
        const stickyImg = document.getElementById('sticky-bar-img');
        const stickyTitle = document.getElementById('sticky-bar-title');
        const stickyPrice = document.getElementById('sticky-bar-price');
        const stickyWeight = document.getElementById('sticky-bar-weight');

        if (stickyImg) stickyImg.src = p.primary_image || 'Logo/bornobazar-logo.png';
        if (stickyTitle) stickyTitle.textContent = displayName;
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
            <h1 class="h2" style="margin-bottom: 12px;">Your Shopping Bag is Empty</h1>
            <p style="color: var(--bb-text-muted); font-family: var(--font-body); margin-bottom: 24px;">Explore our authentic artisanal Achar &amp; handcrafted pantry items.</p>
            <a href="shop.html" class="btn-pill btn-forest">Shop Achar &rarr;</a>
          </div>
        `;
        return;
      }

      const subtotal = this.getCartSubtotal();

      container.innerHTML = `
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 36px;" class="bb-cart-page-grid">
          <div style="background: #FFFFFF; border: 1px solid var(--bb-border); border-radius: var(--radius-card); padding: 24px;">
            <h2 class="h3" style="margin-bottom: 20px; border-bottom: 1px solid var(--bb-border); padding-bottom: 14px;">Bag Items (${this.getCartItemCount()})</h2>
            <div style="display: flex; flex-direction: column; gap: 18px;">
              ${this.cart.map((item, idx) => `
                <div style="display: grid; grid-template-columns: 80px 1fr auto; gap: 16px; align-items: center; padding-bottom: 16px; border-bottom: 1px solid var(--bb-border);">
                  <img src="${item.image}" alt="${escHtml(item.name_bn)}" style="width: 80px; height: 80px; object-fit: contain; border-radius: var(--radius-md); background: var(--bb-surface-muted); border: 1px solid var(--bb-border);">
                  <div>
                    <a href="product.html?id=${item.id}" style="font-family: var(--font-display); font-weight: 700; font-size: 16px; color: var(--bb-forest);">${escHtml(item.name_bn)}</a>
                    <div style="font-size: 13px; color: var(--bb-text-muted); margin: 2px 0 8px;">${escHtml(item.weight)}</div>
                    <div class="bb-cart-qty-ctrl">
                      <button type="button" class="bb-cart-qty-btn" onclick="BornobazarMinimal.updateCartQty(${idx}, -1)">&minus;</button>
                      <span class="bb-cart-qty-num">${item.qty}</span>
                      <button type="button" class="bb-cart-qty-btn" onclick="BornobazarMinimal.updateCartQty(${idx}, 1)">&plus;</button>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-family: var(--font-display); font-size: 20px; color: var(--bb-forest);">${fmtPrice(item.price * item.qty)}</div>
                    <button type="button" onclick="BornobazarMinimal.removeFromCart(${idx})" style="font-size: 12px; color: #DC2626; text-decoration: underline; margin-top: 8px; cursor: pointer;">Remove</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div style="background: #FFFFFF; border: 1px solid var(--bb-border); border-radius: var(--radius-card); padding: 24px; height: fit-content;">
            <h3 class="h4" style="margin-bottom: 16px; border-bottom: 1px solid var(--bb-border); padding-bottom: 12px;">Order Summary</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 15px;">
              <span style="color: var(--bb-text-muted);">Subtotal</span>
              <span style="font-family: var(--font-display); font-size: 18px; color: var(--bb-forest);">${fmtPrice(subtotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 18px; font-size: 15px;">
              <span style="color: var(--bb-text-muted);">Delivery Fee</span>
              <span style="color: var(--bb-text-muted);">Calculated at Checkout</span>
            </div>
            <a href="checkout.html" class="btn-pill btn-lime btn-full" style="text-align: center; margin-bottom: 12px;">Proceed to Checkout &rarr;</a>
            <a href="shop.html" class="btn-pill btn-outline btn-full" style="text-align: center;">Continue Shopping</a>
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
        alert('Your shopping bag is empty! Please visit our shop to select items.');
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
              <div style="font-family: var(--font-display); font-weight: 700; color: var(--bb-forest);">${escHtml(item.name_bn)}</div>
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
            date: new Date().toLocaleDateString('en-US'),
            customerName: document.getElementById('cust_name')?.value || 'Customer',
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
            <h1 class="h2" style="margin-bottom: 8px;">Order Confirmed!</h1>
            <p style="font-family: var(--font-body); color: var(--bb-text-muted); font-size: 16px; margin-bottom: 24px;">Thank you! We have received your order. Our customer care representative will contact you shortly to confirm delivery details.</p>
            <div style="background: var(--bb-surface-muted); padding: 16px; border-radius: var(--radius-md); font-family: var(--font-display); font-size: 16px; margin-bottom: 28px;">
              Order Reference: <span style="color: var(--bb-forest);">${id}</span>
            </div>
            <a href="index.html" class="btn-pill btn-forest">Back to Home &rarr;</a>
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
