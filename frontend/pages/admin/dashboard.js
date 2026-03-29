import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { adminDashboard, adminGetMe, adminSendDailyReport, adminChangePassword, adminBackupDatabase, adminGetSiteSettings, adminUpdateSiteSettings } from '@/lib/api';

const navItems = (ui, active) => [
  { href: '/admin/dashboard', label: ui.dashboard, icon: '📊', active: active === 'dashboard' },
  { href: '/admin/products', label: ui.manageProducts, icon: '🛍️', active: active === 'products' },
  { href: '/admin/categories', label: ui.manageCategories, icon: '📂', active: active === 'categories' },
  { href: '/admin/orders', label: ui.manageOrders, icon: '📦', active: active === 'orders' },
  { href: '/admin/pages', label: ui.pages, icon: '📄', active: active === 'pages' },
  { href: '/admin/coupons', label: ui.coupons, icon: '🏷️', active: active === 'coupons' },
  { href: '/admin/reviews', label: ui.reviews, icon: '⭐', active: active === 'reviews' },
  { href: '/admin/profit', label: ui.profitNav, icon: '📈', active: active === 'profit' },
  { href: '/admin/shipping', label: ui.shippingNav, icon: '🚚', active: active === 'shipping' },
  { href: '/admin/customers', label: ui.customers, icon: '👥', active: active === 'customers' },
  { href: '/admin/flash-sales', label: ui.flashSalesLabel, icon: '⚡', active: active === 'flash-sales' },
  { href: '/admin/bundles', label: ui.bundlesLabel, icon: '🎁', active: active === 'bundles' },
  { href: '/admin/settings', label: ui.settings, icon: '⚙️', active: active === 'settings' },
  { href: '/admin/sku-search', label: ui.skuSearch, icon: '🔍', active: active === 'sku-search' },
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
  const [backupLoading, setBackupLoading] = useState(false);
  const [contactForm, setContactForm] = useState({ contact_email: '', contact_phone: '' });
  const [contactSaving, setContactSaving] = useState(false);
  const [contactMsg, setContactMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    (async () => {
      try {
        await adminGetMe();
        const res = await adminDashboard();
        setStats(res.data);
      }
      catch { router.push('/admin/login'); return; }
      finally { setLoading(false); }
      try {
        const settingsRes = await adminGetSiteSettings();
        setContactForm({ contact_email: settingsRes.data.contact_email || '', contact_phone: settingsRes.data.contact_phone || '' });
      } catch {}
    })();
  }, [router]);

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };
  const handleReport = async () => {
    setReportLoading(true); setReportMsg('');
    try { const res = await adminSendDailyReport(); setReportMsg(res.data.message); }
    catch { setReportMsg('Failed to send report'); }
    finally { setReportLoading(false); }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await adminBackupDatabase();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tooka-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Failed to download backup'); }
    finally { setBackupLoading(false); }
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

  const handleContactSave = async (e) => {
    e.preventDefault();
    setContactMsg({ text: '', type: '' });
    setContactSaving(true);
    try {
      await adminUpdateSiteSettings(contactForm);
      setContactMsg({ text: 'Contact info updated!', type: 'success' });
    } catch (err) {
      setContactMsg({ text: err.response?.data?.message || 'Failed to update', type: 'error' });
    } finally { setContactSaving(false); }
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
          <h1 className="text-3xl font-black text-gray-900">{ui.welcomeBack} 👋</h1>
          <p className="text-gray-600 font-semibold text-base mt-1">{ui.storeToday}</p>
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

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          <Link href="/admin/products" className="h-12 flex items-center justify-center bg-white text-gray-700 font-bold text-sm rounded-xl hover:bg-pink-50 border border-gray-100 hover:border-pink-200 transition-all shadow-sm gap-2">🛍️ {ui.manageProducts}</Link>
          <Link href="/admin/orders" className="h-12 flex items-center justify-center bg-white text-gray-700 font-bold text-sm rounded-xl hover:bg-violet-50 border border-gray-100 hover:border-violet-200 transition-all shadow-sm gap-2">📦 {ui.manageOrders}</Link>
          <Link href="/admin/profit" className="h-12 flex items-center justify-center bg-white text-gray-700 font-bold text-sm rounded-xl hover:bg-green-50 border border-gray-100 hover:border-green-200 transition-all shadow-sm gap-2">📈 {ui.profitNav}</Link>
          <Link href="/admin/shipping" className="h-12 flex items-center justify-center bg-white text-gray-700 font-bold text-sm rounded-xl hover:bg-blue-50 border border-gray-100 hover:border-blue-200 transition-all shadow-sm gap-2">🚚 {ui.shippingNav}</Link>
          <Link href="/admin/categories" className="h-12 flex items-center justify-center bg-white text-gray-700 font-bold text-sm rounded-xl hover:bg-amber-50 border border-gray-100 hover:border-amber-200 transition-all shadow-sm gap-2">📂 {ui.manageCategories}</Link>
          <Link href="/admin/coupons" className="h-12 flex items-center justify-center bg-white text-gray-700 font-bold text-sm rounded-xl hover:bg-emerald-50 border border-gray-100 hover:border-emerald-200 transition-all shadow-sm gap-2">🏷️ {ui.coupons}</Link>
        </div>

        {/* Quick Actions Row */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={handleReport} disabled={reportLoading}
            className="h-11 px-6 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50">
            📊 {reportLoading ? ui.saving : ui.sendReport}
          </button>
          <button onClick={handleBackup} disabled={backupLoading}
            className="h-11 px-6 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-100 hover:border-pink-200 hover:bg-pink-50 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50">
            💾 {backupLoading ? ui.saving : ui.downloadBackup}
          </button>
          {reportMsg && <span className="self-center text-sm text-green-600 font-bold">{reportMsg}</span>}
        </div>

        {/* Settings — Collapsible Panels */}
        <div className="space-y-3">
          <SettingsPanel title={`📞 ${ui.contactInfo}`} desc={ui.contactInfoDesc}>
            <form onSubmit={handleContactSave} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Email</label>
                  <input type="email" value={contactForm.contact_email}
                    onChange={(e) => setContactForm({ ...contactForm, contact_email: e.target.value })} required
                    className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-pink-400" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Phone</label>
                  <input type="tel" value={contactForm.contact_phone}
                    onChange={(e) => setContactForm({ ...contactForm, contact_phone: e.target.value })} required
                    className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-pink-400" />
                </div>
              </div>
              <button type="submit" disabled={contactSaving}
                className="h-10 px-6 bg-gray-900 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {contactSaving ? ui.saving : ui.save}
              </button>
              {contactMsg.text && <p className={`text-sm font-bold ${contactMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{contactMsg.text}</p>}
            </form>
          </SettingsPanel>

          <SettingsPanel title={`🔒 ${ui.changePassword}`} desc={ui.changePasswordDesc}>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="password" placeholder={ui.currentPassword} value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-pink-400" />
                <input type="password" placeholder={ui.newPassword} value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={6}
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-pink-400" />
                <input type="password" placeholder={ui.confirmPassword} value={pwForm.confirmPassword}
                  onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required minLength={6}
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-pink-400" />
              </div>
              <button type="submit" disabled={pwLoading}
                className="h-10 px-6 bg-gray-900 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {pwLoading ? ui.saving : ui.changePassword}
              </button>
              {pwMsg.text && <p className={`text-sm font-bold ${pwMsg.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>{pwMsg.text}</p>}
            </form>
          </SettingsPanel>
        </div>

      </div>
    </div>
  );
}
Dashboard.isAdmin = true;

function SettingsPanel({ title, desc, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left">
        <div>
          <h3 className="font-black text-gray-900 text-base">{title}</h3>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">{desc}</p>
        </div>
        <span className="text-gray-400 text-lg flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-5 pb-5 border-t border-gray-50 pt-4">{children}</div>}
    </div>
  );
}

export { AdminNav, navItems };
