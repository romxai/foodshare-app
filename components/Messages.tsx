"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getCurrentUser } from "../lib/auth";
import { User, Message, Conversation } from "../types";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Menu } from "lucide-react";

export default function Messages() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      } else {
        router.push("/login");
      }
    };
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser]);

  useEffect(() => {
    const conversationId = searchParams.get("conversationId");
    if (conversationId) {
      setSelectedConversation(conversationId);
      fetchMessages(conversationId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation);
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        console.error("Failed to fetch conversations:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/chat?conversationId=${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data.conversation) {
          setSelectedConversation(data.conversation._id);
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      } else if (response.status === 404) {
        console.log("No messages found for this conversation");
        setMessages([]);
      } else {
        console.error("Failed to fetch messages:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      const response = await fetch(`/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: newMessage,
          conversationId: selectedConversation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
        setNewMessage("");
        fetchConversations();
      } else {
        console.error("Failed to send message:", data.error);
        if (response.status === 404) {
          await fetchConversations();
          alert(
            "The conversation could not be found. Please try selecting it again."
          );
        } else {
          alert(`Failed to send message: ${data.error}`);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message");
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
    router.push(`/messages?conversationId=${conversationId}`);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="w-1/3 border-r border-gray-700">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Conversations</h2>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          {conversations.map((conv) => (
            <div key={conv._id}>
              <div
                className={`p-4 cursor-pointer hover:bg-gray-800 transition-colors ${
                  selectedConversation === conv._id ? "bg-gray-800" : ""
                }`}
                onClick={() => handleConversationSelect(conv._id)}
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage alt={conv.otherUser?.name} />
                    <AvatarFallback>
                      {conv.otherUser?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {conv.otherUser?.name || "Unknown User"}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {conv.lastMessage?.content || "No messages"}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {conv.lastMessage?.timestamp
                      ? new Date(conv.lastMessage.timestamp).toLocaleString()
                      : "No timestamp"}
                  </div>
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <ScrollArea className="flex-1 p-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 flex ${
                    message.sender === currentUser?.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === currentUser?.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(message.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>
            <form
              onSubmit={sendMessage}
              className="p-4 border-t border-gray-700"
            >
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-gray-800 border-gray-700 text-white"
                  placeholder="Type a message..."
                />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
