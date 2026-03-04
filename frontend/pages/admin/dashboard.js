import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { adminDashboard, adminGetMe, adminSendDailyReport } from '@/lib/api';

const navItems = (ui, active) => [
  { href: '/admin/dashboard', label: ui.dashboard, active: active === 'dashboard' },
  { href: '/admin/products', label: ui.manageProducts, active: active === 'products' },
  { href: '/admin/categories', label: ui.manageCategories, active: active === 'categories' },
  { href: '/admin/orders', label: ui.manageOrders, active: active === 'orders' },
  { href: '/admin/pages', label: ui.pages, active: active === 'pages' },
];

function AdminNav({ ui, active, onLogout }) {
  return (
    <>
      <header className="glass sticky top-0 z-40 border-b border-neutral-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
          <Link href="/admin/dashboard" className="font-bold text-neutral-900 text-base font-[var(--font-family-heading)]">TOKA Admin</Link>
          <button onClick={onLogout} className="btn-secondary text-xs !py-1.5 !px-4">{ui.logout}</button>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap gap-1.5 mb-8 border-b border-neutral-100 pb-4">
          {navItems(ui, active).map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                item.active ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'}`}>
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav ui={ui} active="dashboard" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {[
              { label: ui.totalOrders, value: stats.totalOrders },
              { label: ui.ordersToday, value: stats.ordersToday },
              { label: ui.totalProducts, value: stats.totalProducts },
              { label: ui.estimatedRevenue, value: `${stats.estimatedRevenue} EGP` },
            ].map((card, idx) => (
              <div key={idx} className="card !rounded-xl p-5 animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <p className="text-xs text-neutral-400 uppercase tracking-wider mb-2">{card.label}</p>
                <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
              </div>
            ))}
          </div>
        )}
        <div className="card !rounded-xl p-5">
          <h3 className="font-semibold text-neutral-900 text-sm mb-3">{ui.sendDailyReport}</h3>
          <button onClick={handleReport} disabled={reportLoading} className="btn-primary text-sm">{reportLoading ? 'Sending...' : ui.sendDailyReport}</button>
          {reportMsg && <p className="mt-3 text-sm text-green-600">{reportMsg}</p>}
        </div>
      </div>
    </div>
  );
}
Dashboard.isAdmin = true;

export { AdminNav, navItems };
