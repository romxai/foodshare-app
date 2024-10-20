"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodListing, User } from "../types";
import Image from "next/image";
import FullScreenImage from './FullScreenImage';
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, UserIcon, HomeIcon, MessageSquareIcon, SettingsIcon, LogOutIcon, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";

interface UserActivityProps {
  user: User;
}

const UserActivity: React.FC<UserActivityProps> = ({ user }) => {
  const [posts, setPosts] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/user/listings', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch activity');
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date < now) {
      return "Listing expired";
    }

    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (diffDays < 2) {
      if (diffHours <= 1) {
        return `${formattedDate} ${formattedTime} (expiring in less than an hour)`;
      } else {
        return `${formattedDate} ${formattedTime} (${diffHours} hrs left)`;
      }
    } else {
      return `${formattedDate} ${formattedTime} (${diffDays} days left)`;
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-white">{error}</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-gray-800 transition-all duration-300 ease-in-out`}
      >
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <MenuIcon className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-8">
          <ul className="space-y-2">
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/")}>
                <HomeIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Home"}
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/messages")}>
                <MessageSquareIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Messages"}
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/account")}>
                <SettingsIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Account"}
              </Button>
            </li>
            <li>
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOutIcon className="h-5 w-5 mr-2" />
                {sidebarOpen && "Logout"}
              </Button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-green-400">Your Food Listings</h1>
        <ScrollArea className="h-[calc(100vh-10rem)]">
          {posts.length === 0 ? (
            <p className="text-gray-400">You haven't posted any food listings yet.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Card key={post._id} className="bg-gray-800 text-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-lg rounded-md border-gray-700">
                  <CardHeader className="p-4 border-b border-gray-700">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold text-green-400">{post.foodType}</CardTitle>
                      <Badge variant={isExpired(post.expiration) ? "destructive" : "default"}>
                        {isExpired(post.expiration) ? 'Expired' : 'Active'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <p className="text-gray-300 mb-4">{post.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-300">Expires: {formatDate(post.expiration)}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-300">{post.location}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-200">
                        {post.quantity} {post.quantityUnit}
                      </span>
                      <div className="flex items-center text-sm text-gray-400">
                        <UserIcon className="h-4 w-4 mr-1" />
                        Posted: {new Date(post.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {post.imagePaths && post.imagePaths.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.imagePaths.map((path, index) => (
                          <Image
                            key={index}
                            src={path.startsWith("/") ? path : `/${path}`}
                            alt={`${post.foodType} - Image ${index + 1}`}
                            width={80}
                            height={80}
                            className="rounded-md object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                            onClick={() => setFullScreenImage(path.startsWith("/") ? path : `/${path}`)}
                            onError={() => {
                              console.error(`Error loading image ${index + 1} for ${post.foodType}`);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      {fullScreenImage && (
        <FullScreenImage
          src={fullScreenImage}
          alt="Food listing image"
          onClose={() => setFullScreenImage(null)}
        />
      )}
    </div>
  );
};

export default UserActivity;
