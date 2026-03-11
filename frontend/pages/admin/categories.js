import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '@/lib/api';

export default function AdminCategories() {
  const { t, ui } = useLang();
  const { toast, confirm } = useToast();
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
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); } finally { setSaving(false); }
  };
  const handleDelete = async (id) => { const ok = await confirm('Are you sure you want to delete this category?'); if (!ok) return; try { await adminDeleteCategory(id); load(); toast.success('Category deleted'); } catch { toast.error('Error deleting category'); } };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-pink-50/40">
      <AdminNav ui={ui} active="categories" onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">{ui.manageCategories}</h1>
          <button onClick={openCreate}
            className="h-11 px-6 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all">
            + {ui.addCategory}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              {cat.coverImage && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 bg-gray-100">
                  <Image src={cat.coverImage} alt="" fill className="object-cover" sizes="300px" />
                </div>
              )}
              <h3 className="font-black text-gray-900 text-lg mb-1">{t(cat.nameAr, cat.nameEn)}</h3>
              <p className="text-sm text-gray-500 font-bold mb-4">/{cat.slug}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="h-9 px-4 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 border border-blue-100 transition-colors">{ui.edit}</button>
                <button onClick={() => handleDelete(cat._id)} className="h-9 px-4 rounded-lg bg-red-50 text-red-500 text-xs font-black hover:bg-red-100 border border-red-100 transition-colors">{ui.delete}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl p-6 w-full max-w-md border border-gray-100 shadow-2xl">
            <h2 className="text-xl font-black text-gray-900 mb-5">{editCat ? ui.edit : ui.create} Category</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="block text-xs font-black text-gray-700 mb-2">Name (EN)</label><input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" /></div>
              <div><label className="block text-xs font-black text-gray-700 mb-2">Name (AR)</label><input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" dir="rtl" /></div>
              <div><label className="block text-xs font-black text-gray-700 mb-2">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" required /></div>
              <div><label className="block text-xs font-black text-gray-700 mb-2">Cover Image</label>
                {editCat?.coverImage && !file && (
                  <div className="mb-2">
                    <img src={editCat.coverImage} alt="" className="w-full h-24 rounded-xl object-cover border-2 border-gray-200" />
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Upload a new image to replace</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm text-gray-600 font-bold file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-pink-50 file:text-pink-600 file:font-black cursor-pointer" /></div>
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
    </div>
  );
}
AdminCategories.isAdmin = true;
