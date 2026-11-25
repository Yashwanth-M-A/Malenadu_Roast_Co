import React, { useState } from 'react';
import { Check, ShoppingBag, ShieldCheck, Truck, ChevronRight } from 'lucide-react';

// Authentic coffee catalog matching the Coffee Section exactly
const COMBO_COFFEES = [
  {
    id: 1,
    name: 'Malenadu Estate Reserve',
    badge: 'Signature 70:30',
    tag: 'Traditional Degree Filter Coffee',
    weights: [
      { label: '500g', price: 469, image: '/assets/images/estate_reserve_front.jpg' },
      { label: '1kg', price: 874, image: '/assets/images/estate_reserve_front.jpg' }
    ]
  },
  {
    id: 3,
    name: 'Imperial Heritage Reserve',
    badge: 'Heritage 85:15',
    tag: 'Dark Roast Filter Coffee',
    weights: [
      { label: '500g', price: 579, image: '/assets/images/imperial_heritage_front.jpg' },
      { label: '1kg', price: 1084, image: '/assets/images/imperial_heritage_front.jpg' }
    ]
  },
  {
    id: 4,
    name: 'Peaberry Grand Cru Royale',
    badge: 'Rare Single Pearl',
    tag: 'Dense Estate Peaberry Roast',
    weights: [
      { label: '500g', price: 709, image: '/assets/images/peaberry_grand_cru_front.jpg' },
      { label: '1kg', price: 1354, image: '/assets/images/peaberry_grand_cru_front.jpg' }
    ]
  },
  {
    id: 2,
    name: 'Highland Signature Reserve',
    badge: '100% Arabica',
    tag: 'High-Elevation Medium Roast',
    weights: [
      { label: '500g', price: 529, image: '/assets/images/highland_signature_front.jpg' },
      { label: '1kg', price: 984, image: '/assets/images/highland_signature_front.jpg' }
    ]
  },
  {
    id: 16,
    name: 'Malenadu Signature Beans',
    badge: '100% Whole Beans',
    tag: 'Whole Roasted Coffee Beans',
    weights: [
      { label: '500g', price: 739, image: '/assets/images/signature_beans_front.jpg' },
      { label: '1kg', price: 1404, image: '/assets/images/signature_beans_front.jpg' }
    ]
  }
];

// Authentic pepper catalog matching the Pepper Section exactly
const COMBO_PEPPERS = [
  {
    id: 'p250',
    name: 'Tellicherry Black Pepper',
    badge: 'TGSEB Unpolished',
    weight: '250g',
    desc: 'Kitchen Standard Pouch',
    price: 319,
    image: '/assets/images/pepper_reserve_front.jpg'
  },
  {
    id: 'p500',
    name: 'Tellicherry Black Pepper',
    badge: 'TGSEB Unpolished',
    weight: '500g',
    desc: 'Culinary Pantry Pack',
    price: 649,
    image: '/assets/images/pepper_reserve_front.jpg'
  },
  {
    id: 'p1000',
    name: 'Tellicherry Black Pepper',
    badge: 'TGSEB Bold 1kg',
    weight: '1kg',
    desc: 'Annual Harvest Bag',
    price: 1229,
    image: '/assets/images/pepper_reserve_front.jpg'
  }
];

export const CustomComboBuilder = ({ onAddToCart, onBuyNow }) => {
  // Selection State
  const [selectedCoffeeId, setSelectedCoffeeId] = useState(3); // Imperial Heritage
  const [coffeeWeightIndex, setCoffeeWeightIndex] = useState(0); // 500g
  const [selectedPepperId, setSelectedPepperId] = useState('p250'); // 250g
  const [addedNotice, setAddedNotice] = useState(false);

  // Active selections
  const activeCoffee = COMBO_COFFEES.find(c => c.id === selectedCoffeeId) || COMBO_COFFEES[0];
  const activeCoffeeVariant = activeCoffee.weights[coffeeWeightIndex] || activeCoffee.weights[0];
  const activePepper = COMBO_PEPPERS.find(p => p.id === selectedPepperId) || COMBO_PEPPERS[0];

  // Pricing calculations
  const coffeePrice = activeCoffeeVariant.price;
  const pepperPrice = activePepper.price;
  const originalTotal = coffeePrice + pepperPrice;

  // 5% Combo Discount
  const discountAmount = Math.round(originalTotal * 0.05);
  const comboPrice = originalTotal - discountAmount;
  const isFreeDelivery = activeCoffeeVariant.label === '1kg' || comboPrice >= 799;

  // Build Cart Payload
  const getPayload = () => {
    const comboName = `Custom Combo: ${activeCoffee.name} + Tellicherry Pepper`;
    const weightLabel = `${activeCoffeeVariant.label} Coffee + ${activePepper.weight} Pepper`;
    const desc = `${activeCoffee.name} (${activeCoffeeVariant.label}) paired with ${activePepper.name} (${activePepper.weight}). Includes 5% bundle discount. Dual-sealed in aroma barrier pouches.`;

    return {
      id: `custom_combo_${activeCoffee.id}_${activeCoffeeVariant.label}_${activePepper.id}_${Date.now()}`,
      name: comboName,
      price: String(comboPrice),
      weight: weightLabel,
      image: activeCoffeeVariant.image,
      description: desc,
      details: desc,
      isCustomCombo: true,
      specs: {
        coffee: `${activeCoffee.name} (${activeCoffeeVariant.label})`,
        pepper: `${activePepper.name} (${activePepper.weight})`,
        savings: `Saved ₹${discountAmount} with 5% Combo Discount`
      }
    };
  };

  const handleAdd = () => {
    if (onAddToCart) onAddToCart(getPayload());
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuy = () => {
    if (onBuyNow) onBuyNow(getPayload());
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto 3rem auto' }}>
      {/* Intro Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '0 1rem'
      }}>
        <div style={{
          display: 'inline-block',
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#8C6239',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          marginBottom: '6px'
        }}>
          Custom Pair Studio
        </div>
        <h3 style={{
          margin: '0 0 8px 0',
          fontFamily: 'Georgia, serif',
          fontSize: '1.75rem',
          color: '#1A1A1A',
          fontWeight: 700
        }}>
          Choose Your Custom Combo
        </h3>
        <p style={{
          margin: 0,
          color: '#666666',
          fontSize: '0.9rem',
          maxWidth: '580px',
          marginInline: 'auto',
          lineHeight: '1.5'
        }}>
          Select 1 coffee roast and 1 pepper size below. A 5% bundle discount is automatically applied to your custom pair.
        </p>
      </div>

      {/* STEP 1: CHOOSE COFFEE */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #EBE5DB',
          paddingBottom: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#4A3525',
              color: '#FFFFFF',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              1
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Coffee Roast
            </span>
          </div>

          <span style={{ fontSize: '0.78rem', color: '#8C6239', fontWeight: 600 }}>
            Selected: <strong>{activeCoffee.name} ({activeCoffeeVariant.label})</strong>
          </span>
        </div>

        {/* Coffee Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {COMBO_COFFEES.map(coffee => {
            const isSelected = selectedCoffeeId === coffee.id;
            const currentVariant = isSelected
              ? (coffee.weights[coffeeWeightIndex] || coffee.weights[0])
              : coffee.weights[0];

            return (
              <div
                key={coffee.id}
                onClick={() => setSelectedCoffeeId(coffee.id)}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? '2px solid #8C6239' : '1px solid #EBE5DB',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 16px rgba(140, 98, 57, 0.12)' : '0 1px 4px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Active Selection Badge */}
                {isSelected && (
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#8C6239',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Check size={11} strokeWidth={3} /> Selected
                  </span>
                )}

                {/* Product Image Stage (matching Coffee section exactly) */}
                <div style={{
                  background: '#F9F7F4',
                  borderRadius: '8px',
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  overflow: 'hidden'
                }}>
                  <img
                    src={currentVariant.image}
                    alt={coffee.name}
                    style={{
                      maxHeight: '160px',
                      maxWidth: '90%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '2px solid #000000',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.14)'
                    }}
                  />
                </div>

                {/* Info & Title */}
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#8C6239', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {coffee.badge}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '4px', lineHeight: '1.3' }}>
                    {coffee.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#666666', marginBottom: '0.75rem' }}>
                    {coffee.tag}
                  </div>

                  {/* Weight Toggle Pills */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
                    {coffee.weights.map((w, idx) => {
                      const isWeightActive = isSelected && coffeeWeightIndex === idx;
                      return (
                        <button
                          key={w.label}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCoffeeId(coffee.id);
                            setCoffeeWeightIndex(idx);
                          }}
                          style={{
                            flex: 1,
                            padding: '4px 6px',
                            borderRadius: '6px',
                            border: isWeightActive ? '1.5px solid #8C6239' : '1px solid #CBD5E1',
                            background: isWeightActive ? '#FAF6F0' : '#FFFFFF',
                            color: isWeightActive ? '#4A3525' : '#64748B',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {w.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selection Action Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedCoffeeId(coffee.id)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: isSelected ? 'none' : '1px solid #CBD5E1',
                      background: isSelected ? '#4A3525' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#1A1A1A',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {isSelected ? <Check size={14} /> : null}
                    <span>{isSelected ? 'Coffee Selected' : 'Select Coffee'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: CHOOSE PEPPER */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #EBE5DB',
          paddingBottom: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              background: '#4A3525',
              color: '#FFFFFF',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              2
            </span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Black Pepper Pack
            </span>
          </div>

          <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600 }}>
            Selected: <strong>{activePepper.name} ({activePepper.weight})</strong>
          </span>
        </div>

        {/* Pepper Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {COMBO_PEPPERS.map(pepper => {
            const isSelected = selectedPepperId === pepper.id;

            return (
              <div
                key={pepper.id}
                onClick={() => setSelectedPepperId(pepper.id)}
                style={{
                  background: '#FFFFFF',
                  border: isSelected ? '2px solid #166534' : '1px solid #EBE5DB',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 16px rgba(22, 101, 52, 0.12)' : '0 1px 4px rgba(0,0,0,0.02)',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {/* Active Selection Badge */}
                {isSelected && (
                  <span style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#166534',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Check size={11} strokeWidth={3} /> Selected
                  </span>
                )}

                {/* Product Image Stage (matching Pepper section exactly) */}
                <div style={{
                  background: '#F9F7F4',
                  borderRadius: '8px',
                  height: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0.75rem',
                  overflow: 'hidden'
                }}>
                  <img
                    src={pepper.image}
                    alt={pepper.name}
                    style={{
                      maxHeight: '160px',
                      maxWidth: '90%',
                      objectFit: 'contain',
                      borderRadius: '8px',
                      border: '2px solid #000000',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.14)'
                    }}
                  />
                </div>

                {/* Info & Title */}
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {pepper.badge}
                  </div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '4px', lineHeight: '1.3' }}>
                    {pepper.name} ({pepper.weight})
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#666666', marginBottom: '0.75rem' }}>
                    {pepper.desc}
                  </div>

                  {/* Selection Action Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedPepperId(pepper.id)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: isSelected ? 'none' : '1px solid #CBD5E1',
                      background: isSelected ? '#166534' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#1A1A1A',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    {isSelected ? <Check size={14} /> : null}
                    <span>{isSelected ? 'Pepper Selected' : 'Select Pepper'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 3: CLEAN SUMMARY & INSTANT CHECKOUT BAR */}
      <div style={{
        background: '#FAF7F2',
        border: '1.5px solid #E8CA80',
        borderRadius: '14px',
        padding: '1.5rem',
        boxShadow: '0 4px 18px rgba(74, 53, 37, 0.08)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'center'
        }}>
          {/* Left: Dual Product Thumbnails */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '4px',
              width: '74px',
              height: '74px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <img
                src={activeCoffeeVariant.image}
                alt={activeCoffee.name}
                style={{ maxHeight: '62px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px', border: '1px solid #000000' }}
              />
            </div>

            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#8C6239' }}>+</span>

            <div style={{
              background: '#FFFFFF',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '4px',
              width: '74px',
              height: '74px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <img
                src={activePepper.image}
                alt={activePepper.name}
                style={{ maxHeight: '62px', maxWidth: '100%', objectFit: 'contain', borderRadius: '4px', border: '1px solid #000000' }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#8C6239', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Your Custom Combo
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.96rem', color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeCoffee.name} ({activeCoffeeVariant.label}) + {activePepper.name} ({activePepper.weight})
              </div>
              <div style={{ fontSize: '0.74rem', color: '#666666', marginTop: '2px' }}>
                Dual-sealed fresh harvest pouches &bull; 5% discount applied
              </div>
            </div>
          </div>

          {/* Right: Pricing & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1.25rem', flexWrap: 'wrap' }}>
            {/* Price display */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.65rem', fontWeight: 900, color: '#1A1A1A', fontFamily: 'monospace' }}>
                  ₹{comboPrice}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                  ₹{originalTotal}
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#166534', marginTop: '2px' }}>
                You Save ₹{discountAmount} (5% Bundle Savings) &bull; Incl. 5% GST
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleAdd}
                style={{
                  background: '#FFFFFF',
                  color: '#4A3525',
                  border: '1.5px solid #4A3525',
                  padding: '0.65rem 1.1rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShoppingBag size={15} />
                <span>Add Combo to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleBuy}
                style={{
                  background: '#4A3525',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(74, 53, 37, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Buy Combo Now</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Alert if added to cart */}
        {addedNotice && (
          <div style={{
            marginTop: '1rem',
            background: '#DCFCE7',
            border: '1px solid #86EFAC',
            color: '#166534',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textAlign: 'center'
          }}>
            Custom Combo successfully added to your cart.
          </div>
        )}

        {isFreeDelivery && (
          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px dashed #E2D7C5',
            fontSize: '0.74rem',
            color: '#166534',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Truck size={14} />
            <span>Eligible for 100% Free Express Shipping across India</span>
          </div>
        )}
      </div>
    </div>
  );
};
