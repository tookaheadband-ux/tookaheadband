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
    pending: 'bg-amber-50 text-amber-600',
    shipped: 'bg-blue-50 text-blue-600',
    delivered: 'bg-green-50 text-green-600',
    canceled: 'bg-red-50 text-red-500',
  };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-brand-background">
      <AdminNav ui={ui} active="orders" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-xl font-heading font-bold text-brand-text mb-6">{ui.manageOrders}</h1>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-brand-100 text-brand-400 text-left text-xs uppercase tracking-wider font-bold">
              <th className="p-4">{ui.customer}</th><th className="p-4">{ui.phone}</th><th className="p-4">{ui.items}</th>
              <th className="p-4">{ui.total}</th><th className="p-4">{ui.orderStatus}</th><th className="p-4">{ui.date}</th><th className="p-4">{ui.actions}</th>
            </tr></thead>
            <tbody>{orders.map((o) => (
              <tr key={o._id} className="border-b border-brand-50 hover:bg-brand-50/50 transition-colors">
                <td className="p-4">
                  <p className="font-heading font-bold text-brand-text text-sm">{o.name}</p>
                  <p className="text-xs text-brand-400 font-body truncate max-w-[180px]">{o.address}</p>
                </td>
                <td className="p-4 text-brand-700 text-xs font-body font-semibold">{o.phone}</td>
                <td className="p-4"><div className="text-xs text-brand-700 font-body space-y-0.5">{o.items.map((i, idx) => <p key={idx}><span className="font-bold text-brand-primary">[{i.skuSnapshot || '—'}]</span> {i.productNameSnapshot} x{i.qty}</p>)}</div></td>
                <td className="p-4 font-heading font-bold text-brand-primary">{o.total} EGP</td>
                <td className="p-4"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColors[o.status]}`}>{ui[o.status]}</span></td>
                <td className="p-4 text-xs text-brand-400 font-body font-semibold">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  <select value={o.status} onChange={(e) => handleStatus(o._id, e.target.value)}
                    className="h-9 px-3 rounded-xl border-2 border-brand-100 text-xs font-bold text-brand-700 focus:outline-none focus:border-brand-primary bg-white transition-colors cursor-pointer">
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
