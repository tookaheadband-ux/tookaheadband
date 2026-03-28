import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetProfitReport } from '@/lib/api';

export default function AdminProfit() {
  const { ui } = useLang();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);

  const load = async (params) => {
    setLoading(true);
    try {
      const r = await adminGetProfitReport(params || { period });
      setData(r.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [period]);

  const handleCustomRange = () => {
    if (dateFrom && dateTo) load({ dateFrom, dateTo });
  };

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  const maxProfit = data?.daily?.length > 0 ? Math.max(...data.daily.map(d => d.revenue), 1) : 1;

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="profit" onLogout={handleLogout} />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">

        <h1 className="text-3xl font-black text-gray-900 mb-8">Profit Report</h1>

        {/* Period Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' },
            { key: 'all', label: 'All Time' },
          ].map((p) => (
            <button key={p.key} onClick={() => { setPeriod(p.key); setDateFrom(''); setDateTo(''); }}
              className={`h-10 px-5 rounded-xl text-sm font-black transition-all ${period === p.key && !dateFrom ? 'bg-gray-900 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-300'}`}>
              {p.label}
            </button>
          ))}
          <div className="flex items-center gap-2 ml-auto">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-white" />
            <span className="text-gray-400 font-bold">→</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="h-10 px-3 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-white" />
            <button onClick={handleCustomRange}
              className="h-10 px-4 bg-pink-500 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all">Go</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold">Loading...</div>
        ) : data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <SummaryCard label="Revenue" value={`${data.overall.revenue} EGP`} icon="💰" bg="bg-emerald-50" border="border-emerald-100" />
              <SummaryCard label="Cost" value={`${data.overall.cost} EGP`} icon="📦" bg="bg-orange-50" border="border-orange-100" />
              <SummaryCard label="Profit" value={`${data.overall.profit} EGP`} icon="📈" bg="bg-green-50" border="border-green-100" highlight />
              <SummaryCard label="Items Sold" value={data.overall.itemsSold} icon="🛍️" bg="bg-violet-50" border="border-violet-100" />
              <SummaryCard label="Orders" value={data.overall.ordersCount} icon="📋" bg="bg-pink-50" border="border-pink-100" />
            </div>

            {/* Extra info */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Shipping Collected</p>
                <p className="text-2xl font-black text-gray-900">{data.overall.shipping} <span className="text-sm text-gray-500">EGP</span></p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Discounts Given</p>
                <p className="text-2xl font-black text-red-500">{data.overall.discount} <span className="text-sm text-gray-500">EGP</span></p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Net (Profit + Shipping - Discounts)</p>
                <p className="text-2xl font-black text-gray-900">{data.overall.profit + data.overall.shipping - data.overall.discount} <span className="text-sm text-gray-500">EGP</span></p>
              </div>
            </div>

            {/* Daily Chart */}
            {data.daily.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                <h3 className="text-lg font-black text-gray-900 mb-4">Daily Breakdown</h3>
                <div className="overflow-x-auto">
                  <div className="flex items-end gap-1 min-w-[400px]" style={{ height: 200 }}>
                    {data.daily.map((d) => (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-[40px]">
                        <span className="text-[10px] font-black text-green-600">{d.profit}</span>
                        <div className="w-full flex flex-col gap-0.5">
                          <div className="w-full bg-emerald-400 rounded-t-md" style={{ height: Math.max(2, (d.revenue / maxProfit) * 160) }} title={`Revenue: ${d.revenue}`} />
                          <div className="w-full bg-orange-300 rounded-b-md" style={{ height: Math.max(1, (d.cost / maxProfit) * 160) }} title={`Cost: ${d.cost}`} />
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 rotate-[-45deg] mt-1 whitespace-nowrap">{d.date.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs font-bold text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-400 rounded-sm" /> Revenue</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-300 rounded-sm" /> Cost</span>
                  </div>
                </div>
              </div>
            )}

            {/* Per-Order Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h3 className="text-lg font-black text-gray-900">Per-Order Profit (Latest 50)</h3>
              </div>

              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-100 text-gray-500 text-left text-xs uppercase tracking-widest font-black bg-gray-50/50">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Revenue</th>
                      <th className="p-4">Cost</th>
                      <th className="p-4">Shipping</th>
                      <th className="p-4">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orders.map((o) => (
                      <tr key={o._id} className="border-b border-gray-50 hover:bg-green-50/30 transition-colors">
                        <td className="p-4 font-black text-gray-900">{o.name}</td>
                        <td className="p-4 text-gray-500 font-bold text-xs whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-gray-700 font-bold">{o.itemsSold}</td>
                        <td className="p-4 font-bold text-emerald-600">{o.revenue} EGP</td>
                        <td className="p-4 font-bold text-orange-500">{o.cost} EGP</td>
                        <td className="p-4 font-bold text-gray-500">{o.shippingCost} EGP</td>
                        <td className="p-4">
                          <span className={`font-black text-base ${o.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {o.profit >= 0 ? '+' : ''}{o.profit} EGP
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="lg:hidden divide-y divide-gray-50">
                {data.orders.map((o) => (
                  <div key={o._id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-gray-900">{o.name}</p>
                      <span className={`font-black text-base ${o.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {o.profit >= 0 ? '+' : ''}{o.profit} EGP
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500">
                      <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                      <span>Rev: {o.revenue}</span>
                      <span>Cost: {o.cost}</span>
                      <span>Ship: {o.shippingCost}</span>
                      <span>{o.itemsSold} items</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, bg, border, highlight }) {
  return (
    <div className={`${bg} p-5 rounded-2xl border ${border} shadow-sm ${highlight ? 'ring-2 ring-green-300' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-black text-gray-500 uppercase tracking-widest">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-2xl font-black ${highlight ? 'text-green-600' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

AdminProfit.isAdmin = true;
