import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import Pagination from '@/components/Pagination';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetCustomers } from '@/lib/api';

export default function AdminCustomers() {
  const { ui } = useLang();
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('totalSpent');

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);

  const load = async () => {
    setLoading(true);
    try {
      const p = { page, limit: 20, sort };
      if (search) p.search = search;
      const r = await adminGetCustomers(p);
      setCustomers(r.data.customers);
      setTotalPages(r.data.totalPages);
      setTotalCount(r.data.total);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleReset = () => {
    setSearch('');
    setSort('totalSpent');
    setPage(1);
    setTimeout(load, 50);
  };

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—';
  const formatCurrency = (v) => v != null ? `${v.toLocaleString()} EGP` : '0 EGP';

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="customers" onLogout={handleLogout} />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">{ui.customers}</h1>
            <p className="text-sm font-bold text-gray-500 mt-1">Showing {totalCount} total customers</p>
          </div>
        </div>

        {/* Search & Sort */}
        <form onSubmit={handleSearch} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 mb-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Search</label>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, phone..."
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-all bg-gray-50 focus:bg-white" />
            </div>
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sort By</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm transition-all bg-white cursor-pointer">
                <option value="totalSpent">{ui.totalSpent || 'Total Spent'}</option>
                <option value="orderCount">{ui.orderCount || 'Order Count'}</option>
                <option value="lastOrderDate">{ui.lastOrder || 'Last Order'}</option>
                <option value="name">{ui.name || 'Name'}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-gray-50 w-full sm:w-auto self-end">
            <button type="submit" className="h-11 px-6 bg-gray-900 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 shadow-md transition-all whitespace-nowrap">🔍 Apply Filters</button>
            <button type="button" onClick={handleReset} className="h-11 px-6 bg-gray-100 text-gray-700 font-black text-sm rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap">Reset</button>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
            <span className="ml-3 text-sm font-bold text-gray-500">{ui.loading}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && customers.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <p className="text-gray-400 font-bold text-lg">{ui.noCustomers}</p>
          </div>
        )}

        {/* Customers Table — Desktop */}
        {!loading && customers.length > 0 && (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b-2 border-gray-100 text-gray-500 text-left text-xs uppercase tracking-widest font-black bg-gray-50/50">
                  <th className="p-6">{ui.name}</th>
                  <th className="p-6">{ui.phone}</th>
                  <th className="p-6">{ui.email}</th>
                  <th className="p-6">{ui.governorate}</th>
                  <th className="p-6">{ui.orders}</th>
                  <th className="p-6">{ui.totalSpent}</th>
                  <th className="p-6">{ui.lastOrder}</th>
                </tr></thead>
                <tbody>{customers.map((c, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-pink-50/30 transition-colors group">
                    <td className="p-6">
                      <p className="font-black text-gray-900 text-base">{c.name}</p>
                    </td>
                    <td className="p-6 text-gray-700 text-base font-bold whitespace-nowrap">{c.phone}</td>
                    <td className="p-6 text-gray-500 font-semibold text-sm">{c.email || '—'}</td>
                    <td className="p-6">
                      {c.governorate ? (
                        <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 border border-pink-100">{c.governorate}</span>
                      ) : '—'}
                    </td>
                    <td className="p-6">
                      <span className="font-black text-gray-900 text-lg">{c.orderCount}</span>
                    </td>
                    <td className="p-6 font-black text-gray-900 text-base whitespace-nowrap">{formatCurrency(c.totalSpent)}</td>
                    <td className="p-6 text-sm text-gray-500 font-bold whitespace-nowrap">{formatDate(c.lastOrderDate)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customers Cards — Mobile */}
        {!loading && customers.length > 0 && (
          <div className="lg:hidden space-y-4">
            {customers.map((c, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-black text-gray-900 text-lg leading-tight">{c.name}</p>
                    <p className="text-sm text-gray-500 font-bold mt-1">{c.phone}</p>
                  </div>
                  <span className="text-xs font-black px-3 py-1.5 rounded-lg bg-pink-50 text-pink-700 border border-pink-100 flex-shrink-0">
                    {c.orderCount} {ui.orders}
                  </span>
                </div>
                {c.email && <p className="text-sm text-gray-500 font-semibold mb-2">{c.email}</p>}
                {c.governorate && <p className="text-xs text-pink-600 font-bold mb-3">{c.governorate}</p>}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{ui.totalSpent}</p>
                    <p className="font-black text-gray-900 text-xl mt-0.5">{formatCurrency(c.totalSpent)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{ui.lastOrder}</p>
                    <p className="text-sm text-gray-500 font-bold mt-0.5">{formatDate(c.lastOrderDate)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
AdminCustomers.isAdmin = true;
