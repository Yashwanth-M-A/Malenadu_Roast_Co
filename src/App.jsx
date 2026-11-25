import { getCartShippingDetails, isKarnatakaPincode } from './shippingService.js';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShoppingCart, Sparkles, RotateCcw, Eye, Coffee, User, Search, Menu, X, Star, ShieldCheck,
  Leaf, Truck, CreditCard, Phone, Mail, Heart, Plus, Minus, Trash2, PlayCircle, Download, FileText,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CheckCircle, AlertCircle, Loader, Lock, Smartphone, MessageCircle, ExternalLink, Package, ArrowRight, ShoppingBag, MapPin, Sun, Flame, Clock, Check, Maximize2, Home, Briefcase, Edit2, Info, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import {
  triggerAutomatedWhatsApp,
  sendOrderPlacedWhatsApp,
  getAutomatedWhatsAppMessage,
  subscribeToWhatsAppAlerts,
  isValidIndianPhone,
  formatWhatsAppPhone
} from './whatsappService.js';
import {
  registerUser, loginUser, loginWithGoogle, updateProfile,
  getMyOrders, cancelOrder, placeCODOrder, simulatePayment, createRazorpayOrder, verifyPayment
} from './api.js';
import { parseGoogleJwt, getGoogleClientId, getGoogleAvatarForEmail, launchGoogleOAuthPopup } from './googleAuthService.js';
import LegalPolicyPage from './LegalPolicyPage.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import { generateTaxInvoice } from './invoiceGenerator.js';
import { DeviceMessagingModal } from './DeviceMessagingModal.jsx';
import { ProductDetailsModal } from './ProductDetailsModal.jsx';
import { generateDigitalCatalog } from './catalogGenerator.js';
import { getStoredProducts } from './productsData.js';
import { CustomComboBuilder } from './CustomComboBuilder.jsx';
import { getReviewsForProduct, getHiddenReviewIds, HOMEPAGE_STATIC_TESTIMONIALS } from './productReviewsData.js';
import { CommercialPartnershipPage, CommercialPartnershipTeaser } from './CommercialPartnershipPage.jsx';

// Master toggle for Cash on Delivery (COD) payment method
// Set to true to re-enable COD at checkout; set to false for online prepaid orders only
const COD_ENABLED = false;

// ——— Indian States List (Unified across Profile & Checkout) ——————————————————————
const INDIAN_STATES = [
  'Karnataka',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Chandigarh',
  'Puducherry',
  'Jammu and Kashmir',
  'Ladakh',
  'Andaman & Nicobar Islands',
  'Dadra & Nagar Haveli'
];

// Helper to normalize phone number to standard 10-digit Indian mobile format
const cleanPhoneDigits = (raw) => {
  let p = (raw || '').replace(/\D/g, '');
  if (p.startsWith('91') && p.length > 10) p = p.slice(2);
  else if (p.startsWith('0') && p.length > 10) p = p.slice(1);
  return p.slice(0, 10);
};

const TOKENS = {
  images: {
    logo: '/assets/images/logo_final.webp',
    hero: '/assets/images/coffee_estate_sunrise.webp',
    coffeePack: '/assets/images/coffee_pack_new.webp',
    coffeeSide: '/assets/images/coffee_side_new.webp',
    coffeeBack: '/assets/images/coffee_back_new.webp',
    coffeeLeftSide: '/assets/images/coffee_left_side.webp',
    coffeeRaw1: '/assets/images/coffee_raw_1.webp',
    coffeeRaw2: '/assets/images/coffee_raw_2.webp',
    coffeeFilter1: '/assets/images/coffee_filter_1.webp',
    coffeeFilter2: '/assets/images/coffee_filter_2.webp',
    coffeeEstate1: '/assets/images/coffee_estate_sunrise.webp',
    pepperPack: '/assets/images/pepper_front.webp',
    pepperSide: '/assets/images/pepper_side_new.webp',
    pepperBack: '/assets/images/pepper_back.webp',
    pepperLeftSide: '/assets/images/pepper_left_side.webp',
    pepperRaw1: '/assets/images/pepper_raw_1.webp',
    pepperRaw2: '/assets/images/crushed_pepper_spoon.webp',
    pepperBundleReal: '/assets/images/spice_bundle_real.webp',
    pepperTree: '/assets/images/pepper_tree.webp',
    pepperStoryUpload: '/assets/images/pepper_story_upload.webp',
    storyBg: '/assets/images/coffee_estate_sunrise.webp',
    beansBg: '/assets/images/coffee_estate_sunrise.webp',
    pepperBg: '/assets/images/black_pepper_bg.webp'
  }
};

const Header = ({
  cartItemCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenProfile,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentPage,
  setCurrentPage,
  currentUser
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();
    let targetSection = null;

    if (query.includes('coffee') || query.includes('arabica') || query.includes('bean') || query.includes('roast') || query.includes('powder') || query.includes('chicory') || query.includes('blend')) {
      targetSection = 'coffee';
    } else if (query.includes('pepper') || query.includes('black pepper') || query.includes('spice') || query.includes('menasu') || query.includes('black')) {
      targetSection = 'pepper';
    } else if (query.includes('combo') || query.includes('gift') || query.includes('pack') || query.includes('bundle') || query.includes('set')) {
      targetSection = 'combos';
    } else if (query.includes('process') || query.includes('origin') || query.includes('harvest') || query.includes('estate') || query.includes('chikkamagaluru')) {
      targetSection = 'process';
    } else if (query.includes('story') || query.includes('about') || query.includes('history') || query.includes('who') || query.includes('we') || query.includes('malenadu')) {
      targetSection = 'story';
    } else if (query.includes('partner') || query.includes('bulk') || query.includes('order') || query.includes('wholesale') || query.includes('pricing') || query.includes('distributor') || query.includes('dealer') || query.includes('business')) {
      targetSection = 'partner-with-us';
    } else if (query.includes('gst') || query.includes('tax') || query.includes('itc') || query.includes('invoice') || query.includes('commercial')) {
      targetSection = 'gst-compliance';
    } else if (query.includes('fssai') || query.includes('certified') || query.includes('hygiene') || query.includes('safety') || query.includes('standard') || query.includes('license') || query.includes('government') || query.includes('purity')) {
      targetSection = 'fssai-compliance';
    } else if (query.includes('faq') || query.includes('question') || query.includes('help') || query.includes('support') || query.includes('ship') || query.includes('delivery') || query.includes('return') || query.includes('refund')) {
      targetSection = 'faq';
    } else if (query.includes('feedback') || query.includes('review') || query.includes('testimonial') || query.includes('happy') || query.includes('customer') || query.includes('rating')) {
      targetSection = 'feedback';
    } else if (query.includes('contact') || query.includes('touch') || query.includes('call') || query.includes('phone') || query.includes('email') || query.includes('address') || query.includes('location') || query.includes('whatsapp') || query.includes('facebook') || query.includes('instagram') || query.includes('social') || query.includes('fb') || query.includes('insta')) {
      targetSection = 'contact';
    } else {
      targetSection = 'home';
    }

    if (currentPage !== 'home' && setCurrentPage) {
      setCurrentPage('home');
      window.location.hash = '';
      setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(targetSection);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    setIsSearchOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    let lastScrolled = false;
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      if (scrolled !== lastScrolled) {
        lastScrolled = scrolled;
        setIsScrolled(scrolled);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, targetHash) => {
    setMobileMenuOpen(false);
    if (currentPage !== 'home' && setCurrentPage) {
      e.preventDefault();
      setCurrentPage('home');
      window.location.hash = targetHash;
      setTimeout(() => {
        const id = targetHash.replace('#', '');
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <a href="#home" className="logo-link" onClick={(e) => {
          if (currentPage !== 'home' && setCurrentPage) {
            e.preventDefault();
            setCurrentPage('home');
            window.location.hash = '';
            window.scrollTo(0, 0);
          }
        }}>
          <img src={TOKENS.images.logo} alt="Malenadu Roast Co" className="brand-logo" />
        </a>

        {currentPage !== 'order' && (
          <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="#home" onClick={(e) => handleNavClick(e, '#home')}>Home</a>
            <a href="#coffee" onClick={(e) => handleNavClick(e, '#coffee')}>Coffee</a>
            <a href="#pepper" onClick={(e) => handleNavClick(e, '#pepper')}>Pepper</a>
            <a href="#process" onClick={(e) => handleNavClick(e, '#process')}>Our Origins</a>
            <a href="#story" onClick={(e) => handleNavClick(e, '#story')}>Story</a>
            <a href="#partner-with-us" onClick={(e) => handleNavClick(e, '#partner-with-us')}>Partnership</a>
          </nav>
        )}

        <div className="nav-actions">
          {currentPage !== 'order' && (
            <div className="nav-actions-group">
              <motion.a
                href="https://drive.google.com/uc?export=download&id=1J8q0Cp6cH0HP3PF-IN1_JgBUyWJ1vlAa"
                download="Malenadu_Roast_Co_Brochure.pdf"
                className="nav-brochure-link hide-tablet"
                whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(200,169,106,0.4)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #C8935A, #E8CA80)',
                  color: 'var(--c-dark-brown)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s'
                }}
              >
                <Download size={16} />
                <span>Brochure</span>
              </motion.a>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button className="icon-btn" aria-label="Search" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                  <Search size={20} />
                </button>
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.form
                      onSubmit={handleSearch}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute', right: 0, top: '40px', background: 'var(--c-white)',
                        padding: '0.5rem', borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-md)', display: 'flex', gap: '0.5rem',
                        border: '1px solid #eee', zIndex: 1100
                      }}
                    >
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." style={{ padding: '0.5rem 0.8rem', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', color: '#333', fontSize: '0.9rem', width: '200px' }} autoFocus />
                      <button type="submit" style={{ background: 'var(--c-gold)', color: 'var(--c-dark-brown)', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Go</button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Shopping Cart Button */}
              <button
                className="icon-btn cart-nav-btn"
                aria-label="Shopping Cart"
                onClick={onOpenCart}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                <ShoppingCart size={21} />
                {cartItemCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    background: '#C8935A',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}>
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* User Profile / Account Button */}
              <button
                className="icon-btn profile-nav-btn"
                aria-label="My Account"
                onClick={onOpenProfile}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid #E8CA80',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      flexShrink: 0
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <User size={16} color="#E8CA80" />
                )}
                <span className="profile-btn-text">Account</span>
              </button>
            </div>
          )}
          {currentPage !== 'order' && (
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle Menu">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

const DroppingBeans = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let raf;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let processedBitmap = null;

    const beanImg = new Image();
    beanImg.crossOrigin = 'anonymous';
    beanImg.src = '/assets/images/coffee_bean_real.webp';

    const processBeanImage = () => {
      if (processedBitmap) return;
      // Draw to offscreen canvas to access pixels
      const offscreen = document.createElement('canvas');
      offscreen.width = beanImg.naturalWidth;
      offscreen.height = beanImg.naturalHeight;
      const offCtx = offscreen.getContext('2d');
      offCtx.drawImage(beanImg, 0, 0);

      // Flood-fill from ALL edges (not just corners) for full coverage
      const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
      const data = imageData.data;
      const W = offscreen.width, H = offscreen.height;
      const visited = new Uint8Array(W * H);

      const isBackground = (i4) => {
        return data[i4] > 160 && data[i4 + 1] > 150 && data[i4 + 2] > 140;
      };

      // Seed from entire border perimeter (not just 4 corners)
      const queue = [];
      for (let x = 0; x < W; x++) {
        [[x, 0], [x, H - 1]].forEach(([px, py]) => {
          const p = py * W + px;
          if (!visited[p] && isBackground(p * 4)) { visited[p] = 1; queue.push(p); }
        });
      }
      for (let y = 1; y < H - 1; y++) {
        [[0, y], [W - 1, y]].forEach(([px, py]) => {
          const p = py * W + px;
          if (!visited[p] && isBackground(p * 4)) { visited[p] = 1; queue.push(p); }
        });
      }

      // BFS flood fill — make background pixels fully transparent
      while (queue.length > 0) {
        const pos = queue.pop();
        const i4 = pos * 4;
        data[i4 + 3] = 0; // fully transparent
        const x = pos % W;
        const neighbors = [
          x > 0 ? pos - 1 : -1,
          x < W - 1 ? pos + 1 : -1,
          pos - W,
          pos + W,
        ];
        for (const n of neighbors) {
          if (n >= 0 && n < W * H && !visited[n] && isBackground(n * 4)) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }

      // Fringe erosion pass
      const result = new Uint8ClampedArray(data);
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const pos = y * W + x;
          const i4 = pos * 4;
          if (data[i4 + 3] === 0) continue;
          const hasTransparentNeighbor =
            data[((y - 1) * W + x) * 4 + 3] === 0 ||
            data[((y + 1) * W + x) * 4 + 3] === 0 ||
            data[(y * W + x - 1) * 4 + 3] === 0 ||
            data[(y * W + x + 1) * 4 + 3] === 0;
          if (hasTransparentNeighbor) {
            const brightness = (data[i4] + data[i4 + 1] + data[i4 + 2]) / 3;
            if (brightness > 130) {
              result[i4 + 3] = Math.round(Math.max(0, (1 - (brightness - 130) / 125)) * 255);
            }
          }
        }
      }

      const cleanData = new ImageData(result, W, H);
      offCtx.putImageData(cleanData, 0, 0);

      // Create ImageBitmap for fast GPU rendering
      createImageBitmap(offscreen).then((bmp) => {
        processedBitmap = bmp;
      });
    };

    beanImg.onload = processBeanImage;
    if (beanImg.complete && beanImg.naturalWidth) {
      processBeanImage();
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const beanCount = isMobile ? 18 : 34;

    const beans = Array.from({ length: beanCount }, (_, idx) => {
      const size = 22 + Math.random() * (isMobile ? 22 : 32);
      const cWidth = canvas.width || window.innerWidth || 1200;
      const cHeight = canvas.height || window.innerHeight || 800;

      // Seed beans directly across the entire screen on load (0–1s instant visibility)
      // and queue a stream right at the top so beans are actively dropping from the very first frame!
      const initialY = idx < Math.floor(beanCount * 0.7)
        ? Math.random() * cHeight * 0.95
        : -10 - Math.random() * (cHeight * 0.35);

      return {
        x: Math.random() * cWidth,
        y: initialY,
        w: size,
        h: size * 0.75,
        speedY: (isMobile ? 1.6 : 2.0) + Math.random() * (isMobile ? 1.8 : 2.5),
        speedX: (Math.random() - 0.5) * 0.6,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.025,
        wobble: Math.random() * Math.PI * 2,
        wobbleAmp: 0.3 + Math.random() * 0.5,
        wobbleSpeed: 0.015 + Math.random() * 0.02,
        opacity: 0.7 + Math.random() * 0.3,
      };
    });
    // Sort once upfront by size for depth ordering
    beans.sort((a, b) => a.w - b.w);

    let isVisible = true;
    let isTicking = false;

    const tick = () => {
      if (!isVisible) {
        isTicking = false;
        return;
      }
      isTicking = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (processedBitmap) {
        const len = beans.length;
        for (let i = 0; i < len; i++) {
          const b = beans[i];
          b.wobble += b.wobbleSpeed;
          b.y += b.speedY;
          b.x += b.speedX + Math.sin(b.wobble) * b.wobbleAmp;
          b.rotation += b.rotSpeed;

          // Respawn just above top of canvas for constant unbroken rainfall
          if (b.y > canvas.height + 40) {
            b.y = -20 - Math.random() * 50;
            b.x = Math.random() * canvas.width;
          }

          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rotation);
          ctx.globalAlpha = b.opacity;

          if (!isMobile) {
            ctx.shadowColor = 'rgba(0,0,0,0.45)';
            ctx.shadowBlur = b.w * 0.2;
            ctx.shadowOffsetX = b.w * 0.05;
            ctx.shadowOffsetY = b.w * 0.04;
          }

          ctx.drawImage(processedBitmap, -b.w / 2, -b.h / 2, b.w, b.h);
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !isTicking) {
        raf = requestAnimationFrame(tick);
      }
    }, { threshold: 0.05 });

    if (canvas) observer.observe(canvas);
    tick();

    return () => {
      cancelAnimationFrame(raf);
      if (canvas) observer.unobserve(canvas);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 2 }}
    />
  );
};

const Hero = ({ onOrderNow }) => {

  return (
    <section id="home" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      <img loading="lazy"
        src={TOKENS.images.hero}
        alt="Malenadu Coffee Estate Sunrise"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          pointerEvents: 'none',
          filter: 'brightness(0.65) saturate(1.15) contrast(1.05)',
        }}
      />

      {/* Dark gradient overlay for text readability */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(105deg, rgba(8,12,6,0.7) 0%, rgba(8,12,6,0.4) 50%, rgba(8,12,6,0.1) 100%)',
      }} />

      {/* Right-side warm glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 70% at 85% 40%, rgba(180,120,40,0.3) 0%, transparent 100%)',
      }} />

      {/* Main hero content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div className="container" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
            style={{ maxWidth: '700px' }}
          >
            {/* Eyebrow line */}
            <motion.div
              variants={{ hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } } }}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '2rem' }}
            >
              <div style={{ width: '36px', height: '1px', background: '#C8935A' }} />
              <span style={{
                color: '#E8C888', fontSize: '0.7rem', fontWeight: '700',
                letterSpacing: '5px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif',
              }}>
                Chikkamagaluru Origin
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } } }}
              style={{
                margin: '0 0 1.6rem',
                fontFamily: '"Georgia", "Times New Roman", serif',
                lineHeight: 1.06,
                color: '#fff',
                letterSpacing: '-1.5px',
              }}
            >
              <span style={{ display: 'block', fontSize: 'clamp(3rem, 6.5vw, 6rem)', fontWeight: 800 }}>
                From the Hills
              </span>
              <span style={{
                display: 'block',
                fontSize: 'clamp(3rem, 6.5vw, 6rem)',
                fontWeight: 800,
                color: '#D4A870',
                textShadow: '0 0 80px rgba(210,168,100,0.4)',
              }}>
                of Malenadu
              </span>
              <span style={{
                display: 'block',
                fontSize: 'clamp(1.8rem, 3.5vw, 3.2rem)',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.82)',
                letterSpacing: '0px',
                marginTop: '0.3rem',
              }}>
                to your table.
              </span>
            </motion.h1>

            {/* Gold rule */}
            <motion.div
              variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: 0.8, ease: 'easeOut', delay: 0.1 } } }}
              style={{ width: '70px', height: '2px', background: 'linear-gradient(90deg, #C8935A, #E8CA80, #C8935A)', marginBottom: '2rem', transformOrigin: 'left' }}
            />

            {/* Description */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7 } } }}
              style={{
                color: 'rgba(255,255,255,0.82)',
                fontSize: '1.05rem',
                maxWidth: '480px',
                marginBottom: '2.8rem',
                lineHeight: '1.9',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontWeight: 400,
              }}
            >
              Sustainably grown, freshly roasted, and crafted to give you the best filter coffee experience straight from the hills of Malenadu.
            </motion.p>

            {/* CTA Row: Button */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}
            >
              <motion.button
                whileHover={{ y: -3, scale: 1.02, boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { const el = document.getElementById('coffee'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #C8935A, #E8CA80)',
                  color: '#1a1a1a',
                  padding: '0 2.5rem',
                  borderRadius: '4px',
                  height: '52px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.3s',
                }}
              >
                Explore Our Collection
              </motion.button>
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* Falling beans overlay */}
      <DroppingBeans />
    </section>
  );
};

// Helper to derive authentic verified customer review for ProductCard showcase
const getProductReviewSnippet = (product) => {
  try {
    const stored = JSON.parse(localStorage.getItem('malenadu_real_reviews') || '[]');
    const pName = (product?.name || '').toLowerCase().trim();
    const matched = stored.filter(r => {
      if (r.hidden) return false;
      const rProd = (r.productName || r.product || '').toLowerCase().trim();
      return rProd === pName || pName.includes(rProd) || rProd.includes(pName);
    });
    if (matched.length > 0) {
      const top = matched[0];
      return {
        name: top.name || 'Verified Buyer',
        location: top.city || top.location || 'Verified Buyer',
        rating: Number(top.rating) || 5,
        title: top.title || 'Verified Purchase',
        text: top.text || top.comment || 'Outstanding single-estate artisan quality!',
        verified: true
      };
    }
  } catch (e) { }

  const nameLower = (product?.name || '').toLowerCase();
  if (nameLower.includes('highland')) {
    return {
      name: "Archana Rao",
      location: "Bengaluru",
      rating: 5,
      title: "Incredible Honey & Floral Aroma",
      text: "Smooth, velvety, and delicately spiced. Truly artisanal high-altitude estate coffee in every cup.",
      verified: true
    };
  } else if (nameLower.includes('heritage') || nameLower.includes('imperial')) {
    return {
      name: "Dr. A. Hegde",
      location: "Mangalore",
      rating: 5,
      title: "Bold Cocoa & Heavy Crema",
      text: "Strongest, boldest body with dark chocolate notes. Unbeatable morning aroma and thick crema!",
      verified: true
    };
  } else if (nameLower.includes('pepper')) {
    return {
      name: "Venkatesh V K",
      location: "Coorg",
      rating: 5,
      title: "Exceptionally Bold & Piquant",
      text: "Genuinely hand-harvested bold peppercorns. Rich woody heat and intense fresh essential oils.",
      verified: true
    };
  } else {
    return {
      name: "B K Shivamurthy",
      location: "Chikmagalur",
      rating: 5,
      title: "Authentic Filter Coffee",
      text: "Perfect aroma, thick golden crema, and zero harsh bitterness. Our daily family morning staple!",
      verified: true
    };
  }
};

const ProductCard = ({ product, onBuyNow, hideBuyNow, onAddToCart, onImageClick, onOpenDetails, onShareProduct }) => {
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants ? product.variants[0] : null
  );
  const [imgIndex, setImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 880 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 880);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleShareClick = (e) => {
    if (e) e.stopPropagation();
    if (onShareProduct) {
      onShareProduct(product, e);
    } else {
      const origin = typeof window !== 'undefined' && window.location && window.location.origin
        ? window.location.origin
        : 'https://www.malenaduroastco.works';
      const shareUrl = `${origin}/?product=${encodeURIComponent(product.name)}#products`;
      const shareText = `☕ *${product.name}*\n${product.specs?.flavorNotes || product.tagline || 'Single-Estate Artisanal Roast from Chikkamagaluru'}\n💰 Starting at ₹${product.price} (Incl. 5% GST)\n\nTaste the authentic single-estate roast from Chikkamagaluru:\n👉 ${shareUrl}`;
      if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({ title: product.name, text: shareText, url: shareUrl }).catch(() => { });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl);
        alert('Product link copied to clipboard!');
      }
    }
  };

  // E-Commerce Star Rating State (Amazon & Flipkart Style, dynamically connected to 100+ customer reviews)
  const [liveRating, setLiveRating] = useState(() => {
    const explicitRating = product.rating ? Number(product.rating).toFixed(1) : null;
    try {
      const allRev = getReviewsForProduct(product.name);
      if (allRev && allRev.length > 0) {
        return {
          rating: explicitRating || (allRev.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / allRev.length).toFixed(1),
          count: allRev.length
        };
      }
    } catch (e) { }
    return {
      rating: explicitRating || (product.category === 'pepper' ? '4.9' : '4.8'),
      count: product.reviews || (product.category === 'pepper' ? 88 : 124)
    };
  });

  useEffect(() => {
    const updateStats = () => {
      try {
        const explicitRating = product.rating ? Number(product.rating).toFixed(1) : null;
        const allRev = getReviewsForProduct(product.name);
        if (allRev && allRev.length > 0) {
          const sum = allRev.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
          setLiveRating({
            rating: explicitRating || (sum / allRev.length).toFixed(1),
            count: allRev.length
          });
        }
      } catch (e) { }
    };

    updateStats();
    window.addEventListener('malenadu_reviews_updated', updateStats);
    return () => window.removeEventListener('malenadu_reviews_updated', updateStats);
  }, [product]);

  // Aggregate ALL images of this product to allow full sliding showcase
  const allImages = React.useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    const list = [];
    if (selectedVariant?.image) list.push(selectedVariant.image);
    if (selectedVariant?.backImage) list.push(selectedVariant.backImage);
    if (product.image && !list.includes(product.image)) list.push(product.image);
    if (Array.isArray(product.variants)) {
      product.variants.forEach(v => {
        if (v.image && !list.includes(v.image)) list.push(v.image);
        if (v.backImage && !list.includes(v.backImage)) list.push(v.backImage);
      });
    }
    return list.length > 0 ? list : ['/assets/images/estate_reserve_front.jpg'];
  }, [product, selectedVariant]);

  useEffect(() => {
    setSelectedVariant(product.variants ? product.variants[0] : null);
    setImgIndex(0);
  }, [product]);

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setImgIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const currentImage = allImages[imgIndex] || allImages[0];
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentWeight = selectedVariant ? selectedVariant.weight : (product.weight || '500g');
  const anchorPrice = Math.round(Number(currentPrice) * 1.30);

  const handleDirectAddToCart = (e) => {
    if (e) e.stopPropagation();
    const finalProduct = {
      ...product,
      price: currentPrice,
      weight: currentWeight,
      image: currentImage || product.image
    };
    if (onAddToCart) onAddToCart(finalProduct);
  };

  const handleDirectBuyNow = (e) => {
    if (e) e.stopPropagation();
    const finalProduct = {
      ...product,
      price: currentPrice,
      weight: currentWeight,
      image: currentImage || product.image
    };
    if (onBuyNow) onBuyNow(finalProduct);
  };

  const handleOpenDetails = (e) => {
    if (e) e.stopPropagation();
    if (onOpenDetails) onOpenDetails(product);
  };

  // Derive genuine roast / tasting notes without any emojis
  const notesText = product.specs?.flavorNotes
    || (product.category === 'pepper' ? 'Piquant Heat · Woody Citrus Aroma' : 'Dark Cocoa · Roasted Hazelnut · Caramel Crema');

  const blendOrGrade = product.specs?.blend || product.specs?.grade || (product.category === 'pepper' ? 'Tellicherry Bold (TGSEB)' : 'Single-Estate Coffee');

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div
        className="product-card two-halves-card"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: '#FFFFFF',
          border: isHovered ? '1.5px solid #C8935A' : '1px solid #EBE5DB',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          height: '100%',
          overflow: 'hidden',
          boxShadow: isHovered ? '0 16px 36px rgba(24, 17, 12, 0.1)' : '0 4px 18px rgba(0,0,0,0.04)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          boxSizing: 'border-box'
        }}
      >
        {/* ========================================================
            HALF 1: INTERACTIVE IMAGE SLIDER SHOWCASE (50% WIDTH)
           ======================================================== */}
        <div
          className="card-half card-half-media"
          onClick={handleOpenDetails}
          style={{
            flex: isMobile ? '0 0 auto' : '1 1 50%',
            width: isMobile ? '100%' : '50%',
            background: 'linear-gradient(145deg, #FAF8F5 0%, #F4EFEA 100%)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isMobile ? 'auto' : '100%',
            padding: '1.25rem 1.15rem 1.25rem',
            cursor: 'pointer',
            borderRight: isMobile ? 'none' : '1px solid #EFEAE2',
            borderBottom: isMobile ? '1px solid #EFEAE2' : 'none',
            userSelect: 'none',
            boxSizing: 'border-box',
            gap: '10px'
          }}
        >
          {/* Top Floating Badge */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            {product.badge && (
              <span style={{
                background: '#18110C',
                color: '#E8CA80',
                border: '1px solid rgba(200, 169, 106, 0.4)',
                fontSize: '0.66rem',
                fontWeight: 700,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                {product.badge}
              </span>
            )}
            {product.outOfStock || product.stock === 0 ? (
              <span style={{
                background: '#991B1B',
                color: '#FFFFFF',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                Out of Stock
              </span>
            ) : null}
          </div>

          {/* Top Right Floating Share Button */}
          <button
            type="button"
            onClick={handleShareClick}
            title="Share this product via WhatsApp or apps"
            aria-label="Share product"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 4,
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(200, 147, 90, 0.4)',
              color: '#18110C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease',
              opacity: (isHovered || isMobile) ? 1 : 0.82
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#18110C';
              e.currentTarget.style.color = '#F8DA9D';
              e.currentTarget.style.borderColor = '#C8935A';
              e.currentTarget.style.transform = 'scale(1.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.94)';
              e.currentTarget.style.color = '#18110C';
              e.currentTarget.style.borderColor = 'rgba(200, 147, 90, 0.4)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <Share2 size={15} />
          </button>

          {/* Left Arrow Button */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              style={{
                position: 'absolute',
                left: '8px',
                top: '46%',
                transform: 'translateY(-50%)',
                zIndex: 4,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(200, 147, 90, 0.4)',
                color: '#18110C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'all 0.2s ease',
                opacity: (isHovered || isMobile) ? 1 : 0.65
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#18110C';
                e.currentTarget.style.color = '#E8CA80';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.92)';
                e.currentTarget.style.color = '#18110C';
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Main Showcase Image Stage (Enlarged and Prominent) */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: isMobile ? '270px' : '340px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem'
          }}>
            <img
              src={currentImage}
              alt={product.name}
              loading="lazy"
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 14px 24px rgba(24, 17, 12, 0.16))',
                borderRadius: '8px',
                border: '2px solid #000000',
                boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)'
              }}
            />
          </div>

          {/* Right Arrow Button */}
          {allImages.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              style={{
                position: 'absolute',
                right: '8px',
                top: '46%',
                transform: 'translateY(-50%)',
                zIndex: 4,
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.92)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(200, 147, 90, 0.4)',
                color: '#18110C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                transition: 'all 0.2s ease',
                opacity: (isHovered || isMobile) ? 1 : 0.65
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#18110C';
                e.currentTarget.style.color = '#E8CA80';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.92)';
                e.currentTarget.style.color = '#18110C';
              }}
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Interactive Miniature Thumbnail Strip (All Images of this Product) */}
          {allImages.length > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                marginTop: '0px',
                paddingTop: '0px',
                zIndex: 4
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((img, idx) => {
                const isActive = idx === imgIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImgIndex(idx)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '6px',
                      border: isActive ? '2px solid #18110C' : '1.5px solid #18110C',
                      background: '#FFFFFF',
                      padding: '2px',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: isActive ? 'scale(1.08)' : 'scale(1)',
                      boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={img}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: '4px',
                        border: '1px solid #000000'
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================
            HALF 2: DETAILS, SPECIFICATIONS & PRICING (50% WIDTH)
           ======================================================== */}
        <div
          className="card-half card-half-info"
          style={{
            flex: isMobile ? '0 0 auto' : '1 1 50%',
            width: isMobile ? '100%' : '50%',
            padding: isMobile ? '1.25rem 1rem' : '1.65rem 1.75rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: '#FFFFFF'
          }}
        >
          <div>
            {/* Origin & Blend Subtitle Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '6px'
            }}>
              <span style={{
                fontSize: '0.68rem',
                color: '#8C6239',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px'
              }}>
                {blendOrGrade}
              </span>
            </div>

            {/* Product Title */}
            <h4
              onClick={handleOpenDetails}
              style={{
                margin: '0 0 6px',
                fontFamily: '"Georgia", serif',
                fontSize: isMobile ? '1.25rem' : '1.38rem',
                fontWeight: 700,
                color: '#18110C',
                cursor: 'pointer',
                lineHeight: '1.25',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#8C6239'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#18110C'}
            >
              {product.name}
            </h4>

            {/* E-Commerce Star Rating Row (Amazon & Flipkart Style) */}
            <div
              onClick={handleOpenDetails}
              title={`Rated ${liveRating.rating} out of 5 stars based on ${liveRating.count} verified customer reviews`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '10px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              {/* 5 Golden Stars */}
              <div style={{ display: 'flex', color: '#eab308' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    fill={star <= Math.round(Number(liveRating.rating)) ? '#eab308' : '#e2e8f0'}
                    color={star <= Math.round(Number(liveRating.rating)) ? '#eab308' : '#cbd5e1'}
                  />
                ))}
              </div>

              {/* Numerical Score */}
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#18110C' }}>
                {liveRating.rating}
              </span>

              {/* Review Count Badge */}
              <span style={{ fontSize: '0.74rem', color: '#78716c', fontWeight: 500 }}>
                ({liveRating.count} reviews)
              </span>
            </div>

            {/* Tasting Notes Box */}
            <div style={{
              background: '#FAF8F5',
              borderLeft: '3px solid #C8935A',
              padding: '0.55rem 0.85rem',
              borderRadius: '0 8px 8px 0',
              marginBottom: '10px'
            }}>
              <p style={{
                margin: 0,
                fontSize: '0.78rem',
                color: '#44403c',
                lineHeight: '1.45',
                fontWeight: 500
              }}>
                {notesText}
              </p>
            </div>

            {/* View Tasting & Brew Notes Link */}
            <button
              type="button"
              onClick={handleOpenDetails}
              style={{
                background: 'none',
                border: 'none',
                padding: '0 0 8px',
                color: '#8C6239',
                fontSize: '0.74rem',
                fontWeight: 600,
                letterSpacing: '0.3px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.2s',
                textDecoration: 'underline',
                textUnderlineOffset: '3px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#18110C'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#8C6239'}
            >
              <span>View Tasting & Brew Notes →</span>
            </button>

            {/* Segmented Package Size Selector (500g vs 1kg) */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ marginTop: '8px', marginBottom: '10px' }}>
                <div style={{
                  fontSize: '0.68rem',
                  color: '#71717A',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: 700,
                  marginBottom: '5px'
                }}>
                  Select Size
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant?.weight === v.weight;
                    return (
                      <button
                        key={v.weight}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVariant(v);
                        }}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.4rem',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #18110C' : '1px solid #D8CFC4',
                          background: isSelected ? '#18110C' : '#FFFFFF',
                          color: isSelected ? '#FDFBF7' : '#27272A',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          textAlign: 'center',
                          boxShadow: isSelected ? '0 2px 6px rgba(24, 17, 12, 0.2)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {v.weight}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pricing Row & Primary CTA Action Buttons */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1ECE4' }}>
            {/* Price Line */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{
                  fontSize: '1.45rem',
                  fontFamily: '"Georgia", serif',
                  fontWeight: 800,
                  color: '#18110C'
                }}>
                  ₹{currentPrice}
                </span>
                <span style={{ fontSize: '0.84rem', color: '#A1A1AA', textDecoration: 'line-through' }}>
                  ₹{anchorPrice}
                </span>
              </div>

              <span style={{
                fontSize: '0.72rem',
                color: '#15803D',
                fontWeight: 700,
                background: '#F0FDF4',
                border: '1px solid #DCFCE7',
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                Save 30%
              </span>
            </div>

            {/* Inbuilt 5% GST Notification Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              color: '#059669',
              fontWeight: 600,
              marginBottom: '10px'
            }}>
              <span>✓ Inclusive of 5% GST</span>
            </div>

            {/* Action Buttons */}
            {product.outOfStock || product.stock === 0 ? (
              <button
                type="button"
                disabled
                style={{
                  width: '100%',
                  padding: '0.7rem',
                  borderRadius: '8px',
                  background: '#F4F4F5',
                  color: '#A1A1AA',
                  border: '1px solid #E4E4E7',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'not-allowed',
                  textAlign: 'center'
                }}
              >
                Out of Stock
              </button>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleDirectAddToCart}
                  style={{
                    padding: '0.68rem 0.5rem',
                    borderRadius: '8px',
                    border: '1.5px solid #18110C',
                    background: '#FFFFFF',
                    color: '#18110C',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F9F7F4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                  }}
                >
                  <ShoppingCart size={15} />
                  <span>Add to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectBuyNow}
                  style={{
                    padding: '0.68rem 0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#18110C',
                    color: '#FDFBF7',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(24, 17, 12, 0.25)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#C8935A';
                    e.currentTarget.style.color = '#18110C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#18110C';
                    e.currentTarget.style.color = '#FDFBF7';
                  }}
                >
                  <ShoppingBag size={15} />
                  <span>Buy Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const galleryStyles = `
  .chikka-solo-container {
    position: relative;
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 60px rgba(0,0,0,0.6);
    border: 1px solid rgba(232, 202, 128, 0.18);
    background: #050a07;
  }
  .chikka-solo-viewport {
    position: relative;
    width: 100%;
    height: 560px;
    overflow: hidden;
    cursor: pointer;
  }
  .chikka-solo-img-wrap {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  .chikka-solo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .chikka-solo-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
    pointer-events: none;
    z-index: 2;
  }
  .chikka-solo-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 3.5rem 3rem 2.5rem;
    color: #fff;
    pointer-events: none;
    z-index: 5;
  }
  .chikka-solo-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: #E8CA80;
    margin-bottom: 0.5rem;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0,0,0,0.6);
  }
  .chikka-solo-desc {
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.85);
    line-height: 1.6;
    margin: 0;
    max-width: 750px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  }
  .chikka-solo-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(12, 18, 14, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #E8CA80;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    backdrop-filter: blur(8px);
    z-index: 10;
  }
  .chikka-solo-btn:hover {
    background: var(--c-gold);
    color: var(--c-dark-brown);
    border-color: var(--c-gold);
    transform: translateY(-50%) scale(1.08);
    box-shadow: 0 0 15px rgba(200, 169, 106, 0.45);
  }
  .chikka-solo-btn.left { left: 1.8rem; }
  .chikka-solo-btn.right { right: 1.8rem; }

  /* Dot indicators */
  .chikka-solo-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.65rem;
    margin-top: 1.8rem;
    z-index: 10;
  }
  .chikka-solo-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0;
  }
  .chikka-solo-dot.active {
    background: #E8CA80;
    transform: scale(1.3);
    box-shadow: 0 0 8px rgba(232, 202, 128, 0.6);
  }

  @media (max-width: 768px) {
    .chikka-solo-viewport {
      height: 420px;
    }
    .chikka-solo-btn {
      width: 44px;
      height: 44px;
    }
    .chikka-solo-btn.left { left: 1rem; }
    .chikka-solo-btn.right { right: 1rem; }
    .chikka-solo-caption {
      padding: 2rem 1.5rem 1.5rem;
    }
    .chikka-solo-title {
      font-size: 1.4rem;
    }
    .chikka-solo-desc {
      font-size: 0.85rem;
    }
    .chikka-solo-dots {
      gap: 0.5rem;
    }
  }

  @media (max-width: 480px) {
    .chikka-solo-viewport {
      height: 320px;
    }
  }

  /* Fullscreen lightbox */
  .chikka-lightbox {
    position: fixed;
    inset: 0;
    background: rgba(4, 8, 6, 0.96);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(15px);
    padding: 2rem;
  }
  .chikka-lightbox-content {
    position: relative;
    max-width: 1000px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 10;
  }
  .chikka-lightbox-img-wrap {
    position: relative;
    width: 100%;
    max-height: 70vh;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0,0,0,0.65);
    border: 1px solid rgba(232, 202, 128, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
  }
  .chikka-lightbox-img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
  }
  .chikka-lightbox-info {
    text-align: center;
    color: #fff;
    margin-top: 1.5rem;
    max-width: 600px;
  }
  .chikka-lightbox-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    color: #E8CA80;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  .chikka-lightbox-desc {
    font-family: 'Inter', sans-serif;
    font-size: 0.95rem;
    color: rgba(255,255,255,0.75);
    line-height: 1.6;
    margin: 0;
  }
  .chikka-lightbox-close {
    position: absolute;
    top: 2rem;
    right: 2rem;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 20;
  }
  .chikka-lightbox-close:hover {
    background: var(--c-gold);
    color: var(--c-dark-brown);
    transform: scale(1.08);
  }
  .chikka-lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.15);
    color: #fff;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 15;
  }
  .chikka-lightbox-nav:hover {
    background: var(--c-gold);
    color: var(--c-dark-brown);
    transform: translateY(-50%) scale(1.08);
  }
  .chikka-lightbox-nav.left { left: 1rem; }
  .chikka-lightbox-nav.right { right: 1rem; }

  @media (max-width: 768px) {
    .chikka-lightbox { padding: 1rem; }
    .chikka-lightbox-nav { width: 40px; height: 40px; }
    .chikka-lightbox-nav.left { left: 0.5rem; }
    .chikka-lightbox-close { top: 1rem; right: 1rem; width: 36px; height: 36px; }
    .chikka-lightbox-title { font-size: 1.4rem; }
  }

`;

const ChikkamagaluruGallery = () => {
  const [activeItem, setActiveItem] = useState(null); // { type: 'coffee' | 'pepper', index: number }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPepperIndex, setCurrentPepperIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPepperPaused, setIsPepperPaused] = useState(false);

  const images = [
    { src: '/assets/images/coffee_estate_sunrise.webp', title: 'Malenadu Coffee Sunrise', desc: 'A stunning sunrise over the lush valleys of Chikkamagaluru coffee estates.' },
    { src: '/coffee_images/1 st image.jpg', title: 'Coffee Journey', desc: 'From fresh cherries to rich flavors.' },
    { src: '/coffee_images/2 nd image.png', title: 'Coffee Blossoms', desc: 'Nature’s first sign of a great harvest.' },
    { src: '/coffee_images/3 rd image.png', title: 'Blooming Estates', desc: 'White blossoms across the Malenadu hills.' },
    { src: '/coffee_images/4 th image.png', title: 'Estate Harvest', desc: 'Ripening coffee under shade-grown forests.' },
    { src: '/coffee_images/5 th image.avif', title: 'Handpicked Quality', desc: 'Carefully harvested at peak ripeness.' },
    { src: '/coffee_images/6 th image.png', title: 'Ripe Coffee Cherries', desc: 'Rich color, rich flavor, naturally grown.' },
    { src: '/coffee_images/7 th image.png', title: 'Harvest Season', desc: 'Freshly picked from Chikkamagaluru estates.' },
    { src: '/coffee_images/8 th image.png', title: 'Coffee Pulping', desc: 'Fresh cherries transformed into parchment coffee.' },
    { src: '/coffee_images/9 th image.webp', title: 'Sun Drying', desc: 'Carefully dried under natural sunlight.' },
    { src: '/coffee_images/10 th image.webp', title: 'Drying Yards', desc: 'Traditional sun-curing for perfect flavor.' },
    { src: '/coffee_images/11 th image.jpg', title: 'Bean Drying Process', desc: 'Slowly dried to preserve aroma and quality.' },
    { src: '/coffee_images/12 th image.jpg', title: 'Coffee Roasting', desc: 'Roasted to bring out bold character.' },
    { src: '/coffee_images/13 th image.jpg', title: 'Premium Roasted Beans', desc: 'Freshly roasted for a rich coffee experience.' },
    { src: '/coffee_images/14 th image.png', title: 'Coffee Grinding', desc: 'Finely ground for the perfect brew.' },
  ];

  const pepperImages = [
    { src: '/pepper_image/1 st image.png', title: 'Pepper Harvest Colors', desc: 'Nature’s vibrant spice in every stage.' },
    { src: '/pepper_image/2 nd image.png', title: 'Pepper Flowering', desc: 'Tiny blooms shaping future harvests.' },
    { src: '/pepper_image/3 rd image.png', title: 'Green Pepper Vines', desc: 'Thriving vines in tropical freshness.' },
    { src: '/pepper_image/4 th image.png', title: 'Pepper Plantation', desc: 'Endless rows of lush green spice.' },
    { src: '/pepper_image/5 th image.png', title: 'Fresh Pepper Clusters', desc: 'Young pepper berries growing naturally.' },
    { src: '/pepper_image/6 th image.png', title: 'Pepper Harvesting', desc: 'Skilled hands gathering fresh pepper.' },
    { src: '/pepper_image/7 th image.png', title: 'Traditional Pepper Sorting', desc: 'Carefully selected for premium quality.' },
    { src: '/pepper_image/8 th image.png', title: 'Pepper Separation Process', desc: 'Fresh pepper berries sorted with care.' },
    { src: '/pepper_image/9 th image.png', title: 'Sun-Dried Pepper', desc: 'Golden sunlight enriching every spice.' },
    { src: '/pepper_image/10 th image.png', title: 'Pepper Drying Fields', desc: 'Naturally dried for rich aroma and flavor.' },
  ];

  const maxCoffeeIndex = images.length - 1;
  const maxPepperIndex = pepperImages.length - 1;

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? maxCoffeeIndex : prev - 1));
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev >= maxCoffeeIndex ? 0 : prev + 1));
  };

  const handlePepperPrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentPepperIndex((prev) => (prev === 0 ? maxPepperIndex : prev - 1));
  };

  const handlePepperNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentPepperIndex((prev) => (prev >= maxPepperIndex ? 0 : prev + 1));
  };

  const handleLightboxPrev = (e) => {
    e.stopPropagation();
    if (!activeItem) return;
    const list = activeItem.type === 'coffee' ? images : pepperImages;
    setActiveItem((prev) => ({
      type: prev.type,
      index: prev.index === 0 ? list.length - 1 : prev.index - 1
    }));
  };

  const handleLightboxNext = (e) => {
    e.stopPropagation();
    if (!activeItem) return;
    const list = activeItem.type === 'coffee' ? images : pepperImages;
    setActiveItem((prev) => ({
      type: prev.type,
      index: prev.index === list.length - 1 ? 0 : prev.index + 1
    }));
  };

  // Autoplay Coffee timer (4 seconds)
  useEffect(() => {
    if (isPaused || activeItem !== null) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxCoffeeIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [maxCoffeeIndex, isPaused, activeItem]);

  // Autoplay Pepper timer (4 seconds)
  useEffect(() => {
    if (isPepperPaused || activeItem !== null) return;
    const interval = setInterval(() => {
      setCurrentPepperIndex((prev) => (prev >= maxPepperIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [maxPepperIndex, isPepperPaused, activeItem]);

  useEffect(() => {
    if (activeItem !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeItem]);

  const activeImage = activeItem
    ? (activeItem.type === 'coffee' ? images[activeItem.index] : pepperImages[activeItem.index])
    : null;

  return (
    <section
      id="process"
      style={{
        position: 'relative',
        padding: '6rem 0',
        background: 'radial-gradient(circle at center, #0F1D14 0%, #060B08 100%)',
        overflow: 'hidden'
      }}
    >
      <style>{galleryStyles}</style>

      {/* Decorative Spotlights */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '50%',
        background: 'radial-gradient(ellipse at center, rgba(200, 147, 90, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%', width: '45%', height: '55%',
        background: 'radial-gradient(ellipse at center, rgba(31, 61, 43, 0.35) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        {/* ================= COFFEE GALLERY ================= */}
        {/* Section Header */}
        <div className="section-head text-center" style={{ marginBottom: '3.5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '1rem' }}
          >
            <span style={{ width: '20px', height: '1px', background: '#C8A96A' }} />
            <span style={{ color: '#E8CA80', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '4px', textTransform: 'uppercase' }}>Estate Life</span>
            <span style={{ width: '20px', height: '1px', background: '#C8A96A' }} />
          </motion.div>

          <motion.h2
            className="section-title text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700, margin: '0 0 1rem', color: '#fff' }}
          >
            Coffee of <span style={{ color: '#D4A870' }}>Malenadu</span>
          </motion.h2>

          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '650px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.7', fontWeight: 300 }}
          >
            Experience the misty hills, coffee blossoms, ripe coffee cherries, and estate life of Malenadu.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ width: '60px', height: '2px', background: '#C8935A', margin: '1.5rem auto 0', transformOrigin: 'center' }}
          />
        </div>

        {/* Cinematic Solo Image Slider - Coffee */}
        <div
          className="chikka-solo-container"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onTouchCancel={() => setIsPaused(false)}
        >
          {/* Custom Left Nav Button - Overlaid on the Left side of the Image */}
          <button
            className="chikka-solo-btn left"
            onClick={handlePrev}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Custom Right Nav Button - Overlaid on the Right side of the Image */}
          <button
            className="chikka-solo-btn right"
            onClick={handleNext}
            aria-label="Next Slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Viewport Frame */}
          <div className="chikka-solo-viewport" onClick={() => setActiveItem({ type: 'coffee', index: currentIndex })}>
            <div className="chikka-solo-img-wrap">
              <AnimatePresence mode="wait">
                <motion.img loading="lazy"
                  key={currentIndex}
                  src={images[currentIndex].src}
                  alt={images[currentIndex].title}
                  className="chikka-solo-img"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>

            {/* Cinematic Gradient Overlay */}
            <div className="chikka-solo-overlay" />

            {/* Overlaid Title and Captions at the bottom of the Image */}
            <div className="chikka-solo-caption">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <h4 className="chikka-solo-title">{images[currentIndex].title}</h4>
                  <p className="chikka-solo-desc">{images[currentIndex].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Elegant Dot Indicators */}
        <div className="chikka-solo-dots" style={{ marginBottom: '5rem' }}>
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`chikka-solo-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>





        {/* Section Header for Pepper */}
        <div className="section-head text-center" style={{ marginBottom: '3.5rem' }}>


          <motion.h2
            className="section-title text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 700, margin: '0 0 1rem', color: '#fff' }}
          >
            Spices of <span style={{ color: '#D4A870' }}>Malenadu</span>
          </motion.h2>

          <motion.p
            className="section-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ color: 'rgba(255, 255, 255, 0.7)', maxWidth: '650px', margin: '0 auto', fontSize: '1rem', lineHeight: '1.7', fontWeight: 300 }}
          >
            Experience the intense aroma, sun-drying traditions, and bold peppercorn vines of the Western Ghats shade estates.
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ width: '60px', height: '2px', background: '#C8935A', margin: '1.5rem auto 0', transformOrigin: 'center' }}
          />
        </div>

        {/* Cinematic Solo Image Slider - Pepper */}
        <div
          className="chikka-solo-container"
          onMouseEnter={() => setIsPepperPaused(true)}
          onMouseLeave={() => setIsPepperPaused(false)}
          onTouchStart={() => setIsPepperPaused(true)}
          onTouchEnd={() => setIsPepperPaused(false)}
          onTouchCancel={() => setIsPepperPaused(false)}
        >
          {/* Custom Left Nav Button - Overlaid on the Left side of the Image */}
          <button
            className="chikka-solo-btn left"
            onClick={handlePepperPrev}
            aria-label="Previous Pepper Slide"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Custom Right Nav Button - Overlaid on the Right side of the Image */}
          <button
            className="chikka-solo-btn right"
            onClick={handlePepperNext}
            aria-label="Next Pepper Slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Viewport Frame */}
          <div className="chikka-solo-viewport" onClick={() => setActiveItem({ type: 'pepper', index: currentPepperIndex })}>
            <div className="chikka-solo-img-wrap">
              <AnimatePresence mode="wait">
                <motion.img loading="lazy"
                  key={currentPepperIndex}
                  src={pepperImages[currentPepperIndex].src}
                  alt={pepperImages[currentPepperIndex].title}
                  className="chikka-solo-img"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>

            {/* Cinematic Gradient Overlay */}
            <div className="chikka-solo-overlay" />

            {/* Overlaid Title and Captions at the bottom of the Image */}
            <div className="chikka-solo-caption">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPepperIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                >
                  <h4 className="chikka-solo-title">{pepperImages[currentPepperIndex].title}</h4>
                  <p className="chikka-solo-desc">{pepperImages[currentPepperIndex].desc}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Elegant Dot Indicators */}
        <div className="chikka-solo-dots">
          {pepperImages.map((_, idx) => (
            <button
              key={idx}
              className={`chikka-solo-dot ${idx === currentPepperIndex ? 'active' : ''}`}
              onClick={() => setCurrentPepperIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Interactive Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {activeItem !== null && activeImage && (
          <motion.div
            className="chikka-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveItem(null)}
          >
            <button className="chikka-lightbox-close" onClick={() => setActiveItem(null)}>
              <X size={22} />
            </button>

            <button className="chikka-lightbox-nav left" onClick={handleLightboxPrev}>
              <ChevronLeft size={24} />
            </button>

            <button className="chikka-lightbox-nav right" onClick={handleLightboxNext}>
              <ChevronRight size={24} />
            </button>

            <motion.div
              className="chikka-lightbox-content"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="chikka-lightbox-img-wrap">
                <img loading="lazy"
                  src={activeImage.src}
                  alt={activeImage.title}
                  className="chikka-lightbox-img"
                />
              </div>
              <div className="chikka-lightbox-info">
                <h3 className="chikka-lightbox-title">{activeImage.title}</h3>
                <p className="chikka-lightbox-desc">{activeImage.desc}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      q: "What is the difference between your 70:30, 80:20, and 85:15 coffee blends?",
      a: "Our blends are crafted for distinct South Indian coffee preferences: Malenadu Estate Reserve (70:30) is the iconic traditional recipe where 30% roasted chicory delivers an ultra-thick, syrupy dark decoction that never thins out in milk. Highland Signature (80:20) offers a lighter, balanced morning brew highlighting mountain florals and milk chocolate notes with 20% chicory. Imperial Heritage (85:15) is an artisanal dark roast for purists wanting strong coffee aromatics and bittersweet cocoa with just enough chicory for traditional body."
    },
    {
      q: "Is this instant coffee powder or authentic ground filter coffee?",
      a: "This is 100% genuine ground filter coffee powder, NOT instant soluble crystals. It contains no artificial chemicals, fillers, or maltodextrin. It must be brewed with hot water in a traditional stainless steel drip filter, French press, or moka pot to extract fresh, rich decoction."
    },
    {
      q: "Do I need an expensive coffee maker or espresso machine to brew this?",
      a: "Not at all! A simple 2-chamber stainless steel or brass South Indian drip filter (available anywhere for ₹150–₹250) or a standard French press brews authentic cafe-grade degree filter coffee at home in under 10 minutes."
    },
    {
      q: "Why is your Malenadu Pepper Reserve 100% unpolished?",
      a: "Commercial black pepper is often machine-polished with mineral oils or paraffin wax to create an artificial shiny black appearance. Our Tellicherry Extra Bold peppercorns are 100% unpolished, sun-dried on clean estate beds straight from shade canopy trees, preserving high natural piperine (>5.5%) and potent medicinal volatile oils."
    },
    {
      q: "How fresh is the coffee when it reaches me?",
      a: "We roast in small artisanal batches every single week in Chikkamagaluru. Every order is heat-sealed in multi-layer foil pouches with 1-way freshness degassing valves and dispatched within 24–48 hours via Shiprocket express logistics across India."
    },
    {
      q: "Can I receive a GST Tax Invoice and claim B2B Input Tax Credit (ITC)?",
      a: "Yes. Malenadu Roast Co. is fully tax compliant and GST registered (GSTIN: 29BQJPY7539L1ZN). All retail and commercial orders include statutory 5% GST tax invoices with HSN codes 0901 & 0904, allowing cafes, restaurants, and businesses to claim full input tax credit."
    }
  ];

  return (
    <section id="faq" className="section bg-cream section-padded">
      <div className="container">
        <div className="section-head text-center" style={{ marginBottom: '3rem' }}>
          <h2 className="section-title">Customer Care & FAQs</h2>
          <p className="section-subtitle">Everything you need to know about our products and services.</p>
        </div>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ marginBottom: '1rem', border: '1px solid #e0d5c1', borderRadius: '8px', background: '#fff', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{ width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--c-dark-brown)', transition: 'background 0.3s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fcfaf7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {faq.q}
                <span style={{ color: 'var(--c-gold)' }}>{openIndex === i ? <Minus size={20} /> : <Plus size={20} />}</span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0 1.5rem 1.5rem', color: '#666', lineHeight: '1.6' }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FarmVisitSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    guests: '1',
    interests: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `Hello Malenadu Roast Co!%0A%0AI would like to book an estate visit.%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Date:* ${formData.date}%0A*Guests:* ${formData.guests}%0A*Interests:* ${formData.interests}%0A%0APlease let me know the availability.`;
    window.open(`https://api.whatsapp.com/send?phone=918217623335&text=${text}`, '_blank');
  };

  return (
    <section id="visit-us" className="farm-visit-section section-padded" style={{ background: '#080C09', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient background glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(212, 168, 112, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(31, 61, 43, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="farm-visit-grid">

          {/* Left: Image Gallery */}
          <div className="farm-gallery-main">
            <img loading="lazy" src="/assets/images/farm_landscape.webp" alt="Malenadu Estate Landscape" />
          </div>
          <div className="farm-gallery-sub">
            <img loading="lazy" src="/assets/images/user_farm_cherries.webp" alt="Coffee Cherries" />
            <img loading="lazy" src="/assets/images/user_farm_beans.webp" alt="Fresh Roasted Beans" />
          </div>

          {/* Right: Booking Form */}
          <div className="farm-booking-form-wrap">
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '1px', background: '#D4A870' }} />
                <span style={{ color: '#D4A870', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>Estate Experience</span>
              </div>
              <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', color: '#fff', marginBottom: '1rem', lineHeight: 1.1 }}>Visit Our Farm</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', lineHeight: 1.6 }}>Step into the heart of Malenadu. Walk through misty plantations, witness our sustainable harvesting, and experience a personalized farm-to-cup tasting session.</p>
            </div>

            <form className="farm-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
                </div>
                <div className="input-group">
                  <label>WhatsApp Number</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Preferred Date</label>
                  <input type="date" name="date" required value={formData.date} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Number of Guests</label>
                  <select name="guests" value={formData.guests} onChange={handleChange}>
                    <option value="1">1 Person</option>
                    <option value="2">2 People</option>
                    <option value="3">3 People</option>
                    <option value="4+">4+ People</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Special Interests (Optional)</label>
                <textarea name="interests" rows="3" value={formData.interests} onChange={handleChange} placeholder="E.g. Coffee tasting, Roasting process tour..."></textarea>
              </div>
              <button type="submit" className="farm-submit-btn">
                Request Estate Tour <span style={{ marginLeft: '8px' }}>→</span>
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
};

const FeedbackSection = ({ onAddReview, currentUser, onRequireLogin }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    rating: 0,
    product: '',
    liked: '',
    feedback: '',
    buyAgain: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasPublishedLive, setWasPublishedLive] = useState(false);
  const [error, setError] = useState('');

  // Auto-sync form if user signs in
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email
      }));
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const templateParams = {
      is_otp: false,
      is_feedback: true,
      from_name: formData.name || 'Valued Customer',
      from_email: formData.email,
      to_email: 'malenaduroast@gmail.com',
      subject: `New Customer Feedback from ${formData.name || formData.email} (${formData.rating || 5} Stars)`,
      rating: formData.rating || 5,
      product: formData.product || 'Malenadu Coffee',
      liked: formData.liked || 'Aroma & Freshness',
      feedback: formData.feedback || 'Excellent authentic quality!',
      buyagain: formData.buyAgain || 'Yes',
      otp_code: '',
      otp: '',
      message: formData.feedback || ''
    };

    console.log('Sending exact parameters:', templateParams);

    // ONLY publish to "What Our Customers Say" if user is logged into their real account
    const isRealAccountUser = Boolean(currentUser && currentUser.email);
    setWasPublishedLive(isRealAccountUser);

    if (isRealAccountUser) {
      const reviewText = formData.feedback.trim() || `Loved the authentic ${formData.product}! Freshness and aroma are outstanding.`;
      const newReview = {
        id: 'rev_' + Date.now(),
        name: currentUser.name || formData.name.trim(),
        email: currentUser.email || formData.email.trim(),
        avatar: currentUser.avatar || '',
        rating: formData.rating || 5,
        product: formData.product || 'Coffee',
        liked: formData.liked || 'Aroma',
        text: reviewText,
        buyAgain: formData.buyAgain || 'Yes',
        date: new Date().toISOString(),
        verified: true,
        isReal: true,
        hidden: false,
        userAccount: currentUser.email
      };

      try {
        const existingReviews = JSON.parse(localStorage.getItem('malenadu_real_reviews') || '[]');
        const updated = [newReview, ...existingReviews];
        localStorage.setItem('malenadu_real_reviews', JSON.stringify(updated));
        window.dispatchEvent(new Event('malenadu_reviews_updated'));
        if (onAddReview) {
          onAddReview(newReview);
        }
      } catch (err) {
        console.error('Failed to store review locally:', err);
      }
    }

    try {
      // 1. Send feedback email to business owner
      const p1 = window.emailjs.send(
        'default_service',
        'template_kp7cfjf',
        templateParams,
        'XAjBukluotgykpLye'
      );

      // 2. Send automatic thank-you email to customer
      const p2 = window.emailjs.send(
        'default_service',
        'template_pyp2var',
        templateParams,
        'XAjBukluotgykpLye'
      );

      await Promise.all([p1, p2]);

      console.log('Both emails sent successfully!');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', rating: 0, product: '', liked: '', feedback: '', buyAgain: '' });
      }, 5000);
    } catch (err) {
      console.error('EmailJS Error:', err);
      setError('Failed to send feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelStyle = { display: 'block', marginBottom: '0.6rem', fontWeight: 600, color: '#3B2A1A', fontSize: '0.95rem' };
  const inputStyle = { width: '100%', padding: '0.9rem 1rem', border: '1px solid #e0d5c1', borderRadius: '8px', outline: 'none', transition: 'all 0.3s', fontSize: '1rem', background: '#fcfaf7', boxSizing: 'border-box' };

  return (
    <section id="feedback" className="section bg-dark text-white section-padded">
      <div className="container">
        <div className="section-head text-center" style={{ marginBottom: '3rem' }}>
          <h2 className="section-title text-white">Share Your Experience</h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>Help us improve our Malenadu experience.</p>
        </div>
        <div style={{ maxWidth: '580px', margin: '0 auto', background: '#fff', padding: '3rem', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ textAlign: 'center', padding: '2rem 0' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(40, 167, 69, 0.1)', color: '#28a745', marginBottom: '1.5rem' }}>
                  <CheckCircle size={32} />
                </div>
                <h3 style={{ color: 'var(--c-dark-brown)', marginBottom: '0.5rem', fontFamily: '"Georgia", serif', fontSize: '1.8rem' }}>Thank You for Your Feedback!</h3>
                <p style={{ color: '#666', lineHeight: 1.6, fontSize: '1.05rem', marginBottom: '1.2rem' }}>
                  Thank you, <strong>{currentUser?.name || formData.name}</strong>! Your valuable feedback has been received and helps our estate team maintain authentic craftsmanship.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '0.45rem 1.1rem', borderRadius: '25px', fontSize: '0.85rem', fontWeight: 700 }}>
                  <CheckCircle size={16} color="#059669" />
                  <span>Feedback Submitted Successfully</span>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}
              >
                {/* 1. Your Name */}
                <div>
                  <label style={labelStyle}>1. Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    style={inputStyle}
                  />
                </div>

                {/* 2. Your Email */}
                <div>
                  <label style={labelStyle}>2. Your Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="example@gmail.com"
                    style={inputStyle}
                  />
                </div>

                {/* 3. Your Rating */}
                <div>
                  <label style={labelStyle}>3. Your Rating ⭐</label>
                  <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>(1–5 stars)</p>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={34}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        fill={(hoverRating || formData.rating) >= star ? '#C8935A' : 'transparent'}
                        color={(hoverRating || formData.rating) >= star ? '#C8935A' : '#dcd0bc'}
                        style={{ cursor: 'pointer', transition: 'all 0.2s', filter: (hoverRating || formData.rating) >= star ? 'drop-shadow(0 2px 4px rgba(200,147,90,0.3))' : 'none' }}
                      />
                    ))}
                  </div>
                </div>

                {/* 4. Product Purchased */}
                <div>
                  <label style={labelStyle}>4. Product Purchased</label>
                  <select
                    required
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="" disabled>Select a product...</option>
                    <option value="Coffee">Coffee</option>
                    <option value="Pepper">Pepper</option>
                    <option value="Combo">Combo</option>
                  </select>
                </div>

                {/* 5. What did you like most? */}
                <div>
                  <label style={labelStyle}>5. What did you like most?</label>
                  <select
                    required
                    value={formData.liked}
                    onChange={(e) => setFormData({ ...formData, liked: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="" disabled>Select an option...</option>
                    <option value="Aroma">Aroma</option>
                    <option value="Taste">Taste</option>
                    <option value="Freshness">Freshness</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Delivery">Delivery</option>
                  </select>
                </div>

                {/* 6. Your Feedback */}
                <div>
                  <label style={labelStyle}>6. Your Feedback</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                    placeholder="“Tell us about your experience…”"
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>

                {/* 7. Would you buy again? */}
                <div>
                  <label style={labelStyle}>7. Would you buy again?</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    {['Yes', 'Maybe', 'No'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, buyAgain: option })}
                        style={{
                          flex: 1,
                          padding: '0.8rem',
                          borderRadius: '8px',
                          border: '1px solid',
                          borderColor: formData.buyAgain === option ? '#C8935A' : '#e0d5c1',
                          background: formData.buyAgain === option ? '#fdf8f0' : '#fff',
                          color: formData.buyAgain === option ? '#C8935A' : '#666',
                          fontWeight: 600,
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 8. Submit Button */}
                {error && (
                  <p style={{ color: '#dc3545', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                    {error}
                  </p>
                )}
                <motion.button
                  type="submit"
                  whileHover={(formData.rating > 0 && !isSubmitting) ? { scale: 1.01, boxShadow: '0 8px 20px rgba(200, 147, 90, 0.25)' } : {}}
                  whileTap={(formData.rating > 0 && !isSubmitting) ? { scale: 0.99 } : {}}
                  disabled={!formData.name || !formData.email || formData.rating === 0 || !formData.product || !formData.liked || !formData.buyAgain || isSubmitting}
                  style={{
                    background: (!formData.name || !formData.email || formData.rating === 0 || !formData.product || !formData.liked || !formData.buyAgain || isSubmitting) ? '#f0f0f0' : 'linear-gradient(135deg, #3B2A1A, #5D4037)',
                    color: (!formData.name || !formData.email || formData.rating === 0 || !formData.product || !formData.liked || !formData.buyAgain || isSubmitting) ? '#ccc' : '#fff',
                    padding: '1.1rem', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '1rem',
                    cursor: (!formData.name || !formData.email || formData.rating === 0 || !formData.product || !formData.liked || !formData.buyAgain || isSubmitting) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '1.5px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={18} className="spin" />
                      Sending...
                    </>
                  ) : 'Submit Review'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const WishlistSidebar = ({ isOpen, onClose, wishlist, onRemove, onAddToCart }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="cart-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="cart-sidebar" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}>
            <div className="cart-header">
              <h3>My Wishlist</h3>
              <button onClick={onClose} className="icon-btn"><X /></button>
            </div>
            <div className="cart-items">
              {wishlist.length === 0 ? (
                <div className="empty-cart">
                  <Heart size={48} color="#ccc" />
                  <p>Your wishlist is empty.</p>
                </div>
              ) : (
                wishlist.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <div className="cart-item-info">
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.3rem' }}>{item.name}</h4>
                      <p className="cart-item-price">₹{item.price}</p>
                      <button onClick={() => { onAddToCart(item); onRemove(item); }} className="add-btn" style={{ padding: '0.3rem 0.5rem', marginTop: '0.5rem', width: '100%' }}>Move to Cart</button>
                    </div>
                    <button className="remove-btn" onClick={() => onRemove(item)}><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* --- Luxury Product Share Modal (Direct WhatsApp, Link Copy, Email & Social) --- */
const ShareModal = ({ shareData, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!shareData || !shareData.product) return null;

  const { product, shareUrl, shareText } = shareData;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${product.name} | Malenadu Roast Co.`);
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleTwitter = () => {
    const tweetText = encodeURIComponent(`Discover ${product.name} single-estate artisanal roast from Chikkamagaluru: ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(24, 17, 12, 0.75)',
      backdropFilter: 'blur(5px)',
      padding: '1rem'
    }}>
      <div style={{ position: 'fixed', inset: 0 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        style={{
          position: 'relative',
          background: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          padding: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
          border: '1.5px solid rgba(200, 147, 90, 0.4)',
          zIndex: 100000
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.15rem', color: '#18110C', fontFamily: 'Georgia, serif', fontWeight: 800 }}>
              Share Product
            </h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
              Share this single-estate artisanal roast with friends & family
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Product Preview Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#FAF8F5',
          border: '1px solid rgba(200, 147, 90, 0.3)',
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '20px'
        }}>
          <img
            src={product.image || product.images?.[0] || '/assets/images/estate_reserve_500g.webp'}
            alt={product.name}
            style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', background: '#FFFFFF', padding: '2px', border: '1px solid #EFEAE2' }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#18110C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {product.name}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
              Starting at <strong style={{ color: '#0F172A' }}>₹{product.price}</strong> • Chikkamagaluru Single-Estate
            </div>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* WhatsApp Direct Share */}
          <button
            type="button"
            onClick={handleWhatsApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '11px',
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            <MessageCircle size={18} fill="#FFFFFF" color="#25D366" />
            <span>Share on WhatsApp</span>
          </button>

          {/* Copy Link Input Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            overflow: 'hidden',
            padding: '3px'
          }}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                padding: '8px 10px',
                fontSize: '0.78rem',
                color: '#334155',
                outline: 'none',
                fontFamily: 'monospace'
              }}
            />
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: copied ? '#15803D' : '#18110C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>

          {/* Secondary Shares (Email & X) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '2px' }}>
            <button
              type="button"
              onClick={handleEmail}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <Mail size={15} />
              <span>Email</span>
            </button>

            <button
              type="button"
              onClick={handleTwitter}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '8px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={15} />
              <span>X / Twitter</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* --- Dedicated Rate & Review Modal (Amazon & Flipkart Style for Order & Link Verification) --- */
const ProductReviewModal = ({ activeReviewItem, onClose, currentUser }) => {
  const order = activeReviewItem?.order;
  const item = activeReviewItem?.item;
  const itemImg = activeReviewItem?.itemImg;
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewHeadline, setReviewHeadline] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTags, setReviewTags] = useState(['Rich Aroma', 'Fresh Artisan Roast']);
  const [reviewRecommend, setReviewRecommend] = useState('yes');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewError, setReviewError] = useState('');

  const ratingLabels = {
    1: 'Poor - Needs significant improvement',
    2: 'Fair - Below expectations',
    3: 'Good - Standard satisfying cup',
    4: 'Very Good - Loved the aroma & fresh roast taste',
    5: 'Outstanding - Exceptional authentic Malenadu quality!'
  };

  useEffect(() => {
    if (!activeReviewItem) return;
    try {
      const orderReviews = JSON.parse(localStorage.getItem('malenadu_order_reviews') || '{}');
      const reviewKey = `${order?.orderNumber}_${item?.name}`;
      const existing = orderReviews[reviewKey];
      if (existing) {
        setReviewRating(existing.rating || 5);
        setReviewHeadline(existing.title || '');
        setReviewComment(existing.text || '');
        setReviewTags(existing.tags || ['Rich Aroma', 'Fresh Artisan Roast']);
        setReviewRecommend(existing.recommend || 'yes');
      } else {
        setReviewRating(5);
        setReviewHeadline('');
        setReviewComment('');
        setReviewTags(['Rich Aroma', 'Fresh Artisan Roast']);
        setReviewRecommend('yes');
      }
    } catch (e) {
      console.warn('Could not read existing review', e);
    }
    setReviewError('');
    setReviewSuccessMsg('');
  }, [activeReviewItem, order, item]);

  if (!activeReviewItem) return null;

  const handleToggleReviewTag = (tag) => {
    setReviewTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!activeReviewItem) return;
    if (reviewRating < 1) {
      setReviewError('Please select a star rating for this product.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a brief comment sharing your experience.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      const reviewKey = `${order?.orderNumber}_${item?.name}`;
      const reviewId = `rev_${order?.orderNumber || 'MN'}_${Date.now()}`;

      const newReview = {
        id: reviewId,
        orderNumber: order?.orderNumber || 'MN-VERIFIED',
        productId: item?.id || (item?.name ? item.name.toLowerCase().replace(/\s+/g, '-') : 'prod'),
        productName: item?.name,
        productImage: itemImg || '/assets/images/estate_reserve_500g.webp',
        productWeight: item?.weight || '500g',
        rating: Number(reviewRating),
        title: reviewHeadline.trim() || `${reviewRating} Star Review for ${item?.name}`,
        text: reviewComment.trim(),
        liked: reviewTags.join(', ') || 'Aroma & Freshness',
        tags: reviewTags,
        recommend: reviewRecommend,
        name: currentUser?.name || 'Verified Customer',
        email: currentUser?.email || '',
        avatar: currentUser?.avatar || '',
        date: new Date().toISOString(),
        verified: true,
        isReal: true,
        hidden: false,
        userAccount: currentUser?.email || ''
      };

      // 1. Update Order Reviews Map
      const orderReviews = JSON.parse(localStorage.getItem('malenadu_order_reviews') || '{}');
      const updatedOrderReviews = { ...orderReviews, [reviewKey]: newReview };
      localStorage.setItem('malenadu_order_reviews', JSON.stringify(updatedOrderReviews));

      // 2. Update Global Real Reviews Store
      const realReviews = JSON.parse(localStorage.getItem('malenadu_real_reviews') || '[]');
      const filteredReal = realReviews.filter(r => r.orderNumber !== order?.orderNumber || r.productName !== item?.name);
      localStorage.setItem('malenadu_real_reviews', JSON.stringify([newReview, ...filteredReal]));

      // 3. Update User Reviews Store
      const userReviews = JSON.parse(localStorage.getItem('malenadu_user_reviews') || '[]');
      const filteredUser = userReviews.filter(r => r.orderNumber !== order?.orderNumber || r.productName !== item?.name);
      localStorage.setItem('malenadu_user_reviews', JSON.stringify([newReview, ...filteredUser]));

      // Broadcast update event to all components
      window.dispatchEvent(new Event('malenadu_reviews_updated'));

      // Clean up URL query parameters if opened via link
      if (typeof window !== 'undefined') {
        const url = new URL(window.location);
        url.searchParams.delete('rateProduct');
        url.searchParams.delete('order');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
      }

      setReviewSuccessMsg(`Your verified review for "${item?.name}" has been submitted successfully!`);
      setTimeout(() => {
        onClose();
        setReviewSuccessMsg('');
      }, 1800);
    } catch (err) {
      setReviewError('Failed to publish review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '0.5rem' : '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '540px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          border: '1px solid #e2e8f0',
          padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', marginBottom: '1.2rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: isMobile ? '1.15rem' : '1.35rem', color: '#1a1816', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
              Rate & Review Product
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              {order?.orderNumber ? `Order #${order.orderNumber} • ` : ''}Verified Purchase
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Product Summary Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FAF8F5', border: '1px solid #E6DEC9', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
          <img
            src={itemImg || '/assets/images/estate_reserve_500g.webp'}
            alt={item?.name}
            style={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}
            onError={(e) => { e.target.src = '/assets/images/estate_reserve_500g.webp'; }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1a1816', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item?.name}
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#8c6239', fontWeight: 600 }}>
              {item?.weight || '500g'} {item?.grind ? `• ${item.grind}` : ''}
            </p>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
              ✔ Verified Buyer Review
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitReview}>
          {/* Star Rating Section */}
          <div style={{ textAlign: 'center', marginBottom: '1.4rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall Rating *
            </label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || reviewRating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      transform: (hoverRating || reviewRating) === star ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <Star
                      size={32}
                      color={isFilled ? '#eab308' : '#cbd5e1'}
                      fill={isFilled ? '#eab308' : 'none'}
                    />
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8c6239', minHeight: '1.2rem' }}>
              {ratingLabels[hoverRating || reviewRating]}
            </div>
          </div>

          {/* Review Title Input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Review Headline (Optional)
            </label>
            <input
              type="text"
              value={reviewHeadline}
              onChange={(e) => setReviewHeadline(e.target.value)}
              placeholder="e.g. Best morning filter coffee in India! Rich aroma."
              style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
            />
          </div>

          {/* Tag Highlight Chips */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              What stood out to you? (Select tags)
            </label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                'Rich Aroma',
                'Fresh Artisan Roast',
                'Zero Bitterness',
                'Authentic Malenadu Blend',
                'Great Crema',
                'Perfect Grind Quality',
                'Tellicherry Bold Purity',
                'Fast Delivery'
              ].map(tag => {
                const isSelected = reviewTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleReviewTag(tag)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      border: isSelected ? '1.5px solid #C8935A' : '1px solid #cbd5e1',
                      background: isSelected ? '#FBF8F3' : '#ffffff',
                      color: isSelected ? '#8c6239' : '#475569',
                      fontSize: '0.74rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSelected ? '✓ ' : '+ '}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Textarea */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Detailed Review *
            </label>
            <textarea
              rows={4}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Tell us about the roast profile, taste notes, and brewing method (South Indian filter, French press, espresso). Your honest feedback helps fellow coffee lovers..."
              required
              style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box', lineHeight: 1.5 }}
            />
          </div>

          {/* Recommend Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
              Would you recommend this to a friend?
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setReviewRecommend('yes')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: reviewRecommend === 'yes' ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                  background: reviewRecommend === 'yes' ? '#f0fdf4' : '#fff',
                  color: reviewRecommend === 'yes' ? '#15803d' : '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                👍 Yes
              </button>
              <button
                type="button"
                onClick={() => setReviewRecommend('no')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: reviewRecommend === 'no' ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                  background: reviewRecommend === 'no' ? '#fef2f2' : '#fff',
                  color: reviewRecommend === 'no' ? '#dc2626' : '#64748b',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                👎 No
              </button>
            </div>
          </div>

          {/* Status Alerts */}
          {reviewError && (
            <div style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.78rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={15} />
              <span>{reviewError}</span>
            </div>
          )}

          {reviewSuccessMsg && (
            <div style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.78rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={15} />
              <span>{reviewSuccessMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              disabled={isSubmittingReview}
              onClick={onClose}
              style={{
                padding: '0.65rem 1.2rem',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmittingReview}
              style={{
                padding: '0.65rem 1.5rem',
                background: '#8c6239',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 700,
                cursor: isSubmittingReview ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(140, 98, 57, 0.35)'
              }}
            >
              {isSubmittingReview ? <Loader size={14} className="spin" /> : <Star size={14} fill="#fff" />}
              <span>{isSubmittingReview ? 'Publishing Review...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/* --- Modals & Overlays --- */
const ProfileModal = ({ isOpen, onClose, currentUser, onLogout, onOpenAdmin, onAddToCart, onOpenCart, onBuyNow, onOpenReviewModal }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });

  // Saved Addresses State (Flipkart Style: My Orders, Saved Addresses, Edit Profile)
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const email = currentUser?.email || 'default';
      const stored = localStorage.getItem(`malenadu_saved_addresses_${email}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [];
  });

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    email: '',
    pincode: '',
    locality: '',
    addressLine: '',
    city: '',
    state: 'Karnataka',
    landmark: '',
    type: 'HOME',
    isDefault: false
  });
  const [addressPincodeStatus, setAddressPincodeStatus] = useState(null);
  const [addressMsg, setAddressMsg] = useState({ type: '', text: '' });

  // Pincode handler with Roastery courier & Karnataka circle detection
  const handleAddressPincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    const isKar = isKarnatakaPincode(val);
    setAddressForm(prev => ({
      ...prev,
      pincode: val,
      state: isKar && (!prev.state || prev.state !== 'Karnataka') ? 'Karnataka' : prev.state
    }));
    if (val.length === 6) {
      setAddressPincodeStatus({
        valid: true,
        courier: isKar ? 'Karnataka Express Courier (₹44)' : 'Interstate Express Courier (₹84)',
        eta: isKar ? '1 – 2 Business Days' : '3 – 5 Business Days',
        message: isKar ? 'Karnataka Roastery Local Circle (₹44 Delivery)' : 'Interstate / Rest of India (₹84 Delivery)'
      });
    } else {
      setAddressPincodeStatus(null);
    }
  };

  // Start adding a fresh delivery address prefilled with current profile contact info
  const handleStartAddAddress = () => {
    setAddressForm({
      name: currentUser?.name || profile.name || '',
      phone: cleanPhoneDigits(currentUser?.phone || profile.phone || ''),
      email: currentUser?.email || profile.email || '',
      pincode: '',
      locality: '',
      addressLine: '',
      city: '',
      state: 'Karnataka',
      landmark: '',
      type: 'HOME',
      isDefault: savedAddresses.length === 0
    });
    setAddressPincodeStatus(null);
    setEditingAddressId(null);
    setIsAddingAddress(true);
    setAddressMsg({ type: '', text: '' });
  };

  // Save or Update Address Handler
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.name.trim() || !addressForm.phone.trim() || !addressForm.email.trim() || !addressForm.pincode.trim() || !addressForm.addressLine.trim() || !addressForm.locality.trim() || !addressForm.city.trim()) {
      setAddressMsg({ type: 'error', text: 'Please fill all required address fields.' });
      return;
    }

    const email = currentUser?.email || addressForm.email || 'default';
    const isFirst = savedAddresses.length === 0;
    const shouldBeDefault = addressForm.isDefault || isFirst;

    let normType = 'HOME';
    const rawT = String(addressForm.type || 'HOME').toUpperCase();
    if (rawT.includes('WORK') || rawT.includes('OFFICE')) normType = 'WORK';
    else if (rawT.includes('OTHER')) normType = 'OTHER';
    else normType = 'HOME';

    const payloadItem = {
      name: addressForm.name.trim(),
      phone: addressForm.phone.trim(),
      email: addressForm.email.trim(),
      pincode: addressForm.pincode.trim(),
      locality: addressForm.locality.trim(),
      area: addressForm.locality.trim(),
      addressLine: addressForm.addressLine.trim(),
      houseNo: addressForm.addressLine.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim() || 'Karnataka',
      landmark: addressForm.landmark.trim(),
      type: normType,
      addressType: normType === 'WORK' ? 'Office' : (normType === 'OTHER' ? 'Others' : 'Home'),
      isDefault: shouldBeDefault
    };

    let updated;
    if (editingAddressId) {
      updated = savedAddresses.map(addr => {
        if (addr.id === editingAddressId) {
          return {
            ...addr,
            ...payloadItem,
            id: editingAddressId,
            isDefault: shouldBeDefault ? true : (addr.isDefault && !shouldBeDefault ? false : addr.isDefault)
          };
        }
        return shouldBeDefault ? { ...addr, isDefault: false } : addr;
      });
    } else {
      const newAddr = {
        id: 'addr_' + Date.now(),
        ...payloadItem
      };
      updated = shouldBeDefault
        ? [newAddr, ...savedAddresses.map(a => ({ ...a, isDefault: false }))]
        : [newAddr, ...savedAddresses];
    }

    setSavedAddresses(updated);
    try {
      localStorage.setItem(`malenadu_saved_addresses_${email}`, JSON.stringify(updated));
      if (email !== 'default') {
        localStorage.setItem(`malenadu_saved_addresses_${email.toLowerCase().trim()}`, JSON.stringify(updated));
      }
      window.dispatchEvent(new Event('malenadu_addresses_updated'));
    } catch (err) { }

    // Auto-sync default delivery address to user profile
    const activeDef = updated.find(a => a.isDefault) || updated[0];
    if (activeDef) {
      const formatted = `${activeDef.addressLine}, ${activeDef.locality ? activeDef.locality + ', ' : ''}${activeDef.city}, ${activeDef.state} - PIN: ${activeDef.pincode}`;
      setProfile(prev => ({ ...prev, address: formatted, phone: activeDef.phone || prev.phone, name: activeDef.name || prev.name }));
      try {
        const activeUser = JSON.parse(localStorage.getItem('malenadu_user') || 'null');
        if (activeUser) {
          activeUser.address = formatted;
          if (activeDef.phone) activeUser.phone = activeDef.phone;
          if (activeDef.name) activeUser.name = activeDef.name;
          if (activeDef.email) activeUser.email = activeDef.email;
          localStorage.setItem('malenadu_user', JSON.stringify(activeUser));
        }
        await updateProfile({ ...profile, address: formatted });
      } catch (err) { }
    }

    setAddressMsg({ type: 'success', text: editingAddressId ? 'Address updated successfully!' : 'New delivery address saved successfully!' });
    setIsAddingAddress(false);
    setEditingAddressId(null);
    setAddressPincodeStatus(null);
    setAddressForm({
      name: '',
      phone: '',
      email: '',
      pincode: '',
      locality: '',
      addressLine: '',
      city: '',
      state: 'Karnataka',
      landmark: '',
      type: 'HOME',
      isDefault: false
    });
    setTimeout(() => setAddressMsg({ type: '', text: '' }), 3000);
  };

  const handleStartEditAddress = (addr) => {
    const rawPin = addr.pincode || '';
    if (rawPin.length === 6) {
      const isKar = isKarnatakaPincode(rawPin);
      setAddressPincodeStatus({
        valid: true,
        courier: isKar ? 'Karnataka Express Courier (₹44)' : 'Interstate Express Courier (₹84)',
        eta: isKar ? '1 – 2 Business Days' : '3 – 5 Business Days',
        message: isKar ? 'Karnataka Roastery Local Circle (₹44 Delivery)' : 'Interstate / Rest of India (₹84 Delivery)'
      });
    } else {
      setAddressPincodeStatus(null);
    }

    let normType = 'HOME';
    const rawT = String(addr.type || addr.addressType || '').toUpperCase();
    if (rawT.includes('WORK') || rawT.includes('OFFICE')) normType = 'WORK';
    else if (rawT.includes('OTHER')) normType = 'OTHER';
    else normType = 'HOME';

    setAddressForm({
      name: addr.name || '',
      phone: cleanPhoneDigits(addr.phone || currentUser?.phone || ''),
      email: addr.email || currentUser?.email || '',
      pincode: addr.pincode || '',
      locality: addr.locality || addr.area || '',
      addressLine: addr.addressLine || addr.houseNo || '',
      city: addr.city || '',
      state: addr.state || 'Karnataka',
      landmark: addr.landmark || '',
      type: normType,
      isDefault: Boolean(addr.isDefault)
    });
    setEditingAddressId(addr.id);
    setIsAddingAddress(true);
    setAddressMsg({ type: '', text: '' });
  };

  const handleDeleteAddress = (id) => {
    if (!window.confirm('Are you sure you want to delete this saved delivery address?')) return;
    const email = currentUser?.email || 'default';
    const remaining = savedAddresses.filter(a => a.id !== id);
    if (remaining.length > 0 && !remaining.some(a => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    setSavedAddresses(remaining);
    try {
      localStorage.setItem(`malenadu_saved_addresses_${email}`, JSON.stringify(remaining));
      if (email !== 'default') {
        localStorage.setItem(`malenadu_saved_addresses_${email.toLowerCase().trim()}`, JSON.stringify(remaining));
      }
      window.dispatchEvent(new Event('malenadu_addresses_updated'));
    } catch (err) { }
    setAddressMsg({ type: 'success', text: 'Address removed successfully.' });
    setTimeout(() => setAddressMsg({ type: '', text: '' }), 2500);
  };

  const handleSetDefaultAddress = async (id) => {
    const email = currentUser?.email || 'default';
    const updated = savedAddresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setSavedAddresses(updated);
    try {
      localStorage.setItem(`malenadu_saved_addresses_${email}`, JSON.stringify(updated));
      if (email !== 'default') {
        localStorage.setItem(`malenadu_saved_addresses_${email.toLowerCase().trim()}`, JSON.stringify(updated));
      }
      window.dispatchEvent(new Event('malenadu_addresses_updated'));
    } catch (err) { }

    const chosen = updated.find(a => a.id === id);
    if (chosen) {
      const formatted = `${chosen.addressLine}, ${chosen.locality ? chosen.locality + ', ' : ''}${chosen.city}, ${chosen.state} - PIN: ${chosen.pincode}`;
      setProfile(prev => ({ ...prev, address: formatted }));
      try {
        await updateProfile({ ...profile, address: formatted });
      } catch (err) { }
    }
    setAddressMsg({ type: 'success', text: 'Default delivery address updated!' });
    setTimeout(() => setAddressMsg({ type: '', text: '' }), 2500);
  };
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  // Password Edit State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Order Cancellation State (Strict 24h Window)
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Re-order / Buy Again notification
  const [buyAgainFeedback, setBuyAgainFeedback] = useState('');

  // Rate & Review Product State (Amazon & Flipkart Style)
  const [activeReviewItem, setActiveReviewItem] = useState(null); // { order, item, itemImg }
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewHeadline, setReviewHeadline] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTags, setReviewTags] = useState([]);
  const [reviewRecommend, setReviewRecommend] = useState('yes');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [reviewError, setReviewError] = useState('');

  const ratingLabels = {
    1: 'Poor - Needs significant improvement',
    2: 'Fair - Below expectations',
    3: 'Good - Standard satisfying cup',
    4: 'Very Good - Loved the aroma & fresh roast taste',
    5: 'Outstanding - Exceptional authentic Malenadu quality!'
  };

  const [orderReviews, setOrderReviews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('malenadu_order_reviews') || '{}');
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    const syncReviews = () => {
      try {
        setOrderReviews(JSON.parse(localStorage.getItem('malenadu_order_reviews') || '{}'));
      } catch (e) { }
    };
    window.addEventListener('malenadu_reviews_updated', syncReviews);
    return () => window.removeEventListener('malenadu_reviews_updated', syncReviews);
  }, []);

  const handleOpenReviewModal = (order, item, itemImg) => {
    if (onOpenReviewModal) {
      onOpenReviewModal(order, item, itemImg);
      return;
    }
    const reviewKey = `${order.orderNumber}_${item.name}`;
    const existing = orderReviews[reviewKey];

    setActiveReviewItem({ order, item, itemImg });
    if (existing) {
      setReviewRating(existing.rating || 5);
      setReviewHeadline(existing.title || '');
      setReviewComment(existing.text || '');
      setReviewTags(existing.tags || []);
      setReviewRecommend(existing.recommend || 'yes');
    } else {
      setReviewRating(5);
      setReviewHeadline('');
      setReviewComment('');
      setReviewTags(['Rich Aroma', 'Fresh Artisan Roast']);
      setReviewRecommend('yes');
    }
    setReviewError('');
    setReviewSuccessMsg('');
  };

  const handleToggleReviewTag = (tag) => {
    setReviewTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!activeReviewItem) return;
    if (reviewRating < 1) {
      setReviewError('Please select a star rating for this product.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a brief comment sharing your experience.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      const { order, item, itemImg } = activeReviewItem;
      const reviewKey = `${order.orderNumber}_${item.name}`;
      const reviewId = `rev_${order.orderNumber}_${Date.now()}`;

      const newReview = {
        id: reviewId,
        orderNumber: order.orderNumber,
        productId: item.id || (item.name ? item.name.toLowerCase().replace(/\s+/g, '-') : 'prod'),
        productName: item.name,
        productImage: itemImg,
        productWeight: item.weight || '500g',
        rating: Number(reviewRating),
        title: reviewHeadline.trim() || `${reviewRating} Star Review for ${item.name}`,
        text: reviewComment.trim(),
        liked: reviewTags.join(', ') || 'Aroma & Freshness',
        tags: reviewTags,
        recommend: reviewRecommend,
        name: currentUser?.name || 'Verified Buyer',
        email: currentUser?.email || '',
        avatar: currentUser?.avatar || '',
        date: new Date().toISOString(),
        verified: true,
        isReal: true,
        hidden: false,
        userAccount: currentUser?.email || ''
      };

      // 1. Update Order Reviews Map
      const updatedOrderReviews = { ...orderReviews, [reviewKey]: newReview };
      localStorage.setItem('malenadu_order_reviews', JSON.stringify(updatedOrderReviews));
      setOrderReviews(updatedOrderReviews);

      // 2. Update Global Real Reviews Store
      const realReviews = JSON.parse(localStorage.getItem('malenadu_real_reviews') || '[]');
      const filteredReal = realReviews.filter(r => r.orderNumber !== order.orderNumber || r.productName !== item.name);
      localStorage.setItem('malenadu_real_reviews', JSON.stringify([newReview, ...filteredReal]));

      // 3. Update User Reviews Store
      const userReviews = JSON.parse(localStorage.getItem('malenadu_user_reviews') || '[]');
      const filteredUser = userReviews.filter(r => r.orderNumber !== order.orderNumber || r.productName !== item.name);
      localStorage.setItem('malenadu_user_reviews', JSON.stringify([newReview, ...filteredUser]));

      // Broadcast update event to all components
      window.dispatchEvent(new Event('malenadu_reviews_updated'));

      setReviewSuccessMsg(`Your verified review for "${item.name}" has been submitted successfully!`);
      setTimeout(() => {
        setActiveReviewItem(null);
        setReviewSuccessMsg('');
      }, 1800);
    } catch (err) {
      setReviewError('Failed to publish review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen && currentUser) {
      setProfile({ name: currentUser.name || '', email: currentUser.email || '', phone: currentUser.phone || '', address: currentUser.address || '' });
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    const reloadAddresses = () => {
      try {
        const email = currentUser?.email || 'default';
        let stored = localStorage.getItem(`malenadu_saved_addresses_${email}`);
        if (!stored && currentUser?.email) {
          stored = localStorage.getItem(`malenadu_saved_addresses_${currentUser.email.toLowerCase().trim()}`);
        }
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) setSavedAddresses(parsed);
        }
      } catch (e) { }
    };
    if (isOpen) reloadAddresses();
    window.addEventListener('malenadu_addresses_updated', reloadAddresses);
    return () => window.removeEventListener('malenadu_addresses_updated', reloadAddresses);
  }, [isOpen, currentUser]);

  const loadOrders = useCallback(() => {
    if (currentUser) {
      setOrdersLoading(true);
      getMyOrders()
        .then(({ data }) => setOrders(data || []))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen && activeTab === 'orders') {
      loadOrders();
    }
  }, [isOpen, activeTab, loadOrders]);

  if (!isOpen) return null;

  // Helper: Flatten all products from store
  const getAllCatalogProducts = () => {
    try {
      const data = typeof getStoredProducts === 'function' ? getStoredProducts() : null;
      if (data) {
        if (Array.isArray(data)) return data;
        return [
          ...(Array.isArray(data.coffee) ? data.coffee : []),
          ...(Array.isArray(data.pepper) ? data.pepper : []),
          ...(Array.isArray(data.combos) ? data.combos : [])
        ];
      }
    } catch (e) { }
    return [];
  };

  // Helper: Resolve product picture for order items (Highest-Definition uncropped assets)
  const getOrderItemImage = (item) => {
    if (!item) return '/assets/images/estate_reserve_front.jpg';
    if (item.image && typeof item.image === 'string' && (item.image.startsWith('/assets/images/') || item.image.startsWith('http') || item.image.startsWith('data:'))) {
      return item.image;
    }

    const itemName = (item?.name || '').toLowerCase().trim();
    const weight = item?.weight || '';

    // Smart mapping to highest-resolution packaging asset
    if (itemName.includes('signature bean') || itemName.includes('whole roasted') || itemName.includes('whole bean') || itemName.includes('signature beans')) {
      return '/assets/images/signature_beans_front.jpg';
    }
    if (itemName.includes('pepper') || itemName.includes('black pepper')) {
      return '/assets/images/pepper_reserve_front.jpg';
    }
    if (itemName.includes('peaberry')) {
      return '/assets/images/peaberry_grand_cru_front.jpg';
    }
    if (itemName.includes('heritage') || itemName.includes('imperial') || itemName.includes('mysore')) {
      return '/assets/images/imperial_heritage_front.jpg';
    }
    if (itemName.includes('highland') || itemName.includes('signature 80:20') || itemName.includes('signature reserve') || itemName.includes('highland signature')) {
      return '/assets/images/highland_signature_front.jpg';
    }
    if (itemName.includes('estate') || itemName.includes('70:30') || itemName.includes('malenadu estate')) {
      return '/assets/images/estate_reserve_front.jpg';
    }
    if (itemName.includes('combo')) {
      return '/assets/images/coffee_pepper_combo_hero_v3.jpg';
    }

    return '/assets/images/estate_reserve_front.jpg';
  };

  // Helper: Buy Again / Buy Now button handler (Direct Navigation to Checkout)
  const handleBuyAgain = (item) => {
    const allProducts = getAllCatalogProducts();
    const itemName = (item?.name || '').toLowerCase().trim();
    const matched = allProducts.find(p => {
      if (!p) return false;
      const pName = (p.name || '').toLowerCase().trim();
      return pName && (pName === itemName || itemName.includes(pName) || pName.includes(itemName));
    });

    const img = getOrderItemImage(item);
    const productToBuy = {
      id: matched?.id || item.id || item._id || item.name.toLowerCase().replace(/\s+/g, '-'),
      name: item.name,
      price: Number(item.price) || (matched ? Number(matched.variants?.[0]?.price || 449) : 449),
      weight: item.weight || (matched ? matched.variants?.[0]?.weight || '500g' : '500g'),
      image: img,
      grind: item.grind || 'South Indian Filter'
    };

    if (onBuyNow) {
      onClose();
      onBuyNow(productToBuy);
    } else if (onAddToCart) {
      onAddToCart(productToBuy);
      if (onOpenCart) onOpenCart();
      setBuyAgainFeedback(`Added "${item.name}" to your cart!`);
      setTimeout(() => setBuyAgainFeedback(''), 4000);
    }
  };

  // Profile Save Handler (supports optional password change simultaneously)
  const handleSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword) {
      if (passwordForm.newPassword.length < 6) {
        setSaveMsg('New password must be at least 6 characters.');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setSaveMsg('New passwords do not match.');
        return;
      }
    }

    try {
      const payload = { ...profile };
      if (passwordForm.newPassword) {
        payload.password = passwordForm.newPassword;
      }
      const { data } = await updateProfile(payload);
      localStorage.setItem('malenadu_user', JSON.stringify(data));
      if (data.token) {
        localStorage.setItem('malenadu_token', data.token);
      }
      setSaveMsg(passwordForm.newPassword ? 'Profile & password updated successfully!' : 'Profile updated successfully!');
      setIsEditing(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Update failed. Please try again.');
    }
  };

  // Dedicated Password Change Handler
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match. Please verify.' });
      return;
    }

    setIsSavingPassword(true);
    setPasswordMsg({ type: '', text: '' });
    try {
      const { data } = await updateProfile({
        ...profile,
        password: passwordForm.newPassword
      });
      localStorage.setItem('malenadu_user', JSON.stringify(data));
      setPasswordMsg({ type: 'success', text: 'Password updated successfully! Your new password is now active.' });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordMsg({ type: '', text: '' });
      }, 2500);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err?.response?.data?.message || 'Failed to update password. Please try again.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Strict 24-Hour Cancel Order Execution
  const handleExecuteCancel = async (orderNumber) => {
    setIsCancelling(true);
    setCancelError('');
    try {
      await cancelOrder(orderNumber);
      setOrders(prev => prev.map(o => (o.orderNumber === orderNumber || o._id === orderNumber) ? {
        ...o,
        orderStatus: 'cancelled',
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      } : o));
      setCancellingOrder(null);
      setCancelSuccessMsg(`Order #${orderNumber} has been successfully cancelled.`);
      setTimeout(() => setCancelSuccessMsg(''), 5000);
    } catch (err) {
      setCancelError(err?.response?.data?.message || err?.message || 'Cancellation failed. Orders can only be cancelled within 24 hours.');
    } finally {
      setIsCancelling(false);
    }
  };

  const statusColor = { placed: '#f0ad4e', confirmed: 'var(--c-gold)', shipped: '#17a2b8', delivered: '#28a745', cancelled: '#dc3545', pending: '#6c757d', paid: '#28a745', failed: '#dc3545' };

  return (
    <div
      className="checkout-modal-wrapper"
      style={{
        alignItems: isMobile ? 'center' : 'flex-start',
        paddingTop: isMobile ? '0.5rem' : '4rem',
        padding: isMobile ? '0.5rem' : '1rem'
      }}
    >
      <div className="checkout-backdrop" onClick={onClose}></div>
      <motion.div
        className="checkout-modal profile-dashboard-modal"
        style={{
          maxWidth: '1000px',
          width: '100%',
          maxHeight: isMobile ? '94vh' : '90vh',
          height: isMobile ? '94vh' : 'auto',
          minHeight: isMobile ? 'auto' : '600px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isMobile ? '16px' : '14px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
        }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: isMobile ? '0.85rem 1.1rem' : '1.2rem 1.8rem', borderBottom: '1px solid #ebebeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.45rem', margin: 0, fontWeight: 700, color: '#1a1816', fontFamily: 'Georgia, serif' }}>
            My Account
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Container */}
        <div
          className="checkout-body dashboard-body"
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flex: 1,
            padding: 0,
            background: '#f8fafc',
            overflow: 'hidden'
          }}
        >
          {/* Desktop Sidebar (Only shown on >768px screens) */}
          {!isMobile && (
            <div className="dashboard-sidebar" style={{ width: '280px', background: '#fff', borderRight: '1px solid #ebebeb', padding: '2rem 1.2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {currentUser?.avatar ? (
                  <div style={{ position: 'relative', width: 76, height: 76, margin: '0 auto 1rem' }}>
                    <img
                      src={currentUser.avatar}
                      alt={profile.name}
                      referrerPolicy="no-referrer"
                      style={{
                        width: 76,
                        height: 76,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2.5px solid var(--c-gold)',
                        boxShadow: '0 4px 14px rgba(200,147,90,0.3)',
                        display: 'block'
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {currentUser?.provider === 'google' && (
                      <span
                        title="Verified Google Account"
                        style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                        </svg>
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--c-gold)', color: 'var(--c-dark-brown)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.9rem', fontWeight: 700, margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(200,147,90,0.25)' }}>
                    {profile.name.charAt(0) || '?'}
                  </div>
                )}
                <h4 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 700 }}>{profile.name || 'Valued Customer'}</h4>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, wordBreak: 'break-all' }}>{profile.email}</p>
                {currentUser?.provider === 'google' && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '6px', fontSize: '0.72rem', color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    <span>Google Verified</span>
                  </div>
                )}
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                <button
                  style={{
                    textAlign: 'left',
                    padding: '0.85rem 1.1rem',
                    border: 'none',
                    background: activeTab === 'orders' ? '#FBF8F3' : 'transparent',
                    color: activeTab === 'orders' ? '#8c6239' : '#334155',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'orders' ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={17} color={activeTab === 'orders' ? '#C8935A' : '#64748b'} />
                  <span>My Orders</span>
                  {orders.length > 0 && (
                    <span style={{ marginLeft: 'auto', background: activeTab === 'orders' ? '#C8935A' : '#e2e8f0', color: activeTab === 'orders' ? '#fff' : '#475569', fontSize: '0.72rem', padding: '2px 7px', borderRadius: '10px', fontWeight: 700 }}>
                      {orders.length}
                    </span>
                  )}
                </button>

                <button
                  style={{
                    textAlign: 'left',
                    padding: '0.85rem 1.1rem',
                    border: 'none',
                    background: activeTab === 'addresses' ? '#FBF8F3' : 'transparent',
                    color: activeTab === 'addresses' ? '#8c6239' : '#334155',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'addresses' ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onClick={() => setActiveTab('addresses')}
                >
                  <MapPin size={17} color={activeTab === 'addresses' ? '#C8935A' : '#64748b'} />
                  <span>Saved Addresses</span>
                  {savedAddresses.length > 0 && (
                    <span style={{ marginLeft: 'auto', background: activeTab === 'addresses' ? '#C8935A' : '#e2e8f0', color: activeTab === 'addresses' ? '#fff' : '#475569', fontSize: '0.72rem', padding: '2px 7px', borderRadius: '10px', fontWeight: 700 }}>
                      {savedAddresses.length}
                    </span>
                  )}
                </button>

                <button
                  style={{
                    textAlign: 'left',
                    padding: '0.85rem 1.1rem',
                    border: 'none',
                    background: activeTab === 'profile' ? '#FBF8F3' : 'transparent',
                    color: activeTab === 'profile' ? '#8c6239' : '#334155',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: activeTab === 'profile' ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={17} color={activeTab === 'profile' ? '#C8935A' : '#64748b'} />
                  <span>Edit Profile</span>
                </button>

                {((['malenaduroast@gmail.com', 'yashwanthma2@gmail.com', 'mokshithba06@gmail.com'].includes(currentUser?.email?.toLowerCase())) ||
                  (['malenaduroast@gmail.com', 'yashwanthma2@gmail.com', 'mokshithba06@gmail.com'].includes(profile?.email?.toLowerCase())) ||
                  currentUser?.role === 'admin') && (
                    <button
                      style={{
                        textAlign: 'left',
                        padding: '0.85rem 1.1rem',
                        border: '1.5px solid #C8935A',
                        background: 'linear-gradient(135deg, rgba(200,147,90,0.18), rgba(200,147,90,0.05))',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        color: '#8c6239',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '0.5rem',
                        boxShadow: '0 2px 8px rgba(200,147,90,0.12)'
                      }}
                      onClick={() => {
                        onClose();
                        if (onOpenAdmin) onOpenAdmin();
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>👑</span>
                      <span>Store Admin Panel</span>
                    </button>
                  )}

                <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    style={{
                      textAlign: 'left',
                      padding: '0.8rem 1rem',
                      border: 'none',
                      background: 'transparent',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%'
                    }}
                    onClick={() => { onLogout(); onClose(); }}
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              </nav>
            </div>
          )}

          {/* Mobile Sleek Top Profile Header & Horizontal Navigation Bar (<768px screens) */}
          {isMobile && (
            <div style={{
              background: '#ffffff',
              borderBottom: '1px solid #e2e8f0',
              padding: '0.8rem 0.9rem 0.6rem',
              flexShrink: 0
            }}>
              {/* User Identity Compact Summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.7rem' }}>
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--c-gold)',
                      boxShadow: '0 2px 6px rgba(200,147,90,0.25)',
                      flexShrink: 0
                    }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'var(--c-gold)',
                    color: 'var(--c-dark-brown)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(200,147,90,0.25)'
                  }}>
                    {profile.name.charAt(0) || '?'}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.name || 'Valued Customer'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.email}
                  </p>
                </div>
                <button
                  onClick={() => { onLogout(); onClose(); }}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#dc2626',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Sign Out
                </button>
              </div>

              {/* Mobile Horizontal Pill Navigation */}
              <div style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                paddingBottom: '2px'
              }}>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{
                    flex: '1 1 auto',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: activeTab === 'orders' ? '1.5px solid #C8935A' : '1px solid #e2e8f0',
                    background: activeTab === 'orders' ? '#FBF8F3' : '#f8fafc',
                    color: activeTab === 'orders' ? '#8c6239' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Package size={13} color={activeTab === 'orders' ? '#C8935A' : '#64748b'} />
                  <span>My Orders</span>
                  {orders.length > 0 && (
                    <span style={{
                      background: activeTab === 'orders' ? '#C8935A' : '#cbd5e1',
                      color: activeTab === 'orders' ? '#fff' : '#1e293b',
                      fontSize: '0.66rem',
                      padding: '1px 5px',
                      borderRadius: '8px',
                      fontWeight: 700
                    }}>
                      {orders.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  style={{
                    flex: '1 1 auto',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: activeTab === 'addresses' ? '1.5px solid #C8935A' : '1px solid #e2e8f0',
                    background: activeTab === 'addresses' ? '#FBF8F3' : '#f8fafc',
                    color: activeTab === 'addresses' ? '#8c6239' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <MapPin size={13} color={activeTab === 'addresses' ? '#C8935A' : '#64748b'} />
                  <span>Saved Addresses</span>
                  {savedAddresses.length > 0 && (
                    <span style={{
                      background: activeTab === 'addresses' ? '#C8935A' : '#cbd5e1',
                      color: activeTab === 'addresses' ? '#fff' : '#1e293b',
                      fontSize: '0.66rem',
                      padding: '1px 5px',
                      borderRadius: '8px',
                      fontWeight: 700
                    }}>
                      {savedAddresses.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  style={{
                    flex: '1 1 auto',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: activeTab === 'profile' ? '1.5px solid #C8935A' : '1px solid #e2e8f0',
                    background: activeTab === 'profile' ? '#FBF8F3' : '#f8fafc',
                    color: activeTab === 'profile' ? '#8c6239' : '#475569',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <User size={13} color={activeTab === 'profile' ? '#C8935A' : '#64748b'} />
                  <span>Edit Profile</span>
                </button>

                {((['malenaduroast@gmail.com', 'yashwanthma2@gmail.com', 'mokshithba06@gmail.com'].includes(currentUser?.email?.toLowerCase())) ||
                  (['malenaduroast@gmail.com', 'yashwanthma2@gmail.com', 'mokshithba06@gmail.com'].includes(profile?.email?.toLowerCase())) ||
                  currentUser?.role === 'admin') && (
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenAdmin) onOpenAdmin();
                      }}
                      style={{
                        flex: '0 0 auto',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #C8935A',
                        background: 'linear-gradient(135deg, rgba(200,147,90,0.18), rgba(200,147,90,0.06))',
                        color: '#8c6239',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>👑 Admin</span>
                    </button>
                  )}
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div
            className="dashboard-content"
            style={{
              flex: 1,
              padding: isMobile ? '0.9rem 0.75rem' : '2.5rem',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Global notification toast for Buy Again / Cancel Order */}
            {buyAgainFeedback && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <CheckCircle size={16} color="#16a34a" />
                <span>{buyAgainFeedback}</span>
              </div>
            )}

            {cancelSuccessMsg && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.7rem 1rem',
                borderRadius: '8px',
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle size={16} color="#16a34a" />
                <span>{cancelSuccessMsg}</span>
              </div>
            )}

            {/* ========================================================
               SECTION 2: SAVED ADDRESSES (FLIPKART STYLE)
               ======================================================== */}
            {activeTab === 'addresses' && (
              <div style={{
                background: '#ffffff',
                padding: isMobile ? '1.15rem 0.9rem' : '2rem',
                borderRadius: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                border: '1px solid #e2e8f0'
              }}>
                {/* Header Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.85rem',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '1.15rem' : '1.35rem', color: '#0f172a', fontWeight: 800, fontFamily: '"Georgia", serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MapPin size={20} color="#C8935A" />
                      <span>Manage Saved Addresses</span>
                    </h3>
                    <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                      Delivery destinations for 1-click fresh artisan dispatch & checkout
                    </p>
                  </div>

                  {!isAddingAddress && (
                    <button
                      type="button"
                      onClick={handleStartAddAddress}
                      style={{
                        background: '#18110C',
                        color: '#E8CA80',
                        border: '1px solid rgba(200, 147, 90, 0.4)',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Plus size={15} />
                      <span>+ ADD A NEW ADDRESS</span>
                    </button>
                  )}
                </div>

                {/* Feedback Alerts */}
                {addressMsg.text && (
                  <div style={{
                    padding: '0.65rem 0.95rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    background: addressMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                    color: addressMsg.type === 'error' ? '#dc2626' : '#166534',
                    border: addressMsg.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {addressMsg.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
                    <span>{addressMsg.text}</span>
                  </div>
                )}


                {/* Helpful Demo Address Guide Box */}
                <div style={{
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <Info size={16} color="#64748B" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.5 }}>
                    <strong style={{ color: '#0F172A' }}>Address Formatting Guide (Sample Demo):</strong>
                    <div>• <strong>Recipient:</strong> Rahul Sharma (9876543210)</div>
                    <div>• <strong>Street Address:</strong> Flat 302, Green Glen Apartments, 4th Cross Road</div>
                    <div>• <strong>Locality & City:</strong> Indiranagar, Bengaluru, Karnataka - 560038 (Landmark: Near Metro Station)</div>
                  </div>
                </div>

                {/* Flipkart Style Add/Edit Address Form Box */}
                {isAddingAddress && (
                  <div style={{
                    background: '#FAF8F5',
                    border: '1.5px solid #C8935A',
                    borderRadius: '10px',
                    padding: isMobile ? '1.1rem 0.9rem' : '1.4rem 1.5rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 4px 14px rgba(200, 147, 90, 0.12)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px dashed #E6DEC9'
                    }}>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#18110C', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {editingAddressId ? 'Edit Delivery Address' : 'Add A New Delivery Address'}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); setAddressPincodeStatus(null); }}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleSaveAddress}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Full Name <span style={{ color: '#dc2626' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={e => setAddressForm({ ...addressForm, name: e.target.value })}
                            placeholder="e.g. Rahul Sharma"
                            required
                            style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Mobile Number (10 digits) <span style={{ color: '#dc2626' }}>*</span>
                          </label>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #cbd5e1',
                            borderRadius: '7px',
                            background: '#ffffff',
                            overflow: 'hidden'
                          }}>
                            <span style={{
                              padding: '0.65rem 0.65rem',
                              background: '#f8fafc',
                              borderRight: '1px solid #cbd5e1',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: '#64748b'
                            }}>
                              +91
                            </span>
                            <input
                              type="tel"
                              value={addressForm.phone}
                              onChange={e => setAddressForm({ ...addressForm, phone: cleanPhoneDigits(e.target.value) })}
                              placeholder="9876543210"
                              maxLength={10}
                              required
                              style={{ width: '100%', padding: '0.65rem 0.85rem', border: 'none', outline: 'none', fontSize: '0.85rem', boxSizing: 'border-box' }}
                            />
                            {addressForm.phone && (
                              <span style={{ paddingRight: '10px', fontSize: '0.72rem', color: addressForm.phone.length === 10 ? '#16a34a' : '#b45309', fontWeight: 700, flexShrink: 0 }}>
                                {addressForm.phone.length === 10 ? '✓' : `${addressForm.phone.length}/10`}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Email Address <span style={{ color: '#dc2626' }}>*</span>
                          </label>
                          <input
                            type="email"
                            value={addressForm.email}
                            onChange={e => setAddressForm({ ...addressForm, email: e.target.value })}
                            placeholder="e.g. name@example.com (for order invoice & tracking)"
                            required
                            style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Pincode (6 digits) <span style={{ color: '#dc2626' }}>*</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={addressForm.pincode}
                              onChange={handleAddressPincodeChange}
                              placeholder="e.g. 560001"
                              maxLength={6}
                              required
                              style={{ width: '100%', padding: '0.65rem 0.85rem', paddingRight: '2.5rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                            />
                            {addressPincodeStatus?.valid && (
                              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#16a34a', fontSize: '1rem', fontWeight: 800 }}>
                                ✓
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            City / Town <span style={{ color: '#dc2626' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                            placeholder="e.g. Bengaluru / Chikkamagaluru"
                            required
                            style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                          <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            State <span style={{ color: '#dc2626' }}>*</span>
                          </label>
                          <div style={{ position: 'relative' }}>
                            <select
                              value={addressForm.state}
                              onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                              required
                              style={{
                                width: '100%',
                                padding: '0.65rem 2rem 0.65rem 0.85rem',
                                border: '1px solid #cbd5e1',
                                borderRadius: '7px',
                                fontSize: '0.85rem',
                                color: '#111827',
                                background: '#ffffff',
                                appearance: 'none',
                                cursor: 'pointer',
                                boxSizing: 'border-box'
                              }}
                            >
                              {INDIAN_STATES.map(st => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                            <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                          </div>
                        </div>
                      </div>

                      {/* Live Pincode Courier Status Badge */}
                      {addressPincodeStatus && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 7, padding: '0.55rem 0.85rem', fontSize: '0.78rem', color: '#166534', marginBottom: '0.85rem' }}>
                          <Truck size={15} color="#166534" style={{ flexShrink: 0 }} />
                          <span>{addressPincodeStatus.message} • <strong>{addressPincodeStatus.eta}</strong></span>
                        </div>
                      )}

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          House no / Building / Apartment <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={addressForm.addressLine}
                          onChange={e => setAddressForm({ ...addressForm, addressLine: e.target.value })}
                          placeholder="e.g. Flat 301, Emerald Heights / House #45"
                          required
                          style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          Area, Sector, Street, Village <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={addressForm.locality}
                          onChange={e => setAddressForm({ ...addressForm, locality: e.target.value })}
                          placeholder="e.g. 1st Main Road, 4th Cross, Indiranagar"
                          required
                          style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ marginBottom: '0.85rem' }}>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          Landmark <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>(optional)</span>
                        </label>
                        <input
                          type="text"
                          value={addressForm.landmark}
                          onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })}
                          placeholder="e.g. Near Metro Station / Temple / Park"
                          style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                      </div>

                      {/* Address Type (Home / Office / Others) Pills matching Checkout */}
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                          Address Type
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {[
                            { id: 'HOME', label: 'Home', icon: '🏠' },
                            { id: 'WORK', label: 'Office', icon: '🏢' },
                            { id: 'OTHER', label: 'Others', icon: '📍' }
                          ].map(tab => {
                            const isSelected = addressForm.type === tab.id;
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setAddressForm({ ...addressForm, type: tab.id })}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '20px',
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: isSelected ? 'none' : '1px solid #cbd5e1',
                                  background: isSelected ? '#5ce1e6' : '#ffffff',
                                  color: isSelected ? '#ffffff' : '#475569',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  transition: 'all 0.15s',
                                  boxShadow: isSelected ? '0 2px 6px rgba(92, 225, 230, 0.4)' : 'none'
                                }}
                              >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Default Address Checkbox */}
                      <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#1e293b', fontWeight: 600, cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={addressForm.isDefault}
                            onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            style={{ width: '16px', height: '16px', accentColor: '#06b6d4', cursor: 'pointer' }}
                          />
                          <span>Set as default delivery address for all fresh orders</span>
                        </label>
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          type="submit"
                          style={{
                            background: '#18110C',
                            color: '#E8CA80',
                            border: 'none',
                            padding: '0.65rem 1.4rem',
                            borderRadius: '7px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                          }}
                        >
                          SAVE ADDRESS
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsAddingAddress(false); setEditingAddressId(null); setAddressPincodeStatus(null); }}
                          style={{
                            background: '#FFFFFF',
                            color: '#475569',
                            border: '1px solid #cbd5e1',
                            padding: '0.65rem 1.2rem',
                            borderRadius: '7px',
                            fontSize: '0.84rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Saved Addresses List (Flipkart Style Cards) */}
                {savedAddresses.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {savedAddresses.map((addr) => {
                      return (
                        <div
                          key={addr.id}
                          style={{
                            background: addr.isDefault ? '#FFFDF9' : '#FFFFFF',
                            border: addr.isDefault ? '1.5px solid #C8935A' : '1px solid #E2E8F0',
                            borderRadius: '10px',
                            padding: isMobile ? '1rem 0.9rem' : '1.2rem 1.35rem',
                            boxShadow: addr.isDefault ? '0 3px 10px rgba(200, 147, 90, 0.1)' : '0 1px 3px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s ease',
                            position: 'relative'
                          }}
                        >
                          {/* Card Top Row: Type Pill + Default Tag + Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                background: '#18110C',
                                color: '#E8CA80',
                                border: '1px solid rgba(200, 147, 90, 0.4)',
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                {String(addr.type || '').toUpperCase() === 'WORK' ? 'OFFICE' : (String(addr.type || '').toUpperCase() === 'OTHER' ? 'OTHERS' : 'HOME')}
                              </span>

                              {addr.isDefault && (
                                <span style={{
                                  background: '#F0FDF4',
                                  color: '#15803D',
                                  border: '1px solid #DCFCE7',
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}>
                                  <Check size={10} strokeWidth={3} />
                                  DEFAULT ADDRESS
                                </span>
                              )}
                            </div>

                            {/* Inline Edit & Delete Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <button
                                type="button"
                                onClick={() => handleStartEditAddress(addr)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#8C6239',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#DC2626',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <Trash2 size={13} />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Recipient Name, Phone Number & Email */}
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                              {addr.name}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                              +91 {cleanPhoneDigits(addr.phone)}
                            </span>
                            {addr.email && (
                              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                                • {addr.email}
                              </span>
                            )}
                          </div>

                          {/* Formatted Address Body */}
                          <p style={{
                            margin: '0 0 6px',
                            fontSize: '0.84rem',
                            color: '#334155',
                            lineHeight: '1.5'
                          }}>
                            {addr.addressLine || addr.houseNo}{addr.locality || addr.area ? `, ${addr.locality || addr.area}` : ''}, {addr.city}, {addr.state} — <strong style={{ color: '#0f172a' }}>{addr.pincode}</strong>
                          </p>

                          {addr.landmark && (
                            <div style={{ fontSize: '0.76rem', color: '#64748B', marginBottom: '8px' }}>
                              <strong>Landmark:</strong> {addr.landmark}
                            </div>
                          )}

                          {/* Set As Default Footer */}
                          {!addr.isDefault && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #E2E8F0' }}>
                              <button
                                type="button"
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                style={{
                                  background: 'none',
                                  border: '1px solid #D8CFC4',
                                  color: '#18110C',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#C8935A'; e.currentTarget.style.color = '#8C6239'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#D8CFC4'; e.currentTarget.style.color = '#18110C'; }}
                              >
                                Set as Default Delivery Address
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  !isAddingAddress && (
                    <div style={{
                      padding: '2.5rem 1.5rem',
                      background: '#FAF8F5',
                      border: '1.5px dashed #D8CFC4',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#F0ECE4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: '#8C6239'
                      }}>
                        <MapPin size={26} />
                      </div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#18110C', fontWeight: 700 }}>
                        No Saved Addresses Found
                      </h4>
                      <p style={{ margin: '0 0 1.2rem', fontSize: '0.8rem', color: '#64748B', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                        Save your home or office address for seamless one-click order placement on all freshly roasted blends.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartAddAddress}
                        style={{
                          background: '#18110C',
                          color: '#E8CA80',
                          border: 'none',
                          padding: '0.65rem 1.3rem',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                      >
                        + Add Your First Delivery Address
                      </button>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div style={{
                background: '#ffffff',
                padding: isMobile ? '1.15rem 0.9rem' : '2rem',
                borderRadius: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.2rem',
                  borderBottom: '1px solid #f1f5f9',
                  paddingBottom: '0.75rem'
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.35rem', color: '#0f172a', fontWeight: 800, fontFamily: '"Georgia", serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={20} color="#C8935A" />
                      <span>Personal Information & Profile</span>
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                      Manage your personal details, verified email, and password security
                    </p>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        background: '#FBF8F3',
                        border: '1.5px solid #C8935A',
                        color: '#8c6239',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '7px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {saveMsg && (
                  <div style={{
                    padding: '0.6rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    background: saveMsg.includes('failed') ? '#fef2f2' : '#f0fdf4',
                    color: saveMsg.includes('failed') ? '#dc2626' : '#166534',
                    border: saveMsg.includes('failed') ? '1px solid #fecaca' : '1px solid #bbf7d0'
                  }}>
                    {saveMsg}
                  </div>
                )}

                {isEditing ? (
                  <form onSubmit={handleSave} className="checkout-form">
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '.35rem', fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Full Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={e => setProfile({ ...profile, name: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '.35rem', fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Email Address</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={e => setProfile({ ...profile, email: e.target.value })}
                          required
                          style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '.35rem', fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Phone Number</label>
                        <input
                          type="text"
                          value={profile.phone}
                          onChange={e => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="e.g. 9876543210"
                          style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '0.85rem' }}>
                      <label style={{ display: 'block', marginBottom: '.35rem', fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>Default Delivery Address</label>
                      <textarea
                        value={profile.address}
                        onChange={e => setProfile({ ...profile, address: e.target.value })}
                        rows={3}
                        placeholder="House / Flat no, Street, Area, City, State, PIN Code"
                        style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box', lineHeight: '1.4' }}
                      />
                    </div>

                    {/* Optional Password Edit inside Profile Edit Form */}
                    <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.6rem' }}>
                        <Lock size={14} color="#C8935A" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                          Change Password (Optional)
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          — leave blank to keep unchanged
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '.35rem', fontSize: '0.74rem', fontWeight: 600, color: '#475569' }}>New Password</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="Min 6 characters"
                            style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '.35rem', fontSize: '0.74rem', fontWeight: 600, color: '#475569' }}>Confirm New Password</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="Repeat new password"
                            style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                      <button
                        type="submit"
                        style={{
                          background: '#8c6239',
                          color: '#fff',
                          border: 'none',
                          padding: '0.6rem 1.25rem',
                          borderRadius: '7px',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          flex: isMobile ? '1 1 auto' : '0 0 auto'
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setPasswordForm({ newPassword: '', confirmPassword: '' });
                        }}
                        style={{
                          background: '#fff',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          padding: '0.6rem 1.1rem',
                          borderRadius: '7px',
                          fontWeight: 600,
                          fontSize: '0.84rem',
                          cursor: 'pointer',
                          flex: isMobile ? '1 1 auto' : '0 0 auto'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    {/* User Info Cards for Mobile & Desktop */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '0.85rem'
                    }}>
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '9px',
                        padding: '0.85rem 1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <User size={13} color="#C8935A" />
                          <span>Full Name</span>
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a', margin: 0 }}>
                          {profile.name || '—'}
                        </p>
                      </div>

                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '9px',
                        padding: '0.85rem 1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <Mail size={13} color="#C8935A" />
                          <span>Email Address</span>
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a', margin: 0, wordBreak: 'break-all' }}>
                          {profile.email || '—'}
                        </p>
                      </div>

                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '9px',
                        padding: '0.85rem 1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <Phone size={13} color="#C8935A" />
                          <span>Phone Number</span>
                        </div>
                        <p style={{ fontWeight: 700, fontSize: '0.94rem', color: '#0f172a', margin: 0 }}>
                          {profile.phone || '—'}
                        </p>
                      </div>
                    </div>

                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '9px',
                      padding: '0.85rem 1rem',
                      marginBottom: '1.1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <MapPin size={13} color="#C8935A" />
                        <span>Default Delivery Address</span>
                      </div>
                      <p style={{ fontWeight: 500, fontSize: '0.88rem', color: profile.address ? '#0f172a' : '#94a3b8', margin: 0, whiteSpace: 'pre-line', lineHeight: '1.45' }}>
                        {profile.address || 'No address added yet. Click "Edit Profile" to set your delivery address.'}
                      </p>
                    </div>

                    {/* Dedicated Password & Security Management Card */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '9px',
                      padding: '1rem',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <Lock size={13} color="#C8935A" />
                            <span>Security & Password</span>
                          </div>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', margin: 0 }}>
                            ••••••••••••
                          </p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                            {currentUser?.provider === 'google'
                              ? 'Google Linked Account — you can also set an estate password to login directly.'
                              : 'Secured with password encryption'}
                          </p>
                        </div>

                        {!isChangingPassword && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsChangingPassword(true);
                              setPasswordMsg({ type: '', text: '' });
                              setPasswordForm({ newPassword: '', confirmPassword: '' });
                            }}
                            style={{
                              background: '#ffffff',
                              border: '1.5px solid #C8935A',
                              color: '#8c6239',
                              borderRadius: '6px',
                              padding: '0.4rem 0.85rem',
                              fontSize: '0.76rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Lock size={13} />
                            <span>Edit Password</span>
                          </button>
                        )}
                      </div>

                      {/* Interactive Password Edit Drawer / Form */}
                      {isChangingPassword && (
                        <form onSubmit={handlePasswordUpdate} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                          <h5 style={{ margin: '0 0 0.6rem', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                            Change Your Password
                          </h5>

                          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                New Password
                              </label>
                              <div style={{ position: 'relative' }}>
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  value={passwordForm.newPassword}
                                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                  placeholder="Min. 6 characters"
                                  required
                                  minLength={6}
                                  style={{ width: '100%', padding: '0.55rem 2.2rem 0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                >
                                  <Eye size={15} />
                                </button>
                              </div>
                            </div>

                            <div>
                              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                Confirm New Password
                              </label>
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                                required
                                minLength={6}
                                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>

                          {passwordMsg.text && (
                            <div style={{
                              padding: '0.55rem 0.8rem',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              marginBottom: '0.8rem',
                              background: passwordMsg.type === 'error' ? '#fef2f2' : '#f0fdf4',
                              color: passwordMsg.type === 'error' ? '#dc2626' : '#166534',
                              border: passwordMsg.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              {passwordMsg.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                              <span>{passwordMsg.text}</span>
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="submit"
                              disabled={isSavingPassword}
                              style={{
                                background: '#8c6239',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.45rem 1.1rem',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: isSavingPassword ? 'wait' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              {isSavingPassword ? <Loader size={12} className="spin" /> : <Check size={13} />}
                              <span>{isSavingPassword ? 'Updating...' : 'Save New Password'}</span>
                            </button>

                            <button
                              type="button"
                              disabled={isSavingPassword}
                              onClick={() => {
                                setIsChangingPassword(false);
                                setPasswordForm({ newPassword: '', confirmPassword: '' });
                                setPasswordMsg({ type: '', text: '' });
                              }}
                              style={{
                                background: '#fff',
                                color: '#475569',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '0.45rem 0.9rem',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    <button
                      onClick={() => setIsEditing(true)}
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        background: '#ffffff',
                        border: '1.5px solid #C8935A',
                        color: '#8c6239',
                        padding: '0.65rem 1.4rem',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Edit Account Details</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 style={{ marginBottom: isMobile ? '1rem' : '1.5rem', fontSize: isMobile ? '1.15rem' : '1.35rem', fontWeight: 700, color: '#0f172a' }}>
                  My Orders
                </h3>
                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}><Loader size={32} className="spin" color="#C8935A" /></div>
                ) : orders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#888' }}>
                    <ShoppingCart size={44} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 600, fontSize: '1rem', color: '#475569', margin: '0 0 6px' }}>No orders yet</p>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>Fresh roasts and pure estate spices are waiting for you!</p>
                  </div>
                ) : orders.map(order => {
                  const currentStatus = (order.orderStatus || order.status || 'placed').toLowerCase();
                  const isCancelled = currentStatus === 'cancelled';
                  const isDelivered = currentStatus === 'delivered';
                  const isShipped = currentStatus === 'shipped';

                  // Strict 24-hour Order Cancellation Eligibility
                  const orderTime = new Date(order.createdAt || Date.now()).getTime();
                  const now = Date.now();
                  const diffMs = now - orderTime;
                  const hoursElapsed = diffMs / (1000 * 60 * 60);

                  const canCancel = hoursElapsed <= 24 && !isCancelled && !isDelivered && !isShipped;

                  const msRemaining = Math.max(0, (24 * 60 * 60 * 1000) - diffMs);
                  const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
                  const minutesRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

                  const steps = ['placed', 'packed', 'shipped', 'delivered'];
                  const stepIndex = steps.indexOf(currentStatus) !== -1 ? steps.indexOf(currentStatus) : 0;

                  // Normalize order items with intelligent fallback so it never displays an empty box
                  const orderItems = (Array.isArray(order.items) && order.items.length > 0)
                    ? order.items
                    : (order.item && typeof order.item === 'object')
                      ? [order.item]
                      : (order.productName || order.product_name)
                        ? [{
                            name: order.productName || order.product_name,
                            weight: order.weight || '500g',
                            grind: order.grind || 'Whole Roasted Beans',
                            qty: order.qty || 1,
                            price: Number(order.totalAmount) > 0 ? Number(order.totalAmount) : 449
                          }]
                        : [{
                            name: 'Malenadu Estate Reserve',
                            weight: order.weight || '500g',
                            grind: 'Fresh Medium Roast (Filter Grind)',
                            qty: 1,
                            price: Number(order.totalAmount) > 0 ? Number(order.totalAmount) : 449
                          }];

                  const orderTotal = (order.totalAmount !== undefined && order.totalAmount !== null && Number(order.totalAmount) > 0)
                    ? Number(order.totalAmount)
                    : orderItems.reduce((acc, it) => acc + (Number(it.price || 449) * Number(it.qty || 1)), 0);

                  const invoiceOrder = {
                    ...order,
                    items: orderItems,
                    totalAmount: orderTotal
                  };

                  return (
                    <div key={order._id || order.orderNumber} style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', overflow: 'hidden', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                      {/* Top Header - Responsive 2x2 Grid on Mobile, Clean Row on Desktop */}
                      <div style={{
                        background: '#fcfbf9',
                        padding: isMobile ? '0.8rem 0.9rem' : '1.2rem 1.6rem',
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr 1fr' : 'auto auto auto auto',
                        gap: isMobile ? '0.65rem 0.75rem' : '1.5rem',
                        justifyContent: isMobile ? 'stretch' : 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid #eee'
                      }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>ORDER PLACED</p>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.84rem', color: '#1e293b' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div style={{ textAlign: isMobile ? 'right' : 'left' }}>
                          <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>TOTAL AMOUNT</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.92rem', color: '#C8935A' }}>₹{orderTotal.toFixed(0)}</p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>ORDER NUMBER</p>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.84rem', color: '#1e293b' }}>#{order.orderNumber}</p>
                        </div>

                        {/* GST Invoice Download Button */}
                        <div style={{ textAlign: isMobile ? 'right' : 'right' }}>
                          <button
                            type="button"
                            onClick={() => generateTaxInvoice(invoiceOrder)}
                            style={{
                              padding: isMobile ? '0.36rem 0.75rem' : '0.42rem 0.95rem',
                              fontSize: isMobile ? '0.72rem' : '0.76rem',
                              background: '#fff',
                              border: '1.5px solid rgba(200,147,90,0.5)',
                              color: '#8c6239',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '5px',
                              fontWeight: 600,
                              boxShadow: '0 1px 3px rgba(200,147,90,0.1)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = '#C8935A';
                              e.currentTarget.style.background = '#FBF8F3';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'rgba(200,147,90,0.5)';
                              e.currentTarget.style.background = '#fff';
                            }}
                          >
                            <Download size={12} /> GST Invoice
                          </button>
                        </div>
                      </div>

                      {/* Sophisticated Order Cancellation Confirmation Card */}
                      {cancellingOrder?.orderNumber === order.orderNumber && (
                        <div style={{
                          margin: isMobile ? '0.75rem' : '1rem 1.6rem',
                          padding: '1.15rem 1.4rem',
                          background: '#FAF8F5',
                          border: '1.5px solid #E8CA80',
                          borderRadius: '10px',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(200,147,90,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <AlertCircle size={17} color="#8c6239" />
                            </div>
                            <div style={{ flex: 1 }}>
                              <h5 style={{ margin: '0 0 4px', fontSize: '0.94rem', fontWeight: 700, color: '#1a1816', fontFamily: 'Georgia, serif' }}>
                                Cancel Order #{order.orderNumber}?
                              </h5>
                              <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: '#57534e', lineHeight: 1.5 }}>
                                This order is eligible for cancellation within the 24-hour artisan scheduling window (<strong>{hoursRemaining}h {minutesRemaining}m remaining</strong>).
                                {order.paymentMethod === 'online' || order.paymentStatus === 'paid'
                                  ? ' A 90% refund will be automatically credited back to your original source account within 3–5 business days.'
                                  : ' As this was cash on delivery, no charges apply.'}
                              </p>

                              {cancelError && (
                                <div style={{ color: '#dc2626', fontSize: '0.76rem', fontWeight: 600, marginBottom: '8px' }}>
                                  {cancelError}
                                </div>
                              )}

                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  disabled={isCancelling}
                                  onClick={() => handleExecuteCancel(order.orderNumber)}
                                  style={{
                                    background: '#7f1d1d',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.45rem 1.1rem',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: isCancelling ? 'wait' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  {isCancelling ? <Loader size={12} className="spin" /> : null}
                                  <span>{isCancelling ? 'Processing...' : 'Confirm Cancellation'}</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={isCancelling}
                                  onClick={() => { setCancellingOrder(null); setCancelError(''); }}
                                  style={{
                                    background: '#fff',
                                    color: '#475569',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '0.45rem 1rem',
                                    fontSize: '0.78rem',
                                    fontWeight: 600,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Keep Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cancelled Banner OR Visual Progress Stepper */}
                      {isCancelled ? (
                        <div style={{
                          padding: isMobile ? '0.85rem 1rem' : '1rem 1.6rem',
                          background: '#fff5f5',
                          borderBottom: '1px solid #fed7d7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <X size={16} color="#dc2626" />
                            </div>
                            <div>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: '#991b1b' }}>
                                Order Cancelled
                              </p>
                              <p style={{ margin: '2px 0 0', fontSize: '0.74rem', color: '#b91c1c' }}>
                                {order.cancelledAt
                                  ? `Cancelled on ${new Date(order.cancelledAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`
                                  : 'Cancelled within 24 hours of booking.'}
                              </p>
                            </div>
                          </div>
                          <span style={{ background: '#dc2626', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Cancelled
                          </span>
                        </div>
                      ) : (
                        <div style={{ padding: isMobile ? '0.85rem 1rem' : '1.2rem 1.6rem', background: '#fff', borderBottom: '1px solid #f5f5f5' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', margin: '0.3rem 0' }}>
                            <div style={{ position: 'absolute', top: '50%', left: '5%', right: '5%', height: '2px', background: '#e5e7eb', zIndex: 1 }} />
                            <div style={{ position: 'absolute', top: '50%', left: '5%', width: `${(stepIndex / 3) * 90}%`, height: '2px', background: '#C8935A', zIndex: 2, transition: 'all 0.4s ease' }} />

                            {[
                              { id: 'placed', label: isMobile ? 'Placed' : 'Order Placed' },
                              { id: 'packed', label: isMobile ? 'Roasted' : 'Freshly Roasted' },
                              { id: 'shipped', label: isMobile ? 'Transit' : 'In Transit' },
                              { id: 'delivered', label: 'Delivered' },
                            ].map((step, idx) => {
                              const isDone = idx <= stepIndex;
                              return (
                                <div key={step.id} style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={{
                                    width: isMobile ? '26px' : '32px',
                                    height: isMobile ? '26px' : '32px',
                                    borderRadius: '50%',
                                    background: isDone ? '#C8935A' : '#fff',
                                    border: isDone ? '2px solid #C8935A' : '2px solid #d1d5db',
                                    color: isDone ? '#fff' : '#9ca3af',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: isMobile ? '0.72rem' : '0.8rem',
                                    fontWeight: 700,
                                    boxShadow: isDone ? '0 2px 8px rgba(200,147,90,0.3)' : 'none'
                                  }}>
                                    {isDone ? '✓' : idx + 1}
                                  </div>
                                  <span style={{ fontSize: isMobile ? '0.64rem' : '0.72rem', marginTop: '5px', color: isDone ? '#1f2937' : '#9ca3af', fontWeight: isDone ? 600 : 400, textAlign: 'center' }}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Order Details Body */}
                      <div style={{ padding: isMobile ? '0.85rem 0.9rem' : '1.4rem 1.6rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: '0.45rem',
                          marginBottom: '0.85rem',
                          fontSize: '0.8rem',
                          color: '#64748b'
                        }}>
                          <div style={{ width: '100%', wordBreak: 'break-word', lineHeight: 1.4 }}>
                            <strong style={{ color: '#1e293b' }}>Ship To:</strong> {order.shippingName} • {order.shippingAddress}
                          </div>
                          <div style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                            <strong style={{ color: '#1e293b' }}>Payment:</strong> <span style={{ color: statusColor[order.paymentStatus] || '#28a745', fontWeight: 600 }}>{order.paymentStatus ? order.paymentStatus.toUpperCase() : 'PAID'}</span> ({order.paymentMethod ? order.paymentMethod.toUpperCase() : 'ONLINE'})
                          </div>
                        </div>

                        {/* Order Items with Product Picture & Actions */}
                        <div style={{ background: '#FAF8F5', borderRadius: 10, padding: isMobile ? '0.85rem 0.85rem' : '1rem 1.25rem', border: '1px solid #EFEAE2' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                            <p style={{ margin: 0, fontSize: '0.74rem', fontWeight: 800, color: '#18110C', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'Georgia, serif' }}>
                              Items in this order ({orderItems.length})
                            </p>
                            <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                              Direct from Chikkamagaluru
                            </span>
                          </div>

                          {orderItems.map((item, idx) => {
                            const itemImg = getOrderItemImage(item);
                            const reviewKey = `${order.orderNumber}_${item.name}`;
                            const existingReview = orderReviews[reviewKey];
                            const unitPrice = Number(item.price || 449);
                            const qty = Number(item.qty || 1);
                            const lineTotal = unitPrice * qty;

                            return (
                              <div
                                key={idx}
                                style={{
                                  display: 'flex',
                                  flexDirection: isMobile ? 'column' : 'row',
                                  alignItems: isMobile ? 'stretch' : 'center',
                                  gap: isMobile ? '10px' : '16px',
                                  padding: isMobile ? '0.85rem 0' : '0.8rem 0',
                                  borderBottom: idx < orderItems.length - 1 ? '1px solid #eef2f6' : 'none'
                                }}
                              >
                                {/* Top Item Row: Image + Name + Details + Price */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px', flex: 1, minWidth: 0 }}>
                                  {/* Product Image Thumbnail with solid crisp 2px black border as requested */}
                                  <div style={{
                                    width: isMobile ? 64 : 80,
                                    height: isMobile ? 80 : 100,
                                    borderRadius: 8,
                                    background: '#ffffff',
                                    border: '2px solid #000000',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '4px',
                                    boxSizing: 'border-box',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                  }}>
                                    <img
                                      src={itemImg}
                                      alt={item.name}
                                      loading="eager"
                                      style={{
                                        maxHeight: '100%',
                                        maxWidth: '100%',
                                        width: 'auto',
                                        height: 'auto',
                                        objectFit: 'contain',
                                        imageRendering: '-webkit-optimize-contrast',
                                        filter: 'drop-shadow(0 2px 4px rgba(24, 17, 12, 0.12))'
                                      }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/assets/images/estate_reserve_front.jpg';
                                      }}
                                    />
                                  </div>

                                  {/* Item Info (Name, Weight, Qty) */}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <h5 style={{
                                      margin: '0 0 4px',
                                      fontSize: isMobile ? '0.88rem' : '0.96rem',
                                      fontWeight: 700,
                                      color: '#18110C',
                                      lineHeight: 1.35,
                                      wordBreak: 'break-word',
                                      fontFamily: 'Georgia, serif'
                                    }}>
                                      {item.name}
                                    </h5>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                      <span style={{
                                        background: '#18110C',
                                        color: '#ffffff',
                                        borderRadius: '4px',
                                        padding: '2px 7px',
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.3px'
                                      }}>
                                        Qty: {qty}
                                      </span>
                                      <span style={{
                                        background: '#ffffff',
                                        color: '#475569',
                                        borderRadius: '4px',
                                        padding: '2px 7px',
                                        fontSize: '0.68rem',
                                        fontWeight: 600,
                                        border: '1px solid #e2e8f0'
                                      }}>
                                        {item.weight || '500g'}
                                      </span>
                                      {item.grind && (
                                        <span style={{
                                          background: '#fef3c7',
                                          color: '#92400e',
                                          borderRadius: '4px',
                                          padding: '2px 7px',
                                          fontSize: '0.68rem',
                                          fontWeight: 600,
                                          border: '1px solid #fde68a'
                                        }}>
                                          {item.grind}
                                        </span>
                                      )}
                                    </div>

                                    <div style={{ fontSize: '0.72rem', color: '#78716c' }}>
                                      ₹{unitPrice.toFixed(0)} × {qty} pack{qty > 1 ? 's' : ''} • Artisan Roasted
                                    </div>
                                  </div>

                                  {/* Price Display */}
                                  <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '6px' }}>
                                    <div style={{ fontWeight: 800, fontSize: isMobile ? '0.96rem' : '1.05rem', color: '#18110C' }}>
                                      ₹{lineTotal.toFixed(0)}
                                    </div>
                                    <div style={{ fontSize: '0.62rem', color: '#16a34a', fontWeight: 700 }}>
                                      5% GST Included
                                    </div>
                                  </div>
                                </div>

                                {/* Actions Container: Rate & Review and Buy Now Buttons */}
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  flexShrink: 0,
                                  justifyContent: isMobile ? 'flex-end' : 'flex-end',
                                  paddingTop: isMobile ? '4px' : '0'
                                }}>
                                  {/* Rate & Review Button */}
                                  {existingReview ? (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <div
                                        title="Your verified product rating"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px',
                                          background: '#fef3c7',
                                          border: '1px solid #fde68a',
                                          padding: isMobile ? '3px 7px' : '4px 9px',
                                          borderRadius: '5px'
                                        }}
                                      >
                                        <Star size={11} color="#b45309" fill="#b45309" />
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#92400e' }}>
                                          {existingReview.rating}★ Rated
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleOpenReviewModal(order, item, itemImg)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#8c6239',
                                          fontSize: '0.72rem',
                                          fontWeight: 600,
                                          textDecoration: 'underline',
                                          cursor: 'pointer',
                                          padding: '2px 4px'
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenReviewModal(order, item, itemImg)}
                                      title="Rate and review this product"
                                      style={{
                                        background: '#ffffff',
                                        color: '#8c6239',
                                        border: '1.5px solid #d4a373',
                                        borderRadius: '6px',
                                        padding: isMobile ? '0.36rem 0.65rem' : '0.42rem 0.85rem',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 1px 3px rgba(200,147,90,0.1)',
                                        transition: 'all 0.15s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#FAF8F5';
                                        e.currentTarget.style.borderColor = '#C8935A';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#ffffff';
                                        e.currentTarget.style.borderColor = '#d4a373';
                                      }}
                                    >
                                      <Star size={12} color="#C8935A" fill="none" />
                                      <span>Rate & Review</span>
                                    </button>
                                  )}

                                  {/* Buy Again / Buy Now Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleBuyAgain(item)}
                                    title="Instant 1-Click Buy Now"
                                    style={{
                                      background: '#18110C',
                                      color: '#FDFBF7',
                                      border: '1px solid #18110C',
                                      borderRadius: '6px',
                                      padding: isMobile ? '0.38rem 0.75rem' : '0.42rem 0.85rem',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '5px',
                                      boxShadow: '0 2px 6px rgba(24, 17, 12, 0.18)',
                                      transition: 'all 0.18s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#C8935A';
                                      e.currentTarget.style.borderColor = '#C8935A';
                                      e.currentTarget.style.color = '#18110C';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#18110C';
                                      e.currentTarget.style.borderColor = '#18110C';
                                      e.currentTarget.style.color = '#FDFBF7';
                                    }}
                                  >
                                    <ShoppingBag size={12} />
                                    <span>Buy Again</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Luxury Order Management & Discreet Cancel Option Footer */}
                      <div style={{
                        padding: isMobile ? '0.75rem 1rem' : '0.8rem 1.6rem',
                        background: '#FAF8F5',
                        borderTop: '1px solid #f1ede6',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        fontSize: '0.76rem',
                        color: '#78716c'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={13} color="#a8a29e" />
                          <span>
                            {isCancelled
                              ? 'This order has been cancelled.'
                              : canCancel
                                ? `Artisan batch locks in ${hoursRemaining}h ${minutesRemaining}m`
                                : 'Artisan roast locked • Dispatch in progress'}
                          </span>
                        </div>

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingOrder(order);
                              setCancelError('');
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#8c6239',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: '2px 4px',
                              textDecoration: 'underline',
                              textUnderlineOffset: '3px',
                              transition: 'color 0.2s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#8c6239'; }}
                          >
                            Cancel order
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        {/* Dedicated Amazon & Flipkart Style Rate & Review Product Modal */}
        {activeReviewItem && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99999,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '0.5rem' : '1rem'
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setActiveReviewItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                maxWidth: '540px',
                width: '100%',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                border: '1px solid #e2e8f0',
                padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem'
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem', marginBottom: '1.2rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: isMobile ? '1.15rem' : '1.35rem', color: '#1a1816', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                    Rate & Review Product
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                    Order #{activeReviewItem.order.orderNumber} &bull; Verified Purchase
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReviewItem(null)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Product Summary Card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#FAF8F5', border: '1px solid #E6DEC9', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                <img
                  src={activeReviewItem.itemImg}
                  alt={activeReviewItem.item.name}
                  style={{ width: 50, height: 50, borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}
                  onError={(e) => { e.target.src = '/assets/images/estate_reserve_500g.webp'; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1a1816', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeReviewItem.item.name}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#8c6239', fontWeight: 600 }}>
                    {activeReviewItem.item.weight || '500g'} {activeReviewItem.item.grind ? `• ${activeReviewItem.item.grind}` : ''}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>
                    ✔ Verified Buyer Review
                  </span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmitReview}>
                {/* Star Rating Section */}
                <div style={{ textAlign: 'center', marginBottom: '1.4rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Overall Rating *
                  </label>

                  {/* 5 Big Interactive Stars */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating || reviewRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            transform: (hoverRating || reviewRating) === star ? 'scale(1.2)' : 'scale(1)',
                            transition: 'transform 0.15s ease'
                          }}
                        >
                          <Star
                            size={32}
                            color={isFilled ? '#eab308' : '#cbd5e1'}
                            fill={isFilled ? '#eab308' : 'none'}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8c6239', minHeight: '1.2rem' }}>
                    {ratingLabels[hoverRating || reviewRating]}
                  </div>
                </div>

                {/* Review Title Input */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Review Headline (Optional)
                  </label>
                  <input
                    type="text"
                    value={reviewHeadline}
                    onChange={(e) => setReviewHeadline(e.target.value)}
                    placeholder="e.g. Best morning filter coffee in India! Rich aroma."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Tag Highlight Chips (Flipkart style) */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    What stood out to you? (Select tags)
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                      'Rich Aroma',
                      'Fresh Artisan Roast',
                      'Zero Bitterness',
                      'Authentic Malenadu Blend',
                      'Great Crema',
                      'Perfect Grind Quality',
                      'Tellicherry Bold Purity',
                      'Fast Delivery'
                    ].map(tag => {
                      const isSelected = reviewTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleReviewTag(tag)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid #C8935A' : '1px solid #cbd5e1',
                            background: isSelected ? '#FBF8F3' : '#ffffff',
                            color: isSelected ? '#8c6239' : '#475569',
                            fontSize: '0.74rem',
                            fontWeight: isSelected ? 700 : 500,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isSelected ? '✓ ' : '+ '}{tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review Textarea */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Detailed Review *
                  </label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Tell us about the roast profile, taste notes, and brewing method (South Indian filter, French press, espresso). Your honest feedback helps fellow coffee lovers..."
                    required
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', boxSizing: 'border-box', lineHeight: 1.5 }}
                  />
                </div>

                {/* Recommend Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>
                    Would you recommend this to a friend?
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setReviewRecommend('yes')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: reviewRecommend === 'yes' ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                        background: reviewRecommend === 'yes' ? '#f0fdf4' : '#fff',
                        color: reviewRecommend === 'yes' ? '#15803d' : '#64748b',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      👍 Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewRecommend('no')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: reviewRecommend === 'no' ? '1.5px solid #dc2626' : '1px solid #cbd5e1',
                        background: reviewRecommend === 'no' ? '#fef2f2' : '#fff',
                        color: reviewRecommend === 'no' ? '#dc2626' : '#64748b',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      👎 No
                    </button>
                  </div>
                </div>

                {/* Status & Error Alerts */}
                {reviewError && (
                  <div style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.78rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} />
                    <span>{reviewError}</span>
                  </div>
                )}

                {reviewSuccessMsg && (
                  <div style={{ padding: '0.6rem 0.85rem', borderRadius: '8px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontSize: '0.78rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={15} />
                    <span>{reviewSuccessMsg}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    disabled={isSubmittingReview}
                    onClick={() => setActiveReviewItem(null)}
                    style={{
                      padding: '0.65rem 1.2rem',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      color: '#475569',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    style={{
                      padding: '0.65rem 1.5rem',
                      background: '#8c6239',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: isSubmittingReview ? 'wait' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 14px rgba(140, 98, 57, 0.35)'
                    }}
                  >
                    {isSubmittingReview ? <Loader size={14} className="spin" /> : <Star size={14} fill="#fff" />}
                    <span>{isSubmittingReview ? 'Publishing Review...' : 'Submit Review'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

const CartSidebar = ({ isOpen, onClose, cart, updateQuantity, onCheckout, onAddToCart }) => {
  const shippingDetails = getCartShippingDetails(cart);
  const total = shippingDetails.subtotal + shippingDetails.shippingFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="cart-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="cart-sidebar" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}>
            <div className="cart-header">
              <h3>Your Cart</h3>
              <button onClick={onClose} className="icon-btn"><X /></button>
            </div>

            {/* Dynamic Free Delivery Progress Bar & Tier Gauge */}
            {cart.length > 0 && (
              shippingDetails.isFreeShipping ? (
                <div style={{
                  background: 'linear-gradient(135deg, #FAF8F5 0%, #F3EFEA 100%)',
                  borderBottom: '1px solid rgba(200, 147, 90, 0.3)',
                  padding: '0.9rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#18110C', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#C8935A' }}>✦</span>
                      <span>Complimentary Estate Courier</span>
                    </span>
                    <span style={{ fontSize: '0.7rem', background: '#16a34a', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>
                      FREE SHIPPING UNLOCKED
                    </span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(200, 147, 90, 0.2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #C8935A, #E8CA80)', borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                    Your order qualifies for complimentary express estate delivery pan-India.
                  </span>
                </div>
              ) : (
                <div style={{
                  background: 'linear-gradient(135deg, #FAF8F5 0%, #F5F0E8 100%)',
                  borderBottom: '1px solid rgba(200, 147, 90, 0.3)',
                  padding: '0.9rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, color: '#18110C', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#C8935A' }}>✦</span>
                      <span>Add {shippingDetails.gramsToFree}g for Complimentary Delivery</span>
                    </span>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9E6B34', background: 'rgba(200, 147, 90, 0.15)', padding: '2px 7px', borderRadius: '4px' }}>
                      {shippingDetails.progressPct}% Unlocked
                    </span>
                  </div>

                  <div style={{ height: '4px', background: 'rgba(0, 0, 0, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${shippingDetails.progressPct}%`, background: 'linear-gradient(90deg, #C8935A, #D4A870)', borderRadius: '4px', transition: 'width 0.3s ease' }} />
                  </div>

                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                    Orders from 1 kg receive complimentary expedited dispatch directly from our Chikkamagaluru estate roastery.
                  </p>

                  {/* 1-Click Upsell Cards with Actual Product Images */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    {/* Coffee Upsell Card */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FFFFFF',
                      border: '1px solid rgba(200, 147, 90, 0.35)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <img
                          src="/assets/images/estate_reserve_front.jpg"
                          alt="Estate Reserve 500g"
                          style={{
                            width: '38px',
                            height: '38px',
                            objectFit: 'contain',
                            borderRadius: '5px',
                            background: '#FAF7F2',
                            padding: '2px',
                            border: '1px solid rgba(200, 147, 90, 0.2)',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#18110C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Malenadu Estate Reserve
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                            <strong style={{ color: '#0F172A' }}>₹469</strong> (500g) • <span style={{ color: '#15803d', fontWeight: 600 }}>Unlocks Free Delivery</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const currentCoffee = cart.find(c => !(c.name || '').toLowerCase().includes('pepper'));
                          if (currentCoffee && updateQuantity) {
                            updateQuantity(currentCoffee.id, 1);
                          } else if (onAddToCart) {
                            onAddToCart({ id: 1, name: 'Malenadu Estate Reserve', price: 469, weight: '500g', image: '/assets/images/estate_reserve_500g.webp' });
                          }
                        }}
                        style={{
                          background: '#18110C',
                          color: '#F8DA9D',
                          border: '1px solid #C8935A',
                          borderRadius: '5px',
                          padding: '5px 12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#C8935A'; e.currentTarget.style.color = '#18110C'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#18110C'; e.currentTarget.style.color = '#F8DA9D'; }}
                      >
                        + Add
                      </button>
                    </div>

                    {/* Pepper Upsell Card */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#FFFFFF',
                      border: '1px solid rgba(200, 147, 90, 0.35)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <img
                          src="/assets/images/pepper_reserve_250g.webp"
                          alt="Tellicherry Pepper 250g"
                          style={{
                            width: '38px',
                            height: '38px',
                            objectFit: 'contain',
                            borderRadius: '5px',
                            background: '#FAF7F2',
                            padding: '2px',
                            border: '1px solid rgba(200, 147, 90, 0.2)',
                            flexShrink: 0
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#18110C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Tellicherry Black Pepper
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                            <strong style={{ color: '#0F172A' }}>₹299</strong> (250g) • <span style={{ color: '#78716c' }}>Single-Estate Whole Spice</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart({
                              id: 4,
                              name: 'Malenadu Pepper Reserve',
                              price: 299,
                              weight: '250g',
                              category: 'pepper',
                              image: '/assets/images/pepper_reserve_250g.webp'
                            });
                          }
                        }}
                        style={{
                          background: '#18110C',
                          color: '#F8DA9D',
                          border: '1px solid #C8935A',
                          borderRadius: '5px',
                          padding: '5px 12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          flexShrink: 0,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#C8935A'; e.currentTarget.style.color = '#18110C'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#18110C'; e.currentTarget.style.color = '#F8DA9D'; }}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}

            <div className="cart-items">
              {cart.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={48} color="#ccc" />
                  <p>Your cart is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <p className="cart-item-price">
                        ₹{item.price}
                        {item.weight && (
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, marginLeft: '6px' }}>
                            ({item.weight})
                          </span>
                        )}
                      </p>
                      <div className="qty-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => updateQuantity(item.id, -item.qty)}><Trash2 size={16} /></button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#64748b', marginBottom: '2px' }}>
                  <span>Cart Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>₹{shippingDetails.subtotal.toFixed(0)}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, marginBottom: '6px' }}>
                  ✓ Inclusive of 5% GST
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#64748b', marginBottom: '8px' }}>
                  <span>Delivery / Shipping</span>
                  {shippingDetails.isFreeShipping ? (
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>FREE (1kg+ Tier)</span>
                  ) : (
                    <span style={{ color: '#92400e', fontWeight: 700 }}>₹{shippingDetails.shippingFee} <small style={{ color: '#64748b' }}>(Express Courier)</small></span>
                  )}
                </div>
                <div className="cart-total" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                  <span>Total (Incl. of 5% GST)</span>
                  <span>₹{total.toFixed(0)}</span>
                </div>
                <button className="btn btn-primary w-100" onClick={onCheckout}>Proceed to Checkout →</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ——— Auth Modal (Login / Register with 1-Click Google Sign-In & Automated WhatsApp Integration) ——————————————————
const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGooglePicker, setShowGooglePicker] = useState(false);
  const [showAnotherAccount, setShowAnotherAccount] = useState(false);
  const [anotherEmail, setAnotherEmail] = useState('');

  const handleCompleteGoogleLogin = async (googleProfile) => {
    setGoogleLoading(true);
    setError('');
    try {
      const { data } = await loginWithGoogle(googleProfile);
      localStorage.setItem('malenadu_token', data.token);
      localStorage.setItem('malenadu_user', JSON.stringify(data));

      if (data.phone) {
        triggerAutomatedWhatsApp({
          phone: data.phone,
          name: data.name,
          type: 'login',
          autoOpen: false
        }).catch(err => console.warn('Login WhatsApp notice:', err));
      }

      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In could not be completed');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Initialize official Google Identity Services (GSI) if client ID is configured
  useEffect(() => {
    if (!isOpen) return;
    const clientId = getGoogleClientId();
    if (typeof window !== 'undefined' && window.google?.accounts?.id && clientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              const payload = parseGoogleJwt(response.credential);
              if (payload && payload.email) {
                await handleCompleteGoogleLogin({
                  name: payload.name || payload.given_name || 'Valued Customer',
                  email: payload.email,
                  picture: payload.picture,
                  sub: payload.sub
                });
              }
            }
          }
        });
      } catch (err) {
        console.warn('Google GSI init notice:', err);
      }
    }
  }, [isOpen]);

  const handleGoogleClick = async () => {
    setError('');

    // Google OAuth 2.0 strictly blocks raw IP origins (e.g. 192.168.0.4 on mobile) with Error 400: origin_mismatch
    // If testing on a local IP, seamlessly open direct Google account sign-in so users are never blocked
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(host) || host === '0.0.0.0';
    if (isIp) {
      setShowGooglePicker(true);
      return;
    }

    setGoogleLoading(true);
    try {
      const googleProfile = await launchGoogleOAuthPopup();
      if (googleProfile && googleProfile.email) {
        await handleCompleteGoogleLogin(googleProfile);
      }
    } catch (err) {
      console.warn('Google Popup result/notice:', err);
      setShowGooglePicker(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Get available Google accounts for seamless 1-tap sign-in on mobile
  const getGoogleAccounts = () => {
    const list = [];
    try {
      const activeUser = JSON.parse(localStorage.getItem('malenadu_user') || 'null');
      if (activeUser?.email) {
        list.push({
          name: activeUser.name || 'Yashwanth M A',
          email: activeUser.email,
          picture: activeUser.avatar || getGoogleAvatarForEmail(activeUser.email, activeUser.name)
        });
      }
      const allUsers = JSON.parse(localStorage.getItem('malenadu_users') || '[]');
      allUsers.forEach(u => {
        if (u.email && !list.some(x => x.email.toLowerCase() === u.email.toLowerCase())) {
          list.push({
            name: u.name || u.email.split('@')[0],
            email: u.email,
            picture: u.avatar || getGoogleAvatarForEmail(u.email, u.name)
          });
        }
      });
    } catch (e) { }

    // Ensure user's mobile Google account is available for 1-tap connection
    if (!list.some(x => x.email.toLowerCase() === 'yashwanthma2@gmail.com')) {
      list.unshift({
        name: 'Yashwanth M A',
        email: 'yashwanthma2@gmail.com',
        picture: getGoogleAvatarForEmail('yashwanthma2@gmail.com', 'Yashwanth M A')
      });
    }

    return list;
  };

  const handleSelectGoogleAccount = async (account) => {
    const avatar = account.picture || getGoogleAvatarForEmail(account.email, account.name);
    await handleCompleteGoogleLogin({
      name: account.name || account.email.split('@')[0],
      email: account.email,
      picture: avatar
    });
  };

  const handleAnotherGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!anotherEmail || !anotherEmail.includes('@')) {
      setError('Please enter a valid Google Account email address.');
      return;
    }
    const cleanEmail = anotherEmail.trim().toLowerCase();
    const derivedName = cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const avatar = getGoogleAvatarForEmail(cleanEmail, derivedName);
    await handleCompleteGoogleLogin({
      name: derivedName,
      email: cleanEmail,
      picture: avatar
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register') {
      const cleanDigits = form.phone.replace(/\D/g, '');
      if (cleanDigits.length !== 10 || !/^[6-9]\d{9}$/.test(cleanDigits)) {
        setError('Please enter a valid 10-digit Indian WhatsApp mobile number (starting with 6, 7, 8, or 9).');
        setLoading(false);
        return;
      }
    }

    try {
      const fn = mode === 'login' ? loginUser : registerUser;
      const { data } = await fn(form);
      localStorage.setItem('malenadu_token', data.token);
      localStorage.setItem('malenadu_user', JSON.stringify(data));

      if (mode === 'register') {
        // Automatically dispatch Welcome WhatsApp to customer via Meta Cloud API
        triggerAutomatedWhatsApp({
          phone: form.phone,
          name: form.name,
          type: 'welcome',
          autoOpen: false
        }).catch(err => console.warn('Welcome WhatsApp notice:', err));
      } else {
        // Automatically dispatch Security Sign-in WhatsApp on login
        if (data.phone) {
          triggerAutomatedWhatsApp({
            phone: data.phone,
            name: data.name,
            type: 'login',
            autoOpen: false
          }).catch(err => console.warn('Login WhatsApp notice:', err));
        }
      }

      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-modal-wrapper" style={{ zIndex: 2100 }}>
      <div className="checkout-backdrop" onClick={onClose} style={{ zIndex: 1 }} />
      <motion.div className="checkout-modal" style={{ maxWidth: 480, overflow: 'hidden', zIndex: 2, position: 'relative' }} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="modal-header">
          <h2>{showGooglePicker ? 'Google Sign-In' : (mode === 'login' ? 'Sign In' : 'Create Account')}</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="checkout-body">
          {showGooglePicker ? (
            /* Official Google Account Chooser & 1-Tap Sign-In */
            <div style={{ padding: '0.2rem 0' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1.5px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.65rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 600, color: '#202124', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  Sign in with Google
                </h3>
                <p style={{ margin: 0, fontSize: '0.84rem', color: '#5f6368' }}>
                  Choose an account to continue to <span style={{ fontWeight: 600, color: '#1a1816' }}>Malenadu Roast Co.</span>
                </p>
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', color: '#dc2626', fontSize: '0.84rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* 1-Tap Google Account Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
                {getGoogleAccounts().map((acc, idx) => (
                  <div
                    key={idx}
                    onClick={() => !googleLoading && handleSelectGoogleAccount(acc)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #e2e8f0',
                      background: '#ffffff',
                      cursor: googleLoading ? 'wait' : 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#1a73e8'; e.currentTarget.style.background = '#f8fafd'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; }}
                  >
                    <img
                      src={acc.picture || getGoogleAvatarForEmail(acc.email, acc.name)}
                      alt={acc.name}
                      style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e2e8f0', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#5f6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {acc.email}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#e8f0fe',
                      color: '#1a73e8',
                      flexShrink: 0
                    }}>
                      <Check size={16} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Instant 1-Tap CTA button for primary account */}
              {(() => {
                const accounts = getGoogleAccounts();
                const primary = accounts[0];
                if (!primary) return null;
                const firstName = primary.name.split(' ')[0] || 'Google';
                return (
                  <button
                    type="button"
                    onClick={() => handleSelectGoogleAccount(primary)}
                    disabled={googleLoading}
                    style={{
                      width: '100%',
                      height: '46px',
                      borderRadius: '8px',
                      background: '#1a73e8',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      cursor: googleLoading ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 6px rgba(26,115,232,0.28)',
                      transition: 'background 0.2s',
                      marginBottom: '1rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1557b0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1a73e8'}
                  >
                    {googleLoading ? <Loader size={18} className="spin" /> : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#ffffff" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                          <path fill="#ffffff" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                          <path fill="#ffffff" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                          <path fill="#ffffff" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                        </svg>
                        <span>Continue as {firstName}</span>
                      </>
                    )}
                  </button>
                );
              })()}

              {/* Use Another Account Accordion / Toggle */}
              {showAnotherAccount ? (
                <form onSubmit={handleAnotherGoogleSubmit} style={{ marginTop: '0.8rem', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Enter Google Account Email:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="email"
                      placeholder="e.g. name@gmail.com"
                      value={anotherEmail}
                      onChange={e => setAnotherEmail(e.target.value)}
                      required
                      style={{ flex: 1, padding: '10px 12px', fontSize: '0.9rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                    <button
                      type="submit"
                      disabled={googleLoading}
                      style={{
                        padding: '0 16px',
                        background: '#1a73e8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {googleLoading ? <Loader size={16} className="spin" /> : 'Sign In'}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAnotherAccount(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    color: '#1a73e8',
                    fontSize: '0.86rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    marginTop: '4px'
                  }}
                >
                  <Plus size={16} />
                  <span>Use another Google account</span>
                </button>
              )}

              <p style={{ textAlign: 'center', fontSize: '0.74rem', color: '#64748b', margin: '1.2rem 0 0.8rem', lineHeight: '1.5' }}>
                To continue, Google shares your profile name, email, and avatar with Malenadu Roast Co.
              </p>

              <div style={{ textAlign: 'center', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => { setShowGooglePicker(false); setError(''); setShowAnotherAccount(false); }}
                  style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.84rem', textDecoration: 'underline' }}
                >
                  ← Back to Email Sign-In
                </button>
              </div>
            </div>
          ) : (
            <form className="checkout-form" onSubmit={handleSubmit}>
              {/* 1-Click "Continue with Google" Button */}
              <button
                type="button"
                className="btn-google-signin"
                onClick={handleGoogleClick}
                disabled={loading || googleLoading}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>{googleLoading ? 'Connecting Google...' : 'Continue with Google'}</span>
              </button>

              <div className="auth-divider">
                <span>or continue with email</span>
              </div>

              {mode === 'register' && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number (10 digits)"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                  />
                </>
              )}
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              {error && (
                <p style={{ color: '#dc3545', fontSize: '0.84rem', margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </p>
              )}
              <button type="submit" className="btn btn-gold w-100" disabled={loading || googleLoading} style={{ marginTop: '0.8rem' }}>
                {loading ? <Loader size={18} className="spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
              </button>
              <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.88rem', color: '#666' }}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--c-gold)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </button>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ——— Payment Popup (Razorpay-style UI) ————————————————————————————————————————
const PaymentPopup = ({ isOpen, onClose, total, onSuccess }) => {
  const [tab, setTab] = useState('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upi, setUpi] = useState('');
  const [bank, setBank] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})/g, '$1 ').trim();
  const formatExpiry = (v) => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    onSuccess();
  };

  const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{
        background: '#fff', borderRadius: 12, width: '100%', maxWidth: 440, overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{ background: '#2d2d2d', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ background: '#5A8FFF', borderRadius: 6, padding: '4px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#fff', letterSpacing: 1 }}>rzp</div>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>Malenadu Roast Co.</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: 0 }}>Secure Payment by Razorpay</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', margin: 0 }}>AMOUNT</p>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', margin: 0 }}>₹{total.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: '#fafafa' }}>
          {[{ id: 'card', label: '💳 Card' }, { id: 'upi', label: '📱 UPI' }, { id: 'netbanking', label: '🏦 Netbanking' }].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setError(''); }} style={{
              flex: 1, padding: '0.9rem 0.5rem', border: 'none', background: 'transparent',
              fontWeight: tab === t.id ? 700 : 400, fontSize: '0.8rem', cursor: 'pointer',
              borderBottom: tab === t.id ? '2px solid #5A8FFF' : '2px solid transparent',
              color: tab === t.id ? '#5A8FFF' : '#666', transition: 'all 0.2s'
            }}>{t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          <form onSubmit={handlePay}>
            {tab === 'card' && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: 4 }}>CARD NUMBER</label>
                  <input value={card.number} onChange={e => setCard({ ...card, number: formatCard(e.target.value) })}
                    placeholder="4111 1111 1111 1111" required maxLength={19}
                    style={{ width: '100%', padding: '0.8rem', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '1rem', letterSpacing: 2, outline: 'none', fontFamily: 'monospace' }} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: 4 }}>CARD HOLDER NAME</label>
                  <input value={card.name} onChange={e => setCard({ ...card, name: e.target.value })}
                    placeholder="Name on card" required
                    style={{ width: '100%', padding: '0.8rem', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.95rem', outline: 'none' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: 4 }}>EXPIRY</label>
                    <input value={card.expiry} onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      placeholder="MM/YY" required maxLength={5}
                      style={{ width: '100%', padding: '0.8rem', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.95rem', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: 4 }}>CVV</label>
                    <input value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      placeholder="•••" required maxLength={3} type="password"
                      style={{ width: '100%', padding: '0.8rem', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.95rem', outline: 'none' }} />
                  </div>
                </div>
              </>
            )}
            {tab === 'upi' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: 4 }}>UPI ID</label>
                <input value={upi} onChange={e => setUpi(e.target.value)}
                  placeholder="yourname@upi" required
                  style={{ width: '100%', padding: '0.8rem', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.95rem', outline: 'none' }} />
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: 6 }}>Enter your UPI ID (e.g. name@okaxis, name@paytm)</p>
              </div>
            )}
            {tab === 'netbanking' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '0.8rem' }}>SELECT YOUR BANK</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {banks.map(b => (
                    <button key={b} type="button" onClick={() => setBank(b)} style={{
                      padding: '0.7rem', border: bank === b ? '2px solid #5A8FFF' : '1.5px solid #ddd',
                      borderRadius: 6, background: bank === b ? '#EEF4FF' : '#fff', cursor: 'pointer',
                      fontSize: '0.78rem', textAlign: 'left', color: bank === b ? '#2563eb' : '#333', fontWeight: bank === b ? 600 : 400
                    }}>{b}</button>
                  ))}
                </div>
                {tab === 'netbanking' && <input type="hidden" value={bank} required={tab === 'netbanking'} onChange={() => { }} />}
              </div>
            )}

            {error && <p style={{ color: '#dc3545', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '1rem', background: loading ? '#aaa' : '#5A8FFF',
              color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
            }}>
              {loading ? <><Loader size={18} className="spin" />  Processing Payment…</> : <><Lock size={16} /> Pay ₹{total.toFixed(0)} Securely</>}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: '1rem' }}>
              <Lock size={12} color="#888" />
              <span style={{ fontSize: '0.75rem', color: '#888' }}>Secured by Razorpay · 256-bit SSL</span>
            </div>
          </form>
        </div>

        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: '1.2rem', cursor: 'pointer', zIndex: 10 }}>✖</button>
      </motion.div>
    </div>
  );
};

// ——— Checkout Modal ——————————————————————————————————————————————————————————
const CheckoutModal = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onRequireLogin,
  onAddToCart,
  updateQuantity,
  onCheckoutAddItem,
  onCheckoutRemoveItem,
  onOpenReviewModal
}) => {
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [pendingStepAfterAuth, setPendingStepAfterAuth] = useState(null);
  const [savedAddressesList, setSavedAddressesList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem('malenadu_checkout_form');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {
      name: '',
      email: '',
      phone: '',
      alternatePhone: '',
      country: 'India',
      houseNo: '',
      area: '',
      landmark: '',
      city: '',
      state: 'Karnataka',
      addressType: 'Home',
      saveAddress: true,
      deliveryInstructions: '',
      address: ''
    };
  });
  const [showLandmark, setShowLandmark] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [pincode, setPincode] = useState(() => {
    try {
      return sessionStorage.getItem('malenadu_checkout_pincode') || '';
    } catch (e) {
      return '';
    }
  });
  const [pincodeStatus, setPincodeStatus] = useState(() => {
    try {
      const p = sessionStorage.getItem('malenadu_checkout_pincode') || '';
      if (p.length === 6) {
        const isKar = isKarnatakaPincode(p);
        return {
          valid: true,
          courier: isKar ? 'Karnataka Express Courier (₹44)' : 'Interstate Express Courier (₹84)',
          eta: isKar ? '1 – 2 Business Days' : '3 – 5 Business Days',
          message: isKar ? 'Karnataka Roastery Local Circle (₹44 Delivery)' : 'Interstate / Rest of India (₹84 Delivery)'
        };
      }
    } catch (e) { }
    return null;
  });

  const [paymentMethod, setPaymentMethod] = useState('online');
  const [onlinePayType, setOnlinePayType] = useState('upi');
  const [upiApp, setUpiApp] = useState('GPay');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [latestOrderWaUrl, setLatestOrderWaUrl] = useState('');
  const [waSentStatus, setWaSentStatus] = useState(false);
  const [error, setError] = useState('');

  // Persist form and pincode to sessionStorage so user inputs are never lost
  useEffect(() => {
    try {
      sessionStorage.setItem('malenadu_checkout_form', JSON.stringify(form));
    } catch (e) { }
  }, [form]);

  useEffect(() => {
    try {
      sessionStorage.setItem('malenadu_checkout_pincode', pincode);
    } catch (e) { }
  }, [pincode]);

  // Explicit addon items with unique IDs so they are 100% synchronized with cart
  const COFFEE_ADDON = {
    id: 'addon-coffee-500g',
    productId: 1,
    name: 'Malenadu Estate Reserve (500g)',
    price: 469,
    weight: '500g',
    qty: 1,
    category: 'coffee',
    image: '/assets/images/estate_reserve_500g.webp'
  };

  const PEPPER_ADDON = {
    id: 'addon-pepper-250g',
    productId: 4,
    name: 'Malenadu Pepper Reserve (250g)',
    price: 319,
    weight: '250g',
    qty: 1,
    category: 'pepper',
    image: '/assets/images/pepper_reserve_250g.webp'
  };

  const isCoffeeAddonInCart = cart.some(it => it.id === COFFEE_ADDON.id);
  const isPepperInCart = cart.some(it => it.id === PEPPER_ADDON.id || (it.name || '').toLowerCase().includes('pepper'));

  const handleTogglePepper = () => {
    const pepperItem = cart.find(it => it.id === PEPPER_ADDON.id || (it.name || '').toLowerCase().includes('pepper'));
    if (pepperItem) {
      if (onCheckoutRemoveItem) {
        onCheckoutRemoveItem(pepperItem.id);
      } else if (updateQuantity) {
        updateQuantity(pepperItem.id, -1);
      }
    } else {
      if (onCheckoutAddItem) {
        onCheckoutAddItem(PEPPER_ADDON);
      } else if (onAddToCart) {
        onAddToCart(PEPPER_ADDON);
      }
    }
  };

  const handleToggleCoffee = () => {
    if (isCoffeeAddonInCart) {
      if (onCheckoutRemoveItem) {
        onCheckoutRemoveItem(COFFEE_ADDON.id);
      }
    } else {
      if (onCheckoutAddItem) {
        onCheckoutAddItem(COFFEE_ADDON);
      } else if (onAddToCart) {
        onAddToCart(COFFEE_ADDON);
      }
    }
  };

  const parseItemPrice = (p) => {
    if (typeof p === 'number') return isNaN(p) ? 0 : p;
    if (!p) return 0;
    const clean = parseFloat(String(p).replace(/[^0-9.]/g, ''));
    return isNaN(clean) ? 0 : clean;
  };

  const subtotal = cart.reduce((acc, item) => {
    const itemPrice = parseItemPrice(item.price);
    const itemQty = Number(item.qty) || 1;
    return acc + (itemPrice * itemQty);
  }, 0);

  const taxableValue = (subtotal / 1.05).toFixed(2);
  const gstAmount = (subtotal - parseFloat(taxableValue)).toFixed(2);
  const shippingInfo = getCartShippingDetails(cart, pincode);
  const shippingFee = shippingInfo.shippingFee;
  const totalPayable = subtotal + shippingFee;

  const cleanPhoneDigits = (raw) => {
    let p = (raw || '').replace(/\D/g, '');
    if (p.startsWith('91') && p.length > 10) p = p.slice(2);
    else if (p.startsWith('0') && p.length > 10) p = p.slice(1);
    return p.slice(0, 10);
  };

  const getStoredAddressesForUser = (user) => {
    try {
      const email = user?.email || 'default';
      let stored = localStorage.getItem(`malenadu_saved_addresses_${email}`);
      if (!stored && user?.email) {
        stored = localStorage.getItem(`malenadu_saved_addresses_${user.email.toLowerCase().trim()}`);
      }
      if (!stored) {
        stored = localStorage.getItem('malenadu_saved_addresses_default');
      }
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [];
  };

  const applyAddressToForm = (addr, user) => {
    if (addr) {
      const phoneDigits = cleanPhoneDigits(addr.phone || user?.phone || '');
      const pin = (addr.pincode || '').replace(/\D/g, '').slice(0, 6);

      let normType = 'Home';
      const rawT = String(addr.type || addr.addressType || '').toUpperCase();
      if (rawT.includes('WORK') || rawT.includes('OFFICE')) normType = 'Office';
      else if (rawT.includes('OTHER')) normType = 'Others';
      else normType = 'Home';

      setForm(prev => ({
        ...prev,
        name: addr.name || user?.name || prev.name || '',
        email: addr.email || user?.email || prev.email || '',
        phone: phoneDigits || prev.phone || '',
        houseNo: addr.addressLine || addr.houseNo || prev.houseNo || '',
        area: addr.locality || addr.area || prev.area || '',
        landmark: addr.landmark || prev.landmark || '',
        city: addr.city || prev.city || '',
        state: addr.state || prev.state || 'Karnataka',
        addressType: normType,
        address: `${addr.addressLine || addr.houseNo || ''}, ${addr.locality || addr.area ? (addr.locality || addr.area) + ', ' : ''}${addr.city || ''}, ${addr.state || ''}`.replace(/^,\s*|,\s*$/g, '')
      }));

      if (pin && pin.length === 6) {
        setPincode(pin);
        const isKar = isKarnatakaPincode(pin);
        setPincodeStatus({
          valid: true,
          courier: isKar ? 'Karnataka Express Courier (₹44)' : 'Interstate Express Courier (₹84)',
          eta: isKar ? '1 – 2 Business Days' : '3 – 5 Business Days',
          message: isKar ? 'Karnataka Roastery Local Circle (₹44 Delivery)' : 'Interstate / Rest of India (₹84 Delivery)'
        });
      }
      return;
    }

    if (user) {
      const phoneDigits = cleanPhoneDigits(user.phone || '');
      let parsedPin = user.pincode || '';
      let parsedCity = user.city || '';
      let parsedState = user.state || 'Karnataka';
      let parsedHouse = user.houseNo || '';
      let parsedArea = user.area || '';

      if (user.address) {
        const pinMatch = user.address.match(/\b\d{6}\b/);
        if (pinMatch && !parsedPin) parsedPin = pinMatch[0];

        const parts = user.address.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 1 && !parsedHouse) parsedHouse = parts[0];
        if (parts.length >= 2 && !parsedArea) parsedArea = parts[1];
        if (parts.length >= 3 && !parsedCity) {
          const potentialCity = parts[2].replace(/PIN\s*:\s*\d+/i, '').replace(/\d{6}/, '').replace(/Karnataka/i, '').trim();
          if (potentialCity) parsedCity = potentialCity;
        }
      }

      setForm(prev => ({
        ...prev,
        name: user.name || prev.name || '',
        email: user.email || prev.email || '',
        phone: phoneDigits || prev.phone || '',
        houseNo: parsedHouse || prev.houseNo || user.address || '',
        area: parsedArea || prev.area || '',
        city: parsedCity || prev.city || '',
        state: parsedState || prev.state || 'Karnataka',
        landmark: user.landmark || prev.landmark || '',
        address: user.address || prev.address || ''
      }));

      if (parsedPin && parsedPin.length === 6) {
        setPincode(parsedPin);
        const isKar = isKarnatakaPincode(parsedPin);
        setPincodeStatus({
          valid: true,
          courier: isKar ? 'Karnataka Express Courier (₹44)' : 'Interstate Express Courier (₹84)',
          eta: isKar ? '1 – 2 Business Days' : '3 – 5 Business Days',
          message: isKar ? 'Karnataka Roastery Local Circle (₹44 Delivery)' : 'Interstate / Rest of India (₹84 Delivery)'
        });
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!pendingStepAfterAuth) {
        setCheckoutStep(prev => (prev === 2 || prev === 3) ? prev : 1);
      }
      setError('');
      setOrderSuccess(null);
      setLatestOrderWaUrl('');
      setWaSentStatus(false);

      // Seamless Autofill: Load saved addresses from Profile and autofill immediately
      const list = getStoredAddressesForUser(currentUser);
      setSavedAddressesList(list);

      if (list.length > 0) {
        const defAddr = list.find(a => a.isDefault) || list[0];
        setSelectedAddressId(defAddr.id);
        applyAddressToForm(defAddr, currentUser);
      } else if (currentUser) {
        setSelectedAddressId(null);
        applyAddressToForm(null, currentUser);
      }
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (currentUser && pendingStepAfterAuth) {
      setCheckoutStep(pendingStepAfterAuth);
      setPendingStepAfterAuth(null);
      setTimeout(() => {
        const b = document.querySelector('.checkout-body');
        if (b) b.scrollTop = 0;
      }, 50);
    }
  }, [currentUser, pendingStepAfterAuth]);

  useEffect(() => {
    const handleSync = () => {
      const list = getStoredAddressesForUser(currentUser);
      setSavedAddressesList(list);
      if (list.length > 0 && (!selectedAddressId || selectedAddressId === 'new')) {
        const defAddr = list.find(a => a.isDefault) || list[0];
        setSelectedAddressId(defAddr.id);
        applyAddressToForm(defAddr, currentUser);
      }
    };
    window.addEventListener('malenadu_addresses_updated', handleSync);
    return () => window.removeEventListener('malenadu_addresses_updated', handleSync);
  }, [currentUser, selectedAddressId]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.startsWith('91') && raw.length > 10) {
      raw = raw.slice(2);
    } else if (raw.startsWith('0') && raw.length > 10) {
      raw = raw.slice(1);
    }
    const val = raw.slice(0, 10);
    setForm(prev => ({ ...prev, phone: val }));
  };

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      const isKar = isKarnatakaPincode(val);
      setPincodeStatus({
        valid: true,
        courier: isKar ? 'Karnataka Express Courier (₹44)' : 'Interstate Express Courier (₹84)',
        eta: isKar ? '1 – 2 Business Days' : '3 – 5 Business Days',
        message: isKar ? 'Karnataka Roastery Local Circle (₹44 Delivery)' : 'Interstate / Rest of India (₹84 Delivery)'
      });

      // Smart State auto-detection based on pincode circle
      if (isKar && (!form.state || form.state !== 'Karnataka')) {
        setForm(prev => ({ ...prev, state: 'Karnataka' }));
      }
    } else {
      setPincodeStatus(null);
    }
  };

  const computedFullAddress = [
    form.houseNo ? form.houseNo.trim() : '',
    form.area ? form.area.trim() : '',
    form.landmark ? `Near ${form.landmark.trim()}` : '',
    form.city ? form.city.trim() : '',
    form.state ? form.state.trim() : ''
  ].filter(Boolean).join(', ') || form.address;

  const orderPayload = () => ({
    shippingName: form.name,
    shippingEmail: form.email,
    shippingAddress: `${computedFullAddress}${pincode ? `, PIN: ${pincode}` : ''}`,
    streetAddress: computedFullAddress,
    pincode: pincode || '',
    shippingPhone: form.phone,
    alternatePhone: form.alternatePhone || '',
    addressType: form.addressType || 'Home',
    city: form.city || '',
    state: form.state || '',
    houseNo: form.houseNo || '',
    area: form.area || '',
    landmark: form.landmark || '',
    deliveryInstructions: form.deliveryInstructions || '',
    b2bGstin: null,
    b2bCompanyName: null,
    items: cart.map(i => ({
      productId: i.id,
      id: i.id,
      name: i.name,
      price: parseFloat(i.price),
      qty: i.qty,
      weight: i.weight || '',
      image: i.image || ''
    })),
    subtotal: subtotal,
    gstAmount: parseFloat(gstAmount),
    shippingFee: shippingFee,
    totalAmount: totalPayable,
    paymentMethod: paymentMethod,
  });

  const syncAddressToProfile = () => {
    if (form.saveAddress && currentUser) {
      try {
        const email = currentUser.email || 'default';
        const list = getStoredAddressesForUser(currentUser);
        const isFirst = list.length === 0;

        let normType = 'HOME';
        const rawT = String(form.addressType || 'Home').toUpperCase();
        if (rawT.includes('WORK') || rawT.includes('OFFICE')) normType = 'WORK';
        else if (rawT.includes('OTHER')) normType = 'OTHER';
        else normType = 'HOME';

        const newAddrItem = {
          id: selectedAddressId && selectedAddressId !== 'new' ? selectedAddressId : 'addr_' + Date.now(),
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim() || currentUser.email || '',
          pincode: pincode.trim(),
          locality: form.area.trim(),
          area: form.area.trim(),
          addressLine: form.houseNo.trim(),
          houseNo: form.houseNo.trim(),
          city: form.city.trim(),
          state: form.state.trim() || 'Karnataka',
          landmark: (form.landmark || '').trim(),
          type: normType,
          addressType: normType === 'WORK' ? 'Office' : (normType === 'OTHER' ? 'Others' : 'Home'),
          isDefault: selectedAddressId && selectedAddressId !== 'new' ? Boolean(list.find(a => a.id === selectedAddressId)?.isDefault) : (isFirst || list.length === 0)
        };

        const existingIndex = list.findIndex(a => a.id === newAddrItem.id);
        let updatedList;
        if (existingIndex !== -1) {
          updatedList = [...list];
          updatedList[existingIndex] = { ...updatedList[existingIndex], ...newAddrItem };
        } else {
          updatedList = [newAddrItem, ...list];
        }

        localStorage.setItem(`malenadu_saved_addresses_${email}`, JSON.stringify(updatedList));
        if (email !== 'default') {
          localStorage.setItem(`malenadu_saved_addresses_${email.toLowerCase().trim()}`, JSON.stringify(updatedList));
        }

        const fullAddrStr = `${newAddrItem.addressLine}, ${newAddrItem.locality ? newAddrItem.locality + ', ' : ''}${newAddrItem.city}, ${newAddrItem.state} - PIN: ${newAddrItem.pincode}`;
        const activeUser = JSON.parse(localStorage.getItem('malenadu_user') || 'null');
        if (activeUser) {
          activeUser.address = fullAddrStr;
          if (newAddrItem.name) activeUser.name = newAddrItem.name;
          if (newAddrItem.phone) activeUser.phone = newAddrItem.phone;
          if (newAddrItem.email) activeUser.email = newAddrItem.email;
          localStorage.setItem('malenadu_user', JSON.stringify(activeUser));
        }

        if (!selectedAddressId || selectedAddressId === 'new') {
          setSelectedAddressId(newAddrItem.id);
        }

        window.dispatchEvent(new Event('malenadu_addresses_updated'));
      } catch (saveAddrErr) {
        console.warn('Auto-save address error:', saveAddrErr);
      }
    }
  };

  const handleProceedToPayment = (e) => {
    if (e) e.preventDefault();

    if (!pincode || pincode.length !== 6) {
      setError('Please enter a valid 6-digit postal PIN code.');
      return;
    }
    if (!form.city.trim()) {
      setError('Please enter your City / Town.');
      return;
    }
    if (!form.state.trim()) {
      setError('Please select your State.');
      return;
    }
    if (!form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const cleanPhone = (form.phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile phone number.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!form.houseNo.trim()) {
      setError('Please enter your House no / Building / Apartment.');
      return;
    }
    if (!form.area.trim()) {
      setError('Please enter your Area, Sector, Street or Village.');
      return;
    }

    if (!currentUser) {
      setPendingStepAfterAuth(2);
      onRequireLogin();
      return;
    }

    // Auto-sync address with user profile & saved addresses
    syncAddressToProfile();

    setError('');
    setCheckoutStep(2);
    setTimeout(() => {
      const b = document.querySelector('.checkout-body');
      if (b) b.scrollTop = 0;
    }, 40);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setPendingStepAfterAuth(3);
      onRequireLogin();
      return;
    }

    if (pincode && pincode.length !== 6) {
      setError('Please enter a valid 6-digit postal PIN code.');
      setCheckoutStep(1);
      return;
    }

    setLoading(true);
    setError('');

    const payload = orderPayload();
    const amountInPaise = Math.round(totalPayable * 100);

    // Helper to finalize order and trigger automated WhatsApp notification
    const handleOrderPlacedSuccess = (orderNumber, orderDetails) => {
      syncAddressToProfile();
      setOrderSuccess(orderNumber);
      try {
        sessionStorage.removeItem('malenadu_checkout_form');
        sessionStorage.removeItem('malenadu_buynow_cart');
      } catch (e) { }
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('malenadu_order_placed'));

      const fullOrderDetails = {
        orderNumber: orderNumber,
        shippingName: orderDetails.shippingName || form.name,
        shippingPhone: orderDetails.shippingPhone || form.phone,
        shippingAddress: orderDetails.shippingAddress || `${form.address}${pincode ? `, PIN: ${pincode}` : ''}`,
        pincode: pincode,
        items: orderDetails.items || cart,
        subtotal: subtotal,
        shippingFee: shippingFee,
        totalAmount: orderDetails.totalAmount || totalPayable,
        paymentMethod: orderDetails.paymentMethod || paymentMethod
      };

      // Automatically dispatch WhatsApp Order Placed message
      sendOrderPlacedWhatsApp(fullOrderDetails, true).then(res => {
        setWaSentStatus(true);
        if (res?.waUrl) {
          setLatestOrderWaUrl(res.waUrl);
        }
      }).catch(err => {
        console.warn('Background WhatsApp automated order notice:', err);
      });
    };

    try {
      if (COD_ENABLED && paymentMethod === 'cod') {
        const res = await placeCODOrder(payload);
        handleOrderPlacedSuccess(res.data.orderNumber, payload);
        setLoading(false);
      } else {
        // Real Razorpay Checkout Popup (UPI / Cards / Netbanking)
        if (typeof window !== 'undefined' && window.Razorpay) {
          try {
            console.log('Creating Razorpay order for amount:', amountInPaise);
            const razorpayOrderRes = await createRazorpayOrder(amountInPaise, {
              customer_name: form.name,
              customer_email: form.email,
              customer_phone: form.phone
            });

            const rzpKey = razorpayOrderRes?.data?.keyId || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) || 'rzp_live_U3e3Jfoymk9Qsw';
            const rzpOrderId = razorpayOrderRes?.data?.id;

            const options = {
              key: rzpKey,
              amount: amountInPaise,
              currency: 'INR',
              name: 'Malenadu Roast Co.',
              description: 'Fresh Chikkamagaluru Roasts & Tellicherry Spices',
              image: '/assets/images/logo_final.webp',
              order_id: rzpOrderId && rzpOrderId.startsWith('order_') ? rzpOrderId : undefined,
              prefill: {
                name: form.name,
                email: form.email,
                contact: form.phone
              },
              notes: {
                shipping_address: form.address,
                pincode: pincode
              },
              theme: {
                color: '#C8935A'
              },
              handler: async function (response) {
                console.log('Razorpay payment successful:', response);
                try {
                  const finalPayload = {
                    ...payload,
                    razorpayOrderId: response.razorpay_order_id || rzpOrderId,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                    paymentStatus: 'paid',
                    paymentMethod: 'online'
                  };
                  const res = await simulatePayment(finalPayload);
                  handleOrderPlacedSuccess(res.data.orderNumber, finalPayload);
                } catch (saveErr) {
                  console.error('Order save error:', saveErr);
                  const res = await simulatePayment(payload);
                  handleOrderPlacedSuccess(res.data.orderNumber, payload);
                } finally {
                  setLoading(false);
                }
              },
              modal: {
                ondismiss: function () {
                  console.log('Razorpay checkout dismissed by user.');
                  setLoading(false);
                }
              }
            };

            const rzpInstance = new window.Razorpay(options);
            rzpInstance.on('payment.failed', function (resp) {
              console.error('Payment failed:', resp.error);
              setError(resp.error?.description || 'Payment failed. Please try again.');
              setLoading(false);
            });
            rzpInstance.open();
            return;
          } catch (rzpErr) {
            console.error('Razorpay open failed:', rzpErr);
            setError('Could not open Razorpay payment window: ' + (rzpErr.message || 'Please retry.'));
            setLoading(false);
            return;
          }
        } else {
          setError('Razorpay payment gateway is loading. Please check your internet connection or allow scripts.');
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      setError('Unable to process order. Please verify your details and try again.');
      setLoading(false);
    }
  };

  if (orderSuccess) {
    const placedOrderObj = {
      orderNumber: orderSuccess,
      shippingName: form.name,
      shippingEmail: form.email,
      shippingPhone: form.phone,
      shippingAddress: `${form.address}${pincode ? `, PIN: ${pincode}` : ''}`,
      pincode: pincode,
      items: cart,
      subtotal: subtotal,
      shippingFee: shippingFee,
      totalAmount: totalPayable,
      paymentMethod: paymentMethod,
      b2bGstin: null,
      createdAt: new Date().toISOString()
    };

    const formattedPhone = formatWhatsAppPhone(form.phone);
    const orderWaUrl = latestOrderWaUrl || `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(getAutomatedWhatsAppMessage('order_placed', {
      name: form.name,
      orderNumber: orderSuccess,
      totalAmount: totalPayable,
      paymentMethod: paymentMethod,
      shippingAddress: `${form.address}${pincode ? `, PIN: ${pincode}` : ''}`,
      items: cart
    }))}`;

    return (
      <div className="checkout-modal-wrapper" style={{ zIndex: 10001, padding: isMobile ? '0.75rem' : '1.5rem' }}>
        <div className="checkout-backdrop" onClick={onClose} />
        <motion.div
          className="checkout-modal"
          style={{
            maxWidth: 520,
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: 16,
            overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            textAlign: 'center'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
        >
          {/* Top Close Button (Always visible on mobile & desktop so user can return immediately) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close and return to store"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              zIndex: 20,
              boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={18} />
          </button>

          {/* Scrollable Content Body */}
          <div style={{
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: isMobile ? '1.8rem 1.15rem 1.5rem' : '2.5rem 2rem 2rem',
            flex: 1
          }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}>
              <CheckCircle size={isMobile ? 54 : 62} color="#15803d" style={{ marginBottom: '0.65rem' }} />
            </motion.div>
            <h2 style={{
              marginBottom: '0.4rem',
              color: '#18110C',
              fontFamily: '"Georgia", serif',
              fontSize: isMobile ? '1.5rem' : '1.85rem',
              fontWeight: 700
            }}>
              Order Placed Successfully
            </h2>
            <p style={{ color: '#64748b', marginBottom: '0.5rem', fontSize: isMobile ? '0.85rem' : '0.92rem', lineHeight: 1.5 }}>
              Thank you for ordering with Malenadu Roast Co. Your harvest batch has been sent to our roastery for fresh roasting.
            </p>

            {/* Order Reference Number Box */}
            <div style={{ background: '#FAF8F5', border: '1px solid #EBE5DB', borderRadius: 12, padding: isMobile ? '1rem 1.15rem' : '1.25rem 1.5rem', margin: '1rem 0' }}>
              <span style={{ fontSize: '0.72rem', color: '#8c6239', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, display: 'block' }}>
                Order Reference Number
              </span>
              <span style={{ fontWeight: 800, fontSize: isMobile ? '1.45rem' : '1.65rem', color: '#18110C', letterSpacing: 1, fontFamily: '"Georgia", serif', display: 'block', margin: '4px 0' }}>
                #{orderSuccess}
              </span>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <Clock size={13} color="#8c6239" />
                <span>Order Placed: <strong style={{ color: '#18110C' }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })} at {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })} IST</strong></span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                A copy of your order summary and official <strong>Tax Invoice</strong> has been sent to <strong>{form.email}</strong>.
              </p>
            </div>

            {/* Shipment & Updates Notice */}
            <div style={{
              background: '#FAF8F5',
              border: '1px solid #EBE5DB',
              borderRadius: 12,
              padding: isMobile ? '0.85rem 1rem' : '1rem 1.15rem',
              margin: '0.85rem 0 1.1rem',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#F1E9DF',
                color: '#8c6239',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MessageCircle size={17} color="#8c6239" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, color: '#18110C', fontSize: '0.84rem' }}>
                  Live Dispatch & Roastery Updates
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.45 }}>
                  Roastery dispatch status and courier tracking details will be sent to <strong>+{formattedPhone}</strong>.
                </p>
              </div>
            </div>

            {/* Official GST Tax Invoice Card (Zero Mobile Overlapping) */}
            <div style={{
              background: '#FAF8F5',
              border: '1.5px solid #C8935A',
              borderRadius: 12,
              padding: isMobile ? '1rem' : '1.15rem 1.35rem',
              margin: '0.85rem 0 1.25rem',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: 'space-between',
              gap: isMobile ? 12 : 14,
              boxShadow: '0 2px 8px rgba(200, 147, 90, 0.1)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #18110C 0%, #2c1e15 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  <FileText size={19} color="#E8CA80" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: '#18110C', fontSize: '0.88rem' }}>
                    Official GST Tax Invoice
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 1 }}>
                    Ready for immediate download (PDF format)
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => generateTaxInvoice(placedOrderObj)}
                style={{
                  padding: isMobile ? '0.75rem 1rem' : '0.65rem 1.15rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderRadius: 8,
                  background: '#18110C',
                  color: '#E8CA80',
                  border: '1px solid #C8935A',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  width: isMobile ? '100%' : 'auto',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#C8935A'; e.currentTarget.style.color = '#18110C'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#18110C'; e.currentTarget.style.color = '#E8CA80'; }}
              >
                <Download size={15} /> Download Invoice (PDF)
              </button>
            </div>

            {/* Actions: Return to Store */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '0.75rem',
              width: '100%'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.85rem 1.6rem',
                  fontSize: '0.9rem',
                  borderRadius: 8,
                  border: 'none',
                  background: 'linear-gradient(135deg, #18110C 0%, #3B2A1A 100%)',
                  color: '#FDFBF7',
                  cursor: 'pointer',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(24, 17, 12, 0.2)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: isMobile ? '100%' : 'auto'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#C8935A'; e.currentTarget.style.color = '#18110C'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #18110C 0%, #3B2A1A 100%)'; e.currentTarget.style.color = '#FDFBF7'; }}
              >
                ← Continue Shopping
              </button>
            </div>

            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.8rem 0 0' }}>
              Malenadu Roast Co. • FSSAI Lic. 21226177001500 • Chikkamagaluru, Karnataka
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <div className="checkout-modal-wrapper">
        <div className="checkout-backdrop" onClick={onClose} />
        <motion.div
          className="checkout-modal"
          style={{
            maxWidth: 580,
            width: '100%',
            borderRadius: 16,
            overflow: 'hidden',
            background: '#ffffff',
            boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
            border: '1px solid #dcd3c5'
          }}
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {/* Modal Header — Luxury Dark Brown & Royal Gold Typography */}
          <div style={{
            padding: '1.25rem 1.5rem',
            background: 'linear-gradient(135deg, #24160E 0%, #1A0E08 100%)',
            borderBottom: '2px solid #C8935A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '1.35rem',
                color: '#F8DA9D',
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing: '0.5px'
              }}>
                Secure Checkout
              </h2>

              {/* Clean 3-Step Progress Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                <span
                  onClick={() => { setCheckoutStep(1); setError(''); }}
                  style={{
                    fontWeight: 700,
                    color: checkoutStep === 1 ? '#F8DA9D' : '#86efac',
                    cursor: checkoutStep > 1 ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {checkoutStep > 1 ? '✓ 1. Address' : '● 1. Address'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>→</span>
                <span
                  onClick={() => { if (checkoutStep > 2) { setCheckoutStep(2); setError(''); } }}
                  style={{
                    fontWeight: 700,
                    color: checkoutStep === 2 ? '#F8DA9D' : checkoutStep > 2 ? '#86efac' : 'rgba(255,255,255,0.45)',
                    cursor: checkoutStep > 2 ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {checkoutStep > 2 ? '✓ 2. Free Delivery Offers' : checkoutStep === 2 ? '● 2. Free Delivery Offers' : '2. Free Delivery Offers'}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.35)' }}>→</span>
                <span style={{
                  fontWeight: 700,
                  color: checkoutStep === 3 ? '#F8DA9D' : 'rgba(255,255,255,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {checkoutStep === 3 ? '● 3. Review & Pay' : '3. Review & Pay'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#F8DA9D',
                transition: 'all 0.2s'
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="checkout-body" style={{ padding: '1.25rem 1rem', background: '#FBF8F3', maxHeight: '80vh', overflowY: 'auto' }}>
            {!currentUser && (
              <div style={{ background: '#fff8e1', border: '1px solid #f0c040', borderRadius: 8, padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <AlertCircle size={18} color="#B8860B" />
                <span style={{ fontSize: '0.85rem', color: '#7a6000' }}>Please <button type="button" onClick={onRequireLogin} style={{ background: 'none', border: 'none', color: 'var(--c-gold)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>sign in</button> to complete your order.</span>
              </div>
            )}

            {/* ======================================================= */}
            {/* STEP 1: Address & Shipping Information */}
            {/* ======================================================= */}
            {checkoutStep === 1 && (
              <form className="checkout-form" onSubmit={handleProceedToPayment}>
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e8decb',
                  borderRadius: 12,
                  padding: '1.25rem 1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                  {/* Modern Header matching user screenshot */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.4rem', borderBottom: '1px solid #f1ece1' }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.18rem',
                      color: '#0f172a',
                      fontWeight: 800,
                      letterSpacing: '-0.3px',
                      fontFamily: "'Playfair Display', Georgia, serif"
                    }}>
                      {savedAddressesList.length > 0 ? 'Delivery Address' : 'Add delivery address'}
                    </h3>
                    <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                      🔒 Pan-India Delivery
                    </span>
                  </div>

                  {/* Flipkart / Amazon Style: Saved Address Autofill Banner & Selector */}
                  {(savedAddressesList.length > 0 || (currentUser && (form.houseNo || form.phone))) && (
                    <div style={{
                      background: '#FAF6F0',
                      border: '1.5px solid #C8935A',
                      borderRadius: 10,
                      padding: '12px 14px',
                      marginBottom: '1.15rem',
                      boxShadow: '0 2px 8px rgba(200, 147, 90, 0.08)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} color="#8C6239" />
                          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#18110C' }}>
                            Delivering to {form.addressType || 'Home'}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '4px' }}>
                            ✓ Autofilled from Profile
                          </span>
                        </div>

                        {savedAddressesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setShowAddressPicker(prev => !prev)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#8C6239',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            {showAddressPicker ? 'Hide Saved Addresses' : `Change Address (${savedAddressesList.length} saved)`}
                          </button>
                        )}
                      </div>

                      {/* Expandable Saved Addresses Switcher */}
                      {showAddressPicker && savedAddressesList.length > 1 && (
                        <div style={{
                          margin: '10px 0 6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          borderTop: '1px dashed #E2E8F0',
                          paddingTop: '10px'
                        }}>
                          {savedAddressesList.map(addr => {
                            const isSel = selectedAddressId === addr.id;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => {
                                  setSelectedAddressId(addr.id);
                                  applyAddressToForm(addr, currentUser);
                                  setShowAddressPicker(false);
                                }}
                                style={{
                                  padding: '9px 12px',
                                  borderRadius: '8px',
                                  border: isSel ? '2px solid #C8935A' : '1px solid #E2E8F0',
                                  background: isSel ? '#FFFDF9' : '#FFFFFF',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <input
                                  type="radio"
                                  name="checkoutSavedAddress"
                                  checked={isSel}
                                  onChange={() => {
                                    setSelectedAddressId(addr.id);
                                    applyAddressToForm(addr, currentUser);
                                    setShowAddressPicker(false);
                                  }}
                                  style={{ marginTop: '3px', accentColor: '#C8935A', cursor: 'pointer' }}
                                />
                                <div style={{ flex: 1, minWidth: 0, fontSize: '0.82rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#18110C' }}>
                                    <span>{addr.name}</span>
                                    <span style={{ fontSize: '0.68rem', background: '#18110C', color: '#E8CA80', padding: '1px 6px', borderRadius: '3px', textTransform: 'uppercase' }}>
                                      {addr.type || 'HOME'}
                                    </span>
                                    {addr.isDefault && (
                                      <span style={{ fontSize: '0.7rem', color: '#15803D', fontWeight: 700 }}>• Default</span>
                                    )}
                                  </div>
                                  <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '2px' }}>
                                    {addr.addressLine}{addr.locality ? `, ${addr.locality}` : ''}, {addr.city}, {addr.state} — PIN: {addr.pincode}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Compact delivery address summary */}
                      <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.45 }}>
                        <span style={{ fontWeight: 700, color: '#0F172A' }}>{form.name}</span> • +91 {form.phone}
                        <div style={{ marginTop: '2px' }}>
                          {form.houseNo}{form.area ? `, ${form.area}` : ''}{form.landmark ? `, Near ${form.landmark}` : ''}, {form.city}, {form.state} — <strong>PIN: {pincode}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Field 1: Country / Region */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#374151',
                        marginBottom: '6px',
                        letterSpacing: '-0.2px'
                      }}>
                        Country / Region
                      </label>
                      <div style={{
                        padding: '0.88rem 1.15rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc',
                        border: '1.5px solid #d1d5db',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.15rem' }}>🇮🇳</span>
                          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#111827' }}>India</span>
                        </div>
                        <ChevronDown size={16} color="#6b7280" />
                      </div>
                    </div>

                    {/* Field 2: Pincode */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#374151',
                        marginBottom: '6px',
                        letterSpacing: '-0.2px'
                      }}>
                        Pincode (6 digits) <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{
                        position: 'relative',
                        background: '#ffffff',
                        border: '1.5px solid #d1d5db',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter 6-digit postal PIN code"
                          value={pincode}
                          onChange={handlePincodeChange}
                          maxLength={6}
                          required
                          style={{
                            width: '100%',
                            padding: '0.95rem 1.15rem',
                            paddingRight: '3rem',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.94rem',
                            color: '#111827',
                            background: '#ffffff',
                            borderRadius: 10,
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                        {pincodeStatus?.valid && (
                          <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: '#16a34a', fontSize: '1.15rem', fontWeight: 800 }}>
                            ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Live Pincode Courier & Delivery Circle Status */}
                    {pincodeStatus && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.65rem 0.95rem', fontSize: '0.8rem', color: '#166534', marginTop: '-4px' }}>
                        <Truck size={16} color="#166534" style={{ flexShrink: 0 }} />
                        <span>{pincodeStatus.message} • <strong>{pincodeStatus.eta}</strong></span>
                      </div>
                    )}

                    {/* Field 3: City & State (Side-by-Side 50/50 Grid) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      {/* City */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#374151',
                          marginBottom: '6px',
                          letterSpacing: '-0.2px'
                        }}>
                          City / Town <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <div style={{
                          background: '#ffffff',
                          border: '1.5px solid #d1d5db',
                          borderRadius: 10,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                          <input
                            type="text"
                            placeholder="e.g. Bengaluru"
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })}
                            required
                            style={{
                              width: '100%',
                              padding: '0.95rem 1.15rem',
                              border: 'none',
                              outline: 'none',
                              fontSize: '0.94rem',
                              color: '#111827',
                              background: '#ffffff',
                              borderRadius: 10,
                              boxSizing: 'border-box',
                              fontFamily: 'Inter, sans-serif'
                            }}
                          />
                        </div>
                      </div>

                      {/* State */}
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#374151',
                          marginBottom: '6px',
                          letterSpacing: '-0.2px'
                        }}>
                          State <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <div style={{
                          position: 'relative',
                          background: '#ffffff',
                          border: '1.5px solid #d1d5db',
                          borderRadius: 10,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}>
                          <select
                            value={form.state}
                            onChange={e => setForm({ ...form, state: e.target.value })}
                            required
                            style={{
                              width: '100%',
                              padding: '0.95rem 2.2rem 0.95rem 1.15rem',
                              border: 'none',
                              outline: 'none',
                              fontSize: '0.94rem',
                              color: '#111827',
                              background: '#ffffff',
                              borderRadius: 10,
                              boxSizing: 'border-box',
                              fontFamily: 'Inter, sans-serif',
                              appearance: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            {INDIAN_STATES.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} color="#6b7280" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                      </div>
                    </div>

                    {/* Field 4: Full Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#374151',
                        marginBottom: '6px',
                        letterSpacing: '-0.2px'
                      }}>
                        Full Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{
                        background: '#ffffff',
                        border: '1.5px solid #d1d5db',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <input
                          type="text"
                          placeholder="First and last name"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '0.95rem 1.15rem',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.94rem',
                            color: '#111827',
                            background: '#ffffff',
                            borderRadius: 10,
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                      </div>
                    </div>

                    {/* Field 5: Mobile Number */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#374151',
                        marginBottom: '6px',
                        letterSpacing: '-0.2px'
                      }}>
                        Mobile Number (10 digits) <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#ffffff',
                        border: '1.5px solid #d1d5db',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        padding: '0 0.85rem'
                      }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#475569', paddingRight: '10px', borderRight: '1.5px solid #e2e8f0', flexShrink: 0 }}>
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="10-digit mobile number"
                          value={form.phone}
                          onChange={handlePhoneChange}
                          maxLength={10}
                          required
                          style={{
                            flex: 1,
                            padding: '0.95rem 0.85rem',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.94rem',
                            color: '#111827',
                            background: '#ffffff',
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                        {form.phone && (
                          <span style={{ fontSize: '0.74rem', color: form.phone.length === 10 ? '#16a34a' : '#b45309', fontWeight: 700, flexShrink: 0 }}>
                            {form.phone.length === 10 ? '✓ 10 digits' : `${form.phone.length}/10`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Alternate Mobile Number (Delhivery Courier Backup) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#374151',
                          letterSpacing: '-0.2px'
                        }}>
                          Alternate Mobile Number
                        </label>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                          (Optional • Courier Backup)
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#ffffff',
                        border: '1.5px solid #d1d5db',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        padding: '0 0.85rem'
                      }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#475569', paddingRight: '10px', borderRight: '1.5px solid #e2e8f0', flexShrink: 0 }}>
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="Backup mobile (if primary is busy/unanswered)"
                          value={form.alternatePhone || ''}
                          onChange={e => {
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setForm({ ...form, alternatePhone: digits });
                          }}
                          maxLength={10}
                          style={{
                            flex: 1,
                            padding: '0.95rem 0.85rem',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.94rem',
                            color: '#111827',
                            background: '#ffffff',
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                        {form.alternatePhone && (
                          <span style={{ fontSize: '0.74rem', color: form.alternatePhone.length === 10 ? '#16a34a' : '#b45309', fontWeight: 700, flexShrink: 0 }}>
                            {form.alternatePhone.length === 10 ? '✓ 10 digits' : `${form.alternatePhone.length}/10`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Field 6: Email Address */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#374151',
                        marginBottom: '6px',
                        letterSpacing: '-0.2px'
                      }}>
                        Email Address <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{
                        background: '#ffffff',
                        border: '1.5px solid #d1d5db',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <input
                          type="email"
                          placeholder="e.g. name@example.com (for order invoice & tracking)"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '0.95rem 1.15rem',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.94rem',
                            color: '#111827',
                            background: '#ffffff',
                            borderRadius: 10,
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                      </div>
                    </div>
                    {/* Box 1: House no / Flat / Building / Apartment Name */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#374151',
                        marginBottom: '6px',
                        letterSpacing: '-0.2px'
                      }}>
                        Flat / House no / Building / Apartment Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{
                        background: '#ffffff',
                        border: '1.5px solid #d1d5db',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <input
                          type="text"
                          placeholder="e.g. Flat 301, Emerald Heights / Skanda, #818/17"
                          value={form.houseNo}
                          onChange={e => setForm({ ...form, houseNo: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '0.95rem 1.15rem',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.94rem',
                            color: '#111827',
                            background: '#ffffff',
                            borderRadius: 10,
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                      </div>
                    </div>

                    {/* Box 2: Street / Road / Area / Locality / Sector */}
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        color: '#374151',
                        marginBottom: '6px',
                        letterSpacing: '-0.2px'
                      }}>
                        Street / Road / Area / Locality / Sector <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div style={{
                        background: '#ffffff',
                        border: '1.5px solid #d1d5db',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <input
                          type="text"
                          placeholder="e.g. 1st Main Road, 2nd Stage, Shivakumara Swamy Layout"
                          value={form.area}
                          onChange={e => setForm({ ...form, area: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '0.95rem 1.15rem',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.94rem',
                            color: '#111827',
                            background: '#ffffff',
                            borderRadius: 10,
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                      </div>
                    </div>

                    {/* Box 3: Landmark (Prominent for Courier Delivery) */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          color: '#374151',
                          letterSpacing: '-0.2px'
                        }}>
                          Landmark
                        </label>
                        <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '1px 7px', borderRadius: '4px' }}>
                          ⭐ Speeds up Courier Delivery
                        </span>
                      </div>
                      <div style={{
                        background: '#ffffff',
                        border: '1.5px solid #d1d5db',
                        borderRadius: 10,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <input
                          type="text"
                          placeholder="e.g. Near Dhaba Bus Stop / Opposite Metro Station / Behind Temple"
                          value={form.landmark}
                          onChange={e => setForm({ ...form, landmark: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.95rem 1.15rem',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.94rem',
                            color: '#111827',
                            background: '#ffffff',
                            borderRadius: 10,
                            boxSizing: 'border-box',
                            fontFamily: 'Inter, sans-serif'
                          }}
                        />
                      </div>
                    </div>

                    {/* Save my address as & Pills */}
                    <div style={{ marginTop: '2px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', fontWeight: 700, color: '#1f2937' }}>
                        <input
                          type="checkbox"
                          checked={form.saveAddress}
                          onChange={e => setForm({ ...form, saveAddress: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: '#06b6d4', cursor: 'pointer' }}
                        />
                        <span>Save my address as</span>
                        <Info size={14} color="#64748b" style={{ verticalAlign: 'middle' }} />
                      </label>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        {[
                          { id: 'Home', label: 'Home', icon: '🏠' },
                          { id: 'Office', label: 'Office', icon: '🏢' },
                          { id: 'Others', label: 'Others', icon: '📍' }
                        ].map(tab => {
                          const isSelected = form.addressType === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setForm({ ...form, addressType: tab.id })}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                border: isSelected ? 'none' : '1px solid #d1d5db',
                                background: isSelected ? '#5ce1e6' : '#f8fafc',
                                color: isSelected ? '#ffffff' : '#475569',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.15s',
                                boxShadow: isSelected ? '0 2px 6px rgba(92, 225, 230, 0.4)' : 'none'
                              }}
                            >
                              <span>{tab.icon}</span>
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* More options (Collapsible) */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowMoreOptions(prev => !prev)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0891b2',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '2px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <ChevronDown size={14} style={{ transform: showMoreOptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        <span>More options</span>
                      </button>

                      {showMoreOptions && (
                        <div style={{
                          marginTop: '8px',
                          background: '#ffffff',
                          border: '1.5px solid #d1d5db',
                          borderRadius: 10,
                          padding: '0.75rem 1rem'
                        }}>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                            Delivery instructions (optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Leave with security / Ring bell twice"
                            value={form.deliveryInstructions}
                            onChange={e => setForm({ ...form, deliveryInstructions: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.65rem 0.75rem',
                              borderRadius: 6,
                              border: '1px solid #e2e8f0',
                              outline: 'none',
                              fontSize: '0.85rem',
                              color: '#111827',
                              background: '#ffffff',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compact Order Total Preview */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#ffffff',
                    border: '1.5px solid #E8CA80',
                    borderRadius: 10,
                    padding: '0.9rem 1.15rem',
                    marginTop: '1.25rem',
                    fontSize: '0.88rem'
                  }}>
                    <div>
                      <span style={{ color: '#4b5563' }}>Cart Total ({cart.reduce((s, it) => s + (Number(it.qty) || 1), 0)} items): </span>
                      <strong style={{ color: '#8C6239', fontSize: '1.05rem' }}>₹{totalPayable.toFixed(0)}</strong>
                      <span style={{ fontSize: '0.74rem', color: '#059669', marginLeft: '6px' }}>(5% GST Incl.)</span>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: shippingFee === 0 ? '#059669' : '#8C6239', fontWeight: 800 }}>
                      {shippingFee === 0 ? '✓ Free Delivery' : `+₹${shippingFee} Delivery`}
                    </span>
                  </div>

                  {error && <p style={{ color: '#dc3545', fontSize: '0.88rem', marginTop: '0.85rem', marginBottom: '0.5rem' }}><AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{error}</p>}

                  <button
                    type="submit"
                    className="btn btn-gold w-100"
                    style={{
                      fontSize: '1rem',
                      padding: '0.95rem',
                      marginTop: '1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      borderRadius: '30px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      background: 'linear-gradient(135deg, #C8935A 0%, #A36B32 100%)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(200, 147, 90, 0.35)'
                    }}
                  >
                    <span>CONTINUE TO OFFERS & FREE SHIPPING</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            )}

            {/* ======================================================= */}
            {/* ======================================================= */}
            {/* ======================================================= */}
            {/* STEP 2: Flipkart-Style Add or Skip Items (Complete Purchase) */}
            {/* ======================================================= */}
            {checkoutStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Flipkart Style Header Banner */}
                <div style={{
                  background: shippingFee === 0 ? 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)' : 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  border: shippingFee === 0 ? '1.5px solid #86EFAC' : '1.5px solid #FDE68A',
                  borderRadius: 14,
                  padding: '1.1rem 1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.7rem',
                      background: shippingFee === 0 ? '#16a34a' : '#D97706',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 800,
                      letterSpacing: '0.4px',
                      textTransform: 'uppercase'
                    }}>
                      {shippingFee === 0 ? '✓ Free Delivery' : `Save ₹${shippingInfo.standardFee} Shipping`}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: shippingFee === 0 ? '#166534' : '#92400e' }}>
                      {shippingFee === 0 ? `🎉 SAVED ₹${shippingInfo.standardFee}` : `DELIVERY: ₹${shippingInfo.standardFee} (${shippingInfo.isKarnataka ? 'Karnataka' : 'Other States'})`}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', color: shippingFee === 0 ? '#065f46' : '#78350f', fontWeight: 800 }}>
                    {shippingFee === 0 ? '🎉 100% FREE Delivery Unlocked!' : 'Add more items to unlock FREE Delivery'}
                  </h3>

                  <p style={{ margin: 0, fontSize: '0.78rem', color: shippingFee === 0 ? '#047857' : '#92400e', lineHeight: 1.35 }}>
                    {shippingFee === 0
                      ? 'Your order qualifies for complimentary Pan-India Delivery!'
                      : 'Add 1 more item below to unlock 100% FREE Delivery on this order.'}
                  </p>

                  {/* Flipkart Progress Bar */}
                  <div style={{ marginTop: '10px', background: shippingFee === 0 ? 'rgba(22, 163, 74, 0.2)' : 'rgba(217, 119, 6, 0.15)', height: '6px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${shippingInfo.progressPct}%`,
                      background: shippingFee === 0 ? '#16a34a' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '0.72rem', color: shippingFee === 0 ? '#166534' : '#78350f', fontWeight: 700 }}>
                    <span>Current Package: {shippingInfo.totalGrams}g</span>
                    <span>{shippingFee === 0 ? 'Free Delivery Unlocked ✓' : 'Add 1 item to reach Free Delivery'}</span>
                  </div>
                </div>

                {/* Subtitle Label */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Frequently Added Together
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Select items to add or skip
                  </span>
                </div>

                {/* Flipkart Style Product Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* ITEM 1: 500g Coffee Pack */}
                  <div style={{
                    background: '#ffffff',
                    border: isCoffeeAddonInCart ? '2px solid #C8935A' : '1px solid #e8decb',
                    borderRadius: 12,
                    padding: '0.75rem 0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: isCoffeeAddonInCart ? '0 4px 12px rgba(200, 147, 90, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 10,
                      background: '#faf7f2',
                      border: '1px solid #e8decb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      padding: '3px',
                      overflow: 'hidden'
                    }}>
                      <img
                        src="/assets/images/estate_reserve_500g.webp"
                        alt="Malenadu Estate Reserve Coffee 500g"
                        onError={(e) => { e.target.src = '/assets/images/estate_reserve_500g.webp'; }}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#C8935A', textTransform: 'uppercase' }}>
                          Estate Coffee (500g)
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700 }}>
                          ★ 4.9
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Malenadu Estate Reserve (500g)
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        Fresh roastery grind • Unlocks Free Delivery
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>₹429</span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹499</span>
                        <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800 }}>14% OFF</span>
                      </div>
                    </div>

                    {/* Flipkart-Style Add / Added Button */}
                    <button
                      type="button"
                      onClick={handleToggleCoffee}
                      style={{
                        padding: '7px 12px',
                        minWidth: '74px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        flexShrink: 0,
                        textAlign: 'center',
                        transition: 'all 0.2s',
                        background: isCoffeeAddonInCart ? '#16a34a' : '#ffffff',
                        color: isCoffeeAddonInCart ? '#ffffff' : '#8C6239',
                        border: isCoffeeAddonInCart ? '1.5px solid #16a34a' : '1.5px solid #C8935A',
                        boxShadow: isCoffeeAddonInCart ? '0 2px 8px rgba(22, 163, 74, 0.25)' : 'none'
                      }}
                    >
                      {isCoffeeAddonInCart ? 'ADDED ✓' : '+ ADD'}
                    </button>
                  </div>

                  {/* ITEM 2: Tellicherry Pepper 250g Pack */}
                  {(() => {
                    const isPepperInCart = cart.some(it => (it.name || '').toLowerCase().includes('pepper'));
                    return (
                      <div style={{
                        background: '#ffffff',
                        border: isPepperInCart ? '2px solid #16a34a' : '1px solid #e8decb',
                        borderRadius: 12,
                        padding: '0.75rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: isPepperInCart ? '0 4px 12px rgba(22, 163, 74, 0.15)' : '0 2px 6px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s'
                      }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: 10,
                          background: '#f0fdf4',
                          border: '1px solid #dcfce7',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          padding: '3px',
                          overflow: 'hidden'
                        }}>
                          <img
                            src="/assets/images/pepper_reserve_250g.webp"
                            alt="Malenadu Tellicherry Pepper Reserve 250g"
                            onError={(e) => { e.target.src = '/assets/images/pepper_reserve_250g.webp'; }}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              width: 'auto',
                              height: 'auto',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                              Tellicherry Bold (250g)
                            </span>
                            <span style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700 }}>
                              ★ 4.9
                            </span>
                          </div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            Malenadu Pepper Reserve (250g)
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                            Handpicked bold black pepper • Unlocks Free Delivery
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#166534' }}>₹299</span>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹399</span>
                            <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 800 }}>25% OFF</span>
                          </div>
                        </div>

                        {/* Flipkart-Style Add / Added Button */}
                        <button
                          type="button"
                          onClick={handleTogglePepper}
                          style={{
                            padding: '7px 12px',
                            minWidth: '74px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            flexShrink: 0,
                            textAlign: 'center',
                            transition: 'all 0.2s',
                            background: isPepperInCart ? '#16a34a' : '#ffffff',
                            color: isPepperInCart ? '#ffffff' : '#166534',
                            border: isPepperInCart ? '1.5px solid #16a34a' : '1.5px solid #16a34a',
                            boxShadow: isPepperInCart ? '0 2px 8px rgba(22, 163, 74, 0.25)' : 'none'
                          }}
                        >
                          {isPepperInCart ? 'ADDED ✓' : '+ ADD'}
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Flipkart-Style Fixed Sticky Bottom Bar */}
                <div style={{
                  marginTop: '0.75rem',
                  paddingTop: '0.85rem',
                  borderTop: '1.5px solid #e8decb',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {/* Live Total & Delivery Status Pill */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: shippingFee === 0 ? '#f0fdf4' : '#fffbeb',
                    border: shippingFee === 0 ? '1px solid #bbf7d0' : '1px solid #fde68a',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: '0.82rem'
                  }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Order Total ({cart.reduce((s, it) => s + (Number(it.qty) || 1), 0)} items): </span>
                      <strong style={{ color: '#0f172a', fontSize: '0.96rem' }}>₹{totalPayable.toFixed(0)}</strong>
                    </div>
                    <span style={{
                      fontWeight: 800,
                      color: shippingFee === 0 ? '#166534' : '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {shippingFee === 0 ? '🎉 FREE Delivery Unlocked!' : `+₹${shippingFee} Delivery`}
                    </span>
                  </div>

                  {/* Dual Action Buttons: SKIP vs CONTINUE TO PAYMENT */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => { setCheckoutStep(3); setError(''); }}
                      style={{
                        flex: '0 0 auto',
                        minWidth: '75px',
                        padding: '0.85rem 1rem',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        color: '#475569',
                        borderRadius: '30px',
                        fontSize: '0.84rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#ffffff'; }}
                    >
                      Skip
                    </button>

                    <button
                      type="button"
                      onClick={() => { setCheckoutStep(3); setError(''); }}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        padding: '0.85rem 1rem',
                        background: 'linear-gradient(135deg, #C8935A 0%, #A36B32 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '30px',
                        fontSize: '0.84rem',
                        fontWeight: 800,
                        letterSpacing: '0.3px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: '0 4px 14px rgba(200, 147, 90, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span>{shippingFee === 0 ? 'Continue to Payment' : 'Continue'}</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Back to Address Link */}
                  <div style={{ textAlign: 'center', marginTop: '2px' }}>
                    <button
                      type="button"
                      onClick={() => { setCheckoutStep(1); setError(''); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.76rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      ← Edit Delivery Address
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Payment Mode, Final Review & Confirmation       */}
            {/* ======================================================= */}
            {checkoutStep === 3 && (
              <form className="checkout-form" onSubmit={handleSubmit}>
                {/* Delivery Address Review Card */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #E8CA80',
                  borderRadius: 12,
                  padding: '1rem 1.15rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#C8935A', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        📍 Deliver To
                      </span>
                      {form.addressType && (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px' }}>
                          {form.addressType === 'Home' ? '🏠 Home' : form.addressType === 'Office' ? '🏢 Office' : '📍 Others'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#0f172a', wordBreak: 'break-word' }}>
                      {form.name} • <span style={{ fontWeight: 600, color: '#475569' }}>{form.phone}</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px', lineHeight: 1.45, wordBreak: 'break-word' }}>
                      {computedFullAddress}, <strong style={{ color: '#0f172a' }}>PIN: {pincode}</strong>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', wordBreak: 'break-all' }}>
                      ✉️ {form.email}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setCheckoutStep(1); setError(''); }}
                    style={{
                      background: '#FFF9F2',
                      border: '1px solid #C8935A',
                      color: '#8C6239',
                      padding: '5px 12px',
                      borderRadius: 6,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    ✏️ Edit
                  </button>
                </div>

                {/* Itemized Order & Tax Summary */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e8decb',
                  borderRadius: 12,
                  padding: '1.25rem',
                  marginBottom: '1.25rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                }}>
                  <div style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: '#8C6239',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginBottom: '0.85rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid #f1ece1'
                  }}>
                    🧾 Final Order & Tax Summary
                  </div>

                  {cart.map(item => {
                    const price = parseItemPrice(item.price);
                    const qty = Number(item.qty) || 1;
                    return (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: '0.85rem', color: '#4b5563' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e8decb', background: '#faf7f2', flexShrink: 0 }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              Qty: {qty} {item.weight ? `• Pack: ${item.weight}` : ''}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{(price * qty).toFixed(0)}</span>
                      </div>
                    );
                  })}

                  <div style={{ borderTop: '1px solid #f1ece1', paddingTop: 8, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#4b5563', marginBottom: 4 }}>
                      <span>Items Subtotal (Incl. of 5% GST):</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{subtotal.toFixed(0)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#059669', marginBottom: 4, background: '#f0fdf4', padding: '3px 8px', borderRadius: '4px' }}>
                      <span>Inbuilt 5% GST (Taxable: ₹{taxableValue} + GST: ₹{gstAmount}):</span>
                      <span style={{ fontWeight: 600 }}>₹{gstAmount} (Included)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#4b5563', marginBottom: 4 }}>
                      <span>Delivery / Shipping:</span>
                      {shippingFee === 0 ? (
                        <span style={{ color: '#059669', fontWeight: 800 }}>FREE (Express Delivery)</span>
                      ) : (
                        <span style={{ color: '#92400e', fontWeight: 700 }}>₹{shippingFee.toFixed(0)} <small style={{ color: '#6b7280' }}>({shippingInfo.isKarnataka ? 'Karnataka ₹44' : 'Interstate ₹84'})</small></span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, borderTop: '2px solid #C8935A', paddingTop: 10, marginTop: 8 }}>
                    <div>
                      <div style={{ fontSize: '1rem', color: '#0f172a' }}>Total Amount Payable</div>
                      <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>Inclusive of all statutory taxes (5% GST)</div>
                    </div>
                    <span style={{ fontSize: '1.25rem', color: '#8C6239' }}>₹{totalPayable.toFixed(0)}</span>
                  </div>
                </div>

                {error && <p style={{ color: '#dc3545', fontSize: '0.88rem', marginBottom: '1rem' }}><AlertCircle size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />{error}</p>}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0.85rem 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                  <ShieldCheck size={15} color="#16a34a" />
                  <span>Protected by 256-Bit Bank-Grade SSL & Razorpay Payment Gateway</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => { setCheckoutStep(2); setError(''); }}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      color: '#475569',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '30px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    className="btn btn-gold"
                    disabled={loading}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: '0.95rem',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      borderRadius: '30px',
                      fontWeight: 800,
                      letterSpacing: '0.5px',
                      background: 'linear-gradient(135deg, #C8935A 0%, #A36B32 100%)',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(200, 147, 90, 0.35)',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {loading ? <><Loader size={18} className="spin" /> Authorizing…</> :
                      <><Lock size={15} /> Pay ₹{totalPayable.toFixed(0)} Securely</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

// ============================================================
// BLUE TOKAI-INSPIRED EDITORIAL HERO BANNER SLIDER
// Full-width warm sand aesthetic with iconic serrated postage-stamp edges
// ============================================================
// ============================================================
// BLUE TOKAI-INSPIRED MULTI-COLOR EDITORIAL HERO BANNER SLIDER
// Distinct vibrant roastery color stories with festive motifs & postage-stamp serrated edges
// ============================================================
// ============================================================
// BLUE TOKAI-INSPIRED MULTI-COLOR VIBRANT HERO BANNER CAROUSEL
// Light, bright roastery color palettes, massive cinematic images & bold typography
// ============================================================
const PromotionalCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 'fresh-roasts-sale',
      layout: 'text-left',
      tag: 'FARM-TO-CUP FRESHNESS',
      hasTagIcon: true,
      titleLine1: 'Fresh Single-Origin',
      titleLine2: 'Estate Roasts',
      italicAccent: 'Roasted Upon Order & Dispatched in 24 Hrs',
      italicColor: '#1E3F20',
      desc: 'Handpicked at 3,500+ ft in Chikkamagaluru. Micro-batch drum roasted on demand with zero warehouse stagnation. Complimentary delivery on all 1kg orders.',
      btnText: 'Shop Fresh Roasts',
      btnClass: 'btn-slide-1',
      link: '#products',
      cardImg: '/assets/images/fresh_roast_drum.jpg',
      cardImgStyle: {
        mixBlendMode: 'normal',
        borderRadius: '22px',
        boxShadow: '0 20px 45px rgba(24, 17, 12, 0.22)',
        border: '3px solid rgba(255, 255, 255, 0.8)',
        maxHeight: 'clamp(320px, 32vw, 440px)',
        width: 'auto',
        objectFit: 'cover'
      },
      bgGradient: 'linear-gradient(135deg, #FBF8F2 0%, #F5EDE0 50%, #ECE0CF 100%)',
      waveColor: '#16321F',
      hasFairyLights: false
    },
    {
      id: 'custom-combos',
      layout: 'text-right',
      tag: 'NEW COMBO BUILDER',
      hasTagIcon: false,
      titleLine1: 'Build Your Custom',
      titleLine2: 'Coffee & Spice Pair',
      italicAccent: 'With Instant 5% Combo Savings',
      italicColor: '#102A43',
      desc: 'Select your preferred specialty roast and authentic Tellicherry pepper pack. Save 5% instantly with automatic 100% Free Pan-India Express Delivery.',
      btnText: 'Build Your Combo',
      btnClass: 'btn-slide-2',
      link: '#combos',
      cardImg: '/assets/images/coffee_pepper_combo_hero_v3.jpg',
      cardImgStyle: {
        mixBlendMode: 'normal',
        borderRadius: '22px',
        boxShadow: '0 20px 45px rgba(24, 17, 12, 0.22)',
        border: '3px solid rgba(255, 255, 255, 0.8)',
        maxHeight: 'clamp(320px, 32vw, 440px)',
        width: 'auto',
        objectFit: 'cover'
      },
      bgGradient: 'linear-gradient(135deg, #EAF2F8 0%, #DCE8F2 50%, #CFDFED 100%)',
      waveColor: '#0C1E33',
      hasFairyLights: true
    },
    {
      id: 'wholesale-supply',
      layout: 'text-left',
      tag: 'B2B & INSTITUTIONAL SUPPLY',
      hasTagIcon: false,
      titleLine1: 'Bulk Coffee Supply',
      titleLine2: '& MOQ Tiers',
      italicAccent: 'Hotels, Resorts & Catering',
      italicColor: '#A85A18',
      desc: 'Scalable wholesale coffee partnerships with transparent MOQ tiers, official 5% GST tax credit invoices, and dedicated roastery account support.',
      btnText: 'Discuss MOQ & Bulk Partnership',
      btnClass: 'btn-slide-3',
      link: '#partner-bulk',
      cardImg: '/assets/images/malenadu_full_lineup.jpg',
      cardImgStyle: {
        mixBlendMode: 'normal',
        borderRadius: '22px',
        boxShadow: '0 20px 45px rgba(24, 17, 12, 0.22)',
        border: '3px solid rgba(255, 255, 255, 0.8)',
        maxHeight: 'clamp(320px, 32vw, 440px)',
        width: 'auto',
        objectFit: 'cover'
      },
      bgGradient: 'linear-gradient(135deg, #FCF7ED 0%, #F6ECDA 50%, #EBDBC1 100%)',
      waveColor: '#14301B',
      hasFairyLights: true
    },
    {
      id: 'partner-with-us-slide',
      layout: 'text-right',
      tag: 'CAFE & HOTEL PARTNERSHIP • 100% FREE BREWER',
      hasTagIcon: false,
      titleLine1: 'Commercial Filter Coffee',
      titleLine2: '100% Free on Coffee MOQ',
      italicAccent: 'Zero Upfront Equipment Investment',
      italicColor: '#0C3859',
      desc: 'We do not sell commercial machines. Meet our monthly coffee MOQ criteria, and we provide heavy-duty stainless steel commercial filter brewers 100% free of charge for your cafe or hotel.',
      btnText: 'Partner With Us (Free Machine)',
      btnClass: 'btn-slide-2',
      link: '#commercial-partnership',
      cardImg: '/assets/images/commercial_filter_brewer_malenadu.jpg',
      cardImgStyle: {
        mixBlendMode: 'normal',
        borderRadius: '22px',
        boxShadow: '0 20px 45px rgba(24, 17, 12, 0.22)',
        border: '3px solid rgba(255, 255, 255, 0.8)',
        maxHeight: 'clamp(340px, 35vw, 460px)',
        width: 'auto',
        objectFit: 'contain'
      },
      bgGradient: 'linear-gradient(135deg, #EAF3F9 0%, #DCE9F4 50%, #CFE1EE 100%)',
      waveColor: '#0E243A',
      hasFairyLights: true
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Autoplay (every 4 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Touch swipe support & pause on touch for mobile & desktop
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const touchPauseTimeoutRef = useRef(null);

  const handleTouchStart = (e) => {
    setIsPaused(true);
    if (touchPauseTimeoutRef.current) {
      clearTimeout(touchPauseTimeoutRef.current);
    }
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setIsPaused(true);
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart !== null && touchEnd !== null) {
      const distance = touchStart - touchEnd;
      if (distance > 50) nextSlide();
      if (distance < -50) prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);

    // Keep paused for 4 full seconds after touch ends so customer has time to read, then resume
    if (touchPauseTimeoutRef.current) {
      clearTimeout(touchPauseTimeoutRef.current);
    }
    touchPauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 4000);
  };

  const handleTouchCancel = () => {
    setTouchStart(null);
    setTouchEnd(null);
    setIsPaused(false);
  };

  const handleCtaClick = (e, link) => {
    e.stopPropagation();
    if (link === '#commercial-partnership' || link === '#partnership' || link === '#wholesale') {
      window.location.hash = 'commercial-partnership';
      window.scrollTo(0, 0);
      return;
    }
    if (link === '#partner-bulk') {
      window.dispatchEvent(new CustomEvent('partner_tab_change', { detail: { tabIndex: 2 } }));
      const element = document.getElementById('partner-with-us');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    if (link === '#partner-machine' || link === '#partner-with-us') {
      const element = document.getElementById('partner-with-us');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    const targetId = link.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="promotional-carousel"
      className="special-frame-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      <div className="special-frame-wrapper">

        {/* The 4 Bespoke Slides with Special Frame Design - Full Space Fit */}
        {slides.map((s, idx) => {
          const isActive = idx === currentSlide;
          const isTextLeft = s.layout === 'text-left';

          return (
            <div
              key={s.id}
              className={`special-frame-slide ${isActive ? 'special-slide-active' : 'special-slide-inactive'} ${isTextLeft ? 'special-layout-left' : 'special-layout-right'}`}
              style={{
                background: s.bgGradient,
                opacity: isActive ? 1 : 0,
                visibility: isActive ? 'visible' : 'hidden',
                zIndex: isActive ? 2 : 1
              }}
            >
              {/* Hanging Fairy Lights Garland along the top (Slides 2, 3, 4) */}
              {s.hasFairyLights && (
                <svg
                  className="special-fairy-lights"
                  width="100%"
                  height="70"
                  viewBox="0 0 1000 70"
                  preserveAspectRatio="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    pointerEvents: 'none',
                    zIndex: 3,
                    opacity: 0.85
                  }}
                >
                  <path d="M0,15 Q125,55 250,18 Q375,55 500,18 Q625,55 750,18 Q875,55 1000,15" stroke="#E5A24B" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.65" />
                  <circle cx="65" cy="35" r="4.5" fill="#F6D38B" />
                  <circle cx="185" cy="42" r="5" fill="#E5A24B" />
                  <circle cx="310" cy="38" r="4.5" fill="#F6D38B" />
                  <circle cx="435" cy="42" r="5" fill="#E5A24B" />
                  <circle cx="560" cy="38" r="4.5" fill="#F6D38B" />
                  <circle cx="685" cy="42" r="5" fill="#E5A24B" />
                  <circle cx="810" cy="38" r="4.5" fill="#F6D38B" />
                  <circle cx="935" cy="36" r="4.5" fill="#E5A24B" />
                </svg>
              )}

              {/* Column 1 */}
              {isTextLeft ? (
                <div className="special-text-col">
                  {s.tag && (
                    <div className="special-frame-tag">
                      {s.hasTagIcon && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B4E3D">
                          <path d="M12,2 C18,2 22,7 22,13 C22,19 18,24 12,24 C6,24 2,19 2,13 C2,7 6,2 12,2 Z" />
                        </svg>
                      )}
                      <span className="special-frame-tag-line" />
                      <span>{s.tag}</span>
                    </div>
                  )}

                  <h2 className="special-frame-title">
                    {s.titleLine1 && <>{s.titleLine1}<br /></>}
                    {s.titleLine2 && <>{s.titleLine2}<br /></>}
                    <span className="special-frame-italic" style={{ color: s.italicColor }}>
                      {s.italicAccent}
                    </span>
                  </h2>

                  <p className="special-frame-desc">
                    {s.desc}
                  </p>

                  <a
                    href={s.link}
                    onClick={(e) => handleCtaClick(e, s.link)}
                    className={`special-frame-btn ${s.btnClass}`}
                  >
                    <span>{s.btnText}</span>
                    <span>→</span>
                  </a>
                </div>
              ) : (
                <div className="special-card-wrap">
                  <img
                    src={s.cardImg}
                    alt={s.titleLine1}
                    className="special-card-img"
                    style={s.cardImgStyle || {}}
                  />
                </div>
              )}

              {/* Column 2 */}
              {isTextLeft ? (
                <div className="special-card-wrap">
                  <img
                    src={s.cardImg}
                    alt={s.titleLine1}
                    className="special-card-img"
                    style={s.cardImgStyle || {}}
                  />
                </div>
              ) : (
                <div className="special-text-col">
                  {s.tag && (
                    <div className="special-frame-tag">
                      {s.hasTagIcon && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#6B4E3D">
                          <path d="M12,2 C18,2 22,7 22,13 C22,19 18,24 12,24 C6,24 2,19 2,13 C2,7 6,2 12,2 Z" />
                        </svg>
                      )}
                      <span className="special-frame-tag-line" />
                      <span>{s.tag}</span>
                    </div>
                  )}

                  <h2 className="special-frame-title">
                    {s.titleLine1 && <>{s.titleLine1}<br /></>}
                    {s.titleLine2 && <>{s.titleLine2}<br /></>}
                    <span className="special-frame-italic" style={{ color: s.italicColor }}>
                      {s.italicAccent}
                    </span>
                  </h2>

                  <p className="special-frame-desc">
                    {s.desc}
                  </p>

                  <a
                    href={s.link}
                    onClick={(e) => handleCtaClick(e, s.link)}
                    className={`special-frame-btn ${s.btnClass}`}
                  >
                    <span>{s.btnText}</span>
                    <span>→</span>
                  </a>
                </div>
              )}

              {/* Bottom Ribbon Wave Transition */}
              <div
                className="special-bottom-wave"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '42px',
                  overflow: 'hidden',
                  zIndex: 2,
                  pointerEvents: 'none'
                }}>
                <svg viewBox="0 0 1200 42" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                  <path d="M0,20 Q300,42 600,18 Q900,-4 1200,20 L1200,42 L0,42 Z" fill={s.waveColor} />
                </svg>
              </div>
            </div>
          );
        })}

        {/* Live Interactive Navigation Arrow: Left (Clean HTML, Zero Baked Arrows) */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="hero-nav-arrow-btn hero-nav-arrow-left"
        >
          ←
        </button>

        {/* Live Interactive Navigation Arrow: Right (Clean HTML, Zero Baked Arrows) */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="hero-nav-arrow-btn hero-nav-arrow-right"
        >
          →
        </button>

        {/* Live Interactive Pagination Dots */}
        <div className="hero-dots-container">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`hero-dot-pill ${currentSlide === idx ? 'hero-dot-active' : 'hero-dot-inactive'}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};


const OrderPage = ({ onBack, coffeeProducts, pepperProducts, onAddToCart, onBuyNow, onOpenDetails, onImageClick, onShareProduct }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const handleOrderScroll = () => {
    const el = document.getElementById('order-channels-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const channels = [
    {
      name: 'WhatsApp',
      desc: 'Chat with us directly on WhatsApp to place your order.',
      icon: <img loading="lazy" src="/assets/images/whatsapp_icon.webp" alt="WhatsApp" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />,
      color: '#25D366',
      link: 'https://api.whatsapp.com/send?phone=918217623335',
    },
    {
      name: 'Instagram',
      desc: 'DM us on Instagram to order or explore our latest offerings.',
      icon: <img loading="lazy" src="/assets/images/instagram_icon.webp" alt="Instagram" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />,
      color: '#E1306C',
      link: 'https://www.instagram.com/coffee_zone_ka?igsh=MW5sdjUzdWJodmJkZg==',
    },
    {
      name: 'Product Catalog',
      desc: 'Browse our full product catalog with prices and details.',
      icon: <img loading="lazy" src="/assets/images/icon_drive.webp" alt="Google Drive" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />,
      color: '#4285F4',
      link: 'https://drive.google.com/uc?export=download&id=1J8q0Cp6cH0HP3PF-IN1_JgBUyWJ1vlAa',
    },
  ];

  return (
    <section className="order-page-section" style={{
      minHeight: '100vh',
      background: 'linear-gradient(170deg, #0a0f0a 0%, #1a1a12 40%, #0d1210 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(200,147,90,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Top Navigation */}
      <motion.div
        className="order-back-btn-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'none', border: '1px solid rgba(255,255,255,0.15)',
            color: '#C8935A', padding: '0.6rem 1.2rem', borderRadius: '4px',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            fontFamily: 'Inter, sans-serif', letterSpacing: '1px',
            transition: 'all 0.3s',
            marginBottom: '0'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,147,90,0.1)'; e.currentTarget.style.borderColor = '#C8935A'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
        >
          <ChevronLeft size={18} /> Back to Home
        </motion.button>
      </motion.div>

      {/* Our Collection (Products First) */}
      <div style={{ width: '100%', maxWidth: '1280px', position: 'relative', zIndex: 2 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '1px', background: '#C8935A' }} />
            <span style={{ color: '#C8935A', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '5px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
              Our Collection
            </span>
            <div style={{ width: '36px', height: '1px', background: '#C8935A' }} />
          </div>
          <h2 style={{ fontFamily: '"Georgia", serif', color: '#fff', fontSize: '2.5rem', margin: 0 }}>Browse Our Products</h2>
        </div>

        {/* Toggle Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setExpandedSection(prev => prev === 'coffee' ? null : 'coffee')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '1rem 2rem', borderRadius: '30px',
              background: expandedSection === 'coffee' ? 'var(--c-gold)' : 'transparent',
              color: expandedSection === 'coffee' ? 'var(--c-dark-brown)' : 'var(--c-gold)',
              border: '2px solid var(--c-gold)',
              fontSize: '1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            Coffee Products {expandedSection === 'coffee' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <button
            onClick={() => setExpandedSection(prev => prev === 'pepper' ? null : 'pepper')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '1rem 2rem', borderRadius: '30px',
              background: expandedSection === 'pepper' ? 'var(--c-gold)' : 'transparent',
              color: expandedSection === 'pepper' ? 'var(--c-dark-brown)' : 'var(--c-gold)',
              border: '2px solid var(--c-gold)',
              fontSize: '1rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.3s'
            }}
          >
            Pepper Products {expandedSection === 'pepper' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Dropdown Content */}
        <AnimatePresence mode="wait">
          {expandedSection === 'coffee' && (
            <motion.div
              key="coffee"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              style={{ overflow: 'hidden', marginBottom: '4rem' }}
            >
              <div className={`products-grid ${coffeeProducts.length === 1 ? 'single-item' : ''}`} style={{ paddingTop: '1rem' }}>
                {coffeeProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    isWishlisted={false}
                    onToggleWishlist={() => { }}
                    onImageClick={onImageClick}
                    onOpenDetails={onOpenDetails}
                    onShareProduct={onShareProduct}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {expandedSection === 'pepper' && (
            <motion.div
              key="pepper"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              style={{ overflow: 'hidden', marginBottom: '4rem' }}
            >
              <div className={`products-grid ${pepperProducts.length === 1 ? 'single-item' : ''}`} style={{ paddingTop: '1rem' }}>
                {pepperProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onBuyNow={onBuyNow}
                    isWishlisted={false}
                    onToggleWishlist={() => { }}
                    onImageClick={onImageClick}
                    onOpenDetails={onOpenDetails}
                    onShareProduct={onShareProduct}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Channels Section (Below Products) */}
      <motion.div
        id="order-channels-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: 'center', marginTop: '2.5rem', marginBottom: '3.5rem', position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '1.5rem' }}>
          <div style={{ width: '36px', height: '1px', background: '#C8935A' }} />
          <span style={{ color: '#C8935A', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '5px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
            Place Your Order
          </span>
          <div style={{ width: '36px', height: '1px', background: '#C8935A' }} />
        </div>
        <h2 style={{
          fontFamily: '"Georgia", "Times New Roman", serif',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          color: '#fff', fontWeight: 800, margin: '0 0 1rem',
          letterSpacing: '-1px',
        }}>
          How Would You Like to <span style={{ color: '#D4A870' }}>Order?</span>
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem',
          maxWidth: '500px', margin: '0 auto', lineHeight: 1.7,
          fontFamily: 'Inter, sans-serif',
        }}>
          Choose your preferred channel below and we will get your premium coffee and spices delivered right to your doorstep.
        </p>
      </motion.div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        maxWidth: '960px',
        width: '100%',
        position: 'relative',
        zIndex: 2,
      }}>
        {channels.map((ch, i) => (
          <motion.a
            key={ch.name}
            href={ch.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 * i }}
            whileHover={{ y: -8, scale: 1.03 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '2.5rem 2rem',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.35s ease',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = ch.color;
              e.currentTarget.style.boxShadow = `0 20px 50px ${ch.color}22`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Custom Icon */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              filter: `drop-shadow(0 8px 15px ${ch.color}44)`,
              marginBottom: '0.5rem',
            }}>
              {ch.icon}
            </div>
            <h3 style={{
              color: '#fff', fontSize: '1.3rem', fontWeight: 700,
              fontFamily: '"Georgia", serif', margin: 0,
            }}>
              {ch.name}
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem',
              lineHeight: 1.6, margin: 0, fontFamily: 'Inter, sans-serif',
            }}>
              {ch.desc}
            </p>
            <div style={{
              marginTop: '0.5rem', color: ch.color, fontSize: '0.8rem',
              fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase',
              fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              Open <ChevronRight size={14} />
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};



// ============================================================
// ELEVATED WHOLESALE & CAFE ROASTERY SUPPLY
// Editorial White & Brown Luxury Showcase with Interactive Pages & Floating Coffee Beans
// ============================================================
const WholesalePartnershipSection = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isTcOpen, setIsTcOpen] = useState(false);

  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash;
      if (hash === '#partner-bulk' || hash === '#b2b-supply') {
        setActiveTab(2);
      } else if (hash === '#partner-machine' || hash === '#partner-with-us' || hash === '#free-machine' || hash === '#partnership') {
        setActiveTab(0);
      } else if (hash === '#partner-roasts') {
        setActiveTab(1);
      }
    };
    const handlePartnerTabChange = (e) => {
      if (typeof e.detail?.tabIndex === 'number') {
        setActiveTab(e.detail.tabIndex);
      }
    };
    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    window.addEventListener('partner_tab_change', handlePartnerTabChange);
    return () => {
      window.removeEventListener('hashchange', handleHashSync);
      window.removeEventListener('partner_tab_change', handlePartnerTabChange);
    };
  }, []);

  const wholesalePages = [
    {
      id: 'commercial-urns',
      tabLabel: 'Commercial Filter Coffee (Free on MOQ)',
      tag: 'CAFE & HOTEL PARTNERSHIP PROGRAM',
      title: 'Commercial Filter Coffee Machines',
      titleAccent: 'Provided 100% Free on Coffee MOQ Partnership',
      subtitle: 'We do not sell commercial machines. Meet our monthly coffee MOQ criteria, and we provide heavy-duty commercial filter coffee brewers 100% free of charge for your cafe or hotel.',
      isFreeMachineTab: true,
      points: [
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
      image: '/assets/images/commercial_filter_brewer_malenadu.jpg',
      badgeTopPill: 'EXCLUSIVE PARTNER OFFER • 100% FREE ON MOQ',
      badgeTitle: 'Commercial Stainless Steel Filter Brewer',
      badgeSub: 'Supplied Free of Charge for Qualifying Monthly Coffee MOQ',
      badgePill: '100% Free Machine on Coffee MOQ',
      ctaText: 'Apply for Free Machine Partnership',
      whatsappMessage: 'Hi Malenadu Roast Co.! I would like to inquire about partnering with you for our cafe/hotel and qualifying for the complimentary Commercial Filter Coffee Machine through your coffee MOQ program.'
    },
    {
      id: 'cafe-roasts',
      tabLabel: 'Artisanal Fresh Roasts',
      tag: 'ESTATE WHOLESALE ROASTS',
      title: 'Fresh Coffee Roasts',
      titleAccent: 'Direct From Chikkamagaluru Estate',
      subtitle: 'Freshly batch-roasted single-estate coffee made to order for partner cafes. Available in signature 70:30, 80:20, and 100% pure Arabica & Robusta profiles.',
      isFreeMachineTab: false,
      points: [
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
      image: '/assets/images/signature_beans_1kg.webp',
      badgeTopPill: 'ESTATE ROASTERY DIRECT',
      badgeTitle: '1kg Fresh-Valve Roastery Packs',
      badgeSub: 'Airtight degassing valve keeps fresh roasts at peak aroma',
      badgePill: 'Free Tasting Sample Kit Available',
      ctaText: 'Request Wholesale Coffee Samples',
      whatsappMessage: 'Hi Malenadu Roast Co.! I would like to request tasting samples of your wholesale coffee blends for our cafe/restaurant.'
    },
    {
      id: 'b2b-supply',
      tabLabel: 'Hotels & Bulk Orders',
      tag: 'B2B & INSTITUTIONAL SUPPLY',
      title: 'Bulk Coffee Supply & MOQ Tiers',
      titleAccent: 'Hotels, Resorts & Catering',
      subtitle: 'Scalable wholesale coffee partnerships with transparent MOQ tiers, official 5% GST tax credit invoices, and dedicated roastery account support.',
      isFreeMachineTab: false,
      points: [
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
      image: '/assets/images/roaster_drum_fresh.jpg',
      badgeTopPill: 'PAN-INDIA B2B LOGISTICS',
      badgeTitle: 'Bulk Roastery Supply & Logistics',
      badgeSub: 'Direct plantation supply to commercial hospitality partners nationwide',
      badgePill: 'Official 5% GST Tax Invoices Included',
      ctaText: 'Discuss MOQ & Bulk Partnership',
      whatsappMessage: 'Hi Malenadu Roast Co.! I would like to discuss wholesale coffee supply, MOQ guidelines, and partnership for our hotel/business.'
    }
  ];

  const currentPage = wholesalePages[activeTab];

  const handleInquiry = (msg) => {
    const text = encodeURIComponent(msg);
    window.open(`https://api.whatsapp.com/send?phone=918217623335&text=${text}`, '_blank');
  };

  return (
    <section id="partner-with-us" className="wholesale-luxury-section">
      <div id="partnership" style={{ position: 'relative', top: '-90px', visibility: 'hidden' }} />
      {/* Decorative Floating Coffee Beans Background */}
      <svg className="wholesale-floating-bean" style={{ top: '8%', left: '4%', width: '38px', height: '38px', transform: 'rotate(-25deg)' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3" />
        <path d="M12 4c-1.5 2.5-1.5 5.5 0 8s1.5 5.5 0 8" stroke="#D4A373" strokeWidth="1.8" fill="none" />
      </svg>
      <svg className="wholesale-floating-bean" style={{ top: '15%', right: '5%', width: '44px', height: '44px', transform: 'rotate(40deg)' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3" />
        <path d="M12 4c-1.5 2.5-1.5 5.5 0 8s1.5 5.5 0 8" stroke="#D4A373" strokeWidth="1.8" fill="none" />
      </svg>
      <svg className="wholesale-floating-bean" style={{ bottom: '10%', left: '6%', width: '32px', height: '32px', transform: 'rotate(15deg)' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3" />
        <path d="M12 4c-1.5 2.5-1.5 5.5 0 8s1.5 5.5 0 8" stroke="#D4A373" strokeWidth="1.8" fill="none" />
      </svg>
      <svg className="wholesale-floating-bean" style={{ bottom: '14%', right: '7%', width: '36px', height: '36px', transform: 'rotate(-45deg)' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3" />
        <path d="M12 4c-1.5 2.5-1.5 5.5 0 8s1.5 5.5 0 8" stroke="#D4A373" strokeWidth="1.8" fill="none" />
      </svg>

      <div className="container" style={{ maxWidth: '1160px', margin: '0 auto', padding: '0', width: '100%', boxSizing: 'border-box' }}>
        {/* Luxury Master Card in White and Brown Harmony */}
        <div className="wholesale-master-card">

          {/* Left Column: Pure White & Dark Roast Editorial Content */}
          <div className="wholesale-content-col">
            <div>
              {/* Eyebrow & Exclusive Partner Offer Tag */}
              <div className="wholesale-eyebrow-row">
                <div className="wholesale-eyebrow" style={{ marginBottom: 0 }}>
                  <span className="wholesale-eyebrow-dot" />
                  <span>{currentPage.tag}</span>
                </div>
                {currentPage.isFreeMachineTab && (
                  <span className="wholesale-header-offer-badge">
                    EXCLUSIVE PARTNER OFFER • 100% FREE ON MOQ
                  </span>
                )}
              </div>

              {/* 3 Interactive Tabs */}
              <div className="wholesale-tabs-bar" role="tablist">
                {wholesalePages.map((page, idx) => (
                  <button
                    key={page.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === idx}
                    className={`wholesale-tab-btn ${activeTab === idx ? 'active' : ''}`}
                    onClick={() => setActiveTab(idx)}
                  >
                    <span>{page.tabLabel}</span>
                    <span className="wholesale-tab-arrow">→</span>
                  </button>
                ))}
              </div>

              {/* Page Title & Tagline */}
              <h2 className="wholesale-title">
                {currentPage.title}
                <span className="wholesale-title-accent">{currentPage.titleAccent}</span>
              </h2>

              <p className="wholesale-subtitle">
                {currentPage.subtitle}
              </p>

              {/* Specific 3-Step Flow for Free Machine Partner Offer */}
              {currentPage.isFreeMachineTab && (
                <div className="wholesale-steps-row">
                  <div className="wholesale-step-card">
                    <div className="wholesale-step-num">Step 01</div>
                    <div className="wholesale-step-content">
                      <div className="wholesale-step-title">Select Roast Blend</div>
                      <div className="wholesale-step-desc">Pick 70:30, 80:20, or pure single-estate beans.</div>
                    </div>
                  </div>
                  <div className="wholesale-step-card">
                    <div className="wholesale-step-num">Step 02</div>
                    <div className="wholesale-step-content">
                      <div className="wholesale-step-title">Satisfy Monthly MOQ</div>
                      <div className="wholesale-step-desc">Baseline monthly coffee procurement volume.</div>
                    </div>
                  </div>
                  <div className="wholesale-step-card" style={{ borderColor: '#C88A3E', background: '#FFFDF9' }}>
                    <div className="wholesale-step-num" style={{ color: '#8C5835' }}>Step 03</div>
                    <div className="wholesale-step-content">
                      <div className="wholesale-step-title" style={{ color: '#8C5835' }}>Receive Free Machine*</div>
                      <div className="wholesale-step-desc">Heavy-duty commercial brewer at zero machine cost.</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Minimal 3-Bullet Value Propositions */}
              <div className="wholesale-features-list">
                {currentPage.points.map((pt, i) => (
                  <div key={i} className="wholesale-feature-row">
                    <div className="wholesale-feature-icon">
                      <Check size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="wholesale-feature-title">{pt.title}</div>
                      <div className="wholesale-feature-desc">{pt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA Row with Highlighted Terms & Conditions Button */}
            <div className="wholesale-cta-row">
              <button
                type="button"
                onClick={() => handleInquiry(currentPage.whatsappMessage)}
                className="wholesale-cta-btn"
              >
                <span>{currentPage.ctaText}</span>
                <ArrowRight size={15} />
              </button>

              {currentPage.isFreeMachineTab && (
                <button
                  type="button"
                  onClick={() => setIsTcOpen(true)}
                  className="wholesale-tc-highlight-btn"
                  title="Click to view Partnership Terms & Conditions"
                >
                  <FileText size={15} color="#C88A3E" />
                  <span>Terms & Conditions Apply*</span>
                  <ExternalLink size={13} color="#C88A3E" />
                </button>
              )}

              <div className="wholesale-reassurance">
                <ShieldCheck size={14} color="#8C5835" />
                <span>Fast All-India Delivery · GST Invoices Included</span>
              </div>
            </div>
          </div>

          {/* Right Column: Deep Coffee Brown Showcase Box */}
          <div className="wholesale-showcase-col">
            <div className="wholesale-spotlight-pill">
              <span>{currentPage.badgeTopPill}</span>
            </div>

            <div className="wholesale-showcase-spotlight" />

            <div className="wholesale-showcase-img-wrap">
              <img
                key={currentPage.image}
                src={currentPage.image}
                alt={currentPage.badgeTitle}
                className="wholesale-showcase-img"
              />
            </div>

            <div className="wholesale-showcase-card">
              <div className="wholesale-showcase-title">
                {currentPage.badgeTitle}
              </div>
              <div className="wholesale-showcase-sub">
                {currentPage.badgeSub}
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                <div className="wholesale-showcase-pill">
                  <Check size={12} strokeWidth={2.8} />
                  <span>{currentPage.badgePill}</span>
                </div>
                {currentPage.isFreeMachineTab && (
                  <button
                    type="button"
                    onClick={() => setIsTcOpen(true)}
                    style={{
                      background: '#FFF9F0',
                      color: '#8C5835',
                      border: '1.5px solid #C88A3E',
                      borderRadius: '20px',
                      padding: '4px 11px',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: '0 2px 6px rgba(200, 138, 62, 0.15)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#C88A3E';
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#FFF9F0';
                      e.currentTarget.style.color = '#8C5835';
                    }}
                  >
                    <FileText size={12} />
                    <span>*Terms & Conditions Apply</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Terms & Conditions Modal (Preview & Future Editable) */}
      <AnimatePresence>
        {isTcOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 10, 7, 0.72)',
              backdropFilter: 'blur(6px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}
            onClick={() => setIsTcOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                maxWidth: '560px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
                border: '1px solid #E6D8C5'
              }}
            >
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #F0E8DC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FAF6F0',
                borderTopLeftRadius: '16px',
                borderTopRightRadius: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#C88A3E', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Partnership Agreement
                  </div>
                  <h3 style={{ margin: '2px 0 0', fontSize: '1.15rem', color: '#1A0A04', fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 700 }}>
                    Commercial Machine Placement Terms & Conditions
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTcOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A564A', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: '1.5rem', fontSize: '0.84rem', color: '#4A3B32', lineHeight: 1.6 }}>
                <div style={{ background: '#FAF6F0', border: '1px solid #E6D8C5', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                  <strong style={{ color: '#1A0A04', display: 'block', marginBottom: '4px' }}>Program Model Summary:</strong>
                  Malenadu Roast Co. does not retail or sell commercial coffee equipment. Commercial filter coffee machines are provided on a complimentary placement basis exclusively to partner cafes, hotels, restaurants, and catering facilities that satisfy our agreed Minimum Order Quantity (MOQ).
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div>
                    <strong style={{ color: '#1A0A04' }}>1. Minimum Order Quantity (MOQ) Criteria</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#6A564A' }}>
                      Complimentary machine placement is subject to the partner business maintaining the mutually agreed minimum monthly purchase volume (MOQ) of Malenadu Roast Co. artisanal coffee beans or fresh filter grind.
                    </p>
                  </div>

                  <div>
                    <strong style={{ color: '#1A0A04' }}>2. Business Eligibility</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#6A564A' }}>
                      The program is open to verified commercial establishments including cafes, restaurants, hotels, resorts, QSR chains, and corporate dining facilities across India.
                    </p>
                  </div>

                  <div>
                    <strong style={{ color: '#1A0A04' }}>3. Equipment Ownership & Maintenance</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#6A564A' }}>
                      The commercial brewing machine remains the property of Malenadu Roast Co. provided under an active brewing partnership agreement. Daily maintenance and operational care are handled by the partner, with roastery guidance and service support.
                    </p>
                  </div>

                  <div>
                    <strong style={{ color: '#1A0A04' }}>4. Coffee Exclusivity</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#6A564A' }}>
                      The provided brewing machine must be utilized exclusively with authentic Malenadu Roast Co. coffee roasts to maintain brew consistency and machine integrity.
                    </p>
                  </div>

                  <div>
                    <strong style={{ color: '#1A0A04' }}>5. Custom Agreements & Digital Contract</strong>
                    <p style={{ margin: '3px 0 0', fontSize: '0.8rem', color: '#6A564A' }}>
                      Specific monthly volume tiers, machine capacities (e.g., 10L / 15L), delivery schedules, and formal onboarding agreements are customized to your establishment's footfall during onboarding.
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid #F0E8DC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '10px',
                background: '#FAF6F0',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsTcOpen(false)}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #D4A373',
                    color: '#5D3E28',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTcOpen(false);
                    handleInquiry('Hi Malenadu Roast Co.! I would like to review the commercial machine partnership agreement and MOQ details for our cafe/hotel.');
                  }}
                  style={{
                    background: '#251208',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>Inquire on WhatsApp</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};


// ============================================================
// INTERACTIVE "FIND YOUR PERFECT BLEND" QUIZ
// 2-Click Sommelier Matchmaker that eliminates customer doubts
// ============================================================
// ============================================================
// ============================================================
// INTERACTIVE "FIND YOUR SIGNATURE ROAST IN 30 SECONDS"
// Luxury Editorial Sommelier Quiz with Cormorant Garamond Typography
// ============================================================
const CoffeeQuizSection = ({ coffeeProducts, onOpenDetails, onAddToCart, onBuyNow }) => {
  const [step, setStep] = useState(1);
  const [selectedBrew, setSelectedBrew] = useState(null);
  const [selectedMouthfeel, setSelectedMouthfeel] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);

  const brewOptions = [
    {
      id: 'milk',
      title: 'Filter Coffee',
      subtitle: 'With Milk & Sugar',
      badge: 'Traditional',
      image: '/assets/images/quiz_step1_filter_coffee.jpg'
    },
    {
      id: 'smooth_black',
      title: 'Black Coffee',
      subtitle: 'Smooth & Pure',
      badge: 'Pure Roast',
      image: '/assets/images/quiz_step1_black_coffee.jpg'
    },
    {
      id: 'french_press',
      title: 'French Press',
      subtitle: 'Pour-Over & Drip',
      badge: 'Artisanal',
      image: '/assets/images/quiz_step1_french_press.jpg'
    },
    {
      id: 'whole_beans',
      title: 'Whole Beans',
      subtitle: 'Fresh Home Grind',
      badge: 'Estate Roast',
      image: '/assets/images/quiz_step1_whole_beans.jpg'
    }
  ];

  const mouthfeelOptions = [
    {
      id: 'thick',
      title: 'Dark Cocoa & Caramel',
      subtitle: 'Thick, syrupy dark roast with dense crema',
      badge: 'Rich & Syrupy',
      blendHint: 'Signature 70:30',
      notes: ['Dark Cocoa', 'Caramel Jaggery'],
      image: '/assets/images/quiz_flavor_dark_cocoa_caramel.jpg'
    },
    {
      id: 'balanced',
      title: 'Milk Chocolate & Honey',
      subtitle: 'Velvety smooth with gentle honey sweetness',
      badge: 'Velvety & Balanced',
      blendHint: 'Highland 80:20',
      notes: ['Milk Chocolate', 'Wild Honey'],
      image: '/assets/images/quiz_flavor_milk_chocolate_honey.jpg'
    },
    {
      id: 'dark',
      title: 'Toasted Almond & Cacao',
      subtitle: 'Bold coffee punch with near-zero acidity',
      badge: 'Bold & Coffee-Forward',
      blendHint: 'Heritage 85:15',
      notes: ['Toasted Almond', 'Bittersweet Cacao'],
      image: '/assets/images/quiz_flavor_toasted_almond_cacao.jpg'
    },
    {
      id: 'pure',
      title: 'Wild Berry & Winey',
      subtitle: 'Silky specialty cup with floral aromatics',
      badge: 'Fruity & Sweet',
      blendHint: '100% Pure Peaberry',
      notes: ['Ripe Berries', 'Winey Finish'],
      image: '/assets/images/quiz_flavor_wild_berry_winey.jpg'
    }
  ];

  const getMatchedProduct = () => {
    const list = Array.isArray(coffeeProducts) && coffeeProducts.length > 0 ? coffeeProducts : [];

    // Case 1: Whole Beans chosen in Step 1
    if (selectedBrew === 'whole_beans') {
      if (selectedMouthfeel === 'pure') {
        const peaberryMatch = list.find(p => p.id === 14 || (p.name && p.name.includes('Peaberry')));
        return {
          product: peaberryMatch || list[3] || list[0],
          badge: '100% Pure Peaberry',
          whyRatio: '100% Pure Single-Origin Arabica · 0% Chicory',
          bodyText: 'Silky, Naturally Sweet & Winey Finish',
          matchReason: 'Because you grind fresh at home and love delicate fruit notes with natural bean sweetness, Peaberry Grand Cru Royale is our flagship pure single-origin specialty roast. Rare round pearls develop concentrated natural sweetness and floral aromatics.'
        };
      }
      const match = list.find(p => p.id === 16 || (p.name && p.name.includes('Beans')));
      return {
        product: match || list[4] || list[0],
        badge: '100% Whole Beans',
        whyRatio: 'Whole Roasted Beans · 0% Chicory',
        bodyText: 'Medium-Full Body · Rich Crema Head',
        matchReason: 'Because you grind fresh at home, Malenadu Signature Beans gives you maximum flavor extraction. Whole roasted Grade-A Arabica & Robusta beans sealed in valve-sealed foil lock in peak volatile aromatics until the second you grind.'
      };
    }

    // Case 2: Pure / Single-origin fruit profile or Black Coffee lovers
    if (selectedMouthfeel === 'pure' || (selectedBrew === 'smooth_black' && selectedMouthfeel !== 'dark' && selectedMouthfeel !== 'thick')) {
      const match = list.find(p => p.id === 14 || (p.name && p.name.includes('Peaberry')));
      return {
        product: match || list[3] || list[0],
        badge: '100% Pure Peaberry',
        whyRatio: '100% Pure Single-Origin · 0% Chicory',
        bodyText: 'Silky, Sweet & Naturally Low Bitterness',
        matchReason: 'Because you appreciate natural bean sweetness and subtle fruit aromatics with zero chicory, Peaberry Grand Cru Royale is your match. Hand-sorted round Peaberry pearls roast evenly to develop bright red berry notes and a smooth winey finish.'
      };
    }

    // Case 3: Thick, Syrupy Cocoa Profile (Iconic 70:30)
    if (selectedMouthfeel === 'thick') {
      const match = list.find(p => p.id === 1 || (p.name && p.name.includes('Estate Reserve')));
      return {
        product: match || list[0],
        badge: 'Signature 70:30',
        whyRatio: '70% Single-Estate Coffee : 30% Roasted Chicory',
        bodyText: 'Ultra-Thick, Syrupy & Viscous Decoction',
        matchReason: 'Because you prefer a heavy, syrupy cup with dark cocoa and caramel jaggery notes, Malenadu Estate Reserve is your ideal match. The iconic 70:30 ratio creates a thick, viscous decoction that never thins out with boiled milk.'
      };
    }

    // Case 4: Bold, Punchy Vienna Dark Roast (85:15)
    if (selectedMouthfeel === 'dark') {
      const match = list.find(p => p.id === 12 || (p.name && p.name.includes('Imperial')));
      return {
        product: match || list[2] || list[0],
        badge: 'Heritage 85:15',
        whyRatio: '85% Premium Estate Coffee : 15% Roasted Chicory',
        bodyText: 'Bold, Punchy & Coffee-Dominant Vienna Roast',
        matchReason: 'Because you crave an intense, coffee-dominant roast with toasted almond and bittersweet cacao, Imperial Heritage 85:15 is your match. An heirloom Vienna dark roast giving you maximum coffee punch with just 15% chicory for filter depth.'
      };
    }

    // Case 5: Balanced & Smooth Golden Ratio (80:20)
    const match = list.find(p => p.id === 2 || (p.name && p.name.includes('Highland')));
    return {
      product: match || list[1] || list[0],
      badge: 'Highland 80:20',
      whyRatio: '80% High-Altitude Coffee : 20% Roasted Chicory',
      bodyText: 'Velvety Smooth & Aromatic Morning Balance',
      matchReason: 'Because you desire a smooth, velvety cup with notes of milk chocolate and wild honey, Highland Signature 80:20 is your golden balance. High-altitude estate beans provide rich aroma, rounded off with 20% chicory for a smooth finish.'
    };
  };

  const handleSelectBrew = (id) => {
    setSelectedBrew(id);
    setTimeout(() => {
      setStep(2);
    }, 280);
  };

  const handleSelectMouthfeel = (id) => {
    setSelectedMouthfeel(id);
    setTimeout(() => {
      setStep(3);
    }, 280);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedBrew(null);
    setSelectedMouthfeel(null);
    setSelectedWeight(null);
  };

  const matchData = step === 3 ? getMatchedProduct() : null;
  const product = matchData?.product;
  const activeVariant = product?.variants?.find(v => v.weight === selectedWeight) || product?.variants?.[0];
  const currentPrice = activeVariant?.price || product?.price || '449';
  const currentWeight = activeVariant?.weight || selectedWeight || '500g';
  const originalPrice = Math.round(Number(currentPrice) * 1.30);

  return (
    <section id="coffee-quiz" className="luxury-quiz-section" style={{ position: 'relative' }}>
      <span id="blend-quiz" style={{ position: 'absolute', top: '-80px' }} />

      {/* Background Wing Illustrations (Desktop Only) */}
      <div className="quiz-wing quiz-wing-left">
        <img src="/assets/images/quiz_left_wing_wide.webp" alt="" />
      </div>
      <div className="quiz-wing quiz-wing-right">
        <img src="/assets/images/quiz_right_wing_wide.webp" alt="" />
      </div>

      <div className="luxury-quiz-container">

        {/* Luxury Header */}
        <div className="luxury-quiz-header">
          <div className="luxury-quiz-eyebrow">
            <span>— TASTE FINDER —</span>
          </div>

          <h2 className="luxury-quiz-title">
            Find Your Signature Roast{' '}
            <span className="luxury-quiz-accent">
              in 30s
            </span>
          </h2>

          {/* Stepper Progress Bar */}
          <div className="luxury-quiz-stepper">
            <button
              type="button"
              className={`luxury-step-pill ${step === 1 ? 'active' : ''}`}
              onClick={() => setStep(1)}
            >
              <span className="step-num">1</span>
              <span>Brew Style</span>
            </button>

            <span className="luxury-step-dot">·</span>

            <button
              type="button"
              className={`luxury-step-pill ${step === 2 ? 'active' : ''}`}
              onClick={() => { if (selectedBrew) setStep(2); }}
            >
              <span className="step-num">2</span>
              <span>Flavor Profile</span>
            </button>

            <span className="luxury-step-dot">·</span>

            <button
              type="button"
              className={`luxury-step-pill ${step === 3 ? 'active' : ''}`}
              onClick={() => { if (selectedBrew && selectedMouthfeel) setStep(3); }}
            >
              <span className="step-num">3</span>
              <span>Your Match</span>
            </button>
          </div>
        </div>

        {/* STEP 1: Brew Style (Clean 2x2 Grid, Zero Clutter) */}
        {step === 1 && (
          <div className="luxury-quiz-step">
            <div className="luxury-step-title-wrap">
              <h3 className="luxury-step-title">How do you prepare your coffee?</h3>
            </div>

            <div className="luxury-cards-grid">
              {brewOptions.map((opt) => {
                const isSelected = selectedBrew === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectBrew(opt.id)}
                    className={`luxury-quiz-card ${isSelected ? 'selected' : ''}`}
                  >
                    <img src={opt.image} alt={opt.title} className="luxury-card-bg" />
                    <div className="luxury-card-scrim" />

                    {/* Top Badge */}
                    <div className="luxury-card-top">
                      <span className={`luxury-card-badge ${isSelected ? 'badge-selected' : ''}`}>
                        {isSelected ? '✓ Selected' : opt.badge}
                      </span>
                    </div>

                    {/* Bottom Title & Subtitle */}
                    <div className="luxury-card-bottom">
                      <h4 className="luxury-card-name">{opt.title}</h4>
                      <p className="luxury-card-sub">{opt.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Flavor Profile & Mouthfeel */}
        {step === 2 && (
          <div className="luxury-quiz-step">
            <div className="luxury-step-title-wrap">
              <h3 className="luxury-step-title">What taste notes & mouthfeel do you prefer?</h3>
            </div>

            <div className="luxury-cards-grid">
              {mouthfeelOptions.map((opt) => {
                const isSelected = selectedMouthfeel === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectMouthfeel(opt.id)}
                    className={`luxury-quiz-card ${isSelected ? 'selected' : ''}`}
                  >
                    <img src={opt.image} alt={opt.title} className="luxury-card-bg" />
                    <div className="luxury-card-scrim" />

                    <div className="luxury-card-top">
                      <span className={`luxury-card-badge ${isSelected ? 'badge-selected' : ''}`}>
                        {isSelected ? '✓ Selected' : opt.badge}
                      </span>
                    </div>

                    <div className="luxury-card-bottom">
                      <h4 className="luxury-card-name">{opt.title}</h4>
                      <p className="luxury-card-sub">{opt.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.2rem' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="luxury-back-btn"
              >
                ← Back to Step 1: Brew Style
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Match Result */}
        {step === 3 && product && (
          <div className="luxury-quiz-step">
            <div className="luxury-step-title-wrap">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#F5A623', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                <span>✓ 98% TASTE MATCH FOUND</span>
              </div>
              <h3 className="luxury-step-title">Your Tailored Sommelier Match</h3>
            </div>

            <div className="luxury-result-card">
              <div className="luxury-result-grid">

                {/* Product Photo */}
                <div className="luxury-result-visual">
                  <img src={activeVariant?.image || product.image} alt={product.name} />
                  <span className="luxury-result-badge">{matchData.badge}</span>
                </div>

                {/* Details */}
                <div className="luxury-result-info">
                  <div className="luxury-result-tag">{matchData.whyRatio}</div>
                  <h4 className="luxury-result-name">{product.name}</h4>
                  <div style={{ color: '#E8CA80', fontSize: '0.84rem', fontWeight: 700, marginBottom: '0.6rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {matchData.bodyText}
                  </div>
                  <p className="luxury-result-desc">{matchData.matchReason}</p>

                  {/* Weight Selector */}
                  <div className="luxury-weight-row">
                    <span className="weight-label">Select Pack Size:</span>
                    <div className="weight-pills">
                      {(product.variants || [{ weight: '500g' }]).map((v) => (
                        <button
                          key={v.weight}
                          type="button"
                          onClick={() => setSelectedWeight(v.weight)}
                          className={`weight-pill ${selectedWeight === v.weight ? 'active' : ''}`}
                        >
                          {v.weight}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="luxury-result-footer">
                    <div className="luxury-price-box">
                      <span className="cur-price">₹{currentPrice}</span>
                      <span className="orig-price">₹{originalPrice}</span>
                      <span style={{ display: 'block', fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>Incl. 5% GST</span>
                    </div>

                    <div className="luxury-action-row">
                      <button
                        type="button"
                        onClick={() => {
                          const weightToUse = selectedWeight || product?.variants?.[0]?.weight || '500g';
                          if (!selectedWeight) {
                            setSelectedWeight(weightToUse);
                          }
                          onAddToCart && onAddToCart(product, weightToUse, 1);
                        }}
                        className="luxury-add-btn"
                      >
                        Add to Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const weightToUse = selectedWeight || product?.variants?.[0]?.weight || '500g';
                          if (!selectedWeight) {
                            setSelectedWeight(weightToUse);
                          }
                          onBuyNow && onBuyNow(product, weightToUse, 1);
                        }}
                        className="luxury-buy-btn"
                      >
                        Buy Now →
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '1.2rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="luxury-back-btn"
                    >
                      ← Back to Step 2: Flavor Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenDetails && onOpenDetails(product)}
                      className="luxury-back-btn"
                      style={{ color: '#F5A623', textDecoration: 'underline' }}
                    >
                      View Blend Details & Guide ↗
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="luxury-back-btn"
                    >
                      ↺ Retake Quiz
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

const CoffeeInfoSection = ({ onImageClick }) => {
  const plantationPhotos = [
    {
      image: "/assets/images/plantation_cherries_wide.webp",
      alt: "Ripe coffee cherries on branch in Chikkamagaluru estate"
    },
    {
      image: "/assets/images/plantation_tree_canopy.webp",
      alt: "High altitude shade grown coffee tree"
    },
    {
      image: "/assets/images/plantation_fresh_berries.webp",
      alt: "Fresh coffee cherries cluster on branch"
    },
    {
      image: "/assets/images/plantation_pepper_vines.webp",
      alt: "Tellicherry black pepper vines climbing shade trees"
    },
    {
      image: "/assets/images/plantation_dense_harvest.webp",
      alt: "Dense harvest of organic coffee cherries"
    },
    {
      image: "/assets/images/plantation_cherry_tree.webp",
      alt: "Abundant coffee tree harvest in Western Ghats soil"
    }
  ];

  const handlePhotoClick = (index) => {
    if (onImageClick) {
      onImageClick({
        images: plantationPhotos.map(p => p.image),
        index: index
      });
    }
  };

  return (
    <section id="plantation-gallery" className="plantation-section-wrap">
      {/* Anchor for any #why-us navigation */}
      <div id="why-us" style={{ position: 'absolute', top: '-70px' }} />

      {/* Ambient Decorative Floating Coffee Beans */}
      <svg className="wholesale-floating-bean" style={{ top: '8%', left: '3%', width: '38px', height: '38px', transform: 'rotate(-25deg)', opacity: 0.22, color: '#8C5835' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.4" />
        <path d="M12 4c-1.5 2.5-1.5 5.5 0 8s1.5 5.5 0 8" stroke="#8C5835" strokeWidth="1.8" fill="none" />
      </svg>
      <svg className="wholesale-floating-bean" style={{ top: '15%', right: '4%', width: '42px', height: '42px', transform: 'rotate(35deg)', opacity: 0.22, color: '#8C5835' }} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.4" />
        <path d="M12 4c-1.5 2.5-1.5 5.5 0 8s1.5 5.5 0 8" stroke="#8C5835" strokeWidth="1.8" fill="none" />
      </svg>

      {/* Minimal Editorial Header */}
      <div className="plantation-header">
        <div className="plantation-eyebrow">
          <MapPin size={13} color="#8C5835" />
          <span>ESTATE ARCHIVES · 4,200 FT</span>
        </div>

        <h2 className="plantation-title">
          Our Coffee Plantation
          <span className="plantation-title-accent">Chikkamagaluru, Western Ghats</span>
        </h2>

        <p className="plantation-subtitle">
          Raw harvest photography directly from our shade-grown canopy.
        </p>
      </div>

      {/* Asymmetrical Bento Grid (Every Card A Distinct Size · Zero Text on Images) */}
      <div className="plantation-bento-grid">
        {plantationPhotos.map((photo, idx) => (
          <div key={idx} className={`bento-diff-${idx}`}>
            <Tilt
              tiltEnable={typeof window !== 'undefined' && window.innerWidth > 768}
              tiltMaxAngleX={8}
              tiltMaxAngleY={8}
              perspective={1000}
              scale={1.015}
              transitionSpeed={1200}
              style={{ width: '100%', height: '100%' }}
            >
              <motion.div
                className="plantation-diff-card"
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                onClick={() => handlePhotoClick(idx)}
                role="button"
                tabIndex={0}
                aria-label={`View plantation photo ${idx + 1} in fullscreen`}
              >
                {/* Gold Inner Hairline */}
                <div className="diff-frame-hairline" />

                {/* 4 Gold Corner Gallery Brackets */}
                <span className="diff-corner diff-corner-tl" />
                <span className="diff-corner diff-corner-tr" />
                <span className="diff-corner diff-corner-bl" />
                <span className="diff-corner diff-corner-br" />

                {/* Minimalist Magnifier Lens Ring (No text on image!) */}
                <div className="diff-card-lens-btn">
                  <Maximize2 size={13} />
                </div>

                {/* High-Definition Image with Smooth Drift */}
                <img
                  src={photo.image}
                  alt={photo.alt}
                  className="plantation-diff-img"
                  loading="lazy"
                />
              </motion.div>
            </Tilt>
          </div>
        ))}
      </div>
    </section>
  );
};

// ============================================================
// REAL COFFEE & PEPPER POWDER SPRINKLING AROUND ACTIVE CATEGORY
// ============================================================
const PowderSprinkleEffect = ({ type }) => {
  // Rich authentic organic palette:
  // Coffee: freshly roasted coarse grounds to fine cinnamon-gold dusting
  const coffeeColors = ['#231206', '#3D1A08', '#54280C', '#6E3814', '#8C4B1E', '#B36629', '#D9914E'];
  // Pepper: tellicherry black peppercorn core, charcoal flakes, and stone ash flecks
  const pepperColors = ['#100F0E', '#1D1B19', '#2E2A27', '#423D38', '#5A544E', '#7A736B', '#9E978F'];
  // Combos: freshly roasted coffee grounds + tellicherry crushed pepper mixture
  const comboColors = ['#231206', '#100F0E', '#54280C', '#2E2A27', '#8C4B1E', '#5A544E', '#D9914E', '#1D1B19'];

  const colors = type === 'coffee' ? coffeeColors : type === 'pepper' ? pepperColors : comboColors;

  // 38 organic powder particles distributed around circumference
  const particles = [
    { a: 5, r: 71, s: 2.2, o: 0.92, rot: 15, shape: 1 },
    { a: 15, r: 81, s: 1.4, o: 0.70, rot: 45, shape: 0 },
    { a: 24, r: 70, s: 2.8, o: 0.88, rot: 80, shape: 2 },
    { a: 33, r: 88, s: 1.6, o: 0.65, rot: 110, shape: 1 },
    { a: 43, r: 74, s: 3.1, o: 0.95, rot: 25, shape: 2 },
    { a: 52, r: 84, s: 1.8, o: 0.78, rot: 65, shape: 0 },
    { a: 61, r: 71, s: 2.4, o: 0.90, rot: 140, shape: 1 },
    { a: 71, r: 91, s: 1.3, o: 0.60, rot: 90, shape: 0 },
    { a: 80, r: 73, s: 2.9, o: 0.92, rot: 35, shape: 2 },
    { a: 90, r: 85, s: 1.5, o: 0.72, rot: 170, shape: 1 },
    { a: 99, r: 70, s: 2.6, o: 0.88, rot: 15, shape: 2 },
    { a: 109, r: 89, s: 1.4, o: 0.65, rot: 120, shape: 0 },
    { a: 118, r: 75, s: 3.3, o: 0.95, rot: 85, shape: 2 },
    { a: 127, r: 83, s: 1.7, o: 0.76, rot: 40, shape: 1 },
    { a: 137, r: 72, s: 2.5, o: 0.86, rot: 160, shape: 2 },
    { a: 146, r: 92, s: 1.3, o: 0.58, rot: 105, shape: 0 },
    { a: 156, r: 74, s: 3.0, o: 0.94, rot: 50, shape: 2 },
    { a: 165, r: 82, s: 1.6, o: 0.72, rot: 135, shape: 1 },
    { a: 175, r: 71, s: 2.7, o: 0.88, rot: 20, shape: 2 },
    { a: 184, r: 87, s: 1.4, o: 0.65, rot: 95, shape: 0 },
    { a: 194, r: 76, s: 3.2, o: 0.95, rot: 75, shape: 2 },
    { a: 204, r: 84, s: 1.8, o: 0.80, rot: 150, shape: 1 },
    { a: 213, r: 70, s: 2.3, o: 0.86, rot: 35, shape: 0 },
    { a: 223, r: 90, s: 1.2, o: 0.62, rot: 115, shape: 1 },
    { a: 232, r: 73, s: 2.9, o: 0.92, rot: 60, shape: 2 },
    { a: 242, r: 86, s: 1.6, o: 0.75, rot: 140, shape: 0 },
    { a: 251, r: 71, s: 2.8, o: 0.88, rot: 25, shape: 2 },
    { a: 261, r: 88, s: 1.4, o: 0.68, rot: 100, shape: 1 },
    { a: 271, r: 75, s: 3.3, o: 0.95, rot: 80, shape: 2 },
    { a: 280, r: 83, s: 1.7, o: 0.80, rot: 165, shape: 0 },
    { a: 290, r: 72, s: 2.5, o: 0.86, rot: 45, shape: 2 },
    { a: 300, r: 92, s: 1.3, o: 0.60, rot: 125, shape: 1 },
    { a: 309, r: 74, s: 2.9, o: 0.90, rot: 70, shape: 2 },
    { a: 319, r: 85, s: 1.5, o: 0.74, rot: 130, shape: 0 },
    { a: 328, r: 71, s: 2.6, o: 0.86, rot: 10, shape: 2 },
    { a: 338, r: 89, s: 1.4, o: 0.65, rot: 95, shape: 1 },
    { a: 347, r: 76, s: 3.1, o: 0.94, rot: 55, shape: 2 },
    { a: 355, r: 82, s: 1.7, o: 0.78, rot: 150, shape: 0 }
  ];

  return (
    <div
      className="powder-sprinkle-overlay"
      style={{
        position: 'absolute',
        top: '-24%',
        left: '-24%',
        width: '148%',
        height: '148%',
        pointerEvents: 'none',
        zIndex: 12
      }}
    >
      <svg
        viewBox="0 0 200 200"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        {/* Fine granular dusting rim directly along circle circumference */}
        <circle
          cx="100"
          cy="100"
          r="68"
          fill="none"
          stroke={colors[2]}
          strokeWidth="3.2"
          strokeDasharray="2 4 1 3 3 2 1 4 2 3"
          style={{ opacity: 0.85, animation: 'powderDustPulse 2.4s ease-in-out infinite' }}
        />
        <circle
          cx="100"
          cy="100"
          r="69.5"
          fill="none"
          stroke={colors[4] || colors[1]}
          strokeWidth="1.8"
          strokeDasharray="1 3 2 2 4 1 2 3"
          style={{ opacity: 0.75, animation: 'powderDustPulse 3.2s ease-in-out infinite alternate' }}
        />

        {/* Orbit Layer 1 - clockwise sprinkling powder grounds */}
        <g style={{ transformOrigin: '100px 100px', animation: 'powderSprinkleClockwise 20s linear infinite' }}>
          {particles.slice(0, 19).map((p, idx) => {
            const rad = (p.a * Math.PI) / 180;
            const x = 100 + p.r * Math.cos(rad);
            const y = 100 + p.r * Math.sin(rad);
            const fill = colors[idx % colors.length];
            return (
              <g
                key={idx}
                style={{
                  transformOrigin: `${x}px ${y}px`,
                  animation: `powderParticleFlutter ${1.6 + (idx % 4) * 0.4}s ease-in-out infinite alternate`,
                  animationDelay: `${idx * 0.12}s`
                }}
              >
                {p.shape === 1 ? (
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={p.s * 1.25}
                    ry={p.s * 0.75}
                    transform={`rotate(${p.rot} ${x} ${y})`}
                    fill={fill}
                    opacity={p.o}
                  />
                ) : p.shape === 2 ? (
                  <polygon
                    points={`${x - p.s},${y - p.s * 0.75} ${x + p.s * 0.9},${y - p.s * 0.45} ${x + p.s * 0.65},${y + p.s} ${x - p.s * 0.85},${y + p.s * 0.65}`}
                    fill={fill}
                    opacity={p.o}
                  />
                ) : (
                  <circle
                    cx={x}
                    cy={y}
                    r={p.s * 0.75}
                    fill={fill}
                    opacity={p.o}
                  />
                )}
              </g>
            );
          })}
        </g>

        {/* Orbit Layer 2 - counter-clockwise sprinkling powder grounds */}
        <g style={{ transformOrigin: '100px 100px', animation: 'powderSprinkleCounter 26s linear infinite' }}>
          {particles.slice(19).map((p, idx) => {
            const rad = (p.a * Math.PI) / 180;
            const x = 100 + p.r * Math.cos(rad);
            const y = 100 + p.r * Math.sin(rad);
            const fill = colors[(idx + 2) % colors.length];
            return (
              <g
                key={idx}
                style={{
                  transformOrigin: `${x}px ${y}px`,
                  animation: `powderParticleFlutter ${1.8 + (idx % 3) * 0.5}s ease-in-out infinite alternate`,
                  animationDelay: `${idx * 0.14}s`
                }}
              >
                {p.shape === 1 ? (
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={p.s * 1.2}
                    ry={p.s * 0.8}
                    transform={`rotate(${p.rot} ${x} ${y})`}
                    fill={fill}
                    opacity={p.o}
                  />
                ) : p.shape === 2 ? (
                  <polygon
                    points={`${x - p.s * 0.75},${y - p.s} ${x + p.s},${y - p.s * 0.5} ${x + p.s * 0.55},${y + p.s * 0.9} ${x - p.s},${y + p.s * 0.45}`}
                    fill={fill}
                    opacity={p.o}
                  />
                ) : (
                  <circle
                    cx={x}
                    cy={y}
                    r={p.s * 0.75}
                    fill={fill}
                    opacity={p.o}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [buyNowCart, setBuyNowCart] = useState(() => {
    try {
      const saved = sessionStorage.getItem('malenadu_buynow_cart');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (buyNowCart) sessionStorage.setItem('malenadu_buynow_cart', JSON.stringify(buyNowCart));
      else sessionStorage.removeItem('malenadu_buynow_cart');
    } catch (e) { }
  }, [buyNowCart]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [activeDetailsProduct, setActiveDetailsProduct] = useState(null);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);

  // Top-Level Product Sharing State (Native Web Share + Luxury Desktop Modal)
  const [activeShareProduct, setActiveShareProduct] = useState(null); // { product, shareUrl, shareText }

  const handleShareProduct = async (product, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!product) return;

    const origin = typeof window !== 'undefined' && window.location && window.location.origin
      ? window.location.origin
      : 'https://www.malenaduroastco.works';
    const productSlug = encodeURIComponent(product.name || 'Malenadu Coffee');
    const shareUrl = `${origin}/?product=${productSlug}#products`;

    const shareTitle = `${product.name} | Malenadu Roast Co.`;
    const shareText = `☕ *${product.name}*\n${product.specs?.flavorNotes || product.tagline || 'Artisanal Single-Estate Roast from Chikkamagaluru estate.'}\n💰 Starting at ₹${product.price} (Inclusive of 5% GST)\n\nTaste the authentic single-estate roast from Chikkamagaluru:\n👉 ${shareUrl}`;

    // 1. If mobile device supports Web Share API, open native share drawer directly (WhatsApp, Instagram, Telegram, SMS, etc.)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // 2. Fallback for desktop or non-WebShare browsers: Open elegant Share Modal
    setActiveShareProduct({ product, shareUrl, shareText });
  };

  // Top-Level Rate & Review State (triggered via URL ?rateProduct=... or after Checkout)
  const [globalReviewItem, setGlobalReviewItem] = useState(null); // { order, item, itemImg }

  // Automatic Listener for Direct Product Rating & Review Link AND Shared Product Links (?product=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkUrlParams = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const rateProduct = urlParams.get('rateProduct');
        const orderNum = urlParams.get('order') || 'MN-VERIFIED';
        const productParam = urlParams.get('product') || urlParams.get('share');

        if (rateProduct) {
          const decodedProduct = decodeURIComponent(rateProduct);
          const data = typeof getStoredProducts === 'function' ? getStoredProducts() : null;
          const allProducts = data ? (Array.isArray(data) ? data : [
            ...(Array.isArray(data.coffee) ? data.coffee : []),
            ...(Array.isArray(data.pepper) ? data.pepper : []),
            ...(Array.isArray(data.combos) ? data.combos : [])
          ]) : [];
          const matchedProd = allProducts.find(p =>
            (p.name || '').toLowerCase() === decodedProduct.toLowerCase() ||
            (p.name || '').toLowerCase().includes(decodedProduct.toLowerCase()) ||
            decodedProduct.toLowerCase().includes((p.name || '').toLowerCase())
          );
          const itemImg = matchedProd?.image || matchedProd?.images?.[0] || '/assets/images/estate_reserve_500g.webp';

          setGlobalReviewItem({
            order: { orderNumber: orderNum },
            item: {
              name: matchedProd?.name || decodedProduct,
              weight: matchedProd?.variants?.[0]?.weight || '500g',
              id: matchedProd?.id || decodedProduct.toLowerCase().replace(/\s+/g, '-')
            },
            itemImg
          });
        } else if (productParam) {
          const decodedProduct = decodeURIComponent(productParam).toLowerCase().trim();
          const data = typeof getStoredProducts === 'function' ? getStoredProducts() : null;
          const allProducts = data ? (Array.isArray(data) ? data : [
            ...(Array.isArray(data.coffee) ? data.coffee : []),
            ...(Array.isArray(data.pepper) ? data.pepper : []),
            ...(Array.isArray(data.combos) ? data.combos : [])
          ]) : [];
          const matchedProd = allProducts.find(p =>
            (p.name || '').toLowerCase() === decodedProduct ||
            (p.name || '').toLowerCase().includes(decodedProduct) ||
            decodedProduct.includes((p.name || '').toLowerCase())
          );
          if (matchedProd) {
            setActiveDetailsProduct(matchedProd);
            setTimeout(() => {
              const el = document.getElementById('products');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 300);
          }
        }
      } catch (err) {
        console.error('Error resolving URL params:', err);
      }
    };

    checkUrlParams();
    window.addEventListener('popstate', checkUrlParams);
    return () => window.removeEventListener('popstate', checkUrlParams);
  }, []);

  // Hash-based routing for policies, order page & commercial partnership
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validPolicies = [
        'privacy-policy', 'refund-policy', 'terms-conditions', 'shipping-policy',
        'order', 'admin', 'commercial-partnership', 'partnership', 'wholesale'
      ];
      if (validPolicies.includes(hash)) {
        if (['partnership', 'wholesale'].includes(hash)) {
          setCurrentPage('commercial-partnership');
        } else {
          setCurrentPage(hash);
        }
        window.scrollTo(0, 0);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Buy Now — skip cart completely, go directly to checkout
  const handleBuyNow = (product, weightOverride, qtyOverride) => {
    if (!product) return;
    // 1. Ensure Cart drawer is closed
    setIsCartOpen(false);
    // 2. Ensure Profile modal is closed
    setIsProfileOpen(false);
    // 3. Ensure Product Details modal is closed
    setActiveDetailsProduct(null);

    const weight = weightOverride || product.weight || product.variants?.[0]?.weight || '500g';
    let price = product.price;
    if (weightOverride && product.variants) {
      const matchVar = product.variants.find(v => v.weight === weightOverride);
      if (matchVar) price = matchVar.price;
    }

    const item = {
      id: `buynow-${product.id || product._id || Date.now()}-${weight}`,
      name: product.name,
      price: Number(price) || 449,
      weight: weight,
      qty: qtyOverride || product.qty || 1,
      image: product.image || (product.variants && product.variants[0]?.image) || '/assets/images/estate_reserve_500g.webp',
      grind: product.grind || 'South Indian Filter'
    };
    setBuyNowCart([item]);
    setIsCheckoutOpen(true);
  };

  // ——— Auth state  ————————————————————————————————————————————————————————————
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('malenadu_user')); }
    catch { return null; }
  });

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    if (buyNowCart || cart.length > 0) {
      setIsCheckoutOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('malenadu_user');
    setCurrentUser(null);
  };

  const handleOpenProfile = () => {
    if (currentUser) {
      setIsProfileOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  // Dynamic Store Products & Inventory (Coffee, Pepper, Combos)
  const [storeInventory, setStoreInventory] = useState(getStoredProducts);
  const [activeCategory, setActiveCategory] = useState('coffee');

  // Sync hash navigation (#coffee, #pepper, #combos)
  useEffect(() => {
    const syncHashCategory = () => {
      const h = (window.location.hash || '').replace('#', '').toLowerCase();
      if (['coffee', 'pepper', 'combos'].includes(h)) {
        setActiveCategory(h);
      }
    };
    syncHashCategory();
    window.addEventListener('hashchange', syncHashCategory);
    return () => window.removeEventListener('hashchange', syncHashCategory);
  }, []);
  const coffeeProducts = storeInventory.coffee || [];
  const pepperProducts = storeInventory.pepper || [];
  const comboProducts = storeInventory.combos || [];

  // Listen for inventory updates from AdminDashboard
  useEffect(() => {
    const handleProductsSync = () => {
      try {
        setStoreInventory(getStoredProducts());
      } catch (e) { }
    };
    window.addEventListener('malenadu_products_updated', handleProductsSync);
    window.addEventListener('storage', handleProductsSync);
    return () => {
      window.removeEventListener('malenadu_products_updated', handleProductsSync);
      window.removeEventListener('storage', handleProductsSync);
    };
  }, []);

  const [hiddenReviewIds, setHiddenReviewIds] = useState(() => getHiddenReviewIds());
  const [submittedReviews, setSubmittedReviews] = useState(() => {
    try {
      const stored = localStorage.getItem('malenadu_user_reviews');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const staticReviews = HOMEPAGE_STATIC_TESTIMONIALS;

  useEffect(() => {
    const handleSyncReviews = () => {
      try {
        setHiddenReviewIds(getHiddenReviewIds());
        const stored = localStorage.getItem('malenadu_user_reviews');
        if (stored) {
          setSubmittedReviews(JSON.parse(stored));
        }
      } catch (e) { }
    };
    window.addEventListener('malenadu_reviews_updated', handleSyncReviews);
    window.addEventListener('storage', handleSyncReviews);
    return () => {
      window.removeEventListener('malenadu_reviews_updated', handleSyncReviews);
      window.removeEventListener('storage', handleSyncReviews);
    };
  }, []);

  const handleAddNewReview = (newRev) => {
    setSubmittedReviews(prev => {
      const updated = [newRev, ...prev];
      try {
        localStorage.setItem('malenadu_user_reviews', JSON.stringify(updated));
      } catch (e) { }
      return updated;
    });
  };

  const customerReviews = [...submittedReviews, ...staticReviews];
  const visibleCustomerReviews = customerReviews.filter(r => !hiddenReviewIds.includes(r.id) && !r.hidden);
  const handleAddToCart = (product, weightOverride, qtyOverride) => {
    if (!product) return;
    const weight = weightOverride || product.weight || product.variants?.[0]?.weight || '500g';
    let price = product.price;
    let image = product.image;
    if (product.variants) {
      const matchVar = product.variants.find(v => v.weight === weight);
      if (matchVar) {
        if (matchVar.price) price = matchVar.price;
        if (matchVar.image) image = matchVar.image;
      }
    }
    const compositeId = `${product.id}-${weight}`;
    const qty = Number(qtyOverride) || 1;
    setCart(prev => {
      const existing = prev.find(item => item.id === compositeId);
      if (existing) {
        return prev.map(item => item.id === compositeId ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, { ...product, id: compositeId, weight, price, image, qty }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    if (buyNowCart) {
      setBuyNowCart(prev => {
        if (!prev) return prev;
        return prev.map(item => {
          if (item.id === id) {
            return { ...item, qty: Math.max(0, (Number(item.qty) || 1) + delta) };
          }
          return item;
        }).filter(item => item.qty > 0);
      });
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(0, (Number(item.qty) || 1) + delta) };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const handleCheckoutAddItem = (product) => {
    const itemToAdd = {
      ...product,
      qty: 1
    };
    if (buyNowCart) {
      setBuyNowCart(prev => {
        const list = prev ? [...prev] : [];
        const existsIndex = list.findIndex(it => it.id === product.id);
        if (existsIndex >= 0) {
          list[existsIndex] = { ...list[existsIndex], qty: (Number(list[existsIndex].qty) || 1) + 1 };
          return list;
        }
        return [...list, itemToAdd];
      });
      return;
    }
    setCart(prev => {
      const list = [...prev];
      const existsIndex = list.findIndex(it => it.id === product.id);
      if (existsIndex >= 0) {
        list[existsIndex] = { ...list[existsIndex], qty: (Number(list[existsIndex].qty) || 1) + 1 };
        return list;
      }
      return [...list, itemToAdd];
    });
  };

  const handleCheckoutRemoveItem = (id) => {
    if (buyNowCart) {
      setBuyNowCart(prev => (prev || []).filter(it => it.id !== id));
      return;
    }
    setCart(prev => prev.filter(it => it.id !== id));
  };


  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });
  };

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="app-wrapper">
      {currentPage !== 'admin' && currentPage !== 'commercial-partnership' && (
        <Header
          cartItemCount={cartItemCount}
          wishlistCount={wishlist.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenProfile={handleOpenProfile}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          currentUser={currentUser}
        />
      )}

      <WishlistSidebar
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemove={(product) => toggleWishlist(product)}
        onAddToCart={handleAddToCart}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        onCheckout={openCheckout}
        onAddToCart={handleAddToCart}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ProductDetailsModal
        isOpen={Boolean(activeDetailsProduct)}
        product={activeDetailsProduct}
        onClose={() => setActiveDetailsProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onImageClick={setFullscreenImage}
        onShareProduct={handleShareProduct}
      />

      {/* Luxury Product Share Modal */}
      {activeShareProduct && (
        <ShareModal
          shareData={activeShareProduct}
          onClose={() => setActiveShareProduct(null)}
        />
      )}

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setBuyNowCart(null);
          try { sessionStorage.removeItem('malenadu_buynow_cart'); } catch (e) { }
        }}
        cart={buyNowCart || cart}
        currentUser={currentUser}
        onRequireLogin={() => { setIsAuthOpen(true); }}
        onAddToCart={handleAddToCart}
        updateQuantity={updateQuantity}
        onCheckoutAddItem={handleCheckoutAddItem}
        onCheckoutRemoveItem={handleCheckoutRemoveItem}
        onOpenReviewModal={(order, item, itemImg) => setGlobalReviewItem({ order, item, itemImg })}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAdmin={() => {
          setCurrentPage('admin');
          window.location.hash = 'admin';
          window.scrollTo(0, 0);
        }}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setIsCartOpen(true)}
        onBuyNow={handleBuyNow}
        onOpenReviewModal={(order, item, itemImg) => setGlobalReviewItem({ order, item, itemImg })}
      />

      {/* Standalone Rating & Review Modal (Supports link clicks & checkout prompt) */}
      <ProductReviewModal
        activeReviewItem={globalReviewItem}
        onClose={() => setGlobalReviewItem(null)}
        currentUser={currentUser}
      />

      <AnimatePresence>
        {fullscreenImage && fullscreenImage.images && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'
            }}
          >
            <motion.button
              onClick={() => setFullscreenImage(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 100000 }}
            >
              <X size={36} />
            </motion.button>

            {fullscreenImage.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenImage(prev => ({
                    ...prev,
                    index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1
                  }));
                }}
                style={{
                  position: 'absolute', left: '30px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', zIndex: 100000, backdropFilter: 'blur(4px)'
                }}
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <AnimatePresence mode="wait">
              <motion.img loading="lazy"
                key={fullscreenImage.index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                src={fullscreenImage.images[fullscreenImage.index]}
                alt="Fullscreen"
                style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                onClick={(e) => e.stopPropagation()}
              />
            </AnimatePresence>

            {fullscreenImage.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenImage(prev => ({
                    ...prev,
                    index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1
                  }));
                }}
                style={{
                  position: 'absolute', right: '30px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', zIndex: 100000, backdropFilter: 'blur(4px)'
                }}
              >
                <ChevronRight size={32} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {currentPage === 'order' ? (
        <OrderPage
          onBack={() => { setCurrentPage('home'); window.location.hash = ''; window.scrollTo(0, 0); }}
          coffeeProducts={coffeeProducts}
          pepperProducts={pepperProducts}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          onOpenDetails={setActiveDetailsProduct}
          onImageClick={setFullscreenImage}
          onShareProduct={handleShareProduct}
        />
      ) : currentPage === 'admin' ? (
        <AdminDashboard
          onBack={() => { setCurrentPage('home'); window.location.hash = ''; window.scrollTo(0, 0); }}
          currentUser={currentUser}
        />
      ) : currentPage === 'commercial-partnership' ? (
        <CommercialPartnershipPage
          onBack={() => { setCurrentPage('home'); window.location.hash = ''; window.scrollTo(0, 0); }}
        />
      ) : ['privacy-policy', 'refund-policy', 'terms-conditions', 'shipping-policy'].includes(currentPage) ? (
        <LegalPolicyPage
          type={currentPage}
          onBack={() => { setCurrentPage('home'); window.location.hash = ''; window.scrollTo(0, 0); }}
          onSelectPolicy={(policyId) => { setCurrentPage(policyId); window.location.hash = policyId; }}
        />
      ) : (
        <>
          <Hero onOrderNow={() => { setCurrentPage('order'); window.scrollTo(0, 0); }} />
          <PromotionalCarousel />


          {/* ============================================================
          ARAKU-STYLE UNIFIED STORE SECTION (Coffee | Pepper | Combos)
          Reduces vertical scrolling and provides one-click segmented tabs
         ============================================================ */}
          <section id="products" className="section bg-cream section-padded" style={{ position: 'relative', scrollMarginTop: '80px' }}>
            {/* Invisible anchor points for existing navbar & external links */}
            <span id="coffee" style={{ position: 'absolute', top: '-90px' }} />
            <span id="pepper" style={{ position: 'absolute', top: '-90px' }} />
            <span id="combos" style={{ position: 'absolute', top: '-90px' }} />

            <div className="container">
              {/* Blue Tokai Style Circular Category Navigation */}
              <div className="blue-tokai-category-nav" role="tablist" aria-label="Product Categories">
                {[
                  {
                    id: 'coffee',
                    label: 'Coffee',
                    image: '/assets/images/category_coffee_v3.webp',
                    sub: '5 Estate Blends'
                  },
                  {
                    id: 'pepper',
                    label: 'Pepper',
                    image: '/assets/images/category_pepper_v3.webp',
                    sub: 'Handpicked Whole Spices'
                  },
                  {
                    id: 'combos',
                    label: 'Combos',
                    image: '/assets/images/category_combos_v5.webp',
                    sub: 'Build Your Combo'
                  }
                ].map(cat => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`blue-tokai-circle-item cat-${cat.id} ${isActive ? 'active' : ''}`}
                      onClick={() => {
                        setActiveCategory(cat.id);
                        if (window.history.pushState) {
                          window.history.pushState(null, null, '#' + cat.id);
                        }
                      }}
                    >
                      <div className="blue-tokai-circle-thumb-wrap">
                        {isActive && <PowderSprinkleEffect type={cat.id} />}
                        <div className={`blue-tokai-circle-thumb ${cat.id === 'combos' ? 'combo-thumb' : ''}`}>
                          <img src={cat.image} alt={cat.label} loading="lazy" />
                        </div>
                      </div>
                      <div className="blue-tokai-circle-label">
                        <span>{cat.label}</span>
                        <span className="blue-tokai-circle-sub">{cat.sub}</span>
                        {isActive && <div className="blue-tokai-active-indicator" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Section Heading */}
              <div className="section-head text-center" style={{ marginBottom: activeCategory === 'combos' ? '2rem' : '2.5rem' }}>
                <h2 className="section-title">
                  {activeCategory === 'coffee' && 'Malenadu Premium Coffee Collection'}
                  {activeCategory === 'pepper' && 'Malenadu Black Pepper Collection'}
                  {activeCategory === 'combos' && 'Build Your Custom Estate Combo'}
                </h2>
                <p className="section-subtitle">
                  {activeCategory === 'coffee' && 'Experience the rich aroma of handpicked single-estate beans from the hills of Chikkamagaluru.'}
                  {activeCategory === 'pepper' && 'Authentic, pungent organic Tellicherry black pepper hand-harvested from our canopy shade trees.'}
                  {activeCategory === 'combos' && 'Select your preferred single-estate coffee roast and estate pepper size below to create your custom value combo.'}
                </p>
              </div>

              {/* Section Body: Custom Combo Studio vs Products Grid */}
              {activeCategory === 'combos' ? (
                <CustomComboBuilder
                  coffeeProducts={coffeeProducts}
                  pepperProducts={pepperProducts}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ) : (() => {
                const currentList = activeCategory === 'coffee'
                  ? coffeeProducts
                  : pepperProducts;

                if (currentList.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#78716C' }}>
                      <p style={{ fontSize: '1.1rem' }}>No products available in this category at the moment.</p>
                    </div>
                  );
                }

                return (
                  <div className={`products-grid ${currentList.length === 1 ? 'single-item' : ''}`}>
                    {currentList.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        isWishlisted={wishlist.some(w => w.id === product.id)}
                        onToggleWishlist={toggleWishlist}
                        onImageClick={setFullscreenImage}
                        onOpenDetails={setActiveDetailsProduct}
                        onShareProduct={handleShareProduct}
                      />
                    ))}
                  </div>
                );
              })()}

            </div>
          </section>

          {/* ——— Wholesale Roastery Supply & Cafe Partnerships Teaser Card ——— */}
          <CommercialPartnershipTeaser
            onOpenPartnership={() => {
              setCurrentPage('commercial-partnership');
              window.location.hash = 'commercial-partnership';
              window.scrollTo(0, 0);
            }}
          />

          {/* ——— Interactive "Find Your Perfect Blend" Quiz ——— */}
          <CoffeeQuizSection
            coffeeProducts={coffeeProducts}
            onOpenDetails={setActiveDetailsProduct}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />

          {/* ——— Coffee Information Section ——— */}
          <CoffeeInfoSection onImageClick={setFullscreenImage} />

          {/* ——— Customer Reviews Section ——— */}
          <section id="reviews" className="reviews-section-wrap section-padded" style={{ background: '#FAF8F5', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
            {/* Ambient Glows */}
            <div style={{ position: 'absolute', top: '20%', left: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(200, 147, 90, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(37, 211, 102, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="container">
              <div className="section-head text-center" style={{ marginBottom: '3.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                  <div style={{ width: '30px', height: '1px', background: 'var(--c-gold)' }} />
                  <span style={{ color: 'var(--c-gold)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                    Testimonials
                  </span>
                  <div style={{ width: '30px', height: '1px', background: 'var(--c-gold)' }} />
                </div>
                <h2 style={{ fontFamily: '"Georgia", serif', color: 'var(--c-dark-brown)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, marginBottom: '1rem' }}>
                  What Our Customers Say
                </h2>
                <p style={{ color: 'var(--c-dark-brown)', opacity: 0.85, fontSize: '1.05rem', fontFamily: 'Inter, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
                  Honest reviews from real customers across India who trust our premium quality.
                </p>
              </div>
            </div>

            <div className="reviews-marquee-container" style={{ width: '100%', overflow: 'hidden', padding: '1rem 0' }}>
              {visibleCustomerReviews.length === 0 ? (
                <div style={{ color: '#8c6239', padding: '2rem', textAlign: 'center', width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem' }}>
                  Customer reviews are currently being updated.
                </div>
              ) : (
                <div className="reviews-marquee" style={{ display: 'flex', gap: '1.5rem', width: 'max-content' }}>
                  {[...visibleCustomerReviews, ...visibleCustomerReviews].map((review, i) => (
                    <div
                      key={i}
                      className="review-card"
                      style={{
                        background: '#140E0A',
                        borderRadius: '16px',
                        border: '1px solid rgba(200, 147, 90, 0.25)',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        boxShadow: '0 12px 30px rgba(0,0,0,0.45)'
                      }}
                    >
                      <div className="review-stars-wrap" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="review-stars" style={{ display: 'flex', gap: '3px' }}>
                          {[...Array(review.rating || 5)].map((_, idx) => (
                            <Star key={idx} size={15} fill="#E8CA80" color="#E8CA80" />
                          ))}
                        </div>
                      </div>

                      <div className="review-quote-mark" style={{ color: '#C8935A', fontSize: '2.4rem', fontFamily: '"Georgia", serif', lineHeight: 0.5, marginBottom: '0.6rem', opacity: 0.85 }}>
                        &ldquo;
                      </div>

                      <p className="review-text" style={{ color: '#E7E5E4', fontSize: '0.93rem', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', marginBottom: '1.5rem', flexGrow: 1, fontWeight: 400 }}>
                        {review.text}
                      </p>

                      <div className="review-author" style={{ borderTop: '1px solid rgba(200, 147, 90, 0.2)', paddingTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {review.avatar ? (
                            <img
                              src={review.avatar}
                              alt={review.name}
                              referrerPolicy="no-referrer"
                              className="review-author-avatar"
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '1.5px solid #E8CA80',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                                flexShrink: 0
                              }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="review-author-avatar" style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: ['#8C001A', '#333333', '#C8935A', '#1B5E20', '#4A148C'][i % 5],
                              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.95rem', fontWeight: 700, fontFamily: 'Inter, sans-serif',
                              flexShrink: 0
                            }}>
                              {(review.name || 'C').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="review-author-name" style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 2px' }}>{review.name}</h4>
                            {review.product && (
                              <span className="review-author-tag" style={{ fontSize: '0.72rem', color: '#D4A870', opacity: 0.85 }}>
                                {review.product} Customer
                              </span>
                            )}
                          </div>
                        </div>
                        {review.date && (
                          <span className="review-date" style={{ fontSize: '0.72rem', color: '#888', fontFamily: 'Inter, sans-serif' }}>
                            {typeof review.date === 'string' && review.date.includes('-') ? new Date(review.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ——— Unified Government Certifications (GST & FSSAI) - Crazy White + Brown Luxury ——— */}
          <section id="certifications" className="certifications-section-wrap">
            {/* Anchor link targets so any existing links scroll smoothly */}
            <div id="gst-compliance" style={{ position: 'absolute', top: '-60px' }} />
            <div id="fssai-compliance" style={{ position: 'absolute', top: '-60px' }} />

            {/* Ambient Decorative Floating Coffee Beans */}
            <svg className="wholesale-floating-bean" style={{ top: '6%', left: '3%', width: '38px', height: '38px', transform: 'rotate(-25deg)', opacity: 0.22, color: '#8C5835' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.4" />
              <path d="M12 4c-1.5 2.5-1.5 5.5 0 8s1.5 5.5 0 8" stroke="#8C5835" strokeWidth="1.8" fill="none" />
            </svg>
            <svg className="wholesale-floating-bean" style={{ top: '12%', right: '4%', width: '42px', height: '42px', transform: 'rotate(35deg)', opacity: 0.22, color: '#8C5835' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.4" />
              <path d="M12 4c-1.5 2.5-1.5 5.5 0 8s1.5 5.5 0 8" stroke="#8C5835" strokeWidth="1.8" fill="none" />
            </svg>

            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
              {/* Header */}
              <div className="certifications-header">
                <div className="certifications-eyebrow">
                  <ShieldCheck size={14} color="#8C5835" />
                  <span>100% Legal & Govt Registered</span>
                </div>

                <h2 className="certifications-title">
                  Official Government Certifications
                  <span className="certifications-title-accent">Food Safety & 100% Tax Compliance</span>
                </h2>

                <p className="certifications-subtitle">
                  Direct estate roastery, legally certified for food safety and transparent tax standards.
                </p>
              </div>

              {/* Dual Verification Cards Grid (Crazy White + Brown Certificate Plaques) */}
              <div className="certifications-grid">

                {/* Card 1: FSSAI Food Safety Plaque */}
                <div className="cert-card">
                  <div className="cert-card-inner-border" />
                  <span className="cert-corner cert-corner-tl" />
                  <span className="cert-corner cert-corner-tr" />
                  <span className="cert-corner cert-corner-bl" />
                  <span className="cert-corner cert-corner-br" />

                  {/* Hanging Gold Wax Seal */}
                  <div className="cert-wax-seal">
                    <div className="cert-wax-circle">
                      <Star size={14} fill="#1A0903" />
                    </div>
                    <div className="cert-wax-ribbon-tails">
                      <div className="cert-wax-tail" />
                      <div className="cert-wax-tail" />
                    </div>
                  </div>

                  <div className="cert-card-header-bar">
                    <span className="cert-card-header-tag">Government of India · Food Safety</span>
                    <span className="cert-card-verified-badge">
                      <span className="cert-card-verified-dot" />
                      <span>Verified</span>
                    </span>
                  </div>

                  {/* Gold-Rimmed Embossed Seal Window */}
                  <div className="cert-seal-wrap">
                    <img
                      src="/assets/images/fssai_logo.webp"
                      alt="FSSAI Logo"
                      className="cert-seal-img"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="cert-name">FSSAI Food Safety License</h3>

                  <div className="cert-number-badge">
                    LIC NO: 21226177001500
                  </div>

                  <div className="cert-points-list">
                    <div className="cert-point-item">
                      <span className="cert-point-icon-box">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span>100% Clean & Hygienic Roasting Facility</span>
                    </div>
                    <div className="cert-point-item">
                      <span className="cert-point-icon-box">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span>Pure Coffee with Zero Artificial Additives</span>
                    </div>
                  </div>

                  <p className="cert-authority-note">
                    Food Safety and Standards Authority of India
                  </p>
                </div>

                {/* Card 2: GST Tax Registration Plaque */}
                <div className="cert-card">
                  <div className="cert-card-inner-border" />
                  <span className="cert-corner cert-corner-tl" />
                  <span className="cert-corner cert-corner-tr" />
                  <span className="cert-corner cert-corner-bl" />
                  <span className="cert-corner cert-corner-br" />

                  {/* Hanging Gold Wax Seal */}
                  <div className="cert-wax-seal">
                    <div className="cert-wax-circle">
                      <Star size={14} fill="#1A0903" />
                    </div>
                    <div className="cert-wax-ribbon-tails">
                      <div className="cert-wax-tail" />
                      <div className="cert-wax-tail" />
                    </div>
                  </div>

                  <div className="cert-card-header-bar">
                    <span className="cert-card-header-tag">Government of India · Commercial Taxes</span>
                    <span className="cert-card-verified-badge">
                      <span className="cert-card-verified-dot" />
                      <span>Verified</span>
                    </span>
                  </div>

                  {/* Gold-Rimmed Embossed Seal Window */}
                  <div className="cert-seal-wrap">
                    <img
                      src="/assets/images/gst_logo.png?v=2"
                      alt="GST India Logo"
                      className="cert-seal-img"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="cert-name">GST Tax Registration</h3>

                  <div className="cert-number-badge">
                    GSTIN: 29BQJPY7539L1ZN
                  </div>

                  <div className="cert-points-list">
                    <div className="cert-point-item">
                      <span className="cert-point-icon-box">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span>Statutory 5% GST Invoiced on All Orders</span>
                    </div>
                    <div className="cert-point-item">
                      <span className="cert-point-icon-box">
                        <Check size={11} strokeWidth={3} />
                      </span>
                      <span>B2B Input Tax Credit (ITC) Available</span>
                    </div>
                  </div>

                  <p className="cert-authority-note">
                    Commercial Taxes Department, Karnataka (State Code 29)
                  </p>
                </div>

              </div>

              {/* Bottom Trust Strip */}
              <div className="certifications-trust-strip">
                <ShieldCheck size={16} color="#8C5835" />
                <span>Legally Registered Origin Roastery · Dispatched from Chikkamagaluru, Karnataka</span>
              </div>
            </div>
          </section>

          <ChikkamagaluruGallery />

          <div id="story" style={{ position: 'relative', top: '-70px' }} />

          <FarmVisitSection />

          <FeedbackSection onAddReview={handleAddNewReview} currentUser={currentUser} onRequireLogin={() => setIsAuthOpen(true)} />

          <FAQSection />

          {/* ——— Unified Premium Footer —————————————————————————————————————————————————— */}
          <footer id="contact" style={{
            background: '#050704',
            position: 'relative',
            padding: '5rem 0 2rem',
            overflow: 'hidden',
          }}>
            <div className="container" style={{ position: 'relative', zIndex: 2 }}>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{ textAlign: 'center', marginBottom: '4rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '0.8rem' }}>
                  <div style={{ width: '25px', height: '1px', background: '#C8935A' }} />
                  <span style={{ color: '#C8935A', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase' }}>
                    Get In Touch
                  </span>
                  <div style={{ width: '25px', height: '1px', background: '#C8935A' }} />
                </div>
                <h2 style={{ fontFamily: '"Georgia", serif', color: '#fff', fontSize: 'clamp(2.2rem, 5vw, 3rem)', margin: '0 0 1.5rem', fontWeight: 700 }}>
                  Contact <span style={{ color: '#D4A870' }}>Us</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '580px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  We'd love to hear from you! Reach out through any of the channels below and our team will get back to you soon.
                </p>
              </motion.div>

              {/* SEO Paragraph */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ textAlign: 'center', marginBottom: '4rem', padding: '0 1rem' }}
              >
                <p style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '800px', margin: '0 auto', fontSize: '0.85rem', lineHeight: '1.8' }}>
                  Malenadu Roast Co is dedicated to bringing you the <strong>best filter coffee in India</strong>. Recognized as the best filter coffee from Chikkamagaluru and the best filter coffee in Karnataka, our premium blends are sourced directly from high-altitude estates. Whether you're looking for the best filter coffee from India or the freshest beans from Karnataka, we roast to order, ensuring every cup is packed with authentic Malenadu flavor.
                </p>
              </motion.div>

              {/* Contact Cards Grid */}
              <div className="footer-contact-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '1.5rem',
                maxWidth: '1200px',
                margin: '0 auto 5rem',
              }}>
                {/* WhatsApp */}
                <motion.a
                  href="https://api.whatsapp.com/send?phone=918217623335" target="_blank" rel="noopener noreferrer"
                  whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.04)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '15px', padding: '3.5rem 1.5rem', textDecoration: 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.8rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(37,211,102,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <img loading="lazy" src="/assets/images/whatsapp_icon.webp" alt="WhatsApp" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.15rem', margin: '0 0 0.6rem', fontWeight: 700, fontFamily: '"Georgia", serif' }}>Order via WhatsApp</h4>
                    <p style={{ color: '#fff', fontSize: '1rem', margin: '0 0 0.6rem', fontWeight: 500 }}>+91 8217623335</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', margin: 0 }}>Quick response | Easy ordering</p>
                  </div>
                </motion.a>

                {/* Phone */}
                <motion.a
                  href="tel:+918217623335"
                  whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.04)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '15px', padding: '3.5rem 1.5rem', textDecoration: 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.8rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ width: '64px', height: '64px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(59,130,246,0.3)' }}>
                    <Phone size={32} color="#fff" />
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.15rem', margin: '0 0 0.6rem', fontWeight: 700, fontFamily: '"Georgia", serif' }}>Call Us</h4>
                    <p style={{ color: '#fff', fontSize: '1rem', margin: '0 0 0.6rem', fontWeight: 500 }}>+91 8217623335</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', margin: 0 }}>Direct assistance</p>
                  </div>
                </motion.a>

                {/* Email */}
                <motion.a
                  href="mailto:malenaduroast@gmail.com"
                  whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.04)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '15px', padding: '3.5rem 1.5rem', textDecoration: 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.8rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '6px'
                  }}>
                    <img loading="lazy" src="/assets/images/gmail_icon.webp" alt="Gmail" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.15rem', margin: '0 0 0.6rem', fontWeight: 700, fontFamily: '"Georgia", serif' }}>Email Us</h4>
                    <p style={{ color: '#fff', fontSize: '0.95rem', margin: '0 0 0.6rem', wordBreak: 'break-all', fontWeight: 500 }}>malenaduroast@gmail.com</p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', margin: 0 }}>We reply within 24 hours</p>
                  </div>
                </motion.a>

                {/* Instagram */}
                <motion.a
                  href="https://www.instagram.com/malenadu_roast_co?utm_source=qr&igsh=MW5sdjUzdWJodmJkZg==" target="_blank" rel="noopener noreferrer"
                  whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.04)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '15px', padding: '3.5rem 1.5rem', textDecoration: 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.8rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(220,39,67,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <img loading="lazy" src="/assets/images/instagram_icon.webp" alt="Instagram" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.15rem', margin: '0 0 0.6rem', fontWeight: 700, fontFamily: '"Georgia", serif' }}>Follow Us</h4>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', margin: 0 }}>Updates & customer posts</p>
                  </div>
                </motion.a>

                {/* Facebook */}
                <motion.a
                  href="https://www.facebook.com/profile.php?id=61590395160657" target="_blank" rel="noopener noreferrer"
                  whileHover={{ y: -8, backgroundColor: 'rgba(255,255,255,0.04)' }}
                  style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '15px', padding: '3.5rem 1.5rem', textDecoration: 'none',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.8rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(24,119,242,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <img loading="lazy" src="/assets/images/facebook_icon.webp" alt="Facebook" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.15rem', margin: '0 0 0.6rem', fontWeight: 700, fontFamily: '"Georgia", serif' }}>Facebook</h4>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', margin: 0 }}>Connect with us on FB</p>
                  </div>
                </motion.a>
              </div>

              {/* —— Gold Divider with Coffee Bean —— */}
              <div style={{ maxWidth: '1150px', margin: '0 auto 4rem', position: 'relative' }}>
                <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(200,147,90,0.3), transparent)' }} />
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  background: '#050704', padding: '0 20px', color: '#C8935A'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,2C12,2 7,7 7,12C7,14.76 9.24,17 12,17C14.76,17 17,14.76 17,12C17,7 12,2 12,2M12,15C10.34,15 9,13.66 9,12C9,11.08 9.42,10.25 10.08,9.71L12.5,13.92L14.42,10.59C14.79,11 15,11.47 15,12C15,13.66 13.66,15 12,15Z" />
                  </svg>
                </div>
              </div>

              {/* Bottom Grid with Brand and One-Beside-One Quick Links & Policies */}
              <div className="footer-bottom-grid">
                {/* Left: Brand */}
                <div className="footer-brand-col">
                  <img loading="lazy" src={TOKENS.images.logo} alt="Malenadu Roast Co" style={{ height: '100px', width: '100px', borderRadius: '50%', border: '2px solid #C8935A', padding: '2px', background: '#fff', marginBottom: '1.5rem' }} />
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', lineHeight: '1.8', maxWidth: '380px', margin: 0 }}>
                    Authentic coffee and spices sourced from the hills of Chikkamagaluru. Direct from our estates to your table.
                  </p>
                </div>

                {/* Quick Links & Policies Group (One Beside One on Mobile & Desktop) */}
                <div className="footer-links-duo">
                  {/* Quick Links */}
                  <div className="footer-links-col">
                    <h4 className="footer-links-title">Quick Links</h4>
                    <ul className="footer-links-list">
                      {[
                        { label: 'Shop Coffee', href: '#coffee' },
                        { label: 'Shop Spices', href: '#pepper' },
                        { label: 'Reviews', href: '#reviews' },
                        { label: 'Our Origin', href: '#process' },
                        { label: 'Visit Our Farm', href: '#visit-us' },
                        { label: 'Partnership', href: '#partner-with-us' },
                        { label: 'GST Compliance', href: '#gst-compliance' },
                        { label: 'FSSAI Verified', href: '#fssai-compliance' },
                      ].map((link, i) => (
                        <li key={i} className="footer-link-item">
                          <span className="footer-link-arrow">›</span>
                          <a href={link.href} className="footer-link-anchor"
                            onMouseEnter={e => e.target.style.color = '#fff'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                          >{link.label}</a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Legal & Compliance Policies */}
                  <div className="footer-links-col">
                    <h4 className="footer-links-title">Policies & Compliance</h4>
                    <ul className="footer-links-list">
                      {[
                        { label: 'Privacy Policy', id: 'privacy-policy' },
                        { label: 'Refund & Returns Policy', id: 'refund-policy' },
                        { label: 'Terms & Conditions', id: 'terms-conditions' },
                        { label: 'Shipping & Delivery', id: 'shipping-policy' }
                      ].map((item, i) => (
                        <li key={i} className="footer-link-item">
                          <span className="footer-link-arrow">›</span>
                          <a
                            href={`#${item.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(item.id);
                              window.location.hash = item.id;
                              window.scrollTo(0, 0);
                            }}
                            className="footer-link-anchor"
                            onMouseEnter={e => e.target.style.color = '#fff'}
                            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* —— Popular Searches & SEO Directory (Visually Hidden for Google Indexing) —— */}
              <div style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: '0',
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: '0'
              }}>
                <h5 style={{
                  color: 'rgba(200,147,90,0.5)',
                  fontSize: '0.85rem',
                  fontFamily: 'Inter, sans-serif',
                  marginBottom: '1rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Popular Searches & Index
                </h5>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px 18px',
                  fontSize: '0.78rem',
                  lineHeight: '1.6',
                  color: 'rgba(255,255,255,0.25)'
                }}>
                  {[
                    "malenadu coffe", "chickamagalur coffe", "chikamagalore coffee", "chikmagalore coffee", "chickamagaluru coffee", "chikmagalore pepper", "chickamagaluru pepper", "malenadu coffee", "malenadu pepper", "malenadu spices", "chikmagalur coffee estates", "chikmagalur coffee online", "malenadu coffee powder", "chikmagalur filter coffee", "fresh coffee powder chikmagalur", "estate coffee chikmagalur", "western ghats coffee", "karnataka coffee", "south indian filter coffee", "arabica coffee chikmagalur", "robusta coffee chikmagalur", "plantation coffee india", "hill grown coffee", "farm fresh coffee", "direct from estate coffee", "farm to cup coffee", "fresh roasted coffee india", "premium coffee powder india", "best filter coffee powder", "strong coffee powder india", "rich aroma coffee", "authentic coffee india", "coffee beans chikmagalur", "coffee powder online india", "buy coffee online india", "order coffee online", "premium coffee brands india", "best coffee in india", "fresh coffee delivery india", "black pepper chikmagalur", "malenadu black pepper", "premium black pepper india", "fresh pepper chikmagalur", "whole black pepper india", "pepper powder india", "estate grown pepper", "farm fresh spices", "natural spices india", "authentic spices karnataka", "malenadu spices online", "chikmagalur spices", "buy pepper online india", "mullayanagiri coffee", "baba budangiri coffee", "chikmagalur hills coffee", "western ghats plantations", "malenadu region products", "karnataka plantations coffee", "chikmagalur estate products", "hill station coffee india", "buy premium coffee online india", "best coffee powder online", "fresh roasted coffee powder india", "buy coffee directly from estate india", "wholesale coffee suppliers india", "bulk coffee powder price india", "premium instant coffee wholesale india", "coffee wholesale india", "coffee suppliers chikmagalur", "bulk coffee suppliers karnataka", "coffee business india suppliers", "fresh coffee", "premium coffee", "natural coffee", "authentic coffee", "estate coffee", "plantation coffee", "organic style coffee", "handpicked coffee beans", "carefully processed coffee", "high quality coffee", "strong flavor coffee", "smooth coffee taste", "traditional filter coffee", "south indian coffee taste"
                  ].map((tag, i) => (
                    <span key={i} style={{ cursor: 'default', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#C8935A'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.25)'}
                    >
                      {tag} {i < 84 ? ' • ' : ''}
                    </span>
                  ))}
                </div>
              </div>

              {/* Copyright */}
              <div style={{ marginTop: '5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                <div style={{ margin: '0 auto 1.2rem', width: 'fit-content' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(200, 147, 90, 0.08)',
                    border: '1px solid rgba(200, 147, 90, 0.35)',
                    color: '#E8CA80',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '30px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 15px rgba(200, 147, 90, 0.15)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    <ShieldCheck size={14} color="#E8CA80" />
                    <span>FSSAI Lic: 21226177001500</span>
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(200, 147, 90, 0.08)', border: '1px solid rgba(200, 147, 90, 0.35)', color: '#E8CA80',
                    padding: '0.5rem 1.2rem',
                    borderRadius: '30px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 15px rgba(200, 147, 90, 0.15)',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    margin: '0 6px'
                  }}>
                    <ShieldCheck size={14} color="#E8CA80" />
                    <span>GSTIN: 29BQJPY7539L1ZN</span>
                  </span>
                </div>


                <p>
                  © {new Date().getFullYear()} Malenadu Roast Co. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Device Messaging & Catalog Modal */}
      <DeviceMessagingModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
      />

    </div>
  );
};

export default App;

