export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
        className="px-3 py-2 rounded-lg text-sm border border-neutral-200 text-neutral-500 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        &larr;
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
            p === page ? 'bg-neutral-900 text-white' : 'border border-neutral-200 text-neutral-500 hover:border-neutral-400'
          }`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
        className="px-3 py-2 rounded-lg text-sm border border-neutral-200 text-neutral-500 hover:border-neutral-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        &rarr;
      </button>
    </div>
  );
}
