import React from 'react';
import LoadingSpinner from './components/LoadingSpinner';

const LoadingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-4">Loading...</h1>
          <LoadingSpinner />
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
