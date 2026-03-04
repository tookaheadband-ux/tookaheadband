import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';
import Pagination from '@/components/Pagination';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminGetCategories } from '@/lib/api';

export default function AdminProducts() {
  const { t, ui } = useLang();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', price: '', categoryId: '', stock: '', isFeatured: false });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); adminGetCategories().then((r) => setCategories(r.data)).catch(console.error); }, [router]);
  const loadProducts = async () => { setLoading(true); try { const r = await adminGetProducts({ page, limit: 10 }); setProducts(r.data.products); setTotalPages(r.data.totalPages); } catch {} finally { setLoading(false); } };
  useEffect(() => { loadProducts(); }, [page]);

  const openCreate = () => { setEditProduct(null); setForm({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', price: '', categoryId: categories[0]?._id || '', stock: '', isFeatured: false }); setFiles([]); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ nameAr: p.nameAr || '', nameEn: p.nameEn || '', descriptionAr: p.descriptionAr || '', descriptionEn: p.descriptionEn || '', price: p.price, categoryId: p.categoryId?._id || p.categoryId || '', stock: p.stock, isFeatured: p.isFeatured }); setFiles([]); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData(); Object.keys(form).forEach((k) => fd.append(k, form[k])); files.forEach((f) => fd.append('images', f));
      if (editProduct) { (editProduct.images || []).forEach((img) => fd.append('existingImages', img)); await adminUpdateProduct(editProduct._id, fd); }
      else { await adminCreateProduct(fd); }
      setShowModal(false); loadProducts();
    } catch (err) { alert(err.response?.data?.message || 'Error'); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete this product?')) return; try { await adminDeleteProduct(id); loadProducts(); } catch { alert('Error'); } };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav ui={ui} active="products" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-neutral-900">{ui.manageProducts}</h1>
          <button onClick={openCreate} className="btn-primary text-sm">+ {ui.addProduct}</button>
        </div>
        <div className="card !rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-neutral-100 text-neutral-400 text-left text-xs uppercase tracking-wider">
              <th className="p-3">{ui.images}</th><th className="p-3">{ui.name}</th><th className="p-3">{ui.price}</th>
              <th className="p-3">{ui.stock}</th><th className="p-3">{ui.category}</th><th className="p-3">{ui.actions}</th>
            </tr></thead>
            <tbody>{products.map((p) => (
              <tr key={p._id} className="border-b border-neutral-50 hover:bg-neutral-50">
                <td className="p-3"><div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 relative">
                  {p.images?.[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" sizes="40px" /> : <div className="w-full h-full" />}
                </div></td>
                <td className="p-3 font-medium text-neutral-800">{t(p.nameAr, p.nameEn)}</td>
                <td className="p-3 text-neutral-600">{p.price} EGP</td>
                <td className="p-3"><span className={`badge ${p.stock <= 3 ? 'badge-red' : 'badge-green'}`}>{p.stock}</span></td>
                <td className="p-3 text-neutral-500 text-xs">{p.categoryId ? t(p.categoryId.nameAr, p.categoryId.nameEn) : '-'}</td>
                <td className="p-3"><div className="flex gap-3">
                  <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">{ui.edit}</button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:text-red-600 text-xs font-medium">{ui.delete}</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative card !rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
            <h2 className="text-base font-bold text-neutral-900 mb-4">{editProduct ? ui.edit : ui.create} Product</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-neutral-400 mb-1">Name (EN)</label><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" /></div>
                <div><label className="block text-xs text-neutral-400 mb-1">Name (AR)</label><input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-field" dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs text-neutral-400 mb-1">Desc (EN)</label><textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={2} className="input-field resize-none" /></div>
                <div><label className="block text-xs text-neutral-400 mb-1">Desc (AR)</label><textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={2} className="input-field resize-none" dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-neutral-400 mb-1">{ui.price}</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required /></div>
                <div><label className="block text-xs text-neutral-400 mb-1">{ui.stock}</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" /></div>
                <div><label className="block text-xs text-neutral-400 mb-1">{ui.category}</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input-field">
                    {categories.map((c) => <option key={c._id} value={c._id}>{t(c.nameAr, c.nameEn)}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded border-neutral-300" /> {ui.featured}
              </label>
              <div><label className="block text-xs text-neutral-400 mb-1">{ui.images}</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])}
                  className="w-full text-sm text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-neutral-100 file:text-neutral-700 file:font-medium" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? '...' : ui.save}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">{ui.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
AdminProducts.isAdmin = true;
