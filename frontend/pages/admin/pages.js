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
    <div className="min-h-screen bg-brand-background">
      <AdminNav ui={ui} active="pages" onLogout={handleLogout} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-xl font-heading font-bold text-brand-text mb-6">{ui.editAbout}</h1>
        {loading ? <div className="text-center py-10"><div className="w-8 h-8 border-3 border-brand-200 border-t-brand-primary rounded-full animate-spin mx-auto" /></div> : (
          <form onSubmit={handleSave} className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="block text-xs font-bold text-brand-700 mb-1.5 pl-1">Title (EN)</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-brand-100 focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white" /></div>
              <div><label className="block text-xs font-bold text-brand-700 mb-1.5 pl-1">Title (AR)</label><input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} className="w-full h-[44px] px-4 rounded-xl border-2 border-brand-100 focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white" dir="rtl" /></div>
            </div>
            <div><label className="block text-xs font-bold text-brand-700 mb-1.5 pl-1">Content (EN)</label><textarea value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} rows={6} className="w-full p-4 rounded-xl border-2 border-brand-100 focus:border-brand-primary outline-none text-brand-text font-body transition-colors resize-none bg-white" /></div>
            <div><label className="block text-xs font-bold text-brand-700 mb-1.5 pl-1">Content (AR)</label><textarea value={form.contentAr} onChange={(e) => setForm({ ...form, contentAr: e.target.value })} rows={6} className="w-full p-4 rounded-xl border-2 border-brand-100 focus:border-brand-primary outline-none text-brand-text font-body transition-colors resize-none bg-white" dir="rtl" /></div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="h-11 px-8 flex items-center justify-center bg-brand-primary text-white font-bold text-sm rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {saving ? '...' : ui.save}
              </button>
              {msg && <span className="text-sm text-green-600 font-bold">{msg}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
AdminPages.isAdmin = true;
