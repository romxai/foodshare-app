"use client";

import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditListingForm from "./EditListingForm";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface UserActivityProps {
}

const UserActivity: React.FC<UserActivityProps> = () => {
  const [posts, setPosts] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const router = useRouter();
  const [editingListing, setEditingListing] = useState<FoodListing | null>(
    null
  );
  
  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/listings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch activity");
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error("Error fetching activity:", err);
      setError("Failed to load activity data");
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
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }

      setPosts(posts.filter((post) => post._id !== deletingPostId));
    } catch (err) {
      console.error("Error deleting listing:", err);
      setError("Failed to delete listing");
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

  const getBadgeStyle = (timeLeft: {
    value: string | number;
    unit: string;
  }) => {
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
      <div className="flex-1 overflow-auto p-8 ml-16">
        {" "}
        {/* Added ml-16 for sidebar width */}
        <h1 className="text-3xl font-bold mb-8 text-green-400">
          Your Food Listings
        </h1>
        {posts.length === 0 ? (
          <p>You haven't posted any food listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const timeLeft = getTimeLeft(post.expiration);
              return (
                <div
                  key={post._id}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
                >
                  <div className="relative h-48">
                    {post.imagePaths && post.imagePaths.length > 0 ? (
                      <Carousel className="w-full h-full">
                        <CarouselContent>
                          {post.imagePaths.map((imagePath, index) => (
                            <CarouselItem key={index}>
                              <div className="relative h-48 w-full">
                                <Image
                                  src={
                                    imagePath.startsWith("/")
                                      ? imagePath
                                      : `/${imagePath}`
                                  }
                                  alt={`${post.foodType} - Image ${index + 1}`}
                                  layout="fill"
                                  objectFit="cover"
                                  className="transition-transform duration-300 hover:scale-110"
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {post.imagePaths.length > 1 && (
                          <>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                          </>
                        )}
                      </Carousel>
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-500">
                          No image available
                        </span>
                      </div>
                    )}
                    <Badge
                      className={`absolute top-2 right-2 z-10 ${getBadgeStyle(
                        timeLeft
                      )} px-2 py-1 text-xs font-semibold rounded-full`}
                    >
                      {timeLeft.value === "Expired"
                        ? "Expired"
                        : `${timeLeft.value} ${timeLeft.unit} left`}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-green-400 mb-2">
                      {post.foodType}
                    </h3>
                    <p className="text-gray-300 mb-4 line-clamp-2">
                      {post.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div className="flex items-center text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(post.expiration)}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{post.location}</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <UserIcon className="h-4 w-4 mr-1" />
                        <span>Posted by you</span>
                      </div>
                      <div className="text-gray-200 font-semibold">
                        {post.quantity} {post.quantityUnit}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleEditClick(post)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDeleteClick(post._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              food listing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {editingListing && (
        <Dialog
          open={!!editingListing}
          onOpenChange={() => setEditingListing(null)}
        >
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
