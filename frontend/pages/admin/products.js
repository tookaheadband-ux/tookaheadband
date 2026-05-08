import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import Pagination from '@/components/Pagination';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminGetCategories, adminUpdateRelatedProducts } from '@/lib/api';

function TagInput({ label, value, onChange, placeholder, chipColor = 'pink', hint }) {
  // Parsing: split parent value by comma; last element is the in-progress draft, rest are committed tags.
  // Keeping draft in the parent value means a save without pressing Enter still captures what was typed.
  const parts = (value || '').split(',');
  const draft = (parts[parts.length - 1] || '').trim();
  const tags = parts.slice(0, -1).map((p) => p.trim()).filter(Boolean);

  const buildValue = (nextTags, nextDraft) => {
    if (nextTags.length === 0) return nextDraft;
    return nextTags.join(', ') + ', ' + nextDraft;
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    if (v.includes(',')) {
      const segs = v.split(',');
      const newCommit = segs[0].trim();
      const newDraft = segs.slice(1).join(',').trim();
      const nextTags = newCommit && !tags.includes(newCommit) ? [...tags, newCommit] : tags;
      onChange(buildValue(nextTags, newDraft));
    } else {
      onChange(buildValue(tags, v));
    }
  };

  const commit = () => {
    if (!draft) return;
    if (tags.includes(draft)) {
      onChange(buildValue(tags, ''));
    } else {
      onChange(buildValue([...tags, draft], ''));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
      onChange(buildValue(tags.slice(0, -1), ''));
    }
  };

  const removeTag = (tag) => {
    onChange(buildValue(tags.filter((t) => t !== tag), draft));
  };

  const chipClass = chipColor === 'purple'
    ? 'bg-purple-100 text-purple-700 border-purple-200'
    : 'bg-pink-100 text-pink-700 border-pink-200';

  return (
    <div>
      <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="min-h-[44px] flex flex-wrap items-center gap-2 p-2 rounded-xl border-2 border-gray-100 focus-within:border-pink-400 bg-gray-50 focus-within:bg-white transition-colors">
        {tags.map((tag) => (
          <span key={tag} className={`inline-flex items-center gap-1.5 h-7 pl-3 pr-1 rounded-full text-xs font-black border ${chipClass}`}>
            {tag}
            <button type="button" onClick={() => removeTag(tag)}
              className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/60 transition-colors">×</button>
          </span>
        ))}
        <input
          value={draft}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[140px] h-7 px-2 outline-none text-gray-900 font-bold bg-transparent text-sm"
        />
      </div>
      {hint && <p className="text-[11px] text-gray-500 font-bold mt-1.5">{hint}</p>}
    </div>
  );
}

export default function AdminProducts() {
  const { t, ui } = useLang();
  const { toast, confirm } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', price: '', costPrice: '', categoryId: '', stock: '', isFeatured: '', colors: '', sizes: '', variants: [] });
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

  // Regenerate variant rows whenever colors/sizes change in the form, preserving existing per-variant stock.
  const colorsArr = (form.colors || '').split(',').map((c) => c.trim()).filter(Boolean);
  const sizesArr = (form.sizes || '').split(',').map((s) => s.trim()).filter(Boolean);
  useEffect(() => {
    if (!showModal) return;
    let combos = [];
    if (colorsArr.length > 0 && sizesArr.length > 0) {
      combos = colorsArr.flatMap((c) => sizesArr.map((s) => ({ color: c, size: s })));
    } else if (colorsArr.length > 0) {
      combos = colorsArr.map((c) => ({ color: c, size: '' }));
    } else if (sizesArr.length > 0) {
      combos = sizesArr.map((s) => ({ color: '', size: s }));
    }
    const next = combos.map((c) => {
      const existing = (form.variants || []).find((v) => v.color === c.color && v.size === c.size);
      return { color: c.color, size: c.size, stock: existing ? existing.stock : 0 };
    });
    if (JSON.stringify(next) !== JSON.stringify(form.variants || [])) {
      setForm((f) => ({ ...f, variants: next }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.colors, form.sizes, showModal]);

  const updateVariantStock = (idx, val) => {
    setForm((f) => {
      const variants = [...(f.variants || [])];
      variants[idx] = { ...variants[idx], stock: Math.max(0, Number(val) || 0) };
      return { ...f, variants };
    });
  };

  const openCreate = () => { setEditProduct(null); setForm({ nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '', price: '', costPrice: '', categoryId: categories[0]?._id || '', stock: '', isFeatured: false, colors: '', sizes: '', variants: [] }); setFiles([]); setExistingImages([]); setShowModal(true); };
  const openEdit = (p) => {
    const colorsStr = (p.colors || []).length > 0 ? (p.colors || []).join(', ') + ', ' : '';
    const sizesStr = (p.sizes || []).length > 0 ? (p.sizes || []).join(', ') + ', ' : '';
    setEditProduct(p);
    setForm({ nameAr: p.nameAr || '', nameEn: p.nameEn || '', descriptionAr: p.descriptionAr || '', descriptionEn: p.descriptionEn || '', price: p.price, costPrice: p.costPrice || '', categoryId: p.categoryId?._id || p.categoryId || '', stock: p.stock, isFeatured: p.isFeatured, colors: colorsStr, sizes: sizesStr, variants: p.variants || [] });
    setFiles([]); setExistingImages(p.images || []); setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(form).forEach((k) => { if (!['colors', 'sizes', 'variants'].includes(k)) fd.append(k, form[k]); });
      fd.append('colors', form.colors || '');
      fd.append('sizes', form.sizes || '');
      fd.append('variants', JSON.stringify(form.variants || []));
      files.forEach((f) => fd.append('images', f));
      if (editProduct) {
        if (existingImages.length > 0) { existingImages.forEach((img) => fd.append('existingImages', img)); }
        else { fd.append('existingImages', ''); }
        await adminUpdateProduct(editProduct._id, fd);
      }
      else { await adminCreateProduct(fd); }
      setShowModal(false); loadProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => { const ok = await confirm('Are you sure you want to delete this product?'); if (!ok) return; try { await adminDeleteProduct(id); loadProducts(); toast.success('Product deleted'); } catch { toast.error('Error deleting product'); } };
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
    } catch { toast.error('Error saving related products'); } finally { setSavingRelated(false); }
  };

  const filteredForRelated = products.filter((p) =>
    relatedModal && p._id !== relatedModal._id &&
    (t(p.nameAr, p.nameEn).toLowerCase().includes(relatedSearch.toLowerCase()) || p.sku?.toLowerCase().includes(relatedSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="products" onLogout={handleLogout} />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">{ui.manageProducts}</h1>
            <p className="text-sm font-bold text-gray-500">Easily add, edit or remove products from your store.</p>
          </div>
          <button onClick={openCreate}
            className="h-12 px-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-sm rounded-xl shadow-[0_4px_14px_0_rgba(244,114,182,0.4)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
            <span className="text-lg leading-none">+</span> {ui.addProduct}
          </button>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b-2 border-gray-100 text-gray-500 text-left text-xs uppercase tracking-widest font-black bg-gray-50/50">
                <th className="p-6">{ui.images}</th><th className="p-6">SKU</th><th className="p-6">{ui.name}</th><th className="p-6">{ui.price}</th>
                <th className="p-6">{ui.stock}</th><th className="p-6">{ui.category}</th><th className="p-6 text-right">{ui.actions}</th>
              </tr></thead>
              <tbody>{products.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-pink-50/30 transition-colors group">
                  <td className="p-6"><div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 relative border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                    {p.images?.[0] ? <Image src={p.images[0]} alt="" fill className="object-cover" sizes="64px" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">IMG</div>}
                  </div></td>
                  <td className="p-6"><span className="text-xs font-black text-pink-500 bg-pink-50 px-3 py-1.5 rounded-lg border border-pink-100 shadow-sm">{p.sku || '—'}</span></td>
                  <td className="p-6 font-black text-gray-900 text-base">{t(p.nameAr, p.nameEn)}</td>
                  <td className="p-6 text-gray-700 font-bold text-base">{p.price} EGP</td>
                  <td className="p-6"><span className={`text-xs font-black px-3 py-1.5 rounded-lg shadow-sm w-16 inline-block text-center ${p.stock <= 3 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>{p.stock}</span></td>
                  <td className="p-6 text-gray-500 text-sm font-bold">{p.categoryId ? t(p.categoryId.nameAr, p.categoryId.nameEn) : '-'}</td>
                  <td className="p-6"><div className="flex gap-2 justify-end">
                    <button onClick={() => openEdit(p)} className="h-9 px-4 rounded-xl bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 transition-all shadow-sm">{ui.edit}</button>
                    <button onClick={() => openRelated(p)} className="h-9 px-4 rounded-xl bg-purple-50 text-purple-600 text-xs font-black hover:bg-purple-600 hover:text-white border border-purple-100 hover:border-purple-600 transition-all shadow-sm">Related</button>
                    <button onClick={() => handleDelete(p._id)} className="h-9 px-4 rounded-xl bg-red-50 text-red-600 text-xs font-black hover:bg-red-600 hover:text-white border border-red-100 hover:border-red-600 transition-all shadow-sm">{ui.delete}</button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
        <div className="mt-8">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-6">{editProduct ? ui.edit : ui.create} Product</h2>
            {editProduct && editProduct.sku && (
              <div className="mb-6 flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Product SKU</span>
                <span className="text-sm font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-lg border border-pink-200">{editProduct.sku}</span>
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Name (EN)</label><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold transition-all bg-gray-50 focus:bg-white" placeholder="Product Name" /></div>
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 text-right">Name (AR)</label><input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold transition-all bg-gray-50 focus:bg-white text-right" dir="rtl" placeholder="اسم المنتج" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Description (EN)</label><textarea value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} rows={3} className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-600 font-medium transition-all resize-none bg-gray-50 focus:bg-white" placeholder="Product description..." /></div>
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 text-right">Description (AR)</label><textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} rows={3} className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-600 font-medium transition-all resize-none bg-gray-50 focus:bg-white text-right" dir="rtl" placeholder="وصف المنتج..." /></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{ui.sellPrice}</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full h-11 px-4 rounded-xl border-2 border-white focus:border-pink-400 outline-none text-pink-600 text-lg font-black transition-all bg-white shadow-sm" required /></div>
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{ui.costPriceLabel}</label><input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} placeholder="0" className="w-full h-11 px-4 rounded-xl border-2 border-white focus:border-orange-400 outline-none text-orange-600 text-lg font-black transition-all bg-white shadow-sm" /></div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                    {ui.stock}
                    {(form.variants || []).length > 0 && <span className="ml-2 text-[10px] font-bold text-pink-500 normal-case tracking-normal">{ui.autoLabel}</span>}
                  </label>
                  <input
                    type="number"
                    value={(form.variants || []).length > 0 ? (form.variants || []).reduce((s, v) => s + (Number(v.stock) || 0), 0) : (form.stock ?? '')}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    disabled={(form.variants || []).length > 0}
                    className="w-full h-11 px-4 rounded-xl border-2 border-white focus:border-pink-400 outline-none text-gray-900 font-black transition-all bg-white shadow-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">{ui.category}</label>
                  <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full h-11 px-4 rounded-xl border-2 border-white focus:border-pink-400 outline-none text-gray-900 font-bold transition-all bg-white shadow-sm cursor-pointer">
                    {categories.map((c) => <option key={c._id} value={c._id}>{t(c.nameAr, c.nameEn)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <TagInput
                  label={ui.availableColors}
                  value={form.colors || ''}
                  onChange={(val) => setForm({ ...form, colors: val })}
                  placeholder={ui.colorPlaceholder}
                  chipColor="pink"
                  hint={ui.colorsHint}
                />
                <TagInput
                  label={ui.availableSizes}
                  value={form.sizes || ''}
                  onChange={(val) => setForm({ ...form, sizes: val })}
                  placeholder={ui.sizePlaceholder}
                  chipColor="purple"
                  hint={ui.sizesHint}
                />
              </div>

              {/* Variant Stock Matrix */}
              {(form.variants || []).length > 0 && (
                <div className="p-5 bg-gradient-to-br from-pink-50/50 to-purple-50/40 rounded-2xl border-2 border-pink-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-black text-gray-900">{ui.stockPerVariant}</h3>
                      <p className="text-[11px] text-gray-500 font-bold mt-0.5">{ui.stockPerVariantHint}</p>
                    </div>
                    <span className="text-xs font-black text-pink-700 bg-white px-3 py-1.5 rounded-lg border border-pink-100 shadow-sm">
                      {ui.total}: {(form.variants || []).reduce((s, v) => s + (Number(v.stock) || 0), 0)}
                    </span>
                  </div>

                  {colorsArr.length > 0 && sizesArr.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-pink-100">
                            <th className="text-left p-2 text-xs font-black text-gray-500 uppercase tracking-wider">{ui.colorXSize}</th>
                            {sizesArr.map((s) => (
                              <th key={s} className="text-center p-2 text-xs font-black text-gray-500 uppercase tracking-wider">{s}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {colorsArr.map((c) => (
                            <tr key={c} className="border-b border-pink-50">
                              <td className="p-2 text-xs font-black text-pink-700">{c}</td>
                              {sizesArr.map((s) => {
                                const idx = (form.variants || []).findIndex((v) => v.color === c && v.size === s);
                                const variant = idx >= 0 ? form.variants[idx] : null;
                                return (
                                  <td key={s} className="p-1">
                                    <input type="number" min="0" value={variant ? variant.stock : 0}
                                      onChange={(e) => updateVariantStock(idx, e.target.value)}
                                      className="w-full h-9 px-2 rounded-lg border-2 border-white focus:border-pink-400 outline-none text-center text-gray-900 font-black bg-white shadow-sm text-sm" />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {(form.variants || []).map((v, idx) => (
                        <div key={`${v.color}-${v.size}-${idx}`} className="bg-white p-3 rounded-xl border border-pink-100 shadow-sm">
                          <p className="text-xs font-black text-pink-700 mb-1.5">{v.color || v.size}</p>
                          <input type="number" min="0" value={v.stock}
                            onChange={(e) => updateVariantStock(idx, e.target.value)}
                            className="w-full h-9 px-2 rounded-lg border-2 border-gray-100 focus:border-pink-400 outline-none text-center text-gray-900 font-black bg-gray-50 text-sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <label className="flex items-center gap-3 p-4 border-2 border-pink-100 rounded-xl bg-pink-50/50 cursor-pointer w-fit hover:bg-pink-50 transition-colors">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded border-pink-300 text-pink-500 focus:ring-pink-400 w-5 h-5" /> 
                <span className="text-sm font-black text-pink-800 tracking-wide uppercase">{ui.featured} Product</span>
              </label>
              
              <div className="p-5 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                {editProduct && existingImages.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{ui.currentImagesLabel} ({existingImages.length})</label>
                    <div className="flex flex-wrap gap-3">
                      {existingImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-sm" />
                          <button type="button" onClick={() => setExistingImages(existingImages.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-black flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 transition-all">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-3">{ui.newImagesLabel} ({files.length})</label>
                    <div className="flex flex-wrap gap-3">
                      {files.map((f, idx) => (
                        <div key={idx} className="relative group">
                          <img src={URL.createObjectURL(f)} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-200 shadow-sm" />
                          <button type="button" onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-black flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 transition-all">
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                  {editProduct ? ui.addMoreImages : ui.images}
                  <span className="ml-2 text-[10px] font-bold text-pink-500 normal-case tracking-normal">{ui.tapMultipleHint}</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const picked = Array.from(e.target.files || []);
                    if (picked.length > 0) setFiles([...files, ...picked]);
                    e.target.value = '';
                  }}
                  className="w-full text-sm text-gray-600 font-bold file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:bg-white file:border-2 file:border-gray-200 file:text-gray-700 file:font-black file:shadow-sm cursor-pointer hover:file:border-pink-400 transition-all"
                />
              </div>

              <div className="flex gap-4 pt-4 mt-8 border-t border-gray-100">
                <button type="submit" disabled={saving}
                  className="flex-1 h-14 flex items-center justify-center bg-gray-900 text-white font-black text-base tracking-wide rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : ui.save}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-14 flex items-center justify-center bg-gray-100 text-gray-700 font-black text-base tracking-wide rounded-xl hover:bg-gray-200 transition-colors">
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
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setRelatedModal(null)} />
          <div className="relative bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Related Products</h2>
            <p className="text-sm text-gray-500 font-bold mb-6 flex items-center gap-2">
              <span className="uppercase tracking-widest text-xs">For:</span> 
              <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">{t(relatedModal.nameAr, relatedModal.nameEn)}</span>
            </p>
            <input
              type="text" value={relatedSearch}
              onChange={(e) => setRelatedSearch(e.target.value)}
              placeholder="Search products to link..."
              className="w-full h-12 px-5 rounded-xl border-2 border-gray-100 focus:border-purple-400 outline-none text-base text-gray-900 font-bold mb-6 bg-gray-50 focus:bg-white transition-all shadow-inner"
            />
            <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2 custom-scrollbar">
              {filteredForRelated.map((p) => {
                const selected = relatedSelected.includes(p._id);
                return (
                  <button key={p._id} onClick={() => toggleRelated(p._id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${selected ? 'border-purple-400 bg-purple-50 shadow-md transform scale-[1.01]' : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm'}`}>
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-sm" loading="lazy" /> : <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 text-[10px] font-bold">IMG</div>}
                    <div className="min-w-0">
                      <p className="text-base font-black text-gray-900 truncate">{t(p.nameAr, p.nameEn)}</p>
                      <p className="text-sm text-gray-500 font-bold mt-0.5"><span className="text-gray-900">{p.price} EGP</span> <span className="mx-2 text-gray-300">•</span> <span className="text-xs uppercase tracking-wider">{p.sku}</span></p>
                    </div>
                    <div className={`ml-auto w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${selected ? 'bg-purple-500 border-purple-500' : 'border-gray-300'}`}>
                      {selected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                );
              })}
              {filteredForRelated.length === 0 && <div className="py-12 flex flex-col items-center justify-center text-center"><p className="text-lg font-black text-gray-400 mb-1">No products found</p><p className="text-sm text-gray-400 font-medium">Try a different search term</p></div>}
            </div>
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
              <button onClick={saveRelated} disabled={savingRelated}
                className="flex-1 h-14 bg-purple-600 text-white font-black text-base tracking-wide rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {savingRelated ? 'Saving...' : `Save Links (${relatedSelected.length})`}
              </button>
              <button onClick={() => setRelatedModal(null)} className="flex-1 h-14 flex items-center justify-center bg-gray-100 text-gray-700 font-black text-base tracking-wide rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
AdminProducts.isAdmin = true;
