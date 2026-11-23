// Centralized Products & Inventory Store for Malenadu Roast Co.
// Enriched with comprehensive specialty coffee roastery specifications,
// step-by-step brewing guides, and exhaustive customer FAQs.

export const DEFAULT_COFFEE_PRODUCTS = [
  {
    id: 1,
    name: 'Malenadu Estate Reserve',
    description: 'Rooted in Tradition, Crafted for Today',
    details: 'Voted as our signature filter coffee blend for everyday morning brewing. A smooth, aromatic, and perfectly balanced cup crafted from carefully selected estate-grown beans from the hills of Chikkamagaluru.',
    rating: 4.6,
    reviews: 124,
    badge: 'Signature 70:30',
    image: '/assets/images/estate_reserve_front.jpg',
    images: [
      '/assets/images/estate_reserve_front.jpg',
      '/assets/images/estate_reserve_back.jpg',
      '/assets/images/estate_reserve_duo.jpg'
    ],
    variants: [
      { weight: '500g', price: '449', image: '/assets/images/estate_reserve_front.jpg', backImage: '/assets/images/estate_reserve_back.jpg' },
      { weight: '1kg', price: '839', image: '/assets/images/estate_reserve_front.jpg', backImage: '/assets/images/estate_reserve_back.jpg' }
    ],
    specs: {
      roast: 'Medium-Dark Roast (Full City)',
      blend: '70% Single-Estate Coffee : 30% Roasted Chicory',
      origin: 'Hills of Chikkamagaluru, Karnataka',
      elevation: '1,150m – 1,350m MSL',
      process: 'Washed & Patio Sun-Dried on Estate Beds',
      grind: 'Medium-Fine Filter Grind (Ready for Stainless Steel Filter & French Press)',
      flavorNotes: 'Dark Cocoa, Roasted Hazelnut, Caramelized Jaggery, Crema',
      body: 'Full, Velvety & Dense',
      acidity: 'Low & Balanced (Zero Harsh Sourness)'
    },
    whySpecial: 'The iconic 70:30 traditional South Indian filter coffee blend. 70% shade-grown Arabica and Robusta deliver an intense coffee aroma and natural punch, while 30% roasted chicory adds deep syrupy thickness, caramel sweetness, and holds a strong golden decoction head when mixed with hot boiled milk.',
    brewingGuide: {
      title: 'Traditional South Indian Filter Decoction',
      equipment: 'Stainless Steel South Indian Drip Filter or French Press',
      ratio: '2.5 tablespoons (approx. 15g) powder for 100ml boiling water',
      brewTime: '10–12 minutes dripping time',
      steps: [
        'Add 2 to 3 tablespoons of Malenadu Estate Reserve powder into the top chamber of your stainless steel filter.',
        'Gently place the umbrella plunger disc over the powder (do not press too firmly to allow even water saturation).',
        'Pour 100ml of freshly boiled water (93°C) over the plunger disc and firmly close the top lid.',
        'Allow 10–12 minutes for the thick, aromatic decoction to drip into the bottom receiver cup.',
        'Pour 1/3 cup of thick decoction into your tumbler/davarah, add 2/3 cup of hot frothed milk and sugar or jaggery to taste. Pour back and forth from a height to produce rich golden crema!'
      ]
    },
    faqs: [
      {
        q: 'Is this instant coffee or brewable ground coffee?',
        a: 'This is 100% authentic ground filter coffee powder, NOT instant powder. It contains no artificial additives or soluble chemicals. It must be brewed with hot water using a traditional South Indian filter or a French press to extract fresh, rich decoction.'
      },
      {
        q: 'Why does this blend contain 30% chicory?',
        a: 'In traditional South Indian degree filter coffee, the 70:30 ratio is celebrated for its thick, viscous decoction and rich caramel sweetness, ensuring the coffee never thins out when mixed with hot boiled milk.'
      },
      {
        q: 'Do I need a coffee machine to brew this?',
        a: 'Not at all! A simple, inexpensive 2-cup stainless steel South Indian drip filter (available in any local vessel store) or a French press brews this coffee to perfection.'
      },
      {
        q: 'How many cups can I make from a 500g pack?',
        a: 'A 500g pack yields approximately 45 to 50 cups of strong, authentic filter coffee (using 10g–12g per cup).'
      },
      {
        q: 'What is the shelf life and packaging?',
        a: 'The coffee has a shelf life of 9 months from roast date. It is packaged in a multi-layered food-grade foil pouch with a one-way aroma degassing valve to keep the essential roasted oils fresh.'
      }
    ]
  },
  {
    id: 2,
    name: 'Highland Signature Reserve',
    description: 'Born in the Highlands, Roasted to Perfection',
    details: 'Sourced from the misty highlands of the Western Ghats and roasted with care to deliver a refined cup with exceptional aroma, floral character, and balanced sweetness.',
    rating: 4.4,
    reviews: 89,
    badge: 'Highland 80:20',
    image: '/assets/images/highland_signature_front.jpg',
    images: [
      '/assets/images/highland_signature_front.jpg',
      '/assets/images/highland_signature_back.jpg',
      '/assets/images/highland_signature_duo.jpg'
    ],
    variants: [
      { weight: '500g', price: '509', image: '/assets/images/highland_signature_front.jpg', backImage: '/assets/images/highland_signature_back.jpg' },
      { weight: '1kg', price: '949', image: '/assets/images/highland_signature_front.jpg', backImage: '/assets/images/highland_signature_back.jpg' }
    ],
    specs: {
      roast: 'Medium Roast',
      blend: '80% High-Altitude Estate Coffee : 20% Roasted Chicory',
      origin: 'Highland Estate, Hills of Chikkamagaluru, Karnataka',
      elevation: '1,250m – 1,420m MSL',
      process: 'Fully Washed & Patio Sun-Dried',
      grind: 'Medium-Fine Filter Grind',
      flavorNotes: 'Milk Chocolate, Wild Honey, Delicately Spiced, Floral Finish',
      body: 'Medium-Full & Smooth',
      acidity: 'Mild & Crisp'
    },
    whySpecial: 'Crafted with the classic 80:20 golden ratio preferred by coffee lovers seeking the perfect harmony between high-altitude coffee aromatics and smooth mouthfeel. 80% shade-grown Arabica and Robusta provide rich cocoa character, rounded off by 20% roasted chicory.',
    brewingGuide: {
      title: 'South Indian Filter or Pour-Over Drip',
      equipment: 'South Indian Filter, French Press, or Aeropress',
      ratio: '2 to 3 tablespoons for 100ml water',
      brewTime: '8–10 minutes extraction',
      steps: [
        'Add 2.5 tablespoons of Highland Signature into your filter upper chamber.',
        'Gently insert the plunger disc without compacting the grounds.',
        'Pour 100ml water just off the boil (92°C) and cover.',
        'Allow 10 minutes for the fragrant golden decoction to filter through.',
        'Combine with hot milk (60:40 milk to decoction ratio) or enjoy as a rich black Americano.'
      ]
    },
    faqs: [
      {
        q: 'How is this different from Estate Reserve?',
        a: 'Highland Signature features the 80:20 golden ratio with a medium roast, offering a brighter coffee-forward aroma compared to the traditional 70:30 Estate Reserve. It brings out delicate aromatic floral and honey notes with a cleaner finish, whereas Estate Reserve is bolder and heavier on dark chocolate notes.'
      },
      {
        q: 'Can this coffee be had black?',
        a: 'Yes, because of the balanced 20% chicory and medium roast profile, Highland Signature brews a remarkably smooth cup with sweet honey and cocoa notes.'
      },
      {
        q: 'How should I store this after opening?',
        a: 'Keep the coffee in its original zip-lock pouch or transfer to an airtight, opaque container in a cool, dry pantry away from direct sunlight.'
      }
    ]
  },
  {
    id: 12,
    name: 'Imperial Heritage Reserve',
    description: 'An Heirloom of Flavor and Craftsmanship',
    details: 'A bold, full-bodied dark-roast reserve crafted for purists of traditional South Indian degree filter coffee. Delivers an intensely aromatic, thick decoction that cuts effortlessly through heavy boiled milk.',
    rating: 4.7,
    reviews: 96,
    badge: 'Heritage 85:15',
    image: '/assets/images/imperial_heritage_front.jpg',
    images: [
      '/assets/images/imperial_heritage_front.jpg',
      '/assets/images/imperial_heritage_back.jpg',
      '/assets/images/imperial_heritage_duo.jpg'
    ],
    variants: [
      { weight: '500g', price: '559', image: '/assets/images/imperial_heritage_front.jpg', backImage: '/assets/images/imperial_heritage_back.jpg' },
      { weight: '1kg', price: '1049', image: '/assets/images/imperial_heritage_front.jpg', backImage: '/assets/images/imperial_heritage_back.jpg' }
    ],
    specs: {
      roast: 'Dark Roast (Vienna Roast)',
      blend: '85% Premium Single-Estate Coffee : 15% Roasted Chicory',
      origin: 'Hills of Chikkamagaluru, Karnataka',
      elevation: '1,100m – 1,300m MSL',
      process: 'Natural Sun-Dried & Washed',
      grind: 'Medium-Fine Traditional Grind',
      flavorNotes: 'Bittersweet Dark Chocolate, Toasted Almond, Heavy Crema, Roasted Malt',
      body: 'Extra Heavy, Syrupy & Viscous',
      acidity: 'Near Zero Acidity'
    },
    whySpecial: 'An heirloom reserve for discerning coffee lovers who prefer a coffee-dominated cup. With 85% premium estate beans and only 15% chicory, it highlights pure mountain coffee aromatics, toasted almond, and bittersweet dark chocolate notes with just enough chicory for traditional filter coffee depth.',
    brewingGuide: {
      title: 'Authentic South Indian Degree Filter Brewing',
      equipment: 'Traditional Stainless Steel or Brass Filter',
      ratio: '3 tablespoons (approx. 18g) for 90ml boiling water',
      brewTime: '12–15 minutes slow extraction',
      steps: [
        'Add 3 full tablespoons of Imperial Heritage into the filter upper compartment.',
        'Place the tamper plate on top with a light press to level the surface.',
        'Pour 90ml of rolling boiling water into the filter and cover.',
        'Allow 12–15 minutes for the dense, thick first-degree decoction to drop.',
        'Mix 1 part decoction with 2 parts piping-hot boiled milk and raw cane sugar. Froth vigorously in a brass davarah tumbler for the authentic cafe degree coffee head!'
      ]
    },
    faqs: [
      {
        q: 'Who is this 85:15 blend recommended for?',
        a: 'If you appreciate an artisanal, coffee-forward cup where the natural single-estate coffee bean aromatics take center stage, with a delicate 15% chicory touch for authentic body, Imperial Heritage is the premier choice.'
      },
      {
        q: 'Can I extract a second decoction from the same grounds?',
        a: 'Yes! After extracting your first thick decoction, you can pour another 60ml of hot water for a lighter second extraction (ideal for an afternoon cup).'
      },
      {
        q: 'Does it taste bitter?',
        a: 'It has a rich, bittersweet dark chocolate roast profile with zero charred bitterness. The chicory adds sweetness that balances the dark roasted coffee beautifully.'
      }
    ]
  },
  {
    id: 14,
    name: 'Peaberry Grand Cru Royale',
    description: 'Rare. Refined. Remarkable.',
    details: 'Our flagship 100% pure single-origin Peaberry specialty coffee. Naturally sweet, dense, and extraordinarily aromatic with zero chicory.',
    rating: 4.6,
    reviews: 82,
    badge: '100% Pure Peaberry',
    image: '/assets/images/peaberry_grand_cru_front.jpg',
    images: [
      '/assets/images/peaberry_grand_cru_front.jpg',
      '/assets/images/peaberry_grand_cru_back.jpg',
      '/assets/images/peaberry_grand_cru_duo.webp'
    ],
    variants: [
      { weight: '500g', price: '689', image: '/assets/images/peaberry_grand_cru_front.jpg', backImage: '/assets/images/peaberry_grand_cru_back.jpg' },
      { weight: '1kg', price: '1319', image: '/assets/images/peaberry_grand_cru_front.jpg', backImage: '/assets/images/peaberry_grand_cru_back.jpg' }
    ],
    specs: {
      roast: 'Medium-Dark (City+) Roast',
      blend: '100% Pure Single-Origin Arabica Peaberry (0% Chicory)',
      origin: 'High-Peak Estate Block, Hills of Chikkamagaluru, Karnataka',
      elevation: '1,300m – 1,480m MSL',
      process: 'Hand-Sorted, Washed & Patio Sun-Dried',
      grind: 'Medium-Fine Filter Grind (Custom Whole Bean on request)',
      flavorNotes: 'Ripe Red Berries, Dark Cocoa, Toasted Hazelnut, Winey Finish',
      body: 'Silky, Elegant & Rounded',
      acidity: 'Bright, Sweet & Lively'
    },
    whySpecial: 'Coffee cherries normally grow two flat beans facing each other. In only 5% of cherries, nature forms a single round oval bead called a "Peaberry". Because the tree channels all its nutrients and sugars into a single seed, Peaberry roasts more evenly, yielding remarkable natural sweetness, low bitterness, and intense aromatics.',
    brewingGuide: {
      title: 'Versatile Brewing: Black Coffee or Pure Filter Decoction',
      equipment: 'Pour-Over (V60), French Press, Aeropress, Moka Pot, or South Indian Filter',
      ratio: '1:15 ratio (15g coffee for 225ml water for pour-over / press)',
      brewTime: '3.5 to 4 minutes extraction',
      steps: [
        'For Pour-Over / French Press: Add 15g ground Peaberry.',
        'Pour 50ml hot water (92°C) and let it bloom for 30 seconds to release floral aromatics.',
        'Pour remaining 175ml water in gentle concentric circles.',
        'For Traditional Filter: Use 2 tablespoons, brew 80ml water, and enjoy black or with a splash of milk.'
      ]
    },
    faqs: [
      {
        q: 'Does this contain any chicory?',
        a: 'No. 0% chicory. Peaberry Grand Cru Royale is 100% pure single-origin specialty coffee with no chicory whatsoever.'
      },
      {
        q: 'Can I drink this as black coffee?',
        a: 'Yes, absolutely! Because of its natural bean sweetness, rounded fruit notes, and low bitterness, Peaberry Grand Cru is magnificent as a black pour-over, French press, Americano, or iced coffee.'
      },
      {
        q: 'Why is peaberry more expensive than regular blends?',
        a: 'Peaberry constitutes only ~5% of an entire harvest and requires labor-intensive manual sorting through specialized sieve screens to separate the round beans from flat beans.'
      }
    ]
  },
  {
    id: 16,
    name: 'Malenadu Signature Beans',
    description: 'Freshly roasted for the perfect grind',
    details: 'Whole roasted coffee beans crafted for coffee lovers who prefer grinding fresh at home. Ideal for espresso, pour-over, French press, and customized drip brews.',
    rating: 4.8,
    reviews: 180,
    badge: '100% Whole Beans',
    image: '/assets/images/signature_beans_front.jpg',
    images: [
      '/assets/images/signature_beans_front.jpg',
      '/assets/images/signature_beans_back.jpg',
      '/assets/images/signature_beans_duo.jpg'
    ],
    variants: [
      { weight: '500g', price: '719', image: '/assets/images/signature_beans_front.jpg', backImage: '/assets/images/signature_beans_back.jpg' },
      { weight: '1kg', price: '1369', image: '/assets/images/signature_beans_front.jpg', backImage: '/assets/images/signature_beans_back.jpg' }
    ],
    specs: {
      roast: 'Medium-Dark Roast',
      blend: '100% Whole Roasted Coffee Beans (Grade-A Arabica & Robusta | 0% Chicory)',
      origin: 'Hills of Chikkamagaluru, Karnataka',
      elevation: '1,200m – 1,400m MSL',
      process: 'Washed & Slow Patio Sun-Dried',
      grind: 'Whole Bean (Un-ground, ready for home coffee grinders)',
      flavorNotes: 'Caramel, Dark Chocolate, Toasted Walnut, Thick Crema',
      body: 'Full, Creamy & Balanced',
      acidity: 'Low & Gentle'
    },
    whySpecial: 'Grinding your coffee beans just 60 seconds before brewing locks in up to 90% more volatile aromatic oils compared to pre-ground coffee. These whole roasted beans deliver peak crema on espresso machines and maximum clarity in manual drippers.',
    brewingGuide: {
      title: 'Grind Settings & Brewing Guide',
      equipment: 'Espresso Machine, Moka Pot, Aeropress, French Press, or Pour-Over',
      ratio: 'Grind to order: Fine for Espresso, Medium for Drip/Filter, Coarse for French Press',
      brewTime: 'Depends on equipment (25s for Espresso, 4m for French Press)',
      steps: [
        'For Espresso: Grind fine (table salt texture), use 18g for a 36g double shot extracted in 25–30 seconds.',
        'For French Press: Grind coarse (sea salt texture), steep 4 minutes in 93°C water, then press.',
        'For South Indian Filter: Grind medium-fine for clean, steady decoction dripping.'
      ]
    },
    faqs: [
      {
        q: 'Do I need a coffee grinder to buy this?',
        a: 'Yes. These are whole roasted beans. You will need a manual hand grinder or an electric burr grinder to grind them at home.'
      },
      {
        q: 'Can you pre-grind it for me if I order this?',
        a: 'If you want pre-ground coffee, we recommend our Malenadu Estate Reserve (70:30), Highland Signature (80:20), or Peaberry Grand Cru (100% Pure) which are already precision-ground to perfection for filters.'
      },
      {
        q: 'How long do whole beans stay fresh?',
        a: 'Whole beans retain their peak aromatic oils for up to 9 months sealed, and 60 days after opening when stored in an airtight container.'
      }
    ]
  }
].map(p => ({
  ...p,
  category: 'coffee',
  stock: p.stock !== undefined ? p.stock : 45,
  outOfStock: p.outOfStock !== undefined ? p.outOfStock : false
}));

export const DEFAULT_PEPPER_PRODUCTS = [
  {
    id: 4,
    name: 'Malenadu Pepper Reserve',
    description: 'Bold, Sharp, and Naturally Superior',
    details: 'Sourced from shade-canopy trees in the hills of Chikkamagaluru. Handpicked Tellicherry bold peppercorns, 100% naturally sun-dried with zero chemical polish, zero mineral oils, and exceptional natural piperine heat.',
    rating: 4.9,
    reviews: 210,
    badge: 'Tellicherry Bold',
    image: '/assets/images/pepper_reserve_front.jpg',
    images: [
      '/assets/images/pepper_reserve_front.jpg',
      '/assets/images/pepper_reserve_back.jpg',
      '/assets/images/malenadu_full_lineup.jpg'
    ],
    variants: [
      { weight: '250g', price: '319', image: '/assets/images/pepper_reserve_front.jpg', backImage: '/assets/images/pepper_reserve_back.jpg' },
      { weight: '500g', price: '609', image: '/assets/images/pepper_reserve_front.jpg', backImage: '/assets/images/pepper_reserve_back.jpg' },
      { weight: '1kg', price: '1159', image: '/assets/images/pepper_reserve_front.jpg', backImage: '/assets/images/pepper_reserve_back.jpg' }
    ],
    specs: {
      grade: 'Tellicherry Garbled Special Extra Bold (TGSEB)',
      size: '4.75mm+ (Plump, heavy, unbroken whole peppercorns)',
      process: '100% Sun-Dried on Clean Raised Estate Beds | 0% Chemical Polish',
      origin: 'Shade-Tree Canopy, Hills of Chikkamagaluru, Karnataka',
      piperine: 'High Natural Piperine (>5.5%) with Intense Volatile Oils',
      flavorNotes: 'Sharp Piquant Heat, Warm Woody Undertones, Citrusy Floral Aroma',
      additives: 'Zero Mineral Oil, Zero Paraffin Wax, Zero Artificial Dye'
    },
    whySpecial: 'Supermarket black pepper is frequently polished with mineral oil or paraffin wax to produce an artificial shiny black appearance. Malenadu Pepper Reserve is 100% authentic, unpolished, and naturally cured in the sun on our estate. Its wrinkled matte skin preserves natural piperine and essential oils that explode with aroma when freshly crushed.',
    brewingGuide: {
      title: 'Culinary Uses & Storage Recommendation',
      equipment: 'Pepper Mill / Mortar & Pestle',
      ratio: 'Grind freshly over food for maximum volatile flavor and health benefits',
      steps: [
        'Store whole peppercorns in an airtight ceramic or glass jar in a cool, dark cabinet.',
        'Crush coarsely in a mortar and pestle for traditional Karnataka rasam, menasina saaru, and South Indian pongal.',
        'Grind fine in a table mill over fried eggs, creamy pasta, steaks, and roasted vegetables.'
      ]
    },
    faqs: [
      {
        q: 'Is this pepper polished with mineral oil?',
        a: 'Never. Commercial pepper often uses mineral oil for cosmetic gloss. Our pepper is 100% unpolished, chemical-free, and sun-dried straight from our canopy harvest.'
      },
      {
        q: 'How does Tellicherry Extra Bold differ from regular black pepper?',
        a: 'Tellicherry peppercorns are left on the vine longer to fully mature into plump red berries before picking. This gives them a larger diameter (4.75mm+), significantly higher natural piperine content, and a much more complex, aromatic heat.'
      },
      {
        q: 'How long can I store whole black pepper?',
        a: 'Whole peppercorns preserve their volatile oils and sharpness for over 12 months when stored in an airtight container away from moisture and direct sunlight.'
      }
    ]
  },
  {
    id: 99,
    name: 'Tellicherry Pepper (Payment Verification Pack)',
    description: '500g Estate Sample • Special ₹8 Live Gateway Verification',
    details: 'Pure Tellicherry sun-dried bold black pepper (500g). Configured for live Razorpay payment gateway verification with ₹0 delivery charge.',
    rating: 5.0,
    reviews: 99,
    badge: '₹8 Payment Test',
    image: '/assets/images/pepper_reserve_front.jpg',
    images: [
      '/assets/images/pepper_reserve_front.jpg',
      '/assets/images/pepper_reserve_back.jpg'
    ],
    variants: [
      { weight: '500g', price: '8', image: '/assets/images/pepper_reserve_front.jpg', backImage: '/assets/images/pepper_reserve_back.jpg' }
    ],
    freeShipping: true,
    specs: {
      grade: 'Tellicherry Whole Black Pepper (TGSEB)',
      pack: '500g Artisan Pack',
      price: '₹8.00 (5% GST Included)',
      delivery: '100% FREE Delivery (₹0 Delivery Charge)',
      purpose: 'Live Razorpay Payment Verification'
    },
    whySpecial: 'Handcrafted estate black pepper sample pack created strictly to test and verify live payment processing with an ₹8 charge and 100% free delivery.',
    faqs: [
      {
        q: 'Is delivery free for this ₹8 test pack?',
        a: 'Yes, delivery is 100% FREE with ₹0 shipping charge.'
      }
    ]
  }
].map(p => ({
  ...p,
  category: 'pepper',
  stock: p.stock !== undefined ? p.stock : 60,
  outOfStock: p.outOfStock !== undefined ? p.outOfStock : false
}));

export const DEFAULT_COMBO_PRODUCTS = [
  {
    id: 6,
    name: 'Imperial Heritage Combo',
    description: 'Imperial Heritage Reserve + Malenadu Pepper Reserve',
    details: 'A celebration of Malenadu\'s rich estate harvest. This royal combo pairs the deep, full-bodied character of Imperial Heritage 85:15 filter coffee with the piquant aroma of unpolished Tellicherry Black Pepper.',
    rating: 4.9,
    reviews: 145,
    badge: 'Heritage Pair',
    image: '/assets/images/combos_lineup.jpg',
    images: [
      '/assets/images/combos_lineup.jpg',
      '/assets/images/imperial_heritage_front.jpg',
      '/assets/images/pepper_reserve_front.jpg'
    ],
    variants: [
      { weight: '500g Coffee + 100g Pepper', price: '739', image: '/assets/images/combos_lineup.jpg' },
      { weight: '1kg Coffee + 250g Pepper', price: '1349', image: '/assets/images/combos_lineup.jpg' }
    ],
    specs: {
      coffeePart: 'Imperial Heritage 85:15 Dark Roast Filter Coffee',
      pepperPart: 'Tellicherry Bold Unpolished Black Pepper',
      origin: 'Hills of Chikkamagaluru, Karnataka',
      packaging: 'Dual Aroma-Sealed Pouches in Luxury Gift Carton',
      savings: 'Save over 25% compared to individual purchase'
    },
    whySpecial: 'Experience the two crown jewels of Chikkamagaluru agriculture in a single estate shipment: authentic dark roast degree filter coffee for your mornings, and unpolished bold black pepper for your kitchen.',
    faqs: [
      {
        q: 'Are the products packaged together or separately?',
        a: 'They are packaged in separate food-grade, multi-layer aroma pouches to guarantee that the spices and coffee do not cross-contaminate each other\'s aromas.'
      },
      {
        q: 'Is this suitable for gifting?',
        a: 'Yes! It is packed in our signature roastery presentation box, making it a popular authentic gift for coffee and spice lovers across India.'
      }
    ]
  },
  {
    id: 7,
    name: 'Grand Cru Royale Combo',
    description: 'Peaberry Grand Cru Royale + Malenadu Pepper Reserve',
    details: 'Our flagship Malenadu pairing: rare single-origin 100% Peaberry pure coffee alongside handpicked Tellicherry extra-bold black pepper from our canopy trees.',
    rating: 5.0,
    reviews: 89,
    badge: 'Royale Pair',
    image: '/assets/images/combos_lineup.jpg',
    images: [
      '/assets/images/combos_lineup.jpg',
      '/assets/images/peaberry_grand_cru_front.jpg',
      '/assets/images/pepper_reserve_front.jpg'
    ],
    variants: [
      { weight: '500g Coffee + 100g Pepper', price: '899', image: '/assets/images/combos_lineup.jpg' },
      { weight: '1kg Coffee + 250g Pepper', price: '1629', image: '/assets/images/combos_lineup.jpg' }
    ],
    specs: {
      coffeePart: 'Peaberry Grand Cru Royale (100% Pure Coffee | 0% Chicory)',
      pepperPart: 'Tellicherry Extra Bold Whole Black Pepper (TGSEB)',
      origin: 'High Peaks, Hills of Chikkamagaluru, Karnataka',
      packaging: 'Dual Sealed Nitrogen-Flushed Luxury Pouch Set',
      savings: 'Exclusive Estate Bundle Savings'
    },
    whySpecial: 'The ultimate luxury estate experience: 100% pure Peaberry Arabica with winey fruit and chocolate notes, paired with unpolished, sun-dried Tellicherry bold black pepper directly from the grower.',
    faqs: [
      {
        q: 'Does this combo have chicory in the coffee?',
        a: 'No. The coffee included in this combo is 100% pure single-origin Peaberry with 0% chicory.'
      }
    ]
  }
].map(p => ({
  ...p,
  category: 'combos',
  stock: p.stock !== undefined ? p.stock : 30,
  outOfStock: p.outOfStock !== undefined ? p.outOfStock : false
}));

const safeStorage = {
  getItem: (k) => typeof window !== 'undefined' && window.localStorage ? window.localStorage.getItem(k) : null,
  setItem: (k, v) => { if (typeof window !== 'undefined' && window.localStorage) window.localStorage.setItem(k, v); }
};

// Helper: Filter out 250g variants
const filter250g = (variants) => {
  if (!Array.isArray(variants)) return [];
  return variants.filter(v => (v.weight || '').trim() !== '250g');
};

const DATA_VERSION = 'v8_pepper_payment_test_8rs_free_shipping';

// Helper: Merge rich specs & faqs into stored items, ensuring roaster specs are strictly authoritative
const mergeProductMetadata = (storedList, defaultList) => {
  if (!Array.isArray(storedList)) return defaultList.map(d => ({ ...d, variants: filter250g(d.variants) }));
  const merged = storedList.map(item => {
    const defaultMatch = defaultList.find(d => String(d.id) === String(item.id) || d.name === item.name);
    if (!defaultMatch) {
      return {
        ...item,
        variants: filter250g(item.variants || [])
      };
    }
    // For estate products, roaster specs, badge, and ratio take strict precedence
    const cleanVariants = filter250g(defaultMatch.variants || item.variants || []);
    return {
      ...defaultMatch,
      ...item,
      name: defaultMatch.name,
      badge: defaultMatch.badge,
      description: defaultMatch.description,
      details: defaultMatch.details,
      rating: defaultMatch.rating !== undefined ? defaultMatch.rating : item.rating,
      specs: { ...defaultMatch.specs },
      brewingGuide: defaultMatch.brewingGuide,
      whySpecial: defaultMatch.whySpecial,
      faqs: defaultMatch.faqs,
      variants: cleanVariants,
      image: defaultMatch.image || item.image,
      images: defaultMatch.images || item.images,
      freeShipping: defaultMatch.freeShipping || item.freeShipping
    };
  });

  // Append any new default catalog products not yet present in stored list
  defaultList.forEach(d => {
    const exists = merged.some(m => String(m.id) === String(d.id) || m.name === d.name);
    if (!exists) {
      merged.push({ ...d, variants: filter250g(d.variants) });
    }
  });

  return merged;
};

// Load all products from localStorage (with auto-migration on version change)
export const getStoredProducts = () => {
  try {
    const storedVersion = safeStorage.getItem('malenadu_inventory_version');
    const stored = safeStorage.getItem('malenadu_inventory_products');

    if (stored && storedVersion === DATA_VERSION) {
      const parsed = JSON.parse(stored);
      if (parsed && Array.isArray(parsed.coffee) && Array.isArray(parsed.pepper) && Array.isArray(parsed.combos)) {
        return {
          coffee: mergeProductMetadata(parsed.coffee, DEFAULT_COFFEE_PRODUCTS),
          pepper: mergeProductMetadata(parsed.pepper, DEFAULT_PEPPER_PRODUCTS),
          combos: mergeProductMetadata(parsed.combos, DEFAULT_COMBO_PRODUCTS)
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse stored products:', e);
  }

  // When version is outdated or first load, load authoritative roaster catalog and persist
  const initial = {
    coffee: DEFAULT_COFFEE_PRODUCTS,
    pepper: DEFAULT_PEPPER_PRODUCTS,
    combos: DEFAULT_COMBO_PRODUCTS
  };
  try {
    safeStorage.setItem('malenadu_inventory_products', JSON.stringify(initial));
    safeStorage.setItem('malenadu_inventory_version', DATA_VERSION);
  } catch(e) {}
  return initial;
};

// Save products and notify components across the app
export const saveStoredProducts = (products) => {
  try {
    safeStorage.setItem('malenadu_inventory_products', JSON.stringify(products));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('malenadu_products_updated'));
    }
  } catch (e) {
    console.error('Failed to save products:', e);
  }
};

// Add a new product to a category
export const addStoreProduct = (category, productData) => {
  const current = getStoredProducts();
  const catKey = category === 'pepper' ? 'pepper' : category === 'combos' ? 'combos' : 'coffee';
  
  const newProduct = {
    id: 'prod_' + Date.now(),
    name: productData.name.trim(),
    description: productData.description.trim(),
    details: productData.details ? productData.details.trim() : productData.description.trim(),
    badge: productData.badge ? productData.badge.trim() : '',
    rating: Number(productData.rating) || 4.8,
    reviews: Number(productData.reviews) || 12,
    image: productData.image || '/assets/images/coffee_pack_new.webp',
    images: productData.images && productData.images.length > 0 ? productData.images : [productData.image || '/assets/images/coffee_pack_new.webp'],
    stock: Number(productData.stock) || 50,
    outOfStock: Boolean(productData.outOfStock),
    category: catKey,
    variants: productData.variants && productData.variants.length > 0 ? productData.variants : [
      { weight: '500g', price: productData.price || '449', image: productData.image || '/assets/images/coffee_pack_new.webp' },
      { weight: '1kg', price: String(Math.round(Number(productData.price || 449) * 1.85)), image: productData.image || '/assets/images/coffee_pack_new.webp' }
    ]
  };

  current[catKey] = [newProduct, ...current[catKey]];
  saveStoredProducts(current);
  return current;
};

// Update an existing product (stock, outOfStock, price, etc.)
export const updateStoreProduct = (category, productId, updates) => {
  const current = getStoredProducts();
  const catKey = category === 'pepper' ? 'pepper' : category === 'combos' ? 'combos' : 'coffee';

  current[catKey] = current[catKey].map(p => {
    if (String(p.id) === String(productId)) {
      return { ...p, ...updates };
    }
    return p;
  });

  saveStoredProducts(current);
  return current;
};

// Toggle In Stock / Out of Stock
export const toggleStoreProductStock = (category, productId) => {
  const current = getStoredProducts();
  const catKey = category === 'pepper' ? 'pepper' : category === 'combos' ? 'combos' : 'coffee';

  current[catKey] = current[catKey].map(p => {
    if (String(p.id) === String(productId)) {
      const nextOutOfStock = !p.outOfStock;
      return { 
        ...p, 
        outOfStock: nextOutOfStock,
        stock: nextOutOfStock ? 0 : (p.stock > 0 ? p.stock : 25)
      };
    }
    return p;
  });

  saveStoredProducts(current);
  return current;
};

// Update stock quantity
export const updateStoreProductQty = (category, productId, newQty) => {
  const current = getStoredProducts();
  const catKey = category === 'pepper' ? 'pepper' : category === 'combos' ? 'combos' : 'coffee';
  const qtyNum = Math.max(0, parseInt(newQty, 10) || 0);

  current[catKey] = current[catKey].map(p => {
    if (String(p.id) === String(productId)) {
      return { 
        ...p, 
        stock: qtyNum,
        outOfStock: qtyNum === 0 ? true : p.outOfStock
      };
    }
    return p;
  });

  saveStoredProducts(current);
  return current;
};

// Delete a product permanently
export const deleteStoreProduct = (category, productId) => {
  const current = getStoredProducts();
  const catKey = category === 'pepper' ? 'pepper' : category === 'combos' ? 'combos' : 'coffee';

  current[catKey] = current[catKey].filter(p => String(p.id) !== String(productId));
  saveStoredProducts(current);
  return current;
};
