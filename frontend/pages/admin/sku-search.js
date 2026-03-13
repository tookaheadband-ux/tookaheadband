import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useEffect } from 'react';
import { useLang } from '@/context/LanguageContext';
import { AdminNav } from './dashboard';
import { adminGetMe, adminGetProducts } from '@/lib/api';

export default function SkuSearch() {
  const { t, ui } = useLang();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => { adminGetMe().catch(() => router.push('/admin/login')); }, [router]);

  const handleLogout = () => { localStorage.removeItem('toka-admin-token'); router.push('/admin/login'); };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await adminGetProducts({ sku: query.trim(), limit: 50 });
      setResults(res.data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9]">
      <AdminNav ui={ui} active="sku-search" onLogout={handleLogout} />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">

        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-1">🔍 SKU Search</h1>
          <p className="text-sm font-bold text-gray-500">Search for any product using its SKU code (e.g. TK-AB3Z)</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            placeholder="Enter SKU code... (e.g. TK-AB3Z)"
            className="flex-1 h-13 px-5 rounded-xl border-2 border-gray-100 focus:border-pink-400 outline-none text-gray-900 font-black tracking-widest text-base bg-white shadow-sm uppercase transition-all"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-13 px-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-sm rounded-xl shadow-[0_4px_14px_0_rgba(244,114,182,0.4)] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Results */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-[3px] border-pink-200 border-t-pink-500 rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-black text-gray-400 mb-1">No product found</p>
            <p className="text-sm font-bold text-gray-400">No product matches SKU: <span className="text-pink-500">{query}</span></p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <p className="text-sm font-black text-gray-500 uppercase tracking-widest">{results.length} result{results.length > 1 ? 's' : ''} found</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-100 text-gray-500 text-left text-xs uppercase tracking-widest font-black bg-gray-50/50">
                    <th className="p-5">Image</th>
                    <th className="p-5">SKU</th>
                    <th className="p-5">Name</th>
                    <th className="p-5">Price</th>
                    <th className="p-5">Stock</th>
                    <th className="p-5">Category</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((p) => (
                    <tr key={p._id} className="border-b border-gray-50 hover:bg-pink-50/30 transition-colors group">
                      <td className="p-5">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-50 relative border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                          {p.images?.[0]
                            ? <Image src={p.images[0]} alt="" fill className="object-cover" sizes="56px" />
                            : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">IMG</div>
                          }
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-black text-pink-500 bg-pink-50 px-3 py-1.5 rounded-lg border border-pink-100 shadow-sm tracking-widest">
                          {p.sku || '—'}
                        </span>
                      </td>
                      <td className="p-5 font-black text-gray-900 text-base">{t(p.nameAr, p.nameEn)}</td>
                      <td className="p-5 text-gray-700 font-bold">{p.price} EGP</td>
                      <td className="p-5">
                        <span className={`text-xs font-black px-3 py-1.5 rounded-lg shadow-sm w-16 inline-block text-center ${
                          p.stock <= 3 ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
                        }`}>{p.stock}</span>
                      </td>
                      <td className="p-5 text-gray-500 text-sm font-bold">
                        {p.categoryId ? t(p.categoryId.nameAr, p.categoryId.nameEn) : '-'}
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2 justify-end">
                          <a
                            href={`/products/${p._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-9 px-4 rounded-xl bg-gray-50 text-gray-600 text-xs font-black hover:bg-gray-900 hover:text-white border border-gray-200 hover:border-gray-900 transition-all shadow-sm"
                          >
                            View
                          </a>
                          <a
                            href={`/admin/products`}
                            className="h-9 px-4 rounded-xl bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 transition-all shadow-sm"
                          >
                            Edit
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
SkuSearch.isAdmin = true;
