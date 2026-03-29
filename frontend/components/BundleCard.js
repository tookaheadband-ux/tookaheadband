import Image from 'next/image';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { Check, Gift } from 'lucide-react';

export default function BundleCard({ bundle }) {
  const { t, ui } = useLang();
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const name = t(bundle.nameAr, bundle.nameEn);
  const desc = t(bundle.descriptionAr, bundle.descriptionEn);
  const originalTotal = bundle.products.reduce((sum, p) => sum + (p.price || 0), 0);
  const savings = originalTotal - bundle.bundlePrice;

  const handleAddBundle = () => {
    // Add each product in the bundle to cart
    bundle.products.forEach((p) => {
      addItem(p);
    });
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 2000);
  };

  return (
    <div className="bg-white rounded-[24px] border border-brand-surface shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Products Grid */}
      <div className="p-4 pb-0">
        <div className="grid grid-cols-3 gap-2">
          {bundle.products.slice(0, 3).map((p) => (
            <div key={p._id} className="aspect-square rounded-2xl overflow-hidden bg-brand-50 relative">
              {p.images?.[0] ? (
                <img src={p.images[0]} alt={t(p.nameAr, p.nameEn)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
              )}
            </div>
          ))}
        </div>
        {bundle.products.length > 3 && (
          <p className="text-xs font-bold text-brand-700 text-center mt-1">+{bundle.products.length - 3} {ui.products}</p>
        )}
      </div>

      {/* Info */}
      <div className="p-4 text-center">
        <h3 className="font-heading font-bold text-brand-text text-lg mb-1">{name}</h3>
        {desc && <p className="text-xs text-brand-700 font-body mb-3 line-clamp-2">{desc}</p>}

        {/* Pricing */}
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-brand-700 text-sm line-through">{originalTotal} {ui.egp}</span>
          <span className="text-2xl font-black text-brand-primary">{bundle.bundlePrice} <span className="text-xs">{ui.egp}</span></span>
        </div>
        {savings > 0 && (
          <span className="inline-block bg-green-50 text-green-700 text-xs font-black px-3 py-1 rounded-full border border-green-200 mb-3">
            {ui.youSave} {savings} {ui.egp}
          </span>
        )}

        <button
          onClick={handleAddBundle}
          disabled={isAdding}
          className={`w-full h-[44px] font-bold text-sm rounded-2xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 ${
            isAdding
              ? 'bg-green-600 text-white'
              : 'bg-brand-primary text-white hover:shadow-md hover:-translate-y-1'
          }`}
        >
          {isAdding ? (
            <span className="flex items-center gap-1.5"><Check size={15} strokeWidth={3} /> Added!</span>
          ) : (
            <span className="flex items-center gap-1.5"><Gift size={15} /> {ui.addToCart}</span>
          )}
        </button>
      </div>
    </div>
  );
}
