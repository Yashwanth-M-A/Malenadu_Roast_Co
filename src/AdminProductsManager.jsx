import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Trash2, CheckCircle2, AlertCircle, 
  Upload, Image as ImageIcon, Eye, EyeOff, Tag, DollarSign, Layers,
  Check, X, RefreshCw, Edit3, PlusCircle
} from 'lucide-react';
import { 
  getStoredProducts, 
  addStoreProduct, 
  updateStoreProduct, 
  toggleStoreProductStock, 
  updateStoreProductQty, 
  deleteStoreProduct 
} from './productsData.js';

export const AdminProductsManager = () => {
  const [productsData, setProductsData] = useState(getStoredProducts);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'coffee' | 'pepper' | 'combos'
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Product currently being edited
  const [alertNotice, setAlertNotice] = useState('');

  // Form State for Adding New Product
  const [formData, setFormData] = useState({
    name: '',
    category: 'coffee',
    description: '',
    details: '',
    badge: 'New Roast',
    price: '399',
    stock: '50',
    outOfStock: false,
    image: '/assets/images/coffee_pack_new.webp'
  });
  const [imagePreview, setImagePreview] = useState('/assets/images/coffee_pack_new.webp');

  // Form State for Editing Existing Product (Name, Image, Grams, Prices)
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    details: '',
    badge: '',
    image: '',
    stock: 50,
    outOfStock: false,
    variants: []
  });
  const [editImagePreview, setEditImagePreview] = useState('');

  const reloadProducts = () => {
    setProductsData(getStoredProducts());
  };

  useEffect(() => {
    reloadProducts();
    const handleSync = () => reloadProducts();
    window.addEventListener('malenadu_products_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('malenadu_products_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Compute flattened list with category attached
  const allProducts = [
    ...(productsData.coffee || []).map(p => ({ ...p, categoryKey: 'coffee', categoryLabel: 'Coffee' })),
    ...(productsData.pepper || []).map(p => ({ ...p, categoryKey: 'pepper', categoryLabel: 'Pepper' })),
    ...(productsData.combos || []).map(p => ({ ...p, categoryKey: 'combos', categoryLabel: 'Combo Pack' }))
  ];

  const totalCount = allProducts.length;
  const inStockCount = allProducts.filter(p => !p.outOfStock && (p.stock === undefined || p.stock > 0)).length;
  const outOfStockCount = allProducts.filter(p => p.outOfStock || p.stock === 0).length;

  const filteredProducts = allProducts.filter(p => {
    if (activeCategory !== 'all' && p.categoryKey !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const descMatch = (p.description || '').toLowerCase().includes(q);
      return nameMatch || descMatch;
    }
    return true;
  });

  // Handle local image file upload -> convert to base64 Data URL (for New Product)
  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file is large (>2MB). Compressing or using optimized images is recommended.');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle local image file upload -> convert to base64 Data URL (for Edit Modal)
  const handleEditImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file is large (>2MB). Compressing or using optimized images is recommended.');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImagePreview(reader.result);
        setEditFormData(prev => ({ 
          ...prev, 
          image: reader.result,
          variants: (prev.variants || []).map(v => ({ ...v, image: reader.result }))
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a product name.');
      return;
    }

    const basePrice = Math.max(1, parseInt(formData.price, 10) || 349);
    const variants = formData.category === 'combos' ? [
      { weight: '500g Coffee + 100g Pepper', price: String(basePrice), image: formData.image },
      { weight: '1kg Coffee + 250g Pepper', price: String(Math.round(basePrice * 1.85)), image: formData.image }
    ] : [
      { weight: '250g', price: String(basePrice), image: formData.image },
      { weight: '500g', price: String(Math.round(basePrice * 1.85)), image: formData.image },
      { weight: '1kg', price: String(Math.round(basePrice * 3.4)), image: formData.image }
    ];

    addStoreProduct(formData.category, {
      ...formData,
      variants
    });

    setAlertNotice(`✓ Product "${formData.name}" successfully added to ${formData.category.toUpperCase()}!`);
    setTimeout(() => setAlertNotice(''), 4000);
    setIsAddModalOpen(false);

    // Reset form
    setFormData({
      name: '',
      category: 'coffee',
      description: '',
      details: '',
      badge: 'New Roast',
      price: '399',
      stock: '50',
      outOfStock: false,
      image: '/assets/images/coffee_pack_new.webp'
    });
    setImagePreview('/assets/images/coffee_pack_new.webp');
    reloadProducts();
  };

  // Open Edit Modal for any product
  const handleOpenEditModal = (p) => {
    setEditingProduct(p);
    
    // Ensure variants list exists with weights and prices
    const existingVariants = Array.isArray(p.variants) && p.variants.length > 0 
      ? JSON.parse(JSON.stringify(p.variants))
      : [
          { weight: p.weight || '500g', price: String(p.price || 449), image: p.image || '/assets/images/coffee_pack_new.webp' }
        ];

    setEditFormData({
      name: p.name || '',
      description: p.description || '',
      details: p.details || p.description || '',
      badge: p.badge || '',
      image: p.image || '/assets/images/coffee_pack_new.webp',
      stock: p.stock !== undefined ? p.stock : 50,
      outOfStock: Boolean(p.outOfStock),
      variants: existingVariants
    });
    setEditImagePreview(p.image || '/assets/images/coffee_pack_new.webp');
  };

  // Update a specific variant's weight/grams or price in Edit Modal
  const handleVariantChange = (index, field, value) => {
    setEditFormData(prev => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  // Add a new size/gram variant in Edit Modal
  const handleAddVariant = () => {
    setEditFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { weight: '500g', price: '599', image: prev.image }
      ]
    }));
  };

  // Remove a variant in Edit Modal
  const handleRemoveVariant = (index) => {
    if (editFormData.variants.length <= 1) {
      alert('A product must have at least one weight/size variant.');
      return;
    }
    setEditFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index)
    }));
  };

  // Save changes to existing product
  const handleSaveProductEdit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editFormData.name.trim()) {
      alert('Product name cannot be empty.');
      return;
    }

    const cleanVariants = editFormData.variants.map(v => ({
      ...v,
      weight: (v.weight || '500g').trim(),
      price: String(Math.max(1, parseInt(v.price, 10) || 100)),
      image: editFormData.image || v.image
    }));

    const updates = {
      name: editFormData.name.trim(),
      description: editFormData.description.trim(),
      details: editFormData.details.trim(),
      badge: editFormData.badge.trim(),
      image: editFormData.image,
      images: [editFormData.image],
      stock: Number(editFormData.stock) || 0,
      outOfStock: Boolean(editFormData.outOfStock || Number(editFormData.stock) === 0),
      variants: cleanVariants,
      price: cleanVariants[0].price,
      weight: cleanVariants[0].weight
    };

    updateStoreProduct(editingProduct.categoryKey, editingProduct.id, updates);
    reloadProducts();
    setAlertNotice(`✓ Product "${editFormData.name}" updated with new name, image, grams, and prices!`);
    setTimeout(() => setAlertNotice(''), 4000);
    setEditingProduct(null);
  };

  const handleStockToggle = (categoryKey, productId, productName) => {
    toggleStoreProductStock(categoryKey, productId);
    reloadProducts();
    setAlertNotice(`Status updated for "${productName}".`);
    setTimeout(() => setAlertNotice(''), 3000);
  };

  const handleQtyChange = (categoryKey, productId, newQty) => {
    updateStoreProductQty(categoryKey, productId, newQty);
    reloadProducts();
  };

  const handleDelete = (categoryKey, productId, productName) => {
    if (window.confirm(`Are you sure you want to permanently delete "${productName}" from the website?`)) {
      deleteStoreProduct(categoryKey, productId);
      reloadProducts();
      setAlertNotice(`Product "${productName}" has been removed from the website.`);
      setTimeout(() => setAlertNotice(''), 3000);
    }
  };

  return (
    <div>
      {/* Top Banner & Action */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        background: '#ffffff',
        padding: '1.25rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div>
          <h2 style={{ margin: '0 0 4px', fontSize: '1.35rem', fontFamily: 'Georgia, serif', color: '#0f172a', fontWeight: 700 }}>
            Products & Stock Inventory Manager
          </h2>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
            Edit product names, images, grams, and prices. Add new items and update real-time stock availability.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            background: '#12100E',
            color: '#FBF8F3',
            border: '1.5px solid #C8935A',
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Plus size={16} color="#C8935A" />
          <span>Add New Product</span>
        </button>
      </div>

      {alertNotice && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          fontSize: '0.84rem',
          fontWeight: 600,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          <span>{alertNotice}</span>
        </div>
      )}

      {/* 3 Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Total Catalog Products</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', fontFamily: 'Georgia, serif' }}>{totalCount}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
          <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Active & In Stock</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#16a34a', fontFamily: 'Georgia, serif' }}>{inStockCount}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.1rem 1.25rem' }}>
          <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Out of Stock / Sold Out</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#dc2626', fontFamily: 'Georgia, serif' }}>{outOfStockCount}</div>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        background: '#ffffff',
        padding: '0.85rem 1.25rem',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${totalCount})` },
            { id: 'coffee', label: `☕ Coffee (${(productsData.coffee || []).length})` },
            { id: 'pepper', label: `🌿 Pepper (${(productsData.pepper || []).length})` },
            { id: 'combos', label: `🎁 Combos (${(productsData.combos || []).length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: activeCategory === tab.id ? '1px solid #C8935A' : '1px solid #e2e8f0',
                background: activeCategory === tab.id ? '#FBF8F3' : '#ffffff',
                color: activeCategory === tab.id ? '#8c6239' : '#64748b',
                fontWeight: activeCategory === tab.id ? 700 : 500,
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.8rem',
              outline: 'none',
              background: '#f8fafc',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '3.5rem 2rem', textAlign: 'center' }}>
          <Package size={40} color="#C8935A" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 6px', color: '#0f172a', fontFamily: 'Georgia, serif' }}>No Products Found</h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Try clearing your search query or add a new product above.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredProducts.map(p => {
            const isOutOfStock = p.outOfStock || p.stock === 0;
            const currentStock = p.stock !== undefined ? p.stock : 50;

            return (
              <div 
                key={p.id}
                style={{
                  background: isOutOfStock ? '#fafafa' : '#ffffff',
                  border: isOutOfStock ? '1.5px dashed #fca5a5' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isOutOfStock ? 'none' : '0 1px 3px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div>
                  {/* Top Metadata */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: p.categoryKey === 'coffee' ? '#fef3c7' : p.categoryKey === 'pepper' ? '#f1f5f9' : '#ecfdf5',
                        color: p.categoryKey === 'coffee' ? '#92400e' : p.categoryKey === 'pepper' ? '#334155' : '#065f46'
                      }}>
                        {p.categoryLabel}
                      </span>
                      {p.badge && (
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', background: '#FBF8F3', color: '#8c6239', border: '1px solid #E6D2B5' }}>
                          {p.badge}
                        </span>
                      )}
                    </div>

                    {/* Stock Status Badge */}
                    <div>
                      {isOutOfStock ? (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '10px' }}>
                          ● OUT OF STOCK
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '10px' }}>
                          ● IN STOCK ({currentStock} left)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details with Thumbnail */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <img 
                      src={p.image || '/assets/images/coffee_pack_new.webp'} 
                      alt={p.name}
                      style={{
                        width: '72px',
                        height: '72px',
                        objectFit: 'contain',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        flexShrink: 0,
                        opacity: isOutOfStock ? 0.6 : 1
                      }}
                      onError={(e) => { e.target.src = '/assets/images/coffee_pack_new.webp'; }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ margin: '0 0 4px', fontSize: '1.02rem', color: isOutOfStock ? '#64748b' : '#0f172a', fontWeight: 700, fontFamily: 'Georgia, serif' }}>
                        {p.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b', lineHeight: '1.4' }}>
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Pricing / Variants Summary */}
                  <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem', color: '#334155', marginBottom: '0.85rem', border: '1px solid #f1f5f9' }}>
                    <strong style={{ color: '#0f172a' }}>Grams & Pricing:</strong>{' '}
                    {(p.variants || []).map(v => `${v.weight}: ₹${v.price}`).join(' • ')}
                  </div>
                </div>

                {/* Stock Controls & Actions */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {/* Stock Quantity Counter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Stock:</span>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(p.categoryKey, p.id, Math.max(0, currentStock - 1))}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={currentStock}
                      onChange={(e) => handleQtyChange(p.categoryKey, p.id, e.target.value)}
                      style={{ width: '45px', textAlign: 'center', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}
                    />
                    <button
                      type="button"
                      onClick={() => handleQtyChange(p.categoryKey, p.id, currentStock + 1)}
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      +
                    </button>
                  </div>

                  {/* Edit, Toggle Out of Stock & Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    
                    {/* EDIT BUTTON (PRICE, GRAMS, IMAGE, NAME) */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      style={{
                        background: '#FBF8F3',
                        border: '1.5px solid #C8935A',
                        color: '#8c6239',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s'
                      }}
                      title="Edit product name, grams, prices, and image"
                    >
                      <Edit3 size={12} color="#C8935A" />
                      <span>Edit</span>
                    </button>

                    {/* Stock Toggle */}
                    <button
                      type="button"
                      onClick={() => handleStockToggle(p.categoryKey, p.id, p.name)}
                      style={{
                        background: isOutOfStock ? '#eff6ff' : '#fef2f2',
                        border: isOutOfStock ? '1px solid #bfdbfe' : '1px solid #fecaca',
                        color: isOutOfStock ? '#1d4ed8' : '#dc2626',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={isOutOfStock ? "Mark as in stock" : "Mark as out of stock"}
                    >
                      {isOutOfStock ? <Eye size={12} /> : <EyeOff size={12} />}
                      <span>{isOutOfStock ? 'Set In Stock' : 'Out of Stock'}</span>
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(p.categoryKey, p.id, p.name)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#94a3b8',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                      title="Permanently delete product"
                    >
                      <Trash2 size={13} color="#dc2626" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================== */}
      {/* EDIT PRODUCT MODAL (NAME, IMAGE, GRAMS, PRICE) */}
      {/* ============================================== */}
      {editingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '580px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            {/* Header */}
            <div style={{
              background: '#12100E',
              color: '#FBF8F3',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #C8935A'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#C8935A', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  Product Editor
                </span>
                <h3 style={{ margin: '2px 0 0', fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#fff' }}>
                  Edit Product Details, Grams & Prices
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProductEdit} style={{ padding: '1.5rem' }}>
              
              {/* Product Name */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Imperial Heritage Reserve"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1.5px solid #cbd5e1', borderRadius: '7px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Short Tagline */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Short Tagline / Blend Details *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. 70:30 or 80:20 Single-Estate Filter Coffee"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Story / Details */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Detailed Description & Story (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editFormData.details}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Detailed taste notes, estate heritage, or brewing advice..."
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Badge & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Badge Tag (e.g. Best Seller, Limited Drop)
                  </label>
                  <input
                    type="text"
                    value={editFormData.badge}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. Best Seller"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Current Stock Quantity (Packs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.stock}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, stock: e.target.value }))}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.84rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* EDIT PRODUCT IMAGE */}
              <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Update Product Image
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img 
                    src={editImagePreview} 
                    alt="Preview" 
                    style={{ width: '68px', height: '68px', objectFit: 'contain', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', flexShrink: 0 }}
                    onError={(e) => { e.target.src = '/assets/images/coffee_pack_new.webp'; }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '4px' }}>
                      Upload new picture from computer or phone:
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageFileUpload}
                      style={{ fontSize: '0.78rem', marginBottom: '6px', width: '100%' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Or Image URL:
                    </div>
                    <input
                      type="text"
                      value={editFormData.image}
                      onChange={(e) => {
                        setEditFormData(prev => ({ ...prev, image: e.target.value }));
                        setEditImagePreview(e.target.value);
                      }}
                      placeholder="/assets/images/coffee_pack_new.webp"
                      style={{ width: '100%', padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.76rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* EDIT GRAMS & PRICES (SIZE VARIANTS) */}
              <div style={{ marginBottom: '1.5rem', background: '#FBF8F3', border: '1.5px solid #E6D2B5', borderRadius: '10px', padding: '1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#3B2A1A', fontWeight: 700 }}>
                      Grams & Prices (Size Variants)
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: '#8c6239' }}>
                      Add or edit weight sizes and pricing shown to customers on the website.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #C8935A',
                      color: '#8c6239',
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={13} color="#C8935A" />
                    <span>+ Add Size</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {(editFormData.variants || []).map((variant, idx) => (
                    <div 
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '7px',
                        padding: '0.55rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ flex: '1' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
                          Grams / Size
                        </label>
                        <input
                          type="text"
                          required
                          value={variant.weight}
                          onChange={(e) => handleVariantChange(idx, 'weight', e.target.value)}
                          placeholder="e.g. 500g, 1kg"
                          style={{ width: '100%', padding: '0.4rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '0.82rem', boxSizing: 'border-box', fontWeight: 600 }}
                        />
                      </div>

                      <div style={{ flex: '1' }}>
                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '2px' }}>
                          Price (₹)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '8px', color: '#8c6239', fontWeight: 700, fontSize: '0.82rem' }}>₹</span>
                          <input
                            type="number"
                            min="1"
                            required
                            value={variant.price}
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                            placeholder="349"
                            style={{ width: '100%', padding: '0.4rem 0.6rem 0.4rem 1.4rem', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '0.82rem', boxSizing: 'border-box', fontWeight: 700, color: '#0f172a' }}
                          />
                        </div>
                      </div>

                      {editFormData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '5px',
                            color: '#dc2626',
                            padding: '0.45rem',
                            cursor: 'pointer',
                            marginTop: '16px'
                          }}
                          title="Remove this size variant"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{ background: '#f1f5f9', border: 'none', color: '#64748b', padding: '0.6rem 1.1rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#12100E',
                    border: '1.5px solid #C8935A',
                    color: '#FBF8F3',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <Check size={15} color="#C8935A" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* ADD NEW PRODUCT MODAL                          */}
      {/* ============================================== */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            {/* Header */}
            <div style={{
              background: '#12100E',
              color: '#FBF8F3',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '2px solid #C8935A'
            }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: '#C8935A', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                  Store Catalog
                </span>
                <h3 style={{ margin: '2px 0 0', fontFamily: 'Georgia, serif', fontSize: '1.2rem', color: '#fff' }}>
                  Add New Product to Storefront
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProduct} style={{ padding: '1.5rem' }}>
              
              {/* Category */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Target Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem' }}
                >
                  <option value="coffee">☕ Coffee Collection (Featured in Coffee Section)</option>
                  <option value="pepper">🌿 Estate Pepper Reserve (Featured in Pepper Section)</option>
                  <option value="combos">🎁 Heritage Combo Pack (Featured in Combos Section)</option>
                </select>
              </div>

              {/* Product Name */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Malenadu Monsoon Malabar Reserve"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Short Tagline */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Short Tagline / Blend Details *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. 100% Arabica • Medium Dark Roast • Spiced Hazelnut Finish"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Story / Full Details */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Full Description & Story (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Aged by maritime monsoon winds to develop distinct mellow sweetness..."
                  style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              {/* Price & Stock & Badge */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Initial Stock (Qty)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                    placeholder="e.g. New Roast"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '7px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Image Upload with Preview */}
              <div style={{ marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Product Image (Upload from Device or use URL)
                </label>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ width: '64px', height: '64px', objectFit: 'contain', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    onError={(e) => { e.target.src = '/assets/images/coffee_pack_new.webp'; }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ fontSize: '0.8rem', marginBottom: '6px', width: '100%' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      Or image URL:
                    </div>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, image: e.target.value }));
                        setImagePreview(e.target.value);
                      }}
                      placeholder="/assets/images/coffee_pack_new.webp"
                      style={{ width: '100%', padding: '0.35rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.76rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ background: '#f1f5f9', border: 'none', color: '#64748b', padding: '0.6rem 1.1rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#12100E', border: '1.5px solid #C8935A', color: '#FBF8F3', padding: '0.6rem 1.4rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={15} color="#C8935A" />
                  <span>Publish to Website</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
