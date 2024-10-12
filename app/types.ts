export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  date: string;
}

// ... other types

export interface FoodListing {
  _id: string;
  foodType: string;
  description: string;
  quantity: string;
  expiration: string;
  location: string;
  postedBy: string; // This will now be the username
  createdAt: string;
  updatedAt: string;
}
