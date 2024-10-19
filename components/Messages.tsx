"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { getCurrentUser } from "../lib/auth";
import { User, Message, Conversation } from "../types";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const Messages: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
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
      fetchAvailableUsers();
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

  const fetchAvailableUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data);
      } else {
        console.error("Failed to fetch available users");
      }
    } catch (error) {
      console.error("Error fetching available users:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/chat", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(
          "Fetched conversations:",
          data.map((conv: Conversation) => conv._id)
        );
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
      const response = await fetch(`/api/chat?conversationId=${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched messages:", data);
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

  const initiateChat = async (userId: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ recipientId: userId }),
      });
      if (response.ok) {
        const data = await response.json();
        setConversations([...conversations, data]);
        setSelectedConversation(data._id);
        router.push(`/messages?conversationId=${data._id}`);
      }
    } catch (error) {
      console.error("Error initiating chat:", error);
    }
  };

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
          alert("The conversation could not be found. Please try selecting it again.");
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
    console.log("Selected conversation:", conversationId);
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
    router.push(`/messages?conversationId=${conversationId}`);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <div className="w-1/3 border-r">
        <h2 className="text-xl font-bold p-4">Conversations</h2>
        <ul>
          {conversations.map((conv) => (
            <li
              key={conv._id}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                selectedConversation === conv._id ? "bg-gray-200" : ""
              }`}
              onClick={() => handleConversationSelect(conv._id)}
            >
              <div className="font-bold">
                {conv.otherUser?.name || "Unknown User"}
              </div>
              <div className="text-sm text-gray-500">
                {conv.lastMessage?.content || "No messages"}
              </div>
              <div className="text-xs text-gray-400">
                {conv.lastMessage?.timestamp
                  ? new Date(conv.lastMessage.timestamp).toLocaleString()
                  : "No timestamp"}
              </div>
            </li>
          ))}
        </ul>
        <h2 className="text-xl font-bold p-4 mt-4">Available Users</h2>
        <ul>
          {availableUsers.map((user) => (
            <li key={user.id} className="p-4 flex justify-between items-center">
              <span>{user.name}</span>
              <Button onClick={() => initiateChat(user.id)}>Chat</Button>
            </li>
          ))}
        </ul>
      </div>
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 ${
                    message.sender === currentUser?.id ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-2 rounded-lg ${
                      message.sender === currentUser?.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(message.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="p-4 border-t">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Type a message..."
              />
              <Button type="submit" className="mt-2">
                Send
              </Button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              Select a conversation or start a new chat
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
