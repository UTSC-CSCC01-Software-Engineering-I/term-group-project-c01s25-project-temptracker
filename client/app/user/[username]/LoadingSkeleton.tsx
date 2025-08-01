export default function ProfileLoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="animate-pulse">
        {/* Back Button Skeleton */}
        <div className="h-10 w-32 bg-gray-200 rounded mb-4"></div>

        {/* Welcome Header Skeleton */}
        <div className="h-9 w-64 bg-gray-200 rounded mb-4"></div>

        {/* Profile Header Skeleton */}
        <div className="rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-300 h-8"></div>
          <div className="bg-white p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded my-4"></div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges Skeleton */}
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded my-4"></div>
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="text-center p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Table Skeleton */}
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded my-4"></div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-gray-300 h-12"></div>
            <div className="divide-y divide-gray-200">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-6 py-4 grid grid-cols-4 gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
