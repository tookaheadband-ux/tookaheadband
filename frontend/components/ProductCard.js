import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useState } from 'react';
import { Eye, Heart, Check } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }) {
  const { t, ui } = useLang();
  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const wishlisted = isInWishlist(product._id);

  const name = t(product.nameAr, product.nameEn);
  const image = product.images?.[0] || 'https://placehold.co/800x1000/F7F5F2/2C2621?text=TOOKA';

  return (
    <div className="group relative flex flex-col h-full bg-transparent">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-[24px] bg-white shadow-sm hover:shadow-md transition-shadow duration-300 mb-4">
        <Link href={`/products/${product._id}`} className="block w-full h-full cursor-pointer bg-brand-50 relative overflow-hidden">
          <img
            src={image}
            alt={name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105 ${imgLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md scale-110'}`}
            loading="lazy"
          />
        </Link>

        {/* Heart (Wishlist) Button */}
        <button
          onClick={(e) => { e.preventDefault(); toggleItem(product); }}
          className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${
            wishlisted ? 'bg-brand-primary text-white scale-110 shadow-md' : 'bg-white/80 backdrop-blur-md text-brand-700 opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 hover:text-brand-primary'
          }`}
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={(e) => { e.preventDefault(); setIsQuickViewOpen(true); }}
          className="absolute top-4 left-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-brand-700 opacity-100 md:opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-110 hover:text-brand-primary transition-all shadow-sm"
        >
          <Eye size={18} />
        </button>

        {product.isFeatured && (
          <span className="absolute bottom-4 left-4 badge badge-brand shadow-sm pointer-events-none">Featured</span>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center pointer-events-none">
            <span className="badge badge-red">{ui.outOfStock}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <Link href={`/products/${product._id}`} className="flex flex-col gap-1.5 items-center text-center px-2 md:px-4 cursor-pointer flex-1 mt-1">
        <h3 className="font-heading font-bold text-brand-text text-[15px] md:text-[17px] tracking-wide line-clamp-1 transition-colors group-hover:text-brand-primary">
          {name}
        </h3>
        <p className="text-brand-900 text-[15px] md:text-[18px] font-body font-black flex items-baseline gap-1">
          {product.price} <span className="text-[10px] md:text-[11px] uppercase tracking-wider text-brand-700">{ui.egp}</span>
        </p>
        {product.stock > 0 ? (
          <p className="text-green-600 text-[12px] md:text-[13px] font-bold flex items-center gap-1">
            <Check size={14} strokeWidth={3} /> In Stock ({product.stock})
          </p>
        ) : (
          <p className="text-red-500 text-[12px] md:text-[13px] font-bold">
            Out of Stock
          </p>
        )}
      </Link>

      <div className="mt-3 md:mt-4 px-2 md:px-4 w-full relative z-10 pb-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            addItem(product);
            setIsAdding(true);
            setTimeout(() => setIsAdding(false), 1500);
          }}
          disabled={product.stock <= 0 || isAdding}
          className={`w-full h-[44px] md:h-[48px] font-bold text-[13px] md:text-sm tracking-wide rounded-[16px] transition-all duration-300 shadow-sm flex items-center justify-center gap-2 ${
            isAdding
              ? 'bg-green-600 text-white shadow-md scale-[0.98]'
              : 'bg-brand-primary text-white hover:shadow-md hover:-translate-y-1 hover:bg-brand-primary/90 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed'
          }`}
        >
          {isAdding ? (
            <span className="flex items-center gap-1.5">
              <Check strokeWidth={3} size={15} /> Added!
            </span>
          ) : (
            ui.addToCart
          )}
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
