import React from 'react';

// This function simulates an API call
const fetchFoodListings = async () => {
  // In a real app, this would be an actual API call
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate a 2-second delay
  return [
    { id: 1, name: 'Pizza', quantity: '2 boxes' },
    { id: 2, name: 'Salad', quantity: '1 large bowl' },
    // ... more listings
  ];
};

const FoodListings: React.FC = async () => {
  const listings = await fetchFoodListings();

  return (
    <ul>
      {listings.map(listing => (
        <li key={listing.id}>{listing.name} - {listing.quantity}</li>
      ))}
    </ul>
  );
};

export default FoodListings;
