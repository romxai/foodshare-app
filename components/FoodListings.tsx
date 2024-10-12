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
import CreateListingForm from "@/components/CreateListingForm";
import { getCurrentUser } from "../lib/auth";
import MessageSystem from './MessageSystem';

const FoodListings: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [search, setSearch] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);

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
      });
      const response = await fetch(`/api/listings?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }
      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      setError("Failed to fetch listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchListings(search);
  };

  const handleAdvancedSearch = (params: any) => {
    fetchListings(search, params);
    setShowAdvancedSearch(false);
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
              <h3 className="font-bold">{listing.foodType}</h3>
              <p>{listing.description}</p>
              <p>Quantity: {listing.quantity}</p>
              <p>Expiration: {formatDate(listing.expiration)}</p>
              <p>Location: {listing.location}</p>
              <p>Posted: {new Date(listing.createdAt).toLocaleString()}</p>
              <p>Posted By: {listing.postedBy}</p>
              <Button onClick={() => setSelectedListingId(listing._id)}>
                Contact Seller
              </Button>
            </li>
          ))}
        </ul>
      )}

      {selectedListingId && (
        <Dialog open={!!selectedListingId} onOpenChange={() => setSelectedListingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Message Seller</DialogTitle>
            </DialogHeader>
            <MessageSystem listingId={selectedListingId} />
          </DialogContent>
        </Dialog>
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
    </div>
  );
};

export default FoodListings;
