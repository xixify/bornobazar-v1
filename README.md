# BORNOBAZAR (বর্ণবাজার) — Minimalist Luxury E-Commerce

> **A high-end, artisan small-batch brand experience inspired by the bold, minimalist design aesthetics of [Fishtown Pickle Project](https://www.fishtownpickles.com/).**

---

## 🥒 Design Philosophy & Aesthetic Rationale

This project reimagines Bangladesh’s heritage pickle and artisanal food brand, **Bornobazar (বর্ণবাজার)**, as a contemporary high-end luxury artisan house:

1. **Unapologetically Minimalist Typography**:
   - Condensed display headings via **Fjalla One** for that striking, punchy editorial look.
   - Elegant, clean body copy via **Plus Jakarta Sans** and **Hind Siliguri** (Bengali).
2. **Artisan Color System**:
   - **Deep Forest Spruce Green (`#0D2B1D`)**: Grounded, organic, and ultra-premium.
   - **Electric Lime Brine Accent (`#C6EB2D`)**: Vibrant high-contrast pop inspired by pickle brine and zesty lime.
   - **Off-White Canvas (`#FCFCFC`) & Hairline Borders (`#E5E7DF`)**: Maximized breathing room, zero cheesy dropshadows or heavy gradients.
3. **Pill-Shaped Geometry**:
   - All buttons, category filters, weight tags, and notification toasts follow strict pill geometry (`border-radius: 999px`) for a tactile, modern feel.
4. **Editorial Bento Grid**:
   - Structured visual storytelling highlighting **100% Cold-Pressed Mustard Oil**, **Sun-Dried Curing**, and **BSTI BDS:CAC-260** accreditation.

---

## ⚡ Core Features

- **Slide-In Cart Drawer**: Smooth sliding drawer with real-time **Free Shipping Progress Bar** (unlocks at ৳৯৯৯).
- **Direct Card Variant Switching**: Customers can switch between 200g, 400g, or combo pack variants right on the product card without reloading.
- **Product Detail Page (PDP)**:
  - High-resolution glass jar showcase with interactive thumbnails.
  - **Bundle & Save Multi-Pack Tiers**: Single Jar, 2 Jars (10% saver), 3 Jars (15% mega saver).
  - Ingredient, curing method, and shelf-life accordions.
  - **Mobile Sticky Add-to-Cart Bar**: Dual CTAs (`কার্ট` + `অর্ডার করুন`) pinned to the bottom of mobile screens with zero scroll interference.
- **Instant Search & Category Filtering**: Lightning-fast client-side product catalog filtering.
- **1-Page Checkout for Bangladesh**:
  - Streamlined delivery information form.
  - Dynamic delivery zone fee calculation (Dhaka ৳৭০ vs Outside Dhaka ৳১৩০).
  - Cash on Delivery (COD) and mobile financial services (bKash/Nagad) support.
- **Local Storage Persistence**: Real-time cart state synchronization across all browser tabs.

---

## 📁 Project Structure

```
bornobazar-minimal/
├── index.html            # Minimalist luxury homepage with editorial bento & pillars
├── shop.html             # Catalog with live search & category filter pills
├── product.html          # PDP with multi-tier bundle picker & mobile sticky dual-CTA
├── cart.html             # Dedicated cart overview page
├── checkout.html         # 1-page checkout for Bangladesh with COD
├── order-success.html    # Order confirmation and tracking receipt
├── about.html            # Story of Meherpur curing heritage & mustard oil process
├── faq.html              # Clean answers on storage, shelf life, and delivery
├── contact.html          # Customer care, WhatsApp direct chat, and wholesale inquiry
├── css/
│   └── minimal.css       # Complete vanilla CSS design system & responsive layout
├── js/
│   └── minimal.js        # Lightweight reactive state engine (Zero dependencies)
├── data/
│   ├── products.json     # Structured JSON catalog
│   └── products-data.js  # Global catalog data bundle
├── Logo/                 # Official brand logo & wordmark assets
└── All images/           # Authentic jar photography and product assets
```

---

## 🚀 Running Locally

No npm or external runtime dependencies required. You can serve the static site using any local HTTP server:

### Python 3:
```bash
python -m http.server 3000
```
Then open: [http://localhost:3000](http://localhost:3000)

### Node.js / npx serve:
```bash
npx serve .
```

---

## 🌐 Live Deployment

Published on GitHub Pages:
**[https://xixify.github.io/bornobazar-minimal/](https://xixify.github.io/bornobazar-minimal/)**

---

&copy; 2026 BORNOBAZAR (বর্ণবাজার). All Rights Reserved.  
Factory: Dariyapur, Mujibnagar, Meherpur, Bangladesh.  
BSTI License: BDS:CAC-260.
