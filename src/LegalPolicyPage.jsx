import React, { useEffect } from 'react';
import { 
  ShieldCheck, ArrowLeft, FileText, RefreshCw, Truck, 
  Lock, Mail, Phone, MapPin, CheckCircle, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LegalPolicyPage = ({ type = 'privacy', onBack, onSelectPolicy }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [type]);

  const policies = [
    { id: 'privacy-policy', label: 'Privacy Policy', icon: <Lock size={16} /> },
    { id: 'refund-policy', label: 'Refund & Returns', icon: <RefreshCw size={16} /> },
    { id: 'terms-conditions', label: 'Terms & Conditions', icon: <FileText size={16} /> },
    { id: 'shipping-policy', label: 'Shipping & Delivery', icon: <Truck size={16} /> },
  ];

  const renderContent = () => {
    switch (type) {
      case 'refund-policy':
      case 'refund':
        return (
          <div className="policy-body">
            <div className="policy-badge">
              <RefreshCw size={16} color="#C8935A" />
              <span>Customer Assurance</span>
            </div>
            <h1>Cancellation, Return & Refund Policy</h1>
            <p className="policy-updated">Last Updated: November 2024 • Valid for Malenadu Roast Co.</p>

            <div className="policy-notice-box">
              <ShieldCheck size={22} color="#C8935A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>FSSAI Certified Consumable Goods Notice</strong>
                <p>
                  As our products consist of freshly roasted specialty coffee beans, grounds, and whole spices (FSSAI Lic. No. 21226177001500), perishable and food-grade hygiene standards strictly apply to all orders.
                </p>
              </div>
            </div>

            <section>
              <h2>1. Order Cancellation Policy</h2>
              <p>
                We roast and grind our coffee fresh to order. You may cancel your order free of charge at any time <strong>prior to dispatch and roasting</strong> (typically within 2 to 4 hours of placing your order).
              </p>
              <ul>
                <li>To cancel an order, immediately contact our team via WhatsApp at <strong>+91 8217623335</strong> or email <strong>malenaduroast@gmail.com</strong> with your Order ID.</li>
                <li>Once an order has been roasted, ground, packed, or handed over to our courier partner, it enters the fulfillment cycle and cannot be cancelled.</li>
                <li>Upon verified cancellation within the 24-hour window, 90% of the transaction amount will be refunded to your original payment method.</li>
              </ul>
            </section>

            <section>
              <h2>2. Return & Replacement Eligibility</h2>
              <p>
                Due to food safety regulations, we do not accept returns on opened coffee packs or spices. However, your complete satisfaction is our priority. We happily offer a <strong>full replacement or refund</strong> under the following circumstances:
              </p>
              <ul>
                <li><strong>Damaged or Tampered Package:</strong> The shipping container or product pouch arrived torn, broken, or unsealed upon delivery.</li>
                <li><strong>Wrong Item Delivered:</strong> You received a roast level, grind size, or product variant different from what was ordered.</li>
                <li><strong>Missing Items:</strong> An item from your order was omitted from the parcel.</li>
                <li><strong>Defective Product:</strong> The product exhibits quality or packaging defects on initial inspection.</li>
              </ul>
            </section>

            <section>
              <h2>3. How to Request a Replacement or Refund</h2>
              <p>
                To initiate a claim, please notify us within <strong>48 hours</strong> of package delivery by following these simple steps:
              </p>
              <ol>
                <li>Take a clear photograph or brief unboxing video showing the damaged package, label, and product condition.</li>
                <li>Send the photos along with your <strong>Order Number</strong> and contact details to <strong>malenaduroast@gmail.com</strong> or WhatsApp <strong>+91 8217623335</strong>.</li>
                <li>Our quality team will review your request and provide a resolution within <strong>24 business hours</strong>.</li>
              </ol>
            </section>

            <section>
              <h2>4. Refund Processing & Timelines</h2>
              <p>
                Once your refund request is verified and approved:
              </p>
              <ul>
                <li><strong>Prepaid Orders (UPI / Debit / Credit Cards / NetBanking):</strong> The refund will be initiated to your original payment source. Depending on your bank's clearance cycle, funds will credit to your account within <strong>5 to 7 business days</strong>.</li>
                <li><strong>Instant UPI Refunds:</strong> Most UPI-linked refunds reflect in your account within 24 to 48 hours of authorization.</li>
                <li>You will receive an automated confirmation email with the transaction reference ID once the refund has been processed.</li>
              </ul>
            </section>

            <section>
              <h2>5. Contact Our Support Team</h2>
              <p>If you have any questions regarding returns or refunds, please reach out to us directly:</p>
              <div className="policy-contact-cards">
                <div className="contact-mini-card">
                  <Mail size={18} color="#C8935A" />
                  <div>
                    <span className="mini-card-label">Email Support</span>
                    <a href="mailto:malenaduroast@gmail.com">malenaduroast@gmail.com</a>
                  </div>
                </div>
                <div className="contact-mini-card">
                  <Phone size={18} color="#C8935A" />
                  <div>
                    <span className="mini-card-label">WhatsApp / Phone</span>
                    <a href="tel:+918217623335">+91 8217623335</a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case 'terms-conditions':
      case 'terms':
        return (
          <div className="policy-body">
            <div className="policy-badge">
              <FileText size={16} color="#C8935A" />
              <span>Legal Agreement</span>
            </div>
            <h1>Terms and Conditions of Service</h1>
            <p className="policy-updated">Last Updated: November 2024 • Governing Website: malenaduroastco.works</p>

            <section>
              <h2>1. Agreement to Terms</h2>
              <p>
                Welcome to <strong>Malenadu Roast Co.</strong> ("we", "us", or "our"). By accessing or utilizing our website located at <strong>malenaduroastco.works</strong>, purchasing our artisanal coffee, spices, or related merchandise, you agree to be legally bound by these Terms and Conditions. If you do not agree to all provisions, you must discontinue the use of our services immediately.
              </p>
            </section>

            <section>
              <h2>2. Eligibility & Account Security</h2>
              <p>
                By using this site, you affirm that you are at least 18 years of age or possess legal parental/guardian consent in your jurisdiction. When creating an account or providing shipping information, you warrant that all information provided is accurate, current, and complete. You are solely responsible for maintaining the confidentiality of your login credentials.
              </p>
            </section>

            <section>
              <h2>3. Products, Freshness & Pricing</h2>
              <ul>
                <li><strong>Product Availability:</strong> All specialty coffee roasts and whole spices are sourced from high-altitude estates in Chikkamagaluru, Karnataka. We reserve the right to limit order quantities based on seasonal crop availability.</li>
                <li><strong>Pricing & Taxes:</strong> All product prices displayed on the website are quoted in Indian Rupees (INR). Applicable Goods and Services Tax (GST at 5% on coffee or applicable statutory rates) will be clearly indicated during checkout.</li>
                <li><strong>Price Modifications:</strong> Prices and promotional offers are subject to change without prior notice. Once an order is confirmed, the price agreed upon during checkout is final.</li>
              </ul>
            </section>

            <section>
              <h2>4. Orders & Payment Processing</h2>
              <p>
                We accept major secure Indian payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa, MasterCard, and NetBanking via RBI-authorized payment gateways (such as Razorpay).
              </p>
              <ul>
                <li>Your order placement constitutes an offer to purchase. A binding contract is established only once your payment is successfully verified and an official Order Confirmation with an invoice reference is issued.</li>
                <li>We reserve the right to cancel or refuse any order in the event of suspected fraudulent activity, pricing errors, or non-serviceable delivery locations.</li>
              </ul>
            </section>

            <section>
              <h2>5. Intellectual Property Rights</h2>
              <p>
                All brand marks, logos, website design, estate photography, custom copy, and visual assets associated with <strong>Malenadu Roast Co.</strong> are the exclusive property of Malenadu Roast Co. Unauthorized copying, distribution, or reproduction without our prior written consent is strictly prohibited.
              </p>
            </section>

            <section>
              <h2>6. Food Safety Compliance (FSSAI)</h2>
              <p>
                Our processing, handling, and storage facilities strictly adhere to the Food Safety and Standards Authority of India (FSSAI) guidelines.
              </p>
              <div className="fssai-highlight-pill">
                <ShieldCheck size={18} color="#C8935A" />
                <span>FSSAI License Registration Number: <strong>21226177001500</strong></span>
              </div>
            </section>

            <section>
              <h2>7. Limitation of Liability & Governing Law</h2>
              <p>
                In no event shall Malenadu Roast Co., its partners, or affiliates be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in <strong>Chikkamagaluru, Karnataka, India</strong>.
              </p>
            </section>
          </div>
        );

      case 'shipping-policy':
      case 'shipping':
        return (
          <div className="policy-body">
            <div className="policy-badge">
              <Truck size={16} color="#C8935A" />
              <span>Logistics & Fulfillment</span>
            </div>
            <h1>Shipping and Delivery Policy</h1>
            <p className="policy-updated">Last Updated: November 2024 • Pan-India Coverage</p>

            <div className="policy-notice-box">
              <Truck size={22} color="#C8935A" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Freshness-First Roasting & Dispatch Cycle</strong>
                <p>
                  To preserve the maximum volatile aromatics and crema potential of your coffee, we never ship stale pre-ground stock. Coffee is freshly roasted and packaged in degassed valve pouches within 24 to 48 hours of order confirmation.
                </p>
              </div>
            </div>

            <section>
              <h2>1. Delivery Coverage</h2>
              <p>
                We deliver to over <strong>26,000+ pin codes across India</strong> via leading logistics partners (including Delhivery, Blue Dart, DTDC, and Xpressbees). Serviceability can be verified during checkout.
              </p>
            </section>

            <section>
              <h2>2. Estimated Delivery Timelines</h2>
              <div className="shipping-timeline-table">
                <div className="timeline-row header">
                  <span>Destination Region</span>
                  <span>Estimated Transit Time</span>
                </div>
                <div className="timeline-row">
                  <span>Karnataka & Bengaluru Urban</span>
                  <span className="time-highlight">1 – 3 Business Days</span>
                </div>
                <div className="timeline-row">
                  <span>South India (Tamil Nadu, Kerala, AP, Telangana)</span>
                  <span className="time-highlight">2 – 4 Business Days</span>
                </div>
                <div className="timeline-row">
                  <span>Metro Cities (Mumbai, Delhi-NCR, Pune, Kolkata)</span>
                  <span className="time-highlight">3 – 5 Business Days</span>
                </div>
                <div className="timeline-row">
                  <span>Rest of India & Upcountry Locations</span>
                  <span className="time-highlight">4 – 7 Business Days</span>
                </div>
              </div>
              <p className="note-text">
                * Business days exclude Sundays, national holidays, and force majeure events. Heavy monsoon conditions in the Western Ghats may occasionally cause minor transit delays.
              </p>
            </section>

            <section>
              <h2>3. Shipping Charges & Free Shipping Tiers</h2>
              <ul>
                <li><strong>1kg+ Orders (100% FREE Delivery):</strong> All orders containing 1kg or more (including 1kg single packs, two 500g packs, or coffee combined with estate Tellicherry pepper crossing ₹799) qualify for <strong>100% FREE Express Shipping</strong> across India. All product prices on our website are inclusive of statutory 5% GST.</li>
                <li><strong>Orders Under 1kg (Pincode-Based Direct Courier Freight):</strong> Because fresh roastery shipments require dedicated aroma-lock packaging and rapid transit:
                  <ul>
                    <li><strong>Karnataka Pincodes (PIN starting with 56, 57, 58, 59):</strong> Flat nominal rate of <strong>₹44</strong> (local origin circle express courier).</li>
                    <li><strong>Other Indian States (National / Interstate Delivery):</strong> Flat rate of <strong>₹84</strong> (national express air/surface courier).</li>
                  </ul>
                </li>
                <li><strong>Smart Free Shipping Recommendation:</strong> Customers ordering a 500g pack are encouraged to add a second 500g pack or handpicked Tellicherry Black Pepper to immediately unlock <strong>100% FREE Delivery</strong> and save all shipping charges.</li>
                <li>There are no hidden packaging, payment handling, or convenience fees at checkout.</li>
              </ul>
            </section>

            <section>
              <h2>4. Real-Time Tracking & Shipment Notifications</h2>
              <p>
                The moment your package is dispatched from our roastery, you will receive an automatic dispatch notification containing:
              </p>
              <ul>
                <li>Your dedicated Air Waybill (AWB) Tracking Number.</li>
                <li>The assigned courier partner name (e.g., Delhivery, Blue Dart).</li>
                <li>A live clickable tracking link to monitor your order's journey in real time.</li>
              </ul>
            </section>

            <section>
              <h2>5. Non-Delivery or Incorrect Address</h2>
              <p>
                Please ensure complete and accurate shipping details (including flat/house number, landmark, and 6-digit PIN code) are entered. If a package is returned to origin (RTO) due to an incorrect address or customer unavailability after 3 attempted deliveries, our support team will contact you to arrange re-dispatch.
              </p>
            </section>
          </div>
        );

      case 'privacy-policy':
      case 'privacy':
      default:
        return (
          <div className="policy-body">
            <div className="policy-badge">
              <Lock size={16} color="#C8935A" />
              <span>Data Protection</span>
            </div>
            <h1>Privacy & Data Protection Policy</h1>
            <p className="policy-updated">Last Updated: November 2024 • Compliant with Indian IT Act, 2000 & SPDI Rules</p>

            <section>
              <h2>1. Introduction & Overview</h2>
              <p>
                At <strong>Malenadu Roast Co.</strong>, accessible from <strong>malenaduroastco.works</strong>, one of our fundamental priorities is the privacy and security of our visitors and customers. This Privacy Policy document details the categories of personal data collected, recorded, and utilized by us, alongside your legal privacy entitlements.
              </p>
            </section>

            <section>
              <h2>2. Information We Collect</h2>
              <p>We only collect personal information necessary to deliver our products and provide premium customer support:</p>
              <ul>
                <li><strong>Contact Information:</strong> Your full name, email address (for sending order confirmation and GST tax invoices), telephone/mobile number (for courier dispatch and delivery updates).</li>
                <li><strong>Shipping & Billing Address:</strong> Street address, city, state, and postal PIN code for accurate courier delivery.</li>
                <li><strong>Order History & Preferences:</strong> Products ordered, preferred roast level, grind size, and date of purchase.</li>
                <li><strong>Device & Browsing Data:</strong> Anonymized technical logs, IP address, browser type, and operating system collected via standard HTTP logs to safeguard website security and optimize performance.</li>
              </ul>
            </section>

            <section>
              <h2>3. Payment Security & Card Data (Zero Storage)</h2>
              <div className="policy-notice-box green">
                <CheckCircle size={22} color="#28a745" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Bank-Grade 256-Bit SSL Encryption</strong>
                  <p>
                    <strong>Malenadu Roast Co. does not collect, process, or store your credit card, debit card numbers, CVV codes, or net banking passwords.</strong> All online transactions are handled through certified, PCI-DSS Level 1 compliant, RBI-licensed payment gateways (such as Razorpay).
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2>4. How We Utilize Your Information</h2>
              <ul>
                <li>To process, pack, roast, and deliver your coffee and spice orders.</li>
                <li>To generate and email your statutory GST Tax Invoices and receipts.</li>
                <li>To send shipment tracking links, delivery ETA updates, and customer service responses.</li>
                <li>To detect and prevent fraudulent transactions or security violations.</li>
                <li>We <strong>never sell, lease, or monetize</strong> your personal data to third-party marketing companies.</li>
              </ul>
            </section>

            <section>
              <h2>5. Third-Party Service Providers</h2>
              <p>We disclose limited, necessary data to trusted third-party partners strictly for order execution:</p>
              <ul>
                <li><strong>Payment Processors (e.g. Razorpay):</strong> To securely authorize and settle your payment.</li>
                <li><strong>Logistics Aggregators (e.g. Shiprocket, Delhivery, Blue Dart):</strong> To print shipping labels and execute doorstep delivery.</li>
                <li><strong>Email Services:</strong> To deliver order confirmations and electronic GST tax invoices to your inbox.</li>
              </ul>
            </section>

            <section>
              <h2>6. Cookies & Tracking Technologies</h2>
              <p>
                Our website utilizes essential session cookies solely to preserve your active shopping cart contents and remember your logged-in state across page reloads. You can configure your browser to reject cookies, though some interactive features of our store may function with reduced capability.
              </p>
            </section>

            <section>
              <h2>7. Grievance Officer & Contact Details</h2>
              <p>
                In compliance with the Information Technology Act, 2000 and rules made thereunder, questions or grievances regarding personal data processing may be directed to our designated grievance contact:
              </p>
              <div className="policy-contact-cards">
                <div className="contact-mini-card">
                  <MapPin size={18} color="#C8935A" />
                  <div>
                    <span className="mini-card-label">Physical Address</span>
                    <span style={{ color: '#fff', fontSize: '0.85rem' }}>Malenadu Roast Co., Chikkamagaluru, Karnataka - 577101, India</span>
                  </div>
                </div>
                <div className="contact-mini-card">
                  <Mail size={18} color="#C8935A" />
                  <div>
                    <span className="mini-card-label">Grievance Email</span>
                    <a href="mailto:malenaduroast@gmail.com">malenaduroast@gmail.com</a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="policy-page-wrapper">
      <div className="container policy-container">
        {/* Top Back Nav */}
        <div className="policy-top-nav">
          <button onClick={onBack} className="policy-back-btn">
            <ArrowLeft size={18} />
            <span>Back to Store</span>
          </button>
          
          <div className="policy-brand-tag">
            <ShieldCheck size={16} color="#C8935A" />
            <span>FSSAI Lic. 21226177001500</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="policy-tabs-bar">
          {policies.map(p => {
            const isActive = type === p.id || (type === 'privacy' && p.id === 'privacy-policy') ||
                             (type === 'refund' && p.id === 'refund-policy') ||
                             (type === 'terms' && p.id === 'terms-conditions') ||
                             (type === 'shipping' && p.id === 'shipping-policy');
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (onSelectPolicy) onSelectPolicy(p.id);
                  window.location.hash = p.id;
                }}
                className={`policy-tab-item ${isActive ? 'active' : ''}`}
              >
                {p.icon}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Policy Body */}
        <motion.div 
          key={type}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="policy-content-card"
        >
          {renderContent()}
        </motion.div>

        {/* Bottom Back Button */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button onClick={onBack} className="btn btn-gold" style={{ padding: '0.9rem 2.5rem', borderRadius: '30px' }}>
            ← Return to Malenadu Roast Co. Store
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalPolicyPage;

