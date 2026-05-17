const LoadingSkeleton = ({ type = 'card', count = 4 }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="h-3 bg-gray-200 dark:bg-dark-hover rounded w-20 mb-3" />
                <div className="h-7 bg-gray-200 dark:bg-dark-hover rounded w-24" />
              </div>
              <div className="w-12 h-12 bg-gray-200 dark:bg-dark-hover rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="glass-card overflow-hidden animate-pulse">
        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="h-5 bg-gray-200 dark:bg-dark-hover rounded w-40" />
        </div>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-dark-border">
            <div className="w-10 h-10 bg-gray-200 dark:bg-dark-hover rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-dark-hover rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-dark-hover rounded w-1/2" />
            </div>
            <div className="h-6 bg-gray-200 dark:bg-dark-hover rounded-full w-16" />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
