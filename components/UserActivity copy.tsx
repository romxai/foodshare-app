"use client";

import React, { useState, useEffect } from "react";
import { FoodListing } from "../types";
import { getCurrentUser } from "@/app/lib/auth";

const UserActivity: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserListings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const user = await getCurrentUser();
        if (!user) {
          throw new Error("User not authenticated");
        }

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("/api/user/listings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user listings");
        }

        const data = await response.json();
        setListings(data);
      } catch (err) {
        console.error("Error fetching user listings:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserListings();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Activity</h2>
      {listings.length === 0 ? (
        <p>You haven't posted any listings yet.</p>
      ) : (
        <ul className="space-y-4">
          {listings.map((listing) => (
            <li key={listing._id} className="border p-4 rounded-md">
              <h3 className="font-semibold">{listing.foodType}</h3>
              <p>Description: {listing.description}</p>
              <p>Quantity: {listing.quantity}</p>
              <p>Expiration: {formatDate(listing.expiration)}</p>
              <p>Location: {listing.location}</p>
              <p>Posted: {formatDate(listing.createdAt)}</p>
              <p>Status: {new Date(listing.expiration) > new Date() ? "Active" : "Expired"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserActivity;
