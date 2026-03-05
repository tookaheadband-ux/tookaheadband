import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const { ui } = useLang();
  const { items, updateQty, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 bg-brand-background">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm text-brand-primary">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h1 className="text-3xl font-heading font-bold text-brand-text mb-2 tracking-wide">{ui.emptyCart}</h1>
        <p className="text-brand-700 font-body mb-8">Looks like you haven't added anything yet.</p>
        <Link href="/products" className="h-[48px] px-8 flex items-center justify-center bg-brand-primary text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:-translate-y-1 transition-all">{ui.continueShopping}</Link>
      </div>
    );
  }

  return (
    <div className="bg-brand-background min-h-screen pt-28 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-brand-text mb-8 md:mb-12">{ui.yourCart}</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  className="flex gap-4 sm:gap-6 items-center sm:items-start bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-white"
                >
                  <div className="relative w-20 h-24 sm:w-28 sm:h-32 bg-brand-50 flex-shrink-0 rounded-2xl overflow-hidden shadow-inner">
                    {item.imageSnapshot ? <img src={item.imageSnapshot} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">TOOKA</div>}
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-full min-h-[6rem] sm:min-h-[8rem]">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-heading font-bold text-brand-text text-sm sm:text-lg mb-1 line-clamp-2">{item.productNameSnapshot}</h3>
                        <p className="text-gray-700 font-body font-semibold text-xs sm:text-sm">{item.priceSnapshot} <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-600 font-bold ml-1">{ui.egp}</span></p>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors flex-shrink-0" title="Remove Item">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Pill */}
                      <div className="flex items-center bg-brand-50 border border-brand-100 rounded-full px-1.5 py-1">
                        <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-brand-900 text-lg hover:bg-white rounded-full transition-colors shadow-sm">-</button>
                        <span className="w-8 flex items-center justify-center text-xs sm:text-sm font-bold text-brand-900">{item.qty}</span>
                        <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-brand-900 text-lg hover:bg-white rounded-full transition-colors shadow-sm">+</button>
                      </div>

                      <p className="font-heading font-bold text-base sm:text-lg text-gray-900">{item.priceSnapshot * item.qty} <span className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-600 font-bold">{ui.egp}</span></p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Sticky Summary */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="lg:sticky lg:top-32 bg-white/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-white shadow-sm">
              <h2 className="text-xl font-heading font-bold text-brand-text mb-6">Order Summary</h2>

              <div className="flex justify-between items-center mb-6 pb-6 border-b border-brand-200/60">
                <span className="text-brand-700 font-body font-medium">{ui.total}</span>
                <span className="text-2xl font-heading font-bold text-gray-900">{total} <span className="text-sm uppercase tracking-wider text-gray-600">{ui.egp}</span></span>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/checkout" className="w-full h-[56px] flex items-center justify-center bg-brand-primary text-white font-bold text-base md:text-lg tracking-wide rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1 transition-all duration-300">{ui.proceedToCheckout}</Link>
                <Link href="/products" className="w-full h-[56px] flex items-center justify-center bg-white border-2 border-brand-100 text-brand-700 font-bold text-base tracking-wide rounded-xl hover:bg-brand-50 transition-all duration-300">{ui.continueShopping}</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
