import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import Pagination from '@/components/Pagination';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetOrders, adminUpdateOrderStatus, adminExportOrdersPdf } from '@/lib/api';

export default function AdminOrders() {
  const { ui } = useLang();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);

  const buildParams = () => {
    const p = { page, limit: 15 };
    if (search) p.search = search;
    if (statusFilter) p.status = statusFilter;
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo) p.dateTo = dateTo;
    return p;
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminGetOrders(buildParams());
      setOrders(r.data.orders);
      setTotalPages(r.data.totalPages);
      setTotalCount(r.data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleReset = () => {
    setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo('');
    setPage(1);
    setTimeout(load, 50);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const p = {};
      if (search) p.search = search;
      if (statusFilter) p.status = statusFilter;
      if (dateFrom) p.dateFrom = dateFrom;
      if (dateTo) p.dateTo = dateTo;
      const r = await adminExportOrdersPdf(p);
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `TOOKA_Orders_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert('Export failed'); }
    finally { setExporting(false); }
  };

  const handleStatus = async (id, status) => { try { await adminUpdateOrderStatus(id, status); load(); } catch { alert('Error'); } };
  const statusColors = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    delivered: 'bg-green-50 text-green-700 border-green-200',
    canceled: 'bg-red-50 text-red-600 border-red-200',
  };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-pink-50/40">
      <AdminNav ui={ui} active="orders" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{ui.manageOrders}</h1>
            <p className="text-sm font-bold text-gray-500 mt-1">{totalCount} total orders</p>
          </div>
          <button onClick={handleExport} disabled={exporting}
            className="h-10 px-5 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all disabled:opacity-50 whitespace-nowrap">
            {exporting ? 'Exporting...' : '📄 Export PDF'}
          </button>
        </div>

        {/* Search & Filters */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Search</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, phone, SKU..."
                className="w-full h-10 px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-colors bg-gray-50" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-colors bg-gray-50 cursor-pointer">
                <option value="">All</option>
                <option value="pending">{ui.pending}</option><option value="shipped">{ui.shipped}</option>
                <option value="delivered">{ui.delivered}</option><option value="canceled">{ui.canceled}</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-colors bg-gray-50" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1.5">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-colors bg-gray-50" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="submit" className="h-9 px-5 bg-gray-900 text-white font-black text-xs rounded-xl hover:-translate-y-0.5 transition-all">🔍 Search</button>
            <button type="button" onClick={handleReset} className="h-9 px-5 bg-gray-100 text-gray-700 font-black text-xs rounded-xl hover:bg-gray-200 transition-colors">Reset</button>
          </div>
        </form>

        {/* Orders Table — Desktop */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-gray-800 text-left text-xs uppercase tracking-wider font-black bg-gray-50/80">
              <th className="p-4">{ui.customer}</th><th className="p-4">{ui.phone}</th><th className="p-4">{ui.items}</th>
              <th className="p-4">{ui.total}</th><th className="p-4">{ui.orderStatus}</th><th className="p-4">{ui.date}</th><th className="p-4">{ui.actions}</th>
            </tr></thead>
            <tbody>{orders.map((o) => (
              <tr key={o._id} className="border-b border-gray-50 hover:bg-pink-50/50 transition-colors">
                <td className="p-4">
                  <p className="font-black text-gray-900 text-sm">{o.name}</p>
                  <p className="text-xs text-gray-500 font-semibold truncate max-w-[180px]">{o.address}</p>
                </td>
                <td className="p-4 text-gray-700 text-sm font-bold">{o.phone}</td>
                <td className="p-4"><div className="text-xs text-gray-700 font-bold space-y-1">{o.items.map((i, idx) => <p key={idx}><span className="font-black text-pink-500">[{i.skuSnapshot || '—'}]</span> {i.productNameSnapshot} x{i.qty}</p>)}</div></td>
                <td className="p-4 font-black text-gray-900 text-base">{o.total} EGP</td>
                <td className="p-4"><span className={`text-xs font-black px-3 py-1.5 rounded-full border ${statusColors[o.status]}`}>{ui[o.status]}</span></td>
                <td className="p-4 text-sm text-gray-600 font-bold">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)}
                    className="h-9 px-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700 focus:outline-none focus:border-pink-400 bg-gray-50 transition-colors cursor-pointer">
                    <option value="pending">{ui.pending}</option><option value="shipped">{ui.shipped}</option>
                    <option value="delivered">{ui.delivered}</option><option value="canceled">{ui.canceled}</option>
                  </select>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        {/* Orders Cards — Mobile */}
        <div className="md:hidden space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-gray-900 text-base">{o.name}</p>
                  <p className="text-xs text-gray-500 font-bold">{o.phone}</p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${statusColors[o.status]}`}>{ui[o.status]}</span>
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-2">{o.address}</p>
              <div className="text-xs text-gray-700 font-bold space-y-0.5 mb-3 bg-gray-50 rounded-xl p-3">
                {o.items.map((i, idx) => <p key={idx}><span className="font-black text-pink-500">[{i.skuSnapshot || '—'}]</span> {i.productNameSnapshot} x{i.qty}</p>)}
              </div>
              <div className="flex items-center justify-between">
                <p className="font-black text-gray-900 text-lg">{o.total} EGP</p>
                <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)}
                  className="h-9 px-3 rounded-xl border-2 border-gray-200 text-xs font-bold text-gray-700 focus:outline-none focus:border-pink-400 bg-gray-50 cursor-pointer">
                  <option value="pending">{ui.pending}</option><option value="shipped">{ui.shipped}</option>
                  <option value="delivered">{ui.delivered}</option><option value="canceled">{ui.canceled}</option>
                </select>
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-2">{new Date(o.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
AdminOrders.isAdmin = true;
