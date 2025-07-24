export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-gray-700 rounded animate-pulse"></div>
        <div className="h-10 w-24 bg-gray-700 rounded animate-pulse"></div>
      </div>
      
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 bg-gray-800 rounded-lg pixelated-border">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-6 w-3/4 bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-4/6 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
