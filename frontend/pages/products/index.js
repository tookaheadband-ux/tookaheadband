import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useLang } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';
import Pagination from '@/components/Pagination';
import Breadcrumb from '@/components/Breadcrumb';
import FilterPanel from '@/components/FilterPanel';
import { fetchProducts, fetchCategories, fetchActiveFlashSales } from '@/lib/api';
import { motion } from 'framer-motion';
import SkeletonCard from '@/components/SkeletonCard';

const DEFAULT_FILTERS = { minPrice: '', maxPrice: '', color: '', size: '', sort: 'newest' };

export default function Products() {
  const { t, ui } = useLang();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [flashSales, setFlashSales] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (router.query.category) setSelectedCategory(router.query.category);
    if (router.query.search) setSearch(router.query.search);
  }, [router.query]);

  useEffect(() => {
    fetchCategories().then((res) => setCategories(res.data)).catch(console.error);
    fetchActiveFlashSales().then((res) => setFlashSales(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12 };
        if (selectedCategory) params.category = selectedCategory;
        if (debouncedSearch) params.search = debouncedSearch;
        if (router.query.featured) params.featured = 'true';
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (filters.color) params.color = filters.color;
        if (filters.size) params.size = filters.size;
        if (filters.sort) params.sort = filters.sort;
        const res = await fetchProducts(params);
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages);
        setTotal(res.data.total);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [page, selectedCategory, debouncedSearch, router.query.featured, filters]);

  const handleFiltersChange = (newFilters) => { setFilters(newFilters); setPage(1); };
  const handleFiltersReset = () => { setFilters(DEFAULT_FILTERS); setPage(1); };

  return (
    <>
    <Head>
      <title>{router.query.featured ? 'Best Sellers' : 'All Products'} — TOOKA</title>
      <meta name="description" content="Shop TOOKA's handmade kids accessories — headbands, clips, and more." />
    </Head>
    <div className="bg-white min-h-screen pt-24 md:pt-28 pb-20 md:pb-32">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: router.query.featured ? (ui.bestSellers || 'Best Sellers') : (ui.allProducts || 'All Products'), href: router.query.featured ? '/products?featured=true' : '/products' }]} />

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-brand-200 pb-8 relative">
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-brand-text mb-2 relative z-10">{router.query.featured ? (ui.bestSellers || 'Best Sellers') : ui.allProducts}</h1>
            {!loading && <p className="text-sm font-body font-bold text-gray-500 relative z-10">{total} {ui.items}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative z-10">
            <div className="relative w-full sm:w-64">
              <input
                type="text" value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={`${ui.search} (name or SKU)`}
                className="w-full h-[48px] pl-11 pr-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full sm:w-48 h-[48px] px-4 rounded-xl border-2 border-white focus:border-brand-primary outline-none text-brand-text font-body transition-colors bg-white/60 backdrop-blur-md shadow-sm appearance-none cursor-pointer">
              <option value="">{ui.allCategories}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{t(cat.nameAr, cat.nameEn)}</option>
              ))}
            </select>
            <FilterPanel filters={filters} onChange={handleFiltersChange} onReset={handleFiltersReset} total={total} />
          </div>
        </div>

        {/* Active Filter Tags */}
        {(filters.color || filters.size || filters.minPrice || filters.maxPrice) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.color && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-primary/10 text-brand-text text-xs font-black rounded-full border border-brand-primary/30">
                Color: {filters.color}
                <button onClick={() => handleFiltersChange({ ...filters, color: '' })} className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 transition-colors">x</button>
              </span>
            )}
            {filters.size && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-primary/10 text-brand-text text-xs font-black rounded-full border border-brand-primary/30">
                Size: {filters.size}
                <button onClick={() => handleFiltersChange({ ...filters, size: '' })} className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 transition-colors">x</button>
              </span>
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-primary/10 text-brand-text text-xs font-black rounded-full border border-brand-primary/30">
                Price: {filters.minPrice || '0'} - {filters.maxPrice || 'any'} EGP
                <button onClick={() => handleFiltersChange({ ...filters, minPrice: '', maxPrice: '' })} className="ml-1 w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-100 hover:text-red-500 transition-colors">x</button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 xl:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[300px] md:h-[400px]">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-white">
            <h3 className="text-2xl font-heading font-bold text-gray-500 mb-2">No products found</h3>
            <p className="text-sm text-gray-400 font-body">Try adjusting your search or filters</p>
            <button onClick={handleFiltersReset} className="mt-4 px-6 py-2 bg-brand-primary text-brand-text font-bold text-sm rounded-xl hover:-translate-y-0.5 transition-all">Reset Filters</button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5 xl:gap-6"
          >
            {products.map((product, idx) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
              >
                <div className="group hover:-translate-y-2 transition-transform duration-300 h-full">
                  <ProductCard product={product} flashSale={flashSales.find(fs => fs.productId?._id === product._id || fs.productId === product._id)} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {totalPages > 1 && (
          <div className="mt-24 border-t border-brand-200 pt-12">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
    </>
  );
}
