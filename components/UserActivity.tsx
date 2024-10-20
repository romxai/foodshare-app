"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodListing, User } from "../types";
import Image from "next/image";

interface UserActivityProps {
  user: User;
}

const UserActivity: React.FC<UserActivityProps> = ({ user }) => {
  const [posts, setPosts] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            <ul className="space-y-4">
              {posts.map((post) => (
                <li key={post._id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg">{post.foodType}</h3>
                    <span className={`text-sm px-2 py-1 rounded ${isExpired(post.expiration) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {isExpired(post.expiration) ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{post.description}</p>
                  <p className="mt-2"><span className="font-semibold">Quantity:</span> {post.quantity}</p>
                  <p><span className="font-semibold">Expiration:</span> {formatDate(post.expiration)}</p>
                  <p><span className="font-semibold">Location:</span> {post.location}</p>
                  <p className="text-sm text-gray-500 mt-2">Posted: {new Date(post.createdAt).toLocaleString()}</p>
                  {post.imagePaths && post.imagePaths.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {post.imagePaths.map((path, index) => (
                        <Image
                          key={index}
                          src={path.startsWith("/") ? path : `/${path}`}
                          alt={`${post.foodType} - Image ${index + 1}`}
                          width={100}
                          height={100}
                          className="rounded-md object-cover"
                          loading="lazy"
                          onError={() => {
                            console.error(`Error loading image ${index + 1} for ${post.foodType}`);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivity;
