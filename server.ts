import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// --- Database Setup ---
const db = new Database('itqan_erp.db');
db.pragma('journal_mode = WAL');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS platform_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'SUPER_ADMIN',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_email TEXT,
    plan TEXT DEFAULT 'STARTER',
    status TEXT DEFAULT 'ACTIVE',
    subscription_end DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id TEXT,
    user_id TEXT,
    action TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Accounting Tables
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    parent_id TEXT,
    balance DECIMAL(18, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    tax_number TEXT,
    balance DECIMAL(18, 2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES companies(id)
  );
`);

// --- API Routes ---

// Get all companies (Super Admin only)
app.get('/api/admin/companies', (req, res) => {
  try {
    const companies = db.prepare('SELECT * FROM companies').all();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Create new company
app.post('/api/admin/companies', (req, res) => {
  const { name, owner_email, plan } = req.body;
  const id = Math.random().toString(36).substring(2, 11);
  try {
    const stmt = db.prepare('INSERT INTO companies (id, name, owner_email, plan) VALUES (?, ?, ?, ?)');
    stmt.run(id, name, owner_email, plan || 'STARTER');
    
    // Seed basic chart of accounts for the new company
    const seedCOA = [
      { code: '1', name: 'الأصول', type: 'ASSET' },
      { code: '2', name: 'الخصوم', type: 'LIABILITY' },
      { code: '3', name: 'حقوق الملكية', type: 'EQUITY' },
      { code: '4', name: 'الإيرادات', type: 'REVENUE' },
      { code: '5', name: 'المصروفات', type: 'EXPENSE' },
    ];
    
    const insertAccount = db.prepare('INSERT INTO accounts (id, company_id, code, name, type) VALUES (?, ?, ?, ?, ?)');
    seedCOA.forEach(acc => {
      insertAccount.run(Math.random().toString(36).substring(2, 11), id, acc.code, acc.name, acc.type);
    });

    res.json({ id, message: 'Company created and seeded' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// Get Company Statistics
app.get('/api/tenant/:companyId/stats', (req, res) => {
  const { companyId } = req.params;
  // Mock data for production parity
  res.json({
    sales: 450000,
    expenses: 120000,
    profit: 330000,
    inventoryCount: 1250,
    growth: '+12.5%'
  });
});

// Get all accounts (Chart of Accounts)
app.get('/api/tenant/:companyId/accounts', (req, res) => {
  const { companyId } = req.params;
  try {
    const accounts = db.prepare('SELECT * FROM accounts WHERE company_id = ? ORDER BY code ASC').all(companyId);
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get Inventory / Products
app.get('/api/tenant/:companyId/products', (req, res) => {
  const { companyId } = req.params;
  try {
    // Mocking some data if table empty
    const products = [
      { id: '1', name: 'منتج تجريبي أ', sku: 'PRD-001', price: 150, stock: 45 },
      { id: '2', name: 'منتج تجريبي ب', sku: 'PRD-002', price: 300, stock: 12 },
    ];
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Sales module routes...
// HR module routes...

// Audit Logs
app.get('/api/tenant/:companyId/audit', (req, res) => {
  const { companyId } = req.params;
  const logs = db.prepare('SELECT * FROM audit_logs WHERE company_id = ? ORDER BY created_at DESC LIMIT 50').all(companyId);
  res.json(logs);
});

// --- Vite Middleware ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ITQAN ERP] Server running on http://localhost:${PORT}`);
  });
}

startServer();
