import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { adminDashboard, adminGetMe, adminSendDailyReport, adminChangePassword } from '@/lib/api';

const navItems = (ui, active) => [
  { href: '/admin/dashboard', label: ui.dashboard, icon: '📊', active: active === 'dashboard' },
  { href: '/admin/products', label: ui.manageProducts, icon: '🛍️', active: active === 'products' },
  { href: '/admin/categories', label: ui.manageCategories, icon: '📂', active: active === 'categories' },
  { href: '/admin/orders', label: ui.manageOrders, icon: '📦', active: active === 'orders' },
  { href: '/admin/pages', label: ui.pages, icon: '📄', active: active === 'pages' },
  { href: '/admin/coupons', label: 'Coupons', icon: '🏷️', active: active === 'coupons' },
  { href: '/admin/reviews', label: 'Reviews', icon: '⭐', active: active === 'reviews' },
  { href: '/admin/sku-search', label: 'SKU Search', icon: '🔍', active: active === 'sku-search' },
];

function AdminNav({ ui, active, onLogout }) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/admin/dashboard" className="font-black text-gray-900 text-xl tracking-wide flex items-center gap-2.5">
            <span className="w-9 h-9 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-md">T</span>
            TOOKA Admin
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-bold text-gray-500 hover:text-pink-500 transition-colors">View Store →</Link>
            <button onClick={onLogout} className="h-9 px-5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors">{ui.logout}</button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap gap-2 mb-8">
          {navItems(ui, active).map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                item.active
                  ? 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-200'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50 bg-white border border-gray-100'
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
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: '', type: '' });

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg({ text: '', type: '' });
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    setPwLoading(true);
    try {
      const res = await adminChangePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ text: res.data.message, type: 'success' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ text: err.response?.data?.message || 'Failed to change password', type: 'error' });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-pink-50/50 flex items-center justify-center"><div className="w-8 h-8 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin" /></div>;

  const statCards = stats ? [
    { label: ui.totalOrders, value: stats.totalOrders, icon: '📦', bg: 'bg-pink-50', border: 'border-pink-100' },
    { label: ui.ordersToday, value: stats.ordersToday, icon: '🕐', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: ui.totalProducts, value: stats.totalProducts, icon: '🛍️', bg: 'bg-amber-50', border: 'border-amber-100' },
    { label: ui.estimatedRevenue, value: `${stats.estimatedRevenue} EGP`, icon: '💰', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  ] : [];

  return (
    <div className="min-h-screen bg-pink-50/40">
      <AdminNav ui={ui} active="dashboard" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Welcome back! 👋</h1>
          <p className="text-gray-600 font-semibold text-base mt-1">Here's what's happening with your store today.</p>
        </div>

        {/* Stat Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, idx) => (
              <div key={idx} className={`${card.bg} p-6 rounded-2xl border ${card.border} shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider">{card.label}</p>
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <p className="text-3xl font-black text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-900 text-lg mb-2 flex items-center gap-2">
              <span>📊</span> {ui.sendDailyReport}
            </h3>
            <p className="text-sm font-semibold text-gray-500 mb-4">Generate and send a daily sales report to your Telegram.</p>
            <button onClick={handleReport} disabled={reportLoading}
              className="h-11 px-8 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
              {reportLoading ? 'Sending...' : ui.sendDailyReport}
            </button>
            {reportMsg && <p className="mt-3 text-sm text-green-600 font-bold">{reportMsg}</p>}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-900 text-lg mb-2 flex items-center gap-2">
              <span>🔒</span> Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <input type="password" placeholder="Current Password" value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-pink-400" />
              <input type="password" placeholder="New Password" value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-pink-400" />
              <input type="password" placeholder="Confirm New Password" value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required minLength={6}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-pink-400" />
              <button type="submit" disabled={pwLoading}
                className="h-11 px-8 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
                {pwLoading ? 'Saving...' : 'Change Password'}
              </button>
              {pwMsg.text && <p className={`text-sm font-bold ${pwMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{pwMsg.text}</p>}
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-900 text-lg mb-3 flex items-center gap-2">
              <span>🚀</span> Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/products" className="h-11 flex items-center justify-center bg-pink-50 text-gray-700 font-bold text-sm rounded-xl hover:bg-pink-100 border border-pink-100 transition-colors">🛍️ Products</Link>
              <Link href="/admin/orders" className="h-11 flex items-center justify-center bg-violet-50 text-gray-700 font-bold text-sm rounded-xl hover:bg-violet-100 border border-violet-100 transition-colors">📦 Orders</Link>
              <Link href="/admin/categories" className="h-11 flex items-center justify-center bg-amber-50 text-gray-700 font-bold text-sm rounded-xl hover:bg-amber-100 border border-amber-100 transition-colors">📂 Categories</Link>
              <Link href="/admin/pages" className="h-11 flex items-center justify-center bg-emerald-50 text-gray-700 font-bold text-sm rounded-xl hover:bg-emerald-100 border border-emerald-100 transition-colors">📄 Pages</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
Dashboard.isAdmin = true;

export { AdminNav, navItems };
