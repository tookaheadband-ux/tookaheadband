import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { adminRequestReset, adminConfirmReset } from '@/lib/api';

export default function ResetPassword() {
  const { ui } = useLang();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = request code, 2 = enter code + new password
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await adminRequestReset();
      setMessage(ui.resetCodeSent || 'Reset code sent to Telegram');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await adminConfirmReset({ code, newPassword });
      setMessage(ui.passwordResetSuccess || 'Password reset successfully! Redirecting...');
      setTimeout(() => router.push('/admin/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-pink-50/40 relative overflow-hidden">
      <div className="absolute top-20 -left-40 w-[500px] h-[500px] bg-pink-200/30 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 -right-40 w-[400px] h-[400px] bg-rose-200/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-sm border border-gray-100 shadow-lg relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4 shadow-lg shadow-pink-200">T</div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">{ui.resetPassword || 'Reset Password'}</h1>
          <p className="text-sm font-bold text-gray-400">{ui.resetVia || 'Reset via Telegram'}</p>
        </div>

        {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-200 mb-4">{error}</div>}
        {message && <div className="p-3 rounded-xl bg-green-50 text-green-600 text-sm font-bold border border-green-200 mb-4">{message}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <p className="text-sm text-gray-500 font-bold text-center">
              {ui.resetDescription || 'A 6-digit code will be sent to your Telegram'}
            </p>
            <button type="submit" disabled={loading}
              className="w-full h-[52px] flex items-center justify-center bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-base tracking-wide rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
              {loading ? 'Sending...' : (ui.sendResetCode || 'Send Reset Code')}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{ui.resetCode || 'Reset Code'}</label>
              <input value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="123456" maxLength={6}
                className="w-full h-[50px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold text-center text-2xl tracking-[0.5em] transition-colors bg-gray-50" required />
            </div>
            <div>
              <label className="block text-sm font-black text-gray-700 mb-2">{ui.newPassword || 'New Password'}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-[50px] px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-bold text-base transition-colors bg-gray-50" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-[52px] flex items-center justify-center bg-gradient-to-r from-pink-400 to-rose-500 text-white font-black text-base tracking-wide rounded-xl shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
              {loading ? 'Resetting...' : (ui.confirmReset || 'Reset Password')}
            </button>
            <button type="button" onClick={() => { setStep(1); setError(''); setMessage(''); }}
              className="w-full text-sm font-bold text-gray-400 hover:text-pink-500 transition-colors">
              {ui.resendCode || 'Resend Code'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href="/admin/login" className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
            {ui.backToLogin || 'Back to Login'}
          </Link>
        </div>
      </div>
    </div>
  );
}
ResetPassword.isAdmin = true;
