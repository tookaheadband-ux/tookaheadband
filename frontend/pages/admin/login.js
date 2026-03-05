import { useState } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { adminLogin } from '@/lib/api';

export default function AdminLogin() {
  const { ui } = useLang();
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(form);
      localStorage.setItem('toka-admin-token', res.data.token);
      router.push('/admin/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-brand-background relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-brand-primary/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 -right-40 w-[400px] h-[400px] bg-brand-300/15 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 sm:p-10 w-full max-w-sm border border-white shadow-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-primary rounded-2xl flex items-center justify-center text-white text-xl font-black mx-auto mb-4 shadow-[0_4px_14px_0_rgba(255,199,209,0.5)]">T</div>
          <h1 className="text-xl font-heading font-bold text-brand-text mb-1">{ui.adminLogin}</h1>
          <p className="text-xs text-brand-400 font-body font-medium">TOOKA Admin Panel</p>
        </div>
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-200 mb-4 font-body">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.username}</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full h-[48px] px-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm" required />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.password}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-[48px] px-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-[52px] flex items-center justify-center bg-brand-primary text-white font-bold text-base tracking-wide rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
            {loading ? 'Loading...' : ui.login}
          </button>
        </form>
      </div>
    </div>
  );
}
AdminLogin.isAdmin = true;
