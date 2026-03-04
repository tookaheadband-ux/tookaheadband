import Link from 'next/link';

import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function Cart() {
  const { ui } = useLang();
  const { items, updateQty, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-[var(--font-family-heading)] text-brand-900 mb-6 tracking-wide">{ui.emptyCart}</h1>
        <Link href="/products" className="btn-primary">{ui.continueShopping}</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-28 pb-32">
      <div className="w-full mx-auto px-6 md:px-16 lg:px-24">
        <h1 className="text-4xl font-bold font-[var(--font-family-heading)] text-brand-900 mb-12 uppercase tracking-widest border-b border-brand-200 pb-6">{ui.yourCart}</h1>

        <div className="space-y-8 mb-16">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-6 items-start border-b border-brand-100 pb-8">
              <div className="relative w-24 h-32 md:w-32 md:h-40 bg-brand-50 flex-shrink-0">
                {item.imageSnapshot ? <img src={item.imageSnapshot} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-brand-300">TOKA</div>}
              </div>

              <div className="flex-1 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-brand-900 text-sm md:text-base uppercase tracking-wider mb-2">{item.productNameSnapshot}</h3>
                    <p className="text-sm font-medium text-brand-700">{item.priceSnapshot} <span className="text-xs uppercase text-brand-400">{ui.egp}</span></p>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-xs font-semibold uppercase tracking-widest text-brand-400 hover:text-red-700 transition-colors underline underline-offset-4">{ui.remove}</button>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6">
                  <div className="flex items-center border border-brand-200">
                    <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-10 h-10 flex items-center justify-center text-brand-900 text-lg hover:bg-brand-50 transition-colors">-</button>
                    <span className="w-10 text-center text-sm font-medium text-brand-900">{item.qty}</span>
                    <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-10 h-10 flex items-center justify-center text-brand-900 text-lg hover:bg-brand-50 transition-colors">+</button>
                  </div>
                  <p className="font-semibold text-brand-900">{item.priceSnapshot * item.qty} <span className="text-xs uppercase text-brand-400">{ui.egp}</span></p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-brand-50 p-8 md:p-12">
          <div className="flex justify-between items-end mb-10 border-b border-brand-200 pb-6">
            <span className="text-sm font-semibold uppercase tracking-widest text-brand-700">{ui.total}</span>
            <span className="text-2xl font-semibold text-brand-900">{total} <span className="text-sm font-normal text-brand-700">{ui.egp}</span></span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="btn-secondary w-full text-center">{ui.continueShopping}</Link>
            <Link href="/checkout" className="btn-primary w-full text-center">{ui.proceedToCheckout}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
