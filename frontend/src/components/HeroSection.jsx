import React from 'react';

export default function HeroSection({ onShopNow }) {
  return (
    <div 
      className="glass-panel" 
      style={{
        position: 'relative',
        margin: '30px 24px',
        padding: '80px 48px',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-glass)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '24px'
      }}
    >
      {/* Background Graphic elements */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
        animation: 'pulse-glow 6s infinite ease-in-out'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        right: '15%',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
        animation: 'pulse-glow 8s infinite ease-in-out 1s'
      }} />

      {/* Hero Badge */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '6px 16px',
        borderRadius: '50px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: 'var(--accent)',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        zIndex: 1
      }}>
        Next-Gen Digital Catalog
      </div>

      {/* Hero Main Copy */}
      <div style={{ maxWidth: '650px', zIndex: 1 }}>
        <h1 
          className="text-gradient" 
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}
        >
          Elevate Your Digital Experience
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Discover our curated collection of premium gadgets, mechanical equipment, ergonomic home goods, and wellness products. Engineered for modern creators and builders.
        </p>
      </div>

      {/* Hero CTAs */}
      <div style={{ display: 'flex', gap: '16px', zIndex: 1 }}>
        <button onClick={onShopNow} className="btn btn-primary" style={{ padding: '14px 32px' }}>
          Explore Products
        </button>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginLeft: '16px' }}>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>40%</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Launch Discount</p>
          </div>
          <div style={{ height: '30px', width: '1px', background: 'var(--border-glass)' }} />
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Free</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Worldwide Shipping</p>
          </div>
        </div>
      </div>
    </div>
  );
}
