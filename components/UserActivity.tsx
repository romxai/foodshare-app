"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FoodListing, User } from "../types";

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
            <ul className="space-y-2">
              {posts.map((post) => (
                <li key={post._id} className="border-b pb-2">
                  <h3 className="font-semibold">{post.foodType}</h3>
                  <p>{post.description}</p>
                  <p>Quantity: {post.quantity}</p>
                  <p>Expires: {new Date(post.expiration).toLocaleDateString()}</p>
                  <p>Location: {post.location}</p>
                  <p>Status: {isExpired(post.expiration) ? 'Expired' : 'Active'}</p>
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
