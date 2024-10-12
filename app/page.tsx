import React, { Suspense } from 'react';
import LoadingPage from './loading';
import FoodListings from "./components/FoodListings";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Food Listings</h1>
        <Suspense fallback={<LoadingPage />}>
          <FoodListings />
        </Suspense>
      </main>
    </div>
  );
};

export default Home;
