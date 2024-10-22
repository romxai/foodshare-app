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
import { Send, Menu, ChevronDown } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function Messages() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const scrollToBottom = useCallback(() => {
    if (!hasUserScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [hasUserScrolled]);

  useEffect(() => {
    if (messages.length > 0 && !hasUserScrolled) {
      scrollToBottom();
    }
  }, [messages, hasUserScrolled, scrollToBottom]);

  const fetchMessages = useCallback(
    async (conversationId: string) => {
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
            const sortedMessages = data.messages.sort(
              (a: Message, b: Message) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            );
            
            // Check if there are new messages
            const hasNewMessages = sortedMessages.length > messages.length ||
              (sortedMessages.length > 0 && messages.length > 0 &&
               sortedMessages[sortedMessages.length - 1]._id !== messages[messages.length - 1]._id);

            if (hasNewMessages || isInitialLoad) {
              setMessages(sortedMessages);
              setTimeout(scrollToBottom, 0);
              if (isInitialLoad) {
                setIsInitialLoad(false);
              }
            }
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
    },
    [isInitialLoad, scrollToBottom, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const sendMessage = async (e: React.FormEvent | React.KeyboardEvent) => {
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
        // Remove any scrolling behavior here
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
    setIsInitialLoad(true);
    fetchMessages(conversationId);
    router.push(`/messages?conversationId=${conversationId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const grouped: { [key: string]: Message[] } = {};
    messages.forEach((message) => {
      const date = formatDate(message.timestamp);
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(message);
    });
    return grouped;
  };

  const handleScroll = useCallback(() => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowJumpToBottom(!atBottom);
      setHasUserScrolled(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex ml-16">
        <div
          className={`${
            isMobile && !selectedConversation ? "w-full" : "w-full md:w-1/3"
          } ${
            isMobile && selectedConversation ? "hidden" : ""
          } border-r border-gray-800`}
        >
          <div className="p-4">
            <h2 className="text-xl font-bold text-green-400">Conversations</h2>
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
                      <AvatarImage src="" alt={conv.otherUser?.name} />
                      <AvatarFallback className="bg-gray-700">
                        {conv.otherUser?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-gray-200">
                        {conv.otherUser?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-400 truncate">
                        {conv.lastMessage?.content || "No messages"}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {conv.lastMessage?.timestamp
                        ? formatDate(conv.lastMessage.timestamp)
                        : "No timestamp"}
                    </div>
                  </div>
                </div>
                <Separator className="bg-gray-800" />
              </div>
            ))}
          </ScrollArea>
        </div>
        <div
          className={`${
            isMobile && !selectedConversation ? "hidden" : "flex-1"
          } flex flex-col`}
        >
          {selectedConversation ? (
            <>
              <ScrollArea
                className="flex-1 p-4"
                ref={scrollAreaRef}
                onScroll={handleScroll}
              >
                {Object.entries(groupMessagesByDate(messages)).map(
                  ([date, dateMessages]) => (
                    <div key={date}>
                      <div className="text-center my-4">
                        <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full text-sm">
                          {formatDate(date)}
                        </span>
                      </div>
                      {dateMessages.map((message) => (
                        <div
                          key={message._id}
                          className={`mb-4 flex ${
                            message.sender === currentUser?.id
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] min-w-[200px] p-3 rounded-lg ${
                              message.sender === currentUser?.id
                                ? "bg-green-800 text-white" // Darker green for sender (current user)
                                : "bg-gray-700 text-gray-100" // Grey-ish for receiver's messages
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            <p className="text-xs text-gray-300 mt-1 text-right">
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
              {showJumpToBottom && (
                <Button
                  className="absolute bottom-20 right-4 rounded-full p-2 bg-primary text-white hover:bg-primary/80"
                  onClick={() => {
                    scrollToBottom();
                    setHasUserScrolled(false);
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
              <form
                onSubmit={sendMessage}
                className="p-4 border-t border-gray-800"
              >
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400 rounded-md p-2 resize-none"
                    placeholder="Type a message..."
                    rows={5}
                    style={{ minHeight: "5rem", maxHeight: "15rem" }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="text-green-400 hover:text-green-300"
                  >
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
    </div>
  );
}
