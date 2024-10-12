"use client";

import React, { useState, useEffect } from 'react';
import { User, Message } from '../types';
import { getCurrentUser } from '../lib/auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface MessageSystemProps {
  listingId: string;
}

const MessageSystem: React.FC<MessageSystemProps> = ({ listingId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${listingId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      }
    };

    fetchMessages();
    // Set up a polling mechanism to fetch new messages every 5 seconds
    const intervalId = setInterval(fetchMessages, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [listingId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ listingId, message: newMessage }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      // Refresh messages after sending
      const updatedResponse = await fetch(`/api/messages/${listingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!updatedResponse.ok) throw new Error('Failed to fetch updated messages');
      const updatedData = await updatedResponse.json();
      setMessages(updatedData);

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="h-64 overflow-y-auto border p-4 rounded">
        {messages.map((message) => (
          <div key={message.id} className={`mb-2 ${message.senderId === currentUser?.id ? 'text-right' : 'text-left'}`}>
            <p className="font-bold">{message.senderName}</p>
            <p>{message.content}</p>
            <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex space-x-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
          className="flex-grow"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
};

export default MessageSystem;
