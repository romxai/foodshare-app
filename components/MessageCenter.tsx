import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Message } from '../types';
import { getCurrentUser } from '../lib/auth';
import MessageSystem from './MessageSystem';

const MessageCenter: React.FC = () => {
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [outboxMessages, setOutboxMessages] = useState<Message[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const inboxResponse = await fetch('/api/messages?type=inbox', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const outboxResponse = await fetch('/api/messages?type=outbox', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (inboxResponse.ok && outboxResponse.ok) {
        const inboxData = await inboxResponse.json();
        const outboxData = await outboxResponse.json();
        setInboxMessages(inboxData);
        setOutboxMessages(outboxData);
      }
    };
    fetchMessages();
  }, []);

  const renderMessageList = (messages: Message[]) => (
    <ul className="space-y-2">
      {messages.map((message) => (
        <li key={message.id} className="border p-2 rounded cursor-pointer hover:bg-gray-100" onClick={() => setSelectedListingId(message.listingId)}>
          <p className="font-bold">{message.senderName}</p>
          <p>{message.content}</p>
          <p className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-4">
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="outbox">Outbox</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
            </CardHeader>
            <CardContent>
              {renderMessageList(inboxMessages)}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="outbox">
          <Card>
            <CardHeader>
              <CardTitle>Outbox</CardTitle>
            </CardHeader>
            <CardContent>
              {renderMessageList(outboxMessages)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {selectedListingId && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <MessageSystem listingId={selectedListingId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessageCenter;
