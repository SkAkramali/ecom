import React, { useState, useContext } from 'react';
import { X, Mail, Lock, User as UserIcon, AlertTriangle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AuthModal({ onClose }) {
  const { login, register, error, setError } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose(); // Close modal on success
    } catch (err) {
      // Error is stored in context and displayed
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setError(null);
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
        padding: '20px'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-glass-hover)',
          boxShadow: 'var(--shadow-lg)',
          padding: '36px',
          position: 'relative',
          animation: 'fadeIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards'
        }}
      >
        {/* Close button */}
        <button 
          onClick={() => { setError(null); onClose(); }}
          className="btn btn-secondary"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            borderRadius: '50%',
            padding: '6px',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <X size={16} />
        </button>

        {/* Modal Tabs Header */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', borderBottom: '1px solid var(--border-glass)', pb: '10px' }}>
          <button 
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              background: 'none',
              border: 'none',
              color: isLogin ? 'var(--text-main)' : 'var(--text-dim)',
              fontSize: '1.25rem',
              fontWeight: 700,
              cursor: 'pointer',
              paddingBottom: '10px',
              borderBottom: isLogin ? '2px solid var(--primary)' : '2px solid transparent',
              fontFamily: 'var(--font-outfit)',
              transition: 'var(--transition-fast)'
            }}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              background: 'none',
              border: 'none',
              color: !isLogin ? 'var(--text-main)' : 'var(--text-dim)',
              fontSize: '1.25rem',
              fontWeight: 700,
              cursor: 'pointer',
              paddingBottom: '10px',
              borderBottom: !isLogin ? '2px solid var(--primary)' : '2px solid transparent',
              fontFamily: 'var(--font-outfit)',
              transition: 'var(--transition-fast)'
            }}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div 
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#f87171',
              fontSize: '0.85rem'
            }}
          >
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Register Name Field */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  required
                />
                <UserIcon size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
              <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
                required
              />
              <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary" 
            style={{ 
              marginTop: '10px', 
              padding: '14px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing Authentication...' : isLogin ? 'Login to Account' : 'Create Free Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
