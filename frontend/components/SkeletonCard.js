export default function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-[16px] p-4 shadow-sm h-full w-full">
      <div className="w-full aspect-[3/4] bg-brand-50 rounded-xl shimmer mb-4" />
      <div className="space-y-3 px-2 flex flex-col items-center">
        <div className="h-4 shimmer w-2/3 rounded-full bg-brand-100" />
        <div className="h-4 shimmer w-1/3 rounded-full bg-brand-100" />
      </div>
    </div>
  );
}
