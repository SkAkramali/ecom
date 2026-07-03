const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default Users
const users = [
  {
    id: "admin-user-id",
    name: "Alex Mercer (Admin)",
    email: "admin@ecommerce.com",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: "customer-user-id",
    name: "John Doe (Customer)",
    email: "user@ecommerce.com",
    passwordHash: bcrypt.hashSync("user123", 10),
    role: "customer",
    createdAt: new Date().toISOString()
  }
];

// Lists of terms to programmatically generate 100 high-quality products (25 in each category)
const categories = ["Electronics", "Fashion", "Home & Living", "Wellness"];

const electronicAdjectives = ["Quantum", "Apex", "Aura", "Nova", "Nebula", "Spectra", "Hyper", "Vortex", "Matrix", "Fusion", "Sonic", "Optix"];
const electronicNouns = [
  { name: "ANC Headphones", desc: "Premium over-ear active noise cancelling headphones with custom dynamic drivers and glowing mesh details.", basePrice: 12999, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" },
  { name: "Curved OLED Monitor", desc: "Stunning high-refresh-rate curved display with true-black contrast and synchronized ambient backlighting.", basePrice: 49999, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80" },
  { name: "Mechanical Keyboard", desc: "Hot-swappable clicky mechanical keyboard with PBT double-shot keycaps and frosted RGB underglow.", basePrice: 6999, img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80" },
  { name: "Smartwatch Elite", desc: "Elegant wearable tracker featuring health metrics, AMOLED display, and 10-day active battery life.", basePrice: 14999, img: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&w=600&q=80" },
  { name: "Wireless Earbuds", desc: "Ultra-compact true wireless earbuds with touch gestures, water resistance, and crystal clear calling.", basePrice: 4999, img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80" },
  { name: "4K Laser Projector", desc: "Cinematic home theater projector with vivid colors, auto keystone correction, and built-in speakers.", basePrice: 79999, img: "https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80" }
];

const fashionAdjectives = ["Eclipse", "Obsidian", "Stealth", "Urban", "Nomad", "Classic", "Vanguard", "Summit", "Crest", "Drift", "Luxe", "Sleek"];
const fashionNouns = [
  { name: "Leather Jacket", desc: "Tailored from premium full-grain leather, styled with gunmetal zippers and comfortable quilted lining.", basePrice: 15999, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80" },
  { name: "Knit Sneakers", desc: "Ultralight, breathable woven sneakers with high-rebound cushioning midsoles for daily walking comfort.", basePrice: 5999, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80" },
  { name: "Canvas Backpack", desc: "Weatherproof roll-top travel pack with padded laptop sleeve and internal tech storage compartments.", basePrice: 3999, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80" },
  { name: "Polarized Sunglasses", desc: "Classic aviator style with polarized protective lenses and lightweight metallic temples.", basePrice: 2499, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80" },
  { name: "Minimalist Wallet", desc: "Slim RFID-blocking leather cardholder designed for front-pocket carry. Stores up to 8 cards.", basePrice: 1499, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80" },
  { name: "Stealth Hoodie", desc: "Heavyweight organic cotton hoodie with reinforced stitching, utility pockets, and adjustable hood drawstrings.", basePrice: 3499, img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80" }
];

const homeAdjectives = ["Zenith", "Apex", "Haven", "Minimal", "Nordic", "Ember", "Bloom", "Timber", "Breeze", "Nest", "Cove", "Modo"];
const homeNouns = [
  { name: "Smart Lamp", desc: "Ambient color-changing workspace lamp with dynamic touch control sliders and a wireless charger base.", basePrice: 4499, img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80" },
  { name: "Ergonomic Chair", desc: "Fully adjustable ergonomic desk chair with tension controls, breathable mesh back, and 3D armrests.", basePrice: 19999, img: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80" },
  { name: "Aroma Diffuser", desc: "Ultrasonic humidifying essential oil diffuser with real ceramic finish and warm candlelight effects.", basePrice: 2499, img: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" },
  { name: "Felt Desk Mat", desc: "Premium merino wool felt desk pad offering smooth mouse tracking and protection for your workspace.", basePrice: 1299, img: "https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80" },
  { name: "Ceramic Mug Set", desc: "Set of 4 hand-glazed stoneware coffee mugs. Textured earthy clay finish, microwave and dishwasher safe.", basePrice: 999, img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80" },
  { name: "Air Purifier", desc: "Compact HEPA air purifier with multi-stage allergen filtering, active carbon, and silent night mode.", basePrice: 8999, img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80" }
];

const wellnessAdjectives = ["Vitality", "Solace", "Rest", "Harmonize", "Prana", "Pure", "Calm", "Active", "Lotus", "Zen", "Flora", "Soothe"];
const wellnessNouns = [
  { name: "Yoga Mat", desc: "Eco-friendly non-slip natural rubber yoga mat with alignment guidance lines and carrying strap.", basePrice: 2999, img: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=80" },
  { name: "Massage Gun", desc: "Powerful handheld percussive massager with 6 interchangeable attachments and 5 speed levels.", basePrice: 7999, img: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80" },
  { name: "Acupressure Mat", desc: "Cotton spikes mat designed to relieve back tension, stimulate circulation, and induce deep sleep.", basePrice: 1999, img: "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=600&q=80" },
  { name: "Sleep Mask", desc: "Contoured 3D blackout silk sleeping mask designed for pressure-free eye comfort and deeper REM cycles.", basePrice: 899, img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80" },
  { name: "Herbal Tea Set", desc: "Curated loose-leaf wellness tea collection containing organic chamomile, peppermint, and lavender blends.", basePrice: 699, img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80" },
  { name: "Foam Roller", desc: "High-density foam grid roller for muscle physical therapy, trigger point release, and joint mobility.", basePrice: 1199, img: "https://images.unsplash.com/photo-1600881333168-2ef49b341f30?auto=format&fit=crop&w=600&q=80" }
];

const products = [];

// Generate exactly 25 products for each category to reach exactly 100 products
for (let catIdx = 0; catIdx < 4; catIdx++) {
  const category = categories[catIdx];
  let adjList, nounList;
  
  if (category === "Electronics") {
    adjList = electronicAdjectives;
    nounList = electronicNouns;
  } else if (category === "Fashion") {
    adjList = fashionAdjectives;
    nounList = fashionNouns;
  } else if (category === "Home & Living") {
    adjList = homeAdjectives;
    nounList = homeNouns;
  } else {
    adjList = wellnessAdjectives;
    nounList = wellnessNouns;
  }

  for (let i = 1; i <= 25; i++) {
    // Pick adjective and noun programmatically to make unique combinations
    const adj = adjList[(i * 3 + catIdx) % adjList.length];
    const itemNoun = nounList[(i * 7) % nounList.length];
    
    const pName = `${adj} ${itemNoun.name}`;
    
    // Add variations to prices so they are not all exactly identical
    const priceVariance = (i * 250) - 2500;
    const finalPrice = Math.max(itemNoun.basePrice + priceVariance, 499);
    
    // Stock variation: some items have low stock or out of stock (e.g. index 13)
    let stock = (i * 3) % 40;
    if (i === 13) stock = 0; // Seeding an out-of-stock item for testing
    
    // Rating variation: 3.9 to 4.9
    const rating = parseFloat((4.0 + ((i * 3) % 10) / 10).toFixed(1));

    products.push({
      id: `prod-${category.toLowerCase().replace(/[^a-z]/g, '')}-${i}`,
      name: pName,
      description: `Upgrade your daily lifestyle with this ${pName}. ${itemNoun.desc} Highly recommended, long-lasting performance, crafted with premium high-end materials.`,
      price: Math.round(finalPrice),
      category,
      imageUrl: itemNoun.img,
      rating,
      stock,
      createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString() // Different times for newest sorting
    });
  }
}

// Save seeded arrays
fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2), 'utf8');
fs.writeFileSync(path.join(DATA_DIR, 'orders.json'), JSON.stringify([], null, 2), 'utf8');

console.log(`Database seeded successfully! Created ${products.length} products (25 in each of the 4 categories) in Indian Currency (INR).`);
