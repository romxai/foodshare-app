"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FoodListing, User } from "../types";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { CalendarIcon, MapPinIcon, UserIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EditListingForm from './EditListingForm';

interface UserActivityProps {
  user: User;
}

const UserActivity: React.FC<UserActivityProps> = ({ user }) => {
  const [posts, setPosts] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const router = useRouter();
  const [editingListing, setEditingListing] = useState<FoodListing | null>(null);

  useEffect(() => {
    fetchActivity();
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleDeleteClick = (postId: string) => {
    setDeletingPostId(postId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPostId) return;

    try {
      const response = await fetch(`/api/listings?id=${deletingPostId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete listing');
      }

      setPosts(posts.filter(post => post._id !== deletingPostId));
    } catch (err) {
      console.error('Error deleting listing:', err);
      setError('Failed to delete listing');
    } finally {
      setDeleteConfirmOpen(false);
      setDeletingPostId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeLeft = (expirationDate: string) => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    if (expiration <= now) {
      return { value: "Expired", unit: "" };
    }
    const diffTime = expiration.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours <= 1) {
      return { value: "1", unit: "hour" };
    } else if (diffHours < 24) {
      return { value: diffHours, unit: "hours" };
    } else {
      return { value: diffDays, unit: "days" };
    }
  };

  const getBadgeStyle = (timeLeft: { value: string | number; unit: string }) => {
    if (timeLeft.value === "Expired") {
      return "bg-red-100 bg-opacity-60 text-red-800";
    } else if (timeLeft.unit === "hour" || timeLeft.unit === "hours") {
      return "bg-red-100 bg-opacity-60 text-red-800";
    } else {
      return "bg-gray-200 text-gray-800";
    }
  };

  const handleEditClick = (listing: FoodListing) => {
    setEditingListing(listing);
  };

  const handleListingUpdated = () => {
    fetchActivity();
    setEditingListing(null);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 overflow-auto p-8">
        <h1 className="text-3xl font-bold mb-8 text-green-400">Your Food Listings</h1>
        {posts.length === 0 ? (
          <p>You haven't posted any food listings yet.</p>
        ) : (
          posts.map((post) => {
            const timeLeft = getTimeLeft(post.expiration);
            const isExpired = timeLeft.value === "Expired";
            return (
              <Card 
                key={post._id} 
                className={`mb-6 bg-gray-800 text-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-lg rounded-md group relative ${
                  isExpired ? 'opacity-75' : ''
                }`}
              >
                {isExpired && (
                  <div className="absolute inset-0 bg-gray-900 opacity-50 pointer-events-none"></div>
                )}
                <CardHeader className="p-4 border-b border-gray-700">
                  <div className="flex justify-between items-start">
                    <CardTitle className={`text-xl font-bold ${isExpired ? 'text-gray-400' : 'text-green-400'}`}>
                      {post.foodType}
                    </CardTitle>
                    <Badge variant="custom" className={`${getBadgeStyle(timeLeft)} rounded-md`}>
                      {timeLeft.value === "Expired"
                        ? "Expired"
                        : `${timeLeft.value} ${timeLeft.unit} left`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 relative">
                  <p className="text-gray-300 mb-4">{post.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-300">
                        Expires: {formatDate(post.expiration)}
                      </span>
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
                      Posted: {formatDate(post.createdAt)}
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
                          className="rounded-md object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gray-800 bg-opacity-90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => handleEditClick(post)}
                      >
                        Edit Listing
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteClick(post._id)}
                      >
                        Delete Listing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your food listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {editingListing && (
        <Dialog open={!!editingListing} onOpenChange={() => setEditingListing(null)}>
          <DialogContent className="bg-gray-800 text-gray-100">
            <DialogHeader>
              <DialogTitle>Edit Food Listing</DialogTitle>
            </DialogHeader>
            <EditListingForm
              listing={editingListing}
              onListingUpdated={handleListingUpdated}
              onClose={() => setEditingListing(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserActivity;
