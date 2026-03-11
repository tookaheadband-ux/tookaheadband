import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetCoupons, adminCreateCoupon, adminUpdateCoupon, adminDeleteCoupon } from '@/lib/api';

export default function AdminCoupons() {
  const { ui } = useLang();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '', isActive: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);
  const load = () => adminGetCoupons().then((r) => setCoupons(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditCoupon(null); setForm({ code: '', type: 'percentage', value: '', minOrder: '', maxUses: '', expiresAt: '', isActive: true }); setShowModal(true); };
  const openEdit = (c) => {
    setEditCoupon(c);
    setForm({
      code: c.code, type: c.type, value: c.value, minOrder: c.minOrder || '',
      maxUses: c.maxUses || '', expiresAt: c.expiresAt ? c.expiresAt.split('T')[0] : '', isActive: c.isActive,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data = { ...form, value: Number(form.value), minOrder: Number(form.minOrder) || 0, maxUses: Number(form.maxUses) || 0, expiresAt: form.expiresAt || null };
      editCoupon ? await adminUpdateCoupon(editCoupon._id, data) : await adminCreateCoupon(data);
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => { const ok = await confirm('Are you sure you want to delete this coupon?'); if (!ok) return; try { await adminDeleteCoupon(id); load(); toast.success('Coupon deleted'); } catch { toast.error('Error deleting coupon'); } };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-pink-50/40">
      <AdminNav ui={ui} active="coupons" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">🏷️ Coupons</h1>
          <button onClick={openCreate}
            className="h-11 px-6 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all">
            + New Coupon
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xl font-black text-gray-900 tracking-wider">{c.code}</p>
                  <p className="text-sm font-bold text-pink-500 mt-1">
                    {c.type === 'percentage' ? `${c.value}% OFF` : `${c.value} EGP OFF`}
                  </p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${c.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="text-xs font-bold text-gray-500 space-y-1 mb-4">
                {c.minOrder > 0 && <p>Min order: {c.minOrder} EGP</p>}
                <p>Used: {c.usedCount}{c.maxUses > 0 ? ` / ${c.maxUses}` : ' (unlimited)'}</p>
                {c.expiresAt && <p>Expires: {new Date(c.expiresAt).toLocaleDateString()}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="h-8 px-4 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 border border-blue-100 transition-colors">Edit</button>
                <button onClick={() => handleDelete(c._id)} className="h-8 px-4 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl">
            <h2 className="text-xl font-black text-gray-900 mb-5">{editCoupon ? 'Edit' : 'Create'} Coupon</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-xs font-black text-gray-700 mb-2">Code</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. TOOKA20"
                  className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-black tracking-wider transition-colors bg-gray-50 uppercase" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-gray-700 mb-2">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50">
                    <option value="percentage">Percentage %</option><option value="fixed">Fixed Amount</option>
                  </select></div>
                <div><label className="block text-xs font-black text-gray-700 mb-2">Value</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percentage' ? 'e.g. 20' : 'e.g. 50'}
                    className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-gray-700 mb-2">Min Order (EGP)</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="0"
                    className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" /></div>
                <div><label className="block text-xs font-black text-gray-700 mb-2">Max Uses</label>
                  <input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="0 = unlimited"
                    className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" /></div>
              </div>
              <div><label className="block text-xs font-black text-gray-700 mb-2">Expires At</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" /></div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-bold">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-gray-300 text-pink-500 focus:ring-pink-400 w-4 h-4" /> Active
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 h-12 flex items-center justify-center bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {saving ? '...' : 'Save'}
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
AdminCoupons.isAdmin = true;
