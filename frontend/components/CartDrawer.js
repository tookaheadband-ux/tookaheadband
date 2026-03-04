import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { ui } = useLang();
  const { items, updateQty, removeItem, total, isOpen, setIsOpen } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl animate-slide-in flex flex-col" dir="ltr">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">{ui.yourCart}</h2>
          <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 text-neutral-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-sm text-neutral-400">{ui.emptyCart}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                  {item.imageSnapshot ? (
                    <Image src={item.imageSnapshot} alt="" fill className="object-cover" sizes="64px" />
                  ) : (
                    <div className="w-full h-full bg-neutral-100" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">{item.productNameSnapshot}</p>
                  <p className="text-sm text-neutral-500 mt-0.5">{item.priceSnapshot} {ui.egp}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="w-6 h-6 rounded border border-neutral-200 text-neutral-500 flex items-center justify-center text-xs hover:border-neutral-400 transition-colors">-</button>
                    <span className="text-sm font-medium w-5 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="w-6 h-6 rounded border border-neutral-200 text-neutral-500 flex items-center justify-center text-xs hover:border-neutral-400 transition-colors">+</button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-neutral-300 hover:text-red-500 transition-colors self-start mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">{ui.total}</span>
              <span className="text-lg font-semibold text-neutral-900">{total} {ui.egp}</span>
            </div>
            <a href="/checkout" onClick={() => setIsOpen(false)} className="btn-primary block text-center w-full !py-3">
              {ui.proceedToCheckout}
            </a>
          </div>
        )}
      </div>
    </>
  );
}
