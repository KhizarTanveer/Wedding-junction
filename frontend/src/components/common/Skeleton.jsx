// Reusable skeleton components for loading states

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-luxury-xl shadow-soft overflow-hidden border border-stone-100 animate-pulse">
      <div className="h-48 bg-stone-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-stone-200 rounded w-3/4" />
        <div className="h-4 bg-stone-200 rounded w-1/2" />
        <div className="h-4 bg-stone-200 rounded w-full" />
        <div className="h-4 bg-stone-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonVendorCard() {
  return (
    <div className="bg-white rounded-luxury-xl shadow-soft overflow-hidden border border-stone-100 animate-pulse">
      <div className="h-40 bg-stone-200" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="h-5 bg-stone-200 rounded w-1/2" />
          <div className="h-5 bg-stone-200 rounded w-16" />
        </div>
        <div className="h-4 bg-stone-200 rounded w-1/3" />
        <div className="h-4 bg-stone-200 rounded w-1/4" />
        <div className="flex gap-2 mt-4">
          <div className="h-10 bg-stone-200 rounded flex-1" />
          <div className="h-10 bg-stone-200 rounded flex-1" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCategoryCard() {
  return (
    <div className="bg-white rounded-luxury-xl shadow-soft overflow-hidden border border-stone-100 animate-pulse">
      <div className="h-48 bg-stone-200" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-stone-200 rounded w-2/3" />
        <div className="h-4 bg-stone-200 rounded w-full" />
        <div className="h-4 bg-stone-200 rounded w-3/4" />
      </div>
    </div>
  );
}

export function SkeletonText({ width = "w-full", height = "h-4" }) {
  return <div className={`${width} ${height} bg-stone-200 rounded animate-pulse`} />;
}

export function SkeletonCircle({ size = "w-12 h-12" }) {
  return <div className={`${size} bg-stone-200 rounded-full animate-pulse`} />;
}

export function SkeletonImage({ className = "h-48" }) {
  return <div className={`${className} bg-stone-200 animate-pulse`} />;
}

export function SkeletonButton({ width = "w-24" }) {
  return <div className={`${width} h-10 bg-stone-200 rounded-full animate-pulse`} />;
}

export function SkeletonStatsCard() {
  return (
    <div className="bg-white rounded-luxury-xl shadow-soft p-6 border border-stone-100 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-stone-200 rounded-xl" />
        <div className="w-16 h-4 bg-stone-200 rounded" />
      </div>
      <div className="h-8 bg-stone-200 rounded w-16 mb-2" />
      <div className="h-4 bg-stone-200 rounded w-24" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-stone-100 animate-pulse">
      <td className="py-3 px-4"><div className="h-4 bg-stone-200 rounded w-24" /></td>
      <td className="py-3 px-4"><div className="h-4 bg-stone-200 rounded w-32" /></td>
      <td className="py-3 px-4"><div className="h-4 bg-stone-200 rounded w-20" /></td>
      <td className="py-3 px-4"><div className="h-6 bg-stone-200 rounded-full w-16" /></td>
      <td className="py-3 px-4"><div className="h-4 bg-stone-200 rounded w-24" /></td>
    </tr>
  );
}

// Grid of skeleton cards
export function SkeletonGrid({ count = 6, CardComponent = SkeletonCard }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardComponent key={i} />
      ))}
    </div>
  );
}

export default {
  Card: SkeletonCard,
  VendorCard: SkeletonVendorCard,
  CategoryCard: SkeletonCategoryCard,
  Text: SkeletonText,
  Circle: SkeletonCircle,
  Image: SkeletonImage,
  Button: SkeletonButton,
  StatsCard: SkeletonStatsCard,
  TableRow: SkeletonTableRow,
  Grid: SkeletonGrid,
};
