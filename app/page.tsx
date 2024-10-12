import React from 'react';
import FoodListings from '../components/FoodListings';

const Home: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Food Listings</h1>
      <FoodListings />
    </div>
  );
};

export default Home;
