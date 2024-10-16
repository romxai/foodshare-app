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
  postedBy: string; // This should be the user ID
  createdAt: string;
  updatedAt: string;
  imagePaths: string[];
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
