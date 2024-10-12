"use client";

import React, { useState, useEffect } from "react";
import { User, Message, FoodListing } from "../types";
import { getCurrentUser } from "../lib/auth";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { Paperclip, Mic, CornerDownLeft } from "lucide-react";

interface MessageSystemProps {
  listingId: string;
}

const MessageSystem: React.FC<MessageSystemProps> = ({ listingId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (!user) {
        window.location.href = "/login";
      } else {
        setCurrentUser(user);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings?id=${listingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch listing");
        }
        const data = await response.json();
        setListing(data);
      } catch (err) {
        console.error("Error fetching listing:", err);
        setError("Failed to load listing information");
      }
    };
    fetchListing();
  }, [listingId]);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/messages?listingId=${listingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [listingId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !listing) return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ listingId, content: newMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      const newMessageData = await response.json();
      setMessages(prevMessages => [...prevMessages, newMessageData]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!currentUser || !listing) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <ChatMessageList>
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.senderId === currentUser?.id ? "sent" : "received"}
            >
              <ChatBubbleAvatar fallback={message.senderName?.[0] || '?'} />
              <ChatBubbleMessage
                variant={
                  message.senderId === currentUser?.id ? "sent" : "received"
                }
              >
                <p className="font-bold">{message.senderName}</p>
                <p>{message.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </ChatBubbleMessage>
            </ChatBubble>
          ))
        )}
      </ChatMessageList>

      <form
        onSubmit={sendMessage}
        className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
      >
        <ChatInput
          placeholder="Type your message here..."
          className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <div className="flex items-center p-3 pt-0">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip className="size-4" />
            <span className="sr-only">Attach file</span>
          </Button>

          <Button variant="ghost" size="icon" type="button">
            <Mic className="size-4" />
            <span className="sr-only">Use Microphone</span>
          </Button>

          <Button size="sm" className="ml-auto gap-1.5" type="submit">
            Send Message
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageSystem;
