import React, { useState, useEffect, useCallback } from 'react';
import { Filter, Star, RefreshCw } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductCatalog({ search, onViewDetails }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [minRating, setMinRating] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { label: 'All Catalog', value: '' },
    { label: 'Electronics', value: 'Electronics' },
    { label: 'Fashion', value: 'Fashion' },
    { label: 'Home & Living', value: 'Home & Living' },
    { label: 'Wellness', value: 'Wellness' }
  ];

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `http://localhost:5000/api/products?sortBy=${sortBy}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
      if (maxPrice < 100000) url += `&maxPrice=${maxPrice}`;
      if (minRating) url += `&rating=${minRating}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError('Could not load products. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, maxPrice, minRating, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetFilters = () => {
    setSelectedCategory('');
    setMaxPrice(100000);
    setMinRating('');
    setSortBy('newest');
  };

  return (
    <div style={{ padding: '0 24px 60px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Catalog Title Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {selectedCategory ? `${selectedCategory} Collection` : 'Our Collections'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Showing {products.length} products
          </p>
        </div>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field"
            style={{ width: '180px', padding: '8px 12px', cursor: 'pointer' }}
          >
            <option value="newest">Newest Arrivals</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="ratingDesc">Top Customer Rated</option>
          </select>
        </div>
      </div>

      {/* Main Grid & Filters Pane Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Side: Filter Sidebar */}
        <aside 
          className="glass-panel" 
          style={{
            padding: '24px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            position: 'sticky',
            top: '100px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
              <Filter size={16} />
              <span>Filters</span>
            </div>
            <button 
              onClick={resetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-hover)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Clear All
            </button>
          </div>

          {/* Categories Filter list */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>Category</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  style={{
                    background: selectedCategory === cat.value ? 'var(--primary-glow)' : 'transparent',
                    border: selectedCategory === cat.value ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                    color: selectedCategory === cat.value ? 'var(--text-main)' : 'var(--text-muted)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'left',
                    fontFamily: 'var(--font-outfit)',
                    fontSize: '0.9rem',
                    fontWeight: selectedCategory === cat.value ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>Max Price</h4>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min="200" 
              max="100000" 
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--primary)',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              <span>₹200</span>
              <span>₹1,00,000</span>
            </div>
          </div>

          {/* Rating filter */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-main)' }}>Minimum Rating</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[4.5, 4.0, 3.0].map((stars) => (
                <label 
                  key={stars} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    fontSize: '0.9rem', 
                    color: minRating === stars.toString() ? 'var(--text-main)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === stars.toString()}
                    onChange={() => setMinRating(stars.toString())}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#fbbf24' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        fill={i < Math.floor(stars) ? '#fbbf24' : 'none'} 
                        stroke={i < Math.floor(stars) ? 'none' : 'currentColor'} 
                      />
                    ))}
                  </div>
                  <span>{stars}+ Stars</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Grid of Product Cards */}
        <main>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0', gap: '16px' }}>
              <RefreshCw className="spin" style={{ color: 'var(--primary-hover)', width: '32px', height: '32px', animation: 'spin 1.5s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)' }}>Loading products catalog...</p>
              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : error ? (
            <div className="glass-panel" style={{ padding: '40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
              <p style={{ color: 'var(--error)', fontWeight: 600 }}>{error}</p>
              <button onClick={fetchProducts} className="btn btn-secondary" style={{ marginTop: '16px' }}>
                Retry Connection
              </button>
            </div>
          ) : products.length === 0 ? (
            <div 
              className="glass-panel animate-fade-in" 
              style={{ 
                padding: '80px 40px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-glass)', 
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}
            >
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No products found matching your search filters.</p>
              <button onClick={resetFilters} className="btn btn-secondary">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '24px'
            }}>
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onViewDetails={onViewDetails} 
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
