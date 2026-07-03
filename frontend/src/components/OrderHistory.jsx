import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Package, RefreshCw, ChevronRight, FileText } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function OrderHistory() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api';

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve orders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
              <p style="margin: 0 0 4px 0; font-size: 0.9rem;">Payment Method: <strong>${order.paymentMethod}</strong></p>
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

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto 80px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Your Orders</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track package shipments and review receipt history.</p>
        </div>
        <button onClick={fetchOrders} className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
          <RefreshCw className="spin" style={{ color: 'var(--primary-hover)', width: '28px', height: '28px', animation: 'spin 1.5s linear infinite' }} />
          <p style={{ color: 'var(--text-muted)' }}>Retrieving your order history...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
          <p style={{ color: 'var(--error)', fontWeight: 600 }}>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div 
          className="glass-panel animate-fade-in" 
          style={{ 
            padding: '60px 40px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-glass)', 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <Package size={40} style={{ strokeWidth: 1.5, opacity: 0.4 }} />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 600 }}>You haven't placed any orders yet.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>Checkout cart items to see them listed here.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={order.id} 
                className="glass-panel animate-fade-in"
                style={{
                  padding: '24px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Order Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Order Reference:</span>
                    <p style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>#{order.id}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Placed on {dateStr}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button 
                      onClick={() => printInvoice(order)} 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <FileText size={14} /> Invoice
                    </button>
                    <span style={{
                      background: order.orderStatus === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' : order.orderStatus === 'Shipped' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      border: order.orderStatus === 'Delivered' ? '1px solid rgba(16, 185, 129, 0.3)' : order.orderStatus === 'Shipped' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                      color: order.orderStatus === 'Delivered' ? 'var(--success)' : order.orderStatus === 'Shipped' ? 'var(--accent)' : 'var(--warning)',
                      padding: '6px 14px',
                      borderRadius: '50px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'inline-block'
                    }}>
                      Status: {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ChevronRight size={14} style={{ color: 'var(--text-dim)' }} />
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>
                          {item.name} <strong style={{ color: 'var(--accent)', marginLeft: '4px' }}>×{item.quantity}</strong>
                        </span>
                      </div>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer Totals */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Shipping to:</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Total amount paid:</span>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
