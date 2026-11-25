// Client-side 2026 Estate Product Catalog & Price Guide Generator for Malenadu Roast Co.

export const generateDigitalCatalog = () => {
  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
  const logoUrl = `${origin}/assets/images/logo_final.webp`;

  const catalogWindow = window.open('', '_blank', 'width=980,height=900,scrollbars=yes');
  if (!catalogWindow) {
    alert('Pop-up was blocked. Please allow pop-ups for this website to view and download the catalog.');
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Malenadu Roast Co. - 2026 Estate Product Catalog & Price List</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f8fafc;
          color: #1e293b;
          line-height: 1.6;
          padding: 2.5rem 1rem;
        }
        .catalog-container {
          max-width: 860px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .header-cover {
          background: #12100E;
          color: #FBF8F3;
          padding: 3.5rem 2.5rem;
          text-align: center;
          position: relative;
          border-bottom: 3px solid #C8935A;
        }
        .logo-img {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          border: 2px solid #C8935A;
          margin: 0 auto 1.25rem;
          display: block;
          object-fit: cover;
          background: #fff;
        }
        .brand-title {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 2.2rem;
          font-weight: 700;
          letter-spacing: 2px;
          color: #FBF8F3;
          margin-bottom: 0.4rem;
        }
        .brand-tagline {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 2.5px;
          color: #C8935A;
          font-weight: 600;
        }
        .catalog-subtitle {
          margin-top: 1.2rem;
          font-size: 0.95rem;
          color: #cbd5e1;
          max-width: 580px;
          margin-left: auto;
          margin-right: auto;
        }
        .badge-estate {
          display: inline-block;
          margin-top: 1.25rem;
          background: rgba(200, 147, 90, 0.18);
          border: 1px solid #C8935A;
          color: #E6C28B;
          padding: 0.4rem 1.2rem;
          border-radius: 20px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .content-body {
          padding: 2.5rem;
        }
        .section-title {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 1.4rem;
          color: #0f172a;
          margin: 2rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .product-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 1rem;
        }
        .product-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.4rem;
          background: #ffffff;
          transition: transform 0.2s;
        }
        .product-card:hover {
          border-color: #C8935A;
        }
        .prod-tag {
          font-size: 0.68rem;
          background: #fef3c7;
          color: #92400e;
          padding: 2px 8px;
          border-radius: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .prod-name {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 1.15rem;
          color: #0f172a;
          margin: 0.5rem 0 0.3rem;
          font-weight: 700;
        }
        .prod-blend {
          font-size: 0.8rem;
          color: #C8935A;
          font-weight: 600;
          margin-bottom: 0.6rem;
        }
        .prod-desc {
          font-size: 0.84rem;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        .pricing-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.82rem;
          background: #f8fafc;
          border-radius: 8px;
          overflow: hidden;
        }
        .pricing-table th, .pricing-table td {
          padding: 6px 10px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        .pricing-table th {
          background: #f1f5f9;
          color: #64748b;
          font-weight: 600;
        }
        .pricing-table td.price {
          font-weight: 700;
          color: #0f172a;
          text-align: right;
        }
        .brewing-guide {
          background: #FBF8F3;
          border: 1px solid #E6D2B5;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
        }
        .brewing-guide h4 {
          font-family: 'Cinzel', Georgia, serif;
          color: #3B2A1A;
          font-size: 1.05rem;
          margin-bottom: 0.8rem;
        }
        .step-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }
        .step-item {
          background: #fff;
          border: 1px solid #e8dfcf;
          border-radius: 8px;
          padding: 1rem;
        }
        .step-num {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 1.2rem;
          color: #C8935A;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .step-item p {
          font-size: 0.8rem;
          color: #554332;
          line-height: 1.45;
        }
        .order-banner {
          background: #12100E;
          color: #fff;
          border-radius: 12px;
          padding: 1.8rem;
          text-align: center;
          margin-top: 2rem;
        }
        .order-banner h3 {
          font-family: 'Cinzel', Georgia, serif;
          font-size: 1.3rem;
          color: #FBF8F3;
          margin-bottom: 0.5rem;
        }
        .order-btn {
          display: inline-block;
          background: #25D366;
          color: #ffffff;
          padding: 0.8rem 1.8rem;
          border-radius: 30px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          margin-top: 1rem;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        }
        .action-bar {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          gap: 10px;
        }
        .action-btn {
          background: #12100E;
          color: #fff;
          border: 2px solid #C8935A;
          padding: 0.75rem 1.4rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .action-btn:hover {
          background: #C8935A;
          color: #12100E;
        }
        @media print {
          body { background: #fff; padding: 0; }
          .catalog-container { border: none; box-shadow: none; border-radius: 0; max-width: 100%; }
          .action-bar { display: none !important; }
        }
        @media (max-width: 650px) {
          .product-grid { grid-template-columns: 1fr; }
          .step-list { grid-template-columns: 1fr; }
          .content-body { padding: 1.5rem; }
        }
      </style>
    </head>
    <body>
      <!-- Action Bar -->
      <div class="action-bar">
        <button class="action-btn" onclick="window.print()">
          Print / Save as PDF
        </button>
      </div>

      <div class="catalog-container">
        <!-- Cover -->
        <div class="header-cover">
          <img src="${logoUrl}" alt="Malenadu Roast Co." class="logo-img" onerror="this.style.display='none'">
          <h1 class="brand-title">MALENADU ROAST CO.</h1>
          <p class="brand-tagline">Artisan Coffee & Estate Spices</p>
          <p class="catalog-subtitle">
            Grown under native forest shade at 3,500+ ft altitude in the pristine hills of Chikkamagaluru, Karnataka. Handpicked, small-batch slow-roasted to absolute perfection.
          </p>
          <div class="badge-estate">Official 2026 Estate Catalog & Price Guide</div>
        </div>

        <div class="content-body">
          <!-- Section 1: Coffee -->
          <div class="section-title">
            <span>Estate Coffee Collection</span>
            <span style="font-size: 0.75rem; font-family: Inter; color: #64748b; font-weight: 500;">Fresh Weekly Small-Batch Roasts</span>
          </div>

          <div class="product-grid">
            <!-- Product 1 -->
            <div class="product-card">
              <span class="prod-tag">Signature 70:30</span>
              <h3 class="prod-name">Malenadu Estate Reserve</h3>
              <p class="prod-blend">70% Single-Estate Coffee &bull; 30% Roasted Chicory &bull; Medium-Dark</p>
              <p class="prod-desc">
                The quintessential South Indian filter coffee. Syrupy dark chocolate decoction, caramel richness, and golden crema that never gets diluted when mixed with boiled milk.
              </p>
              <table class="pricing-table">
                <tr><th>Pack Size</th><th>Price (Incl. 5% GST)</th></tr>
                <tr><td>500 Grams (Popular)</td><td class="price">&#8377;469</td></tr>
                <tr><td>1 Kilogram (Value)</td><td class="price">&#8377;874</td></tr>
              </table>
            </div>

            <!-- Product 2 -->
            <div class="product-card">
              <span class="prod-tag" style="background:#eff6ff; color:#1e40af;">Highland 80:20</span>
              <h3 class="prod-name">Highland Signature Reserve</h3>
              <p class="prod-blend">80% High-Altitude Coffee &bull; 20% Roasted Chicory &bull; Medium Roast</p>
              <p class="prod-desc">
                The classic 80:20 golden ratio for coffee lovers seeking bright mountain aromatics, milk chocolate, and wild honey undertones with a refined, smooth finish.
              </p>
              <table class="pricing-table">
                <tr><th>Pack Size</th><th>Price (Incl. 5% GST)</th></tr>
                <tr><td>500 Grams</td><td class="price">&#8377;529</td></tr>
                <tr><td>1 Kilogram</td><td class="price">&#8377;984</td></tr>
              </table>
            </div>

            <!-- Product 3 -->
            <div class="product-card">
              <span class="prod-tag" style="background:#fef3c7; color:#92400e;">Heritage 85:15</span>
              <h3 class="prod-name">Imperial Heritage Reserve</h3>
              <p class="prod-blend">85% Premium Estate Coffee &bull; 15% Chicory &bull; Dark Roast</p>
              <p class="prod-desc">
                An heirloom reserve for purists who love coffee-dominated character. Heavy decoction, toasted almond, bittersweet cocoa, and just 15% chicory for traditional body.
              </p>
              <table class="pricing-table">
                <tr><th>Pack Size</th><th>Price (Incl. 5% GST)</th></tr>
                <tr><td>500 Grams</td><td class="price">&#8377;579</td></tr>
                <tr><td>1 Kilogram</td><td class="price">&#8377;1,084</td></tr>
              </table>
            </div>

            <!-- Product 4 -->
            <div class="product-card">
              <span class="prod-tag" style="background:#fef2f2; color:#991b1b;">Tellicherry Bold (TGSEB)</span>
              <h3 class="prod-name">Malenadu Pepper Reserve</h3>
              <p class="prod-blend">100% Unpolished &bull; Estate Sun-Dried &bull; High Piperine</p>
              <p class="prod-desc">
                Hand-harvested black peppercorns grown on high-canopy shade trees. 4.75mm+ bold berries with zero mineral oils, zero paraffin polish, and intense natural heat.
              </p>
              <table class="pricing-table">
                <tr><th>Pack Size</th><th>Price (Incl. 5% GST)</th></tr>
                <tr><td>250 Grams</td><td class="price">&#8377;319</td></tr>
                <tr><td>500 Grams</td><td class="price">&#8377;649</td></tr>
                <tr><td>1 Kilogram</td><td class="price">&#8377;1,229</td></tr>
              </table>
            </div>
          </div>

          <!-- Section 2: Combos & Wholesale -->
          <div class="section-title">
            <span>Heritage Reserve Combos</span>
            <span style="font-size: 0.75rem; font-family: Inter; color: #64748b; font-weight: 500;">Free Shipping Across India</span>
          </div>

          <div style="background: #ffffff; border: 1.5px solid #C8935A; border-radius: 12px; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="prod-tag">Best Seller Gift Pack</span>
              <h3 class="prod-name" style="margin-top: 4px;">Imperial Heritage Combo (Coffee + Pepper)</h3>
              <p style="font-size: 0.84rem; color: #64748b;">Includes 500g Imperial Heritage Reserve Coffee + 500g Malenadu Pepper Reserve.</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.4rem; font-weight: 800; color: #C8935A;">&#8377;899 <span style="font-size: 0.85rem; color: #94a3b8; text-decoration: line-through;">&#8377;1,228</span></div>
              <div style="font-size: 0.74rem; color: #16a34a; font-weight: 700;">Save 27% &bull; Estate Fresh</div>
            </div>
          </div>

          <!-- South Indian Filter Coffee Decoction Guide -->
          <div class="brewing-guide">
            <h4>Traditional Filter Coffee Decoction Master Guide</h4>
            <p style="font-size: 0.85rem; color: #554332;">Follow this simple 3-step ritual for the thickest, aromatic traditional South Indian decoction:</p>
            
            <div class="step-list">
              <div class="step-item">
                <div class="step-num">Step 01</div>
                <strong>Filter Prep</strong>
                <p>Add 2.5 heaped tablespoons of Malenadu Imperial Heritage ground coffee into the top compartment. Lightly tamp with the pressing disc.</p>
              </div>
              <div class="step-item">
                <div class="step-num">Step 02</div>
                <strong>Slow Extraction</strong>
                <p>Pour 100ml freshly boiled water (92&deg;C) over the disc. Close lid and allow slow extraction for 10&ndash;12 minutes for thick first decoction.</p>
              </div>
              <div class="step-item">
                <div class="step-num">Step 03</div>
                <strong>The Pour & Froth</strong>
                <p>Pour 30ml decoction into a dabarah/tumbler. Add 80ml piping hot full-cream milk and sugar. Froth from a height to release rich aroma.</p>
              </div>
            </div>
          </div>

          <!-- Wholesale & Corporate Supply -->
          <div style="border-top: 1px solid #e2e8f0; padding-top: 1.5rem; margin-top: 1.5rem; font-size: 0.82rem; color: #64748b;">
            <p><strong>Wholesale & Corporate Inquiries:</strong> We supply cafes, boutique hotels, corporate pantries, and wedding gifting with customized custom grinds and branded packaging across India. Volume pricing starts at 10kg orders.</p>
            <p style="margin-top: 4px;"><strong>FSSAI License No:</strong> 21226177001500 &bull; <strong>Estate Location:</strong> Chikkamagaluru, Karnataka 577101</p>
          </div>

          <!-- Direct WhatsApp Order CTA -->
          <div class="order-banner">
            <h3>Ready to order fresh from our estate?</h3>
            <p style="font-size: 0.86rem; color: #cbd5e1; max-width: 500px; margin: 0 auto;">
              Message us directly on WhatsApp to place an order, request custom bean grinds (Filter, Moka, French Press, or Whole Beans), or inquire about bulk dispatch.
            </p>
            <a href="https://wa.me/918217623335?text=Hi%20Malenadu%20Roast%20Co.%2C%20I%20viewed%20your%202026%20Estate%20Catalog%20and%20would%20like%20to%20order." target="_blank" class="order-btn">
              💬 Order via WhatsApp: +91 8217623335
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  catalogWindow.document.open();
  catalogWindow.document.write(html);
  catalogWindow.document.close();
};

