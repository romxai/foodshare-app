'use client';

import React from 'react';
import MessageCenter from '@/components/MessageCenter';

const MessagesPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <MessageCenter />
    </div>
  );
};

export default MessagesPage;
