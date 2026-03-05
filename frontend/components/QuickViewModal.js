import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const { t, ui } = useLang();
  const { addItem } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!product) return null;

  const name = t(product.nameAr, product.nameEn);
  const desc = t(product.descriptionAr, product.descriptionEn);
  const image = product.images?.[0] || 'https://placehold.co/800x1000/F7F5F2/2C2621?text=TOOKA';

  const handleAddToCart = () => {
    addItem(product);
    onClose();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-text/40 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[600px] z-10"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-brand-text hover:bg-white hover:scale-110 transition-all shadow-sm"
            >
              <X size={20} />
            </button>

            {/* Left Image */}
            <div className="w-full md:w-1/2 h-[300px] md:h-auto bg-brand-50 relative">
              <img src={image} alt={name} className="w-full h-full object-cover" />
              {product.isFeatured && (
                <span className="absolute top-4 left-4 badge badge-brand shadow-sm">Featured</span>
              )}
            </div>

            {/* Right Details */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center overflow-y-auto">
              <span className="text-xs uppercase tracking-widest text-brand-primary font-bold mb-2">
                Quick View
              </span>
              <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-brand-text mb-2">
                {name}
              </h2>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-body font-bold text-brand-text">{product.price}</span>
                <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">{ui.egp}</span>
              </div>

              <div className="bg-brand-background rounded-2xl p-5 mb-8">
                <p className="text-brand-700 font-body text-sm md:text-base leading-relaxed">
                  {desc}
                </p>
              </div>

              <div className="flex items-center gap-3 text-sm font-bold text-brand-700 mb-8 opacity-80">
                <div className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full">
                  <span className="text-green-500">✔</span> In Stock ({product.stock})
                </div>
                <div className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full">
                  <span className="text-brand-primary">🌸</span> Handmade
                </div>
              </div>

              <div className="mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="w-full h-[56px] bg-brand-primary text-white font-bold text-base md:text-lg tracking-wide rounded-xl shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {product.stock <= 0 ? ui.outOfStock : ui.addToCart}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
