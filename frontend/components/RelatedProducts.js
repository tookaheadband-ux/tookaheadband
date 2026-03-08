import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LanguageContext';
import { ShoppingBag } from 'lucide-react';

export default function RelatedProducts({ products }) {
  const { addItem } = useCart();
  const { t, ui } = useLang();

  if (!products || products.length === 0) return null;

  return (
    <div className="border-t border-brand-100 pt-12 pb-4">
      <div className="max-w-screen-xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider">You Might Also Like</h2>
          <Link href="/products" className="text-sm font-bold text-brand-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x snap-mandatory">
          {products.map((product) => {
            const name = t(product.nameAr, product.nameEn);
            const image = product.images?.[0] || 'https://placehold.co/400x500/F7F5F2/2C2621?text=TOOKA';
            const inStock = product.stock > 0;

            return (
              <div
                key={product._id}
                className="flex-shrink-0 w-[200px] sm:w-[220px] snap-start group"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white shadow-sm mb-3">
                  <Link href={`/products/${product._id}`}>
                    <img
                      src={image}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  {!inStock && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs font-black text-red-700 uppercase tracking-widest">{ui.outOfStock}</span>
                    </div>
                  )}
                </div>

                <Link href={`/products/${product._id}`} className="block mb-2">
                  <p className="text-sm font-bold text-gray-900 truncate group-hover:text-brand-primary transition-colors">{name}</p>
                  <p className="text-sm font-black text-gray-700 mt-0.5">
                    {product.price} <span className="text-xs text-gray-500 font-bold">{ui.egp}</span>
                  </p>
                </Link>

                <button
                  onClick={() => addItem(product)}
                  disabled={!inStock}
                  className="w-full h-9 flex items-center justify-center gap-1.5 bg-brand-primary text-brand-text font-bold text-xs rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={13} />
                  {ui.addToCart}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
