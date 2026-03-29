import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetBundles, adminCreateBundle, adminUpdateBundle, adminDeleteBundle, adminGetProducts } from '@/lib/api';

export default function AdminBundles() {
  const { t, ui } = useLang();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [bundles, setBundles] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editBundle, setEditBundle] = useState(null);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', selectedProducts: [], bundlePrice: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);

  const load = async () => {
    try {
      const [bundlesRes, productsRes] = await Promise.all([adminGetBundles(), adminGetProducts()]);
      setBundles(bundlesRes.data);
      setProducts(productsRes.data?.products || productsRes.data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditBundle(null);
    setForm({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', selectedProducts: [], bundlePrice: '', isActive: true });
    setProductSearch('');
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditBundle(b);
    setForm({
      nameAr: b.nameAr || '', nameEn: b.nameEn || '',
      descriptionAr: b.descriptionAr || '', descriptionEn: b.descriptionEn || '',
      selectedProducts: (b.products || []).map((p) => p._id || p),
      bundlePrice: b.bundlePrice, isActive: b.isActive,
    });
    setProductSearch('');
    setShowModal(true);
  };

  const toggleProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(id)
        ? prev.selectedProducts.filter((pid) => pid !== id)
        : [...prev.selectedProducts, id],
    }));
  };

  const getOriginalTotal = (productIds) => {
    return productIds.reduce((sum, id) => {
      const p = products.find((pr) => pr._id === id);
      return sum + (p ? p.price : 0);
    }, 0);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.selectedProducts.length < 2) { toast.error('Select at least 2 products'); return; }
    setSaving(true);
    try {
      const data = {
        nameAr: form.nameAr, nameEn: form.nameEn,
        descriptionAr: form.descriptionAr || undefined, descriptionEn: form.descriptionEn || undefined,
        products: form.selectedProducts,
        bundlePrice: Number(form.bundlePrice),
        isActive: form.isActive,
      };
      editBundle ? await adminUpdateBundle(editBundle._id, data) : await adminCreateBundle(data);
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    const ok = await confirm('Are you sure you want to delete this bundle?');
    if (!ok) return;
    try { await adminDeleteBundle(id); load(); toast.success('Bundle deleted'); }
    catch { toast.error('Error deleting bundle'); }
  };

  const handleToggleActive = async (b) => {
    try {
      await adminUpdateBundle(b._id, { isActive: !b.isActive });
      load();
    } catch { toast.error('Error updating bundle'); }
  };

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  const filteredProducts = products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (p.nameAr || '').toLowerCase().includes(q) || (p.nameEn || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q);
  });

  const formOriginalTotal = getOriginalTotal(form.selectedProducts);
  const formSavings = formOriginalTotal - Number(form.bundlePrice || 0);

  if (loading) return (
    <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center">
      <p className="text-gray-500 font-bold">{ui.loading}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="bundles" onLogout={handleLogout} />
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">🎁 {ui.bundlesLabel || 'Bundles'}</h1>
          <button onClick={openCreate}
            className="h-11 px-6 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all">
            + {ui.createBundle || 'New Bundle'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map((b) => {
            const originalTotal = (b.products || []).reduce((sum, p) => sum + (p.price || 0), 0);
            const savings = originalTotal - b.bundlePrice;
            return (
              <div key={b._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-lg font-black text-gray-900">{t(b.nameAr, b.nameEn)}</p>
                    <p className="text-xs font-bold text-gray-400 mt-1">
                      {(b.products || []).length} {ui.selectProducts || 'products'}
                    </p>
                  </div>
                  <button onClick={() => handleToggleActive(b)}
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${b.isActive ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'}`}>
                    {b.isActive ? (ui.active || 'Active') : 'Inactive'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(b.products || []).slice(0, 4).map((p) => (
                    <span key={p._id} className="text-[10px] font-bold text-gray-600 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 truncate max-w-[120px]">
                      {t(p.nameAr, p.nameEn)}
                    </span>
                  ))}
                  {(b.products || []).length > 4 && (
                    <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                      +{(b.products || []).length - 4}
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-gray-500 space-y-1 mb-4">
                  <p className="line-through text-gray-400">{originalTotal} EGP</p>
                  <p className="text-lg font-black text-gray-900">{ui.bundlePrice || 'Bundle Price'}: {b.bundlePrice} EGP</p>
                  {savings > 0 && (
                    <p className="text-green-600 font-black">{ui.youSave || 'You Save'}: {savings} EGP ({Math.round((savings / originalTotal) * 100)}%)</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="h-8 px-4 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 border border-blue-100 transition-colors">{ui.edit || 'Edit'}</button>
                  <button onClick={() => handleDelete(b._id)} className="h-8 px-4 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100 transition-colors">{ui.delete || 'Delete'}</button>
                </div>
              </div>
            );
          })}
        </div>

        {bundles.length === 0 && (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🎁</p>
            <p className="text-gray-400 font-bold">No bundles yet. Create your first bundle deal!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-lg border border-gray-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-gray-900 mb-5">{editBundle ? (ui.edit || 'Edit') : (ui.createBundle || 'Create')} {ui.bundlesLabel || 'Bundle'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">{ui.name || 'Name'} (AR)</label>
                  <input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder="الاسم بالعربية"
                    className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" required />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">{ui.name || 'Name'} (EN)</label>
                  <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Name in English"
                    className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">Description (AR)</label>
                  <textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} placeholder="الوصف بالعربية" rows={2}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50 resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">Description (EN)</label>
                  <textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} placeholder="Description in English" rows={2}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50 resize-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">{ui.selectProducts || 'Select Products'} ({form.selectedProducts.length})</label>
                <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products..."
                  className="w-full h-[40px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50 text-sm mb-2" />
                <div className="max-h-[200px] overflow-y-auto border-2 border-gray-200 rounded-xl bg-gray-50 p-2 space-y-1">
                  {filteredProducts.map((p) => (
                    <label key={p._id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${form.selectedProducts.includes(p._id) ? 'bg-pink-50 border border-pink-200' : 'hover:bg-gray-100 border border-transparent'}`}>
                      <input type="checkbox" checked={form.selectedProducts.includes(p._id)} onChange={() => toggleProduct(p._id)}
                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-400 w-4 h-4" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{t(p.nameAr, p.nameEn)}</p>
                        <p className="text-[10px] font-bold text-gray-400">{p.sku ? `SKU: ${p.sku} · ` : ''}{p.price} EGP</p>
                      </div>
                    </label>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="text-xs text-gray-400 font-bold text-center py-3">No products found</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-700 mb-2">{ui.bundlePrice || 'Bundle Price'} (EGP)</label>
                <input type="number" value={form.bundlePrice} onChange={(e) => setForm({ ...form, bundlePrice: e.target.value })} placeholder="e.g. 199"
                  className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-black transition-colors bg-gray-50" required min="0" />
                {form.selectedProducts.length > 0 && formOriginalTotal > 0 && (
                  <div className="mt-2 text-xs font-bold space-y-0.5">
                    <p className="text-gray-500">Original total: <span className="line-through">{formOriginalTotal} EGP</span></p>
                    {formSavings > 0 && (
                      <p className="text-green-600">{ui.youSave || 'You Save'}: {formSavings} EGP ({Math.round((formSavings / formOriginalTotal) * 100)}%)</p>
                    )}
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-bold">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-gray-300 text-pink-500 focus:ring-pink-400 w-4 h-4" />
                {ui.active || 'Active'}
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 h-12 flex items-center justify-center bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {saving ? (ui.saving || '...') : (ui.save || 'Save')}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-12 flex items-center justify-center bg-gray-100 text-gray-700 font-black text-sm rounded-xl hover:bg-gray-200 transition-colors">
                  {ui.cancel || 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
AdminBundles.isAdmin = true;
