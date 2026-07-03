import React, { useState, useContext } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProductCatalog from './components/ProductCatalog';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutPage from './components/CheckoutPage';
import AdminDashboard from './components/AdminDashboard';
import OrderHistory from './components/OrderHistory';
import AuthModal from './components/AuthModal';
import { AuthContext } from './context/AuthContext';

export default function App() {
  const { user } = useContext(AuthContext);

  // Layout View States: 'store', 'checkout', 'admin', 'orders'
  const [view, setView] = useState('store');

  // Search input binding
  const [search, setSearch] = useState('');

  // Modal open states
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Shop now scroll anchor callback
  const handleShopNow = () => {
    window.scrollTo({
      top: 500,
      behavior: 'smooth'
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* 1. Header Navigation */}
      <Navbar 
        onOpenCart={() => setCartOpen(true)}
        onOpenAuth={() => setAuthOpen(true)}
        setView={setView}
        search={search}
        setSearch={setSearch}
      />

      {/* 2. Main Body Content Area */}
      <main style={{ flexGrow: 1 }}>
        {view === 'store' && (
          <div className="animate-fade-in">
            {/* Show Hero banner only if user has not typed in search bar */}
            {!search && <HeroSection onShopNow={handleShopNow} />}
            
            {/* Store Grid Products Catalog */}
            <div id="catalog-section">
              <ProductCatalog 
                search={search} 
                onViewDetails={(prod) => setSelectedProduct(prod)} 
              />
            </div>
          </div>
        )}

        {view === 'checkout' && (
          <CheckoutPage setView={setView} />
        )}

        {view === 'admin' && (
          // Protect Admin Dashboard route
          user && user.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 24px' }}>
              <h3 style={{ color: 'var(--error)' }}>Access Denied</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Admin role required to view dashboard console.</p>
              <button onClick={() => setView('store')} className="btn btn-primary" style={{ marginTop: '20px' }}>
                Back to Storefront
              </button>
            </div>
          )
        )}

        {view === 'orders' && (
          // Protect Orders History route
          user ? (
            <OrderHistory />
          ) : (
            <div style={{ textAlign: 'center', padding: '100px 24px' }}>
              <h3>Sign In Required</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Please log in to view your orders history.</p>
              <button onClick={() => setAuthOpen(true)} className="btn btn-primary" style={{ marginTop: '20px' }}>
                Log In
              </button>
            </div>
          )
        )}
      </main>

      {/* 3. Footer Branding */}
      <footer 
        className="glass-panel" 
        style={{
          padding: '24px',
          textAlign: 'center',
          fontSize: '0.85rem',
          color: 'var(--text-dim)',
          borderTop: '1px solid var(--border-glass)',
          marginTop: 'auto'
        }}
      >
        <p>© 2026 Apex Store Inc. All rights reserved.</p>
        <p style={{ fontSize: '0.75rem', marginTop: '6px', color: 'rgba(255,255,255,0.15)' }}>
          Powered by Node.js + React.js + Stripe Mock Gateways.
        </p>
      </footer>

      {/* --- OVERLAY MODALS AND DRAWERS --- */}

      {/* Cart Drawer Panel */}
      {cartOpen && (
        <CartDrawer 
          onClose={() => setCartOpen(false)}
          onOpenCheckout={() => setView('checkout')}
          onOpenAuth={() => setAuthOpen(true)}
        />
      )}

      {/* Auth Register/Login Modal */}
      {authOpen && (
        <AuthModal 
          onClose={() => setAuthOpen(false)}
        />
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

    </div>
  );
}
