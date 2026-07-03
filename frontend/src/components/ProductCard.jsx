import React, { useContext } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';

export default function ProductCard({ product, onViewDetails }) {
  const { addToCart } = useContext(CartContext);

  const isOutOfStock = product.stock <= 0;

  return (
    <div 
      className="glass-card animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Category & Stock Badges */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <span style={{
          background: 'rgba(7, 8, 14, 0.75)',
          border: '1px solid var(--border-glass)',
          padding: '4px 10px',
          borderRadius: '50px',
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--text-muted)',
          backdropFilter: 'blur(4px)'
        }}>
          {product.category}
        </span>
        {isOutOfStock ? (
          <span style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--error)',
            backdropFilter: 'blur(4px)'
          }}>
            Out of Stock
          </span>
        ) : product.stock <= 5 ? (
          <span style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            padding: '4px 10px',
            borderRadius: '50px',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--warning)',
            backdropFilter: 'blur(4px)'
          }}>
            Only {product.stock} left
          </span>
        ) : null}
      </div>

      {/* Product Image */}
      <div 
        onClick={() => onViewDetails(product)}
        style={{
          width: '100%',
          paddingTop: '75%', // 4:3 Aspect Ratio
          position: 'relative',
          background: 'rgba(255,255,255,0.02)',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
      >
        <img 
          src={product.imageUrl} 
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
          className="product-card-image"
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Rating Badge */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(7, 8, 14, 0.75)',
          padding: '4px 8px',
          borderRadius: '50px',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#fbbf24',
          backdropFilter: 'blur(4px)',
          border: '1px solid var(--border-glass)'
        }}>
          <Star size={12} fill="#fbbf24" stroke="none" />
          <span>{product.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Card Info Content */}
      <div style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: '8px'
      }}>
        <h3 
          onClick={() => onViewDetails(product)}
          style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {product.name}
        </h3>
        
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: 1.4,
          flexGrow: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {product.description}
        </p>

        {/* Price & Add to Cart button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <button 
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
            className="btn btn-primary"
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              opacity: isOutOfStock ? 0.5 : 1,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer'
            }}
          >
            <ShoppingCart size={15} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
