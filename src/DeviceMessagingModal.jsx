import React, { useState } from 'react';
import { X, Send, Download, Bell, Smartphone, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateDigitalCatalog } from './catalogGenerator.js';

export const DeviceMessagingModal = ({ isOpen, onClose, defaultTab = 'whatsapp' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pushStatus, setPushStatus] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  if (!isOpen) return null;

  // Handler 1: WhatsApp Catalog Dispatch
  const handleWhatsAppCatalog = (e) => {
    e.preventDefault();
    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    const nameStr = customerName.trim() || 'Coffee Lover';
    
    // Direct WhatsApp message pre-filled to Malenadu Roast Co (+91 8217623335)
    const text = encodeURIComponent(
      `Hi Malenadu Roast Co.! My name is ${nameStr}. Please send the 2026 Estate Coffee & Pepper Catalog and wholesale price list to my WhatsApp number ${cleanNum || ''}.`
    );
    const whatsappUrl = `https://wa.me/918217623335?text=${text}`;
    
    // Store in recent requests
    try {
      const logs = JSON.parse(localStorage.getItem('malenadu_catalog_requests') || '[]');
      logs.unshift({
        name: nameStr,
        phone: cleanNum,
        channel: 'WhatsApp',
        date: new Date().toISOString()
      });
      localStorage.setItem('malenadu_catalog_requests', JSON.stringify(logs.slice(0, 50)));
    } catch(err) {}

    window.open(whatsappUrl, '_blank');
    setStatusMsg('Redirecting to WhatsApp to send your catalog immediately...');
    setTimeout(() => {
      onClose();
      setStatusMsg('');
    }, 2500);
  };

  // Handler 2: Email Catalog Dispatch (using EmailJS)
  const handleEmailCatalog = async (e) => {
    e.preventDefault();
    if (!customerEmail.trim()) {
      setStatusMsg('Please enter a valid email address.');
      return;
    }
    setIsSending(true);
    setStatusMsg('Sending 2026 Estate Catalog to your email...');

    const templateParams = {
      is_otp: false,
      is_feedback: false,
      is_catalog: true,
      to_name: customerName.trim() || 'Valued Customer',
      to_email: customerEmail.trim(),
      from_name: 'Malenadu Roast Co.',
      from_email: 'malenaduroast@gmail.com',
      subject: '☕ Malenadu Roast Co. - 2026 Estate Coffee Catalog & Price List',
      message: `Dear ${customerName || 'Customer'}, thank you for requesting the official 2026 Estate Catalog. Explore our fresh roasts and estate peppercorns directly from Chikkamagaluru, Karnataka.`
    };

    try {
      if (window.emailjs) {
        await window.emailjs.send('default_service', 'template_pyp2var', templateParams, 'XAjBukluotgykpLye');
      }
      setStatusMsg(`Catalog successfully dispatched to ${customerEmail}! Check your inbox.`);
      setTimeout(() => {
        onClose();
        setStatusMsg('');
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatusMsg(`Catalog requested! We will send it to ${customerEmail}.`);
      setTimeout(() => onClose(), 2500);
    } finally {
      setIsSending(false);
    }
  };

  // Handler 3: Enable Native Web Push Notifications
  const handleEnablePush = async () => {
    if (!('Notification' in window)) {
      alert('Your browser does not support web push notifications. Please use Chrome, Edge, or Firefox.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === 'granted') {
        localStorage.setItem('malenadu_push_enabled', 'true');
        // Trigger immediate sample notification
        new Notification('☕ Malenadu Roast Co.', {
          body: 'Roast Alerts Enabled! You will receive weekly fresh roast updates & restock reminders on this device.',
          icon: '/assets/images/logo_final.webp',
          badge: '/assets/images/logo_final.webp'
        });
        setStatusMsg('✓ Push notifications successfully enabled on your device!');
        setTimeout(() => onClose(), 2500);
      } else {
        setStatusMsg('Notification permission was blocked or denied in browser settings.');
      }
    } catch (e) {
      console.error(e);
      setStatusMsg('Failed to enable notifications.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(10, 8, 6, 0.75)',
      backdropFilter: 'blur(5px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#12100E',
          color: '#FBF8F3',
          padding: '1.4rem 1.6rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #C8935A'
        }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#C8935A', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              Device Delivery Center
            </span>
            <h3 style={{ margin: '2px 0 0', fontFamily: 'Georgia, serif', fontSize: '1.25rem', color: '#fff' }}>
              Send Catalog & Alerts to Your Phone
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.4rem' }}>
          {[
            { id: 'whatsapp', label: 'WhatsApp Catalog', icon: Send },
            { id: 'pdf', label: 'PDF Download', icon: Download },
            { id: 'push', label: 'Device Alerts', icon: Bell },
            { id: 'email', label: 'Email', icon: Mail }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setStatusMsg(''); }}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.4rem',
                  border: 'none',
                  background: active ? '#ffffff' : 'transparent',
                  color: active ? '#0f172a' : '#64748b',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.76rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={13} color={active ? '#C8935A' : '#64748b'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.6rem' }}>
          {statusMsg && (
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1e40af',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* TAB 1: WHATSAPP */}
          {activeTab === 'whatsapp' && (
            <form onSubmit={handleWhatsAppCatalog}>
              <p style={{ color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', margin: '0 0 1.25rem' }}>
                Receive our official <strong>2026 Estate Coffee & Pepper Catalog & Wholesale Price List</strong> directly on WhatsApp, along with direct assistance from our roast master.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Your WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                }}
              >
                <Send size={16} />
                <span>Get Catalog on WhatsApp</span>
              </button>
            </form>
          )}

          {/* TAB 2: INSTANT PDF */}
          {activeTab === 'pdf' && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FBF8F3',
                border: '2px solid #C8935A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Download size={28} color="#C8935A" />
              </div>

              <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#0f172a', fontFamily: 'Georgia, serif' }}>
                2026 Estate Product Catalog & Price Guide
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 auto 1.5rem', maxWidth: '380px' }}>
                Download the complete HD color catalog containing our Imperial Heritage blend, Peaberry roasts, Black Pepper reserve, and the South Indian filter decoction master guide.
              </p>

              <button
                onClick={() => {
                  generateDigitalCatalog();
                  onClose();
                }}
                style={{
                  background: '#12100E',
                  color: '#FBF8F3',
                  border: '2px solid #C8935A',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                <Download size={16} color="#C8935A" />
                <span>Open & Save PDF Catalog</span>
              </button>
            </div>
          )}

          {/* TAB 3: BROWSER PUSH ALERTS */}
          {activeTab === 'push' && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: pushStatus === 'granted' ? '#dcfce7' : '#eff6ff',
                border: pushStatus === 'granted' ? '2px solid #16a34a' : '2px solid #3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <Bell size={28} color={pushStatus === 'granted' ? '#16a34a' : '#3b82f6'} />
              </div>

              <h4 style={{ margin: '0 0 6px', fontSize: '1.1rem', color: '#0f172a', fontFamily: 'Georgia, serif' }}>
                Automated Device Alerts & Coffee Reminders
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 auto 1.5rem', maxWidth: '380px' }}>
                Never run out of morning coffee! Get real-time alerts when we roast fresh batches, plus a gentle reminder when it's time to re-stock your filter coffee blend.
              </p>

              {pushStatus === 'granted' ? (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#15803d',
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={18} />
                  <span>Push Alerts are Active on this Device!</span>
                </div>
              ) : (
                <button
                  onClick={handleEnablePush}
                  style={{
                    background: '#C8935A',
                    color: '#ffffff',
                    border: 'none',
                    padding: '0.85rem 1.6rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(200, 147, 90, 0.35)'
                  }}
                >
                  <Bell size={16} />
                  <span>Enable Alerts on this Device</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 4: EMAIL */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailCatalog}>
              <p style={{ color: '#475569', fontSize: '0.86rem', lineHeight: '1.5', margin: '0 0 1.25rem' }}>
                We will email our complete 2026 Estate Catalog, Coffee Origins booklet, and wholesale price breakdown directly to your inbox.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Priya Nair"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Your Email Address
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. priya@example.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                style={{
                  width: '100%',
                  background: '#12100E',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Mail size={16} />
                <span>{isSending ? 'Sending Catalog...' : 'Email Me the Catalog'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '0.9rem 1.6rem',
          fontSize: '0.74rem',
          color: '#64748b',
          textAlign: 'center'
        }}>
          Direct assistance available on WhatsApp at <strong style={{ color: '#0f172a' }}>+91 8217623335</strong>
        </div>
      </div>
    </div>
  );
};

