import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { AdminNav } from './dashboard';
import { adminGetMe, fetchPage, adminUpdatePage } from '@/lib/api';

const BANNER_SLUGS = [
  { slug: 'home-hero-1', titleKey: 'heroPrimaryImage', fallback: '/images/photo_2026-03-08_15-18-52.jpg' },
  { slug: 'home-hero-2', titleKey: 'heroSecondaryImage', fallback: '/images/photo_2026-03-08_15-18-47.jpg' },
  { slug: 'home-about', titleKey: 'aboutPreviewImage', fallback: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80' },
];

function BannerCard({ slug, title, fallback, ui }) {
  const [currentImage, setCurrentImage] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchPage(slug)
      .then((r) => setCurrentImage(r.data.images?.[0] || ''))
      .catch(() => setCurrentImage(''));
  }, [slug]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setMsg({ text: '', type: '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!file) { setMsg({ text: ui.uploadHint, type: 'info' }); return; }
    setSaving(true); setMsg({ text: '', type: '' });
    try {
      const fd = new FormData();
      fd.append('images', file);
      const r = await adminUpdatePage(slug, fd);
      setCurrentImage(r.data.images?.[0] || '');
      setFile(null);
      setPreviewUrl('');
      setMsg({ text: ui.savedOk, type: 'success' });
    } catch { setMsg({ text: ui.errorSaving, type: 'error' }); } finally { setSaving(false); }
  };

  const displayImage = previewUrl || currentImage || fallback;

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      <h3 className="text-sm font-black text-gray-800">{title}</h3>
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
        {displayImage ? (
          <img src={displayImage} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">No image</div>
        )}
        {!currentImage && !previewUrl && (
          <span className="absolute top-2 left-2 text-[10px] font-black bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">default</span>
        )}
      </div>
      <input type="file" accept="image/*" onChange={handleFile}
        className="text-xs text-gray-600 font-bold file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:bg-pink-50 file:text-pink-700 file:font-black cursor-pointer" />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving || !file}
          className="h-10 px-5 bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-sm rounded-xl shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
          {saving ? '...' : ui.replaceImage}
        </button>
        {msg.text && <span className={`text-xs font-black ${msg.type === 'error' ? 'text-red-500' : msg.type === 'info' ? 'text-gray-500' : 'text-green-600'}`}>{msg.text}</span>}
      </div>
    </form>
  );
}

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
    try { const fd = new FormData(); Object.keys(form).forEach((k) => fd.append(k, form[k])); await adminUpdatePage('about', fd); setMsg(ui.savedSuccessfullyOk); }
    catch { setMsg(ui.errorSaving); } finally { setSaving(false); }
  };
  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  return (
    <div className="min-h-screen bg-pink-50/40">
      <AdminNav ui={ui} active="pages" onLogout={handleLogout} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-10">

        {/* Homepage Banners */}
        <section>
          <h1 className="text-2xl font-black text-gray-900 mb-2">{ui.homeBanners}</h1>
          <p className="text-sm font-bold text-gray-500 mb-6">{ui.uploadHint}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {BANNER_SLUGS.map((b) => (
              <BannerCard key={b.slug} slug={b.slug} title={ui[b.titleKey]} fallback={b.fallback} ui={ui} />
            ))}
          </div>
        </section>

        {/* About Page */}
        <section>
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
        </section>

      </div>
    </div>
  );
}
AdminPages.isAdmin = true;
