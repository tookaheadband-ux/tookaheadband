import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { createOrder, validateCoupon, fetchShippingZones } from '@/lib/api';
import { useFeatureFlags } from '@/context/FeatureFlagContext';

export default function Checkout() {
  const { ui } = useLang();
  const { items, total, clearCart } = useCart();
  const { isEnabled, getFlag } = useFeatureFlags();
  const [giftWrap, setGiftWrap] = useState(false);
  const giftWrapPrice = isEnabled('feature_gift_wrap') ? (getFlag('gift_wrap_price') || 20) : 0;
  const giftWrapCost = giftWrap ? giftWrapPrice : 0;
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', address: '', email: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingZones, setShippingZones] = useState([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    fetchShippingZones().then((r) => setShippingZones(r.data)).catch(() => {});
  }, []);

  const currentZone = shippingZones.find((z) => z.governorate === selectedGovernorate);
  const areas = currentZone ? currentZone.areas : [];

  const handleGovernorateChange = (gov) => {
    setSelectedGovernorate(gov);
    setSelectedArea('');
    setShippingCost(0);
  };

  const handleAreaChange = (areaName) => {
    setSelectedArea(areaName);
    const zone = shippingZones.find((z) => z.governorate === selectedGovernorate);
    if (zone) {
      const areaDoc = zone.areas.find((a) => a.name === areaName);
      setShippingCost(areaDoc ? areaDoc.cost : 0);
    }
  };
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true); setCouponError(''); setCouponResult(null);
    try {
      const res = await validateCoupon({ code: couponCode, orderTotal: total });
      setCouponResult(res.data);
    } catch (err) {
      setCouponError(err.response?.data?.message || ui.invalidCoupon);
    } finally { setApplyingCoupon(false); }
  };

  const discountAmount = couponResult ? couponResult.discount : 0;
  const finalTotal = Math.max(0, total - discountAmount) + shippingCost + giftWrapCost;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.address || !selectedGovernorate || !selectedArea) { setError(ui.fillRequired); return; }
    if (items.length === 0) { setError(ui.cartEmpty); return; }
    setLoading(true);
    try {
      const orderRes = await createOrder({ ...form, governorate: selectedGovernorate, area: selectedArea, giftWrap, couponCode: couponResult ? couponResult.code : '', items: items.map((i) => ({ productId: i.productId, qty: i.qty })) });
      clearCart();
      router.push(`/order-success?orderId=${orderRes.data._id}`);
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  if (items.length === 0) {
    return <div className="min-h-[70vh] flex items-center justify-center"><p className="text-gray-500 tracking-widest uppercase">{ui.emptyCart}</p></div>;
  }

  return (
    <>
    <Head><title>{ui.checkout || 'Checkout'} — TOOKA</title></Head>
    <div className="bg-brand-background min-h-screen pt-28 pb-32">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-brand-text mb-8 md:mb-12 tracking-wide">{ui.checkout}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-5">
            <h2 className="text-lg font-heading font-bold text-brand-text mb-2">{ui.shippingInfo}</h2>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.governorate || 'Governorate'} *</label>
                <select value={selectedGovernorate} onChange={(e) => handleGovernorateChange(e.target.value)} required
                  className="w-full h-[48px] px-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm">
                  <option value="">{ui.selectGovernorate || 'Select Governorate'}</option>
                  {shippingZones.map((z) => (
                    <option key={z._id} value={z.governorate}>{z.governorate}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.area || 'Area'} *</label>
                <select value={selectedArea} onChange={(e) => handleAreaChange(e.target.value)} required disabled={!selectedGovernorate}
                  className="w-full h-[48px] px-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm disabled:opacity-50">
                  <option value="">{ui.selectArea || 'Select Area'}</option>
                  {areas.map((a) => (
                    <option key={a._id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.address} *</label>
              <textarea name="address" value={form.address} onChange={handleChange} required rows={3} placeholder={ui.addressDetails || 'Street, building, floor...'} className="w-full p-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm resize-none" />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-brand-700 mb-2 pl-1">{ui.notes}</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className="w-full p-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm resize-none" />
            </div>

            {isEnabled('feature_gift_wrap') && (
              <label className="flex items-center gap-3 p-4 border-2 border-brand-primary/20 rounded-xl bg-pink-50/50 cursor-pointer hover:bg-pink-50 transition-colors">
                <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)}
                  className="rounded border-brand-primary/30 text-brand-primary focus:ring-brand-primary w-5 h-5" />
                <div>
                  <span className="text-sm font-bold text-brand-text">{ui.giftWrapping} 🎁 (+{giftWrapPrice} {ui.egp})</span>
                  <p className="text-xs text-brand-700 mt-0.5">{ui.giftWrapDesc}</p>
                </div>
              </label>
            )}

            <div className="mt-8 border-t border-brand-200/60 pt-8">
              <h2 className="text-lg font-heading font-bold text-brand-text mb-6">{ui.paymentMethod}</h2>
              <div className="border-2 border-brand-primary p-6 bg-brand-50/50 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-bold tracking-wide uppercase text-brand-900">{ui.cashOnDelivery}</p>
                  <p className="text-xs text-brand-500 font-medium mt-1">{ui.payWhenReceive}</p>
                </div>
                <div className="w-6 h-6 rounded-full border-[6px] border-brand-primary flex-shrink-0" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full h-[56px] mt-8 flex items-center justify-center bg-brand-primary text-white font-bold text-base md:text-lg tracking-wide rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
              {loading ? ui.processing : ui.placeOrder}
            </button>
          </form>

          {/* Order Summary sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white shadow-sm lg:sticky lg:top-32">
              <h3 className="text-xl font-heading font-bold text-brand-text mb-6">{ui.orderSummary}</h3>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-body font-medium pr-4 leading-relaxed line-clamp-1">{item.productNameSnapshot} <span className="text-gray-500 font-bold ml-1">×{item.qty}</span></span>
                    <span className="font-heading font-bold text-brand-900 flex-shrink-0">{item.priceSnapshot * item.qty} {ui.egp}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-200/60 pt-6">
                {/* Coupon Input */}
                <div className="mb-4">
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-600 mb-2">🏷️ {ui.couponCode}</label>
                  <div className="flex gap-2">
                    <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="e.g. TOOKA20"
                      className="flex-1 h-10 px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-gray-900 font-black tracking-wider text-sm bg-gray-50 uppercase" />
                    <button type="button" onClick={handleApplyCoupon} disabled={applyingCoupon}
                      className="h-10 px-5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                      {applyingCoupon ? '...' : ui.apply}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 font-bold mt-1">{couponError}</p>}
                  {couponResult && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-xs text-green-700 font-black">✅ {couponResult.code} applied! -{couponResult.discount} EGP</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-gray-500 font-bold">{ui.subtotal}</span>
                  <span className="text-gray-500 font-bold">{total} {ui.egp}</span>
                </div>
                {couponResult && (
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-green-600 font-bold">{ui.discount}</span>
                    <span className="text-green-600 font-bold">-{couponResult.discount} {ui.egp}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-gray-500 font-bold">{ui.shipping}</span>
                  <span className="text-gray-500 font-bold">{shippingCost > 0 ? `${shippingCost} ${ui.egp}` : (selectedArea ? (ui.free) : '—')}</span>
                </div>
                {giftWrap && (
                  <div className="flex justify-between items-center text-sm mb-3">
                    <span className="text-pink-500 font-bold">🎁 {ui.giftWrapping}</span>
                    <span className="text-pink-500 font-bold">{giftWrapCost} {ui.egp}</span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold text-lg border-t border-brand-200/60 pt-3">
                  <span className="text-brand-700 uppercase tracking-widest text-sm font-body">{ui.total}</span>
                  <span className="text-2xl font-heading font-bold text-gray-900">{finalTotal} <span className="text-sm tracking-wider text-gray-600">{ui.egp}</span></span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
}
