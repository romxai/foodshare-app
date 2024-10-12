"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserEmail, updateUserPassword } from "../app/lib/auth";

interface FoodListing {
  _id: string;
  foodType: string;
  description: string;
  quantity: string;
  expiration: Date;
  location: string;
}

interface ContactHistory {
  // Define the structure of contact history when you implement it
}

interface User {
  _id: string;
  email: string;
  // ... other user properties ...
}

interface UserActivityProps {
  user: User;
}

const UserActivity: React.FC<UserActivityProps> = ({ user }) => {
  const [posts, setPosts] = useState<FoodListing[]>([]);
  const [contactHistory, setContactHistory] = useState<ContactHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('/api/auth/activity', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch activity');
        const data = await response.json();
        setPosts(data.posts);
        setContactHistory(data.contactHistory);
      } catch (err) {
        console.error('Error fetching activity:', err);
        setError('Failed to load activity data');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserEmail(user._id, newEmail);
      setUpdateMessage('Email updated successfully');
      setNewEmail('');
    } catch (error) {
      console.error('Error updating email:', error);
      setUpdateMessage('Failed to update email');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserPassword(user._id, newPassword);
      setUpdateMessage('Password updated successfully');
      setNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setUpdateMessage('Failed to update password');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact History</CardTitle>
        </CardHeader>
        <CardContent>
          {contactHistory.length === 0 ? (
            <p>No contact history available.</p>
          ) : (
            <ul>
              {/* Implement contact history display when you have the data structure */}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange}>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="New Email"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Update Email
            </button>
            <p className="text-red-500">{updateMessage}</p>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Update Password
            </button>
            <p className="text-red-500">{updateMessage}</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserActivity;
