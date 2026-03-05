import { useState } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/lib/api';

export default function Checkout() {
  const { ui } = useLang();
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.address) { setError('Please fill in all required fields'); return; }
    if (items.length === 0) { setError('Cart is empty'); return; }
    setLoading(true);
    try {
      await createOrder({ ...form, items: items.map((i) => ({ productId: i.productId, qty: i.qty })) });
      clearCart();
      router.push('/order-success');
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  if (items.length === 0) {
    return <div className="min-h-[70vh] flex items-center justify-center"><p className="text-gray-500 tracking-widest uppercase">{ui.emptyCart}</p></div>;
  }

  return (
    <div className="bg-brand-background min-h-screen pt-28 pb-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-brand-text mb-8 md:mb-12 tracking-wide">{ui.checkout}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-5">
            <h2 className="text-lg font-heading font-bold text-brand-text mb-2">Shipping Information</h2>

            {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 font-body">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.name} *</label>
                <input name="name" value={form.name} onChange={handleChange} required className="w-full h-[48px] px-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.phone} *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required type="tel" className="w-full h-[48px] px-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.email}</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" className="w-full h-[48px] px-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.address} *</label>
              <textarea name="address" value={form.address} onChange={handleChange} required rows={3} className="w-full p-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm resize-none" />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.notes}</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full p-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm resize-none" />
            </div>

            <div className="mt-8 border-t border-brand-200/60 pt-8">
              <h2 className="text-lg font-heading font-bold text-brand-text mb-6">Payment Method</h2>
              <div className="border-2 border-brand-primary p-6 bg-brand-50/50 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-bold tracking-wide uppercase text-brand-900">{ui.cashOnDelivery}</p>
                  <p className="text-xs text-brand-500 font-medium mt-1">Pay when you receive your order</p>
                </div>
                <div className="w-6 h-6 rounded-full border-[6px] border-brand-primary flex-shrink-0" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-[56px] mt-8 flex items-center justify-center bg-brand-primary text-white font-bold text-base md:text-lg tracking-wide rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : ui.placeOrder}
            </button>
          </form>

          {/* Order Summary sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white shadow-sm lg:sticky lg:top-32">
              <h3 className="text-xl font-heading font-bold text-brand-text mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-body font-medium pr-4 leading-relaxed line-clamp-1">{item.productNameSnapshot} <span className="text-gray-500 font-bold ml-1">×{item.qty}</span></span>
                    <span className="font-heading font-bold text-brand-900 flex-shrink-0">{item.priceSnapshot * item.qty} EGP</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-200/60 pt-6">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="text-brand-700 uppercase tracking-widest text-sm font-body">{ui.total}</span>
                  <span className="text-2xl font-heading font-bold text-gray-900">{total} <span className="text-sm tracking-wider text-gray-600">EGP</span></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
