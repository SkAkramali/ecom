require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { verifyToken, isAdmin, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Stripe config
let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Stripe client:', err);
  }
} else {
  console.log('No Stripe key found. Running in Stripe mock-gateway mode.');
}

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- AUTHENTICATION ROUTES ---

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide name, email, and password.' });
  }

  const existingUser = db.findOne('users', { email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = db.insert('users', {
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'customer' // Defaults to customer
  });

  const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter email and password.' });
  }

  const user = db.findOne('users', { email: email.toLowerCase() });
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// GET /api/auth/me
app.get('/api/auth/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});


// --- PRODUCT ROUTES ---

// GET /api/products (List with search & filter & sort)
app.get('/api/products', (req, res) => {
  let products = db.find('products');

  const { search, category, minPrice, maxPrice, rating, sortBy } = req.query;

  // 1. Text Search
  if (search) {
    const searchLower = search.toLowerCase();
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.description.toLowerCase().includes(searchLower)
    );
  }

  // 2. Category Filter
  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // 3. Price Filter
  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice));
  }

  // 4. Rating Filter (minimum star rating)
  if (rating) {
    products = products.filter(p => p.rating >= parseFloat(rating));
  }

  // 5. Sorting
  if (sortBy) {
    if (sortBy === 'priceAsc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'ratingDesc') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  res.json(products);
});

// GET /api/products/:id (Single Product)
app.get('/api/products/:id', (req, res) => {
  const product = db.findOne('products', { id: req.params.id });
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(product);
});

// POST /api/products (Admin Only: Create Product)
app.post('/api/products', verifyToken, isAdmin, (req, res) => {
  const { name, description, price, category, imageUrl, stock } = req.body;

  if (!name || !description || price === undefined || !category || !imageUrl || stock === undefined) {
    return res.status(400).json({ error: 'Please provide all required product details.' });
  }

  const newProduct = db.insert('products', {
    name,
    description,
    price: parseFloat(price),
    category,
    imageUrl,
    stock: parseInt(stock),
    rating: 5.0 // Default rating for new products
  });

  res.status(201).json(newProduct);
});

// PUT /api/products/:id (Admin Only: Update Product)
app.put('/api/products/:id', verifyToken, isAdmin, (req, res) => {
  const { name, description, price, category, imageUrl, stock, rating } = req.body;
  const productId = req.params.id;

  const product = db.findOne('products', { id: productId });
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (description !== undefined) updateFields.description = description;
  if (price !== undefined) updateFields.price = parseFloat(price);
  if (category !== undefined) updateFields.category = category;
  if (imageUrl !== undefined) updateFields.imageUrl = imageUrl;
  if (stock !== undefined) updateFields.stock = parseInt(stock);
  if (rating !== undefined) updateFields.rating = parseFloat(rating);

  db.update('products', { id: productId }, updateFields);
  const updatedProduct = db.findOne('products', { id: productId });

  res.json(updatedProduct);
});

// DELETE /api/products/:id (Admin Only: Delete Product)
app.delete('/api/products/:id', verifyToken, isAdmin, (req, res) => {
  const productId = req.params.id;
  const product = db.findOne('products', { id: productId });
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  db.delete('products', { id: productId });
  res.json({ message: 'Product deleted successfully.' });
});


// --- ORDERS & PAYMENTS ROUTES ---

// POST /api/orders/payment-intent (Create Checkout Session / Intent)
app.post('/api/orders/payment-intent', verifyToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid checkout amount.' });
  }

  // If real Stripe is available
  if (stripe) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // in paise (cents equivalent)
        currency: 'inr',
        automatic_payment_methods: { enabled: true }
      });
      return res.json({
        clientSecret: paymentIntent.client_secret,
        mock: false
      });
    } catch (err) {
      console.error('Stripe PaymentIntent Creation Error:', err);
      return res.status(500).json({ error: 'Stripe transaction creation failed.' });
    }
  }

  // Fallback to Mock Session
  res.json({
    clientSecret: `mock_secret_intent_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
    mock: true
  });
});

// POST /api/orders (Create Order)
app.post('/api/orders', verifyToken, (req, res) => {
  const { items, totalAmount, shippingAddress, paymentMethod, paymentId } = req.body;

  if (!items || !items.length || !totalAmount || !shippingAddress) {
    return res.status(400).json({ error: 'Please provide all details to place order.' });
  }

  // Verify stock levels and decrement
  for (const item of items) {
    const product = db.findOne('products', { id: item.id });
    if (!product) {
      return res.status(400).json({ error: `Product ${item.name} not found.` });
    }
    if (product.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for product ${item.name}.` });
    }
  }

  // Deduct stock levels
  for (const item of items) {
    const product = db.findOne('products', { id: item.id });
    db.update('products', { id: item.id }, { stock: product.stock - item.quantity });
  }

  const newOrder = db.insert('orders', {
    userId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items,
    totalAmount: parseFloat(totalAmount),
    shippingAddress,
    paymentMethod: paymentMethod || 'Card',
    paymentId: paymentId || `mock_pay_${Date.now()}`,
    paymentStatus: 'Paid',
    orderStatus: 'Pending' // Initial state: Pending, Shipped, Delivered
  });

  res.status(201).json(newOrder);
});

// GET /api/orders (Admins see all, users see their own)
app.get('/api/orders', verifyToken, (req, res) => {
  if (req.user.role === 'admin') {
    const allOrders = db.find('orders');
    // Sort orders by newest first
    allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return res.json(allOrders);
  }

  const userOrders = db.find('orders', { userId: req.user.id });
  userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(userOrders);
});

// PUT /api/orders/:id/status (Admin Only: Update Order Status)
app.put('/api/orders/:id/status', verifyToken, isAdmin, (req, res) => {
  const { orderStatus } = req.body;
  const orderId = req.params.id;

  if (!orderStatus) {
    return res.status(400).json({ error: 'Please specify new order status.' });
  }

  const order = db.findOne('orders', { id: orderId });
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  db.update('orders', { id: orderId }, { orderStatus });
  const updatedOrder = db.findOne('orders', { id: orderId });

  res.json(updatedOrder);
});


// Start server
app.listen(PORT, () => {
  console.log(`E-Commerce Backend running on http://localhost:${PORT}`);
});
