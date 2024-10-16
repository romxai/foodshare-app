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
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from "@/lib/auth";

const CreateListingForm = dynamic(() => import('@/components/CreateListingForm'), {
  ssr: false,
});

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
      //console.log("Fetched listings:", data); // Add this line to log the fetched data
      // Filter out user's own listings on the client side
      const filteredListings = data.filter(
        (listing: FoodListing) => listing.postedBy !== user?.id
      );
      setListings(filteredListings);
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
      //  console.log("Sending message:", {
      //  content: newMessage,
      //  recipientId: selectedListing.postedBy,
      //  listingId: selectedListing._id,
      //  });

      // Fetch the recipient's ID based on their username
      const userResponse = await fetch(
        `/api/users?username=${selectedListing.postedBy}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!userResponse.ok) {
        throw new Error("Failed to fetch recipient user information");
      }

      const userData = await userResponse.json();
      if (!userData || !userData.id) {
        throw new Error("Invalid recipient user data");
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: newMessage,
          recipientId: userData.id,
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
    //console.log("Rendering listing:", listing);

    return (
      <div>
        <h3 className="font-bold">{listing.foodType}</h3>
        <p>{listing.description}</p>
        <p>Quantity: {listing.quantity}</p>
        <p>Expiration: {formatDate(listing.expiration)}</p>
        <p>Location: {listing.location}</p>
        <p>Posted: {new Date(listing.createdAt).toLocaleString()}</p>
        <p>Posted By: {listing.postedBy}</p>
        {listing.imagePaths && listing.imagePaths.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {listing.imagePaths.map((path, index) => (
              <Image
                key={index}
                src={path.startsWith('/') ? path : `/${path}`}
                alt={`${listing.foodType} - Image ${index + 1}`}
                width={100}
                height={100}
                objectFit="cover"
                loading="lazy"
                onError={() => {
                  console.error(`Error loading image ${index + 1} for ${listing.foodType}`);
                }}
              />
            ))}
          </div>
        )}
        <Button
          onClick={() => handleMessageSeller(listing)}
          className="mt-2"
        >
          Message Seller
        </Button>
      </div>
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
