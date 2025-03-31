import React from 'react';

interface ContentSkeletonProps {
  type: 'home' | 'tasks' | 'shop' | 'prizes' | 'rating';
}

export function ContentSkeleton({ type }: ContentSkeletonProps) {
  const renderHomeSkeleton = () => (
    <div className="px-4 animate-pulse">
      {/* Balance */}
      <div className="mt-4 flex justify-center">
        <div className="h-10 w-32 bg-gray-200 rounded-full"></div>
      </div>

      {/* Quote */}
      <div className="mt-8 flex justify-center">
        <div className="w-3/4 h-24 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Freud Image */}
      <div className="mt-8 flex justify-center">
        <div className="w-64 h-64 bg-gray-200 rounded-full"></div>
      </div>

      {/* Progress */}
      <div className="mt-8">
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  const renderTasksSkeleton = () => (
    <div className="p-4 animate-pulse">
      {/* Header */}
      <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>

      {/* Tasks */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  const renderShopSkeleton = () => (
    <div className="p-4 animate-pulse">
      {/* Header */}
      <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>

      {/* Products */}
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex space-x-4 bg-gray-200 p-4 rounded-lg">
            <div className="w-24 h-24 bg-gray-300 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrizesSkeleton = () => (
    <div className="p-4 animate-pulse">
      {/* Timer */}
      <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>

      {/* Prize Fund */}
      <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>

      {/* Prize Places */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  const renderRatingSkeleton = () => (
    <div className="animate-pulse">
      {/* Header */}
      <div className="p-4">
        <div className="h-20 bg-gray-200 rounded-lg mb-4"></div>
      </div>

      {/* Users List */}
      <div className="px-4 space-y-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>

      {/* Bottom Stats */}
      <div className="fixed bottom-[72px] left-0 right-0 bg-white border-t p-4">
        <div className="max-w-md mx-auto flex justify-between">
          <div className="w-24 h-6 bg-gray-200 rounded"></div>
          <div className="w-24 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  switch (type) {
    case 'home':
      return renderHomeSkeleton();
    case 'tasks':
      return renderTasksSkeleton();
    case 'shop':
      return renderShopSkeleton();
    case 'prizes':
      return renderPrizesSkeleton();
    case 'rating':
      return renderRatingSkeleton();
    default:
      return null;
  }
}