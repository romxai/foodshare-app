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
} from "@heroicons/react/24/outline";

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
      const diffTime = expiration.getTime() - now.getTime();
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffHours < 24) {
        return { value: diffHours, unit: 'hours' };
      } else {
        return { value: diffDays, unit: 'days' };
      }
    };

    const isNew = (createdAt: string) => {
      const now = new Date();
      const created = new Date(createdAt);
      const diffTime = now.getTime() - created.getTime();
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      return diffMinutes <= 30;
    };

    const timeLeft = getTimeLeft(listing.expiration);
    const listingIsNew = isNew(listing.createdAt);

    const getBadgeStyle = () => {
      if (listingIsNew) {
        return "bg-green-100 bg-opacity-60 text-green-800";
      } else if (timeLeft.unit === 'hours') {
        return "bg-red-100 bg-opacity-60 text-red-800";
      } else {
        return "bg-gray-200 text-gray-800";
      }
    };

    return (
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg rounded-md">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">
              {listing.foodType}
            </CardTitle>
            <Badge 
              variant="custom"
              className={`${getBadgeStyle()} rounded-md`}
            >
              {listingIsNew 
                ? "New" 
                : `${timeLeft.value} ${timeLeft.unit} left`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-gray-600 mb-4">{listing.description}</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm">
                Expires: {formatDate(listing.expiration)}
              </span>
            </div>
            <div className="flex items-center">
              <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm">{listing.location}</span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">
              {listing.quantity} {listing.quantityUnit}
            </span>
            <div className="flex items-center text-sm text-gray-500">
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
            className="w-full"
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

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Food Listings</h1>

      <form onSubmit={handleSearch} className="mb-4">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search food listings..."
          className="mb-2"
        />
        <Button type="submit" className="mr-2">
          Search
        </Button>
        <Button
          type="button"
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
        >
          {showAdvancedSearch ? "Hide Advanced Search" : "Advanced Search"}
        </Button>
      </form>

      {showAdvancedSearch && (
        <div className="mb-4">
          <AdvancedSearchForm onSearch={handleAdvancedSearch} />
        </div>
      )}

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!isLoading && !error && (
        <ul>
          {listings.map((listing) => (
            <li key={listing._id} className="mb-4 p-4 border rounded">
              <FoodListing listing={listing} />
            </li>
          ))}
        </ul>
      )}

      {user && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="mb-4">Create Listing</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Food Listing</DialogTitle>
            </DialogHeader>
            <CreateListingForm onListingCreated={fetchListings} />
          </DialogContent>
        </Dialog>
      )}

      {selectedListing && (
        <Dialog
          open={!!selectedListing}
          onOpenChange={() => setSelectedListing(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Message Seller</DialogTitle>
            </DialogHeader>
            <div>
              <p>Listing: {selectedListing.foodType}</p>
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="mb-2"
              />
              <Button onClick={sendMessage}>Send Message</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FoodListings;
