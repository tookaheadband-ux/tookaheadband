import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'best_selling', label: 'Best Selling' },
];

export default function FilterPanel({ filters, onChange, onReset, total }) {
  const [open, setOpen] = useState(false);

  const hasActiveFilters =
    filters.minPrice || filters.maxPrice || filters.color || filters.size || (filters.sort && filters.sort !== 'newest');

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 h-[48px] px-4 rounded-xl border-2 font-bold text-sm transition-colors ${
          hasActiveFilters
            ? 'border-brand-primary bg-brand-primary/10 text-brand-text'
            : 'border-white bg-white/60 backdrop-blur-md text-brand-text shadow-sm'
        }`}
      >
        <SlidersHorizontal size={16} />
        <span>Filters</span>
        {hasActiveFilters && (
          <span className="w-5 h-5 bg-brand-primary rounded-full text-[10px] font-black flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* Drawer Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-black text-gray-900">Filters & Sort</h2>
              <button onClick={() => setOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-8">
              {/* Sort */}
              <div>
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Sort By</h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => onChange({ ...filters, sort: opt.value })}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                        (filters.sort || 'newest') === opt.value
                          ? 'bg-brand-primary/10 text-brand-text border-2 border-brand-primary'
                          : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Price Range (EGP)</h3>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice || ''}
                    onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-primary outline-none text-sm font-bold text-gray-900"
                  />
                  <span className="text-gray-400 font-bold flex-shrink-0">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border-2 border-gray-200 focus:border-brand-primary outline-none text-sm font-bold text-gray-900"
                  />
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {['Pink', 'Red', 'White', 'Black', 'Blue', 'Purple', 'Yellow', 'Green', 'Beige', 'Brown'].map((color) => (
                    <button
                      key={color}
                      onClick={() => onChange({ ...filters, color: filters.color === color ? '' : color })}
                      className={`px-4 py-2 rounded-full text-xs font-black border-2 transition-all ${
                        filters.color === color
                          ? 'bg-brand-primary border-brand-primary text-brand-text'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-brand-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL', 'One Size', 'Newborn', '0-3M', '3-6M', '6-12M', '1-3Y'].map((size) => (
                    <button
                      key={size}
                      onClick={() => onChange({ ...filters, size: filters.size === size ? '' : size })}
                      className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                        filters.size === size
                          ? 'bg-brand-primary border-brand-primary text-brand-text'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-brand-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => { onReset(); setOpen(false); }}
                className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-gray-700 font-black text-sm hover:bg-gray-50 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 h-12 rounded-xl bg-brand-primary text-brand-text font-black text-sm hover:bg-brand-secondary transition-colors"
              >
                Show {total} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
