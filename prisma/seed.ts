import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Plans
  const plans = [
    {
      name: 'Starter',
      description: 'للمنشآت الصغيرة والمتناهية الصغر',
      monthlyPrice: 0,
      yearlyPrice: 0,
      maxUsers: 2,
      maxBranches: 1,
      maxWarehouses: 1,
      invoiceLimit: 50,
      features: {
        accounting: true,
        sales: true,
        purchases: true,
        inventory: true,
        hr: false,
        pos: false,
        reports: 'BASIC'
      }
    },
    {
      name: 'Professional',
      description: 'للشركات المتوسطة والباحثين عن النمو',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      maxUsers: 10,
      maxBranches: 5,
      maxWarehouses: 5,
      invoiceLimit: 1000,
      features: {
        accounting: true,
        sales: true,
        purchases: true,
        inventory: true,
        hr: true,
        pos: true,
        reports: 'ADVANCED'
      }
    },
    {
      name: 'Enterprise',
      description: 'للمؤسسات الكبيرة والعمليات المعقدة',
      monthlyPrice: 499,
      yearlyPrice: 4990,
      maxUsers: 100,
      maxBranches: 100,
      maxWarehouses: 100,
      invoiceLimit: 999999,
      features: {
        accounting: true,
        sales: true,
        purchases: true,
        inventory: true,
        hr: true,
        pos: true,
        reports: 'PREMIUM',
        multiCurrency: true,
        api: true
      }
    }
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  // 2. Create Super Admin
  const adminEmail = 'admin@accounting.local';
  const adminPassword = 'Admin@123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
    },
  });

  // Also create a user based on the environment email if it's different
  const envEmail = process.env.SUPER_ADMIN_EMAIL;
  if (envEmail && envEmail !== adminEmail) {
    await prisma.user.upsert({
      where: { email: envEmail },
      update: {},
      create: {
        email: envEmail,
        password: hashedPassword,
        name: 'Super Admin (Env)',
        role: UserRole.SUPER_ADMIN,
      },
    });
  }

  // 3. Create Demo Company
  const demoCompany = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'شركة تجربة ERP',
      slug: 'demo',
      currency: 'IQD',
      status: 'ACTIVE',
    },
  });

  // 4. Create Demo Owner
  const demoOwnerEmail = 'owner@demo.local';
  const demoHashedPassword = await bcrypt.hash('Owner@123456', 10);
  
  await prisma.user.upsert({
    where: { email: demoOwnerEmail },
    update: {
      password: demoHashedPassword
    },
    create: {
      email: demoOwnerEmail,
      password: demoHashedPassword,
      name: 'مدير الشركة التجريبية',
      role: UserRole.COMPANY_OWNER,
      tenantId: demoCompany.id,
    },
  });

  // 5. Assign Subscription to Demo Company
  const proPlan = await prisma.plan.findUnique({ where: { name: 'Professional' } });
  if (proPlan) {
    await prisma.subscription.upsert({
      where: { tenantId: demoCompany.id },
      update: {},
      create: {
        tenantId: demoCompany.id,
        planId: proPlan.id,
        status: 'ACTIVE',
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // 6. Create Basic Chart of Accounts
  const accounts = [
    { code: '101', name: 'الصندوق', type: 'ASSET' },
    { code: '102', name: 'البنك', type: 'ASSET' },
    { code: '103', name: 'المدينون', type: 'ASSET' },
    { code: '201', name: 'الدائنون', type: 'LIABILITY' },
    { code: '301', name: 'رأس المال', type: 'EQUITY' },
    { code: '401', name: 'المبيعات', type: 'REVENUE' },
    { code: '501', name: 'المشتريات', type: 'EXPENSE' },
    { code: '502', name: 'الرواتب', type: 'EXPENSE' },
  ];

  for (const acc of accounts) {
    await prisma.account.upsert({
      where: { tenantId_code: { tenantId: demoCompany.id, code: acc.code } },
      update: {},
      create: {
        ...acc,
        type: acc.type as any,
        tenantId: demoCompany.id,
      },
    });
  }

  // 7. Create Demo Customers
  await prisma.customer.createMany({
    data: [
      { name: 'أحمد علي', phone: '07701234567', tenantId: demoCompany.id },
      { name: 'مجموعة المدى', phone: '07809876543', tenantId: demoCompany.id },
    ],
    skipDuplicates: true,
  });

  // 8. Create Demo Products
  await prisma.product.createMany({
    data: [
      { name: 'جهاز لابتوب Dell', price: 750000, cost: 600000, stock: 10, tenantId: demoCompany.id },
      { name: 'ماوس لاسلكي', price: 15000, cost: 10000, stock: 50, tenantId: demoCompany.id },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
