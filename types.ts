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
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    name: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
  };
}
