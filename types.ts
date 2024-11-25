export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  location: string;
  // Add other user fields as needed
}

export interface FoodListing {
  _id: string;
  foodType: string;
  description: string;
  quantity: string;
  quantityType: string;
  quantityUnit: string;
  expiration: string;
  location: string;
  images: string[];
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ... other types

export interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  recipient: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  participants: string[];
  listingId: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    timestamp: string;
  };
  otherUser?: {
    _id: string;
    name: string;
  };
}

export interface ConversationWithOtherUser extends Conversation {
  otherUser: {
    _id: string;
    name: string;
  };
}
