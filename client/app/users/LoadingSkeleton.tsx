export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-card border rounded-lg p-6 animate-pulse flex flex-col h-full"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mt-1"></div>
            </div>
          </div>
          <div className="flex-1"></div>
          <div className="border-t pt-3 mt-auto">
            <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
