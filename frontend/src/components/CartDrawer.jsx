import React, { useContext } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

export default function CartDrawer({ onClose, onOpenCheckout, onOpenAuth }) {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCheckoutClick = () => {
    onClose();
    if (!user) {
      onOpenAuth();
    } else {
      onOpenCheckout();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 5, 8, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 95,
        display: 'flex',
        justifyContent: 'flex-end'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border-glass-hover)',
          animation: 'slideInRight 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} style={{ color: 'var(--primary-hover)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your Shopping Cart</h3>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary"
            style={{ borderRadius: '50%', padding: '6px', background: 'rgba(255,255,255,0.02)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Drawer Body Items List */}
        <div style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '16px',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <ShoppingBag size={48} style={{ strokeWidth: 1.5, opacity: 0.4 }} />
              <div>
                <p style={{ fontWeight: 600 }}>Your cart is empty</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '4px' }}>Add products from catalog to get started.</p>
              </div>
              <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: '8px' }}>
                Browse Catalog
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  gap: '16px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  alignItems: 'center'
                }}
              >
                {/* Thumb image */}
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  style={{
                    width: '70px',
                    height: '70px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-glass)'
                  }}
                />

                {/* Info and Quantity controls */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                    {item.name}
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 700 }}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: 'rgba(255, 255, 255, 0.02)', 
                      border: '1px solid var(--border-glass)',
                      borderRadius: '4px'
                    }}>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '4px 8px', cursor: 'pointer' }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove button */}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Total & Checkout */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            background: 'rgba(7, 8, 14, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Subtotal:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center' }}>
              Taxes and shipping are calculated at checkout.
            </p>

            <button 
              onClick={handleCheckoutClick}
              className="btn btn-primary"
              style={{ padding: '14px', width: '100%', borderRadius: 'var(--radius-sm)' }}
            >
              {user ? 'Proceed to Checkout' : 'Sign In to Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
