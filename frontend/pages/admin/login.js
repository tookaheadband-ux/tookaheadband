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
    <div className="min-h-screen flex items-center justify-center px-4 bg-pink-50/40 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-pink-200/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 -right-40 w-[400px] h-[400px] bg-rose-200/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-sm border border-gray-100 shadow-lg relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-lg shadow-pink-200">T</div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">{ui.adminLogin}</h1>
          <p className="text-sm font-bold text-gray-400">TOOKA Admin Panel</p>
        </div>
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-200 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">{ui.username}</label>
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full h-[50px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold text-base transition-colors bg-gray-50" required />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2">{ui.password}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full h-[50px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold text-base transition-colors bg-gray-50" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-[52px] flex items-center justify-center bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-base tracking-wide rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
            {loading ? 'Loading...' : ui.login}
          </button>
        </form>
      </div>
    </div>
  );
}
AdminLogin.isAdmin = true;
