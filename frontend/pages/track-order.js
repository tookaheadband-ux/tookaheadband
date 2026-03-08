import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { trackOrder } from '@/lib/api';
import { PackageSearch, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';

const STATUS_STEPS = ['pending', 'shipped', 'delivered'];

const STATUS_CONFIG = {
  pending:   { label: 'Order Placed',  icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  shipped:   { label: 'Shipped',       icon: Truck,        color: 'text-blue-500',   bg: 'bg-blue-50',   border: 'border-blue-200'  },
  delivered: { label: 'Delivered',     icon: CheckCircle,  color: 'text-green-500',  bg: 'bg-green-50',  border: 'border-green-200' },
  canceled:  { label: 'Canceled',      icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50',    border: 'border-red-200'   },
};

export default function TrackOrder() {
  const [form, setForm] = useState({ orderId: '', phone: '' });
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);
    try {
      const res = await trackOrder(form.orderId.trim(), form.phone.trim());
      setOrder(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Order not found. Please check your Order ID and phone number.');
    } finally {
      setLoading(false);
    }
  };

  const statusCfg = order ? STATUS_CONFIG[order.status] || STATUS_CONFIG.pending : null;
  const currentStep = STATUS_STEPS.indexOf(order?.status);

  return (
    <>
      <Head>
        <title>Track Your Order — TOOKA</title>
        <meta name="description" content="Track your TOOKA order status" />
      </Head>

      <div className="bg-brand-background min-h-screen pt-28 pb-20">
        <div className="max-w-xl mx-auto px-4">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/20 rounded-2xl mb-4">
              <PackageSearch className="text-brand-text" size={28} />
            </div>
            <h1 className="text-3xl font-black font-heading text-brand-text uppercase tracking-wider mb-2">Track Your Order</h1>
            <p className="text-sm text-gray-500 font-body">Enter your Order ID and phone number to check your order status</p>
          </div>

          {/* Form */}
          <form onSubmit={handleTrack} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Order ID</label>
                <input
                  type="text"
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                  placeholder="e.g. 64f3a2b1c9e77..."
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-primary outline-none text-gray-900 font-bold text-sm transition-colors"
                />
                <p className="text-[11px] text-gray-400 font-bold mt-1">You can find this in your order confirmation email</p>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 01012345678"
                  required
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-primary outline-none text-gray-900 font-bold text-sm transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600 font-bold">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-5 h-12 bg-brand-primary text-brand-text font-black text-sm rounded-xl hover:-translate-y-0.5 hover:shadow-md transition-all disabled:opacity-60 disabled:translate-y-0"
            >
              {loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {/* Order Result */}
          {order && statusCfg && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">

              {/* Status Badge */}
              <div className={`flex items-center gap-3 p-4 rounded-2xl border ${statusCfg.bg} ${statusCfg.border}`}>
                <statusCfg.icon className={statusCfg.color} size={24} />
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Current Status</p>
                  <p className={`text-lg font-black ${statusCfg.color}`}>{statusCfg.label}</p>
                </div>
              </div>

              {/* Timeline (only for non-canceled) */}
              {order.status !== 'canceled' && (
                <div className="flex items-center gap-0">
                  {STATUS_STEPS.map((step, idx) => {
                    const cfg = STATUS_CONFIG[step];
                    const done = idx <= currentStep;
                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${done ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-200'}`}>
                            {done
                              ? <CheckCircle size={16} className="text-white" />
                              : <div className="w-2 h-2 rounded-full bg-gray-300" />
                            }
                          </div>
                          <p className={`text-[10px] font-black mt-1 text-center whitespace-nowrap ${done ? 'text-gray-900' : 'text-gray-400'}`}>{cfg.label}</p>
                        </div>
                        {idx < STATUS_STEPS.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1 mb-4 ${idx < currentStep ? 'bg-brand-primary' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order Info */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Order ID</span>
                  <span className="font-black text-gray-900 text-xs truncate ml-4">{order._id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Customer</span>
                  <span className="font-black text-gray-900">{order.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Date</span>
                  <span className="font-black text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-black text-gray-700 uppercase tracking-wider mb-3">Items</p>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      {item.imageSnapshot && (
                        <img src={item.imageSnapshot} alt={item.productNameSnapshot} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" loading="lazy" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{item.productNameSnapshot}</p>
                        <p className="text-xs text-gray-500 font-bold">Qty: {item.qty} × {item.priceSnapshot} EGP</p>
                      </div>
                      <p className="text-sm font-black text-gray-900 flex-shrink-0">{item.qty * item.priceSnapshot} EGP</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-bold">Subtotal</span>
                  <span className="font-bold text-gray-900">{order.subtotal} EGP</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600 font-bold">Discount {order.couponCode && `(${order.couponCode})`}</span>
                    <span className="font-bold text-green-600">-{order.discount} EGP</span>
                  </div>
                )}
                <div className="flex justify-between text-base pt-1 border-t border-gray-100">
                  <span className="font-black text-gray-900">Total</span>
                  <span className="font-black text-gray-900">{order.total} EGP</span>
                </div>
              </div>

              <Link href="/products" className="block w-full h-11 bg-brand-primary text-brand-text font-black text-sm rounded-xl hover:-translate-y-0.5 transition-all flex items-center justify-center">
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
