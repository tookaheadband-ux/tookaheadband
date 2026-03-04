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
    try { const fd = new FormData(); Object.keys(form).forEach((k) => fd.append(k, form[k])); await adminUpdatePage('about', fd); setMsg('Saved successfully'); }
    catch { setMsg('Error saving'); } finally { setSaving(false); }
  };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav ui={ui} active="pages" onLogout={handleLogout} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h1 className="text-xl font-bold text-neutral-900 mb-6">{ui.editAbout}</h1>
        {loading ? <div className="text-center py-10"><div className="w-6 h-6 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto" /></div> : (
          <form onSubmit={handleSave} className="card !rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-neutral-600 mb-1.5">Title (EN)</label><input value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-neutral-600 mb-1.5">Title (AR)</label><input value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} className="input-field" dir="rtl" /></div>
            </div>
            <div><label className="block text-sm font-medium text-neutral-600 mb-1.5">Content (EN)</label><textarea value={form.contentEn} onChange={(e) => setForm({ ...form, contentEn: e.target.value })} rows={6} className="input-field resize-none" /></div>
            <div><label className="block text-sm font-medium text-neutral-600 mb-1.5">Content (AR)</label><textarea value={form.contentAr} onChange={(e) => setForm({ ...form, contentAr: e.target.value })} rows={6} className="input-field resize-none" dir="rtl" /></div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? '...' : ui.save}</button>
              {msg && <span className="text-sm text-green-600">{msg}</span>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
AdminPages.isAdmin = true;
