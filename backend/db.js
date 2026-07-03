const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory data store cache
const cache = {};

function getFilePath(collection) {
  return path.join(DATA_DIR, `${collection}.json`);
}

function loadCollection(collection) {
  if (cache[collection]) {
    return cache[collection];
  }
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    cache[collection] = [];
    return cache[collection];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    cache[collection] = JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading collection ${collection}:`, err);
    cache[collection] = [];
  }
  return cache[collection];
}

function saveCollection(collection) {
  const filePath = getFilePath(collection);
  try {
    fs.writeFileSync(filePath, JSON.stringify(cache[collection] || [], null, 2), 'utf8');
  } catch (err) {
    console.error(`Error saving collection ${collection}:`, err);
  }
}

const db = {
  find: (collection, query = {}) => {
    const items = loadCollection(collection);
    return items.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  findOne: (collection, query = {}) => {
    const items = loadCollection(collection);
    return items.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  },

  insert: (collection, doc) => {
    const items = loadCollection(collection);
    const newDoc = {
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      ...doc
    };
    items.push(newDoc);
    saveCollection(collection);
    return newDoc;
  },

  update: (collection, query, updateData) => {
    const items = loadCollection(collection);
    let updatedCount = 0;
    
    cache[collection] = items.map(item => {
      let matches = true;
      for (const key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        return { ...item, ...updateData, updatedAt: new Date().toISOString() };
      }
      return item;
    });

    if (updatedCount > 0) {
      saveCollection(collection);
    }
    return updatedCount;
  },

  delete: (collection, query) => {
    const items = loadCollection(collection);
    const initialLength = items.length;
    
    cache[collection] = items.filter(item => {
      let matches = true;
      for (const key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      return !matches;
    });

    const deletedCount = initialLength - cache[collection].length;
    if (deletedCount > 0) {
      saveCollection(collection);
    }
    return deletedCount;
  }
};

module.exports = db;
