export interface User {
  id: string;
  name: string;
  email: string;
  location: string;
}

export interface FoodListing {
  _id: string;
  foodType: string;
  description: string;
  quantity: string;
  expiration: string;
  location: string;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ... other types

export interface Message {
  id: string;
  listingId: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: string;
}
