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
  const statusBadge = { pending: 'badge-yellow', shipped: 'badge-brand', delivered: 'badge-green', canceled: 'badge-red' };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav ui={ui} active="orders" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-xl font-bold text-neutral-900 mb-6">{ui.manageOrders}</h1>
        <div className="card !rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-neutral-100 text-neutral-400 text-left text-xs uppercase tracking-wider">
              <th className="p-3">{ui.customer}</th><th className="p-3">{ui.phone}</th><th className="p-3">{ui.items}</th>
              <th className="p-3">{ui.total}</th><th className="p-3">{ui.orderStatus}</th><th className="p-3">{ui.date}</th><th className="p-3">{ui.actions}</th>
            </tr></thead>
            <tbody>{orders.map((o) => (
              <tr key={o._id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="p-3"><p className="font-medium text-neutral-800 text-sm">{o.name}</p><p className="text-xs text-neutral-400 truncate max-w-[180px]">{o.address}</p></td>
                <td className="p-3 text-neutral-600 text-xs">{o.phone}</td>
                <td className="p-3"><div className="text-xs text-neutral-500">{o.items.map((i, idx) => <p key={idx}><span className="font-bold text-brand-primary">[{i.skuSnapshot || '—'}]</span> {i.productNameSnapshot} x{i.qty}</p>)}</div></td>
                <td className="p-3 font-semibold text-neutral-800">{o.total} EGP</td>
                <td className="p-3"><span className={`badge ${statusBadge[o.status]}`}>{ui[o.status]}</span></td>
                <td className="p-3 text-xs text-neutral-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:border-neutral-400">
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
