import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = 3000;
const prisma = new PrismaClient();

// Secrets
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_not_for_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_not_for_production';

// Middleware
app.use(express.json());
app.use(cors());

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// --- Authentication Helpers ---

const logAction = async (action: string, entityType: string, entityId: string | null, userId: string | null, tenantId: string | null, oldValues: any = null, newValues: any = null, req: any = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        userId,
        tenantId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress: req?.ip || null,
        userAgent: req?.headers?.['user-agent'] || null,
      }
    });
  } catch (err) {
    console.error('[AUDIT] Failed to log action:', err);
  }
};

const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token expired or invalid' });
  }
};

const authorize = (roles: UserRole[]) => (req: any, res: any, next: any) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// --- API Routes ---

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      await logAction('LOGIN_FAILED', 'User', null, null, null, null, { email }, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      await logAction('LOGIN_SUSPENDED', 'User', user.id, user.id, user.tenantId, null, null, req);
      return res.status(401).json({ error: 'Account suspended' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await logAction('LOGIN_SUCCESS', 'User', user.id, user.id, user.tenantId, null, null, req);
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid user' });

    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (err) {
    res.status(403).json({ error: 'Refresh token invalid' });
  }
});

app.get('/api/auth/me', authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { tenant: { include: { subscription: { include: { plan: true } } } } },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// --- Super Admin Routes ---

app.get('/api/admin/audit-logs', authenticate, authorize([UserRole.SUPER_ADMIN]), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } }, tenant: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/tenant/audit-logs', authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  try {
    const logs = await prisma.auditLog.findMany({
      where: { tenantId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.get('/api/admin/metrics', authenticate, authorize([UserRole.SUPER_ADMIN]), async (req, res) => {
  try {
    const [totalCompanies, activeCompanies, suspendedCompanies, totalUsers] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count(),
    ]);

    // Simple revenue estimation (mock for now, would sum subscription payments)
    const monthlyRevenue = 12500; 

    res.json({
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      totalUsers,
      monthlyRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin metrics' });
  }
});

app.get('/api/admin/companies', authenticate, authorize([UserRole.SUPER_ADMIN]), async (req, res) => {
  try {
    const companies = await prisma.tenant.findMany({
      include: {
        subscription: { include: { plan: true } },
        users: { take: 1, where: { role: UserRole.COMPANY_OWNER } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

app.post('/api/admin/companies', authenticate, authorize([UserRole.SUPER_ADMIN]), async (req, res) => {
  const { name, slug, ownerEmail, ownerName, ownerPassword, planId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return res.status(400).json({ error: 'Plan not found' });

    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        users: {
          create: {
            email: ownerEmail,
            name: ownerName,
            password: hashedPassword,
            role: UserRole.COMPANY_OWNER,
          },
        },
        subscription: {
          create: {
            planId: plan.id,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 day trial
            status: 'TRIALING',
          },
        },
      },
    });

    res.json(tenant);
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Slug or Email already exists' });
    res.status(500).json({ error: 'Failed to create company' });
  }
});

// --- Tenant Routes ---

app.get('/api/tenant/reports/:type', authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { type } = req.params;

  try {
    if (type === 'pnl') {
      const revenue = await prisma.invoice.aggregate({ where: { tenantId, status: 'PAID' }, _sum: { totalAmount: true } });
      const expenses = await prisma.expense.aggregate({ where: { tenantId }, _sum: { amount: true } });
      const salaries = await prisma.employee.aggregate({ where: { tenantId }, _sum: { salary: true } });
      
      const totalRevenue = revenue._sum.totalAmount || 0;
      const totalExpenses = (expenses._sum.amount || 0) + (salaries._sum.salary || 0);
      
      return res.json({
        'إجمالي المبيعات (المحصلة)': totalRevenue,
        'إجمالي المصاريف والرواتب': totalExpenses,
        'صافي الربح / الخسارة التشغيلية': totalRevenue - totalExpenses,
        'عدد العمليات المنفذة': await prisma.invoice.count({ where: { tenantId } })
      });
    }

    if (type === 'stock-status') {
      const products = await prisma.product.findMany({ where: { tenantId }, select: { nameAr: true, stock: true, price: true } });
      const report: any = {};
      products.forEach(p => {
        report[p.nameAr] = `${p.stock} قطعة (بقيمة ${(p.stock * p.price).toLocaleString()} IQD)`;
      });
      return res.json(report);
    }

    if (type === 'trial-balance') {
      const accounts = await prisma.account.findMany({ where: { tenantId } });
      const report: any = {};
      accounts.forEach(a => {
        report[`${a.code} - ${a.name}`] = a.balance || 0;
      });
      return res.json(report);
    }

    if (type === 'sales-summary') {
      const customers = await prisma.customer.findMany({ 
        where: { tenantId }, 
        include: { invoices: true } 
      });
      const report: any = {};
      customers.forEach(c => {
        const total = c.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
        report[c.name] = `${total.toLocaleString()} IQD (عدد الفواتير: ${c.invoices.length})`;
      });
      return res.json(report);
    }

    res.status(404).json({ error: 'Report type not found' });
  } catch (err) {
    console.error('[REPORTS] Error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

app.get('/api/tenant/dashboard', authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  if (!tenantId) return res.status(400).json({ error: 'Tenant access only' });

  try {
    const [
      salesCount, 
      expenseSum, 
      productCount, 
      latestInvoices,
      leadCount,
      employeeCount,
      totalIncome
    ] = await Promise.all([
      prisma.invoice.count({ where: { tenantId } }),
      prisma.expense.aggregate({ where: { tenantId }, _sum: { amount: true } }),
      prisma.product.count({ where: { tenantId } }),
      prisma.invoice.findMany({
        where: { tenantId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      prisma.lead.count({ where: { tenantId } }),
      prisma.employee.count({ where: { tenantId } }),
      prisma.invoice.aggregate({ where: { tenantId }, _sum: { totalAmount: true } }),
    ]);

    res.json({
      salesCount,
      totalExpenses: expenseSum._sum.amount || 0,
      productCount,
      latestInvoices,
      leadCount,
      employeeCount,
      totalIncome: totalIncome._sum.totalAmount || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

app.get('/api/admin/plans', authenticate, authorize([UserRole.SUPER_ADMIN]), async (req, res) => {
  try {
    const plans = await prisma.plan.findMany();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/admin/plans', authenticate, authorize([UserRole.SUPER_ADMIN]), async (req, res) => {
  try {
    const plan = await prisma.plan.create({ data: req.body });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// --- Tenant Generic CRUD Routes ---

const tenantModels = [
  'customer', 'supplier', 'product', 'productCategory', 'warehouse', 'branch', 
  'expense', 'account', 'journalEntry', 'employee', 'project',
  'fiscalYear', 'department', 'jobTitle', 'attendance', 'leave', 
  'payrollRun', 'notification', 'companySetting', 'measurementUnit', 'taxType',
  'lead', 'opportunity', 'billOfMaterials', 'workCenter', 'asset', 'assetCategory',
  'vehicle', 'inventoryAdjustment', 'posSession', 'role',
  'costCenter', 'expenseCategory', 'paymentMethod', 'leadSource', 'opportunityStage',
  'projectStage', 'projectTask', 'workOrder', 'qualityCheck', 'customerGroup', 'supplierGroup',
  'invoice', 'purchaseInvoice'
];

app.post('/api/tenant/seed', authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;

  try {
    const existingCats = await prisma.productCategory.count({ where: { tenantId } });
    if (existingCats > 0) return res.json({ success: true, message: 'Already seeded' });

    await prisma.$transaction(async (tx) => {
      // 1. Roles & Permissions
      const permissions = [
        'view_dashboard', 'manage_users', 'manage_settings', 'view_reports',
        'manage_accounting', 'manage_sales', 'manage_purchases', 'manage_inventory',
        'manage_crm', 'manage_hr', 'manage_manufacturing', 'manage_projects'
      ];
      
      for (const pName of permissions) {
        await tx.permission.upsert({
            where: { name: pName },
            update: {},
            create: { name: pName }
        });
      }

      const allPermissions = await tx.permission.findMany();

      const roles = [
        { name: 'مدير النظام (Admin)', description: 'صلاحيات كاملة على النظام' },
        { name: 'المحاسب (Accountant)', description: 'إدارة القيود والتقارير المالية' },
        { name: 'موظف مبيعات (Sales)', description: 'إدارة الفواتير والعملاء' },
        { name: 'أمين مخزن (Warehouse)', description: 'إدارة المخزون والمستودعات' },
      ];

      for (const r of roles) {
        await tx.role.create({
            data: {
                name: r.name,
                description: r.description,
                tenantId,
                permissions: {
                    connect: allPermissions.map(p => ({ id: p.id }))
                }
            }
        });
      }

      // 2. Lookup Tables (Categories, Units, etc.)
      const categories = ['عام', 'أجهزة', 'مواد', 'خدمات', 'قرطاسية', 'صيانة'];
      for (const nameAr of categories) {
        await tx.productCategory.create({ data: { nameAr, tenantId } });
      }

      const units = [
        { nameAr: 'قطعة', code: 'PCS', symbol: 'PCS' },
        { nameAr: 'كرتون', code: 'BOX', symbol: 'BOX' },
        { nameAr: 'متر', code: 'M', symbol: 'm' },
        { nameAr: 'كيلو', code: 'KG', symbol: 'kg' },
        { nameAr: 'لتر', code: 'L', symbol: 'l' },
      ];
      for (const u of units) {
        await tx.measurementUnit.create({ data: { ...u, tenantId } });
      }

      await tx.warehouse.create({ data: { nameAr: 'المخزن الرئيسي', tenantId } });
      await tx.branch.create({ data: { nameAr: 'الفرع الرئيسي', isMain: true, tenantId } });

      const depts = ['الإدارة', 'المحاسبة', 'المبيعات', 'المشتريات', 'الموارد البشرية'];
      for (const nameAr of depts) {
        await tx.department.create({ data: { nameAr, tenantId } });
      }

      const taxes = [
        { nameAr: 'بدون ضريبة 0%', rate: 0, code: 'VAT0' },
        { nameAr: 'ضريبة قيمة مضافة 15%', rate: 15, code: 'VAT15' }
      ];
      for (const t of taxes) {
        await tx.taxType.create({ data: { ...t, tenantId } });
      }

      // 3. New Lookups
      const costCenters = ['الرئيسي', 'المشاريع', 'التسويق'];
      for (const nameAr of costCenters) await tx.costCenter.create({ data: { nameAr, tenantId } });

      const expenseCats = ['إيجارات', 'كهرباء ومياه', 'نقل وشحن', 'اتصالات'];
      for (const nameAr of expenseCats) await tx.expenseCategory.create({ data: { nameAr, tenantId } });

      const paymentMethods = [
        { nameAr: 'نقدي', code: 'CASH' },
        { nameAr: 'بنكي', code: 'BANK' },
        { nameAr: 'شيك', code: 'CHECK' }
      ];
      for (const pm of paymentMethods) await tx.paymentMethod.create({ data: { ...pm, tenantId } });

      const leadSources = ['فيسبوك', 'تحويل عميل', 'موقع إلكتروني', 'إعلان'];
      for (const nameAr of leadSources) await tx.leadSource.create({ data: { nameAr, tenantId } });

      const customerGroups = ['عملاء جملة', 'عملاء مفرق', 'VIP'];
      for (const nameAr of customerGroups) await tx.customerGroup.create({ data: { nameAr, tenantId } });

      // 4. Chart of Accounts
      const accounts = [
        { code: '1', name: 'الأصول (Assets)', type: 'ASSET' },
        { code: '11', name: 'الأصول المتداولة', type: 'ASSET', parentCode: '1' },
        { code: '111', name: 'الصندوق (Cash)', type: 'ASSET', parentCode: '11' },
        { code: '112', name: 'البنك (Bank)', type: 'ASSET', parentCode: '11' },
        { code: '113', name: 'المدينون (Accounts Receivable)', type: 'ASSET', parentCode: '11' },
        { code: '12', name: 'الأصول الثابتة', type: 'ASSET', parentCode: '1' },
        { code: '2', name: 'الخصوم (Liabilities)', type: 'LIABILITY' },
        { code: '21', name: 'الدائنون (Accounts Payable)', type: 'LIABILITY', parentCode: '2' },
        { code: '3', name: 'حقوق الملكية (Equity)', type: 'EQUITY' },
        { code: '4', name: 'الإيرادات (Revenue)', type: 'REVENUE' },
        { code: '41', name: 'إيرادات المبيعات', type: 'REVENUE', parentCode: '4' },
        { code: '5', name: 'المصاريف (Expenses)', type: 'EXPENSE' },
        { code: '51', name: 'تكلفة البضاعة المباعة', type: 'EXPENSE', parentCode: '5' },
        { code: '52', name: 'مصاريف الرواتب', type: 'EXPENSE', parentCode: '5' },
      ];
      
      const createdAccounts: any = {};
      for (const acc of accounts) {
        const parentId = acc.parentCode ? createdAccounts[acc.parentCode] : null;
        const created = await tx.account.create({
          data: {
            code: acc.code,
            name: acc.name,
            type: acc.type as any,
            tenantId,
            parentAccountId: parentId
          }
        });
        createdAccounts[acc.code] = created.id;
      }
    });

    await logAction('SEED_DATA', 'Tenant', tenantId, req.user.id, tenantId, null, { status: 'COMPLETE' }, req);
    res.json({ success: true });
  } catch (err) {
    console.error('[SEED] Error seeding data:', err);
    res.status(500).json({ error: 'Failed to seed defaults' });
  }
});

function getModelIncludes(model: string) {
  const includes: Record<string, any> = {
    product: { category: true, unitRel: true, warehouse: true, taxType: true },
    invoice: { customer: true, items: { include: { product: true } } },
    purchaseInvoice: { supplier: true, items: { include: { product: true } } },
    employee: { department: true, jobTitle: true, branch: true },
    account: { parentAccount: true },
    journalEntry: { lines: { include: { account: true } } },
    attendance: { employee: true },
    leave: { employee: true },
    billOfMaterials: { product: true, components: { include: { product: true } } },
    asset: { category: true },
    inventoryAdjustment: { warehouse: true, items: { include: { product: true } } },
    payrollRun: { items: { include: { employee: true } } },
    role: { permissions: true },
    opportunity: { customer: true },
    project: { stage: true, tasks: true },
    workOrder: { bom: { include: { product: true } } },
    expense: { categoryRel: true },
    jobTitle: { department: true },
    lead: {},
  };
  return { ...includes[model] };
}

tenantModels.forEach(model => {
  // List
  app.get(`/api/tenant/${model}s`, authenticate, async (req: any, res) => {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'Tenant context required' });
    
    const { page = 1, limit = 100, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    try {
      // @ts-ignore
      const modelClient = prisma[model];
      if (!modelClient) {
        console.error(`[SYSTEM] Model ${model} not found on prisma client`);
        return res.status(500).json({ error: 'System configuration error' });
      }
      
      const where: any = { 
        tenantId,
        ...(modelClient.fields && 'deletedAt' in modelClient.fields ? { deletedAt: null } : {})
      };

      if (search) {
        // Simple search for nameAr or name or number or code
        const searchFields = ['nameAr', 'name', 'number', 'code', 'title', 'fullName'];
        const orConditions = searchFields
          .filter(field => modelClient.fields && field in modelClient.fields)
          .map(field => ({ [field]: { contains: String(search), mode: 'insensitive' } }));
        
        if (orConditions.length > 0) {
          where.OR = orConditions;
        }
      }
      
      // @ts-ignore
      const data = await modelClient.findMany({ 
        where,
        include: getModelIncludes(model),
        orderBy: { [String(sortBy)]: String(sortOrder) },
        skip,
        take
      });
      
      // @ts-ignore
      const total = await modelClient.count({ where });

      res.json({
        data,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (err) {
      console.error(`[API] List ${model} error:`, err);
      res.status(500).json({ error: `Failed to fetch ${model}s` });
    }
  });

  // Create
  app.post(`/api/tenant/${model}s`, authenticate, async (req: any, res) => {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'Tenant context required' });
    try {
      // @ts-ignore
      const modelClient = prisma[model];
      if (!modelClient) return res.status(500).json({ error: 'Configuration error' });

      // Clean up body (remove any injected IDs or tenantIds)
      const { id, tenantId: _, createdAt, updatedAt, ...cleanBody } = req.body;
      
      // Handle numeric fields
      const processedData = { ...cleanBody };
      Object.keys(processedData).forEach(key => {
        if (typeof processedData[key] === 'string' && !isNaN(Number(processedData[key])) && processedData[key].trim() !== '' && key !== 'code' && key !== 'phone' && key !== 'sku') {
           processedData[key] = Number(processedData[key]);
        }
      });

      // @ts-ignore
      const data = await modelClient.create({ data: { ...processedData, tenantId } });
      await logAction('CREATE', model, data.id, req.user.id, tenantId, null, data, req);
      res.json(data);
    } catch (err) {
      console.error(`[API] Create ${model} error:`, err);
      res.status(500).json({ error: `Failed to create ${model}` });
    }
  });

  // Update
  app.put(`/api/tenant/${model}s/:id`, authenticate, async (req: any, res) => {
    const tenantId = req.user.tenantId;
    if (!tenantId) return res.status(400).json({ error: 'Tenant context required' });
    try {
      // @ts-ignore
      const modelClient = prisma[model];
      if (!modelClient) return res.status(500).json({ error: 'Configuration error' });

      // @ts-ignore
      const existing = await modelClient.findFirst({ 
        where: { 
          id: req.params.id, 
          tenantId,
          ...('deletedAt' in modelClient.fields ? { deletedAt: null } : {})
        } 
      });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      const { id, tenantId: _, createdAt, updatedAt, ...cleanBody } = req.body;

      // Handle numeric fields
      const processedData = { ...cleanBody };
      Object.keys(processedData).forEach(key => {
        if (typeof processedData[key] === 'string' && !isNaN(Number(processedData[key])) && processedData[key].trim() !== '' && key !== 'code' && key !== 'phone' && key !== 'sku') {
           processedData[key] = Number(processedData[key]);
        }
      });

      // @ts-ignore
      const data = await modelClient.update({
        where: { id: req.params.id },
        data: processedData
      });
      await logAction('UPDATE', model, data.id, req.user.id, tenantId, existing, data, req);
      res.json(data);
    } catch (err) {
      console.error(`[API] Update ${model} error:`, err);
      res.status(500).json({ error: `Failed to update ${model}` });
    }
  });

  // Delete
  app.delete(`/api/tenant/${model}s/:id`, authenticate, async (req: any, res) => {
    const tenantId = req.user.tenantId;
    try {
      // @ts-ignore
      const modelClient = prisma[model];
      if (!modelClient) return res.status(500).json({ error: 'Configuration error' });

      // @ts-ignore
      const existing = await modelClient.findFirst({ 
        where: { 
          id: req.params.id, 
          tenantId,
          ...('deletedAt' in modelClient.fields ? { deletedAt: null } : {})
        } 
      });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      // Soft delete check
      if ('deletedAt' in modelClient.fields) {
        // @ts-ignore
        await modelClient.update({
          where: { id: req.params.id },
          data: { deletedAt: new Date() }
        });
      } else {
        // @ts-ignore
        await modelClient.deleteMany({ where: { id: req.params.id, tenantId } });
      }
      await logAction('DELETE', model, req.params.id, req.user.id, tenantId, existing, null, req);
      res.json({ success: true });
    } catch (err) {
      console.error(`[API] Delete ${model} error:`, err);
      res.status(500).json({ error: `Failed to delete ${model}` });
    }
  });
});

// Specialized Routes (Invoices/Payments)
app.get('/api/tenant/invoices', authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  try {
    const data = await prisma.invoice.findMany({ 
      where: { tenantId }, 
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/tenant/invoices', authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { customerId, totalAmount, items, number, discount = 0, taxAmount = 0 } = req.body;
  
  try {
    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Create Invoice
      const inv = await tx.invoice.create({
        data: {
          number: number || `INV-${Date.now()}`,
          totalAmount: Number(totalAmount),
          discount: Number(discount),
          taxAmount: Number(taxAmount),
          customerId,
          tenantId,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
              price: Number(item.price)
            })),
          },
        },
        include: { items: true }
      });

      // 2. Update Inventory
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: Number(item.quantity) } }
        });
        
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            quantity: Number(item.quantity),
            type: 'OUT',
            reference: inv.number,
            warehouseId: (await tx.warehouse.findFirst({ where: { tenantId } }))?.id || '', // Rough fallback
            tenantId
          }
        });
      }

      return inv;
    });

    await logAction('CREATE_INVOICE', 'Invoice', invoice.id, req.user.id, tenantId, null, invoice, req);
    res.json(invoice);
  } catch (err) {
    console.error('[API] Invoice creation error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

app.get('/api/tenant/settings', authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  try {
    const settings = await prisma.companySetting.findMany({ where: { tenantId } });
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    res.json({ settings, tenant });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.put('/api/tenant/settings', authenticate, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { name, phone, address, taxNumber, ...settings } = req.body;
  
  try {
    await prisma.$transaction(async (tx) => {
      // Update tenant info
      await tx.tenant.update({
        where: { id: tenantId },
        data: { name, phone, address, taxNumber }
      });

      // Update settings
      for (const [key, value] of Object.entries(settings)) {
        await tx.companySetting.upsert({
          where: { tenantId_key: { tenantId, key } },
          update: { value: String(value) },
          create: { tenantId, key, value: String(value) }
        });
      }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// --- Vite Middleware & Fallback ---

async function startServer() {
  console.log('[SYSTEM] Initializing server...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('[SYSTEM] Database connected successfully.');
  } catch (err) {
    console.error('[CRITICAL] Database connection error:', err);
    // Continue starting server so health checks might still pass if DB is transient
  }

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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
    console.log(`[ERP-SAAS] Running on http://localhost:${PORT}`);
    console.log(`[SYSTEM] Environment: ${process.env.NODE_ENV || 'production'}`);
  });
}

startServer().catch(err => {
  console.error('[FATAL] Failed to start server:', err);
  process.exit(1);
});
