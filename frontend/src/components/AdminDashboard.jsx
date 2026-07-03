import React, { useState, useEffect, useContext, useCallback } from 'react';
import { PlusCircle, Search, Edit2, Trash2, TrendingUp, ShoppingCart, Users, AlertTriangle, X, Check, Save } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, inventory, orders

  // Products state
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // If null, we are ADDING. Otherwise EDITING.
  const [error, setError] = useState(null);

  // Product Form states
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState('Electronics');
  const [prodImage, setProdImage] = useState('');
  const [prodStock, setProdStock] = useState(10);

  const API_URL = 'http://localhost:5000/api';

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load admin products:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(0);
    setProdCategory('Electronics');
    setProdImage('');
    setProdStock(10);
    setError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdCategory(prod.category);
    setProdImage(prod.imageUrl);
    setProdStock(prod.stock);
    setError(null);
    setModalOpen(true);
  };

  // Submit Product Add/Edit
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!prodName || !prodDesc || !prodImage || prodPrice <= 0 || prodStock < 0) {
      setError('Please provide all details and valid pricing/stock levels.');
      return;
    }

    try {
      let res;
      const body = {
        name: prodName,
        description: prodDesc,
        price: parseFloat(prodPrice),
        category: prodCategory,
        imageUrl: prodImage,
        stock: parseInt(prodStock)
      };

      if (editingProduct) {
        // Edit existing product
        res = await fetch(`${API_URL}/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
      } else {
        // Add new product
        res = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed.');

      // Refresh list and close
      fetchProducts();
      setModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_URL}/products/${prodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate metrics for analytics tab
  const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOrders = orders.length;
  const uniqueUsersCount = [...new Set(orders.map(o => o.userId))].length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto 80px auto', padding: '0 24px' }}>
      
      {/* Dashboard title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>Admin Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Control console for inventory, sales and processing orders.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1px', marginBottom: '32px' }}>
        {[
          { id: 'analytics', label: 'Analytics Insights' },
          { id: 'inventory', label: 'Store Inventory' },
          { id: 'orders', label: `Manage Orders (${orders.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab.id ? 'var(--text-main)' : 'var(--text-dim)',
              fontSize: '1rem',
              fontWeight: 600,
              padding: '12px 24px',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              fontFamily: 'var(--font-outfit)',
              transition: 'var(--transition-fast)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- 1. ANALYTICS VIEW --- */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Dashboard metric widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {/* Widget 1 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent)' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>₹{totalSales.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Widget 2 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--primary-glow)', color: 'var(--primary-hover)' }}>
                <ShoppingCart size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{totalOrders}</p>
              </div>
            </div>

            {/* Widget 3 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
                <Users size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Customers</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{uniqueUsersCount}</p>
              </div>
            </div>

            {/* Widget 4 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock Items</p>
                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>{lowStockCount}</p>
              </div>
            </div>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="glass-panel animate-fade-in" style={{ padding: '30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '24px' }}>Sales Analytics (Weekly Growth)</h3>
            <div style={{ position: 'relative', width: '100%', height: '240px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
              
              {/* Custom SVG Drawing */}
              <svg viewBox="0 0 700 240" style={{ width: '100%', height: '100%', padding: '10px 20px 20px 20px' }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0"/>
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="50" y1="40" x2="680" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <line x1="50" y1="100" x2="680" y2="100" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <line x1="50" y1="160" x2="680" y2="160" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <line x1="50" y1="210" x2="680" y2="210" stroke="rgba(255,255,255,0.1)" />

                {/* Y Axis Labels */}
                <text x="15" y="45" fill="var(--text-dim)" fontSize="10" fontWeight="600">₹1.5L</text>
                <text x="15" y="105" fill="var(--text-dim)" fontSize="10" fontWeight="600">₹1L</text>
                <text x="15" y="165" fill="var(--text-dim)" fontSize="10" fontWeight="600">₹50K</text>
                <text x="25" y="215" fill="var(--text-dim)" fontSize="10" fontWeight="600">₹0</text>

                {/* Plot Area Polyline Path */}
                <path
                  d="M 50 210 L 140 180 L 230 150 L 320 190 L 410 110 L 500 80 L 590 50 Q 640 40 680 40"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Filled Area Gradient */}
                <path
                  d="M 50 210 L 140 180 L 230 150 L 320 190 L 410 110 L 500 80 L 590 50 Q 640 40 680 40 L 680 210 Z"
                  fill="url(#chartGradient)"
                />

                {/* Nodes Dot indicators */}
                <circle cx="140" cy="180" r="4.5" fill="var(--bg-base)" stroke="var(--primary)" strokeWidth="2" />
                <circle cx="230" cy="150" r="4.5" fill="var(--bg-base)" stroke="var(--primary)" strokeWidth="2" />
                <circle cx="320" cy="190" r="4.5" fill="var(--bg-base)" stroke="var(--primary)" strokeWidth="2" />
                <circle cx="410" cy="110" r="4.5" fill="var(--bg-base)" stroke="var(--primary)" strokeWidth="2" />
                <circle cx="500" cy="80" r="4.5" fill="var(--bg-base)" stroke="var(--primary)" strokeWidth="2" />
                <circle cx="590" cy="50" r="4.5" fill="var(--bg-base)" stroke="var(--primary)" strokeWidth="2" />
                <circle cx="680" cy="40" r="4.5" fill="var(--accent)" stroke="var(--accent)" strokeWidth="2" />

                {/* X Axis Labels */}
                <text x="140" y="232" fill="var(--text-dim)" fontSize="10" textAnchor="middle">Mon</text>
                <text x="230" y="232" fill="var(--text-dim)" fontSize="10" textAnchor="middle">Tue</text>
                <text x="320" y="232" fill="var(--text-dim)" fontSize="10" textAnchor="middle">Wed</text>
                <text x="410" y="232" fill="var(--text-dim)" fontSize="10" textAnchor="middle">Thu</text>
                <text x="500" y="232" fill="var(--text-dim)" fontSize="10" textAnchor="middle">Fri</text>
                <text x="590" y="232" fill="var(--text-dim)" fontSize="10" textAnchor="middle">Sat</text>
                <text x="680" y="232" fill="var(--accent)" fontSize="10" fontWeight="600" textAnchor="middle">Today</text>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* --- 2. INVENTORY LIST VIEW --- */}
      {activeTab === 'inventory' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Inventory control headers */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Filter by name or category..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            </div>

            <button onClick={handleOpenAddModal} className="btn btn-primary">
              <PlusCircle size={18} /> Add New Product
            </button>
          </div>

          {/* Table Container */}
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Thumbnail</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Product Name</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Category</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Stock Levels</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingProducts ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px 20px', textAlignment: 'center', color: 'var(--text-muted)' }}>Loading items list...</td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No products in stock inventory.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLow = p.stock <= 5;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 20px' }}>
                          <img src={p.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-glass)' }} />
                        </td>
                        <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</td>
                        <td style={{ padding: '12px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.category}</td>
                        <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--accent)' }}>₹{p.price.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '12px 20px', color: isLow ? 'var(--warning)' : 'var(--text-main)', fontSize: '0.9rem', fontWeight: isLow ? 600 : 400 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: isLow ? 'var(--warning)' : 'var(--success)' }} />
                            <span>{p.stock} units</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                            <button onClick={() => handleOpenEditModal(p)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}>
                              <Edit2 size={12} /> Edit
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)', gap: '4px' }}>
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- 3. ORDERS MANAGEMENT VIEW --- */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Order ID / Date</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Customer Details</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Items Ordered</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-dim)', textTransform: 'uppercase', textAlign: 'center' }}>Mark Transit</th>
                </tr>
              </thead>
              <tbody>
                {loadingOrders ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders catalog...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>No customer orders placed yet.</td>
                  </tr>
                ) : (
                  orders.map((o) => {
                    const dateStr = new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    return (
                      <tr key={o.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>#{o.id}</span>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>{dateStr}</p>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>{o.customerName}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{o.customerEmail}</span>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {o.items.map((item, idx) => (
                              <span key={idx}>• {item.name} <strong style={{ color: 'var(--text-main)' }}>×{item.quantity}</strong></span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontWeight: 800, color: 'var(--accent)' }}>₹{o.totalAmount.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            background: o.orderStatus === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' : o.orderStatus === 'Shipped' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            border: o.orderStatus === 'Delivered' ? '1px solid rgba(16, 185, 129, 0.3)' : o.orderStatus === 'Shipped' ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                            color: o.orderStatus === 'Delivered' ? 'var(--success)' : o.orderStatus === 'Shipped' ? 'var(--accent)' : 'var(--warning)',
                            padding: '4px 10px',
                            borderRadius: '50px',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}>
                            {o.orderStatus}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                          <select
                            value={o.orderStatus}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="input-field"
                            style={{ width: '130px', padding: '6px 8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)' }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT PRODUCT MODAL OVERLAY --- */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyPoint: 'center', justifyContent: 'center', padding: '24px' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass-hover)', padding: '36px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
            
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary" style={{ position: 'absolute', top: '16px', right: '16px', borderRadius: '50%', padding: '6px', background: 'rgba(255,255,255,0.02)' }}>
              <X size={16} />
            </button>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>
              {editingProduct ? 'Edit Store Product' : 'Add New Catalog Product'}
            </h3>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: '20px', color: '#f87171', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Product Title</label>
                <input type="text" className="input-field" placeholder="E.g., Quantum Sound Headsets" value={prodName} onChange={(e) => setProdName(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea className="input-field" placeholder="Full product features..." value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} rows="3" style={{ resize: 'vertical' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price (₹)</label>
                  <input type="number" step="0.01" className="input-field" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Initial Stock</label>
                  <input type="number" className="input-field" value={prodStock} onChange={(e) => setProdStock(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</label>
                  <select className="input-field" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Image URL</label>
                  <input type="text" className="input-field" placeholder="Unsplash URL..." value={prodImage} onChange={(e) => setProdImage(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px', padding: '14px' }}>
                <Save size={18} /> {editingProduct ? 'Save Product Changes' : 'Create Catalog Product'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
