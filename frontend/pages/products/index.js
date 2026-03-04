import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import { fetchProducts, fetchCategories } from '@/lib/api';

export default function Products() {
  const { t, ui } = useLang();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (router.query.category) setSelectedCategory(router.query.category);
    if (router.query.search) setSearch(router.query.search);
  }, [router.query]);

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (selectedCategory) params.category = selectedCategory;
        if (search) params.search = search;
        if (router.query.featured) params.featured = 'true';
        const res = await fetchProducts(params);
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [page, selectedCategory, search, router.query.featured]);

  return (
    <div className="bg-white min-h-screen pt-28 pb-32">
      <div className="w-full mx-auto px-6 md:px-16 lg:px-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 border-b border-brand-200 pb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold font-[var(--font-family-heading)] text-brand-900 uppercase tracking-widest">{ui.allProducts}</h1>
            {!loading && <p className="text-sm font-medium tracking-[0.1em] text-brand-400 uppercase mt-4">{total} items</p>}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={ui.search}
                className="input-field !pl-10 text-sm font-medium tracking-wide bg-brand-50"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="input-field !w-full sm:!w-48 text-sm font-medium tracking-wide bg-brand-50 appearance-none">
              <option value="">{ui.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{t(cat.nameAr, cat.nameEn)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col">
                <div className="aspect-[3/4] shimmer mb-4" />
                <div className="space-y-3 px-2 flex flex-col items-center">
                  <div className="h-4 shimmer w-2/3" />
                  <div className="h-4 shimmer w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <h3 className="text-2xl font-[var(--font-family-heading)] text-brand-400 mb-2">No products found</h3>
            <p className="text-sm text-brand-300 tracking-widest uppercase">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product, idx) => (
              <div key={product._id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-24 border-t border-brand-200 pt-12">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
