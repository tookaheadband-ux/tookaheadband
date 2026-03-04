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
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50">
      <div className="card !rounded-2xl p-8 sm:p-10 w-full max-w-sm animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold font-[var(--font-family-heading)] text-neutral-900 mb-1">{ui.adminLogin}</h1>
          <p className="text-xs text-neutral-400">TOKA Admin Panel</p>
        </div>
        {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-200 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1.5">{ui.username}</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-600 mb-1.5">{ui.password}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">{loading ? 'Loading...' : ui.login}</button>
        </form>
      </div>
    </div>
  );
}
AdminLogin.isAdmin = true;
