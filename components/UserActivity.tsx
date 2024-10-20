"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodListing, User } from "../types";
import Image from "next/image";
import FullScreenImage from './FullScreenImage';
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MapPinIcon, UserIcon } from "@heroicons/react/24/outline";

interface UserActivityProps {
  user: User;
}

const UserActivity: React.FC<UserActivityProps> = ({ user }) => {
  const [posts, setPosts] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Food Listings</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p>You haven't posted any food listings yet.</p>
          ) : (
            <ul className="space-y-6">
              {posts.map((post) => (
                <li key={post._id}>
                  <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-bold">{post.foodType}</CardTitle>
                        <Badge variant={isExpired(post.expiration) ? "destructive" : "default"}>
                          {isExpired(post.expiration) ? 'Expired' : 'Active'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-gray-600 mb-4">{post.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm">Expires: {formatDate(post.expiration)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm">{post.location}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">
                          {post.quantity} {post.quantityUnit}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
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
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
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
