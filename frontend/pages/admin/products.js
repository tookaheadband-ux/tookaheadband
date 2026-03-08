import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';
import Pagination from '@/components/Pagination';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminGetCategories, adminUpdateRelatedProducts } from '@/lib/api';

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
  const [form, setForm] = useState({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', price: '', categoryId: '', stock: '', isFeatured: '', colors: '', sizes: '' });
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Cloudinary URLs to keep
  const [saving, setSaving] = useState(false);
  const [relatedModal, setRelatedModal] = useState(null); // product being edited for related
  const [relatedSearch, setRelatedSearch] = useState('');
  const [relatedSelected, setRelatedSelected] = useState([]);
  const [savingRelated, setSavingRelated] = useState(false);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); adminGetCategories().then((r) => setCategories(r.data)).catch(console.error); }, [router]);
  const loadProducts = async () => { setLoading(true); try { const r = await adminGetProducts({ page, limit: 10 }); setProducts(r.data.products); setTotalPages(r.data.totalPages); } catch {} finally { setLoading(false); } };
  useEffect(() => { loadProducts(); }, [page]);

  const openCreate = () => { setEditProduct(null); setForm({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', price: '', categoryId: categories[0]?._id || '', stock: '', isFeatured: false }); setFiles([]); setExistingImages([]); setShowModal(true); };
  const openEdit = (p) => { setEditProduct(p); setForm({ nameAr: p.nameAr || '', nameEn: p.nameEn || '', descriptionAr: p.descriptionAr || '', descriptionEn: p.descriptionEn || '', price: p.price, categoryId: p.categoryId?._id || p.categoryId || '', stock: p.stock, isFeatured: p.isFeatured, colors: (p.colors || []).join(', '), sizes: (p.sizes || []).join(', ') }); setFiles([]); setExistingImages(p.images || []); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => { if (k !== 'colors' && k !== 'sizes') fd.append(k, form[k]); });
      fd.append('colors', form.colors);
      fd.append('sizes', form.sizes);
      files.forEach((f) => fd.append('images', f));
      if (editProduct) {
        if (existingImages.length > 0) { existingImages.forEach((img) => fd.append('existingImages', img)); }
        else { fd.append('existingImages', ''); }
        await adminUpdateProduct(editProduct._id, fd);
      }
      else { await adminCreateProduct(fd); }
      setShowModal(false); loadProducts();
    } catch (err) { alert(err.response?.data?.message || 'Error'); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete this product?')) return; try { await adminDeleteProduct(id); loadProducts(); } catch { alert('Error'); } };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  const openRelated = (p) => {
    setRelatedModal(p);
    setRelatedSelected((p.relatedProducts || []).map((r) => (typeof r === 'object' ? r._id : r)));
    setRelatedSearch('');
  };
  const toggleRelated = (id) => {
    setRelatedSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const saveRelated = async () => {
    if (!relatedModal) return;
    setSavingRelated(true);
    try {
      await adminUpdateRelatedProducts(relatedModal._id, relatedSelected);
      setRelatedModal(null);
      loadProducts();
    } catch { alert('Error saving related products'); } finally { setSavingRelated(false); }
  };

  const filteredForRelated = products.filter((p) =>
    relatedModal && p._id !== relatedModal._id &&
    (t(p.nameAr, p.nameEn).toLowerCase().includes(relatedSearch.toLowerCase()) || p.sku?.toLowerCase().includes(relatedSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-pink-50/40">
      <AdminNav ui={ui} active="products" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">{ui.manageProducts}</h1>
          <button onClick={openCreate}
            className="h-11 px-6 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all">
            + {ui.addProduct}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-gray-800 text-left text-xs uppercase tracking-wider font-black bg-gray-50/80">
              <th className="p-4">{ui.images}</th><th className="p-4">SKU</th><th className="p-4">{ui.name}</th><th className="p-4">{ui.price}</th>
              <th className="p-4">{ui.stock}</th><th className="p-4">{ui.category}</th><th className="p-4">{ui.actions}</th>
            </tr></thead>
            <tbody>{products.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 hover:bg-pink-50/50 transition-colors">
                <td className="p-4"><div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 relative">
                  {p.images?.[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" sizes="48px" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">IMG</div>}
                </div></td>
                <td className="p-4"><span className="text-xs font-black text-pink-500 bg-pink-50 px-3 py-1 rounded-full tracking-wider border border-pink-100">{p.sku || '—'}</span></td>
                <td className="p-4 font-black text-gray-900 text-sm">{t(p.nameAr, p.nameEn)}</td>
                <td className="p-4 text-gray-700 font-bold text-sm">{p.price} EGP</td>
                <td className="p-4"><span className={`text-xs font-black px-3 py-1 rounded-full ${p.stock <= 3 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>{p.stock}</span></td>
                <td className="p-4 text-gray-600 text-xs font-bold">{p.categoryId ? t(p.categoryId.nameAr, p.categoryId.nameEn) : '-'}</td>
                <td className="p-4"><div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="h-8 px-4 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 border border-blue-100 transition-colors">{ui.edit}</button>
                  <button onClick={() => openRelated(p)} className="h-8 px-4 rounded-lg bg-purple-50 text-purple-600 text-xs font-black hover:bg-purple-100 border border-purple-100 transition-colors">Related</button>
                  <button onClick={() => handleDelete(p._id)} className="h-8 px-4 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100 transition-colors">{ui.delete}</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl">
            <h2 className="text-xl font-black text-gray-900 mb-5">{editProduct ? ui.edit : ui.create} Product</h2>
            {editProduct && editProduct.sku && (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs font-black text-gray-500 uppercase tracking-wider">SKU:</span>
                <span className="text-sm font-black text-pink-500 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">{editProduct.sku}</span>
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-gray-700 mb-2">Name (EN)</label><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" /></div>
                <div><label className="block text-xs font-black text-gray-700 mb-2">Name (AR)</label><input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-gray-700 mb-2">Desc (EN)</label><textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={2} className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors resize-none bg-gray-50" /></div>
                <div><label className="block text-xs font-black text-gray-700 mb-2">Desc (AR)</label><textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={2} className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors resize-none bg-gray-50" dir="rtl" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-black text-gray-700 mb-2">{ui.price}</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" required /></div>
                <div><label className="block text-xs font-black text-gray-700 mb-2">{ui.stock}</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" /></div>
                <div><label className="block text-xs font-black text-gray-700 mb-2">{ui.category}</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50">
                    {categories.map((c) => <option key={c._id} value={c._id}>{t(c.nameAr, c.nameEn)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-black text-gray-700 mb-2">Colors (comma separated)</label><input value={form.colors} onChange={(e) => setForm({ ...form, colors: e.target.value })} placeholder="Pink, Red, White" className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold bg-gray-50" /></div>
                <div><label className="block text-xs font-black text-gray-700 mb-2">Sizes (comma separated)</label><input value={form.sizes} onChange={(e) => setForm({ ...form, sizes: e.target.value })} placeholder="S, M, L, One Size" className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold bg-gray-50" /></div>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer font-bold">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded border-gray-300 text-pink-500 focus:ring-pink-400 w-4 h-4" /> {ui.featured}
              </label>
              {editProduct && existingImages.length > 0 && (
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-2">Current Images</label>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200" />
                        <button type="button" onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-black flex items-center justify-center shadow-md hover:bg-red-600 transition-colors">
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div><label className="block text-xs font-black text-gray-700 mb-2">{editProduct ? 'Add More Images' : ui.images}</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setFiles([...e.target.files])}
                  className="w-full text-sm text-gray-600 font-bold file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-pink-50 file:text-pink-600 file:font-black cursor-pointer" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 h-12 flex items-center justify-center bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {saving ? '...' : ui.save}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-12 flex items-center justify-center bg-gray-100 text-gray-700 font-black text-sm rounded-xl hover:bg-gray-200 transition-colors">
                  {ui.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Related Products Modal */}
      {relatedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setRelatedModal(null)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-100 shadow-2xl">
            <h2 className="text-lg font-black text-gray-900 mb-1">Related Products</h2>
            <p className="text-xs text-gray-500 font-bold mb-4">For: {t(relatedModal.nameAr, relatedModal.nameEn)}</p>
            <input
              type="text" value={relatedSearch}
              onChange={(e) => setRelatedSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full h-10 px-4 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none text-sm text-gray-900 font-bold mb-4 bg-gray-50"
            />
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {filteredForRelated.map((p) => {
                const selected = relatedSelected.includes(p._id);
                return (
                  <button key={p._id} onClick={() => toggleRelated(p._id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${selected ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" loading="lazy" />}
                    <div className="min-w-0">
                      <p className="text-sm font-black text-gray-900 truncate">{t(p.nameAr, p.nameEn)}</p>
                      <p className="text-xs text-gray-500 font-bold">{p.price} EGP · {p.sku}</p>
                    </div>
                    <div className={`ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${selected ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`}>
                      {selected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                );
              })}
              {filteredForRelated.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No products found</p>}
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
              <button onClick={saveRelated} disabled={savingRelated}
                className="flex-1 h-11 bg-purple-500 text-white font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {savingRelated ? 'Saving...' : `Save (${relatedSelected.length} selected)`}
              </button>
              <button onClick={() => setRelatedModal(null)} className="h-11 px-5 bg-gray-100 text-gray-700 font-black text-sm rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
AdminProducts.isAdmin = true;
