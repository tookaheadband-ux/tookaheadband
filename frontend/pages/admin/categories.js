import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
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
    <div className="min-h-screen bg-brand-background">
      <AdminNav ui={ui} active="categories" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-heading font-bold text-brand-text">{ui.manageCategories}</h1>
          <button onClick={openCreate}
            className="h-10 px-5 bg-brand-primary text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:-translate-y-0.5 transition-all">
            + {ui.addCategory}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-shadow">
              {cat.coverImage && (
                <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3 bg-brand-50">
                  <Image src={cat.coverImage} alt="" fill className="object-cover" sizes="300px" />
                </div>
              )}
              <h3 className="font-heading font-bold text-brand-text text-base mb-1">{t(cat.nameAr, cat.nameEn)}</h3>
              <p className="text-xs text-brand-400 font-body font-bold mb-4">/{cat.slug}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="h-8 px-4 rounded-lg bg-blue-50 text-blue-500 text-xs font-bold hover:bg-blue-100 transition-colors">{ui.edit}</button>
                <button onClick={() => handleDelete(cat._id)} className="h-8 px-4 rounded-lg bg-red-50 text-red-400 text-xs font-bold hover:bg-red-100 transition-colors">{ui.delete}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brand-text/20 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md border border-white shadow-xl">
            <h2 className="text-lg font-heading font-bold text-brand-text mb-5">{editCat ? ui.edit : ui.create} Category</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-xs font-bold text-brand-700 mb-1.5 pl-1">Name (EN)</label><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-brand-100 focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white" /></div>
              <div><label className="block text-xs font-bold text-brand-700 mb-1.5 pl-1">Name (AR)</label><input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-brand-100 focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white" dir="rtl" /></div>
              <div><label className="block text-xs font-bold text-brand-700 mb-1.5 pl-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-brand-100 focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white" required /></div>
              <div><label className="block text-xs font-bold text-brand-700 mb-1.5 pl-1">Cover Image</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-brand-500 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-brand-50 file:text-brand-700 file:font-bold cursor-pointer" /></div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 h-11 flex items-center justify-center bg-brand-primary text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {saving ? '...' : ui.save}
                </button>
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 h-11 flex items-center justify-center bg-brand-50 text-brand-700 font-bold text-sm rounded-xl hover:bg-brand-100 transition-colors">
                  {ui.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
AdminCategories.isAdmin = true;
