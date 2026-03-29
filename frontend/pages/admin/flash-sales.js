import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetFlashSales, adminCreateFlashSale, adminUpdateFlashSale, adminDeleteFlashSale, adminGetProducts } from '@/lib/api';

function getStatus(sale) {
  const now = new Date();
  const start = new Date(sale.startTime);
  const end = new Date(sale.endTime);
  if (now > end) return 'expired';
  if (now < start) return 'upcoming';
  return 'active';
}

const statusStyles = {
  active: 'bg-green-50 text-green-700 border-green-200',
  expired: 'bg-gray-50 text-gray-500 border-gray-200',
  upcoming: 'bg-blue-50 text-blue-600 border-blue-200',
};

export default function AdminFlashSales() {
  const { t, ui } = useLang();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSale, setEditSale] = useState(null);
  const [form, setForm] = useState({ productId: '', discountedPrice: '', startTime: '', endTime: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);

  const load = async () => {
    try {
      const [salesRes, prodsRes] = await Promise.all([adminGetFlashSales(), adminGetProducts()]);
      setSales(salesRes.data);
      setProducts(Array.isArray(prodsRes.data) ? prodsRes.data : prodsRes.data.products || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toLocalDatetime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openCreate = () => {
    setEditSale(null);
    setForm({ productId: '', discountedPrice: '', startTime: '', endTime: '' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditSale(s);
    setForm({
      productId: s.productId?._id || s.productId,
      discountedPrice: s.discountedPrice,
      startTime: toLocalDatetime(s.startTime),
      endTime: toLocalDatetime(s.endTime),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        productId: form.productId,
        discountedPrice: Number(form.discountedPrice),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };
      if (editSale) {
        await adminUpdateFlashSale(editSale._id, data);
      } else {
        await adminCreateFlashSale(data);
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (sale) => {
    try {
      await adminUpdateFlashSale(sale._id, { isActive: !sale.isActive });
      load();
    } catch { toast.error('Error toggling flash sale'); }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Are you sure you want to delete this flash sale?');
    if (!ok) return;
    try {
      await adminDeleteFlashSale(id);
      load();
      toast.success('Flash sale deleted');
    } catch { toast.error('Error deleting flash sale'); }
  };

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  const getProductName = (sale) => {
    const p = sale.productId;
    if (p && p.nameAr) return t(p.nameAr, p.nameEn);
    return '—';
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="flash-sales" onLogout={handleLogout} />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">⚡ {ui.flashSalesLabel}</h1>
          <button onClick={openCreate}
            className="h-11 px-6 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all">
            + {ui.createFlashSale}
          </button>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 font-bold py-12">{ui.loading}</p>
        ) : sales.length === 0 ? (
          <p className="text-center text-gray-400 font-bold py-12">No flash sales yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sales.map((s) => {
              const status = getStatus(s);
              return (
                <div key={s._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-black text-gray-900 truncate">{getProductName(s)}</p>
                      {s.productId?.sku && (
                        <p className="text-[11px] font-bold text-gray-400 mt-0.5">SKU: {s.productId.sku}</p>
                      )}
                    </div>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border whitespace-nowrap ml-2 ${statusStyles[status]}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black text-pink-500">{s.discountedPrice} EGP</span>
                    <span className="text-sm font-bold text-gray-400 line-through">{s.productId?.price || '—'} EGP</span>
                  </div>

                  <div className="text-xs font-bold text-gray-500 space-y-1 mb-4">
                    <p>{ui.startTime}: {new Date(s.startTime).toLocaleString()}</p>
                    <p>{ui.endTime}: {new Date(s.endTime).toLocaleString()}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => handleToggle(s)}
                      className={`h-8 px-4 rounded-lg text-xs font-black border transition-colors ${
                        s.isActive
                          ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                          : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100'
                      }`}>
                      {s.isActive ? ui.active : 'Inactive'}
                    </button>
                    <button onClick={() => openEdit(s)}
                      className="h-8 px-4 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 border border-blue-100 transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(s._id)}
                      className="h-8 px-4 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100 transition-colors">
                      {ui.delete}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl">
            <h2 className="text-xl font-black text-gray-900 mb-5">
              {editSale ? 'Edit' : ui.createFlashSale}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">{ui.product}</label>
                <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}
                  className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50"
                  required>
                  <option value="">-- {ui.product} --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{t(p.nameAr, p.nameEn)} — {p.price} EGP</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">{ui.discountedPrice} (EGP)</label>
                <input type="number" value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })}
                  placeholder="e.g. 99"
                  className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50"
                  required />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">{ui.startTime}</label>
                <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50"
                  required />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">{ui.endTime}</label>
                <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50"
                  required />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 h-12 flex items-center justify-center bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {saving ? ui.saving : ui.save}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-12 flex items-center justify-center bg-gray-100 text-gray-700 font-black text-sm rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
AdminFlashSales.isAdmin = true;
