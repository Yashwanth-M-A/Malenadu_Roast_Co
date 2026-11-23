import React, { useState, useEffect, useMemo } from 'react';
import { getReviewsForProduct } from './productReviewsData.js';
import { 
  X, User, ShoppingCart, ShoppingBag, Star, ShieldCheck, Leaf, Truck, Check, 
  ChevronDown, MessageCircle, Clock, Flame, Award, HelpCircle, ExternalLink, Info,
  Maximize2, ChevronLeft, ChevronRight, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductDetailsModal = ({ product, isOpen, onClose, onAddToCart, onBuyNow, onImageClick, onShareProduct }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [productReviews, setProductReviews] = useState([]);
  const [filterRating, setFilterRating] = useState('all');
  const [sortOrder, setSortOrder] = useState('recent');
  const [visibleReviewCount, setVisibleReviewCount] = useState(10);
  const [helpfulVotes, setHelpfulVotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('malenadu_review_helpful_votes') || '{}');
    } catch(e) { return {}; }
  });

  const toggleHelpful = (revId, e) => {
    if (e) e.stopPropagation();
    setHelpfulVotes(prev => {
      const updated = { ...prev, [revId]: !prev[revId] };
      try { localStorage.setItem('malenadu_review_helpful_votes', JSON.stringify(updated)); } catch(e) {}
      return updated;
    });
  };

  useEffect(() => {
    if (!product) return;
    const fetchReviews = () => {
      try {
        const reviews = getReviewsForProduct(product.name);
        setProductReviews(reviews);
      } catch (e) {
        setProductReviews([]);
      }
    };

    fetchReviews();
    setVisibleReviewCount(10);
    setFilterRating('all');
    window.addEventListener('malenadu_reviews_updated', fetchReviews);
    return () => window.removeEventListener('malenadu_reviews_updated', fetchReviews);
  }, [product]);

  useEffect(() => {
    if (product) {
      const initialVariant = product.variants && product.variants.length > 0 
        ? product.variants[0] 
        : { weight: product.weight || '500g', price: product.price || '449' };
      setSelectedVariant(initialVariant);
      setActiveImageIndex(0);
      setOpenFaqIndex(0);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  // Build images list
  const allImages = (product.id === 16 || product.name === 'Malenadu Signature Beans')
    ? (Array.isArray(product.images) && product.images.length > 0 ? product.images : [product.image])
    : (selectedVariant?.backImage 
        ? [selectedVariant.image, selectedVariant.backImage]
        : (product.images && product.images.length > 0 
            ? product.images 
            : [product.image || '/assets/images/coffee_pack_new.webp']));

  const currentImage = allImages[activeImageIndex] || allImages[0];
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentWeight = selectedVariant ? selectedVariant.weight : (product.weight || '500g');
  const anchorPrice = Math.round(Number(currentPrice) * 1.30);

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart({
        ...product,
        price: currentPrice,
        weight: currentWeight,
        image: selectedVariant?.image || product.image
      });
    }
  };

  const handleBuyNowClick = () => {
    if (onBuyNow) {
      onBuyNow({
        ...product,
        price: currentPrice,
        weight: currentWeight,
        image: selectedVariant?.image || product.image
      });
      onClose();
    }
  };

  const handleOpenZoom = (e) => {
    if (e) e.stopPropagation();
    setIsImageZoomed(true);
    if (onImageClick) {
      onImageClick({ images: allImages, index: activeImageIndex });
    }
  };

  const handleWhatsAppRoaster = () => {
    const text = encodeURIComponent(
      `Hello Malenadu Roast Co.! I am viewing *${product.name}* (${currentWeight}) on your website and have a quick question before placing my order.`
    );
    window.open(`https://api.whatsapp.com/send?phone=918217623335&text=${text}`, '_blank');
  };

  const isCoffee = product.category === 'coffee' || (!product.category && product.specs?.roast);
  const isPepper = product.category === 'pepper';
  const isCombo = product.category === 'combos';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(18, 16, 14, 0.82)',
      backdropFilter: 'blur(6px)',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div 
        style={{ position: 'fixed', inset: 0 }} 
        onClick={onClose} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          position: 'relative',
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1040px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          border: '1.5px solid rgba(200, 169, 106, 0.35)',
          overflow: 'hidden',
          zIndex: 10000
        }}
      >
        {/* Sticky Modal Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          background: '#FAF8F5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#8c6239', fontWeight: 600 }}>
            <span>Malenadu Roastery</span>
            <span>/</span>
            <span style={{ textTransform: 'capitalize' }}>{product.category || 'Single-Estate'}</span>
            <span>/</span>
            <strong style={{ color: '#18110C' }}>{product.name}</strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={(e) => {
                if (onShareProduct) {
                  onShareProduct(product, e);
                } else {
                  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://www.malenaduroastco.works';
                  const shareUrl = `${origin}/?product=${encodeURIComponent(product.name)}#products`;
                  const shareText = `☕ *${product.name}*\n${product.specs?.flavorNotes || 'Artisanal Single-Estate Roast from Chikkamagaluru'}\n💰 Starting at ₹${currentPrice} (Incl. 5% GST)\n\nTaste the authentic single-estate roast:\n👉 ${shareUrl}`;
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({ title: product.name, text: shareText, url: shareUrl }).catch(() => {});
                  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2500);
                  }
                }
              }}
              title="Share this product via WhatsApp or other apps"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(200, 147, 90, 0.4)',
                borderRadius: '20px',
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#18110C',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8935A'; e.currentTarget.style.background = '#FAF7F2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(200, 147, 90, 0.4)'; e.currentTarget.style.background = '#FFFFFF'; }}
            >
              <Share2 size={13} color="#8C6239" />
              <span>{isCopied ? '✓ Copied' : 'Share'}</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          overflowY: 'auto',
          padding: '1.75rem',
          display: 'grid',
          gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth < 820 ? '1fr' : '440px 1fr',
          gap: '2rem'
        }}>

          {/* Left Column: Gallery & Estate Trust Accreditations */}
          <div>
            <div 
              onClick={handleOpenZoom}
              title="Click to enlarge / view high-resolution image"
              style={{
                background: '#FDFBF7',
                border: '1px solid #eee5da',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                position: 'relative',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)',
                cursor: 'zoom-in',
                overflow: 'hidden',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#C8935A';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(200, 147, 90, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#eee5da';
                e.currentTarget.style.boxShadow = 'inset 0 0 20px rgba(0,0,0,0.02)';
              }}
            >
              {/* Zoom HD Pill Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(24, 17, 12, 0.78)',
                backdropFilter: 'blur(4px)',
                color: '#E8CA80',
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                border: '1px solid rgba(232, 202, 128, 0.35)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                zIndex: 2,
                pointerEvents: 'none'
              }}>
                <Maximize2 size={12} />
                <span>Zoom HD</span>
              </div>

              <img
                src={currentImage}
                alt={product.name}
                style={{
                  maxHeight: '340px',
                  width: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.12))',
                  transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      border: activeImageIndex === idx ? '2px solid #C8935A' : '1px solid #e2e8f0',
                      background: '#fff',
                      padding: '3px',
                      cursor: 'pointer',
                      boxShadow: activeImageIndex === idx ? '0 2px 8px rgba(200, 147, 90, 0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurances Grid */}
            <div style={{
              marginTop: '1.5rem',
              background: '#FAF8F5',
              border: '1px solid #eee5da',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#2C1810', fontWeight: 600 }}>
                <Leaf size={16} color="#15803d" />
                <span>Single-Estate Harvest from the Hills of Chikkamagaluru</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#2C1810', fontWeight: 600 }}>
                <ShieldCheck size={16} color="#C8935A" />
                <span>100% Tax Compliant & FSSAI Certified (5% GST Invoice Included)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#2C1810', fontWeight: 600 }}>
                <Award size={16} color="#b45309" />
                <span>Multi-layer Aroma Pouch with 1-Way Freshness Valve</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#2C1810', fontWeight: 600 }}>
                <Truck size={16} color="#0284c7" />
                <span>Dispatched within 24 Hours via Shiprocket Pan-India Logistics</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Intelligence, Specs, Brew Recipe & FAQs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Title & Tagline */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8c6239', fontWeight: 700 }}>
                  {isCoffee ? 'Artisanal Single-Estate Filter Coffee' : isPepper ? 'Tellicherry Bold Whole Spice' : 'Signature Estate Pairing'}
                </span>

                {product.badge && (
                  <span style={{
                    background: '#18110C',
                    color: '#E8CA80',
                    border: '1px solid rgba(200, 169, 106, 0.4)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>
                    {product.badge}
                  </span>
                )}
              </div>
              
              <h1 style={{
                margin: '0 0 6px',
                fontSize: '1.75rem',
                fontFamily: '"Playfair Display", Georgia, serif',
                color: '#18110C',
                fontWeight: 800,
                letterSpacing: '-0.5px'
              }}>
                {product.name}
              </h1>

              <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b', fontStyle: 'italic', lineHeight: '1.4' }}>
                "{product.description}"
              </p>

              {/* Genuine Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <div style={{ display: 'flex', color: '#eab308' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="#eab308" />
                  ))}
                </div>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#18110C' }}>
                  {product.rating || '4.8'} / 5.0
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  ({product.reviews || 120} Verified Estate Reviews)
                </span>
              </div>
            </div>

            {/* Size / Weight Variant Picker */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ background: '#FAF8F5', border: '1px solid #eee5da', borderRadius: '10px', padding: '1rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                  Select Package Size:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.weight === v.weight;
                    return (
                      <button
                        key={v.weight}
                        onClick={() => {
                          setSelectedVariant(v);
                          setActiveImageIndex(0);
                        }}
                        style={{
                          flex: '1',
                          minWidth: '100px',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid #C8935A' : '1px solid #cbd5e1',
                          background: isSelected ? '#18110C' : '#FFFFFF',
                          color: isSelected ? '#FBF8F3' : '#334155',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          boxShadow: isSelected ? '0 4px 12px rgba(24, 17, 12, 0.2)' : 'none'
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>{v.weight}</div>
                        <div style={{ fontSize: '0.76rem', color: isSelected ? '#E8CA80' : '#8c6239', marginTop: '2px', fontWeight: 600 }}>
                          ₹{v.price}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {/* Dynamic 500g vs 1kg Shipping Tier Badge */}
                <div style={{
                  marginTop: '10px',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  background: (selectedVariant?.weight || '').includes('1kg') ? '#f0fdf4' : '#fffbeb',
                  border: (selectedVariant?.weight || '').includes('1kg') ? '1px solid #bbf7d0' : '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem'
                }}>
                  {(selectedVariant?.weight || '').includes('1kg') ? (
                    <span style={{ color: '#15803d', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Truck size={14} color="#16a34a" /> 🎉 100% FREE Express Delivery Unlocked (1kg Pack)
                    </span>
                  ) : (
                    <span style={{ color: '#92400e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Truck size={14} color="#d97706" /> Delivery: ₹50 <strong style={{ color: '#16a34a', marginLeft: 4 }}>• Choose 1kg for FREE Delivery!</strong>
                    </span>
                  )}
                  {(selectedVariant?.weight || '').includes('1kg') && (
                    <span style={{ fontSize: '0.7rem', background: '#16a34a', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      SAVE ₹50
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Price & Purchase Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem',
              background: '#FAF8F5',
              border: '1px solid #eee5da',
              borderRadius: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Georgia, serif', color: '#18110C' }}>
                    ₹{currentPrice}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    ₹{anchorPrice}
                  </span>
                  <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                    30% SAVINGS
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                  ✓ Inclusive of 5% GST &bull; Fresh Batch-Roasted in Chikkamagaluru
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexGrow: 1, justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAddToCartClick}
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '8px',
                    border: '1.5px solid #C8935A',
                    background: '#FFFFFF',
                    color: '#8c6239',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNowClick}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#18110C',
                    color: '#FBF8F3',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(24, 17, 12, 0.35)'
                  }}
                >
                  <ShoppingBag size={16} color="#E8CA80" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>

            {/* Section 1: Roaster's Technical Specification Sheet */}
            {product.specs && (
              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#18110C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={16} color="#C8935A" />
                  <span>Roaster's Specifications & Blend Details</span>
                </h3>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '8px'
                }}>
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.65rem 0.85rem'
                    }}>
                      <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 700, marginTop: '2px' }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Why This Coffee / Harvest Story */}
            {product.whySpecial && (
              <div style={{
                background: '#FAF8F5',
                borderLeft: '4px solid #C8935A',
                borderRadius: '0 10px 10px 0',
                padding: '1rem 1.25rem'
              }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.92rem', color: '#18110C', fontWeight: 700 }}>
                  Why This Roast is Unique:
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', lineHeight: '1.6' }}>
                  {product.whySpecial}
                </p>
              </div>
            )}

            {/* Section 3: Step-by-Step 3-Minute Brewing Guide */}
            {product.brewingGuide && (
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#18110C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={16} color="#C8935A" />
                    <span>{product.brewingGuide.title || 'How to Brew the Perfect Cup'}</span>
                  </h3>
                  {product.brewingGuide.brewTime && (
                    <span style={{ fontSize: '0.74rem', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '12px', fontWeight: 600 }}>
                      ⏱ {product.brewingGuide.brewTime}
                    </span>
                  )}
                </div>

                  <div style={{ fontSize: '0.78rem', color: '#8c6239', fontWeight: 600, marginBottom: '0.85rem' }}>
                    Recommended Ratio: <strong>{product.brewingGuide.ratio}</strong>
                  </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {product.brewingGuide.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#18110C',
                        color: '#E8CA80',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#334155', lineHeight: '1.55' }}>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Customer Questions Solved (Interactive FAQs) */}
            {product.faqs && product.faqs.length > 0 && (
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem'
              }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '1rem', color: '#18110C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HelpCircle size={16} color="#C8935A" />
                  <span>Frequently Asked Questions About This Product</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {product.faqs.map((faq, idx) => {
                    const isOpen = openFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        style={{
                          border: isOpen ? '1px solid #C8935A' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          transition: 'all 0.2s'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '0.8rem 1rem',
                            background: isOpen ? '#FAF8F5' : '#ffffff',
                            border: 'none',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            color: isOpen ? '#18110C' : '#334155',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <span>{faq.q}</span>
                          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={14} color="#8c6239" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{
                                padding: '0.75rem 1rem 1rem',
                                fontSize: '0.82rem',
                                color: '#475569',
                                lineHeight: '1.6',
                                background: '#ffffff',
                                borderTop: '1px solid #f1f5f9'
                              }}>
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 4.5: Verified Customer Reviews & Ratings (Amazon & Flipkart Style with 100+ Reviews) */}
            {(() => {
              // Calculate filtered and sorted reviews
              const totalCount = productReviews.length;
              const fiveStars = productReviews.filter(r => Number(r.rating || 5) === 5);
              const fourStars = productReviews.filter(r => Number(r.rating || 5) === 4);
              const threeStars = productReviews.filter(r => Number(r.rating || 5) <= 3);

              const fivePct = totalCount > 0 ? Math.round((fiveStars.length / totalCount) * 100) : 88;
              const fourPct = totalCount > 0 ? Math.round((fourStars.length / totalCount) * 100) : 10;
              const threePct = totalCount > 0 ? Math.round((threeStars.length / totalCount) * 100) : 2;

              let filtered = productReviews;
              if (filterRating === '5') filtered = fiveStars;
              if (filterRating === '4') filtered = fourStars;
              if (filterRating === '3') filtered = threeStars;

              if (sortOrder === 'recent') {
                filtered = [...filtered].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
              } else if (sortOrder === 'rating') {
                filtered = [...filtered].sort((a, b) => Number(b.rating || 5) - Number(a.rating || 5));
              } else if (sortOrder === 'helpful') {
                filtered = [...filtered].sort((a, b) => (Number(b.helpful) || 0) - (Number(a.helpful) || 0));
              }

              const visibleReviews = filtered.slice(0, visibleReviewCount);
              const hasMore = filtered.length > visibleReviewCount;
              const avgScore = product.rating 
                ? Number(product.rating).toFixed(1)
                : (totalCount > 0 
                    ? (productReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / totalCount).toFixed(1)
                    : '4.8');

              return (
                <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                  {/* Header Title */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#18110C', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: '"Georgia", serif' }}>
                      <Star size={18} color="#eab308" fill="#eab308" />
                      <span>Verified Customer Ratings & Reviews</span>
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: '#15803D', background: '#F0FDF4', border: '1px solid #DCFCE7', padding: '3px 10px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} strokeWidth={3} />
                      {totalCount} 100% Verified Buyer Reviews
                    </span>
                  </div>

                  {/* Top Rating Breakdown Card (Amazon / Flipkart Style) */}
                  <div style={{
                    background: '#FAF8F5',
                    border: '1px solid #E6DEC9',
                    borderRadius: '12px',
                    padding: '1.25rem 1.4rem',
                    marginBottom: '1rem',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '1.75rem',
                    alignItems: 'center'
                  }}>
                    {/* Left: Overall Score & Stars */}
                    <div style={{ textAlign: 'center', minWidth: '120px' }}>
                      <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#18110C', lineHeight: 1, fontFamily: '"Georgia", serif' }}>
                        {avgScore}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', color: '#eab308', margin: '8px 0 4px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            size={16} 
                            fill={s <= Math.round(Number(avgScore)) ? "#eab308" : "#e2e8f0"} 
                            color={s <= Math.round(Number(avgScore)) ? "#eab308" : "#cbd5e1"} 
                          />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#78716c', fontWeight: 600 }}>
                        {totalCount} Verified Ratings
                      </div>
                    </div>

                    {/* Right: Star Distribution Bars */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {/* 5 Star Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#44403C', fontWeight: 600 }}>
                        <span style={{ width: '40px' }}>5 Star</span>
                        <div style={{ flex: 1, height: '7px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${fivePct}%`, height: '100%', background: '#16A34A', borderRadius: '4px' }} />
                        </div>
                        <span style={{ width: '35px', textAlign: 'right', color: '#78716C' }}>{fivePct}%</span>
                      </div>

                      {/* 4 Star Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#44403C', fontWeight: 600 }}>
                        <span style={{ width: '40px' }}>4 Star</span>
                        <div style={{ flex: 1, height: '7px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${fourPct}%`, height: '100%', background: '#84CC16', borderRadius: '4px' }} />
                        </div>
                        <span style={{ width: '35px', textAlign: 'right', color: '#78716C' }}>{fourPct}%</span>
                      </div>

                      {/* 3 Star Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: '#44403C', fontWeight: 600 }}>
                        <span style={{ width: '40px' }}>3 Star</span>
                        <div style={{ flex: 1, height: '7px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${threePct}%`, height: '100%', background: '#EAB308', borderRadius: '4px' }} />
                        </div>
                        <span style={{ width: '35px', textAlign: 'right', color: '#78716C' }}>{threePct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter & Sort Controls Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #EBE5DB'
                  }}>
                    {/* Star Rating Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { key: 'all', label: `All (${totalCount})` },
                        { key: '5', label: `5 Star (${fiveStars.length})` },
                        { key: '4', label: `4 Star (${fourStars.length})` },
                        { key: '3', label: `Critical (${threeStars.length})` }
                      ].map(f => {
                        const active = filterRating === f.key;
                        return (
                          <button
                            key={f.key}
                            type="button"
                            onClick={() => { setFilterRating(f.key); setVisibleReviewCount(10); }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '14px',
                              fontSize: '0.72rem',
                              fontWeight: active ? 700 : 500,
                              background: active ? '#18110C' : '#FFFFFF',
                              color: active ? '#FFFFFF' : '#44403C',
                              border: active ? '1px solid #18110C' : '1px solid #D8CFC4',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sort Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#78716C' }}>
                      <span style={{ fontWeight: 600 }}>Sort by:</span>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid #D8CFC4',
                          background: '#FFFFFF',
                          fontSize: '0.74rem',
                          color: '#18110C',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="recent">Most Recent</option>
                        <option value="rating">Highest Rating</option>
                        <option value="helpful">Most Helpful</option>
                      </select>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {visibleReviews.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {visibleReviews.map((rev, rIdx) => {
                        const isUserSubmitted = Boolean(rev.isReal || rev.orderNumber);
                        const isHelpful = Boolean(helpfulVotes[rev.id || rIdx]);
                        const voteCount = (Number(rev.helpful) || 0) + (isHelpful ? 1 : 0);

                        return (
                          <div 
                            key={rev.id || rIdx}
                            style={{
                              background: isUserSubmitted ? '#FFFCF7' : '#ffffff',
                              border: isUserSubmitted ? '1.5px solid #C8935A' : '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '1.05rem 1.15rem',
                              boxShadow: isUserSubmitted ? '0 3px 10px rgba(200, 147, 90, 0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {/* Reviewer Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {rev.avatar ? (
                                  <img 
                                    src={rev.avatar} 
                                    alt={rev.name} 
                                    referrerPolicy="no-referrer"
                                    style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid #C8935A' }} 
                                  />
                                ) : (
                                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#F5EBE1', color: '#8c6239', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {(rev.name || 'C').charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                                      {rev.name || 'Verified Buyer'}
                                    </span>
                                    <span style={{ fontSize: '0.66rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                      <Check size={9} strokeWidth={3} />
                                      Verified Purchase
                                    </span>
                                    {isUserSubmitted && (
                                      <span style={{ fontSize: '0.64rem', background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>
                                        ★ Newly Submitted
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px' }}>
                                    {rev.city || rev.location || 'Chikmagalur, Karnataka'}
                                  </div>
                                </div>
                              </div>

                              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                {rev.date ? new Date(rev.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Verified Batch'}
                              </span>
                            </div>

                            {/* Stars & Headline */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', marginTop: '4px' }}>
                              <div style={{ display: 'flex', color: '#eab308' }}>
                                {[1, 2, 3, 4, 5].map((st) => (
                                  <Star 
                                    key={st} 
                                    size={13} 
                                    fill={st <= Number(rev.rating || 5) ? '#eab308' : '#e2e8f0'} 
                                    color={st <= Number(rev.rating || 5) ? '#eab308' : '#cbd5e1'} 
                                  />
                                ))}
                              </div>
                              {rev.title && (
                                <h5 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#18110C' }}>
                                  "{rev.title}"
                                </h5>
                              )}
                            </div>

                            {/* Comment */}
                            <p style={{ margin: '0 0 8px', fontSize: '0.81rem', color: '#334155', lineHeight: 1.55 }}>
                              {rev.text}
                            </p>

                            {/* Tags and Helpful footer */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #f8fafc' }}>
                              {Array.isArray(rev.tags) && rev.tags.length > 0 ? (
                                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                  {rev.tags.map(tg => (
                                    <span 
                                      key={tg}
                                      style={{
                                        fontSize: '0.66rem',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        color: '#64748b',
                                        padding: '1px 6px',
                                        borderRadius: '8px'
                                      }}
                                    >
                                      #{tg}
                                    </span>
                                  ))}
                                </div>
                              ) : <div />}

                              {/* Helpful Button */}
                              <button
                                type="button"
                                onClick={(e) => toggleHelpful(rev.id || rIdx, e)}
                                style={{
                                  background: isHelpful ? '#FAF8F5' : '#FFFFFF',
                                  border: isHelpful ? '1px solid #C8935A' : '1px solid #E2E8F0',
                                  color: isHelpful ? '#8C6239' : '#64748B',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  padding: '2px 8px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <span>Helpful ({voteCount})</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Load More Button */}
                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => setVisibleReviewCount(prev => prev + 15)}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1.5px solid #18110C',
                            background: '#FFFFFF',
                            color: '#18110C',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#FAF8F5'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                        >
                          <span>Show More Verified Reviews ({filtered.length - visibleReviewCount} remaining) ↓</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      padding: '1.5rem',
                      background: '#FAF8F5',
                      border: '1px dashed #d5c8b7',
                      borderRadius: '10px',
                      textAlign: 'center',
                      color: '#78716c'
                    }}>
                      <p style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 600, color: '#18110C' }}>
                        No reviews match your selected filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => setFilterRating('all')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#C8935A',
                          fontWeight: 700,
                          fontSize: '0.76rem',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Reset filters to view all {totalCount} reviews
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Section 5: Direct Roaster Assistance Button */}
            <div style={{
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: '12px',
              padding: '1.1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#166534' }}>
                  Still have a doubt about this blend or grind?
                </div>
                <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '2px' }}>
                  Ask our master roaster directly on WhatsApp with this product attached.
                </div>
              </div>

              <button
                onClick={handleWhatsAppRoaster}
                style={{
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.65rem 1.2rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                }}
              >
                <MessageCircle size={16} />
                <span>Chat with Roaster on WhatsApp</span>
              </button>
            </div>

          </div>

        </div>

      </motion.div>

      {/* Fullscreen HD Zoom Lightbox */}
      <AnimatePresence>
        {isImageZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageZoomed(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999999,
              background: 'rgba(12, 9, 7, 0.94)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'zoom-out',
              padding: '1rem'
            }}
          >
            {/* Top Bar with Title and Close Button */}
            <div 
              onClick={(e) => e.stopPropagation()} 
              style={{
                position: 'absolute',
                top: '20px',
                left: '24px',
                right: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#FBF8F3',
                zIndex: 1000000
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, fontFamily: '"Georgia", serif', color: '#E8CA80' }}>
                  {product.name}
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  {currentWeight} • Image {activeImageIndex + 1} of {allImages.length} (Click anywhere to close)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsImageZoomed(false)}
                aria-label="Close Zoom"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '50%',
                  width: '42px',
                  height: '42px',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C8935A';
                  e.currentTarget.style.color = '#18110C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Left Nav Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
                }}
                aria-label="Previous Image"
                style={{
                  position: 'absolute',
                  left: '24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(24, 17, 12, 0.75)',
                  border: '1px solid rgba(200, 147, 90, 0.4)',
                  borderRadius: '50%',
                  width: '52px',
                  height: '52px',
                  color: '#E8CA80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1000000,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C8935A';
                  e.currentTarget.style.color = '#18110C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(24, 17, 12, 0.75)';
                  e.currentTarget.style.color = '#E8CA80';
                }}
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Enlarged Main Image */}
            <motion.div
              key={activeImageIndex}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: '74vh',
                maxWidth: '85vw',
                cursor: 'default'
              }}
            >
              <img
                src={currentImage}
                alt={product.name}
                style={{
                  maxHeight: '74vh',
                  maxWidth: '85vw',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))',
                  userSelect: 'none'
                }}
              />
            </motion.div>

            {/* Right Nav Button */}
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
                }}
                aria-label="Next Image"
                style={{
                  position: 'absolute',
                  right: '24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(24, 17, 12, 0.75)',
                  border: '1px solid rgba(200, 147, 90, 0.4)',
                  borderRadius: '50%',
                  width: '52px',
                  height: '52px',
                  color: '#E8CA80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1000000,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C8935A';
                  e.currentTarget.style.color = '#18110C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(24, 17, 12, 0.75)';
                  e.currentTarget.style.color = '#E8CA80';
                }}
              >
                <ChevronRight size={28} />
              </button>
            )}

            {/* Bottom Miniature Thumbnail Carousel in Zoom Mode */}
            {allImages.length > 1 && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  bottom: '22px',
                  display: 'flex',
                  gap: '10px',
                  background: 'rgba(24, 17, 12, 0.75)',
                  backdropFilter: 'blur(6px)',
                  padding: '6px 14px',
                  borderRadius: '30px',
                  border: '1px solid rgba(200, 147, 90, 0.3)',
                  zIndex: 1000000
                }}
              >
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '6px',
                      border: activeImageIndex === idx ? '2px solid #E8CA80' : '1px solid rgba(255,255,255,0.2)',
                      background: '#FFFFFF',
                      padding: '2px',
                      cursor: 'pointer',
                      transform: activeImageIndex === idx ? 'scale(1.12)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

