import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LanguageContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetReviews, adminDeleteReview } from '@/lib/api';

export default function AdminReviews() {
  const { t, ui } = useLang();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterRating, setFilterRating] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterRating) params.rating = filterRating;
      const res = await adminGetReviews(params);
      setReviews(res.data.reviews);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
    } catch { setReviews([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadReviews(); }, [page, filterRating]);

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(confirmId);
    setConfirmId(null);
    try {
      await adminDeleteReview(confirmId);
      setReviews(prev => prev.filter(r => r._id !== confirmId));
      setTotal(prev => prev - 1);
    } catch {}
    finally { setDeleting(null); }
  };

  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="reviews" onLogout={handleLogout} />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">⭐ Reviews</h1>
            <p className="text-sm font-bold text-gray-500">{total} total reviews</p>
          </div>
          <div className="flex gap-2">
            <select
              value={filterRating}
              onChange={(e) => { setFilterRating(e.target.value); setPage(1); }}
              className="h-11 px-4 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-bold text-sm bg-white shadow-sm appearance-none cursor-pointer"
            >
              <option value="">All Ratings</option>
              {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Stars</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-5xl mb-4">⭐</p>
            <p className="text-xl font-black text-gray-400 mb-1">No reviews found</p>
            <p className="text-sm font-bold text-gray-400">
              {filterRating ? `No ${filterRating}-star reviews` : 'No reviews yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product info */}
                  {review.productId && (
                    <Link href={`/products/${review.productId._id}`} target="_blank" className="flex items-center gap-3 shrink-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 relative border border-gray-100 shadow-sm">
                        {review.productId.images?.[0]
                          ? <Image src={review.productId.images[0]} alt="" fill className="object-cover" sizes="56px" />
                          : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">IMG</div>
                        }
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate max-w-[200px]">
                          {t(review.productId.nameAr, review.productId.nameEn)}
                        </p>
                        {review.productId.sku && (
                          <p className="text-[10px] font-bold text-pink-500 tracking-widest">{review.productId.sku}</p>
                        )}
                      </div>
                    </Link>
                  )}

                  {/* Review content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <p className="font-black text-gray-900 text-sm">{review.name}</p>
                      <span className="text-amber-400 text-sm tracking-wider">{stars(review.rating)}</span>
                      <span className="text-[10px] font-bold text-gray-400 ml-auto shrink-0">
                        {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmId(review._id)}
                      disabled={deleting === review._id}
                      className="h-9 px-4 rounded-xl bg-red-50 text-red-500 text-xs font-black hover:bg-red-500 hover:text-white border border-red-100 hover:border-red-500 transition-all shadow-sm disabled:opacity-50"
                    >
                      {deleting === review._id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-black text-gray-500 px-4">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-10 px-4 rounded-xl bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        )}

      </div>

      {/* Custom Delete Confirm Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Delete Review?</h3>
            <p className="text-sm text-gray-500 font-medium mb-8">This action cannot be undone. The review will be permanently removed.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 h-11 rounded-xl bg-gray-100 text-gray-700 font-black text-sm hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white font-black text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
AdminReviews.isAdmin = true;
