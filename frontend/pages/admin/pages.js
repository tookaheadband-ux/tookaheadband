import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { AdminNav } from './dashboard';
import { adminGetMe, fetchPage, adminUpdatePage } from '@/lib/api';

export default function AdminPages() {
  const { ui } = useLang();
  const router = useRouter();
  const [form, setForm] = useState({ titleAr: '', titleEn: '', contentAr: '', contentEn: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    adminGetMe().catch(() => router.push('/admin/login'));
    fetchPage('about').then((r) => setForm({ titleAr: r.data.titleAr || '', titleEn: r.data.titleEn || '', contentAr: r.data.contentAr || '', contentEn: r.data.contentEn || '' }))
      .catch(console.error).finally(() => setLoading(false));
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setMsg('');
    try { const fd = new FormData(); Object.keys(form).forEach((k) => fd.append(k, form[k])); await adminUpdatePage('about', fd); setMsg('Saved successfully ✅'); }
    catch { setMsg('Error saving'); } finally { setSaving(false); }
  };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-pink-50/40">
      <AdminNav ui={ui} active="pages" onLogout={handleLogout} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-2xl font-black text-gray-900 mb-6">{ui.editAbout}</h1>
        {loading ? <div className="text-center py-10"><div className="w-8 h-8 border-3 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto" /></div> : (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="block text-sm font-black text-gray-700 mb-2">Title (EN)</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" /></div>
              <div><label className="block text-sm font-black text-gray-700 mb-2">Title (AR)</label><input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors bg-gray-50" dir="rtl" /></div>
            </div>
            <div><label className="block text-sm font-black text-gray-700 mb-2">Content (EN)</label><textarea value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} rows={6} className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors resize-none bg-gray-50" /></div>
            <div><label className="block text-sm font-black text-gray-700 mb-2">Content (AR)</label><textarea value={form.contentAr} onChange={(e) => setForm({ ...form, contentAr: e.target.value })} rows={6} className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold transition-colors resize-none bg-gray-50" dir="rtl" /></div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="h-12 px-10 flex items-center justify-center bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-lg shadow-pink-200 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {saving ? '...' : ui.save}
              </button>
              {msg && <span className="text-sm text-green-600 font-black">{msg}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
AdminPages.isAdmin = true;
