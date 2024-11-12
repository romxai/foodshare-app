export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  location: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
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
  quantityUnit: string;
  servings?: number;
  expiration: string;
  location: string;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  imagePaths?: string[];
}
