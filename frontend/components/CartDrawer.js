import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { ui } = useLang();
  const { items, updateQty, removeItem, total, isOpen, setIsOpen } = useCart();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-text/20 z-50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white/95 backdrop-blur-xl border-l border-white sm:rounded-l-3xl z-50 shadow-2xl flex flex-col"
            dir="ltr"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-100">
              <h2 className="text-xl font-heading font-bold text-brand-text">{ui.yourCart}</h2>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex flex-col items-center justify-center rounded-full bg-brand-50 hover:bg-white text-brand-700 hover:text-brand-primary transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-4 text-brand-primary">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-body font-medium">{ui.emptyCart}</p>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.productId}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 bg-white p-3 border border-brand-50 rounded-2xl shadow-sm"
                    >
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-brand-50 flex-shrink-0 shadow-inner">
                        {item.imageSnapshot ? (
                          <Image src={item.imageSnapshot} alt="" fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="w-full h-full bg-brand-50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                        <div>
                          <p className="font-heading font-bold text-brand-text truncate pr-6">{item.productNameSnapshot}</p>
                          <p className="text-sm font-body font-black text-gray-700 mt-1 uppercase tracking-wide">{item.priceSnapshot} {ui.egp}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQty(item.productId, item.qty - 1)}
                            className="w-7 h-7 rounded-sm bg-brand-50 text-brand-900 flex items-center justify-center hover:bg-brand-100 transition-colors shadow-sm">-</button>
                          <span className="text-sm font-bold w-6 text-center text-brand-900">{item.qty}</span>
                          <button onClick={() => updateQty(item.productId, item.qty + 1)}
                            className="w-7 h-7 rounded-sm bg-brand-50 text-brand-900 flex items-center justify-center hover:bg-brand-100 transition-colors shadow-sm">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="text-gray-400 hover:text-red-500 transition-colors self-start p-1 mt-1 -mr-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-6 border-t border-brand-100/50 bg-white/50 space-y-4 sm:rounded-bl-3xl">
                <div className="flex items-center justify-between mb-2 border-b border-brand-100 pb-4">
                  <span className="text-sm font-body font-bold text-brand-700 uppercase tracking-widest">{ui.total}</span>
                  <span className="text-xl font-heading font-black text-gray-900">{total} <span className="text-sm tracking-widest text-gray-600 font-black uppercase">{ui.egp}</span></span>
                </div>
                <a href="/checkout" onClick={() => setIsOpen(false)} className="w-full h-[56px] flex items-center justify-center bg-brand-primary text-white font-bold text-base md:text-lg tracking-wide rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1 transition-all duration-300">
                  {ui.proceedToCheckout}
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
