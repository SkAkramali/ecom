import React, { useState, useContext } from 'react';
import { X, Star, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useContext(CartContext);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
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
        backgroundColor: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '850px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-glass-hover)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="btn btn-secondary"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            borderRadius: '50%',
            padding: '8px',
            background: 'rgba(7, 8, 14, 0.65)'
          }}
        >
          <X size={18} />
        </button>

        {/* Product Image Cover */}
        <div style={{ position: 'relative', paddingTop: '90%', background: 'rgba(0,0,0,0.1)' }}>
          <img 
            src={product.imageUrl} 
            alt={product.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>

        {/* Product Content Details */}
        <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            {/* Category Tag */}
            <span style={{
              background: 'var(--primary-glow)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: 'var(--primary-hover)',
              padding: '4px 12px',
              borderRadius: '50px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {product.category}
            </span>
            
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '12px', lineHeight: 1.2 }}>
              {product.name}
            </h2>

            {/* Ratings & Stock info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                <Star size={16} fill="#fbbf24" stroke="none" />
                <span style={{ fontWeight: 600 }}>{product.rating.toFixed(1)}</span>
                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>(Customer Rating)</span>
              </div>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-dim)' }} />
              <span style={{ 
                fontSize: '0.85rem', 
                color: isOutOfStock ? 'var(--error)' : product.stock <= 5 ? 'var(--warning)' : 'var(--success)',
                fontWeight: 600
              }}>
                {isOutOfStock ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} units left` : 'In Stock'}
              </span>
            </div>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {product.description}
          </p>

          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </div>

          {/* Controls Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            {!isOutOfStock && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Quantity:</span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <button 
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '10px 14px', cursor: 'pointer' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                  <button 
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', padding: '10px 14px', cursor: 'pointer' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                disabled={isOutOfStock}
                onClick={handleAdd}
                className="btn btn-primary"
                style={{ 
                  flexGrow: 1, 
                  padding: '14px 28px',
                  background: added ? 'var(--success)' : 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.5 : 1
                }}
              >
                {added ? (
                  <>
                    <Check size={18} />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>Add to Shopping Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
