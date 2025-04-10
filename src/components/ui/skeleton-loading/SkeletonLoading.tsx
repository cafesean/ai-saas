const SkeletonLoading = () => (
  <div className="flex flex-col grow">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </div>
  </div>
);

export default SkeletonLoading
