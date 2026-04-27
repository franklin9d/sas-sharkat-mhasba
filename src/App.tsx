import React from 'react';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Package, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  Bell,
  Search,
  Moon,
  Sun,
  LayoutDashboard,
  Wallet,
  ShoppingBag,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from './types';

// --- UI Components ---

const GlassCard = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <div className={`glass-card ${className}`} {...props}>
    {children}
  </div>
);

const NavItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
      ${active ? 'bg-sky-500/15 text-sky-500 shadow-sm' : 'hover:bg-white/10 text-slate-500 dark:text-slate-400'}`}
  >
    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? '' : 'group-hover:scale-110'}`} />
    <span className={`font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
  </button>
);

// --- Layouts ---

const Sidebar = ({ activeTab, setActiveTab, role }: any) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { id: 'accounts', icon: BarChart3, label: 'المحاسبة المالية' },
    { id: 'sales', icon: ShoppingBag, label: 'المبيعات والعملاء' },
    { id: 'purchases', icon: CreditCard, label: 'المشتريات' },
    { id: 'inventory', icon: Package, label: 'المخازن والمستودعات' },
    { id: 'hr', icon: Users, label: 'الموارد البشرية' },
    { id: 'projects', icon: Briefcase, label: 'المشاريع' },
    { id: 'reports', icon: FileText, label: 'التقارير الذكية' },
    { id: 'settings', icon: Settings, label: 'الإعدادات' },
  ];

  const adminMenuItems = [
    { id: 'platform', icon: Building2, label: 'إدارة الشركات' },
    { id: 'plans', icon: Wallet, label: 'الباقات والأسعار' },
    { id: 'system', icon: Settings, label: 'ضبط النظام' },
  ];

  const currentMenu = role === UserRole.SUPER_ADMIN ? adminMenuItems : menuItems;

  return (
    <div className="w-[240px] h-screen glass-panel flex flex-col p-6 gap-8 sticky top-0 border-l border-white/10">
      <div className="flex items-center gap-3 px-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
          <TrendingUp className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">أفق ERP</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {currentMenu.map((item) => (
          <NavItem 
            key={item.id} 
            {...item} 
            active={activeTab === item.id} 
            onClick={() => setActiveTab(item.id)} 
          />
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="p-4 glass-card bg-sky-500/10 border-sky-500/20">
          <p className="text-[10px] text-sky-400 mb-1 font-bold">خطة الاشتراك</p>
          <p className="text-xs font-bold">Enterprise Pro</p>
          <div className="w-full bg-white/10 h-1 rounded-full mt-2">
            <div className="bg-sky-500 h-full rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all font-medium text-sm">
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="h-20 flex items-center justify-between px-8 bg-white/5 backdrop-blur-md sticky top-0 z-30 border-b border-white/10">
    <h1 className="text-2xl font-bold">مركز التحكم - العراق</h1>

    <div className="flex items-center gap-6">
      <div className="hidden md:flex glass-card px-4 py-2 items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="text-sm font-medium">فرع المنصور - بغداد</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2.5 rounded-full hover:bg-white/10 transition-all relative">
          <Bell className="w-5 h-5 text-slate-400" />
          <span className="absolute top-2.5 left-2.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-[#0f172a]"></span>
        </button>
        
        <div className="w-px h-6 bg-white/10 mx-2"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-left text-xs">
            <p className="font-bold text-slate-100 group-hover:text-sky-400 transition-colors">أحمد المدير</p>
            <p className="text-slate-500">مدير النظام</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 border border-white/20 shadow-lg group-hover:scale-105 transition-transform"></div>
        </div>
      </div>
    </div>
  </header>
);

// --- Pages ---

const DashboardHome = ({ companyId }: { companyId: string }) => {
  const [exchangeRate] = React.useState(1520); // This would normally come from a context/store

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex justify-between items-center bg-sky-500/5 p-4 rounded-2xl border border-sky-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold">سعر صرف الدولار الحالي</h3>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">آخر تحديث: منذ ١٠ دقائق</p>
          </div>
        </div>
        <div className="text-left font-mono">
          <span className="text-2xl font-black text-sky-400">{exchangeRate}</span>
          <span className="text-xs text-slate-500 font-bold mr-2">IQD / USD</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[ 
          { label: 'إجمالي المبيعات (دينار)', val: '١٨٥,٤٠٠,٠٠٠', inc: '+١٢٪', sub: 'نمو مالي', icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'المبيعات بالدولار', val: (185400000 / exchangeRate).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' $', inc: '-٣.٢٪', sub: 'حسب السعر المعتمد', icon: CreditCard, color: 'text-sky-400' },
          { label: 'صافي الربح المتوقع', val: '٨٢,٥٠٠,٠٠٠', inc: '٧٢٪', sub: 'دينار عراقي', icon: Wallet, color: 'text-emerald-500' },
          { label: 'العملاء النشطون', val: '٢٨', inc: '١٥٪', sub: 'عملاء جدد', icon: Users, color: 'text-sky-300' },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-5 flex flex-col gap-2">
            <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
            <span className="text-2xl font-bold tracking-tight">{stat.val}</span>
            <span className={`text-[10px] font-medium ${stat.color} flex items-center gap-1 mt-1`}>
              {stat.inc} {stat.sub}
            </span>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2 p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-200">التحويلات المالية الأخيرة</h2>
            <button className="text-xs text-sky-500 font-bold border border-sky-500/20 px-3 py-1 rounded-lg hover:bg-sky-500/5 transition-colors underline-none">سجل الصرف</button>
          </div>
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="text-slate-500 border-b border-white/5 opacity-70">
                <th className="pb-3 px-2">المرجع</th>
                <th className="pb-3 px-2">المبلغ (دينار)</th>
                <th className="pb-3 px-2 text-left text-sky-400">القيمة ($)</th>
                <th className="pb-3 px-2">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {[
                { ref: 'EX-9901', iqd: '1,520,000', usd: '1,000', status: 'مكتمل' },
                { ref: 'EX-9902', iqd: '7,600,000', usd: '5,000', status: 'مكتمل' },
                { ref: 'EX-9903', iqd: '456,000', usd: '300', status: 'معلق' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 group transition-colors">
                  <td className="py-4 px-2 font-mono font-bold text-slate-400 group-hover:text-sky-400">{row.ref}</td>
                  <td className="py-4 px-2 font-bold">{row.iqd}</td>
                  <td className="py-4 px-2 text-left font-mono font-extrabold text-sky-400">{row.usd} $</td>
                  <td className="py-4 px-2">
                    <span className={`badge ${row.status === 'مكتمل' ? 'badge-success' : 'badge-pending'}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
        
        <GlassCard className="p-6 flex flex-col gap-6 bg-gradient-to-br from-white/5 to-transparent">
          <h2 className="text-lg font-bold">محول العملات السريع</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">من دولار ($)</label>
              <input 
                type="number" 
                className="glass-input text-left font-mono font-bold text-sky-400" 
                defaultValue="100"
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const resultElem = document.getElementById('quick-conv-res');
                  if (resultElem) resultElem.innerText = (val * exchangeRate).toLocaleString();
                }}
              />
            </div>
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 rotate-90 text-slate-500" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500">إلى دينار (IQD)</label>
              <div className="glass-card p-4 bg-sky-500/5 flex justify-between items-center">
                <span id="quick-conv-res" className="text-xl font-black text-emerald-500 font-mono">{(100 * exchangeRate).toLocaleString()}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">دينار</span>
              </div>
            </div>
            <button className="glass-button w-full py-3 mt-2">إصدار فاتورة صرف</button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const CompanyManager = () => {
  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">إدارة الشركات المشتركة</h2>
        <button className="glass-button">إضافة عميل جديد</button>
      </div>
      <GlassCard>
        <table className="w-full text-right">
          <thead className="bg-white/5 border-b border-white/5 text-slate-400 text-xs font-bold uppercase">
            <tr>
              <th className="px-6 py-4">الشركة</th>
              <th className="px-6 py-4">المالك</th>
              <th className="px-6 py-4">الباقة</th>
              <th className="px-6 py-4">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'مجموعة الفوزان', owner: 'ali@fawzan.com', plan: 'Enterprise', status: 'نشط' },
              { name: 'مطاعم الشرق', owner: 'omar@shrq.sa', plan: 'Professional', status: 'نشط' },
              { name: 'تيك تيك للبرمجيات', owner: 'info@tiktik.com', plan: 'Starter', status: 'موقوف' },
            ].map((c, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-bold">{c.name}</td>
                <td className="px-6 py-4 text-xs text-slate-400 font-mono">{c.owner}</td>
                <td className="px-6 py-4"><span className="badge badge-pending">{c.plan}</span></td>
                <td className="px-6 py-4">
                  <span className={`badge ${c.status === 'نشط' ? 'badge-success' : 'badge-error'}`}>{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};

const AccountsTable = ({ companyId }: { companyId: string }) => {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">دليل الحسابات</h2>
        <button className="glass-button">إضافة حساب</button>
      </div>
      <GlassCard>
        <table className="w-full text-right">
          <thead className="bg-white/5 border-b border-white/5 text-slate-400 text-xs font-bold uppercase">
            <tr>
              <th className="px-6 py-4">الكود</th>
              <th className="px-6 py-4">اسم الحساب</th>
              <th className="px-6 py-4">النوع</th>
              <th className="px-6 py-4">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {[
              { code: '1101', name: 'الصندوق الرئيسي', type: 'أصول', balance: '25,000' },
              { code: '1102', name: 'البنك الأهلي', type: 'أصول', balance: '185,000' },
              { code: '2101', name: 'الموردون', type: 'خصوم', balance: '12,400' },
              { code: '4101', name: 'مبيعات التجزئة', type: 'إيرادات', balance: '340,000' },
            ].map((acc, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-mono text-sky-400 font-bold">{acc.code}</td>
                <td className="px-6 py-4 font-bold">{acc.name}</td>
                <td className="px-6 py-4"><span className="badge badge-pending">{acc.type}</span></td>
                <td className="px-6 py-4 font-bold text-lg tracking-tighter">{acc.balance} ر.س</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};

const ProductList = ({ companyId }: { companyId: string }) => {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">المخزون والمستودعات</h2>
        <button className="glass-button">إضافة منتج</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'جهاز كمبيوتر محمول', sku: 'LAP-001', stock: 12, price: 3500 },
          { name: 'طابعة زكية', sku: 'PRN-022', stock: 5, price: 1200 },
          { name: 'شاشة 4K', sku: 'MON-99', stock: 24, price: 1800 },
        ].map((prod, i) => (
          <GlassCard key={i} className="p-6">
             <div className="flex justify-between items-center mb-4">
                <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-mono text-slate-500">{prod.sku}</span>
             </div>
             <h3 className="font-bold text-lg">{prod.name}</h3>
             <div className="flex justify-between items-end mt-4">
               <div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">المخزون</p>
                  <p className="text-xl font-bold text-sky-400">{prod.stock}</p>
               </div>
               <p className="font-bold text-slate-400">{prod.price.toLocaleString()} ر.س</p>
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

const SalesModule = ({ companyId }: { companyId: string }) => {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">فواتير المبيعات والعملاء</h2>
        <button className="glass-button">فاتورة بيع جديدة</button>
      </div>
      <GlassCard>
        <table className="w-full text-right">
          <thead className="bg-white/5 border-b border-white/5 text-slate-400 text-xs font-bold uppercase">
            <tr>
              <th className="px-6 py-4">رقم الفاتورة</th>
              <th className="px-6 py-4">العميل</th>
              <th className="px-6 py-4">التاريخ</th>
              <th className="px-6 py-4">المبلغ الإجمالي</th>
              <th className="px-6 py-4">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(i => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-6 py-4 font-mono text-sky-400 font-bold">INV-2024-00{i}</td>
                <td className="px-6 py-4 font-bold">عميل تجريبي {i}</td>
                <td className="px-6 py-4 text-slate-400 text-xs">2024-04-{10+i}</td>
                <td className="px-6 py-4 font-bold">{(i * 1250).toLocaleString()} ر.س</td>
                <td className="px-6 py-4"><span className="badge badge-success">مدفوعة</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};

const HRModule = ({ companyId }: { companyId: string }) => {
  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الموارد البشرية</h2>
        <button className="glass-button">إضافة موظف</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'محمد علي', role: 'محاسب قانوني', salary: '12,000', img: 'M' },
          { name: 'سارة خالد', role: 'مدير مبيعات', salary: '9,500', img: 'S' },
          { name: 'فهد عمر', role: 'أمين مخزن', salary: '6,000', img: 'F' }
        ].map((emp, i) => (
          <GlassCard key={i} className="p-6 flex items-center gap-4">
             <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 text-2xl font-bold">
               {emp.img}
             </div>
             <div>
               <h3 className="font-bold text-lg">{emp.name}</h3>
               <p className="text-xs text-slate-500 font-medium">{emp.role}</p>
               <p className="text-sm font-bold text-sky-400 mt-2">{emp.salary} ر.س / شهر</p>
             </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

const ProjectsModule = () => (
  <div className="p-8 flex flex-col gap-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">إدارة المشاريع</h2>
      <button className="glass-button">مشروع جديد</button>
    </div>
    {[1, 2].map(i => (
      <GlassCard key={i} className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">تطوير الهوية البصرية - مشروع {i}</h3>
            <p className="text-xs text-slate-500 mt-1">تاريخ الانتهاء المتوقع: 2024-12-30</p>
          </div>
          <span className="badge badge-pending">قيد التنفيذ</span>
        </div>
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
          <div className="bg-sky-500 h-full w-[45%]" />
        </div>
        <div className="flex justify-between mt-2 text-xs font-bold">
          <span>الإنجاز: 45%</span>
          <span className="text-slate-400">الميزانية: 50,000 ر.س</span>
        </div>
      </GlassCard>
    ))}
  </div>
);

const RegisterPage = () => {
  const [success, setSuccess] = React.useState(false);
  
  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <GlassCard className="p-12 max-w-lg border-emerald-500/30">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 mx-auto mb-6">
            <ChevronRight className="w-10 h-10 -rotate-90" />
          </div>
          <h1 className="text-3xl font-bold mb-4">تم إنشاء شركتك بنجاح!</h1>
          <p className="text-slate-400 mb-8">يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب والبدء في استخدام إتقان ERP.</p>
          <button onClick={() => window.location.href = '/'} className="glass-button w-full">العودة لتسجيل الدخول</button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 -z-10" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
        <GlassCard className="p-10">
          <div className="text-center mb-10">
             <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">انضم إلى إتقان ERP</h1>
             <p className="text-slate-400 mt-2 font-medium italic uppercase tracking-widest text-[10px]">ابدأ رحلة النجاح لشركتك اليوم</p>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">اسم الشركة</label>
              <input required className="glass-input" placeholder="اسم المنشأة" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">البريد الإلكتروني للمالك</label>
              <input required type="email" className="glass-input" placeholder="owner@company.com" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">رقم الهاتف</label>
              <input className="glass-input" placeholder="05xxxxxxxx" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">الباقة المختارة</label>
              <select className="glass-input appearance-none bg-slate-900/50">
                <option value="STARTER">Starter - مجانية</option>
                <option value="PROFESSIONAL">Professional - متقدمة</option>
                <option value="ENTERPRISE">Enterprise - للمؤسسات</option>
              </select>
            </div>
            <div className="md:col-span-2 mt-4">
              <button type="submit" className="glass-button w-full py-4 text-lg">إنشاء حساب الشركة</button>
            </div>
          </form>
          <p className="text-center mt-6 text-sm text-slate-500">لديك حساب بالفعل؟ <a href="/" className="text-sky-500 font-bold hover:underline">سجل دخولك هنا</a></p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

// --- Auth Component ---

const LoginScreen = ({ onLogin }: any) => {
  const [credentials, setCredentials] = React.useState({ email: 'admin@itqan.com', password: 'admin_password_here' });
  const [error, setError] = React.useState('');
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    // Simulate API delay for realism
    setTimeout(() => {
      if (credentials.email && credentials.password) {
        const role = credentials.email === 'admin@itqan.com' 
          ? UserRole.SUPER_ADMIN 
          : UserRole.COMPANY_OWNER;
        onLogin(role);
      } else {
        setError('يرجى التأكد من البيانات المدخلة');
      }
      setIsLoggingIn(false);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500/20 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-10 shadow-2xl overflow-hidden relative border-white/30">
          <div className="flex flex-col items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
              <TrendingUp className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-extrabold tracking-tight">اتقان ERP</h1>
              <p className="text-slate-500 font-medium">نظام المحاسبة المتكامل</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 text-xs text-center font-bold border border-rose-500/20">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-sm font-bold px-1 text-slate-700 dark:text-slate-300">البريد الإلكتروني</label>
              <input 
                type="email" 
                required
                className="glass-input text-right" 
                placeholder="name@company.com" 
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">كلمة المرور</label>
                <button type="button" className="text-xs text-indigo-600 font-bold hover:underline">نسيت كلمة المرور؟</button>
              </div>
              <input 
                type="password" 
                required
                className="glass-input text-right" 
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
            </div>

            <button type="submit" disabled={isLoggingIn} className="glass-button w-full py-4 text-lg mt-4 shadow-indigo-600/30">
              {isLoggingIn ? 'جاري الدخول...' : 'دخول للنظام'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            ليس لديك حساب؟ <a href="/register" className="text-indigo-600 font-bold hover:underline">سجل شركتك الآن</a>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

const PurchasesModule = () => (
  <div className="p-8 flex flex-col gap-6">
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">إدارة المشتريات والموردين</h2>
      <button className="glass-button">طلب شراء جديد</button>
    </div>
    <GlassCard>
      <table className="w-full text-right">
        <thead className="bg-white/5 border-b border-white/5 text-slate-400 text-xs font-bold uppercase">
          <tr>
            <th className="px-6 py-4">المرجع</th>
            <th className="px-6 py-4">المورد</th>
            <th className="px-6 py-4">المبلغ</th>
            <th className="px-6 py-4">الحالة</th>
          </tr>
        </thead>
        <tbody>
          {['شركة توريد الحاسبات', 'مؤسسة الورق الفني'].map((vendor, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
              <td className="px-6 py-4 font-mono text-sky-400 font-bold">PUR-00{i+1}</td>
              <td className="px-6 py-4 font-bold">{vendor}</td>
              <td className="px-6 py-4 font-bold">{(i + 1) * 2300} ر.س</td>
              <td className="px-6 py-4"><span className="badge badge-pending">في انتظار التوريد</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  </div>
);

const ReportsModule = () => (
  <div className="p-8 flex flex-col gap-6">
    <h2 className="text-2xl font-bold">التقارير المالية والذكية</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {['ميزان المراجعة', 'قائمة الدخل', 'الميزانية العمومية', 'تقرير حركة المبيعات', 'كشف حساب عميل', 'تقرير المخزون'].map((report, i) => (
        <GlassCard key={i} className="p-6 flex flex-col items-center text-center gap-4 hover:bg-sky-500/5 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center text-sky-500 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="font-bold">{report}</h3>
          <p className="text-xs text-slate-500">عرض وتحميل التقرير بصيغة PDF أو Excel</p>
        </GlassCard>
      ))}
    </div>
  </div>
);

const SettingsModule = () => {
  const [exchangeRate, setExchangeRate] = React.useState(1520); // Default IQD per 1 USD
  const [baseCurrency, setBaseCurrency] = React.useState('IQD');

  return (
    <div className="p-8 flex flex-col gap-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">إعدادات المنشأة والعملات</h2>
        <div className="flex gap-2">
          <span className="p-2 bg-sky-500/10 text-sky-500 rounded-lg text-xs font-bold">الحساب: نشط</span>
        </div>
      </div>
      
      <GlassCard className="p-8 space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-500" />
            البيانات الأساسية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">اسم المنشأة العربي</label>
              <input className="glass-input" defaultValue="شركة الرواد للتجارة" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">الرقم الضريبي / السجل التجاري</label>
              <input className="glass-input" defaultValue="7001234567" />
            </div>
          </div>
        </section>

        <section className="space-y-4 pt-6 border-t border-white/5">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-sky-500" />
            إعدادات العملات والصرف
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">العملة الأساسية للنظام</label>
              <select 
                className="glass-input bg-slate-900 border-none appearance-none"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value)}
              >
                <option value="IQD">دينار عراقي (IQD)</option>
                <option value="SAR">ريال سعودي (SAR)</option>
                <option value="AED">درهم إماراتي (AED)</option>
                <option value="USD">دولار أمريكي (USD)</option>
                <option value="EUR">يورو (EUR)</option>
                <option value="KWD">دينار كويتي (KWD)</option>
                <option value="EGP">جنيه مصري (EGP)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">سعر صرف الدولار (1 USD = IQD)</label>
              <div className="relative">
                <input 
                  type="number"
                  className="glass-input font-mono font-bold text-sky-400" 
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">حفظ تلقائي</span>
              </div>
              <p className="text-[10px] text-slate-500 italic">يتم استخدامه لتحويل الفواتير والتقارير بين الدينار والدولار.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sky-500/5 border border-sky-500/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-500">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold">أداة التحويل السريع</p>
                <p className="text-[10px] text-slate-400">بناءً على السعر المحدث: {exchangeRate} IQD</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-500">مثال: ١٠٠ دولار</p>
                <p className="font-bold text-emerald-500">{(100 * exchangeRate).toLocaleString()} دينار</p>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
          <button className="glass-button bg-white/5 text-slate-400 shadow-none hover:bg-white/10">إلغاء التغييرات</button>
          <button className="glass-button">حفظ كامل الإعدادات</button>
        </div>
      </GlassCard>
    </div>
  );
};

const PlansModule = () => (
  <div className="p-8 flex flex-col gap-8">
     <h2 className="text-3xl font-bold">إدارة الباقات والاشتراكات</h2>
     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { name: 'Starter', price: 'مجاني', color: 'bg-slate-500' },
          { name: 'Professional', price: '١٩٩ ر.س', color: 'bg-sky-500' },
          { name: 'Enterprise', price: '٤٩٩ ر.س', color: 'bg-indigo-600' }
        ].map((plan, i) => (
          <GlassCard key={i} className="p-8 flex flex-col items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl ${plan.color} flex items-center justify-center text-white shadow-xl`}>
              <Wallet className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="text-slate-400 mt-1 uppercase tracking-tighter font-bold">{plan.price} / شهر</p>
            </div>
            <button className="glass-button w-full">تعديل المزايا</button>
          </GlassCard>
        ))}
     </div>
  </div>
);

const SystemModule = () => (
  <div className="p-8 flex flex-col gap-6">
    <h2 className="text-2xl font-bold">ضبط النظام والتحكم الأساسي</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <GlassCard className="p-6">
        <h3 className="font-bold mb-4">حالة الخادم</h3>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 text-emerald-500">
           <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
           <span className="font-bold">النظام يعمل بكفاءة - 100% Uptime</span>
        </div>
      </GlassCard>
      <GlassCard className="p-6">
        <h3 className="font-bold mb-4">النسخ الاحتياطي</h3>
        <div className="flex justify-between items-center">
           <span className="text-sm text-slate-500">آخر نسخة: منذ ساعتين</span>
           <button className="text-sky-500 font-bold hover:underline">بدء نسخة الآن</button>
        </div>
      </GlassCard>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const isRegister = window.location.pathname === '/register';
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [role, setRole] = React.useState(UserRole.COMPANY_OWNER);

  if (isRegister) {
    return <RegisterPage />;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={(userRole: UserRole) => {
      setRole(userRole);
      setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="min-h-screen flex text-right select-none">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} role={role} />
      
      <main className="flex-1 min-w-0 flex flex-col bg-slate-50/10 dark:bg-slate-950/20 backdrop-blur-[2px]">
        <Header />
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              {activeTab === 'dashboard' && <DashboardHome companyId="demo_company" />}
              {activeTab === 'platform' && <CompanyManager />}
              {activeTab === 'accounts' && <AccountsTable companyId="demo_company" />}
              {activeTab === 'inventory' && <ProductList companyId="demo_company" />}
              {activeTab === 'sales' && <SalesModule companyId="demo_company" />}
              {activeTab === 'purchases' && <PurchasesModule />}
              {activeTab === 'hr' && <HRModule companyId="demo_company" />}
              {activeTab === 'projects' && <ProjectsModule />}
              {activeTab === 'reports' && <ReportsModule />}
              {activeTab === 'settings' && <SettingsModule />}
              {activeTab === 'plans' && <PlansModule />}
              {activeTab === 'system' && <SystemModule />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Add these to CSS or use Tailwind classes properly
// .no-scrollbar::-webkit-scrollbar { display: none; }
// .animate-spin-slow { animation: spin 8s linear infinite; }
