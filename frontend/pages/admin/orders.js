import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import Pagination from '@/components/Pagination';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetOrders, adminUpdateOrderStatus } from '@/lib/api';

export default function AdminOrders() {
  const { ui } = useLang();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);
  const load = async () => { setLoading(true); try { const r = await adminGetOrders({ page, limit: 15 }); setOrders(r.data.orders); setTotalPages(r.data.totalPages); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, [page]);

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
        <h1 className="text-2xl font-black text-gray-900 mb-6">{ui.manageOrders}</h1>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
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
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
AdminOrders.isAdmin = true;
