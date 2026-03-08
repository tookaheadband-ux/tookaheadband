export default function SkeletonProductDetail() {
  return (
    <div className="bg-brand-background min-h-screen pt-28 pb-32">
      <div className="w-full mx-auto px-6 md:px-16 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Gallery Skeleton */}
          <div className="md:col-span-7 flex flex-col md:flex-row gap-3">
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:max-h-[600px] order-2 md:order-1 py-1 md:py-0 md:pr-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-[72px] h-[90px] flex-shrink-0 rounded-xl bg-brand-50 shimmer" />
              ))}
            </div>
            <div className="relative aspect-[4/5] w-full order-1 md:order-2 bg-brand-50 rounded-2xl shimmer" />
          </div>

          {/* Details Skeleton */}
          <div className="md:col-span-5 flex flex-col pt-8 md:pt-12">
            <div className="mb-8 border-b border-brand-100 pb-8 space-y-4">
              <div className="h-4 bg-brand-100 rounded w-1/4 shimmer" />
              <div className="h-10 bg-brand-100 rounded w-3/4 shimmer" />
              <div className="h-8 bg-brand-100 rounded w-1/3 shimmer mt-6" />
            </div>

            <div className="mb-10 space-y-3">
              <div className="h-4 bg-brand-50 rounded w-full shimmer" />
              <div className="h-4 bg-brand-50 rounded w-full shimmer" />
              <div className="h-4 bg-brand-50 rounded w-5/6 shimmer" />
              <div className="h-4 bg-brand-50 rounded w-4/6 shimmer" />
            </div>

            <div className="mt-auto space-y-6">
              <div className="h-16 bg-brand-50 rounded-lg w-full shimmer" />
              <div className="h-[56px] bg-brand-100 rounded-xl w-full shimmer" />
              <div className="h-[56px] bg-brand-100 rounded-xl w-full shimmer" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
