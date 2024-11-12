"use client";

import React, { useState, useEffect } from "react";
import { FoodListing, User } from "../types";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { CalendarDays, MapPin, Package, Clock, Trash2Icon } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ImageCarousel from "./ImageCarousel";
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
import Footer from "@/components/Footer";
import { ListingSkeleton } from "@/components/ui/ListingSkeleton";
import { useAuthCheck } from "@/utils/authCheck";
import { useAuthGuard } from "@/utils/authGuard";

const UserActivity: React.FC = () => {
  useAuthGuard();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

  const FoodListing = ({
    listing,
    index,
  }: {
    listing: FoodListing;
    index: number;
  }) => {
    const timeLeft = getTimeLeft(listing.expiration);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();
    const isExpired = timeLeft.value === "Expired";

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const handleListingClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }
      router.push(`/listing/${listing._id}`);
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.2 },
        }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleListingClick}
        className="bg-[#F9F3F0] rounded-xl overflow-hidden shadow-md transition-all duration-300 relative cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered
            ? `perspective(1000px) rotateX(${
                (mousePosition.y - 150) / 15
              }deg) rotateY(${(mousePosition.x - 400) / 15}deg)`
            : "none",
          boxShadow: isHovered
            ? "0 10px 20px rgba(0, 0, 0, 0.1)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        {isExpired && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center rounded-xl">
            <span className="text-white text-2xl font-bold">EXPIRED</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row h-auto md:h-48">
          {/* Image Section */}
          <div className="relative w-full h-48 md:w-72 md:h-48">
            {listing.imagePaths && listing.imagePaths.length > 0 ? (
              <ImageCarousel
                images={listing.imagePaths}
                onImageClick={() => {}}
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <Badge
              className={`absolute top-3 right-3 z-20 ${
                isExpired
                  ? "bg-red-100 text-red-800"
                  : timeLeft.unit === "hours"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              } px-3 py-1 rounded-full font-medium`}
            >
              <Clock className="w-3 h-3 inline-block mr-1" />
              {isExpired
                ? "Expired"
                : `${timeLeft.value} ${timeLeft.unit} left`}
            </Badge>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 md:p-6 flex flex-col justify-between relative">
            {/* Main Info */}
            <div>
              {/* Food Name - Updated font and formatting */}
              <h3 className="text-2xl font-[500] text-emerald-600 mb-1 font-['Funnel_Sans']">
                {listing.foodType
                  .split(" ")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}
              </h3>

              {/* Posted Date - Updated font and formatting */}
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-lg font-medium text-[#6B7280] font-['Verdana Pro Cond']">
                  Posted on{" "}
                  {new Date(listing.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons - Only visible on hover */}
            <div
              className={`absolute right-6 top-1/2 -translate-y-1/2 flex gap-4 transition-opacity duration-200 z-20 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <Button
                variant="outline"
                className="bg-[#1C716F] text-[#F9F3F0] hover:bg-[#065553] hover:text-[#F9F3F0] border-none font-['Verdana Pro Cond']"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick(listing);
                }}
              >
                Edit
              </Button>
              <Button
                className="bg-[#ADA8B3] text-[#F9F3F0] hover:bg-red-500 hover:text-white transition-colors duration-200 font-['Verdana Pro Cond']"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(listing._id);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ECFDED]">
      <Navbar user={currentUser} onLogout={handleLogout} />
      <div className="flex-1 pt-16">
        <div className="flex-1 overflow-auto p-6 bg-[#ECFDED]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <h1 className="text-3xl font-[500] text-[#065553] font-korolev mb-8 tracking-wide">
              Your Food Listings
            </h1>

            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[...Array(3)].map((_, index) => (
                  <ListingSkeleton key={index} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                You haven't posted any food listings yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {posts.map((post, index) => (
                  <FoodListing key={post._id} listing={post} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
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
      <Footer />
    </div>
  );
};

export default UserActivity;
