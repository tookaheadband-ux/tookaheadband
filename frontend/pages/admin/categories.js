import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/lib/api';

export default function AdminCategories() {
  const { t, ui } = useLang();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ nameAr: '', nameEn: '', slug: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);
  const load = () => adminGetCategories().then((r) => setCategories(r.data)).catch(console.error);
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditCat(null); setForm({ nameAr: '', nameEn: '', slug: '' }); setFile(null); setShowModal(true); };
  const openEdit = (c) => { setEditCat(c); setForm({ nameAr: c.nameAr || '', nameEn: c.nameEn || '', slug: c.slug || '' }); setFile(null); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const fd = new FormData(); fd.append('nameAr', form.nameAr); fd.append('nameEn', form.nameEn); fd.append('slug', form.slug);
      if (file) fd.append('coverImage', file);
      editCat ? await adminUpdateCategory(editCat._id, fd) : await adminCreateCategory(fd);
      setShowModal(false); load();
    } catch (err) { alert(err.response?.data?.message || 'Error'); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await adminDeleteCategory(id); load(); } catch { alert('Error'); } };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav ui={ui} active="categories" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-neutral-900">{ui.manageCategories}</h1>
          <button onClick={openCreate} className="btn-primary text-sm">+ {ui.addCategory}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat._id} className="card !rounded-xl p-5">
              <h3 className="font-semibold text-neutral-800 text-sm mb-0.5">{t(cat.nameAr, cat.nameEn)}</h3>
              <p className="text-xs text-neutral-400 mb-4">/{cat.slug}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="btn-secondary text-xs !py-1.5 !px-3">{ui.edit}</button>
                <button onClick={() => handleDelete(cat._id)} className="text-red-400 hover:text-red-600 text-xs font-medium px-3 py-1.5">{ui.delete}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative card !rounded-2xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-base font-bold text-neutral-900 mb-4">{editCat ? ui.edit : ui.create} Category</h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div><label className="block text-xs text-neutral-400 mb-1">Name (EN)</label><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="input-field" /></div>
              <div><label className="block text-xs text-neutral-400 mb-1">Name (AR)</label><input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-field" dir="rtl" /></div>
              <div><label className="block text-xs text-neutral-400 mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-xs text-neutral-400 mb-1">Cover Image</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-neutral-100 file:text-neutral-700" /></div>
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
AdminCategories.isAdmin = true;
