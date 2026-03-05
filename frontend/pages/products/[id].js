import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLang } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { fetchProduct, getProductReviews, createProductReview, subscribeNotifyMe } from '@/lib/api';
import { Star } from 'lucide-react';

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
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-[var(--font-family-heading)] text-2xl">TOOKA</div>
                )}
              </motion.div>
            </div>

            {/* Details Section */}
            <div className="md:col-span-5 animate-fade-in flex flex-col pt-8 md:pt-12" style={{ animationDelay: '0.1s' }}>

              <div className="mb-8 border-b border-brand-100 pb-8">
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
                    <button onClick={handleAddToCart}
                      className={`w-full h-[56px] text-white font-bold text-base md:text-lg tracking-wide rounded-xl transition-all duration-300 ${
                        added
                          ? 'bg-brand-500 shadow-sm'
                          : 'bg-brand-primary shadow-[0_4px_14px_0_rgba(255,199,209,0.5)] hover:shadow-[0_6px_20px_rgba(255,199,209,0.7)] hover:-translate-y-1'
                      }`}>
                      {added ? 'Added to bag' : ui.addToCart}
                    </button>

                    <a href={`https://wa.me/20100204496?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
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
    </>
  );
}
