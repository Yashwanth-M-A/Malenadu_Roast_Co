import React, { useState } from 'react';
import { 
  ArrowLeft, Check, ShieldCheck, Coffee, FileText, 
  ExternalLink, MessageCircle, Truck, Award, Zap, 
  ChevronRight, ArrowRight, HelpCircle
} from 'lucide-react';

export const CommercialPartnershipPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isTcOpen, setIsTcOpen] = useState(false);

  const partnershipTabs = [
    {
      id: 'commercial-urns',
      tabLabel: 'Commercial Filter Coffee Machines (Free on MOQ)',
      badge: '100% FREE MACHINE ON COFFEE MOQ',
      tag: 'CAFE & HOTEL PARTNERSHIP PROGRAM',
      title: 'Commercial Filter Coffee Machines',
      titleAccent: 'Provided 100% Free on Coffee MOQ Partnership',
      lead: 'We do not sell commercial machines. Meet our monthly coffee MOQ criteria, and we provide heavy-duty commercial filter coffee brewers 100% free of charge for your cafe or hotel.',
      image: '/assets/images/commercial_filter_brewer_malenadu.jpg',
      specs: [
        { label: 'Equipment Cost', value: '₹0 (100% Free Placement)' },
        { label: 'Material Grade', value: 'Food-Grade 304 Stainless Steel' },
        { label: 'Brew Speed', value: '15–20 Mins for Full Urn Decoction' },
        { label: 'Temperature Control', value: 'Automatic Dual-Phase Warm-Hold Thermostat' },
        { label: 'Warranty & Upkeep', value: 'Full Replacement Guarantee on Active MOQ' },
        { label: 'Best Suited For', value: 'Cafes, South Indian Restaurants, Hotels, Caterers' }
      ],
      steps: [
        {
          num: 'Step 01',
          title: 'Select Roast Blend',
          desc: 'Choose your signature ratio: authentic 70:30, 80:20, or 100% pure single-estate Arabica & Robusta.'
        },
        {
          num: 'Step 02',
          title: 'Satisfy Monthly MOQ',
          desc: 'Baseline monthly coffee procurement volume customized to your daily cover counts and cup volume.'
        },
        {
          num: 'Step 03',
          title: 'Receive Free Machine*',
          desc: 'Heavy-duty commercial stainless steel brewer dispatched and installed at zero equipment capital cost.'
        }
      ],
      benefits: [
        {
          title: 'Zero Machine Cost (100% Free Placement)',
          desc: 'Never spend on equipment. The commercial brewer is supplied free when you order our freshly roasted coffee regularly.'
        },
        {
          title: 'Heavy-Duty Commercial Stainless Steel',
          desc: 'Food-grade stainless steel urn built for high-volume cafe morning rushes, hotel buffets, and piping hot decoction.'
        },
        {
          title: 'Fresh Chikkamagaluru Estate Roasts',
          desc: 'Authentic 70:30, 80:20, or 100% pure single-estate coffee delivered weekly with statutory 5% GST tax credit invoices.'
        }
      ],
      ctaText: 'Apply for Free Machine Partnership',
      whatsappMessage: 'Hi Malenadu Roast Co.! I would like to inquire about partnering with you for our cafe/hotel and qualifying for the complimentary Commercial Filter Coffee Machine through your coffee MOQ program.'
    },
    {
      id: 'cafe-roasts',
      tabLabel: 'Artisanal Fresh Roasts for Cafes',
      badge: 'ESTATE ROASTERY DIRECT',
      tag: 'ESTATE WHOLESALE ROASTS',
      title: 'Artisanal Fresh Coffee Roasts',
      titleAccent: 'Direct From Chikkamagaluru Estate Plantation',
      lead: 'Freshly batch-roasted single-estate coffee made to order for partner cafes. Available in signature 70:30, 80:20, and 100% pure Arabica & Robusta profiles.',
      image: '/assets/images/signature_beans_1kg.webp',
      specs: [
        { label: 'Packaging', value: '1kg Heavy-Duty Aroma-Lock Valve Bags' },
        { label: 'Roast Schedule', value: 'Roasted Fresh Twice Weekly in Chikkamagaluru' },
        { label: 'Grind Options', value: 'Filter Grind, Espresso, French Press, Whole Beans' },
        { label: 'Chicory Grade', value: 'Premium Roasted Jamnagar Chicory (0% to 30%)' },
        { label: 'Minimum Order', value: 'Flexible Starter MOQ from 10kg/month' },
        { label: 'Sample Kits', value: 'Complimentary Barista Tasting Kit Available' }
      ],
      steps: [
        {
          num: 'Step 01',
          title: 'Request Sample Kit',
          desc: 'Experience our artisanal roast profiles with your barista team before confirming your partnership.'
        },
        {
          num: 'Step 02',
          title: 'Calibrate Grind & Ratio',
          desc: 'We dial in roast depth and grind size specifically to match your cafe’s water profile and brew equipment.'
        },
        {
          num: 'Step 03',
          title: 'Fresh Weekly Roasts',
          desc: 'Continuous scheduled dispatches ensure your customers consistently enjoy fresh coffee within days of roasting.'
        }
      ],
      benefits: [
        {
          title: 'Tailored Roast & Chicory Profiles',
          desc: 'Custom-crafted for your cafe’s brewing style—achieving thick crema, rich aroma, and authentic South Indian body.'
        },
        {
          title: 'Fresh Weekly Roastery Dispatches',
          desc: 'Batch-roasted at our estate plantation in Chikkamagaluru and shipped in 1kg airtight degassing-valve bags.'
        },
        {
          title: 'Complimentary Tasting Sample Pack',
          desc: 'Experience our artisanal roast profiles with your barista team before confirming your monthly partnership MOQ.'
        }
      ],
      ctaText: 'Request Wholesale Coffee Samples',
      whatsappMessage: 'Hi Malenadu Roast Co.! I would like to request tasting samples of your wholesale coffee blends for our cafe/restaurant.'
    },
    {
      id: 'b2b-supply',
      tabLabel: 'Hotels, Resorts & Corporate Bulk Orders',
      badge: 'PAN-INDIA B2B LOGISTICS',
      tag: 'B2B & INSTITUTIONAL SUPPLY',
      title: 'Bulk Coffee Supply & Institutional Logistics',
      titleAccent: 'Hotels, Resorts, Banquets & Corporate Offices',
      lead: 'Scalable wholesale coffee partnerships with transparent MOQ tiers, official 5% GST tax credit invoices, and dedicated roastery account support.',
      image: '/assets/images/roaster_drum_fresh.jpg',
      specs: [
        { label: 'Supply Tiers', value: 'Tier 1 (25kg+), Tier 2 (50kg+), Tier 3 (100kg+/month)' },
        { label: 'Tax Compliance', value: 'Official 5% GST Invoices with Statutory HSN Codes' },
        { label: 'Logistics', value: 'Express Pan-India Logistics with Cold-Seal Tracking' },
        { label: 'Account Support', value: 'Dedicated Roastery B2B Desk on Call & WhatsApp' },
        { label: 'Payment Terms', value: 'Corporate PO, Net 15/30 for verified institutional partners' },
        { label: 'Shelf Life', value: '12 Months in Heavy Degassing Valve Aluminum Foil' }
      ],
      steps: [
        {
          num: 'Step 01',
          title: 'Volume Assessment',
          desc: 'We evaluate your room count, restaurant covers, or daily office beverage consumption.'
        },
        {
          num: 'Step 02',
          title: 'B2B Institutional Pricing',
          desc: 'Tiered wholesale contract pricing tailored to your annual or monthly procurement commitments.'
        },
        {
          num: 'Step 03',
          title: 'Automated Restocking',
          desc: 'Scheduled monthly dispatches with tracking, dedicated account management, and statutory tax invoices.'
        }
      ],
      benefits: [
        {
          title: 'Flexible Monthly MOQ Tiers',
          desc: 'Predictable monthly supply agreements designed to scale with your room count, restaurant covers, or event catering.'
        },
        {
          title: 'Official 5% GST Tax Invoices Included',
          desc: 'Statutory tax invoices provided with every batch so your business can effortlessly claim Input Tax Credit (ITC).'
        },
        {
          title: 'Dedicated WhatsApp Account Desk',
          desc: 'Direct roastery support for rapid re-orders, grind-size adjustments, and barista brewing coordination.'
        }
      ],
      ctaText: 'Discuss MOQ & Bulk Partnership',
      whatsappMessage: 'Hi Malenadu Roast Co.! I would like to discuss wholesale coffee supply, MOQ guidelines, and partnership for our hotel/business.'
    }
  ];

  const currentTab = partnershipTabs[activeTab];

  const handleWhatsApp = (msg) => {
    const text = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=918217623335&text=${text}`, '_blank');
  };

  return (
    <div className="b2b-portal-wrapper">
      <style>{`
        .b2b-portal-wrapper {
          background: #FAF7F2;
          min-height: 100vh;
          color: #1A0A04;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          overflow-x: hidden;
        }
        .b2b-header-bar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(22, 10, 4, 0.98);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(212, 163, 115, 0.25);
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .b2b-header-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(212, 163, 115, 0.3);
          border-radius: 20px;
          padding: 7px 14px;
          color: #FFFFFF !important;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .b2b-header-back-btn:hover {
          background: rgba(212, 163, 115, 0.2);
        }
        .b2b-header-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .b2b-header-brand-title {
          color: #FFFFFF !important;
          font-weight: 700;
          font-size: 0.88rem;
          letter-spacing: 0.5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .b2b-header-whatsapp-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #25D366;
          color: #FFFFFF !important;
          border: none;
          border-radius: 20px;
          padding: 7px 14px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .b2b-hero-section {
          background: radial-gradient(circle at 50% 20%, #28140B 0%, #170A04 60%, #100602 100%);
          padding: clamp(2rem, 4.5vw, 3.8rem) 16px;
          text-align: center;
          border-bottom: 1px solid rgba(212, 163, 115, 0.2);
          position: relative;
        }
        .b2b-hero-title {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif !important;
          font-size: clamp(1.8rem, 4.5vw, 3.2rem) !important;
          font-weight: 700 !important;
          color: #FFFFFF !important;
          line-height: 1.18 !important;
          margin: 0 0 1rem 0 !important;
          letter-spacing: -0.3px;
        }
        .b2b-hero-accent {
          display: block;
          color: #E5A962 !important;
          font-style: italic !important;
          font-weight: 600 !important;
          font-size: 0.9em;
        }
        .b2b-hero-lead {
          color: rgba(255, 255, 255, 0.88) !important;
          font-size: clamp(0.92rem, 1.8vw, 1.1rem);
          line-height: 1.6;
          max-width: 720px;
          margin: 0 auto 1.8rem auto;
        }
        .b2b-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          max-width: 860px;
          margin: 0 auto;
          text-align: left;
        }
        .b2b-metric-card {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(212, 163, 115, 0.25);
          border-radius: 12px;
          padding: 12px 14px;
        }
        .b2b-metric-title {
          color: #F5A623 !important;
          font-weight: 800;
          font-size: 0.92rem;
          margin-bottom: 2px;
        }
        .b2b-metric-desc {
          color: rgba(255, 255, 255, 0.75) !important;
          font-size: 0.76rem;
          line-height: 1.35;
        }
        .b2b-tabs-container {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          background: #ECE3D7;
          padding: 6px;
          border-radius: 16px;
          margin-bottom: 2rem;
        }
        .b2b-tab-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 16px;
          border-radius: 12px;
          border: none;
          font-weight: 700;
          font-size: 0.86rem;
          cursor: pointer;
          transition: all 0.22s ease;
          text-align: center;
        }
        .b2b-showcase-card {
          background: #FFFFFF;
          border: 1.5px solid #E8DFD1;
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
          align-items: stretch;
        }
        .b2b-showcase-left {
          padding: clamp(1.6rem, 3.5vw, 2.8rem);
          min-width: 0;
        }
        .b2b-showcase-right {
          background: linear-gradient(150deg, #26130A 0%, #170A04 100%);
          color: #FFFFFF;
          padding: clamp(1.6rem, 3.5vw, 2.8rem);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-left: 1px solid rgba(212, 163, 115, 0.25);
          min-width: 0;
        }
        @media (max-width: 768px) {
          .b2b-header-bar {
            padding: 8px 12px;
          }
          .b2b-header-brand-title {
            display: none;
          }
          .b2b-header-back-btn {
            padding: 6px 12px;
            font-size: 0.78rem;
          }
          .b2b-header-whatsapp-btn {
            padding: 6px 12px;
            font-size: 0.78rem;
          }
          .b2b-metrics-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .b2b-metric-card {
            padding: 10px 10px;
          }
          .b2b-metric-title {
            font-size: 0.82rem;
          }
          .b2b-metric-desc {
            font-size: 0.7rem;
          }
          .b2b-tabs-container {
            grid-template-columns: 1fr;
            gap: 6px;
            padding: 6px;
          }
          .b2b-tab-btn {
            padding: 11px 12px;
            font-size: 0.84rem;
            text-align: center;
            width: 100%;
          }
          .b2b-showcase-card {
            grid-template-columns: minmax(0, 1fr);
          }
          .b2b-showcase-right {
            border-left: none;
            border-top: 1px solid rgba(212, 163, 115, 0.25);
            padding: 1.5rem 1.2rem;
          }
          .b2b-showcase-left {
            padding: 1.5rem 1.2rem;
          }
        }
      `}</style>
      
      {/* Top Header Bar */}
      <header className="b2b-header-bar">
        <button
          onClick={onBack}
          type="button"
          className="b2b-header-back-btn"
        >
          <ArrowLeft size={16} color="#D4A373" />
          <span>Back to Store</span>
        </button>

        <div className="b2b-header-brand">
          <img 
            src="/assets/images/logo_final.webp" 
            alt="Malenadu Roast Co." 
            style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #D4A373', objectFit: 'cover' }} 
          />
          <span className="b2b-header-brand-title">
            B2B Roastery Supply Portal
          </span>
        </div>

        <button
          onClick={() => handleWhatsApp(currentTab.whatsappMessage)}
          type="button"
          className="b2b-header-whatsapp-btn"
        >
          <MessageCircle size={15} />
          <span>WhatsApp Desk</span>
        </button>
      </header>

      {/* Hero Headline Section */}
      <section className="b2b-hero-section">
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(212, 163, 115, 0.15)',
            border: '1px solid rgba(212, 163, 115, 0.4)',
            borderRadius: '30px',
            padding: '5px 16px',
            color: '#F5A623',
            fontSize: '0.74rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '1.2rem'
          }}>
            <Award size={14} color="#F5A623" />
            <span>OFFICIAL B2B CAFE, HOTEL & CORPORATE ALLIANCE</span>
          </div>

          <h1 className="b2b-hero-title">
            Commercial Filter Coffee Machines
            <span className="b2b-hero-accent">
              Provided 100% Free on Coffee MOQ Partnership
            </span>
          </h1>

          <p className="b2b-hero-lead">
            We do not sell commercial equipment. As single-estate plantation roasters from Chikkamagaluru, we install heavy-duty commercial brewers at zero machine cost when your business commits to our freshly roasted coffee on a simple monthly MOQ.
          </p>

          {/* 4 Trust Metrics */}
          <div className="b2b-metrics-grid">
            {[
              { title: '₹0 Equipment Cost', desc: '100% free commercial brewer' },
              { title: '304 Stainless Steel', desc: 'Heavy-duty food-grade urn' },
              { title: 'Chikkamagaluru Roasts', desc: 'Single-estate fresh weekly' },
              { title: '5% GST Invoices', desc: 'Full Input Tax Credit (ITC)' }
            ].map((m, idx) => (
              <div key={idx} className="b2b-metric-card">
                <div className="b2b-metric-title">
                  {m.title}
                </div>
                <div className="b2b-metric-desc">
                  {m.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interactive Showcase Body */}
      <main style={{ maxWidth: '1140px', margin: '0 auto', padding: 'clamp(2rem, 4vw, 3.5rem) 16px' }}>
        
        {/* 3 Nav Tabs */}
        <div className="b2b-tabs-container">
          {partnershipTabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(idx)}
              type="button"
              className="b2b-tab-btn"
              style={{
                background: activeTab === idx ? '#251208' : 'transparent',
                color: activeTab === idx ? '#FFFFFF' : '#5D3E28',
                boxShadow: activeTab === idx ? '0 4px 14px rgba(37, 18, 8, 0.25)' : 'none'
              }}
            >
              <span>{tab.tabLabel}</span>
              {activeTab === idx && <span style={{ color: '#F5A623' }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Active Model Full Detail Showcase Card */}
        <div className="b2b-showcase-card">
          
          {/* Left Content Column */}
          <div className="b2b-showcase-left">
              
              <div style={{
                display: 'inline-block',
                background: '#FFF9F2',
                border: '1px solid rgba(200, 138, 62, 0.4)',
                borderRadius: '20px',
                padding: '4px 12px',
                color: '#8C5835',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                {currentTab.badge}
              </div>

              <h2 style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 700,
                color: '#1A0A04',
                lineHeight: 1.2,
                margin: '0 0 0.8rem 0'
              }}>
                {currentTab.title}
                <span style={{ display: 'block', color: '#8C5835', fontStyle: 'italic', fontWeight: 600, fontSize: '0.85em' }}>
                  {currentTab.titleAccent}
                </span>
              </h2>

              <p style={{
                color: '#5C4738',
                fontSize: '0.94rem',
                lineHeight: 1.6,
                margin: '0 0 1.8rem 0'
              }}>
                {currentTab.lead}
              </p>

              {/* 3 Step Flow */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  letterSpacing: '1.5px',
                  color: '#8C5835',
                  textTransform: 'uppercase',
                  marginBottom: '10px'
                }}>
                  3-STEP PARTNERSHIP WORKFLOW
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {currentTab.steps.map((st, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#FDFBF8',
                      border: '1px solid #ECE3D7',
                      borderRadius: '10px',
                      padding: '10px 14px'
                    }}>
                      <span style={{
                        background: '#251208',
                        color: '#F5A623',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '4px 8px',
                        borderRadius: '5px',
                        flexShrink: 0
                      }}>
                        {st.num}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1A0A04', marginBottom: '2px' }}>
                          {st.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#6C584B', lineHeight: '1.35' }}>
                          {st.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '2.2rem' }}>
                {currentTab.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#FAF4EB',
                      border: '1px solid #E4D5C2',
                      color: '#8C5835',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      <Check size={13} strokeWidth={3} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1A0A04', marginBottom: '2px' }}>
                        {b.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6A564A', lineHeight: 1.45 }}>
                        {b.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => handleWhatsApp(currentTab.whatsappMessage)}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: '#251208',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '30px',
                    padding: '14px 24px',
                    fontSize: '0.94rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(37, 18, 8, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#3D2010'}
                  onMouseLeave={e => e.currentTarget.style.background = '#251208'}
                >
                  <MessageCircle size={18} color="#25D366" />
                  <span>{currentTab.ctaText}</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={() => setIsTcOpen(true)}
                  type="button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: '#FFF9F0',
                    border: '1.5px solid #C88A3E',
                    color: '#8C5835',
                    borderRadius: '30px',
                    padding: '11px 20px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <FileText size={15} color="#C88A3E" />
                  <span>View Official Terms & Conditions</span>
                  <ExternalLink size={13} color="#C88A3E" />
                </button>
              </div>

            </div>

            {/* Right Equipment / Spec Column */}
            <div className="b2b-showcase-right">
              
              <div>
                <div style={{
                  textAlign: 'center',
                  marginBottom: '1.5rem',
                  position: 'relative'
                }}>
                  <img
                    src={currentTab.image}
                    alt={currentTab.title}
                    style={{
                      maxHeight: '320px',
                      maxWidth: '90%',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      filter: 'drop-shadow(0 16px 30px rgba(0,0,0,0.6))',
                      margin: '0 auto',
                      display: 'block'
                    }}
                  />
                </div>

                <h3 style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: '#FFFFFF !important',
                  marginBottom: '1rem',
                  letterSpacing: '0.4px',
                  borderBottom: '1px solid rgba(212, 163, 115, 0.2)',
                  paddingBottom: '8px'
                }}>
                  Equipment Specifications & Service Guarantee
                </h3>

                {/* Specs List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.5rem' }}>
                  {currentTab.specs.map((sp, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '0.78rem'
                    }}>
                      <span style={{ color: 'rgba(255, 255, 255, 0.65)' }}>{sp.label}</span>
                      <strong style={{ color: '#F5A623', textAlign: 'right' }}>{sp.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reassurance Banner */}
              <div style={{
                background: 'rgba(212, 163, 115, 0.1)',
                border: '1px solid rgba(212, 163, 115, 0.3)',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ShieldCheck size={24} color="#F5A623" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4 }}>
                  <strong style={{ color: '#FFFFFF', display: 'block' }}>FSSAI & Statutory Compliant</strong>
                  Direct roastery dispatch with official 5% GST tax credit invoices and Pan-India cold-chain logistics.
                </div>
              </div>

            </div>

          </div>

        </main>

      {/* Terms & Conditions Modal */}
      {isTcOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            maxWidth: '560px',
            width: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              background: '#251208',
              color: '#FFFFFF',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                Partnership Terms & Guidelines
              </h3>
              <button
                onClick={() => setIsTcOpen(false)}
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto', fontSize: '0.84rem', lineHeight: 1.6, color: '#4A3B32' }}>
              <p><strong>1. Equipment Placement Ownership:</strong> Commercial filter coffee urns and brewers remain the property of Malenadu Roast Co. and are deployed to partner venues under an active coffee supply agreement.</p>
              <p><strong>2. Monthly MOQ Fulfillment:</strong> The free equipment benefit applies to partners maintaining their agreed monthly procurement volume (typically 15kg to 30kg depending on equipment capacity).</p>
              <p><strong>3. Maintenance & Servicing:</strong> Routine maintenance, element replacement, and heating thermostat servicing are handled free of charge under active partnership.</p>
              <p><strong>4. Fresh Harvest Guarantee:</strong> Coffee is batch-roasted and dispatched within 48 hours of roasting in specialized airtight degassing valve packaging.</p>
              <p><strong>5. Invoicing & Taxation:</strong> All consignments carry official statutory 5% GST B2B tax credit invoices.</p>
            </div>

            <div style={{ padding: '14px 20px', background: '#F8F6F2', borderTop: '1px solid #ECE3D7', textAlign: 'right' }}>
              <button
                onClick={() => setIsTcOpen(false)}
                type="button"
                style={{
                  background: '#251208',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ============================================================
// COMPACT ATTRACTIVE HOMEPAGE TEASER CARD (WHITE LUXURY CARD)
// Replaces the heavy section with an elegant, click-to-explore portal card
// ============================================================
export const CommercialPartnershipTeaser = ({ onOpenPartnership }) => {
  return (
    <section 
      id="partner-with-us" 
      style={{ 
        padding: 'clamp(2rem, 3.5vw, 3rem) 16px', 
        background: '#160A04',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div id="partnership" style={{ position: 'relative', top: '-90px', visibility: 'hidden' }} />
      
      <style>{`
        .commercial-partnership-teaser-card {
          max-width: 1140px;
          margin: 0 auto;
          background: #FFFFFF !important;
          border: 1.5px solid #EADBCC !important;
          border-radius: 20px;
          padding: clamp(1.5rem, 3.2vw, 2.6rem);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.35);
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          display: grid;
          grid-template-columns: minmax(0, 1.18fr) minmax(0, 1fr);
          align-items: center;
          gap: clamp(24px, 3.5vw, 44px);
        }
        .commercial-partnership-teaser-card:hover {
          border-color: #C88A3E !important;
          transform: translateY(-3px);
          box-shadow: 0 22px 55px rgba(200, 138, 62, 0.3);
        }
        .commercial-teaser-img-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
        }
        .commercial-teaser-img-wrap img {
          max-height: clamp(290px, 28vw, 380px);
          width: auto;
          max-width: 100%;
          object-fit: contain;
          filter: drop-shadow(0 16px 32px rgba(0,0,0,0.22));
          border-radius: 14px;
          transition: transform 0.35s ease;
        }
        .commercial-partnership-teaser-card:hover .commercial-teaser-img-wrap img {
          transform: scale(1.04);
        }
        @media (max-width: 768px) {
          .commercial-partnership-teaser-card {
            grid-template-columns: minmax(0, 1fr) !important;
            padding: 1.5rem 1.1rem !important;
            gap: 18px !important;
          }
          .commercial-teaser-img-wrap {
            order: -1 !important;
            margin-bottom: 8px !important;
          }
          .commercial-teaser-img-wrap img {
            max-height: clamp(230px, 64vw, 290px) !important;
            width: auto !important;
            max-width: 88% !important;
            margin: 0 auto !important;
          }
          .commercial-teaser-cta-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      <div 
        onClick={onOpenPartnership}
        className="commercial-partnership-teaser-card"
      >
        {/* Left Content Side */}
        <div style={{ minWidth: 0 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFF8EE',
            border: '1px solid rgba(200, 138, 62, 0.45)',
            borderRadius: '20px',
            padding: '5px 13px',
            color: '#8C5835',
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '10px'
          }}>
            <Award size={13} color="#C88A3E" />
            <span>EXCLUSIVE B2B PARTNER OFFER • 100% FREE ON MOQ</span>
          </div>

          <h2 style={{
            fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
            color: '#1A0A04',
            fontSize: 'clamp(1.4rem, 2.6vw, 2.1rem)',
            fontWeight: 700,
            lineHeight: 1.25,
            margin: '0 0 8px 0'
          }}>
            Commercial Filter Coffee Machines
            <span style={{ display: 'block', color: '#8C5835', fontStyle: 'italic', fontWeight: 600, fontSize: '0.9em' }}>
              Provided 100% Free on Coffee MOQ Partnership
            </span>
          </h2>

          <p style={{
            color: '#5C4738',
            fontSize: '0.9rem',
            lineHeight: 1.55,
            margin: '0 0 16px 0',
            maxWidth: '540px'
          }}>
            Equip your cafe, hotel, or office with heavy-duty commercial stainless steel brewers at zero machine cost when ordering our fresh Chikkamagaluru estate roasts.
          </p>

          {/* 3 Compact Trust Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span style={{ background: '#FAF5EE', border: '1px solid #E8DDD0', color: '#2B160C', borderRadius: '16px', padding: '4px 11px', fontSize: '0.74rem', fontWeight: 700 }}>
              ✓ ₹0 Equipment Cost
            </span>
            <span style={{ background: '#FAF5EE', border: '1px solid #E8DDD0', color: '#2B160C', borderRadius: '16px', padding: '4px 11px', fontSize: '0.74rem', fontWeight: 700 }}>
              ✓ Single-Estate Fresh Roasts
            </span>
            <span style={{ background: '#FAF5EE', border: '1px solid #E8DDD0', color: '#2B160C', borderRadius: '16px', padding: '4px 11px', fontSize: '0.74rem', fontWeight: 700 }}>
              ✓ 5% GST Invoices
            </span>
          </div>

          {/* Attractive CTA Button */}
          <div className="commercial-teaser-cta-btn" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#1A0A04',
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '25px',
            fontWeight: 700,
            fontSize: '0.88rem',
            boxShadow: '0 4px 16px rgba(26, 10, 4, 0.25)',
            transition: 'all 0.2s ease'
          }}>
            <span>Explore Partnership & Machines</span>
            <ArrowRight size={16} color="#E5A962" />
          </div>
        </div>

        {/* Right Preview Side */}
        <div className="commercial-teaser-img-wrap">
          <div style={{
            position: 'absolute',
            width: 'clamp(280px, 32vw, 380px)',
            height: 'clamp(280px, 32vw, 380px)',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200, 138, 62, 0.2) 0%, rgba(200, 138, 62, 0.05) 50%, transparent 72%)',
            pointerEvents: 'none'
          }} />
          <div style={{ position: 'relative', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img 
              src="/assets/images/commercial_filter_brewer_malenadu.jpg"
              alt="Commercial Stainless Steel Filter Brewer"
            />
            <div style={{
              marginTop: '12px',
              background: '#1A0A04',
              border: '1.5px solid #C88A3E',
              borderRadius: '20px',
              padding: '6px 16px',
              color: '#F5A623',
              fontSize: '0.76rem',
              fontWeight: 800,
              letterSpacing: '0.5px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
            }}>
              <span>100% Free on Coffee MOQ</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommercialPartnershipPage;
