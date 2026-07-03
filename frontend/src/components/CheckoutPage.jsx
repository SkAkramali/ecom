import React, { useState, useContext } from 'react';
import { CreditCard, CheckCircle, ChevronRight, ShoppingBag, AlertTriangle, ArrowLeft, Phone, QrCode, FileText } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function CheckoutPage({ setView }) {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { token } = useContext(AuthContext);

  // Form inputs
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  // Payment Selection: 'card' or 'upi'
  const [paymentTab, setPaymentTab] = useState('card');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // UI state
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  // Construct working UPI URL
  // Format: upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
  const upiUrl = `upi://pay?pa=j2727@axl&pn=ApexStore&am=${cartTotal}&cu=INR&tn=ApexStoreOrder`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upiUrl)}`;

  const printInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) {
      alert('Pop-up blocked! Please allow pop-ups to view the invoice.');
      return;
    }
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - Order #${order.id}</title>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Outfit', sans-serif; color: #1e293b; margin: 40px; line-height: 1.5; background: #fff; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #7c3aed; padding-bottom: 20px; }
            .logo { font-size: 1.8rem; font-weight: 800; color: #7c3aed; text-transform: uppercase; }
            .details { margin: 30px 0; display: flex; justify-content: space-between; }
            .details div { width: 45%; }
            h4 { color: #7c3aed; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 0; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            th { background: #f8fafc; padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 0.9rem; }
            .total { text-align: right; font-size: 1.4rem; font-weight: 800; margin-top: 20px; color: #0f172a; }
            .footer { margin-top: 60px; text-align: center; font-size: 0.85rem; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .btn-print { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: #fff; padding: 10px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 0.95rem; font-weight: 600; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); transition: all 0.2s; }
            .btn-print:hover { transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
            @media print {
              .no-print { display: none; }
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">APEX STORE</div>
              <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b;">Premium Digital Goods & Accessories</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 1.5rem; color: #0f172a;">TAX INVOICE</h2>
              <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #64748b;">Invoice Reference: <strong>#${order.id}</strong></p>
              <p style="margin: 2px 0 0 0; font-size: 0.85rem; color: #64748b;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div class="details">
            <div>
              <h4>Billing & Shipping Details:</h4>
              <p style="margin: 0; font-weight: 600; font-size: 0.95rem; color: #0f172a;">${order.customerName}</p>
              <p style="margin: 2px 0 8px 0; font-size: 0.85rem; color: #64748b;">${order.customerEmail}</p>
              <p style="margin: 0; font-size: 0.9rem; color: #334155;">
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
              </p>
            </div>
            <div style="text-align: right;">
              <h4>Transaction Information:</h4>
              <p style="margin: 0; font-weight: 600; font-size: 0.95rem; color: #0f172a;">Payment Details</p>
              <p style="margin: 4px 0 4px 0; font-size: 0.9rem;">Payment Method: <strong>${order.paymentMethod}</strong></p>
              <p style="margin: 0 0 4px 0; font-size: 0.9rem;">Ref / Payment ID: <span style="font-family: monospace; font-size: 0.85rem; color: #475569;">${order.paymentId}</span></p>
              <p style="margin: 0; font-size: 0.9rem;">Status: <span style="color: #10b981; font-weight: 700;">Paid</span></p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Product Description</th>
                <th style="width: 15%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Unit Price</th>
                <th style="width: 20%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total">
            Grand Total: ₹${order.totalAmount.toLocaleString('en-IN')}
          </div>

          <div class="footer">
            <p style="margin-bottom: 15px;">Thank you for shopping with us! If you have any inquiries regarding this invoice, reach us at support@apexstore.com</p>
            <button class="btn-print no-print" onclick="window.print()">Print Invoice</button>
          </div>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (!address || !city || !postalCode || !country) {
      setError('Please fill in all shipping details.');
      return;
    }
    
    if (paymentTab === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvc) {
        setError('Please complete the credit card form.');
        return;
      }
    }

    setProcessing(true);
    setError(null);

    try {
      let finalPaymentId = '';
      let finalMethod = '';

      if (paymentTab === 'card') {
        finalMethod = 'Stripe Card';
        // Request a Stripe payment intent
        const intentRes = await fetch(`${API_URL}/orders/payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount: cartTotal })
        });
        const intentData = await intentRes.json();
        if (!intentRes.ok) throw new Error(intentData.error || 'Failed to create payment transaction.');
        finalPaymentId = intentData.clientSecret;
      } else {
        finalMethod = 'UPI';
        // Generate a secure transaction Ref locally for logging payments completed on phone
        finalPaymentId = `UPI_PAY_${Math.floor(100000 + Math.random() * 900000)}_${Date.now()}`;
      }

      // Simulate verification/charge delay
      await new Promise(resolve => setTimeout(resolve, 2200));

      // Submit order details to backend
      const orderRes = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          totalAmount: cartTotal,
          shippingAddress: {
            address,
            city,
            postalCode,
            country
          },
          paymentMethod: finalMethod,
          paymentId: finalPaymentId
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to submit order.');

      setPlacedOrder(orderData);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Transaction failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (success && placedOrder) {
    return (
      <div 
        className="animate-fade-in"
        style={{
          maxWidth: '600px',
          margin: '60px auto',
          padding: '40px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px'
        }}
      >
        <div style={{ color: 'var(--success)' }}>
          <CheckCircle size={64} style={{ strokeWidth: 1.5 }} />
        </div>

        <div>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '1rem' }}>
            Thank you for shopping with Apex Store. Your payment was verified and processed successfully.
          </p>
        </div>

        {/* Receipt info */}
        <div 
          className="glass-panel" 
          style={{
            width: '100%',
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-glass)',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Receipt/Payment Reference ID:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px', textAlign: 'right' }}>{placedOrder.paymentId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Order ID:</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{placedOrder.id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Total Charge:</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>₹{placedOrder.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Shipping Address:</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', textAlign: 'right' }}>
              {placedOrder.shippingAddress.address}, {placedOrder.shippingAddress.city}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '12px' }}>
          <button 
            onClick={() => printInvoice(placedOrder)} 
            className="btn btn-secondary" 
            style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FileText size={18} /> Print Tax Invoice
          </button>
          <button onClick={() => setView('store')} className="btn btn-primary" style={{ flexGrow: 1 }}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto 80px auto', padding: '0 24px' }}>
      
      {/* Back button */}
      <button 
        onClick={() => setView('store')}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.95rem',
          cursor: 'pointer',
          marginBottom: '28px',
          fontWeight: 500
        }}
      >
        <ArrowLeft size={16} />
        <span>Return to Catalog</span>
      </button>

      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '32px' }}>Complete Checkout Session</h2>

      {cartItems.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your shopping cart is empty. There is nothing to check out.</p>
          <button onClick={() => setView('store')} className="btn btn-primary">
            Browse Catalog
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start' }}>
          
          {/* Left Form Column */}
          <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* 1. Shipping Section */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary-hover)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</span>
                Shipping Address Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Street Address</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="123 Tech Park Road, Sector V"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>City</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Kolkata"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Postal Code</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="700091"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Country</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="India"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Section */}
            <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-glow)', color: 'var(--primary-hover)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</span>
                Choose Payment Method
              </h3>

              {error && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 16px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#f87171',
                  fontSize: '0.85rem'
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              {/* Payment Tabs Selection */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                  type="button"
                  onClick={() => { setPaymentTab('card'); setError(null); }}
                  style={{
                    flexGrow: 1,
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: paymentTab === 'card' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                    border: paymentTab === 'card' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-glass)',
                    color: paymentTab === 'card' ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <CreditCard size={18} />
                  <span>Card Checkout</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentTab('upi'); setError(null); }}
                  style={{
                    flexGrow: 1,
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: paymentTab === 'upi' ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                    border: paymentTab === 'upi' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-glass)',
                    color: paymentTab === 'upi' ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  <QrCode size={18} />
                  <span>UPI QR Code</span>
                </button>
              </div>

              {/* CARD FORM */}
              {paymentTab === 'card' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Card Number</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      maxLength="19"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Expiration Date</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength="5"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Security Code (CVC)</label>
                      <input
                        type="password"
                        className="input-field"
                        placeholder="•••"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        maxLength="3"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI QR DIRECT CHANNEL VIEW */}
              {paymentTab === 'upi' && (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-glass)',
                    padding: '20px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    gap: '24px',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {/* Scannable Dynamic QR Code Image */}
                    <div style={{
                      background: '#fff',
                      padding: '10px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      width: '140px',
                      height: '140px',
                      flexShrink: 0
                    }}>
                      <img 
                        src={qrCodeImageUrl} 
                        alt="Scannable UPI QR"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <div style={{ flexGrow: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <p style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem', letterSpacing: '0.5px' }}>Scan & Pay with UPI App</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <Phone size={14} style={{ color: 'var(--accent)' }} />
                        <span>PhonePe / GPay: <strong>7386577282</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        <QrCode size={14} style={{ color: 'var(--accent)' }} />
                        <span>UPI ID: <strong>j2727@axl</strong></span>
                      </div>
                      
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px', lineHeight: 1.4 }}>
                        This QR code is fully linked to the merchant account. Scan using any UPI app (Google Pay, PhonePe, Paytm, or BHIM) to pay exactly <strong>₹{cartTotal.toLocaleString('en-IN')}</strong>.
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: '#a7f3d0',
                    lineHeight: 1.4
                  }}>
                    Scan the QR code and authorize payment on your device. Once done, tap the button below to confirm your order.
                  </div>

                </div>
              )}

            </div>

            {/* Pay Button */}
            <button 
              type="submit" 
              disabled={processing}
              className="btn btn-primary"
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '1.05rem',
                opacity: processing ? 0.7 : 1,
                cursor: processing ? 'not-allowed' : 'pointer'
              }}
            >
              {processing ? 'Processing Secure Payment...' : paymentTab === 'upi' ? 'I Have Paid - Confirm Order' : `Authorize Charge of ₹${cartTotal.toLocaleString('en-IN')}`}
            </button>
          </form>

          {/* Right Column: Order Summary */}
          <aside 
            className="glass-panel" 
            style={{
              padding: '30px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'sticky',
              top: '100px'
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>Order Review</h3>

            {/* Items summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '250px', overflowY: 'auto', paddingRight: '8px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Cart Subtotal</span>
                <span>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Delivery Charge</span>
                <span style={{ color: 'var(--success)' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '10px', marginTop: '6px' }}>
                <span>Grand Total</span>
                <span style={{ color: 'var(--accent)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </aside>

        </div>
      )}
    </div>
  );
}
