"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodListing, User } from "../types";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import FullScreenImage from "./FullScreenImage";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  MenuIcon,
  SearchIcon,
  PlusIcon,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CreateListingForm = dynamic(
  () => import("@/components/CreateListingForm"),
  { ssr: false }
);

const FoodListings: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [search, setSearch] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(
    null
  );
  const [newMessage, setNewMessage] = useState("");
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  const fetchListings = useCallback(
    async (searchQuery: string = "", advancedParams: any = {}) => {
      try {
        const queryParams = new URLSearchParams({
          search: searchQuery,
          ...advancedParams,
        });
        console.log(
          "Fetching listings with query params:",
          queryParams.toString()
        );
        const response = await fetch(`/api/listings?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch listings");
        }
        const data = await response.json();
        console.log("Fetched listings:", data);
        setListings(data);

        // Fetch users for all unique postedBy IDs
        const userIds = Array.from(
          new Set(data.map((listing: FoodListing) => listing.postedBy))
        );
        const usersResponse = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userIds }),
        });
        if (!usersResponse.ok) {
          throw new Error("Failed to fetch users");
        }
        const usersData = await usersResponse.json();
        const usersMap = usersData.reduce(
          (acc: { [key: string]: User }, user: User) => {
            acc[user._id] = user;
            return acc;
          },
          {}
        );
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError("Failed to fetch listings");
      }
    },
    []
  );

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      fetchListings(search);
    },
    [search, fetchListings]
  );

  const handleAdvancedSearch = useCallback(
    (params: any) => {
      fetchListings(search, params);
    },
    [search, fetchListings]
  );

  const handleMessageSeller = useCallback((listing: FoodListing) => {
    setSelectedListing(listing);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!selectedListing || !newMessage.trim() || !user) return;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          content: newMessage,
          recipientId: selectedListing.postedBy,
          listingId: selectedListing._id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewMessage("");
        setSelectedListing(null);
        router.push(`/messages?conversationId=${data.conversation._id}`);
      } else {
        console.error("Failed to send message:", data.error);
        alert(`Failed to send message: ${data.error}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message. Please try again.");
    }
  }, [selectedListing, newMessage, user, router]);

  const getTimeLeft = useCallback((expirationDate: string) => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return { value: diffHours, unit: "hours" };
    } else {
      return { value: diffDays, unit: "days" };
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }, []);

  const getBadgeStyle = (timeLeft: { value: number; unit: string }) => {
    if (timeLeft.unit === "hours") {
      return "bg-yellow-500 text-black";
    } else {
      return "bg-green-500 text-white";
    }
  };

  const FoodListing = ({ listing }: { listing: FoodListing }) => {
    const postedByUser = users[listing.postedBy];
    const isOwnListing = !!(user && listing.postedBy === user.id);
    const timeLeft = getTimeLeft(listing.expiration);

    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
        <div className="relative h-48">
          {listing.imagePaths && listing.imagePaths.length > 0 ? (
            <Carousel className="w-full h-full">
              <CarouselContent>
                {listing.imagePaths.map((imagePath, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-48 w-full">
                      <Image
                        src={
                          imagePath.startsWith("/")
                            ? imagePath
                            : `/${imagePath}`
                        }
                        alt={`${listing.foodType} - Image ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 hover:scale-110"
                        onClick={() =>
                          setFullScreenImage(
                            imagePath.startsWith("/")
                              ? imagePath
                              : `/${imagePath}`
                          )
                        }
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {listing.imagePaths.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
          <Badge
            className={`absolute top-2 right-2 z-10 ${getBadgeStyle(
              timeLeft
            )} px-2 py-1 text-xs font-semibold rounded-full`}
          >
            {`${timeLeft.value} ${timeLeft.unit} left`}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="text-xl font-bold text-green-400 mb-2">
            {listing.foodType}
          </h3>
          <p className="text-gray-300 mb-4 line-clamp-2">
            {listing.description}
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div className="flex items-center text-gray-400">
              <CalendarIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(listing.expiration)}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{listing.location}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <UserIcon className="h-4 w-4 mr-1" />
              <span>{postedByUser ? postedByUser.name : "Unknown"}</span>
            </div>
            <div className="text-gray-200 font-semibold">
              {listing.quantity} {listing.quantityUnit}
            </div>
          </div>
          <Button
            onClick={() => handleMessageSeller(listing)}
            className={`w-full ${
              isOwnListing
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-green-700 text-white hover:bg-green-800"
            }`}
            disabled={isOwnListing}
          >
            {isOwnListing ? "Your Listing" : "Message Seller"}
          </Button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        await fetchListings();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      // Cleanup function
      setListings([]);
      setUser(null);
      setError(null);
    };
  }, [fetchListings]);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 overflow-auto p-4 ml-16">
        <h1 className="text-3xl font-bold mb-8 text-green-400">
          Food Listings
        </h1>

        {/* Search and Advanced Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food listings..."
                className="w-full pl-10 bg-gray-800 border-gray-700 text-gray-100 focus:border-green-400"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
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
              {showAdvancedSearch ? "Hide Advanced Search" : "Advanced Search"}
            </Button>
          </div>
        </form>
        {showAdvancedSearch && (
          <div className="mb-8 bg-gray-800 p-6 rounded-lg">
            <AdvancedSearchForm onSearch={handleAdvancedSearch} />
          </div>
        )}

        {/* Listings */}
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <>
            {listings.length === 0 ? (
              <p>No active listings available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <FoodListing key={listing._id} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}

        {user && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-green-700 text-white hover:bg-green-800">
                <PlusIcon className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 text-gray-100 sm:max-w-[425px] max-w-[90vw] w-full">
              <DialogHeader>
                <DialogTitle className="text-green-400">
                  Create New Food Listing
                </DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto">
                <CreateListingForm
                  onListingCreated={fetchListings}
                  onClose={() => {}}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
        {selectedListing && (
          <Dialog
            open={!!selectedListing}
            onOpenChange={() => setSelectedListing(null)}
          >
            <DialogContent className="bg-gray-800 text-gray-100 sm:max-w-[425px] max-w-[90vw] w-full">
              <DialogHeader>
                <DialogTitle className="text-green-400">
                  Message Seller
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Send a message to the seller about this listing.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <p className="mb-2">Listing: {selectedListing.foodType}</p>
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="bg-gray-700 text-gray-100 border-gray-600 focus:border-green-400"
                />
                <Button
                  onClick={sendMessage}
                  className="w-full bg-green-700 text-white hover:bg-green-800"
                >
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {fullScreenImage && (
          <FullScreenImage
            src={fullScreenImage}
            alt="Full screen image"
            onClose={() => setFullScreenImage(null)}
          />
        )}
      </div>
    </div>
  );
};

export default FoodListings;
