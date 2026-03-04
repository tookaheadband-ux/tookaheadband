import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { t, ui } = useLang();
  const { addItem } = useCart();

  const name = t(product.nameAr, product.nameEn);
  const image = product.images?.[0] || 'https://placehold.co/800x1000/F7F5F2/2C2621?text=TOKA';

  return (
    <div className="group relative flex flex-col h-full bg-transparent">
      <Link href={`/products/${product._id}`} className="block flex-1 group">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[16px] bg-white border border-brand-200 shadow-sm mb-4 cursor-pointer">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {product.isFeatured && (
            <span className="absolute top-4 left-4 badge badge-brand">Featured</span>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center">
              <span className="badge badge-red">{ui.outOfStock}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 items-center text-center px-2">
          <h3 className="font-heading font-bold text-brand-text text-base tracking-wide line-clamp-1 transition-colors group-hover:text-brand-primary">
            {name}
          </h3>
          <p className="text-brand-700 text-[15px] font-body font-semibold">
            {product.price} <span className="text-xs uppercase tracking-wider text-brand-400 font-bold">{ui.egp}</span>
          </p>
        </div>
      </Link>

      <div className="mt-4 px-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 w-full relative z-10">
        <button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          disabled={product.stock <= 0}
          className="w-full h-[40px] bg-brand-primary text-brand-text font-bold text-sm tracking-wide rounded-xl hover:scale-105 transition-transform disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shadow-sm border border-brand-primary/20"
        >
          {ui.addToCart}
        </button>
      </div>
    </div>
  );
}
