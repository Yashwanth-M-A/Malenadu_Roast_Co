import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ShoppingCart, User, Search, Menu, X, Star, ShieldCheck, 
  Leaf, Truck, CreditCard, Phone, Mail, Heart, Plus, Minus, Trash2, PlayCircle, Download,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CheckCircle, AlertCircle, Loader, Lock, Smartphone, MessageCircle, ExternalLink, Package, ArrowRight, ShoppingBag, MapPin, Sun, Flame, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import {
  registerUser, loginUser, updateProfile,
  getMyOrders, placeCODOrder, simulatePayment
} from './api.js';

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
    } else if (query.includes('bulk') || query.includes('order') || query.includes('wholesale') || query.includes('pricing') || query.includes('distributor') || query.includes('dealer') || query.includes('business')) {
      targetSection = 'bulk-orders';
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

    if (currentPage === 'order' && setCurrentPage) {
      setCurrentPage('home');
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
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <a href="#home" className="logo-link">
          <img src={TOKENS.images.logo} alt="Malenadu Roast Co" className="brand-logo" />
        </a>
        
        {currentPage !== 'order' && (
          <nav className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
            <a href="#coffee" onClick={() => setMobileMenuOpen(false)}>Coffee</a>
            <a href="#pepper" onClick={() => setMobileMenuOpen(false)}>Pepper</a>
            <a href="#process" onClick={() => setMobileMenuOpen(false)}>Our Origins</a>
            <a href="#story" onClick={() => setMobileMenuOpen(false)}>Story</a>
            <a href="#bulk-orders" onClick={() => setMobileMenuOpen(false)}>Bulk Orders</a>
          </nav>
        )}

        <div className="nav-actions">
          {currentPage !== 'order' && (
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
              <motion.a
                href="https://drive.google.com/uc?export=download&id=1J8q0Cp6cH0HP3PF-IN1_JgBUyWJ1vlAa"
                download="Malenadu_Roast_Co_Brochure.pdf"
                className="nav-brochure-link"
                whileHover={{ scale: 1.05, boxShadow: '0 5px 15px rgba(200,169,106,0.4)' }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #C8A96A, #E8CA80)',
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
                <span className="hide-mobile">Brochure</span>
              </motion.a>

              

              <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
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
                        border: '1px solid #eee'
                      }}
                    >
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." style={{ padding: '0.5rem 0.8rem', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', color: '#333', fontSize: '0.9rem', width: '200px' }} autoFocus />
                      <button type="submit" style={{ background: 'var(--c-gold)', color: 'var(--c-dark-brown)', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>Go</button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
          {currentPage !== 'order' && (
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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

    beanImg.onload = () => {
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
        return data[i4] > 160 && data[i4+1] > 150 && data[i4+2] > 140;
      };

      // Seed from entire border perimeter (not just 4 corners)
      const queue = [];
      for (let x = 0; x < W; x++) {
        [[x,0],[x,H-1]].forEach(([px,py]) => {
          const p = py * W + px;
          if (!visited[p] && isBackground(p * 4)) { visited[p] = 1; queue.push(p); }
        });
      }
      for (let y = 1; y < H-1; y++) {
        [[0,y],[W-1,y]].forEach(([px,py]) => {
          const p = py * W + px;
          if (!visited[p] && isBackground(p * 4)) { visited[p] = 1; queue.push(p); }
        });
      }

      // BFS flood fill â€” make background pixels fully transparent
      while (queue.length > 0) {
        const pos = queue.pop();
        const i4 = pos * 4;
        data[i4 + 3] = 0; // fully transparent
        const x = pos % W;
        const neighbors = [
          x > 0 ? pos - 1 : -1,
          x < W-1 ? pos + 1 : -1,
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

      // â”€â”€ Fringe erosion pass â”€â”€
      // Any pixel adjacent to a transparent pixel that's still light â†’ fade it out
      const result = new Uint8ClampedArray(data);
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          const pos = y * W + x;
          const i4 = pos * 4;
          if (data[i4 + 3] === 0) continue; // already transparent
          // Check if any neighbor is transparent (background)
          const hasTransparentNeighbor =
            data[((y-1)*W+x)*4+3] === 0 ||
            data[((y+1)*W+x)*4+3] === 0 ||
            data[(y*W+x-1)*4+3] === 0 ||
            data[(y*W+x+1)*4+3] === 0;
          if (hasTransparentNeighbor) {
            const brightness = (data[i4] + data[i4+1] + data[i4+2]) / 3;
            if (brightness > 130) {
              // Fade based on how bright/white this edge pixel is
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

    const beans = Array.from({ length: 32 }, () => {
      const size = 22 + Math.random() * 33; // smaller â€” more realistic scale
      return {
        x: Math.random() * window.innerWidth,
        y: -100 - Math.random() * window.innerHeight,
        w: size,
        h: size * 0.75,
        speedY: 0.7 + Math.random() * 1.3,
        speedX: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.022,
        wobble: Math.random() * Math.PI * 2,
        wobbleAmp: 0.2 + Math.random() * 0.5,
        wobbleSpeed: 0.01 + Math.random() * 0.016,
        opacity: 0.65 + Math.random() * 0.35,
      };
    });

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (processedBitmap) {
        [...beans]
          .sort((a, b) => a.w - b.w)
          .forEach((b) => {
            b.wobble += b.wobbleSpeed;
            b.y += b.speedY;
            b.x += b.speedX + Math.sin(b.wobble) * b.wobbleAmp;
            b.rotation += b.rotSpeed;

            if (b.y > canvas.height + 80) {
              b.y = -80;
              b.x = Math.random() * canvas.width;
            }

            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(b.rotation);
            ctx.globalAlpha = b.opacity;

            // Natural drop shadow
            ctx.shadowColor = 'rgba(0,0,0,0.55)';
            ctx.shadowBlur = b.w * 0.25;
            ctx.shadowOffsetX = b.w * 0.06;
            ctx.shadowOffsetY = b.w * 0.05;

            ctx.drawImage(processedBitmap, -b.w / 2, -b.h / 2, b.w, b.h);
            ctx.restore();
          });
      }

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(raf);
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

            {/* Trust strip — premium highlighted badges */}
            <motion.div
              className="hero-trust-strip"
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.15 } } }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginTop: '3rem',
                background: 'linear-gradient(135deg, rgba(12,10,8,0.75), rgba(22,18,12,0.65))',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(232,202,128,0.35)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(200,147,90,0.18), inset 0 1px 0 rgba(232,202,128,0.15), 0 0 0 1px rgba(200,147,90,0.08)',
                position: 'relative',
              }}
            >
              {/* Subtle shimmer overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(105deg, transparent 40%, rgba(232,202,128,0.06) 50%, transparent 60%)',
                animation: 'trustShimmer 4s ease-in-out infinite',
              }} />
              {[
                { icon: <Truck size={18} color="#E8CA80" />, text: 'All Over India Delivery' },
                { icon: <Leaf size={18} color="#E8CA80" />, text: 'Direct from estates' },
                { icon: <ShieldCheck size={18} color="#E8CA80" />, text: 'FSSAI Certified' },
              ].map((item, i, arr) => (
                <React.Fragment key={i}>
                  <span
                    className="hero-trust-item"
                    style={{
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      letterSpacing: '0.6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '0.9rem 1.4rem',
                      whiteSpace: 'nowrap',
                      position: 'relative',
                      zIndex: 1,
                      textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  >
                    <span style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(232,202,128,0.12)',
                      border: '1px solid rgba(232,202,128,0.25)',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </span>
                    {item.text}
                  </span>
                  {i < arr.length - 1 && (
                    <span
                      className="hero-trust-divider"
                      style={{
                        width: '1px',
                        height: '28px',
                        background: 'linear-gradient(to bottom, transparent, rgba(232,202,128,0.4), transparent)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </motion.div>

          </motion.div>
        </div>
      </div>

      {/* Falling beans overlay */}
      <DroppingBeans />
    </section>
  );
};

const ProductCard = ({ product, onBuyNow, hideBuyNow, onAddToCart, onImageClick }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants ? product.variants[0] : null
  );
  const [showDetails, setShowDetails] = useState(false);

  const handleNext = () => {
    if (!product.images) return;
    setImgIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handlePrev = () => {
    if (!product.images) return;
    setImgIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  useEffect(() => {
    setSelectedVariant(product.variants ? product.variants[0] : null);
    setImgIndex(0);
    setShowDetails(false);
  }, [product]);

  useEffect(() => {
    setImgIndex(0);
  }, [selectedVariant]);

  const currentImages = selectedVariant
    ? (selectedVariant.backImage ? [selectedVariant.image, selectedVariant.backImage] : [selectedVariant.image])
    : (product.images || [product.image].filter(Boolean));

  const showSlider = currentImages.length > 1;

  const currentImage = currentImages[imgIndex] || currentImages[0];

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentWeight = selectedVariant ? selectedVariant.weight : product.weight;
  const anchorPrice = Math.round(Number(currentPrice) * 1.30);

  const handleDirectAddToCart = (e) => {
    if (e) e.stopPropagation();
    const finalProduct = {
      ...product,
      price: currentPrice,
      weight: currentWeight,
      image: selectedVariant && selectedVariant.image ? selectedVariant.image : product.image
    };
    if (onAddToCart) onAddToCart(finalProduct);
  };

  const handleDirectBuyNow = (e) => {
    if (e) e.stopPropagation();
    const finalProduct = {
      ...product,
      price: currentPrice,
      weight: currentWeight,
      image: selectedVariant && selectedVariant.image ? selectedVariant.image : product.image
    };
    if (onBuyNow) onBuyNow(finalProduct);
  };

  return (
    <Tilt tiltEnable={typeof window !== 'undefined' && window.innerWidth > 768} tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1.02} transitionSpeed={2000} className="h-100" style={{ height: '100%' }}>
      <motion.div 
        className="product-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
      >
        <div className="product-image-wrap">
          {product.badge && <span className="badge">{product.badge}</span>}

          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {showSlider && (
              <button className="img-nav-btn left" onClick={(e) => { e.stopPropagation(); handlePrev(); }}><ChevronLeft size={20}/></button>
            )}
            
            <AnimatePresence mode="popLayout">
              <motion.img 
                key={imgIndex}
                src={currentImage} 
                alt={product.name} 
                className="product-image"
                loading="lazy"
                onClick={(e) => { e.stopPropagation(); if (onImageClick) onImageClick({ images: currentImages, index: imgIndex }); }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  position: 'absolute',
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  cursor: onImageClick ? 'zoom-in' : 'default'
                }}
              />
            </AnimatePresence>

            {showSlider && (
              <button className="img-nav-btn right" onClick={(e) => { e.stopPropagation(); handleNext(); }}><ChevronRight size={20}/></button>
            )}
          </div>
          
           {showSlider && (
             <div className="img-dots">
               {currentImages.map((_, idx) => (
                 <span key={idx} className={`img-dot ${idx === imgIndex ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setImgIndex(idx); }}></span>
               ))}
             </div>
          )}
        </div>
        <div className="product-info" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
          <div>
            <h4 className="product-name">{product.name}</h4>
            <p className="product-desc" style={{ flex: 'none', marginBottom: '0.5rem' }}>{product.description}</p>

            {product.details && (
              <div style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 0',
                    color: '#C8935A',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#b3844f'}
                  onMouseLeave={(e) => e.target.style.color = '#C8935A'}
                >
                  <span>{showDetails ? 'Hide Details' : 'View Details'}</span>
                  <motion.span
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ display: 'inline-flex', alignItems: 'center' }}
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                </button>
                
                <AnimatePresence initial={false}>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p style={{
                        fontSize: '0.82rem',
                        color: '#4e3621',
                        lineHeight: '1.65',
                        background: '#fcfaf7',
                        borderLeft: '3px solid #C8935A',
                        padding: '10px 12px',
                        borderRadius: '0 4px 4px 0',
                        margin: 0,
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        {product.details}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {product.variants && (
              <div className="variant-dropdown-wrap" style={{ marginTop: '1rem', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: '#8c6239', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '6px', fontWeight: 700, fontFamily: 'Inter, sans-serif' }}>
                  Select Size
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <select 
                    value={currentWeight} 
                    onChange={(e) => {
                      const selected = product.variants.find(v => v.weight === e.target.value);
                      setSelectedVariant(selected);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: '100%',
                      padding: '0.55rem 2rem 0.55rem 0.8rem',
                      background: '#fff',
                      color: '#2e1f15',
                      border: '1.5px solid #C8935A',
                      borderRadius: '4px',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer',
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.25s ease',
                      boxShadow: '0 2px 8px rgba(200, 147, 90, 0.08)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = '#b3844f';
                      e.target.style.boxShadow = '0 4px 12px rgba(200, 147, 90, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = '#C8935A';
                      e.target.style.boxShadow = '0 2px 8px rgba(200, 147, 90, 0.08)';
                    }}
                  >
                    {product.variants.map((v) => (
                      <option 
                        key={v.weight} 
                        value={v.weight}
                        style={{ background: '#fff', color: '#2e1f15' }}
                      >
                        {v.weight} — ₹{v.price}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', color: '#C8935A', pointerEvents: 'none' }} />
                </div>
              </div>
            )}
          </div>

          <div className="product-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: '#999', textDecoration: 'line-through', fontFamily: 'Inter, sans-serif' }}>
                  ₹{anchorPrice}
                </span>
                <span style={{ color: '#00a368', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Inter, sans-serif', padding: '2px 6px', background: 'rgba(0,163,104,0.1)', borderRadius: '4px' }}>
                  30% OFF
                </span>
              </div>
              <span className="price" style={{ margin: 0, color: '#8c6239', fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 800, fontSize: '1.4rem', display: 'inline-flex', alignItems: 'baseline' }}>
                ₹{currentPrice}
                <span style={{ fontSize: '0.8rem', color: '#b3844f', fontWeight: '600', marginLeft: '6px', fontFamily: 'Inter, sans-serif', textTransform: 'lowercase' }}>
                  / {currentWeight}
                </span>
              </span>
            </div>
          </div>

          </div>
      </motion.div>
    </Tilt>
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

  // Autoplay Coffee timer (3 seconds)
  useEffect(() => {
    if (isPaused || activeItem !== null) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxCoffeeIndex ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [maxCoffeeIndex, isPaused, activeItem]);

  // Autoplay Pepper timer (3 seconds)
  useEffect(() => {
    if (isPepperPaused || activeItem !== null) return;
    const interval = setInterval(() => {
      setCurrentPepperIndex((prev) => (prev >= maxPepperIndex ? 0 : prev + 1));
    }, 3000);
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
    { q: "Where do you source your coffee and pepper?", a: "Our coffee and pepper are directly sourced from our own estates in Chikkamagaluru (Malenadu), ensuring freshness, authenticity, and premium quality without any middlemen." },
    { q: "How fresh is your coffee?", a: "We roast our coffee in small batches to maintain freshness. This ensures rich aroma, strong flavor, and a better brewing experience in every cup." },
    { q: "How can I place an order?", a: "Simply click on “order through whatsapp” and connect with us via WhatsApp. We’ll guide you through the process and confirm your order quickly." },
    { q: "How long does delivery take?", a: "We deliver across India, with most orders reaching you within 2–5 days, depending on your location." },
    { q: "Do you offer bulk or combo deals?", a: "Yes, we offer combo packs and special discounts on bulk orders. You can place bulk orders by contacting us on WhatsApp or by filling out the form available in our bulk orders section." }
  ];

  return (
    <section id="faq" className="section bg-cream section-padded">
      <div className="container">
        <div className="section-head text-center" style={{marginBottom: '3rem'}}>
          <h2 className="section-title">Customer Care & FAQs</h2>
          <p className="section-subtitle">Everything you need to know about our products and services.</p>
        </div>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          {faqs.map((faq, i) => (
            <div key={i} style={{marginBottom: '1rem', border: '1px solid #e0d5c1', borderRadius: '8px', background: '#fff', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'}}>
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{width: '100%', padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--c-dark-brown)', transition: 'background 0.3s'}}
                onMouseEnter={e => e.currentTarget.style.background = '#fcfaf7'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {faq.q}
                <span style={{color: 'var(--c-gold)'}}>{openIndex === i ? <Minus size={20}/> : <Plus size={20}/>}</span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}} exit={{height: 0, opacity: 0}} style={{overflow: 'hidden'}}>
                    <div style={{padding: '0 1.5rem 1.5rem', color: '#666', lineHeight: '1.6'}}>
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

const FeedbackSection = () => {
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({ 
    name: '',
    email: '',
    rating: 0,
    product: '', 
    liked: '', 
    feedback: '', 
    buyAgain: '' 
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      subject: `New Feedback from ${formData.email}`,
      rating: formData.rating,
      product: formData.product,
      liked: formData.liked,
      feedback: formData.feedback,
      buyagain: formData.buyAgain
    };

    console.log('Sending exact parameters:', templateParams);

    try {
      // 1. Send feedback email to business owner
      const p1 = window.emailjs.send(
        'service_8ie5o4q',
        'template_kp7cfjf',
        templateParams,
        'XAjBukluotgykpLye'
      );

      // 2. Send automatic thank-you email to customer
      const p2 = window.emailjs.send(
        'service_8ie5o4q',
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
        <div className="section-head text-center" style={{marginBottom: '3rem'}}>
          <h2 className="section-title text-white">Share Your Experience</h2>
          <p className="section-subtitle" style={{color: 'rgba(255,255,255,0.7)'}}>Help us improve our Malenadu experience.</p>
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
                <h3 style={{ color: 'var(--c-dark-brown)', marginBottom: '0.5rem', fontFamily: '"Georgia", serif', fontSize: '1.8rem' }}>Feedback Received</h3>
                <p style={{ color: '#666', lineHeight: 1.6, fontSize: '1.1rem' }}>Thank you for helping us grow!</p>
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
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="example@gmail.com"
                    style={inputStyle}
                  />
                </div>

                {/* 3. Your Rating */}
                <div>
                  <label style={labelStyle}>3. Your Rating ⭐</label>
                  <p style={{fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem'}}>(1–5 stars)</p>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        size={34} 
                        onClick={() => setFormData({...formData, rating: star})}
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
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, liked: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, feedback: e.target.value})}
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
                        onClick={() => setFormData({...formData, buyAgain: option})}
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
          <motion.div className="cart-backdrop" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose} />
          <motion.div className="cart-sidebar" initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} transition={{type: 'tween', duration: 0.3}}>
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
                      <h4 style={{fontSize: '0.9rem', marginBottom: '0.3rem'}}>{item.name}</h4>
                      <p className="cart-item-price">₹{item.price}</p>
                      <button onClick={() => { onAddToCart(item); onRemove(item); }} className="add-btn" style={{padding: '0.3rem 0.5rem', marginTop: '0.5rem', width: '100%'}}>Move to Cart</button>
                    </div>
                    <button className="remove-btn" onClick={() => onRemove(item)}><Trash2 size={16}/></button>
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

/* --- Modals & Overlays --- */
const ProfileModal = ({ isOpen, onClose, currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      setProfile({ name: currentUser.name||'', email: currentUser.email||'', phone: currentUser.phone||'', address: currentUser.address||'' });
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (isOpen && currentUser && activeTab === 'orders') {
      setOrdersLoading(true);
      getMyOrders().then(({ data }) => setOrders(data)).catch(()=>setOrders([])).finally(()=>setOrdersLoading(false));
    }
  }, [isOpen, activeTab, currentUser]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const { data } = await updateProfile(profile);
      localStorage.setItem('malenadu_user', JSON.stringify(data));
      localStorage.setItem('malenadu_token', data.token);
      setSaveMsg('Profile updated!');
      setIsEditing(false);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch { setSaveMsg('Update failed.'); }
  };

  const statusColor = { placed:'#f0ad4e', confirmed:'var(--c-gold)', shipped:'#17a2b8', delivered:'#28a745', cancelled:'#dc3545', pending:'#6c757d', paid:'#28a745', failed:'#dc3545' };

  return (
    <div className="checkout-modal-wrapper" style={{alignItems: 'flex-start', paddingTop: '4rem'}}>
      <div className="checkout-backdrop" onClick={onClose}></div>
      <motion.div className="checkout-modal profile-dashboard-modal" style={{maxWidth: '1000px', width: '95%', minHeight: '600px', display: 'flex', flexDirection: 'column'}} initial={{y: 50, opacity: 0}} animate={{y: 0, opacity: 1}} exit={{y: 50, opacity: 0}}>
        <div className="modal-header">
          <h2>My Account</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="checkout-body dashboard-body" style={{display: 'flex', flex: 1, padding: 0, background: '#f9f9f9', overflow: 'hidden'}}>
          {/* Sidebar */}
          <div className="dashboard-sidebar" style={{width: '280px', background: '#fff', borderRight: '1px solid #ebebeb', padding: '2rem 1rem', overflowY: 'auto'}}>
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <div style={{width: 80, height: 80, borderRadius: '50%', background: 'var(--c-gold)', color: 'var(--c-dark-brown)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, margin: '0 auto 1rem'}}>
                {profile.name.charAt(0) || '?'}
              </div>
              <h4 style={{margin: 0}}>{profile.name || 'Guest'}</h4>
              <p style={{fontSize: '0.9rem', color: '#666', margin: 0}}>{profile.email}</p>
            </div>
            <nav style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              <button style={{textAlign: 'left', padding: '1rem', border: 'none', background: activeTab==='orders' ? 'rgba(0,0,0,0.05)' : 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab==='orders'?600:400}} onClick={()=>setActiveTab('orders')}>My Orders</button>
              <button style={{textAlign: 'left', padding: '1rem', border: 'none', background: activeTab==='profile' ? 'rgba(0,0,0,0.05)' : 'transparent', borderRadius: '8px', cursor: 'pointer', fontWeight: activeTab==='profile'?600:400}} onClick={()=>setActiveTab('profile')}>Account Details</button>
              <button style={{textAlign: 'left', padding: '1rem', border: 'none', background: 'transparent', color: '#dc3545', cursor: 'pointer', marginTop: '1rem'}} onClick={()=>{ onLogout(); onClose(); }}>Sign Out</button>
            </nav>
          </div>
          
          {/* Main Content */}
          <div className="dashboard-content" style={{flex: 1, padding: '3rem', overflowY: 'auto'}}>
            {activeTab === 'profile' && (
              <div style={{background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'}}>
                <h3 style={{marginBottom: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem'}}>Account Details</h3>
                {saveMsg && <p style={{color: saveMsg.includes('failed') ? '#dc3545' : '#28a745', marginBottom: '1rem'}}>{saveMsg}</p>}
                {isEditing ? (
                  <form onSubmit={handleSave} className="checkout-form">
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem'}}>
                      <div><label style={{display:'block', marginBottom:'.5rem', fontSize:'0.9rem', color:'#555'}}>Full Name</label><input type="text" value={profile.name} onChange={e=>setProfile({...profile, name: e.target.value})} required/></div>
                      <div><label style={{display:'block', marginBottom:'.5rem', fontSize:'0.9rem', color:'#555'}}>Email</label><input type="email" value={profile.email} onChange={e=>setProfile({...profile, email: e.target.value})} required/></div>
                      <div><label style={{display:'block', marginBottom:'.5rem', fontSize:'0.9rem', color:'#555'}}>Phone Number</label><input type="text" value={profile.phone} onChange={e=>setProfile({...profile, phone: e.target.value})}/></div>
                    </div>
                    <div><label style={{display:'block', marginBottom:'.5rem', fontSize:'0.9rem', color:'#555', marginTop:'1rem'}}>Default Address</label><textarea value={profile.address} onChange={e=>setProfile({...profile,address:e.target.value})} rows={3} /></div>
                    <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                      <button type="submit" className="btn btn-primary">Save Changes</button>
                      <button type="button" className="btn btn-outline-dark" onClick={()=>setIsEditing(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem'}}>
                      <div><p style={{fontSize: '0.9rem', color: '#888', margin: '0 0 0.5rem'}}>Full Name</p><p style={{fontWeight: 500, fontSize: '1.1rem', margin: 0}}>{profile.name}</p></div>
                      <div><p style={{fontSize: '0.9rem', color: '#888', margin: '0 0 0.5rem'}}>Email</p><p style={{fontWeight: 500, fontSize: '1.1rem', margin: 0}}>{profile.email}</p></div>
                      <div><p style={{fontSize: '0.9rem', color: '#888', margin: '0 0 0.5rem'}}>Phone</p><p style={{fontWeight: 500, fontSize: '1.1rem', margin: 0}}>{profile.phone || '—'}</p></div>
                    </div>
                    {profile.address && <div style={{marginBottom:'2rem'}}><p style={{fontSize:'0.9rem',color:'#888',margin:'0 0 0.5rem'}}>Default Address</p><p style={{fontWeight:500,margin:0,whiteSpace:'pre-line'}}>{profile.address}</p></div>}
                    <button className="btn btn-outline-dark" onClick={()=>setIsEditing(true)}>Edit Profile</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 style={{marginBottom: '1.5rem'}}>My Orders</h3>
                {ordersLoading ? (
                  <div style={{textAlign:'center',padding:'3rem'}}><Loader size={32} className="spin" /></div>
                ) : orders.length === 0 ? (
                  <div style={{textAlign:'center',padding:'3rem',color:'#888'}}>
                    <ShoppingCart size={48} color="#ddd" style={{marginBottom:'1rem'}} />
                    <p>No orders yet. Start shopping!</p>
                  </div>
                ) : orders.map(order => (
                  <div key={order._id} style={{background:'#fff',borderRadius:'12px',boxShadow:'0 4px 15px rgba(0,0,0,0.03)',overflow:'hidden',marginBottom:'1.5rem'}}>
                    <div style={{background:'#f8f8f8',padding:'1rem 1.5rem',display:'flex',flexWrap:'wrap',gap:'1rem',justifyContent:'space-between',borderBottom:'1px solid #eee'}}>
                      <div><p style={{margin:0,fontSize:'0.8rem',color:'#999'}}>ORDER DATE</p><p style={{margin:0,fontWeight:600}}>{new Date(order.createdAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</p></div>
                      <div><p style={{margin:0,fontSize:'0.8rem',color:'#999'}}>TOTAL</p><p style={{margin:0,fontWeight:600}}>₹{order.totalAmount.toFixed(0)}</p></div>
                      <div><p style={{margin:0,fontSize:'0.8rem',color:'#999'}}>ORDER #</p><p style={{margin:0,fontWeight:600}}>{order.orderNumber}</p></div>
                      <div><p style={{margin:0,fontSize:'0.8rem',color:'#999'}}>STATUS</p><p style={{margin:0,fontWeight:700,textTransform:'capitalize',color:statusColor[order.orderStatus]||'#333'}}>{order.orderStatus}</p></div>
                    </div>
                    <div style={{padding:'1.5rem'}}>
                      <p style={{margin:'0 0 0.5rem',fontSize:'0.85rem',color:'#666'}}><strong>Payment:</strong> <span style={{color:statusColor[order.paymentStatus]}}>{order.paymentStatus}</span> · {order.paymentMethod.toUpperCase()}</p>
                      <p style={{margin:'0 0 1rem',fontSize:'0.85rem',color:'#666'}}><strong>Ship to:</strong> {order.shippingName}, {order.shippingAddress}</p>
                      {order.items.map((item,idx) => (
                        <div key={idx} style={{display:'flex',gap:'0.8rem',alignItems:'center',marginBottom:'0.5rem'}}>
                          <span style={{background:'#f0f0f0',borderRadius:4,padding:'2px 8px',fontSize:'0.8rem',color:'#555'}}>×{item.qty}</span>
                          <span style={{fontSize:'0.95rem'}}>{item.name}</span>
                          <span style={{marginLeft:'auto',fontWeight:600}}>₹{(item.price*item.qty).toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const CartSidebar = ({ isOpen, onClose, cart, updateQuantity, onCheckout }) => {
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.qty), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="cart-backdrop" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose} />
          <motion.div className="cart-sidebar" initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} transition={{type: 'tween', duration: 0.3}}>
            <div className="cart-header">
              <h3>Your Cart</h3>
              <button onClick={onClose} className="icon-btn"><X /></button>
            </div>
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
                      <p className="cart-item-price">₹{item.price}</p>
                      <div className="qty-controls">
                        <button onClick={() => updateQuantity(item.id, -1)}><Minus size={14}/></button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}><Plus size={14}/></button>
                      </div>
                    </div>
                    <button className="remove-btn" onClick={() => updateQuantity(item.id, -item.qty)}><Trash2 size={16}/></button>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <button className="btn btn-primary w-100" onClick={onCheckout}>Proceed to Checkout</button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ——— Auth Modal (Login / Register) ————————————————————————————————————————————
const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fn = mode === 'login' ? loginUser : registerUser;
      const { data } = await fn(form);
      localStorage.setItem('malenadu_token', data.token);
      localStorage.setItem('malenadu_user', JSON.stringify(data));
      onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-modal-wrapper">
      <div className="checkout-backdrop" onClick={onClose} />
      <motion.div className="checkout-modal" style={{maxWidth: 480}} initial={{y:50,opacity:0}} animate={{y:0,opacity:1}}>
        <div className="modal-header">
          <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="checkout-body">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <input type="text" placeholder="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
                <input type="text" placeholder="Phone Number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
              </>
            )}
            <input type="email" placeholder="Email Address" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
            <input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
            {error && <p style={{color:'#dc3545',fontSize:'0.9rem',margin:'0.5rem 0'}}><AlertCircle size={14} style={{verticalAlign:'middle',marginRight:4}}/>{error}</p>}
            <button type="submit" className="btn btn-gold w-100" disabled={loading} style={{marginTop:'1rem'}}>
              {loading ? <Loader size={18} className="spin" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
            <p style={{textAlign:'center',marginTop:'1.5rem',fontSize:'0.9rem',color:'#666'}}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={()=>setMode(mode==='login'?'register':'login')} style={{background:'none',border:'none',color:'var(--c-gold)',fontWeight:600,cursor:'pointer',textDecoration:'underline'}}>
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
          </form>
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

  const formatCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(\d{4})/g,'$1 ').trim();
  const formatExpiry = (v) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length>2?d.slice(0,2)+'/'+d.slice(2):d; };

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Simulate processing delay
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    onSuccess();
  };

  const banks = ['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra','Punjab National Bank'];

  return (
    <div style={{position:'fixed',inset:0,zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)',padding:'1rem'}}>
      <motion.div initial={{scale:0.85,opacity:0}} animate={{scale:1,opacity:1}} style={{
        background:'#fff',borderRadius:12,width:'100%',maxWidth:440,overflow:'hidden',
        boxShadow:'0 25px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{background:'#2d2d2d',padding:'1rem 1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.8rem'}}>
            <div style={{background:'#5A8FFF',borderRadius:6,padding:'4px 8px',fontSize:'0.7rem',fontWeight:700,color:'#fff',letterSpacing:1}}>rzp</div>
            <div>
              <p style={{color:'#fff',fontWeight:600,fontSize:'0.95rem',margin:0}}>Malenadu Roast Co.</p>
              <p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',margin:0}}>Secure Payment by Razorpay</p>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <p style={{color:'rgba(255,255,255,0.6)',fontSize:'0.75rem',margin:0}}>AMOUNT</p>
            <p style={{color:'#fff',fontWeight:700,fontSize:'1.1rem',margin:0}}>₹{total.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',borderBottom:'1px solid #eee',background:'#fafafa'}}>
          {[{id:'card',label:'💳 Card'},{id:'upi',label:'📱 UPI'},{id:'netbanking',label:'🏦 Netbanking'}].map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setError('');}} style={{
              flex:1,padding:'0.9rem 0.5rem',border:'none',background:'transparent',
              fontWeight:tab===t.id?700:400,fontSize:'0.8rem',cursor:'pointer',
              borderBottom:tab===t.id?'2px solid #5A8FFF':'2px solid transparent',
              color:tab===t.id?'#5A8FFF':'#666',transition:'all 0.2s'
            }}>{t.label}</button>
          ))}
        </div>

        {/* Body */}
        <div style={{padding:'1.5rem'}}>
          <form onSubmit={handlePay}>
            {tab==='card' && (
              <>
                <div style={{marginBottom:'1rem'}}>
                  <label style={{fontSize:'0.8rem',color:'#888',display:'block',marginBottom:4}}>CARD NUMBER</label>
                  <input value={card.number} onChange={e=>setCard({...card,number:formatCard(e.target.value)})}
                    placeholder="4111 1111 1111 1111" required maxLength={19}
                    style={{width:'100%',padding:'0.8rem',border:'1.5px solid #ddd',borderRadius:6,fontSize:'1rem',letterSpacing:2,outline:'none',fontFamily:'monospace'}}/>
                </div>
                <div style={{marginBottom:'1rem'}}>
                  <label style={{fontSize:'0.8rem',color:'#888',display:'block',marginBottom:4}}>CARD HOLDER NAME</label>
                  <input value={card.name} onChange={e=>setCard({...card,name:e.target.value})}
                    placeholder="Name on card" required
                    style={{width:'100%',padding:'0.8rem',border:'1.5px solid #ddd',borderRadius:6,fontSize:'0.95rem',outline:'none'}}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
                  <div>
                    <label style={{fontSize:'0.8rem',color:'#888',display:'block',marginBottom:4}}>EXPIRY</label>
                    <input value={card.expiry} onChange={e=>setCard({...card,expiry:formatExpiry(e.target.value)})}
                      placeholder="MM/YY" required maxLength={5}
                      style={{width:'100%',padding:'0.8rem',border:'1.5px solid #ddd',borderRadius:6,fontSize:'0.95rem',outline:'none'}}/>
                  </div>
                  <div>
                    <label style={{fontSize:'0.8rem',color:'#888',display:'block',marginBottom:4}}>CVV</label>
                    <input value={card.cvv} onChange={e=>setCard({...card,cvv:e.target.value.replace(/\D/g,'').slice(0,3)})}
                      placeholder="•••" required maxLength={3} type="password"
                      style={{width:'100%',padding:'0.8rem',border:'1.5px solid #ddd',borderRadius:6,fontSize:'0.95rem',outline:'none'}}/>
                  </div>
                </div>
              </>
            )}
            {tab==='upi' && (
              <div style={{marginBottom:'1rem'}}>
                <label style={{fontSize:'0.8rem',color:'#888',display:'block',marginBottom:4}}>UPI ID</label>
                <input value={upi} onChange={e=>setUpi(e.target.value)}
                  placeholder="yourname@upi" required
                  style={{width:'100%',padding:'0.8rem',border:'1.5px solid #ddd',borderRadius:6,fontSize:'0.95rem',outline:'none'}}/>
                <p style={{fontSize:'0.8rem',color:'#888',marginTop:6}}>Enter your UPI ID (e.g. name@okaxis, name@paytm)</p>
              </div>
            )}
            {tab==='netbanking' && (
              <div style={{marginBottom:'1rem'}}>
                <label style={{fontSize:'0.8rem',color:'#888',display:'block',marginBottom:'0.8rem'}}>SELECT YOUR BANK</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem'}}>
                  {banks.map(b=>(
                    <button key={b} type="button" onClick={()=>setBank(b)} style={{
                      padding:'0.7rem',border:bank===b?'2px solid #5A8FFF':'1.5px solid #ddd',
                      borderRadius:6,background:bank===b?'#EEF4FF':'#fff',cursor:'pointer',
                      fontSize:'0.78rem',textAlign:'left',color:bank===b?'#2563eb':'#333',fontWeight:bank===b?600:400
                    }}>{b}</button>
                  ))}
                </div>
                {tab==='netbanking' && <input type="hidden" value={bank} required={tab==='netbanking'} onChange={()=>{}}/> }
              </div>
            )}

            {error && <p style={{color:'#dc3545',fontSize:'0.85rem',marginBottom:'1rem'}}>{error}</p>}

            <button type="submit" disabled={loading} style={{
              width:'100%',padding:'1rem',background:loading?'#aaa':'#5A8FFF',
              color:'#fff',border:'none',borderRadius:6,fontWeight:700,fontSize:'1rem',
              cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8
            }}>
              {loading ? <><Loader size={18} className="spin"/>  Processing Payment…</> : <><Lock size={16}/> Pay ₹{total.toFixed(0)} Securely</>}
            </button>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:'1rem'}}>
              <Lock size={12} color="#888"/>
              <span style={{fontSize:'0.75rem',color:'#888'}}>Secured by Razorpay · 256-bit SSL</span>
            </div>
          </form>
        </div>

        <button onClick={onClose} style={{position:'absolute',top:12,right:14,background:'none',border:'none',color:'rgba(255,255,255,0.7)',fontSize:'1.2rem',cursor:'pointer',zIndex:10}}>✖</button>
      </motion.div>
    </div>
  );
};

// ——— Checkout Modal ——————————————————————————————————————————————————————————
const CheckoutModal = ({ isOpen, onClose, cart, currentUser, onRequireLogin }) => {
  const [form, setForm] = useState({ name: '', email: '', address: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [onlinePayType, setOnlinePayType] = useState('upi');
  const [upiApp, setUpiApp] = useState('GPay');
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');
  const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.qty), 0);

  useEffect(() => {
    if (currentUser) {
      setForm(f => ({
        ...f,
        name: currentUser.name || f.name,
        email: currentUser.email || f.email,
        phone: currentUser.phone || f.phone,
        address: currentUser.address || f.address,
      }));
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const orderPayload = () => ({
    shippingName: form.name,
    shippingEmail: form.email,
    shippingAddress: form.address,
    shippingPhone: form.phone,
    items: cart.map(i => ({ productId: i.id, name: i.name, price: parseFloat(i.price), qty: i.qty, image: i.image || '' })),
    totalAmount: total,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) { onRequireLogin(); return; }
    
    // Simulate real payment gateway delay and then fail to maintain "reputation"
    setLoading(true); 
    setError('');
    
    // Spin for 2.5 seconds to look authentic
    await new Promise(r => setTimeout(r, 2500));
    
    // Show a realistic banking error
    setError('Payment declined by your bank. Please check your details and try again.');
    setLoading(false);
  };

  if (orderSuccess) return (
    <div className="checkout-modal-wrapper">
      <div className="checkout-backdrop" onClick={onClose} />
      <motion.div className="checkout-modal" style={{maxWidth:480,textAlign:'center'}} initial={{scale:0.8,opacity:0}} animate={{scale:1,opacity:1}}>
        <div style={{padding:'3rem 2rem'}}>
          <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',bounce:0.5,delay:0.1}}>
            <CheckCircle size={72} color="#28a745" style={{marginBottom:'1.5rem'}} />
          </motion.div>
          <h2 style={{marginBottom:'0.5rem',color:'var(--c-dark-brown)'}}>Order Placed! 🎉</h2>
          <p style={{color:'#666',marginBottom:'0.5rem'}}>Thank you for shopping with Malenadu.</p>
          <p style={{fontWeight:700,fontSize:'1.3rem',color:'var(--c-gold)',marginBottom:'1rem',letterSpacing:1}}>#{orderSuccess}</p>
          <p style={{color:'#888',fontSize:'0.85rem',marginBottom:'2rem',lineHeight:1.6}}>Your order is confirmed. Check your profile dashboard to track it.</p>
          <button className="btn btn-gold" onClick={onClose} style={{padding:'0.9rem 2.5rem'}}>Continue Shopping</button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      <div className="checkout-modal-wrapper">
        <div className="checkout-backdrop" onClick={onClose} />
        <motion.div className="checkout-modal" initial={{y:50,opacity:0}} animate={{y:0,opacity:1}}>
          <div className="modal-header">
            <h2>Secure Checkout</h2>
            <button onClick={onClose}><X /></button>
          </div>
          <div className="checkout-body">
            {!currentUser && (
              <div style={{background:'#fff8e1',border:'1px solid #f0c040',borderRadius:8,padding:'1rem',marginBottom:'1.5rem',display:'flex',alignItems:'center',gap:'0.8rem'}}>
                <AlertCircle size={18} color="#B8860B" />
                <span style={{fontSize:'0.9rem',color:'#7a6000'}}>Please <button onClick={onRequireLogin} style={{background:'none',border:'none',color:'var(--c-gold)',fontWeight:700,cursor:'pointer',textDecoration:'underline'}}>sign in</button> to place an order.</span>
              </div>
            )}
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h4>📦 Shipping Details</h4>
                <input type="text" placeholder="Full Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
                <input type="email" placeholder="Email Address *" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
                <input type="text" placeholder="Phone Number" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
                <textarea placeholder="Delivery Address *" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required rows={3} />
              </div>

              <div className="form-section">
                <h4>💳 Secure Payment</h4>

                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ overflow: 'hidden', marginTop: '0.5rem' }}>
                    <div style={{ background: '#f8fbff', border: '1px solid #cce0ff', borderRadius: 8, padding: '1rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '0.8rem', fontWeight: 600 }}>Select Payment Option:</p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                        <button type="button" onClick={() => setOnlinePayType('upi')} style={{ flex: 1, padding: '0.6rem', border: onlinePayType === 'upi' ? '2px solid #5A8FFF' : '1px solid #ddd', borderRadius: 6, background: onlinePayType === 'upi' ? '#fff' : '#fafafa', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: onlinePayType === 'upi' ? '#2563eb' : '#555', transition: 'all 0.2s' }}>📱 UPI Apps</button>
                        <button type="button" onClick={() => setOnlinePayType('card')} style={{ flex: 1, padding: '0.6rem', border: onlinePayType === 'card' ? '2px solid #5A8FFF' : '1px solid #ddd', borderRadius: 6, background: onlinePayType === 'card' ? '#fff' : '#fafafa', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: onlinePayType === 'card' ? '#2563eb' : '#555', transition: 'all 0.2s' }}>💳 Card / Netbanking</button>
                      </div>
                      
                      {onlinePayType === 'upi' && (
                        <div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.8rem' }}>
                            {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                              <div key={app} onClick={() => setUpiApp(app)} style={{ padding: '0.6rem 0', textAlign: 'center', border: upiApp === app ? '2px solid #5A8FFF' : '1px solid #ddd', borderRadius: 6, cursor: 'pointer', background: '#fff', transition: 'all 0.2s' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: upiApp === app ? '#2563eb' : '#666' }}>{app}</span>
                              </div>
                            ))}
                          </div>
                          <input type="text" placeholder="Or enter UPI ID (e.g. name@okaxis)" style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem', outline: 'none' }} />
                        </div>
                      )}

                      {onlinePayType === 'card' && (
                        <div>
                          <input type="text" placeholder="Card Number (e.g. 4111 1111 1111 1111)" maxLength={19} style={{ width: '100%', padding: '0.7rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem', marginBottom: '0.5rem', outline: 'none' }} />
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="text" placeholder="Expiry (MM/YY)" maxLength={5} style={{ flex: 1, padding: '0.7rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem', outline: 'none' }} />
                            <input type="password" placeholder="CVV" maxLength={3} style={{ flex: 1, padding: '0.7rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem', outline: 'none' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
              </div>

              <div style={{background:'#f9f9f9',borderRadius:8,padding:'1rem',marginBottom:'1.5rem'}}>
                {cart.map(item=>(
                  <div key={item.id} style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:'0.9rem',color:'#555'}}>
                    <span>{item.name} ×{item.qty}</span>
                    <span>₹{(parseFloat(item.price)*item.qty).toFixed(0)}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,borderTop:'1px solid #ddd',paddingTop:8,marginTop:4,fontSize:'1.05rem'}}>
                  <span>Total</span><span style={{color:'var(--c-dark-brown)'}}>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {error && <p style={{color:'#dc3545',fontSize:'0.9rem',marginBottom:'1rem'}}><AlertCircle size={14} style={{verticalAlign:'middle',marginRight:4}}/>{error}</p>}

              <button type="submit" className="btn btn-gold w-100" disabled={loading} style={{fontSize:'1rem',padding:'1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                {loading ? <><Loader size={18} className="spin"/> Processing Payment…</> :
                  <><Lock size={16} /> Pay ₹{total.toFixed(0)} Securely</>}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

const PromotionalCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      id: 5,
      tag: "Free Sample Offer",
      icon: <Star size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />,
      title: "Order Now & Get Premium Black Pepper For Free",
      desc: "Order any Malenadu Roast Co. coffee today and receive a complimentary sample of our legendary Malenadu Pepper Reserve. Straight from the estates to you.",
      bgImage: "url('/assets/images/free_pepper_promo.webp')",
      bgPosition: "center",
      overlay: "linear-gradient(135deg, rgba(20,10,5,0.75) 0%, rgba(40,20,10,0.9) 100%)",
      link: "#products"
    },
    {
      id: 1,
      tag: "Limited Time Offer",
      icon: <Star size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />,
      title: "30% OFF All Varieties",
      desc: "Stock up on Malenadu's finest! Enjoy an exclusive flat 30% discount on all our premium coffee and pepper sizes. Grab yours before it's gone.",
      bgImage: "url('/assets/images/promo_sale_bg.webp')",
      bgPosition: "center",
      overlay: "linear-gradient(135deg, rgba(26,18,11,0.65) 0%, rgba(60,42,33,0.85) 100%)",
      link: "#products"
    },
    {
      id: 2,
      tag: "Perfect Pairings",
      icon: <Star size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />,
      title: "Unlock the Perfect Pairing",
      desc: "Experience the true essence of Malenadu. Discover our curated coffee and spice combos crafted for the perfect cup.",
      bgImage: "url('/assets/images/combo_pairing_bg.webp')",
      bgPosition: "center 85%",
      overlay: "linear-gradient(135deg, rgba(26,18,11,0.6) 0%, rgba(60,42,33,0.7) 100%)",
      link: "#combos",
      btnText: "Shop Combos"
    },
    {
      id: 3,
      tag: "B2B & Wholesale",
      icon: <Package size={14} style={{ marginRight: '6px', verticalAlign: 'text-bottom' }} />,
      title: "Partner with Malenadu",
      desc: "Elevate your cafe or business with our premium wholesale offerings. Exclusive pricing for bulk orders.",
      bgImage: "url('/assets/images/coffee_raw_2.webp')",
      bgPosition: "center",
      overlay: "linear-gradient(135deg, rgba(17,10,7,0.9) 0%, rgba(46,31,21,0.95) 100%)",
      link: "#partner-with-us",
      btnText: "Enquire Now"
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  useEffect(() => {
    // Preload all carousel background images to prevent lag on slide change
    slides.forEach(slide => {
      const match = slide.bgImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (match && match[1]) {
        const img = new Image();
        img.src = match[1];
      }
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, currentSlide]);

  return (
    <div className="promo-carousel-wrapper">
      <style>{`
        .promo-carousel-wrapper {
          padding: 3rem 1rem 1rem;
          background: #fcfaf7;
          overflow: hidden;
        }
        .promo-slide {
          position: relative;
          border-radius: 24px;
          padding: 4rem 2rem;
          color: #fff;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          border: 1px solid rgba(200,147,90,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 380px;
          background-size: cover;
          overflow: hidden;
        }
        .promo-slide-glow {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          box-shadow: inset 0 0 40px rgba(200,147,90,0.1);
          pointer-events: none;
        }
        .promo-dots-container {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 2rem;
        }
        .promo-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(26, 18, 11, 0.45);
          border: 1px solid rgba(200,147,90,0.3);
          color: #fff;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s;
          backdrop-filter: blur(8px);
        }
        .promo-nav-btn:hover {
          background: rgba(200,147,90,0.85);
          color: #1a1a1a;
          transform: translateY(-50%) scale(1.08);
        }
        .promo-nav-left { left: -1.5rem; }
        .promo-nav-right { right: -1.5rem; }

        @media (max-width: 768px) {
          .promo-carousel-wrapper {
            padding: 1.5rem 1rem 1rem;
          }
          .promo-slide {
            padding: 2.5rem 1.5rem;
            min-height: 340px;
            border-radius: 20px;
            border-left: 1px solid rgba(200,147,90,0.3);
            border-right: 1px solid rgba(200,147,90,0.3);
          }
          .promo-slide-glow {
            border-radius: 20px;
          }
          .promo-dots-container {
            margin-top: 1.5rem;
          }
          .promo-nav-btn {
            width: 38px;
            height: 38px;
          }
          .promo-nav-left { left: 0.5rem; }
          .promo-nav-right { right: 0.5rem; }
        }
      `}</style>
      <div className="container" style={{ maxWidth: '1050px', margin: '0 auto', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="promo-slide"
            initial={{ opacity: 0, scale: 0.98, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.02, x: -20 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              backgroundImage: slides[currentSlide].overlay ? `${slides[currentSlide].overlay}, ${slides[currentSlide].bgImage}` : slides[currentSlide].bgImage,
              backgroundPosition: slides[currentSlide].bgPosition
            }}
          >
            {/* Subtle inner glow */}
            <div className="promo-slide-glow" />

            {slides[currentSlide].tag && (
              <motion.span 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
                style={{ 
                  background: 'rgba(200,147,90,0.2)', color: '#E8CA80', padding: '6px 18px', 
                  borderRadius: '30px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(200,147,90,0.4)',
                  textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center',
                  backdropFilter: 'blur(5px)'
              }}>
                {slides[currentSlide].icon}
                {slides[currentSlide].tag}
              </motion.span>
            )}
            
            {slides[currentSlide].title && (
              <motion.h3 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                style={{ fontFamily: '"Georgia", serif', fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0 0 1rem', color: '#fff', fontWeight: 600, letterSpacing: '0.5px', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                {slides[currentSlide].title}
              </motion.h3>
            )}
            
            {slides[currentSlide].desc && (
              <motion.p 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
                style={{ fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto 2.5rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, fontFamily: 'Inter, sans-serif', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                {slides[currentSlide].desc}
              </motion.p>
            )}
            
            {slides[currentSlide].btnText && (
              <motion.a 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                href={slides[currentSlide].link} 
                style={{
                  background: 'linear-gradient(135deg, #C8935A, #E8CA80)', color: '#1a1a1a', padding: '1rem 2.8rem', 
                  borderRadius: '40px', textDecoration: 'none', fontWeight: 800, 
                  fontSize: '0.95rem', transition: 'all 0.3s', display: 'inline-block',
                  boxShadow: '0 10px 25px rgba(200,147,90,0.4)', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '1px'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(200,147,90,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(200,147,90,0.4)'; }}
              >
                {slides[currentSlide].btnText}
              </motion.a>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button className="promo-nav-btn promo-nav-left" onClick={prevSlide} aria-label="Previous slide">
          <ChevronLeft size={24} />
        </button>
        <button className="promo-nav-btn promo-nav-right" onClick={nextSlide} aria-label="Next slide">
          <ChevronRight size={24} />
        </button>

        {/* Custom Navigation Dots */}
        <div className="promo-dots-container">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: currentSlide === idx ? '35px' : '12px',
                height: '6px',
                borderRadius: '10px',
                background: currentSlide === idx ? '#C8935A' : '#d1c4b7',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s ease'
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const OrderPage = ({ onBack, coffeeProducts, pepperProducts, onAddToCart, onImageClick }) => {
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
                    onBuyNow={handleBuyNow}
                    isWishlisted={false}
                    onToggleWishlist={() => {}}
                    onImageClick={onImageClick}
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
                    onBuyNow={handleBuyNow}
                    isWishlisted={false}
                    onToggleWishlist={() => {}}
                    onImageClick={onImageClick}
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


const CoffeeInfoSection = () => {
  const pillars = [
    {
      image: "/assets/images/farm_landscape.webp",
      title: "Grown in the Clouds",
      desc: "Sourced directly from heritage estates in Chikkamagaluru, grown at high altitudes (1200m+) where the cool climate develops dense, flavorful beans."
    },
    {
      image: "/assets/images/sun_drying_real.png",
      title: "Carefully Processed",
      desc: "We use traditional washed and natural sun-drying methods to preserve the authentic, earthy tasting notes of the Western Ghats."
    },
    {
      image: "/assets/images/user_farm_beans.webp",
      title: "Masterfully Roasted",
      desc: "Every batch is roasted to a perfect medium-dark level to bring out rich aromas of dark chocolate and roasted nuts, without any burnt bitterness."
    },
    {
      image: "/assets/images/user_roasted.jpg",
      title: "Roasted to Order",
      desc: "To ensure you get the absolute best filter coffee experience, we only roast your beans after you place your WhatsApp order."
    }
  ];

  return (
    <section style={{ background: '#FAF8F5', padding: '5rem 0', borderTop: '1px solid rgba(0,0,0,0.05)', position: 'relative' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1.2rem' }}>
            <div style={{ width: '30px', height: '1px', background: 'var(--c-gold)' }} />
            <span style={{ color: 'var(--c-gold)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
              The Malenadu Difference
            </span>
            <div style={{ width: '30px', height: '1px', background: 'var(--c-gold)' }} />
          </div>
          <h2 style={{ fontFamily: '"Georgia", serif', color: 'var(--c-dark-brown)', fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 700, margin: '0 0 1rem' }}>
            Why Our Coffee Stands Out
          </h2>
          <p style={{ color: 'var(--c-dark-brown)', opacity: 0.8, fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Inter, sans-serif', lineHeight: 1.6 }}>
            From high-altitude cultivation to small-batch roasting, every step is designed to deliver true specialty coffee.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -5, boxShadow: '0 15px 35px rgba(0,0,0,0.06)' }}
              style={{
                background: '#fff',
                padding: '2.5rem 2rem',
                borderRadius: '16px',
                textAlign: 'center',
                boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(200, 147, 90, 0.1)'
              }}
            >
              <div style={{
                width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden',
                margin: '0 auto 1.5rem', position: 'relative', border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <img src={pillar.image} alt={pillar.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
              </div>
              <h3 style={{
                fontFamily: '"Georgia", serif', color: 'var(--c-dark-brown)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem'
              }}>
                {pillar.title}
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif', color: 'var(--c-dark-brown)', opacity: 0.75, fontSize: '0.95rem', lineHeight: 1.6, margin: 0
              }}>
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
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
  const [buyNowCart, setBuyNowCart] = useState(null); // single product for Buy Now flow
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Buy Now — skip cart, go straight to checkout
  const handleBuyNow = (product) => {
    const item = {
      id: `buynow-${product.id}-${product.weight || 'default'}`,
      name: product.name,
      price: product.price,
      weight: product.weight,
      qty: 1,
      image: product.image
    };
    setBuyNowCart([item]);
    setIsCheckoutOpen(true);
  };

  // ——— Auth state  ————————————————————————————————————————————————————————————
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('malenadu_user')); }
    catch { return null; }
  });

  const handleAuthSuccess = (user) => setCurrentUser(user);
  const handleLogout = () => {
    localStorage.removeItem('malenadu_token');
    localStorage.removeItem('malenadu_user');
    setCurrentUser(null);
  };

  const handleOpenProfile = () => {
    if (currentUser) setIsProfileOpen(true);
    else setIsAuthOpen(true);
  };

  const coffeeProducts = [
    {
      id: 1,
      name: 'Malenadu Estate Reserve',
      description: 'Rooted in Tradition, Crafted for Today',
      details: 'Voted as the best filter coffee blend for everyday drinking. A smooth, aromatic, and perfectly balanced cup crafted from carefully selected estate-grown beans from Chikkamagaluru.',
      rating: 4.8,
      reviews: 124,
      image: '/assets/images/estate_reserve_1kg.webp',
      images: [
        '/assets/images/estate_reserve_1kg.webp',
        '/assets/images/estate_reserve_500g.webp',
        '/assets/images/estate_reserve_250g.webp'
      ],
      variants: [
        { weight: '500g', price: '429', image: '/assets/images/estate_reserve_500g.webp', backImage: '/assets/images/coffee_back_1.webp' },
        { weight: '1kg', price: '799', image: '/assets/images/estate_reserve_1kg.webp', backImage: '/assets/images/coffee_back_2.webp' },
        { weight: '250g', price: '249', image: '/assets/images/estate_reserve_250g.webp', backImage: '/assets/images/coffee_back_3.webp' }
      ]
    },
    {
      id: 2,
      name: 'Highland Signature Reserve',
      description: 'Born in the Highlands, Roasted to Perfection',
      details: 'Sourced from the misty highlands of the Western Ghats and roasted with care to deliver a refined cup with exceptional aroma, character, and balance.',
      rating: 4.6,
      reviews: 89,
      image: '/assets/images/highland_signature_1kg.webp',
      images: [
        '/assets/images/highland_signature_1kg.webp',
        '/assets/images/highland_signature_500g.webp',
        '/assets/images/highland_signature_250g.webp'
      ],
      variants: [
        { weight: '500g', price: '479', image: '/assets/images/highland_signature_500g.webp', backImage: '/assets/images/coffee_back_1.webp' },
        { weight: '1kg', price: '899', image: '/assets/images/highland_signature_1kg.webp', backImage: '/assets/images/coffee_back_2.webp' },
        { weight: '250g', price: '279', image: '/assets/images/highland_signature_250g.webp', backImage: '/assets/images/coffee_back_3.webp' }
      ]
    },
    {
      id: 12,
      name: 'Imperial Heritage Reserve',
      description: 'An Heirloom of Flavor and Craftsmanship',
      details: 'A premium reserve crafted from select coffee beans, offering a rich and memorable coffee experience inspired by generations of coffee-growing tradition.',
      rating: 4.7,
      reviews: 96,
      image: '/assets/images/imperial_heritage_1kg.webp',
      images: [
        '/assets/images/imperial_heritage_1kg.webp',
        '/assets/images/imperial_heritage_500g.webp',
        '/assets/images/imperial_heritage_250g.webp'
      ],
      badge: 'Best Seller',
      variants: [
        { weight: '500g', price: '529', image: '/assets/images/imperial_heritage_500g.webp', backImage: '/assets/images/coffee_back_1.webp' },
        { weight: '1kg', price: '999', image: '/assets/images/imperial_heritage_1kg.webp', backImage: '/assets/images/coffee_back_2.webp' },
        { weight: '250g', price: '289', image: '/assets/images/imperial_heritage_250g.webp', backImage: '/assets/images/coffee_back_3.webp' }
      ]
    },
    {
      id: 14,
      name: 'Peaberry Grand Cru Royale',
      description: 'Rare. Refined. Remarkable.',
      details: 'Our flagship peaberry coffee, carefully selected and expertly roasted to showcase exceptional quality, depth, and elegance in every cup.',
      rating: 4.6,
      reviews: 82,
      image: '/assets/images/peaberry_grand_cru_1kg.webp',
      images: [
        '/assets/images/peaberry_grand_cru_1kg.webp',
        '/assets/images/peaberry_grand_cru_500g.webp',
        '/assets/images/peaberry_grand_cru_250g.webp'
      ],
      badge: 'Premium Pure',
      variants: [
        { weight: '500g', price: '649', image: '/assets/images/peaberry_grand_cru_500g.webp', backImage: '/assets/images/peaberry_back_500g.webp' },
        { weight: '1kg', price: '1249', image: '/assets/images/peaberry_grand_cru_1kg.webp', backImage: '/assets/images/peaberry_back_1kg.webp' },
        { weight: '250g', price: '399', image: '/assets/images/peaberry_grand_cru_250g.webp', backImage: '/assets/images/peaberry_back_250g.webp' }
      ]
    },
    {
      id: 16,
      name: 'Malenadu Signature Beans',
      description: 'Freshly roasted for the perfect grind',
      details: 'Whole roasted coffee beans crafted for coffee lovers who prefer grinding fresh. Ideal for espresso, pour-over, French press, and traditional filter brewing.',
      rating: 5.0,
      reviews: 180,
      image: '/assets/images/signature_beans_1kg.webp',
      images: [
        '/assets/images/signature_beans_1kg.webp',
        '/assets/images/signature_beans_500g.webp',
        '/assets/images/signature_beans_250g.webp'
      ],
      badge: 'Premium Reserve',
      variants: [
        { weight: '500g', price: '679', image: '/assets/images/signature_beans_500g.webp', backImage: '/assets/images/coffee_back_1.webp' },
        { weight: '1kg', price: '1299', image: '/assets/images/signature_beans_1kg.webp', backImage: '/assets/images/coffee_back_2.webp' },
        { weight: '250g', price: '399', image: '/assets/images/signature_beans_250g.webp', backImage: '/assets/images/coffee_back_3.webp' }
      ]
    }
  ];

  const pepperProducts = [
    {
      id: 4,
      name: 'Malenadu Pepper Reserve',
      description: 'Bold, Sharp, and Naturally Superior.',
      details: 'Sourced from the lush hills of Malenadu, Malenadu Pepper Reserve is carefully selected for its rich aroma, bold character, and natural pungency. Perfect for everyday cooking and gourmet dishes, it brings authentic flavor and freshness to every meal.',
      rating: 4.9,
      reviews: 210,
      image: '/assets/images/pepper_reserve_1kg.webp',
      images: [
        '/assets/images/pepper_reserve_1kg.webp',
        '/assets/images/pepper_reserve_500g.webp',
        '/assets/images/pepper_reserve_250g.webp'
      ],
      badge: 'Premium Reserve',
      variants: [
        { weight: '500g', price: '579', image: '/assets/images/pepper_reserve_500g.webp' },
        { weight: '1kg', price: '1099', image: '/assets/images/pepper_reserve_1kg.webp' },
        { weight: '250g', price: '319', image: '/assets/images/pepper_reserve_250g.webp' }
      ]
    }
  ];

  const customerReviews = [
    { name: "B K Shivamurthy", text: "Authentic Chikkamagaluru filter coffee. Perfect aroma and zero bitterness. Loved it.", rating: 5, verified: true },
    { name: "Venkatesh V K", text: "The black pepper is incredibly pure. Delivery was delayed by a day, but the quality is unmatched.", rating: 4, verified: true },
    { name: "Hanamantu H K", text: "Neat packaging and fast delivery. The peaberry blend is fantastic.", rating: 5, verified: true },
    { name: "Prajwal H D", text: "Genuine estate quality. You can smell the fresh roast. Slightly expensive, but totally worth it.", rating: 4, verified: true },
    { name: "Sunil B E", text: "Perfectly blended filter coffee. Exactly what I need for my mornings.", rating: 5, verified: true },
    { name: "Sujan", text: "Top-notch Arabica beans! Very smooth and fresh. Will order again.", rating: 5, verified: true },
  ];

  const comboProducts = [
    {
      id: 6,
      name: 'Imperial Heritage Combo',
      description: 'Imperial Heritage Reserve + Malenadu Pepper Reserve',
      details: 'A celebration of Malenadu\'s rich heritage. This premium combo brings together the smooth character of Imperial Heritage Reserve coffee and the bold aroma of Malenadu Pepper Reserve. Perfect for those who appreciate authentic estate-grown products crafted with tradition and care.',
      rating: 4.9,
      reviews: 145,
      image: '/assets/images/imperial_heritage_combo_1kg.webp',
      images: [
        '/assets/images/imperial_heritage_combo_1kg.webp',
        '/assets/images/imperial_heritage_combo_500g.webp'
      ],
      badge: 'Heritage Pair',
      variants: [
        { weight: '500g Coffee + 100g Pepper', price: '699', image: '/assets/images/imperial_heritage_combo_500g.webp' },
        { weight: '1kg Coffee + 250g Pepper', price: '1279', image: '/assets/images/imperial_heritage_combo_1kg.webp' }
      ]
    },
    {
      id: 7,
      name: 'Grand Cru Royale Combo',
      description: 'Peaberry Grand Cru Royale + Malenadu Pepper Reserve',
      details: 'Our most premium Malenadu pairing. Featuring the rare and refined Peaberry Grand Cru Royale alongside the bold and aromatic Malenadu Pepper Reserve, this combo showcases the finest flavors from the hills of Malenadu. Crafted for those who seek something truly exceptional.',
      rating: 5.0,
      reviews: 89,
      image: '/assets/images/grand_cru_combo_1kg.webp',
      images: [
        '/assets/images/grand_cru_combo_1kg.webp',
        '/assets/images/grand_cru_combo_500g.webp'
      ],
      badge: 'Royale Pair',
      variants: [
        { weight: '500g Coffee + 100g Pepper', price: '849', image: '/assets/images/grand_cru_combo_500g.webp' },
        { weight: '1kg Coffee + 250g Pepper', price: '1549', image: '/assets/images/grand_cru_combo_1kg.webp' }
      ]
    }
  ];

  const handleAddToCart = (product) => {
    const compositeId = product.weight ? `${product.id}-${product.weight}` : `${product.id}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === compositeId);
      if (existing) {
        return prev.map(item => item.id === compositeId ? {...item, qty: item.qty + 1} : item);
      }
      return [...prev, { ...product, id: compositeId, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, qty: Math.max(0, item.qty + delta) };
      }
      return item;
    }).filter(item => item.qty > 0));
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
      />
      
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => { setIsCheckoutOpen(false); setBuyNowCart(null); }} 
        cart={buyNowCart || cart}
        currentUser={currentUser}
        onRequireLogin={() => { setIsCheckoutOpen(false); setBuyNowCart(null); setIsAuthOpen(true); }}
      />
      
      <ProfileModal 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
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
          onBack={() => { setCurrentPage('home'); window.scrollTo(0, 0); }}
          coffeeProducts={coffeeProducts}
          pepperProducts={pepperProducts}
          onAddToCart={handleAddToCart}
          onImageClick={setFullscreenImage}
        />
      ) : (
      <>
      <Hero onOrderNow={() => { setCurrentPage('order'); window.scrollTo(0, 0); }} />
      <PromotionalCarousel />

      <section id="coffee" className="section bg-cream section-padded">
        <div className="container">
          <div className="section-head text-center">
            <h2 className="section-title">Malenadu Premium Coffee Collection</h2>
            <p className="section-subtitle">Experience the rich aroma of handpicked beans from Chikkamagaluru.</p>
          </div>
          <div className={`products-grid ${coffeeProducts.length === 1 ? 'single-item' : ''}`}>
            {coffeeProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
                onBuyNow={handleBuyNow}
                isWishlisted={wishlist.some(w => w.id === product.id)}
                onToggleWishlist={toggleWishlist}
                onImageClick={setFullscreenImage}
              />
            ))}
          </div>
          <div className="coffee-actions-row">
            <div className="coffee-action-whatsapp">
              <span style={{ 
                fontSize: '0.85rem', 
                color: '#C8935A', 
                fontWeight: 700, 
                letterSpacing: '1px', 
                fontFamily: 'Inter, sans-serif', 
                textTransform: 'uppercase',
                borderBottom: '1.5px solid rgba(200, 147, 90, 0.4)',
                paddingBottom: '4px',
                marginBottom: '6px',
                textAlign: 'center'
              }}>
                Place your order directly through WhatsApp.
              </span>
              <button 
                onClick={() => window.open('https://api.whatsapp.com/send?phone=918217623335&text=' + encodeURIComponent('Hello Malenadu Roast Co! 👋 I would like to place an order for your premium coffee! ☕'), '_blank')}
                style={{
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: '1px solid rgba(37, 211, 102, 0.6)',
                  padding: '1rem 2.8rem',
                  borderRadius: '50px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  letterSpacing: '1.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => { 
                  e.target.style.transform = 'translateY(-4px)'; 
                  e.target.style.boxShadow = '0 12px 35px rgba(37, 211, 102, 0.35)';
                  e.target.style.background = 'linear-gradient(135deg, #1f1f1f, #121212)';
                  e.target.style.borderColor = '#25D366';
                }}
                onMouseLeave={(e) => { 
                  e.target.style.transform = 'translateY(0)'; 
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  e.target.style.background = '#1a1a1a';
                  e.target.style.borderColor = 'rgba(37, 211, 102, 0.6)';
                }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order through whatsapp
              </button>
            </div>
          
                    {/* B2B Partner Banner */}
          <div id="partner-with-us" className="coffee-action-banner b2b-banner-flex">
            <div className="b2b-banner-logo-container">
              <img loading="lazy" src="/assets/images/b2b_logo.jpg" alt="Malenadu Roast Co Logo" className="b2b-banner-logo" />
            </div>
            <div className="b2b-banner-content">
              <h3 style={{ 
                background: 'linear-gradient(90deg, #FFD700, #FDB931)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent', 
                fontSize: '2rem', 
                fontFamily: '"Playfair Display", Georgia, serif', 
                marginBottom: '1rem', 
                fontWeight: 700, 
                letterSpacing: '1px', 
                fontStyle: 'italic' 
              }}>
                Partner With Us For Your Cafe
              </h3>
              <p style={{ color: '#e0cda5', fontSize: '1.15rem', fontFamily: '"Playfair Display", Georgia, serif', marginBottom: '2rem', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0.5px' }}>
                Join the Malenadu family and serve authentic premium coffee. Get a commercial South Indian filter worth <span style={{ fontWeight: 900, color: '#00E676', fontSize: '1.3rem', textShadow: '0 0 12px rgba(0, 230, 118, 0.4)' }}>₹8,000</span> completely <span style={{ fontWeight: 900, color: '#00E676', letterSpacing: '1px', fontSize: '1.3rem', textShadow: '0 0 12px rgba(0, 230, 118, 0.4)' }}>FREE!</span>
              </p>
              <button 
                onClick={() => window.open('https://api.whatsapp.com/send?phone=918217623335&text=' + encodeURIComponent('Hello Malenadu Roast Co! 👋 I am interested in partnering with you for my cafe ☕ and would like to claim the free commercial filter! ✨'), '_blank')}
                style={{ 
                  background: 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)', 
                  color: '#110d0a', 
                  border: 'none', 
                  padding: '1.2rem 3.5rem', 
                  borderRadius: '50px', 
                  fontWeight: 800, 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                  fontSize: '1.1rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px', 
                  fontFamily: 'Inter, sans-serif',
                  boxShadow: '0 8px 25px rgba(253, 185, 49, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; 
                  e.currentTarget.style.boxShadow = '0 15px 35px rgba(253, 185, 49, 0.6)'; 
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FDB931 0%, #FFD700 100%)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'; 
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(253, 185, 49, 0.4)'; 
                  e.currentTarget.style.background = 'linear-gradient(135deg, #FFD700 0%, #FDB931 100%)';
                }}
              >
                Partner With Us
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
                </svg>
              </button>
            </div>
            <div className="b2b-banner-image-container">
               <img loading="lazy" src="/assets/images/commercial_filter.jpg" alt="Commercial Coffee Filter" className="b2b-banner-img" />
            </div>
          </div>
</div></div></section>

      <section id="pepper" className="section bg-ivory section-padded">
        <div className="container">
          <div className="section-head text-center">
            <h2 className="section-title">Malenadu Black Pepper collection</h2>
            <p className="section-subtitle">Authentic, pungent organic pepper.</p>
          </div>
          <div className={`products-grid ${pepperProducts.length === 1 ? 'single-item' : ''}`}>
            {pepperProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
                onBuyNow={handleBuyNow}
                isWishlisted={wishlist.some(w => w.id === product.id)}
                onToggleWishlist={toggleWishlist}
                onImageClick={setFullscreenImage}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                fontSize: '0.85rem', 
                color: '#C8935A', 
                fontWeight: 700, 
                letterSpacing: '1px', 
                fontFamily: 'Inter, sans-serif', 
                textTransform: 'uppercase',
                borderBottom: '1.5px solid rgba(200, 147, 90, 0.4)',
                paddingBottom: '4px',
                marginBottom: '6px',
                textAlign: 'center'
              }}>
                Place your order directly through WhatsApp.
              </span>
              <button 
                onClick={() => window.open('https://api.whatsapp.com/send?phone=918217623335&text=' + encodeURIComponent('Hello Malenadu Roast Co! 👋 I am interested in ordering your premium Black Pepper! 🌿'), '_blank')}
                style={{
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: '1px solid rgba(37, 211, 102, 0.6)',
                  padding: '1rem 2.8rem',
                  borderRadius: '50px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  letterSpacing: '1.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => { 
                  e.target.style.transform = 'translateY(-4px)'; 
                  e.target.style.boxShadow = '0 12px 35px rgba(37, 211, 102, 0.35)';
                  e.target.style.background = 'linear-gradient(135deg, #1f1f1f, #121212)';
                  e.target.style.borderColor = '#25D366';
                }}
                onMouseLeave={(e) => { 
                  e.target.style.transform = 'translateY(0)'; 
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  e.target.style.background = '#1a1a1a';
                  e.target.style.borderColor = 'rgba(37, 211, 102, 0.6)';
                }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order through whatsapp
              </button>
            </div>

            
          </div>
        </div>
      </section>

      <section id="combos" className="section bg-cream section-padded">
        <div className="container">
          <div className="section-head text-center">
            <h2 className="section-title">Malenadu Exclusive Combos</h2>
            <p className="section-subtitle">The perfect pairing of our finest coffee and spices.</p>
          </div>
          <div className={`products-grid ${comboProducts.length === 1 ? 'single-item' : ''}`}>
            {comboProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart} 
                onBuyNow={handleBuyNow}
                isWishlisted={wishlist.some(w => w.id === product.id)}
                onToggleWishlist={toggleWishlist}
                onImageClick={setFullscreenImage}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '3rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <span style={{ 
                fontSize: '0.85rem', 
                color: '#C8935A', 
                fontWeight: 700, 
                letterSpacing: '1px', 
                fontFamily: 'Inter, sans-serif', 
                textTransform: 'uppercase',
                borderBottom: '1.5px solid rgba(200, 147, 90, 0.4)',
                paddingBottom: '4px',
                marginBottom: '6px',
                textAlign: 'center'
              }}>
                Place your order directly through WhatsApp.
              </span>
              <button 
                onClick={() => window.open('https://api.whatsapp.com/send?phone=918217623335&text=' + encodeURIComponent('Hello Malenadu Roast Co! 👋 I would like to order one of your special combo deals! 🎁'), '_blank')}
                style={{
                  background: '#1a1a1a',
                  color: '#ffffff',
                  border: '1px solid rgba(37, 211, 102, 0.6)',
                  padding: '1rem 2.8rem',
                  borderRadius: '50px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.4s ease',
                  fontSize: '0.95rem',
                  textTransform: 'uppercase',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  letterSpacing: '1.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'Inter, sans-serif'
                }}
                onMouseEnter={(e) => { 
                  e.target.style.transform = 'translateY(-4px)'; 
                  e.target.style.boxShadow = '0 12px 35px rgba(37, 211, 102, 0.35)';
                  e.target.style.background = 'linear-gradient(135deg, #1f1f1f, #121212)';
                  e.target.style.borderColor = '#25D366';
                }}
                onMouseLeave={(e) => { 
                  e.target.style.transform = 'translateY(0)'; 
                  e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                  e.target.style.background = '#1a1a1a';
                  e.target.style.borderColor = 'rgba(37, 211, 102, 0.6)';
                }}
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order through whatsapp
              </button>
            </div>

            
          </div>
        </div>
      </section>

      {/* ——— Coffee Information Section ——— */}
      <CoffeeInfoSection />

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

        <div className="reviews-marquee-container">
          <div className="reviews-marquee">
            {[...customerReviews, ...customerReviews].map((review, i) => (
              <div key={i} className="review-card" style={{ background: '#0F0F0F', borderRadius: '12px', padding: '1.8rem', border: '1px solid #222', display: 'flex', flexDirection: 'column' }}>
                <div className="review-stars" style={{ display: 'flex', gap: '3px', marginBottom: '1.2rem' }}>
                  {[...Array(review.rating)].map((_, idx) => (
                    <Star key={idx} size={14} fill="#D4A870" color="#D4A870" />
                  ))}
                </div>
                
                <div style={{ color: '#D4A870', fontSize: '2.5rem', fontFamily: '"Georgia", serif', lineHeight: 0.5, marginBottom: '0.5rem', opacity: 0.8 }}>
                  &ldquo;
                </div>
                
                <p className="review-text" style={{ color: '#D1D1D1', fontSize: '0.92rem', lineHeight: 1.6, fontFamily: 'Inter, sans-serif', marginBottom: '1.5rem', flexGrow: 1, fontWeight: 300 }}>
                  {review.text}
                </p>
                
                <div className="review-author" style={{ borderTop: '1px solid #2A2A2A', paddingTop: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '36px', height: '36px', borderRadius: '50%', 
                    background: ['#8C001A', '#333333', '#E65100', '#1B5E20', '#4A148C', '#b71c1c'][i % 6],
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 600, fontFamily: 'Inter, sans-serif'
                  }}>
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 600, margin: '0' }}>{review.name}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Premium Bulk Orders Section ——— */}
      <section id="bulk-orders" className="bulk-section-wrap" style={{
        position: 'relative',
        backgroundImage: `url(${TOKENS.images.hero})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 45%',
        backgroundAttachment: 'scroll',
        overflow: 'hidden',
        borderTop: '1px solid rgba(200, 147, 90, 0.25)',
        borderBottom: '1px solid rgba(200, 147, 90, 0.25)'
      }}>
        

        {/* Cinematic Plantation Ambient Overlays */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(5,8,5,0.96) 0%, rgba(8,14,10,0.88) 50%, rgba(5,8,5,0.98) 100%)',
          zIndex: 1
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 15% 20%, rgba(212,168,112,0.15) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(200,147,90,0.12) 0%, transparent 65%)',
          zIndex: 1, pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '80%', height: '60%', background: 'radial-gradient(ellipse at center, rgba(200,147,90,0.06) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="bulk-orders-inner">
            {/* Fine Luxury Golden Filigree Corner Marks */}
            <div className="bulk-corner-mark" style={{ position: 'absolute', top: '24px', left: '24px', width: '28px', height: '28px', borderTop: '2px solid rgba(212, 168, 112, 0.6)', borderLeft: '2px solid rgba(212, 168, 112, 0.6)' }} />
            <div className="bulk-corner-mark" style={{ position: 'absolute', top: '24px', right: '24px', width: '28px', height: '28px', borderTop: '2px solid rgba(212, 168, 112, 0.6)', borderRight: '2px solid rgba(212, 168, 112, 0.6)' }} />
            <div className="bulk-corner-mark" style={{ position: 'absolute', bottom: '24px', left: '24px', width: '28px', height: '28px', borderBottom: '2px solid rgba(212, 168, 112, 0.6)', borderLeft: '2px solid rgba(212, 168, 112, 0.6)' }} />
            <div className="bulk-corner-mark" style={{ position: 'absolute', bottom: '24px', right: '24px', width: '28px', height: '28px', borderBottom: '2px solid rgba(212, 168, 112, 0.6)', borderRight: '2px solid rgba(212, 168, 112, 0.6)' }} />

            {/* Section Head */}
            <div className="bulk-section-head">
              <span style={{ 
                color: '#D4A870', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '6px', 
                textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', display: 'block',
                marginBottom: '2.5rem', opacity: 0.95, textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}>
                WHOLESALE • CAFES • HOTELS • RETAIL • SPICES
              </span>
              
              <div style={{ maxWidth: '850px', margin: '0 auto 1.8rem' }}>
                <h2 style={{
                  fontFamily: '"Georgia", serif', color: '#fff', fontSize: 'clamp(2rem, 4.5vw, 2.8rem)',
                  fontWeight: 700, lineHeight: 1.35, margin: 0, textShadow: '0 4px 20px rgba(0,0,0,0.65)'
                }}>
                  Wholesale Coffee & Pepper<br style={{ display: 'inline' }} />at Estate-Direct Prices
                </h2>
              </div>

              {/* Handcrafted Divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', margin: '2rem auto', maxWidth: '300px' }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,168,112,0.45))' }} />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: 'drop-shadow(0 2px 6px rgba(212,168,112,0.45))' }}>
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14.5c-.8 0-1.5-.2-2.1-.5l6.7-6.7c.3.6.5 1.3.5 2.1-.1 2.8-2.3 5.1-5.1 5.1zm-2.1-7.2c-.3-.6-.5-1.3-.5-2.1 0-2.8 2.3-5.1 5.1-5.1.8 0 1.5.2 2.1.5l-6.7 6.7z" fill="#D4A870" />
                </svg>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,168,112,0.45), transparent)' }} />
              </div>
            </div>

            {/* Immersive Glassmorphic Cards Grid */}
            <div className="bulk-grid-container">
              {[
                {
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4A870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22C12 22 7 17 7 12S12 2 12 2S17 7 17 12S12 22 12 22Z" />
                      <circle cx="12" cy="12" r="2.5" fill="#D4A870" />
                      <circle cx="10" cy="15" r="1.5" fill="#D4A870" />
                      <circle cx="14" cy="9" r="1.5" fill="#D4A870" />
                      <path d="M7 12H3M17 12h4" />
                    </svg>
                  ),
                  title: 'Estate-Grown Quality',
                  desc: 'Directly sourced Arabica, Robusta & authentic spices.'
                },
                {
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4A870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3v18M5 9l7-6 7 6M5 15h14M3 21h18" />
                      <circle cx="12" cy="12" r="3" fill="#D4A870" />
                    </svg>
                  ),
                  title: 'Custom Bulk Solutions',
                  desc: 'Flexible roasting, packaging, and custom grind sizes.'
                },
                {
                  icon: (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D4A870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M16.2 7.8l-2 4.4-4.4 2-2-4.4 4.4-2 2-4.4z" fill="#D4A870" />
                      <circle cx="12" cy="12" r="1.5" fill="none" />
                    </svg>
                  ),
                  title: 'Reliable Nationwide Supply',
                  desc: 'Secure packaging and dependable delivery across India.'
                }
              ].map((benefit, i) => (
                <div key={i} className="bulk-card-premium">
                  {/* Subtle Card Background Shimmer */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, transparent 40%, rgba(212, 168, 112, 0.03) 50%, transparent 60%)',
                    pointerEvents: 'none'
                  }} />

                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'rgba(212, 168, 112, 0.15)',
                    border: '1.5px solid rgba(212, 168, 112, 0.32)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.4rem',
                    boxShadow: '0 8px 24px rgba(212, 168, 112, 0.12)',
                    transition: 'all 0.3s ease'
                  }}>
                    {benefit.icon}
                  </div>
                  
                  <h3 style={{
                    color: '#fff',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginBottom: '0.6rem',
                    fontFamily: '"Georgia", serif',
                    letterSpacing: '0.4px'
                  }}>
                    {benefit.title}
                  </h3>
                  
                  <p style={{
                    color: 'rgba(255,255,255,0.65)',
                    fontSize: '0.94rem',
                    lineHeight: 1.65,
                    margin: 0,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 300,
                    flexGrow: 1
                  }}>
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Luxurious Call to Action & Trust Indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              {/* Button Container with Subtle Ambient Golden Backglow */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: '120%', height: '140%', background: 'radial-gradient(circle, rgba(212, 168, 112, 0.2) 0%, transparent 70%)',
                  filter: 'blur(16px)', pointerEvents: 'none', zIndex: 0
                }} />
                
                <motion.a
                  href="https://forms.gle/wHLjuDn2AZLmNEcDA"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.02, boxShadow: '0 20px 50px rgba(212, 168, 112, 0.45)' }}
                  whileTap={{ scale: 0.98 }}
                  className="bulk-cta-btn"
                >
                  <Package size={22} style={{ flexShrink: 0 }} />
                  <span>Order in Bulk</span>
                  <ArrowRight size={18} style={{ flexShrink: 0 }} />
                </motion.a>
              </div>
              
              {/* Premium Trust Badges Horizontal Row */}
              <div className="bulk-trust-list">
                {[
                  '✔ Estate-grown',
                  '✔ Freshly roasted',
                  '✔ No middlemen',
                  '✔ Delivered across India'
                ].map((text, idx) => (
                  <div key={idx} style={{
                    color: '#E8CA80',
                    fontSize: '0.96rem',
                    fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D4A870" strokeWidth="3" style={{ marginRight: '2px' }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{text.replace('✔ ', '')}</span>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ——— FSSAI Certification Section ——— */}
      <section id="fssai-compliance" className="fssai-section-wrap" style={{
        background: '#18110C', // Luxurious deep coffee-roasted dark brown
        position: 'relative',
        overflow: 'hidden',
        borderTop: '2px solid rgba(200, 169, 106, 0.25)', // Elegant gold top border separator
        borderBottom: '1px solid rgba(200, 147, 90, 0.25)'
      }}>
        {/* Glow ambient background effects */}
        <div style={{
          position: 'absolute', top: '-10%', right: '5%', width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(200, 147, 90, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 1
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '5%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(31, 61, 43, 0.2) 0%, transparent 75%)',
          pointerEvents: 'none', zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="fssai-grid-layout">
            

            {/* Left: Informative Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                <div style={{ width: '25px', height: '1px', background: '#C8935A' }} />
                <span style={{ color: '#C8935A', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
                  Safety & Sourcing Standards
                </span>
              </div>
              <h2 className="fssai-heading" style={{
                fontFamily: '"Georgia", serif',
                color: '#fff',
                fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
                fontWeight: 700,
                lineHeight: 1.25,
                margin: '0 0 1.5rem'
              }}>
                100% Certified for <br />
                <span style={{ color: '#D4A870' }}>Food Safety & Hygiene</span>
              </h2>
              <p className="fssai-desc" style={{
                color: 'rgba(255,255,255,0.65)',
                fontSize: '1.05rem',
                lineHeight: 1.8,
                marginBottom: '2rem',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 300
              }}>
                At Malenadu Roast Co., quality isn't just a promise—it's a certified practice. Our coffee processing and organic pepper selection follow absolute hygiene protocols. Sourced directly from certified heritage estates, every batch undergoes standard grade quality checks to ensure rich aroma, purity, and robust flavor in every bag.
              </p>

              {/* Informative Highlights */}
              <div className="fssai-highlights-list" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem', marginBottom: '2.5rem' }}>
                {[
                  { title: 'Hygienic Processing', desc: 'State-of-the-art roasting and grinding facility monitored for absolute sanitary conditions.' },
                  { title: 'Chemical-Free Selection', desc: 'Peppercorns and coffee beans are sorted naturally without artificial preservatives or additives.' },
                  { title: 'Premium Estate Certification', desc: 'Direct sourcing guarantees trace-origin, standard moisture levels, and clean packaging.' }
                ].map((item, i) => (
                  <div key={i} className="fssai-highlight-item" style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'rgba(232,202,128,0.12)', border: '1px solid rgba(232,202,128,0.3)',
                      color: '#E8CA80', flexShrink: 0, marginTop: '2px'
                    }}>
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '0.98rem', fontWeight: 600, margin: '0 0 0.3rem', fontFamily: 'Inter, sans-serif' }}>{item.title}</h4>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5, fontFamily: 'Inter, sans-serif' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Certificate visual badge & Download */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="fssai-card">
                {/* Certificate Background Marks */}
                <div style={{ position: 'absolute', top: '15px', left: '15px', width: '18px', height: '18px', borderTop: '1.5px solid rgba(212, 168, 112, 0.4)', borderLeft: '1.5px solid rgba(212, 168, 112, 0.4)' }} />
                <div style={{ position: 'absolute', top: '15px', right: '15px', width: '18px', height: '18px', borderTop: '1.5px solid rgba(212, 168, 112, 0.4)', borderRight: '1.5px solid rgba(212, 168, 112, 0.4)' }} />
                <div style={{ position: 'absolute', bottom: '15px', left: '15px', width: '18px', height: '18px', borderBottom: '1.5px solid rgba(212, 168, 112, 0.4)', borderLeft: '1.5px solid rgba(212, 168, 112, 0.4)' }} />
                <div style={{ position: 'absolute', bottom: '15px', right: '15px', width: '18px', height: '18px', borderBottom: '1.5px solid rgba(212, 168, 112, 0.4)', borderRight: '1.5px solid rgba(212, 168, 112, 0.4)' }} />

                <div style={{ textAlign: 'center' }}>
                  {/* FSSAI Badge Logo */}
                  <span style={{
                    color: '#E8CA80',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    fontFamily: 'Inter, sans-serif',
                    display: 'block',
                    marginBottom: '1.2rem'
                  }}>
                    Government of India
                  </span>

                  <div className="fssai-seal-container">
                    <img 
                      src="/assets/images/fssai_logo.webp" 
                      alt="FSSAI Logo" loading="lazy" 
                      style={{ 
                        maxHeight: '92%', 
                        maxWidth: '92%', 
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }} 
                    />
                  </div>

                  <h3 style={{
                    color: '#fff',
                    fontFamily: '"Georgia", serif',
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    marginTop: '2rem',
                    marginBottom: '0.5rem'
                  }}>
                    FSSAI Food Safety License
                  </h3>
                  <p style={{
                    color: '#C8935A',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '1.5px',
                    fontFamily: 'Inter, sans-serif',
                    marginBottom: '2rem'
                  }}>
                    LICENSE NO: 21226177001500
                  </p>

                  {/* Download Button */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <motion.a
                      href="https://drive.google.com/uc?export=download&id=1MT2XvQrX8Ifnzer_lsM5iM8z8SayfJRw"
                      download="Malenadu_Roast_Co_FSSAI_License.pdf"
                      whileHover={{ y: -3, scale: 1.02, boxShadow: '0 15px 30px rgba(200, 147, 90, 0.35)' }}
                      whileTap={{ scale: 0.98 }}
                      className="fssai-download-btn"
                    >
                      <Download size={18} />
                      Download FSSAI License
                    </motion.a>
                  </div>

                  <p style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.72rem',
                    margin: '1rem 0 0',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Food Safety and Standards Authority of India
                  </p>

                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <ChikkamagaluruGallery />

      <section className="section bg-dark text-white text-center features-section">
        <div className="container">
          <motion.h2 
            className="text-white"
            initial={{ opacity: 0, rotateX: -30 }} 
            whileInView={{ opacity: 1, rotateX: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
          >
            Why Choose Us
          </motion.h2>
          <div className="features-grid">
            {[{icon: <Leaf/>, t: 'Farm Sourced'}, {icon: <ShieldCheck/>, t: 'Premium Quality'}, {icon: <Truck/>, t: 'Fast Delivery'}, {icon: <CreditCard/>, t: 'Secure Payment'}].map((f,i) => (
              <Tilt tiltEnable={typeof window !== 'undefined' && window.innerWidth > 768} key={i} tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.05} transitionSpeed={1500} style={{ transformStyle: 'preserve-3d' }}>
                <motion.div 
                  className="feature-item fade-in" 
                  initial={{ opacity: 0, z: -50, rotateY: 30 }}
                  whileInView={{ opacity: 1, z: 0, rotateY: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="feature-icon-wrapper" style={{ transform: "translateZ(30px)" }}>{f.icon}</div>
                  <h4 style={{ transform: "translateZ(20px)" }}>{f.t}</h4>
                </motion.div>
              </Tilt>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="section story-section">
        <div className="container story-container">
          <Tilt tiltEnable={typeof window !== 'undefined' && window.innerWidth > 768} className="story-image" tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.03}>
            <motion.div 
              style={{ width: '100%', height: '100%' }}
              initial={{ opacity: 0, rotateY: -20, x: -50 }}
              whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img loading="lazy" src={TOKENS.images.storyBg} alt="Coffee Plantation" />
            </motion.div>
          </Tilt>
          <motion.div 
            className="story-content"
            initial={{ opacity: 0, scale: 0.9, z: -50 }}
            whileInView={{ opacity: 1, scale: 1, z: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2>Born in the Hills of Malenadu</h2>
            <p>Our products are sourced from one of India's richest coffee and spice regions. Every bean and every peppercorn reflects purity, freshness, and heritage.</p>
          </motion.div>
          <Tilt tiltEnable={typeof window !== 'undefined' && window.innerWidth > 768} className="story-image" tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.03}>
            <motion.div 
              style={{ width: '100%', height: '100%' }}
              initial={{ opacity: 0, rotateY: 20, x: 50 }}
              whileInView={{ opacity: 1, rotateY: 0, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img loading="lazy" src={TOKENS.images.pepperStoryUpload} alt="Malenadu Black Pepper Plantation" style={{ objectFit: 'cover' }} />
            </motion.div>
          </Tilt>
        </div>
      </section>

      <FarmVisitSection />

      <FeedbackSection />

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

          {/* Bottom Grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', maxWidth: '1150px', margin: '0 auto'
          }}>
            {/* Left: Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <img loading="lazy" src={TOKENS.images.logo} alt="Malenadu Roast Co" style={{ height: '100px', width: '100px', borderRadius: '50%', border: '2px solid #C8935A', padding: '2px', background: '#fff', marginBottom: '1.5rem' }} />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', lineHeight: '1.8', maxWidth: '380px', margin: 0 }}>
                Authentic coffee and spices sourced from the hills of Chikkamagaluru. Direct from our estates to your table.
              </p>
            </div>

            {/* Right: Quick Links */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <h4 style={{ color: '#C8935A', fontSize: '1.1rem', fontFamily: '"Georgia", serif', marginBottom: '1.5rem', fontWeight: 600 }}>Quick Links</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Shop Coffee', href: '#coffee' },
                  { label: 'Shop Spices', href: '#pepper' },
                  { label: 'Reviews', href: '#reviews' },
                  { label: 'Our Origin', href: '#process' },
                  { label: 'Visit Our Farm', href: '#visit-us' },
                  { label: 'Bulk Orders', href: '#bulk-orders' },
                  { label: 'FSSAI Verified', href: '#fssai-compliance' },
                ].map((link, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#C8935A', fontWeight: 900, fontSize: '0.9rem' }}>›</span>
                    <a href={link.href} style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.95rem', transition: '0.3s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
                    >{link.label}</a>
                  </li>
                ))}
              </ul>
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
                <span>FSSAI License No: 21226177001500</span>
              </span>
            </div>
            <p>© {new Date().getFullYear()} Malenadu Roast Co. All rights reserved.</p>
          </div>
        </div>
      </footer>
      </>
      )}

    </div>
  );
};

export default App;

