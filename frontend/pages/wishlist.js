import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WishlistPage() {
  const { t, ui } = useLang();
  const { items, removeItem } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="min-h-screen bg-brand-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-brand-text mb-2">
            💖 {ui.wishlist || 'My Wishlist'}
          </h1>
          <p className="text-sm text-gray-500 font-body">{items.length} items saved</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-pink-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-500 mb-2">Your wishlist is empty</h3>
            <p className="text-sm text-gray-400 mb-6">Browse products and tap the heart to save them here</p>
            <Link href="/products" className="inline-flex h-12 px-8 items-center justify-center bg-brand-primary text-white font-bold rounded-xl hover:-translate-y-1 transition-all shadow-lg shadow-pink-200">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence>
              {items.map((product) => {
                const name = t(product.nameAr, product.nameEn);
                const image = product.images?.[0] || 'https://placehold.co/800x1000/F7F5F2/2C2621?text=TOOKA';
                return (
                  <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50"
                  >
                    <Link href={`/products/${product._id}`} className="block">
                      <div className="aspect-[3/4] overflow-hidden">
                        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
                      </div>
                    </Link>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">{name}</h3>
                      <p className="text-gray-900 font-black text-sm mb-3">{product.price} <span className="text-xs text-gray-600">EGP</span></p>
                      <div className="flex gap-2">
                        <button onClick={() => addItem(product)} disabled={product.stock <= 0}
                          className="flex-1 h-9 flex items-center justify-center gap-1 bg-brand-primary text-white text-xs font-bold rounded-xl hover:scale-[1.03] transition-all disabled:opacity-40">
                          <ShoppingBag size={14} /> Add
                        </button>
                        <button onClick={() => removeItem(product._id)}
                          className="h-9 w-9 flex items-center justify-center bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
