const SkeletonCard = () => {
  return (
    <div className="max-w-sm p-4 border rounded-lg shadow animate-pulse">
      
      {/* Image */}
      <div className="w-full h-40 bg-gray-300 rounded-md"></div>

      {/* Title */}
      <div className="h-4 mt-4 bg-gray-300 rounded w-3/4"></div>

      {/* Text lines */}
      <div className="h-4 mt-2 bg-gray-300 rounded"></div>
      <div className="h-4 mt-2 bg-gray-300 rounded w-5/6"></div>

      {/* Button */}
      <div className="h-10 mt-4 bg-gray-300 rounded w-1/2"></div>

    </div>
  );
};

export default SkeletonCard;