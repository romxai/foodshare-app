"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodListing } from "../types";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import FullScreenImage from "./FullScreenImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  MenuIcon,
  HomeIcon,
  MessageSquareIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

const CreateListingForm = dynamic(
  () => import("@/components/CreateListingForm"),
  {
    ssr: false,
  }
);

const FoodListings: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [search, setSearch] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const fetchListings = async (
    searchTerm: string = "",
    advancedParams: any = {}
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        search: searchTerm,
        ...advancedParams,
        userId: user?.id || "",
      });
      const response = await fetch(`/api/listings?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      const data = await response.json();
      console.log("Fetched listings:", data);
      const processedListings = data.map((listing: FoodListing) => {
        const isOwnListing = listing.postedBy === user?.id;
        console.log(
          `Listing ${listing._id} - postedBy: ${listing.postedBy}, user.id: ${user?.id}, isOwnListing: ${isOwnListing}`
        );
        return {
          ...listing,
          isOwnListing,
        };
      });
      setListings(processedListings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setError("Failed to fetch listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(search);
  };

  const handleAdvancedSearch = (params: any) => {
    fetchListings(search, params);
    setShowAdvancedSearch(false);
  };

  const handleMessageSeller = (listing: FoodListing) => {
    setSelectedListing(listing);
  };

  const sendMessage = async () => {
    if (!selectedListing || !newMessage.trim() || !user) return;

    try {
      console.log("Sending message to:", selectedListing.postedBy);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: newMessage,
          recipientId: selectedListing.postedById, // Use postedById instead of postedBy
          listingId: selectedListing._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewMessage("");
        setSelectedListing(null);
        router.push(`/messages?conversationId=${data.conversation._id}`);
      } else {
        console.error("Failed to send message:", data.error, data.details);
        alert(`Failed to send message: ${data.error}. ${data.details || ""}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message. Please try again.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
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

  const FoodListing = ({ listing }: { listing: FoodListing }) => {
    console.log("Listing:", listing);
    console.log("Current user ID:", user?.id);
    const isOwnListing = listing.postedById === user?.id;
    console.log("Is own listing:", isOwnListing);

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

    const timeLeft = getTimeLeft(listing.expiration);

    const getBadgeStyle = () => {
      if (timeLeft.value === "Expired") {
        return "bg-red-100 bg-opacity-60 text-red-800";
      } else if (timeLeft.unit === "hour" || timeLeft.unit === "hours") {
        return "bg-red-100 bg-opacity-60 text-red-800";
      } else {
        return "bg-gray-200 text-gray-800";
      }
    };

    return (
      <Card className="bg-gray-800 text-gray-100 overflow-hidden transition-shadow duration-300 hover:shadow-lg rounded-md border-gray-700">
        <CardHeader className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold text-green-400">
              {listing.foodType}
            </CardTitle>
            <Badge variant="custom" className={`${getBadgeStyle()} rounded-md`}>
              {timeLeft.value === "Expired"
                ? "Expired"
                : `${timeLeft.value} ${timeLeft.unit} left`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-gray-300 mb-4">{listing.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-300">
                Expires: {formatDate(listing.expiration)}
              </span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-300">{listing.location}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-200">
              {listing.quantity} {listing.quantityUnit}
            </span>
            <div className="flex items-center text-sm text-gray-400">
              <UserIcon className="h-4 w-4 mr-1" />
              {listing.postedBy || "Unknown"}
            </div>
          </div>
          {listing.imagePaths && listing.imagePaths.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {listing.imagePaths.map((path, index) => (
                <Image
                  key={index}
                  src={path.startsWith("/") ? path : `/${path}`}
                  alt={`${listing.foodType} - Image ${index + 1}`}
                  width={80}
                  height={80}
                  className="rounded-md object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() =>
                    setFullScreenImage(path.startsWith("/") ? path : `/${path}`)
                  }
                  onError={() => {
                    console.error(
                      `Error loading image ${index + 1} for ${listing.foodType}`
                    );
                  }}
                />
              ))}
            </div>
          )}
          <Button
            onClick={() => handleMessageSeller(listing)}
            className="w-full bg-green-700 text-white hover:bg-green-800"
            disabled={isOwnListing}
          >
            {isOwnListing ? "Your Listing" : "Message Seller"}
          </Button>
        </CardContent>
        {fullScreenImage && (
          <FullScreenImage
            src={fullScreenImage}
            alt={listing.foodType}
            onClose={() => setFullScreenImage(null)}
          />
        )}
      </Card>
    );
  };

  useEffect(() => {
    //console.log("Current listings:", listings);
  }, [listings]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-green-400">
            Food Listings
          </h1>

          <form onSubmit={handleSearch} className="mb-8">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food listings..."
              className="mb-4 bg-gray-800 border-gray-700 text-gray-100 focus:border-green-400"
            />
            <div className="flex space-x-4">
              <Button
                type="submit"
                className="bg-green-700 text-white hover:bg-green-800"
              >
                Search
              </Button>
              <Button
                type="button"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="bg-gray-700 text-white hover:bg-gray-600"
              >
                {showAdvancedSearch
                  ? "Hide Advanced Search"
                  : "Advanced Search"}
              </Button>
            </div>
          </form>

          {showAdvancedSearch && (
            <div className="mb-8 bg-gray-800 p-6 rounded-lg">
              <AdvancedSearchForm onSearch={handleAdvancedSearch} />
            </div>
          )}

          {isLoading && <p className="text-gray-400">Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!isLoading && !error && (
            <>
              {listings.length === 0 ? (
                <p className="text-center text-gray-400 mt-8">
                  No listings available
                </p>
              ) : (
                <ul className="space-y-8">
                  {listings.map((listing) => (
                    <li key={listing._id}>
                      <FoodListing listing={listing} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {user && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="mt-8 bg-green-700 text-white hover:bg-green-800">
                  Create Listing
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 text-gray-100">
                <DialogHeader>
                  <DialogTitle className="text-green-400">
                    Create New Food Listing
                  </DialogTitle>
                </DialogHeader>
                <CreateListingForm
                  onListingCreated={fetchListings}
                  onClose={() => {}}
                />
              </DialogContent>
            </Dialog>
          )}

          {selectedListing && (
            <Dialog
              open={!!selectedListing}
              onOpenChange={() => setSelectedListing(null)}
            >
              <DialogContent className="bg-gray-800 text-gray-100">
                <DialogHeader>
                  <DialogTitle className="text-green-400">
                    Message Seller
                  </DialogTitle>
                </DialogHeader>
                <div>
                  <p className="mb-4">Listing: {selectedListing.foodType}</p>
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="mb-4 bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
                  />
                  <Button
                    onClick={sendMessage}
                    className="bg-green-700 text-white hover:bg-green-800"
                  >
                    Send Message
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodListings;
