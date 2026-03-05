import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { fetchProduct } from '@/lib/api';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { t, ui } = useLang();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchProduct(id)
      .then((res) => {
        setProduct(res.data);
        if (res.data.images?.length > 0) setMainImage(res.data.images[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, qty);
  };

  const name = product ? t(product.nameAr, product.nameEn) : '';
  const description = product ? t(product.descriptionAr, product.descriptionEn) : '';
  const categoryName = product?.categoryId ? t(product.categoryId.nameAr, product.categoryId.nameEn) : '';
  const whatsappMsg = encodeURIComponent(`Hello TOOKA,\n\nI want to order:\n[${product?.sku || ''}] ${name}\n\nMy name:\nMy address:`);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-8 h-8 border-[3px] border-brand-200 border-t-brand-900 rounded-full animate-spin" />
    </div>;
  }

  if (!product) {
    return <div className="text-center py-32"><p className="text-brand-400">Product not found</p></div>;
  }

  return (
    <>
      <Head>
        <title>{name} — TOOKA</title>
        <meta name="description" content={description} />
      </Head>
      <div className="bg-brand-background min-h-screen pt-28 pb-32">
        <div className="w-full mx-auto px-6 md:px-16 lg:px-24">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">

            {/* Gallery Section */}
            <div className="md:col-span-7 animate-fade-in flex flex-col md:flex-row gap-4">
              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible order-2 md:order-1 hide-scrollbar">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`relative w-24 h-32 flex-shrink-0 border-2 transition-all ${mainImage === img ? 'border-brand-900' : 'border-transparent opacity-60 hover:opacity-100 object-cover'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[4/5] w-full bg-white rounded-3xl overflow-hidden shadow-sm order-1 md:order-2 flex-grow border border-white"
              >
                {product.images && product.images.length > 0 ? (
                  <img src={mainImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-300 font-[var(--font-family-heading)] text-2xl">TOOKA</div>
                )}
              </motion.div>
            </div>

            {/* Details Section */}
            <div className="md:col-span-5 animate-fade-in flex flex-col pt-8 md:pt-12" style={{ animationDelay: '0.1s' }}>

              <div className="mb-8 border-b border-brand-100 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  {categoryName && (
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-brand-400">
                      {categoryName}
                    </p>
                  )}
                  {product.sku && (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                      {product.sku}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold font-[var(--font-family-heading)] text-brand-900 mb-6 uppercase tracking-wider">{name}</h1>
                <p className="text-2xl font-medium text-brand-900">
                  {product.price} <span className="text-sm font-normal text-brand-400 tracking-widest uppercase">{ui.egp}</span>
                </p>
              </div>

              {description && (
                <div className="mb-10 text-brand-700 leading-relaxed text-sm format-description">
                  {description.split('\n').map((line, i) => <p key={i} className="mb-2">{line}</p>)}
                </div>
              )}

              {product.stock > 0 ? (
                <div className="space-y-6 mt-auto">
                  <div className="flex items-center justify-between border-y border-brand-100 py-6">
                    <span className="text-xs uppercase tracking-widest font-semibold text-brand-900">{ui.qty}</span>
                    <div className="flex items-center">
                      <button onClick={() => setQty(Math.max(1, qty - 1))}
                        className="w-10 h-10 flex items-center justify-center text-brand-900 text-lg focus:outline-none hover:bg-brand-50 transition-colors">-</button>
                      <span className="w-12 text-center font-medium text-sm text-brand-900">{qty}</span>
                      <button onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        className="w-10 h-10 flex items-center justify-center text-brand-900 text-lg hover:bg-brand-50 transition-colors">+</button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button onClick={handleAddToCart}
                      className={`w-full h-[56px] text-white font-bold text-base md:text-lg tracking-wide rounded-xl transition-all duration-300 ${
                        added
                          ? 'bg-brand-500 shadow-sm'
                          : 'bg-brand-primary shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1'
                      }`}>
                      {added ? 'Added to bag' : ui.addToCart}
                    </button>

                    <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                      className="w-full h-[56px] bg-white border-2 border-[#25D366] text-[#25D366] font-bold text-base md:text-lg tracking-wide rounded-xl hover:bg-[#25D366]/5 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                      {ui.orderViaWhatsApp}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-auto pt-8 border-t border-brand-100">
                  <p className="text-red-800 font-medium uppercase tracking-widest text-sm mb-4">{ui.outOfStock}</p>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
