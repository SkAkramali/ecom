import React, { useContext, useState } from 'react';
import { ShoppingBag, User, LogOut, Settings, Key } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar({ onOpenCart, onOpenAuth, setView, search, setSearch }) {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 90,
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-glass)'
    }}>
      {/* Logo */}
      <div 
        onClick={() => { setView('store'); setSearch(''); }} 
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <span className="text-gradient" style={{ fontSize: '1.6rem', fontWeight: 800, trackingLetter: '-0.5px' }}>
          APEX<span style={{ color: 'var(--accent)' }}>STORE</span>
        </span>
      </div>

      {/* Search Bar */}
      <div style={{ flex: '0 1 450px', position: 'relative', margin: '0 20px' }}>
        <input
          id="nav-search-input"
          type="text"
          className="input-field"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setView('store'); // Reset view to store so user can see search results
          }}
          style={{ paddingLeft: '44px', borderRadius: '50px' }}
        />
        <svg 
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', width: '18px', height: '18px' }}
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Navigation Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* View Store Option */}
        <button 
          id="nav-browse-btn"
          onClick={() => setView('store')}
          className="btn btn-secondary" 
          style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'transparent', borderColor: 'transparent' }}
        >
          Browse
        </button>

        {/* View Order History if logged in */}
        {user && (
          <button 
            id="nav-orders-btn"
            onClick={() => setView('orders')}
            className="btn btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'transparent', borderColor: 'transparent' }}
          >
            My Orders
          </button>
        )}

        {/* Admin Dashboard Option */}
        {user && user.role === 'admin' && (
          <button 
            id="nav-admin-btn"
            onClick={() => setView('admin')}
            className="btn btn-secondary" 
            style={{ 
              padding: '8px 16px', 
              fontSize: '0.9rem', 
              borderColor: 'rgba(139, 92, 246, 0.4)', 
              color: 'var(--primary-hover)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Settings size={16} /> Admin Console
          </button>
        )}

        {/* Cart Trigger */}
        <button 
          id="nav-cart-btn"
          onClick={onOpenCart}
          className="btn btn-secondary" 
          style={{ position: 'relative', padding: '10px', borderRadius: '50%' }}
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #7c3aed 100%)',
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '50px',
              border: '2px solid var(--bg-base)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              {cartCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown or Sign In */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button 
              id="nav-profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="btn btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
            >
              <User size={18} />
              <span>{user.name.split(' ')[0]}</span>
            </button>
            
            {dropdownOpen && (
              <div 
                className="glass-panel" 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '200px',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-glass)',
                  padding: '8px 0',
                  animation: 'fadeIn 0.2s ease forwards'
                }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-glass)', marginBottom: '6px' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                </div>
                <button 
                  id="nav-logout-btn"
                  onClick={() => { logout(); setDropdownOpen(false); setView('store'); }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--error)',
                    textAlign: 'left',
                    fontFamily: 'var(--font-outfit)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            id="nav-signin-btn"
            onClick={onOpenAuth} 
            className="btn btn-primary" 
            style={{ padding: '8px 20px', borderRadius: '50px' }}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
