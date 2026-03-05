import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { adminDashboard, adminGetMe, adminSendDailyReport } from '@/lib/api';

const navItems = (ui, active) => [
  { href: '/admin/dashboard', label: ui.dashboard, icon: '📊', active: active === 'dashboard' },
  { href: '/admin/products', label: ui.manageProducts, icon: '🛍️', active: active === 'products' },
  { href: '/admin/categories', label: ui.manageCategories, icon: '📂', active: active === 'categories' },
  { href: '/admin/orders', label: ui.manageOrders, icon: '📦', active: active === 'orders' },
  { href: '/admin/pages', label: ui.pages, icon: '📄', active: active === 'pages' },
];

function AdminNav({ ui, active, onLogout }) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-brand-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/admin/dashboard" className="font-bold text-brand-text text-lg font-heading tracking-wide flex items-center gap-2">
            <span className="w-8 h-8 bg-brand-primary rounded-xl flex items-center justify-center text-white text-xs font-black">T</span>
            TOOKA Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs font-bold text-brand-400 hover:text-brand-primary transition-colors">View Store →</Link>
            <button onClick={onLogout} className="h-9 px-4 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold hover:bg-brand-100 transition-colors">{ui.logout}</button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap gap-2 mb-8">
          {navItems(ui, active).map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                item.active
                  ? 'bg-brand-primary text-white shadow-[0_4px_14px_0_rgba(255,199,209,0.5)]'
                  : 'text-brand-700 hover:text-brand-primary hover:bg-brand-50 bg-white/60'
              }`}>
              <span className="mr-1.5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  const { ui } = useLang();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState('');

  useEffect(() => {
    (async () => {
      try { await adminGetMe(); const res = await adminDashboard(); setStats(res.data); }
      catch { router.push('/admin/login'); }
      finally { setLoading(false); }
    })();
  }, [router]);

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };
  const handleReport = async () => {
    setReportLoading(true); setReportMsg('');
    try { const res = await adminSendDailyReport(); setReportMsg(res.data.message); }
    catch { setReportMsg('Failed to send report'); }
    finally { setReportLoading(false); }
  };

  if (loading) return <div className="min-h-screen bg-brand-background flex items-center justify-center"><div className="w-8 h-8 border-3 border-brand-200 border-t-brand-primary rounded-full animate-spin" /></div>;

  const statCards = stats ? [
    { label: ui.totalOrders, value: stats.totalOrders, icon: '📦', color: 'from-pink-500/10 to-rose-500/10' },
    { label: ui.ordersToday, value: stats.ordersToday, icon: '🕐', color: 'from-violet-500/10 to-purple-500/10' },
    { label: ui.totalProducts, value: stats.totalProducts, icon: '🛍️', color: 'from-amber-500/10 to-orange-500/10' },
    { label: ui.estimatedRevenue, value: `${stats.estimatedRevenue} EGP`, icon: '💰', color: 'from-emerald-500/10 to-green-500/10' },
  ] : [];

  return (
    <div className="min-h-screen bg-brand-background">
      <AdminNav ui={ui} active="dashboard" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-heading font-bold text-brand-text">Welcome back! 👋</h1>
          <p className="text-brand-700 font-body text-sm mt-1">Here's what's happening with your store today.</p>
        </div>

        {/* Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, idx) => (
              <div key={idx} className={`bg-gradient-to-br ${card.color} bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-brand-700 uppercase tracking-wider">{card.label}</p>
                  <span className="text-xl">{card.icon}</span>
                </div>
                <p className="text-2xl font-heading font-bold text-brand-text">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm">
            <h3 className="font-heading font-bold text-brand-text text-base mb-3 flex items-center gap-2">
              <span>📊</span> {ui.sendDailyReport}
            </h3>
            <p className="text-sm text-brand-700 font-body mb-4">Generate and send a daily sales report to your Telegram.</p>
            <button onClick={handleReport} disabled={reportLoading}
              className="h-10 px-6 bg-brand-primary text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
              {reportLoading ? 'Sending...' : ui.sendDailyReport}
            </button>
            {reportMsg && <p className="mt-3 text-sm text-green-600 font-bold">{reportMsg}</p>}
          </div>

          <div className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white shadow-sm">
            <h3 className="font-heading font-bold text-brand-text text-base mb-3 flex items-center gap-2">
              <span>🚀</span> Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/products" className="h-10 flex items-center justify-center bg-brand-50 text-brand-700 font-bold text-xs rounded-xl hover:bg-brand-100 transition-colors">Products</Link>
              <Link href="/admin/orders" className="h-10 flex items-center justify-center bg-brand-50 text-brand-700 font-bold text-xs rounded-xl hover:bg-brand-100 transition-colors">Orders</Link>
              <Link href="/admin/categories" className="h-10 flex items-center justify-center bg-brand-50 text-brand-700 font-bold text-xs rounded-xl hover:bg-brand-100 transition-colors">Categories</Link>
              <Link href="/admin/pages" className="h-10 flex items-center justify-center bg-brand-50 text-brand-700 font-bold text-xs rounded-xl hover:bg-brand-100 transition-colors">Pages</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
Dashboard.isAdmin = true;

export { AdminNav, navItems };
