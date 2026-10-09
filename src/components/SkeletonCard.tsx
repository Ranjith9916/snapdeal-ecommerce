export default function SkeletonCard({ compact }: { compact?: boolean }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col animate-pulse"
      style={{ boxShadow: '0 1px 12px rgba(0,0,0,0.06)', border: '1px solid #f0f0f0' }}>
      <div className="bg-gray-100" style={{ height: compact ? 160 : 210 }} />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-2.5 bg-gray-100 rounded-full w-16" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-4/5" />
        <div className="flex items-center gap-2 mt-1">
          <div className="h-5 w-10 bg-gray-100 rounded-md" />
          <div className="h-3 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
          <div className="h-4 w-16 bg-gray-100 rounded-full" />
        </div>
        <div className="h-8 bg-gray-100 rounded-xl mt-1" />
      </div>
    </div>
  )
}

export function SkeletonRow({ count = 4, compact }: { count?: number; compact?: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} compact={compact} />
      ))}
    </div>
  )
}
