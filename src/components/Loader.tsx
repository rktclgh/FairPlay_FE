import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
      <span className="text-sm font-medium text-gray-600">Loading...</span>
    </div>
  );
}

export default Loader;
