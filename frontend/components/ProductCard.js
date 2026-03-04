import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }) {
  const { t, ui } = useLang();
  const { addItem } = useCart();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const name = t(product.nameAr, product.nameEn);
  const image = product.images?.[0] || 'https://placehold.co/800x1000/F7F5F2/2C2621?text=TOOKA';

  return (
    <div className="group relative flex flex-col h-full bg-transparent">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[16px] bg-white shadow-sm mb-4">
        <Link href={`/products/${product._id}`} className="block w-full h-full cursor-pointer">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Quick View Button (Visible on Hover) */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsQuickViewOpen(true);
          }}
          className="absolute top-4 right-4 z-20 w-8 h-8 md:w-10 md:h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-brand-text opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 transition-all shadow-sm"
        >
          <Eye size={18} />
        </button>

        {product.isFeatured && (
          <span className="absolute top-4 left-4 badge badge-brand shadow-sm pointer-events-none">Featured</span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <span className="badge badge-red">{ui.outOfStock}</span>
          </div>
        )}
      </div>

      {/* Details Container */}
      <Link href={`/products/${product._id}`} className="flex flex-col gap-1 items-center text-center px-2 md:px-4 cursor-pointer flex-1">
        <h3 className="font-heading font-bold text-brand-text text-[14px] sm:text-[15px] md:text-[18px] tracking-wide line-clamp-1 transition-colors group-hover:text-brand-primary">
          {name}
        </h3>
        <p className="text-brand-700 text-[13px] md:text-[16px] font-body font-semibold mt-1">
          {product.price} <span className="text-[10px] md:text-xs uppercase tracking-wider text-brand-400 font-bold ml-1">{ui.egp}</span>
        </p>
      </Link>

      <div className="mt-2 md:mt-4 px-2 md:px-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 w-full relative z-10">
        <button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          disabled={product.stock <= 0}
          className="w-full h-[40px] md:h-[48px] bg-brand-primary text-brand-text font-bold text-[12px] md:text-sm tracking-wide rounded-xl hover:scale-[1.03] hover:bg-[#ffb8c7] transition-all duration-200 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shadow-sm"
        >
          {ui.addToCart}
        </button>
      </div>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </div>
  );
}
