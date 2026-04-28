import React, { createContext, useContext, useState, useEffect } from 'react';
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
  Briefcase,
  Plus,
  ShieldCheck,
  AlertCircle,
  Menu,
  X,
  User as UserIcon,
  Edit2,
  Trash2,
  ChevronLeft,
  MessageSquare,
  Shield,
  Layers,
  Scale,
  Database,
  GitBranch,
  PieChart,
  Calendar,
  Truck,
  FileBarChart,
  Activity,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './services/api';

// --- Types ---

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_OWNER = 'COMPANY_OWNER',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  COMPANY_USER = 'COMPANY_USER',
}

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId?: string;
  tenant?: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- UI Components ---

const GlassCard = ({ children, className = "", ...props }: { children: React.ReactNode, className?: string, [key: string]: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    className={`liquid-glass rounded-[2.5rem] p-8 ${className}`} 
    {...props}
  >
    <div className="glossy-overlay"></div>
    <div className="relative z-10">{children}</div>
  </motion.div>
);

// --- Toast System ---
const Toast = ({ message, type, onClose }: any) => (
  <motion.div 
    initial={{ x: 300, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: 300, opacity: 0 }}
    className={`fixed bottom-10 right-10 z-[200] px-8 py-4 rounded-2xl font-black shadow-2xl backdrop-blur-2xl border flex items-center gap-4
      ${type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-rose-500/20 border-rose-500/50 text-rose-400'}`}
  >
    {type === 'success' ? <ShieldCheck className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
    <span>{message}</span>
  </motion.div>
);

const NavItem = ({ icon: Icon, label, active = false, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative
      ${active ? 'text-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/5' : 'hover:bg-white/[0.03] text-slate-400 hover:text-slate-200'}`}
  >
    <Icon className={`w-5 h-5 transition-all duration-500 ${active ? 'scale-110 shadow-sky-500/50' : 'group-hover:scale-110'}`} />
    <span className={`font-bold tracking-wide text-sm ${active ? '' : 'opacity-70'}`}>{label}</span>
    {active && (
      <motion.div 
        layoutId="activeNavTab"
        className="absolute left-0 w-1.5 h-6 bg-sky-500 rounded-r-full shadow-[0_0_15px_rgba(14,165,233,0.8)]"
      />
    )}
  </button>
);

// --- Modules ---

const DashboardModule = ({ user }: { user: User }) => {
  const [stats, setStats] = useState<any>(null);
  const [isQuickInvoiceOpen, setIsQuickInvoiceOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [invoiceData, setInvoiceData] = useState({
    customerId: '',
    items: [{ productId: '', quantity: 1, price: 0 }],
    notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    api.get('/tenant/dashboard', token)
      .then(setStats)
      .catch(console.error);

    // Fetch customers and products for the quick invoice
    api.get('/tenant/customers', token).then(setCustomers).catch(console.error);
    api.get('/tenant/products', token).then(setProducts).catch(console.error);
  }, []);

  const calculateTotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const handleCreateInvoice = async () => {
    // Basic Validation
    const validItems = invoiceData.items.filter(it => it.productId && it.quantity > 0);
    if (validItems.length === 0) {
      setToast({ msg: 'يرجى اختيار منتج واحد على الأقل', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken') || '';
      await api.post('/tenant/invoices', {
        ...invoiceData,
        items: validItems,
        totalAmount: calculateTotal(),
        status: 'PAID'
      }, token);
      
      setToast({ msg: 'تم إصدار الفاتورة بنجاح', type: 'success' });
      setIsQuickInvoiceOpen(false);
      setInvoiceData({
        customerId: '',
        items: [{ productId: '', quantity: 1, price: 0 }],
        notes: ''
      });
      // Refresh stats
      api.get('/tenant/dashboard', token).then(setStats);
    } catch (err) {
      console.error(err);
      setToast({ msg: 'فشل في إصدار الفاتورة', type: 'error' });
    } finally {
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (!stats) return (
    <div className="p-4 md:p-8 space-y-10 animate-pulse">
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-40 glass-card bg-slate-50 border-slate-100 shadow-none rounded-[2rem]"></div>)}
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 h-[500px] glass-card bg-slate-50 border-slate-100 shadow-none rounded-[2.5rem]"></div>
          <div className="h-[500px] glass-card bg-slate-50 border-slate-100 shadow-none rounded-[2.5rem]"></div>
       </div>
    </div>
  );

  const kpis = [
    { label: 'فواتير المبيعات', val: stats.salesCount, color: 'sky', icon: ShoppingBag, change: stats.leadCount + ' فرصة' },
    { label: 'إجمالي المحصل', val: (stats.totalIncome || 0).toLocaleString() + ' IQD', color: 'emerald', icon: TrendingUp, change: '+18.5%' },
    { label: 'المخزون والمنتجات', val: stats.productCount, color: 'indigo', icon: Package, change: 'نشط' },
    { label: 'الموارد البشرية', val: stats.employeeCount, color: 'rose', icon: Users, change: 'موظف' },
  ];

  return (
    <PageContainer 
      title={`أهلاً بك، ${user.name.split(' ')[0]} 👋`}
      subtitle="هذا هو ملخص نشاط عملك لليوم."
      actions={
        <>
          <button 
            onClick={() => setIsQuickInvoiceOpen(true)}
            className="glass-button flex-1 md:flex-none px-6 py-3 h-12 text-sm"
          >
            <Plus className="w-4 h-4" /> فاتورة سريعة
          </button>
          <button className="glass-button-secondary flex-1 md:flex-none px-6 py-3 h-12 text-sm">تصدير التقارير</button>
        </>
      }
    >
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.msg} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isQuickInvoiceOpen && (
          <div className="fixed inset-0 z-[200] overflow-y-auto no-scrollbar">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsQuickInvoiceOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xl"
            />
            <div className="min-h-full flex items-center justify-center p-4 relative pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="relative w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border border-slate-200 overflow-hidden flex flex-col pointer-events-auto my-auto"
              >
              <div className="p-6 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800">إنشاء فاتورة سريعة</h3>
                  <p className="text-[9px] md:text-[10px] font-black text-sky-500 uppercase tracking-widest mt-2">إصدار فاتورة بيع مباشرة ومسودة فورية</p>
                </div>
                <button 
                  onClick={() => setIsQuickInvoiceOpen(false)}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 no-scrollbar max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">اختيار العميل المهتم</label>
                    <select 
                      className="glass-input h-14 md:h-16 bg-white font-bold"
                      value={invoiceData.customerId}
                      onChange={(e) => setInvoiceData({...invoiceData, customerId: e.target.value})}
                    >
                      <option value="">عميل نقدي (بدون تسجيل)</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3">رقم الفاتورة الآلي</label>
                    <div className="glass-input h-14 md:h-16 flex items-center px-6 text-slate-400 font-mono text-sm italic">AUTOGEN_INV_{Date.now().toString().slice(-6)}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 italic">بنود الفاتورة والمنتجات</label>
                    <button 
                      onClick={() => setInvoiceData({
                        ...invoiceData,
                        items: [...invoiceData.items, { productId: '', quantity: 1, price: 0 }]
                      })}
                      className="text-[10px] font-black text-sky-500 hover:underline px-4"
                    >
                      + إضافة مادة أخرى
                    </button>
                  </div>

                  <div className="space-y-4">
                    {invoiceData.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group shadow-sm transition-all hover:bg-white hover:border-sky-500/10">
                        <div className="md:col-span-12 lg:col-span-5 space-y-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">المنتج</span>
                           <select 
                             className="w-full h-12 bg-white rounded-xl border border-slate-200 px-4 font-bold text-sm outline-none focus:ring-2 focus:ring-sky-500/20"
                             value={item.productId}
                             onChange={(e) => {
                               const p = products.find(p => p.id === e.target.value);
                               const newItems = [...invoiceData.items];
                               newItems[idx] = { ...item, productId: e.target.value, price: p?.price || 0 };
                               setInvoiceData({...invoiceData, items: newItems});
                             }}
                           >
                             <option value="">اختر مادة...</option>
                             {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock} متوفر)</option>)}
                           </select>
                        </div>
                        <div className="md:col-span-4 lg:col-span-2 space-y-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">الكمية</span>
                           <input 
                             type="number"
                             className="w-full h-12 bg-white rounded-xl border border-slate-200 px-4 font-black text-center text-sm outline-none"
                             value={item.quantity}
                             onChange={(e) => {
                               const newItems = [...invoiceData.items];
                               newItems[idx].quantity = parseInt(e.target.value) || 0;
                               setInvoiceData({...invoiceData, items: newItems});
                             }}
                           />
                        </div>
                        <div className="md:col-span-6 lg:col-span-4 space-y-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">السعر</span>
                           <div className="w-full h-12 bg-white rounded-xl border border-slate-200 px-4 flex items-center justify-end font-mono font-black text-sm text-sky-600">
                             {(item.price * item.quantity).toLocaleString()} IQD
                           </div>
                        </div>
                        <div className="md:col-span-2 lg:col-span-1 flex justify-center pb-1">
                           <button 
                             onClick={() => {
                               const newItems = invoiceData.items.filter((_, i) => i !== idx);
                               setInvoiceData({...invoiceData, items: newItems});
                             }}
                             className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                           >
                             <X className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group">
                   <div className="absolute right-0 top-0 w-40 h-40 bg-sky-500/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                   <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="text-center md:text-right">
                         <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-2 px-1">إجمالي المبلغ المطلوب</p>
                         <h4 className="text-3xl md:text-4xl font-black tracking-tight">{calculateTotal().toLocaleString()} <span className="text-lg opacity-50">دينار عراقي</span></h4>
                      </div>
                      <div className="text-center md:text-left opacity-30">
                         <p className="text-[10px] font-black uppercase tracking-widest">صافي الضريبة: 0%</p>
                         <p className="text-[10px] font-black uppercase tracking-widest">تاريخ الاستحقاق: فوري</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="p-6 md:p-10 bg-slate-50/80 border-t border-slate-100 flex flex-col md:flex-row gap-4 md:gap-6">
                <button 
                  onClick={handleCreateInvoice}
                  disabled={calculateTotal() === 0}
                  className="glass-button flex-1 h-14 md:h-16 text-lg font-black uppercase tracking-widest disabled:opacity-50"
                >
                  <ShieldCheck className="w-6 h-6" /> تأكيد وإصدار الفاتورة
                </button>
                <button 
                  onClick={() => setIsQuickInvoiceOpen(false)}
                  className="glass-button-secondary px-10 h-14 md:h-16 text-xs font-black uppercase tracking-widest"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
        {kpis.map((stat, i) => (
          <GlassCard key={i} className="group hover:-translate-y-2 transition-all duration-500 bg-white border-slate-200 shadow-xl shadow-slate-200/10 p-8 flex flex-col gap-5 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-[50px] -mr-16 -mt-16 rounded-full group-hover:bg-sky-500/10 transition-colors"></div>
            <div className="flex justify-between items-start relative z-10">
               <div className={`p-5 rounded-3xl bg-${stat.color}-50 text-${stat.color}-500 shadow-sm transition-transform group-hover:scale-110 duration-500`}>
                  <stat.icon className="w-7 h-7 md:w-8 md:h-8" />
               </div>
               <div className="flex flex-col items-end">
                  <span className={`text-[9px] md:text-[10px] font-black text-${stat.color}-600 px-4 py-1.5 rounded-full bg-${stat.color}-100/50 backdrop-blur-sm shadow-sm`}>{stat.change}</span>
                  <span className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-tighter">نمو مستدام</span>
               </div>
            </div>
            <div className="mt-4 text-right relative z-10">
               <p className="text-slate-400 font-black text-[10px] mb-1.5 uppercase tracking-widest opacity-80">{stat.label}</p>
               <h3 className="text-3xl lg:text-4xl font-black text-slate-800 tracking-tighter">{stat.val}</h3>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <GlassCard className="lg:col-span-2 border-slate-200 bg-white shadow-xl shadow-slate-200/30 p-6 md:p-10">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <h3 className="text-2xl font-black flex items-center gap-4 text-slate-800">
                <div className="w-1.5 h-8 bg-sky-500 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.3)]"></div>
                النشاط الأخير
              </h3>
              <div className="flex gap-2 w-full sm:w-auto">
                 <button className="flex-1 sm:flex-none p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 transition-all border border-slate-200"><Search className="w-4 h-4" /></button>
                 <button className="flex-[2] sm:flex-none text-[10px] font-black text-sky-500 bg-sky-50 px-6 py-3 rounded-xl hover:bg-sky-500 hover:text-white transition-all text-center">مشاهدة السجل</button>
              </div>
           </div>

           <div className="space-y-4">
              {stats.latestInvoices.map((inv: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-sky-500/20 hover:shadow-xl hover:shadow-sky-500/5 transition-all group cursor-pointer gap-4 shadow-sm hover:shadow-md">
                   <div className="flex items-center gap-4 md:gap-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                         <FileText className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="font-black text-slate-700 text-sm md:text-base">فاتورة مبيعات #{inv.number}</p>
                         <p className="text-[10px] text-slate-400 font-bold">{inv.customer.name} • قبل ٢ ساعة</p>
                      </div>
                   </div>
                   <div className="text-right sm:text-left w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                      <p className="font-black text-lg text-slate-800">{inv.totalAmount.toLocaleString()} IQD</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${inv.status === 'PAID' ? 'text-emerald-500' : 'text-amber-500'}`}>
                         {inv.status === 'PAID' ? 'مدفوعة' : 'بانتظار الدفع'}
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </GlassCard>

        <div className="space-y-10">
          <GlassCard className="bg-white border-slate-200 shadow-xl shadow-slate-200/30 p-8">
             <h3 className="text-xl font-black mb-8 text-slate-800">إجراءات سريعة</h3>
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'إضافة عميل', icon: Users, color: 'sky' },
                  { label: 'شراء بضاعة', icon: Briefcase, color: 'emerald' },
                  { label: 'صرف راتب', icon: CreditCard, color: 'rose' },
                  { label: 'جرد مخزني', icon: Package, color: 'indigo' },
                ].map((act, i) => (
                  <button key={i} className="p-4 md:p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-sky-500/20 hover:shadow-xl hover:shadow-sky-500/5 transition-all flex flex-col items-center gap-3 group">
                     <div className={`p-3 rounded-2xl bg-${act.color}-100 text-${act.color}-600 group-hover:scale-110 transition-transform shadow-sm`}>
                        <act.icon className="w-6 h-6" />
                     </div>
                     <span className="text-[9px] md:text-[10px] font-black text-slate-400 group-hover:text-slate-600 transition-colors uppercase tracking-widest text-center">{act.label}</span>
                  </button>
                ))}
             </div>
          </GlassCard>

          <GlassCard className="bg-sky-50 border-sky-100 relative overflow-hidden group shadow-xl shadow-sky-500/5 p-8">
             <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-sky-500/10 blur-[80px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
             <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2 px-1">حالة النظام</p>
             <h4 className="text-xl font-black text-slate-800 mb-6 tracking-tight">التخزين المستهلك</h4>
             <div className="h-3 w-full bg-slate-200 rounded-full mb-3 overflow-hidden">
                <motion.div 
                   initial={{ width: 0 }} 
                   animate={{ width: '45%' }}
                   className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full shadow-lg shadow-sky-500/20"
                />
             </div>
             <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>تخزين الملفات</span>
                <span className="text-sky-500">45% من 10GB</span>
             </div>
          </GlassCard>
        </div>
      </div>
    </PageContainer>
  );
};


const AuditLogsModule = ({ isAdmin = false }: { isAdmin?: boolean }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get(isAdmin ? '/admin/audit-logs' : '/tenant/audit-logs', localStorage.getItem('accessToken') || '')
      .then(setLogs)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isAdmin]);

  return (
    <PageContainer
      title="سجلات النظام"
      subtitle="تعقب كافة العمليات الحساسة في البيئة"
    >
      <GlassCard className="p-0 overflow-hidden border-slate-200 bg-white shadow-xl shadow-slate-200/30">
         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-right border-collapse">
               <thead>
                  <tr className="bg-slate-50/80 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                    <th className="p-6">المستخدم</th>
                    <th className="p-6">العملية</th>
                    <th className="p-6">النوع</th>
                    <th className="p-6 text-center">التاريخ</th>
                    <th className="p-6 text-center">الإجراءات</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    [1,2,3,4,5].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-6"><div className="h-10 bg-slate-100 rounded-xl w-32"></div></td>
                        <td className="p-6"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                        <td className="p-6"><div className="h-4 bg-slate-100 rounded-full w-24"></div></td>
                        <td className="p-6"><div className="h-4 bg-slate-100 rounded-full w-24 mx-auto"></div></td>
                        <td className="p-6"><div className="h-8 bg-slate-100 rounded-xl w-24 mx-auto"></div></td>
                      </tr>
                    ))
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-20 text-center opacity-30 italic font-black">لا توجد سجلات تتوفر حالياً</td>
                    </tr>
                  ) : logs.map((log, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                       <td className="p-6">
                          <p className="font-black text-slate-800 text-sm">{log.user?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold tracking-tight">{log.user?.email}</p>
                       </td>
                       <td className="p-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest ${
                            log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                            log.action === 'DELETE' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 
                            'bg-sky-50 text-sky-600 border border-sky-100'
                          }`}>
                             {log.action}
                          </span>
                       </td>
                       <td className="p-6 text-xs font-black text-slate-500 uppercase tracking-tighter">{log.entityType}</td>
                       <td className="p-6 text-[11px] font-black text-slate-400 text-center font-mono">{new Date(log.createdAt).toLocaleString('ar-EG')}</td>
                       <td className="p-6 text-center">
                          <button className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-black hover:bg-slate-900 hover:text-white transition-all">عرض JSON</button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </GlassCard>
    </PageContainer>
  );
};

const SuperAdminModule = ({ anyProps }: any) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    Promise.all([
      api.get('/admin/metrics', token),
      api.get('/admin/companies', token),
      api.get('/admin/plans', token)
    ]).then(([m, c, p]) => {
      setMetrics(m);
      setCompanies(c);
      setPlans(p);
    }).catch(console.error).finally(() => setIsLoading(false));
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return (
    <div className="p-10 font-sans">
       <div className="flex flex-col gap-10 animate-pulse">
          <div className="flex justify-between items-center px-4">
             <div className="h-20 w-1/3 bg-slate-100 rounded-3xl"></div>
             <div className="flex gap-4">
                <div className="h-14 w-32 bg-slate-100 rounded-2xl"></div>
                <div className="h-14 w-32 bg-slate-100 rounded-2xl"></div>
             </div>
          </div>
          <div className="grid grid-cols-4 gap-8">
             {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-50 rounded-[2.5rem] border border-slate-100"></div>)}
          </div>
          <div className="grid grid-cols-3 gap-10">
             <div className="col-span-2 h-96 bg-slate-50 rounded-[2.5rem] border border-slate-100"></div>
             <div className="h-96 bg-slate-50 rounded-[2.5rem] border border-slate-100"></div>
          </div>
       </div>
    </div>
  );

  const { setActiveTab } = anyProps || {};
  return (
    <div className="p-10 flex flex-col gap-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <div>
            <h2 className="text-5xl font-black bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">الإدارة المركزية</h2>
            <p className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-widest">المراقبة والتحكم في منصة أفق السحابية</p>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <button className="glass-button-secondary px-8 h-14 flex-1 md:flex-none" onClick={() => setActiveTab?.('audit-logs')}>سجلات الحماية</button>
            <button className="glass-button px-10 h-14 flex-1 md:flex-none" onClick={() => setActiveTab?.('companies')}>المؤسسات</button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'إجمالي الشركات', val: metrics?.totalCompanies, icon: Building2, color: 'sky' },
          { label: 'الشركات النشطة', val: metrics?.activeCompanies, icon: ShieldCheck, color: 'emerald' },
          { label: 'إيراد النظام', val: (metrics?.monthlyRevenue || 0).toLocaleString() + ' $', icon: Wallet, color: 'indigo' },
          { label: 'إجمالي المستخدمين', val: metrics?.totalUsers, icon: Users, color: 'rose' },
        ].map((stat, i) => (
          <GlassCard key={i} className="group hover:-translate-y-2 transition-all duration-500 bg-white border-slate-200 shadow-xl shadow-slate-200/20">
             <div className="flex items-center gap-6">
                <div className={`p-5 rounded-[2rem] bg-${stat.color}-50 text-${stat.color}-500 group-hover:bg-${stat.color}-500 group-hover:text-white transition-all duration-700 shadow-xl shadow-${stat.color}-500/10`}>
                   <stat.icon className="w-8 h-8" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                   <p className="text-3xl font-black text-slate-800">{stat.val}</p>
                </div>
             </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <GlassCard className="lg:col-span-2 p-0 overflow-hidden border-slate-200 bg-white shadow-xl shadow-slate-200/30">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="text-xl font-black text-slate-800">إدارة الشركات المشتركة</h3>
               <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="بحث في الشركات..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 w-64 pr-12 pl-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all"
                  />
               </div>
            </div>
            <div className="overflow-x-auto no-scrollbar">
               <table className="w-full text-right">
                  <thead>
                     <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <th className="px-10 py-5">الشركة</th>
                        <th className="px-10 py-5">الخطة</th>
                        <th className="px-10 py-5">الحالة</th>
                        <th className="px-10 py-5">التاريخ</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredCompanies.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-all cursor-pointer group">
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-5">
                                 <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center font-black text-sky-500 text-xl border border-sky-100 shadow-sm group-hover:scale-110 transition-transform">{c.name.charAt(0)}</div>
                                 <div>
                                    <p className="font-black text-slate-700">{c.name}</p>
                                    <p className="text-[10px] text-slate-400 font-mono italic">{c.slug}.cloud.net</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg border border-indigo-100 uppercase tracking-widest">{c.subscription?.plan?.name || 'TRAIL'}</span>
                           </td>
                           <td className="px-10 py-6">
                              <div className={`w-3 h-3 rounded-full ${c.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}></div>
                           </td>
                           <td className="px-10 py-6 text-xs text-slate-400 font-bold">{new Date(c.createdAt).toLocaleDateString()}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </GlassCard>

         <div className="space-y-10">
            <GlassCard className="bg-white border-slate-200 shadow-xl shadow-slate-200/30">
               <h4 className="text-lg font-black mb-8 border-b border-slate-100 pb-4 text-slate-800">خطط الاشتراك النشطة</h4>
               <div className="space-y-6">
                  {plans.map((p, i) => (
                     <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-sky-500/30 hover:bg-white hover:shadow-xl hover:shadow-sky-500/5 transition-all flex justify-between items-center group">
                        <div>
                           <p className="font-black text-slate-700">{p.name}</p>
                           <p className="text-[10px] text-sky-600 mt-1 uppercase tracking-widest font-black">{p.monthlyPrice} $ / شهر</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
                           <ChevronRight className="w-5 h-5" />
                        </div>
                     </div>
                  ))}
               </div>
            </GlassCard>
            
            <GlassCard className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-2xl shadow-sky-500/30 border-none relative overflow-hidden group">
               <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
               <h4 className="text-xl font-black mb-4 relative z-10">نظام الدعم الفني</h4>
               <p className="text-xs font-bold leading-relaxed opacity-80 mb-8 relative z-10 font-sans">هناك تذاكر دعم جديدة بحاجة للمراجعة من قبل فريق الإدارة المركزية.</p>
               <button className="w-full py-4 bg-white text-sky-600 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] transition-transform relative z-10">إدارة التذاكر</button>
            </GlassCard>
         </div>
      </div>
    </div>
  );
};

// --- Auth Context Provider ---

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.get('/auth/me', token)
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
    } catch (err: any) {
      setError(err.error || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// --- Layouts ---

const PageContainer = ({ children, title, subtitle, actions }: any) => (
  <div className="w-full max-w-[1600px] mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{title}</h2>
        {subtitle && (
          <div className="flex items-center gap-2 mt-2 opacity-60">
            <div className="w-1 h-3 bg-sky-500 rounded-full"></div>
            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500">{subtitle}</p>
          </div>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
    {children}
  </div>
);

const AppLayout = ({ activeTab, setActiveTab, children }: any) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', category: 'MAIN' },
    { id: 'accounts', icon: BarChart3, label: 'دليل الحسابات', category: 'ACCOUNTING' },
    { id: 'journal-entries', icon: FileText, label: 'القيود اليومية', category: 'ACCOUNTING' },
    { id: 'banking', icon: Wallet, label: 'البنوك والخزينة', category: 'ACCOUNTING' },
    { id: 'expenses', icon: PieChart, label: 'إدارة المصاريف', category: 'ACCOUNTING' },
    { id: 'sales', icon: ShoppingBag, label: 'فاتورة مبيعات', category: 'BUSINESS' },
    { id: 'purchases', icon: Briefcase, label: 'فاتورة مشتريات', category: 'BUSINESS' },
    { id: 'customers', icon: Users, label: 'دليل العملاء', category: 'BUSINESS' },
    { id: 'suppliers', icon: Briefcase, label: 'دليل الموردين', category: 'BUSINESS' },
    { id: 'crm', icon: MessageSquare, label: 'العملاء المحتملين', category: 'BUSINESS' },
    { id: 'opportunities', icon: TrendingUp, label: 'فرص البيع', category: 'BUSINESS' },
    { id: 'inventory', icon: Package, label: 'المخزون والمواد', category: 'LOGISTICS' },
    { id: 'manufacturing', icon: Database, label: 'التصنيع والإنتاج', category: 'LOGISTICS' },
    { id: 'work-orders', icon: ClipboardList, label: 'أوامر العمل', category: 'LOGISTICS' },
    { id: 'hr', icon: Users, label: 'الموارد البشرية', category: 'ORGA' },
    { id: 'payroll', icon: CreditCard, label: 'الرواتب والأجور', category: 'ORGA' },
    { id: 'projects', icon: GitBranch, label: 'إدارة المشاريع', category: 'SERVICES' },
    { id: 'pos', icon: ShoppingBag, label: 'نظام البيع POS', category: 'SERVICES' },
    { id: 'assets', icon: Building2, label: 'الأصول الثابتة', category: 'SERVICES' },
    { id: 'fleet', icon: Database, label: 'أسطول المركبات', category: 'SERVICES' },
    { id: 'lookups', icon: Layers, label: 'إعدادات الجداول', category: 'SYSTEM' },
    { id: 'reports', icon: BarChart3, label: 'التقارير المالية', category: 'SYSTEM' },
    { id: 'business-settings', icon: Settings, label: 'إعدادات النظام', category: 'SYSTEM' },
  ];

  const adminMenu = [
    { id: 'super-admin', icon: Shield, label: 'الإدارة المركزية' },
    { id: 'companies', icon: Building2, label: 'إدارة الشركات' },
    { id: 'audit-logs', icon: Bell, label: 'سجل عمليات المنصة' },
  ];

  const categories = [
    { id: 'MAIN', label: 'الرئيسية' },
    { id: 'ACCOUNTING', label: 'المالية والحسابات' },
    { id: 'BUSINESS', label: 'التجارة والعلاقات' },
    { id: 'LOGISTICS', label: 'العمليات والمخازن' },
    { id: 'ORGA', label: 'شؤون الموظفين' },
    { id: 'SERVICES', label: 'الخدمات والأصول' },
    { id: 'SYSTEM', label: 'تخصيص النظام' },
  ];

  const menu = user.role === UserRole.SUPER_ADMIN ? adminMenu : menuItems;

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans transition-colors duration-700 w-full" dir="rtl">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 right-0 w-[280px] md:w-[320px] bg-white border-l border-slate-200 z-[100] transition-transform duration-500 transform lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:relative lg:inset-y-auto lg:h-screen flex flex-col shrink-0 overflow-hidden shadow-2xl lg:shadow-none`}
      >
        <div className="p-8 lg:p-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl flex items-center justify-center text-white shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">أفق ERP</h1>
                <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest mt-2 opacity-80 underline decoration-sky-500/30 underline-offset-4 tracking-tighter">Enterprise Edition</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar -mx-2 px-2 pb-20 space-y-6">
            {user.role === UserRole.SUPER_ADMIN ? (
              <div className="space-y-1">
                {adminMenu.map(item => (
                  <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.id}
                    onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {categories.map(cat => (
                  <div key={cat.id} className="space-y-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] px-6">{cat.label}</p>
                    <div className="space-y-1">
                      {menuItems.filter(i => i.category === cat.id).map(item => (
                        <NavItem
                          key={item.id}
                          icon={item.icon}
                          label={item.label}
                          active={activeTab === item.id}
                          onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-8 border-t border-slate-100">
            <button
              onClick={logout}
              className="w-full h-14 rounded-2xl bg-rose-50 text-rose-500 font-black flex items-center justify-center gap-4 hover:bg-rose-500 hover:text-white transition-all group shadow-sm"
            >
              <LogOut className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-[10px] uppercase tracking-widest">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 md:h-24 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0 z-40">
           <div className="flex items-center gap-4 md:gap-6">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden w-12 h-12 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center hover:bg-sky-50 hover:text-sky-500 transition-all border border-slate-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:flex items-center gap-4 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 group focus-within:bg-white focus-within:ring-4 focus-within:ring-sky-500/5 focus-within:border-sky-500/30 transition-all text-right">
                 <Search className="w-4 h-4 text-slate-400 group-focus-within:text-sky-500" />
                 <input className="bg-transparent border-none outline-none text-xs font-bold text-slate-600 placeholder:text-slate-400 w-64 text-right" placeholder="ابحث في النظام..." />
              </div>
           </div>

           <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden sm:flex flex-col items-end">
                 <p className="text-xs font-black text-slate-800 leading-none">{user.email}</p>
                 <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.role}</span>
                 </div>
              </div>
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-100 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-400 group cursor-pointer hover:border-sky-500 transition-all">
                 <UserIcon className="w-6 h-6" />
              </div>
           </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth bg-slate-50/50">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.3, ease: "easeOut" }}
               className="min-h-full pb-20"
             >
               {children}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Views ---

const GenericModule = ({ title, endpoint, icon: Icon, columns, addFields, isInternal = false, fixedFilters }: any) => {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ totalPages: 1, page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const path = endpoint.startsWith('/') ? endpoint : `/tenant/${endpoint}s`;
      const query = new URLSearchParams({
        page: String(page),
        search: searchQuery,
        ...fixedFilters
      });
      const response = await api.get(`${path}?${query}`, token);
      if (response.data) {
        setData(response.data);
        setPagination(response.pagination);
      } else {
        setData(response); // Fallback for old endpoints
      }
    } catch (err) {
      showToast('خطأ في تحميل البيانات المحفوظة', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [endpoint, page, searchQuery]);

  // Rest of GenericModule same...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    
    // Simple custom validation
    addFields.forEach((f: any) => {
       if (!formData[f.key] && f.required !== false) {
          errors[f.key] = 'هذا الحقل مطلوب';
       }
    });

    if (Object.keys(errors).length > 0) {
       setValidationErrors(errors);
       return;
    }

    setValidationErrors({});
    
    try {
      const token = localStorage.getItem('accessToken') || '';
      const path = endpoint.startsWith('/') ? endpoint : `/tenant/${endpoint}s`;
      
      const submissionData = { ...formData };
      addFields.forEach((field: any) => {
        if (field.type === 'number' && typeof submissionData[field.key] === 'string') {
          submissionData[field.key] = Number(submissionData[field.key]) || 0;
        }
      });

      if (editingId) {
        await api.put(`${path}/${editingId}`, submissionData, token);
        showToast('تم تحديث البيانات بنجاح في قاعدة البيانات');
      } else {
        await api.post(path, submissionData, token);
        showToast('تم حفظ السجل الجديد بنجاح');
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({});
      fetchData();
    } catch (err) {
      showToast('فشل في حفظ البيانات - يرجى التأكد من الاتصال بالخادم', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟ لا يمكن التراجع عن هذه العملية.')) return;
    try {
      await api.delete(`/tenant/${endpoint}s/${id}`, localStorage.getItem('accessToken') || '');
      showToast('تم الحذف بنجاح');
      fetchData();
    } catch (err) {
      showToast('فشل في عملية الحذف', 'error');
    }
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setEditingId(item.id);
    setIsModalOpen(true);
  };

  // Relation Fetching Hook Logic inside component
  const [relationData, setRelationData] = useState<Record<string, any[]>>({});
  
  useEffect(() => {
    const fetchRelations = async () => {
      const token = localStorage.getItem('accessToken') || '';
      const newRelationData: Record<string, any[]> = {};
      
      for (const field of addFields) {
        if (field.type === 'relation' && field.relationEndpoint) {
          try {
            const path = field.relationEndpoint.startsWith('/') ? field.relationEndpoint : `/tenant/${field.relationEndpoint}s`;
            const items = await api.get(path, token);
            newRelationData[field.key] = items;
          } catch (err) {
            console.error(`Failed to fetch relation for ${field.key}`, err);
          }
        }
      }
      setRelationData(newRelationData);
    };

    if (isModalOpen) {
      fetchRelations();
    }
  }, [isModalOpen, isInternal]);

  const filteredData = data; // We use server-side searching now

  const mainContent = (
    <div className="relative">
      <AnimatePresence>
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <GlassCard className={`p-0 overflow-hidden border-slate-200 bg-white ${isInternal ? 'shadow-none border-none' : 'shadow-xl shadow-slate-200/30'}`}>
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
              <div className="relative group w-full md:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <input 
                    placeholder="بحث سريع..." 
                    className="w-full h-10 bg-white border border-slate-200 rounded-xl pr-9 pl-4 text-[10px] font-black focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/30 outline-none text-right placeholder:text-slate-300"
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                  />
              </div>
              <div className="flex gap-4">
                {pagination.totalPages > 1 && (
                  <div className="flex gap-2 items-center">
                    <button 
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-black text-slate-400 px-2">{page} / {pagination.totalPages}</span>
                    <button 
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      className="p-2 rounded-lg bg-white border border-slate-200 disabled:opacity-30"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => { setFormData({}); setEditingId(null); setIsModalOpen(true); }}
                  className="px-5 h-10 bg-sky-500 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 hover:bg-sky-600 transition-all shadow-lg shadow-sky-100"
                >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة {title}
                </button>
              </div>
        </div>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-right border-collapse text-center">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {columns.map((col: any) => (
                  <th key={col.key} className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{col.label}</th>
                ))}
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((col: any) => <td key={col.key} className="p-6"><div className="h-4 bg-slate-100 rounded-full w-24 mx-auto"></div></td>)}
                    <td className="p-6"><div className="h-8 bg-slate-100 rounded-xl w-24 mx-auto"></div></td>
                  </tr>
                ))
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Icon className="w-20 h-20 text-slate-400" />
                      <p className="font-black text-xl italic uppercase tracking-tighter text-slate-400">لا يوجد سجلات متاحة حالياً</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.map((item, i) => (
                <tr key={item.id || i} className="hover:bg-slate-50/50 transition-colors group">
                  {columns.map((col: any) => (
                    <td key={col.key} className="p-6 text-sm font-bold text-slate-700">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  <td className="p-6">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleEdit(item)} className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2.5 rounded-xl bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] overflow-y-auto no-scrollbar">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md cursor-default text-right"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="min-h-full flex items-center justify-center p-4 relative pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 50 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 50 }}
                className="w-full max-w-4xl relative z-10 pointer-events-auto my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <GlassCard className="p-0 border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] bg-white overflow-hidden rounded-[2.5rem]">
                  <div className="p-8 md:p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 text-right">
                    <div className="w-full text-right">
                      <h3 className="text-2xl md:text-3xl font-black text-slate-800">{editingId ? 'تحديث البيانات' : `إضافة ${title}`}</h3>
                      <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mt-2 px-1">يرجى ملء كافة الحقول لإتمام العملية بنجاح</p>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all font-black shrink-0"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="p-8 md:p-10 text-right">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-h-[60vh] overflow-y-auto no-scrollbar px-1">
                      {addFields.map((field: any, idx: number) => (
                        <div key={idx} className={`${field.full ? 'md:col-span-2' : ''} space-y-3`}>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 flex items-center gap-2 text-right">
                             <div className="w-1.5 h-3 bg-sky-500 rounded-full"></div>
                             {field.label}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              className={`glass-input h-14 md:h-16 text-sm appearance-none bg-white font-bold text-slate-700 ${validationErrors[field.key] ? 'border-rose-300 ring-4 ring-rose-50' : ''}`}
                              value={formData[field.key] || ''}
                              onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                            >
                              <option value="" disabled>{field.placeholder || `اختر ${field.label}`}</option>
                              {field.options?.map((opt: any) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : field.type === 'relation' ? (
                            <select
                              className={`glass-input h-14 md:h-16 text-sm appearance-none bg-white font-bold text-slate-700 ${validationErrors[field.key] ? 'border-rose-300 ring-4 ring-rose-50' : ''}`}
                              value={formData[field.key] || ''}
                              onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                            >
                              <option value="" disabled>{field.placeholder || `اختر ${field.label}`}</option>
                              {relationData[field.key]?.map((it: any) => (
                                <option key={it.id} value={it.id}>{it.nameAr || it.name || it.number || it.code}</option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea 
                              className={`w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:bg-white focus:ring-8 focus:ring-sky-500/5 focus:border-sky-500/30 transition-all resize-none min-h-[140px] text-right ${validationErrors[field.key] ? 'border-rose-300' : ''}`}
                              placeholder={field.placeholder}
                              value={formData[field.key] || ''}
                              onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                            />
                          ) : (
                            <input 
                              type={field.type || 'text'} 
                              className={`glass-input h-14 md:h-16 text-sm ${validationErrors[field.key] ? 'border-rose-300 ring-4 ring-rose-50' : ''}`} 
                              placeholder={field.placeholder}
                              value={formData[field.key] || ''}
                              onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                            />
                          )}
                          {validationErrors[field.key] && (
                            <p className="text-[10px] font-black text-rose-500 px-3">{validationErrors[field.key]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-12 flex gap-4">
                      <button type="submit" className="glass-button flex-1 h-14 md:h-16 uppercase tracking-widest text-[10px] font-black">
                        {editingId ? 'تحديث السجل الآن' : 'إضافة السجل للقاعدة'}
                      </button>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="glass-button-secondary px-8 md:px-12 h-14 md:h-16 uppercase tracking-widest text-[10px] font-black">
                        إلغاء الأمر
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  if (isInternal) return mainContent;

  return (
    <PageContainer
      title={title}
      subtitle={`إدارة ومتابعة ${title} في نظام أفق`}
      actions={
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
          <div className="relative group flex-1 md:w-80 text-right">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input 
              className="w-full h-12 bg-white border border-slate-200 rounded-xl pr-10 pl-4 text-sm font-black focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/30 outline-none transition-all text-right" 
              placeholder={`بحث سريع هنا...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setFormData({}); setEditingId(null); setIsModalOpen(true); }} 
            className="glass-button px-6 h-12 text-sm whitespace-nowrap shadow-xl shadow-sky-100"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة {title}</span>
          </button>
        </div>
      }
    >
      {mainContent}
    </PageContainer>
  );
};

const LoginScreen = () => {
  const { login, error, isLoading } = useAuth();
  const [credentials, setCredentials] = useState({ email: 'admin@accounting.local', password: 'Admin@123456' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(credentials.email, credentials.password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8 bg-white relative overflow-hidden font-sans">
       <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-sky-500/[0.04] blur-[150px] rounded-full"></div>
       <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/[0.04] blur-[150px] rounded-full"></div>

       <motion.div 
         initial={{ opacity: 0, scale: 0.9 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ type: "spring", duration: 0.8 }}
         className="w-full max-w-md relative z-10"
       >
          <div className="flex flex-col items-center gap-6 mb-12">
             <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_20px_40px_-5px_rgba(14,165,233,0.3)] flex items-center justify-center text-white">
                <TrendingUp className="w-12 h-12" />
             </div>
             <div className="text-center">
                <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-900 font-sans">أفق ERP</h1>
                <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] opacity-70">Integrated Cloud Software</p>
             </div>
          </div>

          <GlassCard className="p-10 border-slate-200 shadow-2xl bg-white/80">
             <form className="space-y-8" onSubmit={handleSubmit}>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-2xl bg-rose-50 text-rose-600 text-xs text-center font-black border border-rose-100 flex items-center gap-3"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>خطأ في تسجيل الدخول: {error}</span>
                  </motion.div>
                )}

                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">البريد الإلكتروني</label>
                   <input 
                     type="email" required
                     className="glass-input text-right py-4 px-6 text-lg"
                     placeholder="admin@accounting.local"
                     value={credentials.email}
                     onChange={e => setCredentials({...credentials, email: e.target.value})}
                   />
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between px-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">كلمة المرور</label>
                      <button type="button" className="text-[9px] text-sky-500 font-black hover:underline uppercase tracking-widest">نسيت كلمة المرور؟</button>
                   </div>
                   <input 
                     type="password" required
                     className="glass-input text-right py-4 px-6 text-lg"
                     placeholder="••••••••"
                     value={credentials.password}
                     onChange={e => setCredentials({...credentials, password: e.target.value})}
                   />
                </div>

                <button 
                  type="submit" disabled={isLoading}
                  className="glass-button w-full py-5 text-xl font-black shadow-lg shadow-sky-500/20 active:scale-95 transition-all mt-4"
                >
                   {isLoading ? 'جاري التحقق...' : 'دخول للمنصة'}
                </button>
             </form>
          </GlassCard>

          <p className="mt-12 text-center text-slate-400 text-sm font-medium">
             هل تملك مشروعاً جديداً؟ <a href="#" className="text-sky-500 font-black hover:underline px-1">سجل شركتك الآن</a>
          </p>
       </motion.div>
    </div>
  );
};

const ReportsModule = () => {
    const [selectedReport, setSelectedReport] = useState<string | null>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const reportTypes = [
        { id: 'pnl', label: 'الأرباح والخسائر (P&L)', icon: TrendingUp, desc: 'ملخص الإيرادات والمصاريف للفترة' },
        { id: 'trial-balance', label: 'ميزان المراجعة', icon: Scale, desc: 'أرصدة كافة الحسابات المدينة والدائنة' },
        { id: 'stock-status', label: 'تقرير المخزون', icon: Package, desc: 'حالة المخزون الحالية وقيمته' },
        { id: 'sales-summary', label: 'ملخص المبيعات', icon: ShoppingBag, desc: 'تحليل المبيعات حسب العميل والمنتج' },
    ];

    const loadReport = async (id: string) => {
        setSelectedReport(id);
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken') || '';
            const data = await api.get(`/tenant/reports/${id}`, token);
            setReportData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (selectedReport) {
        return (
            <div className="p-8 md:p-12 space-y-10">
                <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200">
                    <div>
                        <h3 className="text-3xl font-black text-slate-800">{reportTypes.find(r => r.id === selectedReport)?.label}</h3>
                        <p className="text-slate-400 font-bold mt-2">تقرير ناتج من البيانات الفعلية المسجلة</p>
                    </div>
                    <button 
                        onClick={() => setSelectedReport(null)}
                        className="px-8 h-14 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs hover:bg-slate-200 transition-all flex items-center gap-3"
                    >
                        <ChevronLeft className="w-4 h-4" /> العودة للقائمة
                    </button>
                </div>

                <GlassCard className="bg-white border-slate-200 min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-6">
                            <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="font-black text-slate-400 animate-pulse uppercase tracking-widest text-xs">جاري معالجة البيانات واستخراج التقرير...</p>
                        </div>
                    ) : reportData ? (
                        <div className="overflow-x-auto">
                           {/* Dynamic report rendering based on ID could go here */}
                           <table className="w-full text-right border-collapse">
                               <thead>
                                   <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                       <th className="p-6">البيان / الحساب</th>
                                       <th className="p-6 text-center">القيمة الإجمالية</th>
                                       <th className="p-6 text-center">النسبة</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                   {Object.entries(reportData).map(([key, val]: any, i) => (
                                       <tr key={i} className="hover:bg-slate-50/50">
                                           <td className="p-6 font-black text-slate-700">{key}</td>
                                           <td className="p-6 text-center font-mono font-black text-sky-600">{typeof val === 'number' ? val.toLocaleString() : String(val)}</td>
                                           <td className="p-6 text-center text-[10px] font-black text-slate-400">---</td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                        </div>
                    ) : (
                        <div className="p-20 text-center opacity-30 italic font-black">لا تتوفر بيانات كافية لإنشاء التقرير حالياً</div>
                    )}
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="p-8 md:p-12 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tight">التقارير والمؤشرات</h2>
                  <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">تحليلات ذكية لكافة مفاصل المؤسسة</p>
               </div>
               <button className="glass-button px-10 h-14 text-sm"><FileBarChart className="w-5 h-5" /> تصدير PDF</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reportTypes.map((rep, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ y: -10, scale: 1.02 }}
                        onClick={() => loadReport(rep.id)}
                        className="glass-card bg-white p-10 border border-slate-200 hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/10 transition-all cursor-pointer group text-center"
                    >
                        <div className="w-20 h-20 bg-sky-50 text-sky-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-sm">
                            <rep.icon className="w-10 h-10 transition-transform group-hover:scale-110" />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 mb-3">{rep.label}</h4>
                        <p className="text-xs text-slate-400 font-bold leading-relaxed">{rep.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AuthProvider>
       <AppContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </AuthProvider>
  );
}

function AppContent({ activeTab, setActiveTab }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
     <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 rounded-[1.5rem] bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 animate-pulse">
              <TrendingUp className="w-8 h-8" />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse text-center">جاري تشغيل النظام...</p>
        </div>
     </div>
  );

  if (!user) return <LoginScreen />;

  const renderModule = () => {
    if (user.role === UserRole.SUPER_ADMIN) {
      switch (activeTab) {
        case 'platform': return <SuperAdminModule anyProps={{ setActiveTab }} />;
        case 'audit-logs': return <AuditLogsModule isAdmin />;
        case 'companies': return (
          <GenericModule 
            title="المؤسسات المشتركة" endpoint="/admin/companies" icon={Building2}
            columns={[
              { key: 'name', label: 'الشركة' },
              { key: 'slug', label: 'المعرف', render: (it:any) => <span className="font-mono text-sky-400">{it.slug}</span> },
              { key: 'status', label: 'الحالة', render: (it:any) => <span className={`font-black ${it.status === 'ACTIVE' ? 'text-emerald-500' : 'text-rose-500'}`}>{it.status}</span> },
              { key: 'createdAt', label: 'تاريخ التسجيل', render: (it:any) => new Date(it.createdAt).toLocaleDateString() }
            ]}
            addFields={[
              { key: 'name', label: 'اسم الشركة', placeholder: 'مثال: شركة الرافدين' },
              { key: 'slug', label: 'رابط النظام (Slug)', placeholder: 'alrafidain' },
              { key: 'ownerEmail', label: 'بريد المالك الأساسي', placeholder: 'owner@example.com' },
              { key: 'ownerName', label: 'اسم المالك بالكامل', placeholder: 'الاسم الكامل' },
              { key: 'ownerPassword', label: 'كلمة المرور الافتراضية', type: 'password' },
              { 
                key: 'planId', 
                label: 'خطة الاشتراك', 
                type: 'relation',
                relationEndpoint: '/admin/plans'
              }
            ]}
          />
        );
        case 'plans': return (
          <GenericModule 
            title="باقات النظام" endpoint="/admin/plans" icon={Wallet}
            columns={[
              { key: 'name', label: 'اسم الباقة' },
              { key: 'monthlyPrice', label: 'السعر الشهري', render: (it:any) => (it.monthlyPrice || 0).toLocaleString() + ' $' },
              { key: 'maxUsers', label: 'المستخدمين' },
              { key: 'maxBranches', label: 'الفروع' }
            ]}
            addFields={[
              { key: 'name', label: 'عنوان الباقة', placeholder: 'مثال: الباقة الاحترافية' },
              { key: 'monthlyPrice', label: 'السعر بالدولار', type: 'number', placeholder: '50' },
              { key: 'yearlyPrice', label: 'السعر السنوي بالدولار', type: 'number', placeholder: '500' },
              { key: 'maxUsers', label: 'الحد الأقصى للمستخدمين', type: 'number', placeholder: '10' },
              { key: 'maxBranches', label: 'الحد الأقصى للفروع', type: 'number', placeholder: '1' },
              { key: 'maxWarehouses', label: 'المخازن المسموحة', type: 'number', placeholder: '1' },
              { key: 'invoiceLimit', label: 'فواتير شهرياً', type: 'number', placeholder: '100' },
              { key: 'features', label: 'الميزات (JSON)', type: 'textarea', placeholder: '[]', full: true }
            ]}
          />
        );
        default: return <SuperAdminModule />;
      }
    }

    switch (activeTab) {
      case 'dashboard': return <DashboardModule user={user} />;
      case 'audit-logs': return <AuditLogsModule />;
      
      // Lookups & Constants
      case 'product-categories': return (
        <GenericModule title="تصنيفات المنتجات" endpoint="productCategory" icon={Package}
          columns={[{ key: 'nameAr', label: 'الاسم' }, { key: 'code', label: 'الكود' }]}
          addFields={[{ key: 'nameAr', label: 'اسم التصنيف', placeholder: 'مثلاً: إلكترونيات' }, { key: 'code', label: 'رمز التصنيف' }]}
        />
      );
      case 'measurement-units': return (
        <GenericModule title="وحدات القياس" endpoint="measurementUnit" icon={Package}
          columns={[{ key: 'nameAr', label: 'الاسم' }, { key: 'symbol', label: 'الرمز' }]}
          addFields={[{ key: 'nameAr', label: 'اسم الوحدة', placeholder: 'مثلاً: كيلو غرام' }, { key: 'symbol', label: 'الرمز' }]}
        />
      );
      case 'warehouses': return (
        <GenericModule title="المستودعات" endpoint="warehouse" icon={Building2}
          columns={[{ key: 'nameAr', label: 'اسم المستودع' }, { key: 'code', label: 'الكود' }, { key: 'location', label: 'الموقع' }]}
          addFields={[{ key: 'nameAr', label: 'اسم المستودع', placeholder: 'مثلاً: المخزن الرئيسي' }, { key: 'code', label: 'كود المستودع' }, { key: 'location', label: 'العنوان الجغرافي' }]}
        />
      );
      case 'departments': return (
        <GenericModule title="الأقسام الإدارية" endpoint="department" icon={Users}
          columns={[{ key: 'nameAr', label: 'الاسم' }, { key: 'code', label: 'الكود' }]}
          addFields={[{ key: 'nameAr', label: 'اسم القسم', placeholder: 'مثلاً: قسم المحاسبة' }, { key: 'code', label: 'كود القسم' }]}
        />
      );
      case 'job-titles': return (
        <GenericModule title="المسميات الوظيفية" endpoint="Users" icon={Users}
          columns={[{ key: 'nameAr', label: 'المسمى' }, { key: 'department', label: 'القسم', render: (v:any) => v.department?.nameAr }]}
          addFields={[
            { key: 'nameAr', label: 'المسمى الوظيفي', placeholder: 'مثلاً: محاسب زبائن' },
            { key: 'departmentId', label: 'القسم التابع له', type: 'relation', relationEndpoint: 'department' }
          ]}
        />
      );
      case 'branches': return (
        <GenericModule title="الفروع" endpoint="branch" icon={Building}
          columns={[{ key: 'nameAr', label: 'الفرع' }, { key: 'location', label: 'الموقع' }]}
          addFields={[{ key: 'nameAr', label: 'اسم الفرع' }, { key: 'phone', label: 'رقم الهاتف' }, { key: 'address', label: 'العنوان' }]}
        />
      );
      case 'tax-types': return (
        <GenericModule title="أنواع الضرائب" endpoint="taxType" icon={Scale}
          columns={[{ key: 'name', label: 'الضريبة' }, { key: 'rate', label: 'النسبة %' }]}
          addFields={[{ key: 'name', label: 'اسم الضريبة' }, { key: 'rate', label: 'نسبة الضريبة %', type: 'number' }]}
        />
      );
      case 'payment-methods': return (
        <GenericModule title="طرق الدفع" endpoint="paymentMethod" icon={Wallet}
          columns={[{ key: 'nameAr', label: 'طريقة الدفع' }]}
          addFields={[{ key: 'nameAr', label: 'الاسم', placeholder: 'مثلاً: نقد كاش' }]}
        />
      );
      case 'cost-centers': return (
        <GenericModule title="مراكز التكلفة" endpoint="costCenter" icon={PieChart}
          columns={[{ key: 'nameAr', label: 'مركز التكلفة' }, { key: 'code', label: 'الكود' }]}
          addFields={[{ key: 'nameAr', label: 'الاسم' }, { key: 'code', label: 'رمز التكلفة' }]}
        />
      );
      case 'expense-categories': return (
        <GenericModule title="تصنيفات المصاريف" endpoint="expenseCategory" icon={PieChart}
          columns={[{ key: 'nameAr', label: 'التصنيف' }]}
          addFields={[{ key: 'nameAr', label: 'اسم التصنيف' }]}
        />
      );
      case 'customer-groups': return (
        <GenericModule title="مجموعات العملاء" endpoint="customerGroup" icon={Users}
          columns={[{ key: 'nameAr', label: 'المجموعة' }]}
          addFields={[{ key: 'nameAr', label: 'اسم المجموعة' }]}
        />
      );
      case 'supplier-groups': return (
        <GenericModule title="مجموعات الموردين" endpoint="supplierGroup" icon={Briefcase}
          columns={[{ key: 'nameAr', label: 'المجموعة' }]}
          addFields={[{ key: 'nameAr', label: 'اسم المجموعة' }]}
        />
      );
      case 'lead-sources': return (
        <GenericModule title="مصادر العملاء المحتملين" endpoint="leadSource" icon={MessageSquare}
          columns={[{ key: 'nameAr', label: 'المصدر' }]}
          addFields={[{ key: 'nameAr', label: 'اسم المصدر' }]}
        />
      );
      case 'fiscal-years': return (
        <GenericModule title="السنوات المالية" endpoint="fiscalYear" icon={Calendar}
          columns={[{ key: 'name', label: 'السنة' }, { key: 'status', label: 'الحالة' }]}
          addFields={[
            { key: 'name', label: 'اسم السنة', placeholder: 'مثلاً: 2024' },
            { key: 'startDate', label: 'تاريخ البدء', type: 'date' },
            { key: 'endDate', label: 'تاريخ الانتهاء', type: 'date' }
          ]}
        />
      );

      // Accounting
      case 'accounts': return (
        <GenericModule 
          title="دليل الحسابات (CoA)" endpoint="account" icon={BarChart3}
          columns={[
            { key: 'code', label: 'كود الحساب' },
            { key: 'name', label: 'اسم الحساب' },
            { key: 'type', label: 'نوع الحساب', render: (v:any) => <span className="text-[10px] font-black">{v.type}</span> },
          ]}
          addFields={[
            { key: 'code', label: 'الكود المالي', placeholder: '10101' },
            { key: 'name', label: 'اسم الحساب', placeholder: 'مثلاً: حساب البنك الرئيسي' },
            { key: 'type', label: 'التصنيف المحاسبي', type: 'select', options: [
                { label: 'أصل (Asset)', value: 'ASSET' },
                { label: 'خصم (Liability)', value: 'LIABILITY' },
                { label: 'حقوق ملكية (Equity)', value: 'EQUITY' },
                { label: 'إيراد (Revenue)', value: 'REVENUE' },
                { label: 'مصروف (Expense)', value: 'EXPENSE' },
            ]},
            { key: 'parentAccountId', label: 'الحساب الأب', type: 'relation', relationEndpoint: 'account' },
          ]}
        />
      );

      case 'journal-entries': return (
        <GenericModule 
          title="القيود اليومية" endpoint="journalEntry" icon={FileText}
          columns={[
            { key: 'id', label: 'رقم القيد الداخلي' },
            { key: 'reference', label: 'المرجع' },
            { key: 'date', label: 'التاريخ', render: (v:any) => new Date(v.date).toLocaleDateString() },
            { key: 'description', label: 'البيان' },
          ]}
          addFields={[
            { key: 'reference', label: 'المرجع اليدوي', placeholder: 'REF-XXXX' },
            { key: 'date', label: 'تاريخ القيد', type: 'date' },
            { key: 'description', label: 'البيان الوصفي', type: 'textarea', full: true },
          ]}
        />
      );

      case 'banking': return (
        <GenericModule 
          title="البنوك والخزينة" endpoint="account" icon={Wallet}
          columns={[
             { key: 'code', label: 'الكود' },
             { key: 'name', label: 'البنك / الصندوق' },
             { key: 'balance', label: 'الرصيد المتوفر', render: (v:any) => (v.balance || 0).toLocaleString() + ' IQD' },
          ]}
          fixedFilters={{ type: 'ASSET' }}
          addFields={[
             { key: 'name', label: 'اسم البنك أو الخزينة', placeholder: 'مثلاً: خزينة المبيعات النقدية' },
             { key: 'code', label: 'كود الحساب المالي', placeholder: '111001' },
          ]}
        />
      );

      // Business
      case 'sales': return (
        <GenericModule 
            title="فواتير المبيعات" endpoint="invoice" icon={ShoppingBag}
            columns={[
              { key: 'number', label: 'رقم الفاتورة' },
              { key: 'customer', label: 'العميل', render: (v:any) => v.customer?.name || 'نقدي' },
              { key: 'totalAmount', label: 'الإجمالي', render: (v:any) => (v.totalAmount || 0).toLocaleString() },
              { key: 'status', label: 'الحالة', render: (v:any) => <span className={v.status === 'PAID' ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>{v.status}</span> },
            ]}
            addFields={[
              { key: 'customerId', label: 'العميل المختص', type: 'relation', relationEndpoint: 'customer' },
              { key: 'taxTypeId', label: 'نوع الضريبة المطبقة', type: 'relation', relationEndpoint: 'taxType' },
              { key: 'paymentMethodId', label: 'طريقة الدفع', type: 'relation', relationEndpoint: 'paymentMethod' },
              { key: 'notes', label: 'ملاحظات الفاتورة', type: 'textarea', full: true },
            ]}
        />
      );

      case 'customers': return (
        <GenericModule 
            title="دليل العملاء" endpoint="customer" icon={Users}
            columns={[
              { key: 'name', label: 'اسم العميل' },
              { key: 'phone', label: 'الهاتف' },
              { key: 'email', label: 'البريد' },
            ]}
            addFields={[
              { key: 'name', label: 'الاسم التجاري أو الشخصي', placeholder: 'مثلاً: شركة النور' },
              { key: 'phone', label: 'رقم التواصل الرئيسي', placeholder: '07XXXXXXXXX' },
              { key: 'email', label: 'البريد الإلكتروني', placeholder: 'email@domain.com' },
              { key: 'customerGroupId', label: 'مجموعة العملاء', type: 'relation', relationEndpoint: 'customerGroup' },
              { key: 'address', label: 'العنوان الجغرافي', type: 'textarea', full: true },
            ]}
        />
      );

      case 'suppliers': return (
        <GenericModule 
            title="دليل الموردين" endpoint="supplier" icon={Briefcase}
            columns={[
              { key: 'name', label: 'اسم المورد' },
              { key: 'phone', label: 'الهاتف' },
              { key: 'contactPerson', label: 'الشخص المسؤول' },
            ]}
            addFields={[
              { key: 'name', label: 'اسم الشركة الموردة', placeholder: 'مثلاً: شركة سامسونج الرسمية' },
              { key: 'contactPerson', label: 'اسم مندوب التواصل', placeholder: 'أحمد محمود' },
              { key: 'phone', label: 'رقم الهاتف', placeholder: '07XXXXXXXXX' },
              { key: 'supplierGroupId', label: 'مجموعة الموردين', type: 'relation', relationEndpoint: 'supplierGroup' },
              { key: 'address', label: 'العنوان والمركز الرئيسي', type: 'textarea', full: true },
            ]}
        />
      );

      case 'crm': return (
        <GenericModule 
            title="إدارة العملاء المهتمين Leads" endpoint="lead" icon={MessageSquare}
            columns={[
              { key: 'name', label: 'الاسم' },
              { key: 'email', label: 'البريد' },
              { key: 'source', label: 'المصدر' },
              { key: 'status', label: 'الحالة', render: (v:any) => <span className="font-black text-[10px]">{v.status}</span> },
            ]}
            addFields={[
              { key: 'name', label: 'اسم العميل المرجح', placeholder: 'مثلاً: شركة الفاو' },
              { key: 'email', label: 'البريد الإلكتروني', placeholder: 'lead@mail.com' },
              { key: 'phone', label: 'رقم الهاتف', placeholder: '07XXXXXXXXX' },
              { key: 'source', label: 'مصدر العميل', placeholder: 'مثلاً: فيسبوك' },
              { key: 'status', label: 'حالة الفرصة', type: 'select', options: [
                  { label: 'جديد', value: 'NEW' },
                  { label: 'تواصل', value: 'CONTACTED' },
                  { label: 'مهتم', value: 'INTERESTED' },
                  { label: 'تم التحويل', value: 'CONVERTED' },
                  { label: 'مهمل', value: 'LOST' },
              ]},
            ]}
        />
      );

      case 'opportunities': return (
        <GenericModule 
            title="فرص البيع المؤكدة" endpoint="opportunity" icon={TrendingUp}
            columns={[
              { key: 'title', label: 'العنوان' },
              { key: 'expectedValue', label: 'القيمة المتوقعة', render: (v:any) => (v.expectedValue || 0).toLocaleString() },
              { key: 'stage', label: 'المرحلة' },
              { key: 'status', label: 'الحالة' },
            ]}
            addFields={[
              { key: 'title', label: 'عنوان الفرصة', placeholder: 'بيع أجهزة مكتبية لشركة المدى' },
              { key: 'customerId', label: 'العميل المرجح', type: 'relation', relationEndpoint: 'customer' },
              { key: 'expectedValue', label: 'القيمة التقديرية', type: 'number' },
              { key: 'stage', label: 'مرحلة البيع', placeholder: 'مثلاً: تفاوض' },
              { key: 'closeDate', label: 'تاريخ الإغلاق المتوقع', type: 'date' },
            ]}
        />
      );

      case 'expenses': return (
        <GenericModule 
            title="إدارة المصاريف" endpoint="expense" icon={PieChart}
            columns={[
              { key: 'description', label: 'البيان' },
              { key: 'amount', label: 'المبلغ', render: (v:any) => (v.amount || 0).toLocaleString() },
              { key: 'categoryRel', label: 'التصنيف', render: (v:any) => v.categoryRel?.nameAr },
            ]}
            addFields={[
              { key: 'amount', label: 'المبلغ المصروف', type: 'number' },
              { key: 'categoryId', label: 'تصنيف المصروف', type: 'relation', relationEndpoint: 'expenseCategory' },
              { key: 'description', label: 'البيان الوصفي', type: 'textarea', full: true },
              { key: 'date', label: 'تاريخ الصرف', type: 'date' },
            ]}
        />
      );

      case 'work-orders': return (
        <GenericModule 
            title="أوامر التشغيل" endpoint="workOrder" icon={ClipboardList}
            columns={[
              { key: 'number', label: 'رقم الأمر' },
              { key: 'bom', label: 'التركيبة BOM', render: (v:any) => v.bom?.product?.nameAr },
              { key: 'status', label: 'الحالة' },
            ]}
            addFields={[
              { key: 'number', label: 'رقم أمر الإنتاخ', placeholder: 'WO-001' },
              { key: 'billOfMaterialsId', label: 'استخدام تركيبة (BOM)', type: 'relation', relationEndpoint: 'billOfMaterials' },
              { key: 'plannedQuantity', label: 'الكمية المخططة', type: 'number' },
              { key: 'startDate', label: 'تاريخ البدء', type: 'date' },
              { key: 'status', label: 'الحالة', type: 'select', options: [
                  { label: 'مسودة', value: 'DRAFT' },
                  { label: 'جاري التنفيذ', value: 'PROCESSING' },
                  { label: 'مكتمل', value: 'COMPLETED' },
                  { label: 'ملغي', value: 'CANCELLED' }
              ]},
            ]}
        />
      );

      case 'purchases': return (
        <GenericModule 
            title="مشتريات الموردين" endpoint="purchaseInvoice" icon={Briefcase}
            columns={[
              { key: 'number', label: 'رقم الفاتورة' },
              { key: 'supplier', label: 'المورد', render: (v:any) => v.supplier?.name },
              { key: 'totalAmount', label: 'الإجمالي', render: (v:any) => (v.totalAmount || 0).toLocaleString() },
            ]}
            addFields={[
                { key: 'supplierId', label: 'المورد', type: 'relation', relationEndpoint: 'supplier' },
                { key: 'number', label: 'رقم فاتورة المورد', placeholder: 'PI-XXXX' },
                { key: 'notes', label: 'ملاحظات الشراء', type: 'textarea', full: true },
            ]}
        />
      );

      // Logistics
      case 'inventory': return (
        <GenericModule 
            title="المخزون والمنتجات" endpoint="product" icon={Package}
            columns={[
              { key: 'name', label: 'اسم المنتج' },
              { key: 'sku', label: 'رمز SKU' },
              { key: 'stock', label: 'الكمية', render: (v:any) => <span className="font-mono font-black">{v.stock || 0}</span> },
              { key: 'price', label: 'السعر', render: (v:any) => (v.price || 0).toLocaleString() },
            ]}
            addFields={[
                { key: 'name', label: 'اسم المادة (عربي)', placeholder: 'مثلاً: آيفون 15' },
                { key: 'sku', label: 'الرمز التعريفي SKU', placeholder: 'IPH-15-BL' },
                { key: 'categoryId', label: 'تصنيف المنتج', type: 'relation', relationEndpoint: 'productCategory' },
                { key: 'unitId', label: 'وحدة القياس', type: 'relation', relationEndpoint: 'measurementUnit' },
                { key: 'price', label: 'سعر البيع', type: 'number' },
                { key: 'cost', label: 'تكلفة المنتج', type: 'number' },
            ]}
        />
      );

      case 'manufacturing': return (
        <GenericModule
            title="عقود التصنيع BOM" endpoint="billOfMaterials" icon={Database}
            columns={[
                { key: 'product', label: 'المنتج النهائي', render: (v:any) => v.product?.nameAr },
                { key: 'code', label: 'الرمز' },
                { key: 'quantity', label: 'الكمية الناتجة' },
            ]}
            addFields={[
                { key: 'productId', label: 'المنتج النهائي', type: 'relation', relationEndpoint: 'product' },
                { key: 'code', label: 'كود التركيبة', placeholder: 'BOM-001' },
                { key: 'quantity', label: 'الكمية المعيارية للإنتاج', type: 'number' },
            ]}
        />
      );

      // ORGA
      case 'hr': return (
        <GenericModule 
            title="إدارة الموظفين" endpoint="employee" icon={Users}
            columns={[
              { key: 'name', label: 'الاسم الكامل' },
              { key: 'department', label: 'القسم', render: (v:any) => v.department?.nameAr },
              { key: 'jobTitle', label: 'المسمى الوظيفي', render: (v:any) => v.jobTitle?.nameAr },
              { key: 'status', label: 'الحالة' },
            ]}
            addFields={[
                { key: 'name', label: 'اسم الموظف الرباعي', placeholder: 'الاسم كما في الهوية' },
                { key: 'email', label: 'البريد الإلكتروني' },
                { key: 'departmentId', label: 'القسم التابع له', type: 'relation', relationEndpoint: 'department' },
                { key: 'jobTitleId', label: 'المسمى الوظيفي', type: 'relation', relationEndpoint: 'jobTitle' },
                { key: 'salary', label: 'الراتب الأساسي', type: 'number' },
            ]}
        />
      );

      case 'payroll': return (
        <GenericModule 
            title="مسيرات الرواتب" endpoint="payrollRun" icon={CreditCard}
            columns={[
              { key: 'month', label: 'الشهر' },
              { key: 'year', label: 'السنة' },
              { key: 'totalAmount', label: 'إجمالي الرواتب', render: (v:any) => (v.totalAmount || 0).toLocaleString() },
              { key: 'status', label: 'الحالة' },
            ]}
            addFields={[
                { key: 'month', label: 'الشهر (عدد)', type: 'number', placeholder: '1-12' },
                { key: 'year', label: 'السنة', type: 'number', placeholder: '2024' },
                { key: 'notes', label: 'ملاحظات المسير', type: 'textarea', full: true },
            ]}
        />
      );

      // Services & Assets
      case 'projects': return (
        <GenericModule 
            title="إدارة المشاريع" endpoint="project" icon={GitBranch}
            columns={[
              { key: 'name', label: 'المشروع' },
              { key: 'status', label: 'الحالة' },
              { key: 'budget', label: 'الميزانية', render: (v:any) => (v.budget || 0).toLocaleString() },
            ]}
            addFields={[
                { key: 'name', label: 'اسم المشروع', placeholder: 'تطوير النظام الداخلي' },
                { key: 'description', label: 'وصف المشروع', type: 'textarea', full: true },
                { key: 'budget', label: 'الميزانية المخصصة', type: 'number' },
                { key: 'startDate', label: 'تاريخ البدء', type: 'date' },
                { key: 'endDate', label: 'تاريخ الانتهاء المتوقع', type: 'date' },
            ]}
        />
      );

      case 'pos': return (
        <div className="p-8 space-y-8">
           <div className="liquid-glass p-12 text-center rounded-[3rem] border border-sky-500/10">
              <ShoppingBag className="w-20 h-20 text-sky-500 mx-auto mb-6 opacity-30" />
              <h2 className="text-4xl font-black text-slate-800">نظام نقطة البيع POS</h2>
              <p className="text-slate-500 font-bold mt-4 max-w-xl mx-auto italic">نظام نقاط البيع المباشر قيد التطوير للارتباط بآلة الكاشير والطابعة الحرارية.</p>
              <div className="mt-10 flex gap-4 justify-center">
                 <button onClick={() => setActiveTab('sales')} className="glass-button px-10 h-16">الانتقال لفواتير البيع</button>
                 <button className="glass-button-secondary px-10 h-16 opacity-50 cursor-not-allowed">بدء جلسة بيع جديدة</button>
              </div>
           </div>
        </div>
      );

      case 'assets': return (
        <GenericModule
            title="إدارة الأصول الثابتة" endpoint="asset" icon={Building2}
            columns={[
                { key: 'name', label: 'الأصل' },
                { key: 'purchaseValue', label: 'قيمة الشراء', render: (v:any) => (v.purchaseValue || 0).toLocaleString() },
                { key: 'status', label: 'الحالة' },
            ]}
            addFields={[
                { key: 'name', label: 'اسم الأصل', placeholder: 'مثلاً: سيارة نقل' },
                { key: 'categoryId', label: 'تصنيف الأصل', type: 'relation', relationEndpoint: 'assetCategory' },
                { key: 'purchaseValue', label: 'قيمة الشراء التاريخية', type: 'number' },
                { key: 'purchaseDate', label: 'تاريخ الشراء', type: 'date' },
            ]}
        />
      );

      case 'fleet': return (
        <GenericModule
            title="أسطول المركبات" endpoint="vehicle" icon={Database}
            columns={[
                { key: 'licensePlate', label: 'رقم اللوحة' },
                { key: 'model', label: 'الموديل' },
                { key: 'status', label: 'الحالة' },
            ]}
            addFields={[
                { key: 'licensePlate', label: 'رقم لوحة المركبة', placeholder: 'بغداد - 12345' },
                { key: 'model', label: 'نوع وموديل المركبة', placeholder: 'Toyota Hilux 2024' },
                { key: 'status', label: 'الحالة', type: 'select', options: [
                    { label: 'نشط', value: 'ACTIVE' },
                    { label: 'صيانة', value: 'MAINTENANCE' },
                    { label: 'متوقف', value: 'INACTIVE' }
                ]},
            ]}
        />
      );

      case 'lookups': return <LookupsManagerModule />;
      case 'reports': return <ReportsModule />;

      case 'business-settings': return <CompanySettingsModule user={user} />;
      
      default: return <DashboardModule user={user} />;
    }
  };

const CompanySettingsModule = ({ user }: { user: any }) => {
  const [data, setData] = useState<any>({ name: '', phone: '', address: '', taxNumber: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || '';
    api.get('/tenant/settings', token)
      .then(res => {
        const settingsMap: any = {};
        res.settings.forEach((s: any) => settingsMap[s.key] = s.value);
        setData({ ...res.tenant, ...settingsMap });
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      await api.put('/tenant/settings', data, token);
      setToast({ msg: 'تم حفظ الإعدادات بنجاح', type: 'success' });
    } catch (err) {
      setToast({ msg: 'فشل في حفظ الإعدادات', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const [isSeeding, setIsSeeding] = useState(false);
  const handleSeed = async () => {
    if (!confirm('سيتم إنشاء تصنيفات، مخازن، وأقسام افتراضية لتسهيل البدء. هل أنت متأكد؟')) return;
    setIsSeeding(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      await api.post('/tenant/seed', {}, token);
      setToast({ msg: 'تم إنشاء البيانات الافتراضية بنجاح', type: 'success' });
    } catch (err) {
      setToast({ msg: 'حدث خطأ أثناء الإنشاء', type: 'error' });
    } finally {
      setIsSeeding(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (isLoading) return <div className="p-20 text-center animate-pulse font-black">جاري تحميل الإعدادات...</div>;

  return (
    <div className="p-12">
        <AnimatePresence>
          {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
        <GlassCard className="max-w-4xl mx-auto p-12 bg-white border-slate-200 shadow-2xl shadow-slate-200/40">
          <h3 className="text-3xl font-black mb-12 flex items-center gap-5 text-slate-800">
              <Settings className="w-10 h-10 text-sky-500" />
              إعدادات المؤسسة الرئيسية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-3">اسم المؤسسة التجاري</label>
                <input 
                  className="glass-input h-16 text-lg" 
                  value={data.name} 
                  onChange={e => setData({...data, name: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-3">الرقم الضريبي الموحد</label>
                <input 
                  className="glass-input h-16 text-lg" 
                  placeholder="أدخل الرقم الضريبي" 
                  value={data.taxNumber || ''} 
                  onChange={e => setData({...data, taxNumber: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-3">رقم الهاتف المركزي</label>
                <input 
                  className="glass-input h-16 text-lg" 
                  placeholder="07XXXXXXXXX" 
                  value={data.phone || ''} 
                  onChange={e => setData({...data, phone: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-3">العنوان الأساسي</label>
                <input 
                  className="glass-input h-16 text-lg" 
                  placeholder="العنوان الكامل" 
                  value={data.address || ''} 
                  onChange={e => setData({...data, address: e.target.value})}
                />
              </div>
              <div className="col-span-2 space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-3">شعار المؤسسة الرسمي</label>
                <div className="h-40 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all group">
                    <TrendingUp className="w-8 h-8 text-slate-300 group-hover:text-sky-500 mb-2 transition-colors" />
                    <p className="text-slate-400 font-bold text-xs">انقر لتعديل شعار المؤسسة</p>
                </div>
              </div>
          </div>

          <div className="mt-12 p-8 border-2 border-dashed border-sky-100 rounded-[2rem] bg-sky-50/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-lg font-black text-slate-800 text-right">تهيئة البيانات الافتراضية</h4>
                <p className="text-sm text-slate-500 font-bold mt-1 text-right">هل بدأت للتو؟ يمكنك إضافة التصنيفات، الوحدات، المخازن، والأقسام الافتراضية بنقرة واحدة.</p>
              </div>
              <button 
                onClick={handleSeed}
                disabled={isSeeding}
                className="whitespace-nowrap px-8 h-14 bg-sky-500 text-white rounded-2xl font-black text-sm hover:bg-sky-600 transition-all shadow-lg shadow-sky-200 disabled:opacity-50"
              >
                {isSeeding ? 'جاري التهيئة...' : 'تهيئة النظام الآن'}
              </button>
            </div>
          </div>

          <div className="mt-16 flex gap-6">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="glass-button flex-1 h-16 uppercase tracking-widest text-sm disabled:opacity-50"
              >
                {isSaving ? 'جاري الحفظ...' : 'حفظ كافة التعديلات'}
              </button>
              <button className="glass-button-secondary px-12 h-16 uppercase tracking-widest text-xs">إلغاء الأمر</button>
          </div>
        </GlassCard>
    </div>
  );
};

  return (
    <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
       <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
             {renderModule()}
          </motion.div>
       </AnimatePresence>
    </AppLayout>
  );
}

const LookupsManagerModule = () => {
    const [activeSubTab, setActiveSubTab] = useState('categories');
    
    useEffect(() => {
        const checkAndSeed = async () => {
            try {
                const token = localStorage.getItem('accessToken') || '';
                const categories = await api.get('/tenant/productCategorys', token);
                if (categories.length === 0) {
                    await api.post('/tenant/seed', {}, token);
                    // No need to reload specifically, the active tab's fetchData will handle it
                }
            } catch (err) {
                console.error('Failed to auto-seed:', err);
            }
        };
        checkAndSeed();
    }, []);
    
    const tabs = [
        { id: 'categories', label: 'تصنيفات المنتجات', endpoint: 'productCategory', icon: Layers },
        { id: 'units', label: 'وحدات القياس', endpoint: 'measurementUnit', icon: Scale },
        { id: 'warehouses', label: 'المستودعات', endpoint: 'warehouse', icon: Database },
        { id: 'branches', label: 'الفروع والأنشطة', endpoint: 'branch', icon: Building2 },
        { id: 'taxtypes', label: 'أنواع الضرائب', endpoint: 'taxType', icon: ShieldCheck },
        { id: 'cost-centers', label: 'مراكز التكلفة', endpoint: 'costCenter', icon: PieChart },
        { id: 'expense-cats', label: 'تصنيفات المصاريف', endpoint: 'expenseCategory', icon: CreditCard },
        { id: 'payment-methods', label: 'طرق الدفع', endpoint: 'paymentMethod', icon: Wallet },
        { id: 'departments', label: 'الأقسام الإدارية', endpoint: 'department', icon: GitBranch },
        { id: 'jobtitles', label: 'المسميات الوظيفية', endpoint: 'jobTitle', icon: Briefcase },
        { id: 'customer-groups', label: 'مجموعات العملاء', endpoint: 'customerGroup', icon: Users },
        { id: 'supplier-groups', label: 'مجموعات الموردين', endpoint: 'supplierGroup', icon: Briefcase },
        { id: 'lead-sources', label: 'مصادر العملاء', endpoint: 'leadSource', icon: MessageSquare },
        { id: 'opportunity-stages', label: 'مراحل الفرص', endpoint: 'opportunityStage', icon: TrendingUp },
        { id: 'project-stages', label: 'مراحل المشاريع', endpoint: 'projectStage', icon: GitBranch },
        { id: 'maintenance-types', label: 'أنواع الصيانة', endpoint: 'maintenanceType', icon: Activity },
    ];

    const activeInfo = tabs.find(t => t.id === activeSubTab) || tabs[0];

    const getAddFields = () => {
        if (activeSubTab === 'jobtitles') {
            return [
                { key: 'nameAr', label: 'المسمى الوظيفي', placeholder: 'مثلاً: محاسب قانوني' },
                { key: 'departmentId', label: 'القسم التابع له', type: 'relation', relationEndpoint: 'department' },
                { key: 'code', label: 'كود الوظيفة', placeholder: 'JOB-01' },
                { key: 'description', label: 'وصف المهام الوظيفية', type: 'textarea', full: true }
            ];
        }

        if (activeSubTab === 'departments') {
            return [
                { key: 'nameAr', label: 'اسم القسم', placeholder: 'مثلاً: قسم المحاسبة' },
                { key: 'code', label: 'كود القسم', placeholder: 'DEPT-01' },
                { key: 'description', label: 'ملاحظات القسم', type: 'textarea', full: true }
            ];
        }

        if (activeSubTab === 'categories' || activeSubTab === 'units' || activeSubTab === 'warehouses' || 
            activeSubTab === 'branches' || activeSubTab === 'taxtypes' || activeSubTab === 'cost-centers' ||
            activeSubTab === 'expense-cats' || activeSubTab === 'payment-methods' || activeSubTab === 'customer-groups' ||
            activeSubTab === 'supplier-groups' || activeSubTab === 'lead-sources' || activeSubTab === 'opportunity-stages' ||
            activeSubTab === 'project-stages' || activeSubTab === 'maintenance-types') {
            
            const fields: any[] = [
                { key: 'nameAr', label: 'الاسم بالعربية', placeholder: 'مثلاً: رئيسي / عام' },
                { key: 'code', label: 'كود الترميز', placeholder: 'CODE-001' },
            ];

            if (activeSubTab === 'taxtypes') {
                fields.push({ key: 'rate', label: 'النسبة المئوية %', type: 'number', placeholder: '15' });
            }
            if (activeSubTab === 'opportunity-stages') {
                fields.push({ key: 'probability', label: 'نسبة النجاح المتوقعة %', type: 'number', placeholder: '50' });
            }

            fields.push({ key: 'description', label: 'ملاحظات وصفية', type: 'textarea', full: true });
            return fields;
        }

        return [
            { key: 'nameAr', label: 'الاسم بالعربية', placeholder: 'البيان' },
            { key: 'code', label: 'الرمز', placeholder: 'CODE' }
        ];
    };

    return (
        <div className="p-8 md:p-12">
            <h2 className="text-3xl font-black mb-10 flex items-center gap-4 text-slate-800">
                <Layers className="w-10 h-10 text-sky-500" />
                إدارة ثوابت وبيانات النظام
            </h2>
            
            <div className="flex flex-wrap gap-4 mb-10">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`px-6 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 ${
                            activeSubTab === tab.id 
                            ? 'bg-sky-500 text-white shadow-xl shadow-sky-200 scale-105' 
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-sky-200 hover:text-sky-500'
                        }`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <GlassCard className="p-0 overflow-hidden bg-white border-slate-200 shadow-2xl shadow-slate-200/40 min-h-[500px]">
                <GenericModule 
                    key={activeSubTab}
                    title={activeInfo.label}
                    endpoint={activeInfo.endpoint}
                    icon={activeInfo.icon}
                    isInternal={true}
                    columns={[
                        { key: 'nameAr', label: 'البيان (العربية)' },
                        { key: 'code', label: 'الكود', render: (it:any) => <span className="font-mono text-sky-500 font-bold">{it.code || '---'}</span> },
                        { key: 'isActive', label: 'الحالة', render: (it:any) => (
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black ${it.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {it.isActive ? 'مفعل' : 'معطل'}
                            </span>
                        )},
                        { key: 'createdAt', label: 'تاريخ الإضافة', render: (it:any) => new Date(it.createdAt).toLocaleDateString('ar-IQ') }
                    ]}
                    addFields={getAddFields()}
                />
            </GlassCard>
        </div>
    );
};
