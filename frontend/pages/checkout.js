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
    return <div className="min-h-[70vh] flex items-center justify-center"><p className="text-brand-400 tracking-widest uppercase">{ui.emptyCart}</p></div>;
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <h1 className="text-4xl font-bold font-[var(--font-family-heading)] text-brand-900 mb-12 uppercase tracking-widest border-b border-brand-200 pb-6">{ui.checkout}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-6">
            <h2 className="text-lg font-semibold tracking-wider uppercase text-brand-900 mb-2">Shipping Information</h2>

            {error && <div className="p-4 bg-red-50 text-red-700 text-sm border border-red-200">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-brand-700 mb-2">{ui.name} *</label>
                <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-brand-700 mb-2">{ui.phone} *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required type="tel" className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-brand-700 mb-2">{ui.email}</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" className="input-field" />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-brand-700 mb-2">{ui.address} *</label>
              <textarea name="address" value={form.address} onChange={handleChange} required rows={3} className="input-field resize-none" />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-brand-700 mb-2">{ui.notes}</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="input-field resize-none" />
            </div>

            <div className="mt-8 border-t border-brand-200 pt-8">
              <h2 className="text-lg font-semibold tracking-wider uppercase text-brand-900 mb-6">Payment Method</h2>
              <div className="border border-brand-900 p-6 bg-brand-50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold tracking-wide uppercase text-brand-900">{ui.cashOnDelivery}</p>
                  <p className="text-xs text-brand-500 mt-1">Pay when you receive your order</p>
                </div>
                <div className="w-5 h-5 rounded-full border-4 border-brand-900 flex-shrink-0" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-8 !py-5 text-base">
              {loading ? 'Processing...' : ui.placeOrder}
            </button>
          </form>

          {/* Order Summary sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-brand-50 p-8 lg:sticky lg:top-24 border border-brand-200">
              <h3 className="font-semibold text-brand-900 text-sm tracking-wider uppercase mb-8 border-b border-brand-200 pb-4">Order Summary</h3>

              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-brand-700 pr-4 leading-relaxed">{item.productNameSnapshot} <span className="text-brand-400">×{item.qty}</span></span>
                    <span className="font-medium text-brand-900 flex-shrink-0">{item.priceSnapshot * item.qty} EGP</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-200 pt-6">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-brand-900 uppercase tracking-widest text-sm self-end pb-0.5">{ui.total}</span>
                  <span className="text-brand-900">{total} EGP</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
