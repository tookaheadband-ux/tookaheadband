import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { fetchProduct, getProductReviews, createProductReview, subscribeNotifyMe } from '@/lib/api';
import { Star } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import SkeletonProductDetail from '@/components/SkeletonProductDetail';
import RelatedProducts from '@/components/RelatedProducts';

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
  const [imgLoaded, setImgLoaded] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  // Sticky add to cart
  const addToCartRef = useRef(null);
  const [showSticky, setShowSticky] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Notify Me
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyMsg, setNotifyMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchProduct(id)
      .then((res) => {
        setProduct(res.data);
        if (res.data.images?.length > 0) setMainImage(res.data.images[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    getProductReviews(id)
      .then((res) => { setReviews(res.data.reviews); setAvgRating(res.data.avgRating); setReviewCount(res.data.count); })
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!addToCartRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(addToCartRef.current);
    return () => observer.disconnect();
  }, [product, loading]);

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const name = product ? t(product.nameAr, product.nameEn) : '';
  const description = product ? t(product.descriptionAr, product.descriptionEn) : '';
  const categoryName = product?.categoryId ? t(product.categoryId.nameAr, product.categoryId.nameEn) : '';
  const whatsappMsg = encodeURIComponent(`Hello TOOKA,\n\nI want to order:\n[${product?.sku || ''}] ${name}\n\nMy name:\nMy address:`);

  if (loading) {
    return <SkeletonProductDetail />;
  }

  if (!product) {
    return <div className="text-center py-32"><p className="text-gray-500">Product not found</p></div>;
  }

  return (
    <>
      <Head>
        <title>{name} — TOOKA</title>
        <meta name="description" content={description} />
      </Head>
      <div className="bg-brand-background min-h-screen pt-28 pb-32">
        <div className="w-full mx-auto px-6 md:px-16 lg:px-24">

          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: ui.allProducts || 'All Products', href: '/products' },
            { label: name, href: `/products/${id}` }
          ]} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

            {/* Gallery Section */}
            <div className="lg:col-span-6 xl:col-span-5 animate-fade-in flex flex-col md:flex-row gap-3 md:gap-4 md:sticky md:top-32">
              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="flex md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[550px] order-2 md:order-1 hide-scrollbar py-2 md:py-0 md:pr-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setMainImage(img); setImgLoaded(false); }}
                      className={`relative w-[72px] h-[90px] flex-shrink-0 rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                        mainImage === img
                          ? 'border-gray-900 shadow-md scale-105'
                          : 'border-transparent opacity-50 hover:opacity-90 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
              {/* Main Image with Zoom */}
              <div className="relative w-full order-1 md:order-2 flex-grow max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-[4/5] sm:aspect-square md:aspect-[4/5] w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-zoom-in border border-gray-100"
                  onClick={() => {
                    const idx = product.images?.indexOf(mainImage);
                    setLightboxIdx(idx >= 0 ? idx : 0);
                    setLightboxOpen(true);
                  }}
                  onMouseEnter={() => setIsZooming(true)}
                  onMouseLeave={() => setIsZooming(false)}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setZoomPos({ x, y });
                  }}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={mainImage}
                      alt={name}
                      onLoad={() => setImgLoaded(true)}
                      className={`w-full h-full object-cover transition-all duration-500 ease-out ${imgLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md scale-105'}`}
                      style={isZooming ? {
                        transform: 'scale(2)',
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      } : {}}
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-[var(--font-family-heading)] text-2xl">TOOKA</div>
                  )}
                </motion.div>
                {/* Image counter badge */}
                {product.images?.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                    {(product.images.indexOf(mainImage) + 1)} / {product.images.length}
                  </div>
                )}
                {/* Zoom hint */}
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md text-gray-600 text-[10px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                  Hover to zoom
                </div>
              </div>
            </div>

            {/* Lightbox */}
            {lightboxOpen && product.images?.length > 0 && (
              <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
                {/* Close */}
                <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {/* Counter */}
                <div className="absolute top-6 left-6 text-white/70 text-sm font-bold">
                  {lightboxIdx + 1} / {product.images.length}
                </div>
                {/* Prev */}
                {product.images.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx - 1 + product.images.length) % product.images.length); }}
                    className="absolute left-4 md:left-8 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                {/* Image */}
                <img
                  src={product.images[lightboxIdx]}
                  alt={name}
                  className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                  draggable={false}
                />
                {/* Next */}
                {product.images.length > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((lightboxIdx + 1) % product.images.length); }}
                    className="absolute right-4 md:right-8 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
                {/* Thumbnail strip */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {product.images.map((img, idx) => (
                      <button key={idx} onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${lightboxIdx === idx ? 'border-white scale-110' : 'border-white/30 opacity-50 hover:opacity-80'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Details Section */}
            <div className="lg:col-span-6 xl:col-span-6 xl:col-start-7 animate-fade-in flex flex-col pt-4 md:pt-0" style={{ animationDelay: '0.1s' }}>

              <div className="mb-8 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  {categoryName && (
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-500">
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
                  {product.price} <span className="text-sm font-normal text-gray-600 tracking-widest uppercase">{ui.egp}</span>
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
                    <div ref={addToCartRef} className="w-full">
                      <button onClick={handleAddToCart}
                        className={`w-full h-[56px] text-white font-bold text-base md:text-lg tracking-wide rounded-xl transition-all duration-300 ${
                          added
                            ? 'bg-brand-500 shadow-sm'
                            : 'bg-brand-primary shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1'
                        }`}>
                        {added ? 'Added to bag' : ui.addToCart}
                      </button>
                    </div>

                    <a href={`https://wa.me/201002084496?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                      className="w-full h-[56px] bg-white border-2 border-[#25D366] text-[#25D366] font-bold text-base md:text-lg tracking-wide rounded-xl hover:bg-[#25D366]/5 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center">
                      {ui.orderViaWhatsApp}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="mt-auto pt-8 border-t border-brand-100">
                  <p className="text-red-800 font-medium uppercase tracking-widest text-sm mb-4">{ui.outOfStock}</p>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-700 mb-2">🔔 Notify me when back in stock</p>
                    <div className="flex gap-2">
                      <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="your@email.com"
                        className="flex-1 h-10 px-4 rounded-lg border-2 border-gray-200 focus:border-pink-400 outline-none text-sm text-gray-900 font-bold" />
                      <button onClick={async () => { if (!notifyEmail) return; try { const r = await subscribeNotifyMe(id, notifyEmail); setNotifyMsg(r.data.message); setNotifyEmail(''); } catch { setNotifyMsg('Error'); } }}
                        className="h-10 px-5 bg-pink-500 text-white font-bold text-sm rounded-lg hover:-translate-y-0.5 transition-all">Notify Me</button>
                    </div>
                    {notifyMsg && <p className="text-xs text-green-600 font-bold mt-2">{notifyMsg}</p>}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Related Products */}
        {product.relatedProducts?.length > 0 && (
          <RelatedProducts products={product.relatedProducts} />
        )}

        {/* Reviews Section */}
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 pb-16">
          <div className="border-t border-brand-100 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">⭐ Reviews ({reviewCount})</h2>
            {avgRating > 0 && <p className="text-sm text-gray-600 font-bold mb-6">Average: {avgRating}/5 stars</p>}

            {/* Leave Review Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8">
              <h3 className="text-sm font-black text-gray-700 mb-4">Leave a Review</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input value={reviewForm.name} onChange={(e) => setReviewForm({...reviewForm, name: e.target.value})} placeholder="Your name"
                  className="h-10 px-4 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm text-gray-900 font-bold bg-gray-50" />
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s} onClick={() => setReviewForm({...reviewForm, rating: s})}
                      className={`text-2xl transition-colors ${s <= reviewForm.rating ? 'text-amber-400' : 'text-gray-300'}`}>★</button>
                  ))}
                </div>
              </div>
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})} placeholder="Your review (optional)"
                rows={2} className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm text-gray-900 font-bold bg-gray-50 resize-none mb-3" />
              <button onClick={async () => {
                if (!reviewForm.name) return;
                setSubmittingReview(true);
                try {
                  await createProductReview(id, reviewForm);
                  setReviewForm({ name: '', rating: 5, comment: '' });
                  const r = await getProductReviews(id);
                  setReviews(r.data.reviews); setAvgRating(r.data.avgRating); setReviewCount(r.data.count);
                } catch {} finally { setSubmittingReview(false); }
              }} disabled={submittingReview}
                className="h-10 px-6 bg-gray-900 text-white font-bold text-sm rounded-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">Submit Review</button>
            </div>

            {/* Review List */}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-black text-gray-900 text-sm">{r.name}</p>
                    <div className="flex gap-0.5">{[1,2,3,4,5].map((s) => <span key={s} className={`text-sm ${s <= r.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}</div>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  <p className="text-[10px] text-gray-400 font-bold mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No reviews yet. Be the first!</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Add to Cart for Mobile */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 pt-3 pb-safe transform transition-transform duration-300 md:hidden flex items-center justify-between gap-4 ${showSticky ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="flex flex-col min-w-0 flex-1">
          <p className="font-bold text-sm text-gray-900 truncate">{name}</p>
          <p className="font-bold text-brand-primary text-sm">{product.price} {ui.egp}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className="h-11 px-6 bg-brand-primary text-white font-[var(--font-family-body)] font-bold text-sm rounded-xl shrink-0 shadow-sm disabled:opacity-50"
        >
          {product.stock <= 0 ? ui.outOfStock : (added ? 'Added' : ui.addToCart)}
        </button>
      </div>
    </>
  );
}
