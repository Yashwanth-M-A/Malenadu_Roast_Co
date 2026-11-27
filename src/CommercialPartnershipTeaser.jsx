import React from 'react';
import { Award, ArrowRight } from 'lucide-react';

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
              loading="lazy"
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

export default CommercialPartnershipTeaser;
