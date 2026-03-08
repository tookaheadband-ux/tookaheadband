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
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="orders" onLogout={handleLogout} />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">{ui.manageOrders}</h1>
            <p className="text-sm font-bold text-gray-500 mt-1">Showing {totalCount} total orders</p>
          </div>
          <button onClick={handleExport} disabled={exporting}
            className="h-12 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-sm rounded-xl shadow-[0_4px_14px_0_rgba(244,114,182,0.4)] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
            {exporting ? 'Exporting...' : '📄 Export PDF'}
          </button>
        </div>

        {/* Search & Filters */}
        <form onSubmit={handleSearch} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 mb-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Search</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, phone, SKU..."
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-all bg-gray-50 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-all bg-gray-50 focus:bg-white cursor-pointer">
                <option value="">All Statuses</option>
                <option value="pending">{ui.pending}</option><option value="shipped">{ui.shipped}</option>
                <option value="delivered">{ui.delivered}</option><option value="canceled">{ui.canceled}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">From Date</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-all bg-gray-50 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">To Date</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-all bg-gray-50 focus:bg-white" />
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-50 w-full sm:w-auto self-end">
            <button type="submit" className="h-11 px-6 bg-gray-900 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 shadow-md transition-all whitespace-nowrap">🔍 Apply Filters</button>
            <button type="button" onClick={handleReset} className="h-11 px-6 bg-gray-100 text-gray-700 font-black text-sm rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap">Reset</button>
          </div>
        </form>

        {/* Orders Table — Desktop */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-gray-100 text-gray-500 text-left text-xs uppercase tracking-widest font-black bg-gray-50/50">
                <th className="p-6">{ui.customer}</th><th className="p-6">{ui.phone}</th><th className="p-6">{ui.items}</th>
                <th className="p-6">{ui.total}</th><th className="p-6">{ui.orderStatus}</th><th className="p-6">{ui.date}</th><th className="p-6 text-right">{ui.actions}</th>
              </tr></thead>
              <tbody>{orders.map((o) => (
                <tr key={o._id} className="border-b border-gray-50 hover:bg-pink-50/30 transition-colors group">
                  <td className="p-6">
                    <p className="font-black text-gray-900 text-base mb-1">{o.name}</p>
                    <p className="text-xs text-gray-500 font-semibold truncate max-w-[220px] bg-gray-50 px-2 py-1 rounded inline-block">{o.address}</p>
                  </td>
                  <td className="p-6 text-gray-700 text-base font-bold whitespace-nowrap">{o.phone}</td>
                  <td className="p-6">
                    <div className="text-sm text-gray-700 font-bold space-y-2">
                      {o.items.map((i, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <span className="font-black text-pink-500 text-xs mt-0.5 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100">[{i.skuSnapshot || '—'}]</span> 
                          <span className="leading-tight">{i.productNameSnapshot} <span className="text-gray-400 font-medium">x{i.qty}</span></span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-6 font-black text-gray-900 text-lg whitespace-nowrap">{o.total} EGP</td>
                  <td className="p-6"><span className={`text-xs font-black px-4 py-1.5 rounded-lg border shadow-sm ${statusColors[o.status]}`}>{ui[o.status]}</span></td>
                  <td className="p-6 text-sm text-gray-500 font-bold whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-6 text-right">
                    <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)}
                      className="h-10 px-4 rounded-xl border-2 border-gray-200 hover:border-pink-300 text-sm font-bold text-gray-700 focus:outline-none focus:border-pink-400 bg-white shadow-sm transition-all cursor-pointer">
                      <option value="pending">{ui.pending}</option><option value="shipped">{ui.shipped}</option>
                      <option value="delivered">{ui.delivered}</option><option value="canceled">{ui.canceled}</option>
                    </select>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        {/* Orders Cards — Mobile */}
        <div className="lg:hidden space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-black text-gray-900 text-lg leading-tight">{o.name}</p>
                  <p className="text-sm text-gray-500 font-bold mt-1">{o.phone}</p>
                </div>
                <span className={`text-xs font-black px-3 py-1.5 rounded-lg border shadow-sm flex-shrink-0 ${statusColors[o.status]}`}>{ui[o.status]}</span>
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-4 bg-gray-50 p-2 rounded-lg">{o.address}</p>
              
              <div className="text-sm text-gray-700 font-bold space-y-2 mb-4">
                {o.items.map((i, idx) => (
                  <div key={idx} className="flex gap-2 items-start py-2 border-b border-gray-50 last:border-0 last:pb-0">
                    <span className="font-black text-pink-500 text-xs mt-0.5 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-100">[{i.skuSnapshot || '—'}]</span> 
                    <span className="leading-tight flex-1">{i.productNameSnapshot} <span className="text-gray-400 font-medium whitespace-nowrap">x{i.qty}</span></span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="w-full sm:w-auto flex justify-between sm:block items-center">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-widest sm:hidden">Total</span>
                  <p className="font-black text-gray-900 text-xl">{o.total} EGP</p>
                </div>
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
                  <p className="text-xs text-gray-400 font-bold sm:mr-2">{new Date(o.createdAt).toLocaleDateString()}</p>
                  <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)}
                    className="h-10 px-3 rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-700 focus:outline-none focus:border-pink-400 bg-white shadow-sm cursor-pointer hover:border-pink-300 transition-colors">
                    <option value="pending">{ui.pending}</option><option value="shipped">{ui.shipped}</option>
                    <option value="delivered">{ui.delivered}</option><option value="canceled">{ui.canceled}</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
AdminOrders.isAdmin = true;
