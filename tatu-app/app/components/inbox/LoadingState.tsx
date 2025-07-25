export function LoadingState() {
  return (
    <div className="flex flex-col space-y-4 p-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse flex items-start space-x-4">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
} 