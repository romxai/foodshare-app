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
  MenuIcon,
  SearchIcon,
  PlusIcon,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import {
  CalendarDays,
  MapPin,
  User as UserIcon,
  Search,
  Plus,
  Clock,
  Package,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ImageCarousel from "./ImageCarousel";
import Footer from "@/components/Footer";
import { ListingSkeleton } from "@/components/ui/ListingSkeleton";
import { useAuthCheck } from "@/utils/authCheck";
import { useAuthGuard } from "@/utils/authGuard";

const CreateListingForm = dynamic(
  () => import("@/components/CreateListingForm"),
  { ssr: false }
);

const DonateButton = () => {
  const [isDonateButtonHovered, setIsDonateButtonHovered] = useState(false);
  const router = useRouter();

  return (
    <motion.div
      initial={{ width: "3.5rem" }}
      whileHover={{
        width: "12rem",
        transition: { duration: 0.2 },
      }}
      className="fixed bottom-6 right-6 h-14 shadow-lg bg-emerald-600 hover:bg-emerald-700 rounded-full flex items-center justify-end overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsDonateButtonHovered(true)}
      onMouseLeave={() => setIsDonateButtonHovered(false)}
      onClick={() => router.push("/create-listing")}
    >
      <span className="text-white font-medium absolute left-6 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        Donate Food
      </span>
      <motion.div
        className="flex items-center justify-center w-14 relative"
        animate={{ rotate: isDonateButtonHovered ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <Plus className="h-6 w-6 text-white" />
      </motion.div>
    </motion.div>
  );
};

const FoodListings: React.FC = () => {
  useAuthGuard();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [users, setUsers] = useState<{ [key: string]: User }>({});
  const [search, setSearch] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const router = useRouter();

  // Add state for unique locations
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);

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

        // Extract and set unique locations from the fetched listings
        const locations = Array.from(
          new Set(data.map((listing: FoodListing) => listing.location))
        ).sort() as string[];
        setUniqueLocations(locations);

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

  const handleAdvancedSearch = async (params: any) => {
    try {
      setIsLoading(true);
      let queryString = "";

      // Build query string based on provided params
      if (params.location) {
        queryString += `location=${encodeURIComponent(params.location)}&`;
      }

      if (params.datePosted) {
        queryString += `datePosted=${encodeURIComponent(params.datePosted)}&`;
      }

      // Update quantity search params
      if (params.quantity) {
        queryString += `minQuantity=${encodeURIComponent(
          params.quantity.value
        )}&`;
        queryString += `quantityUnit=${encodeURIComponent(
          params.quantity.unit
        )}&`;
      }

      if (params.expiryDate) {
        queryString += `expiryDate=${encodeURIComponent(
          params.expiryDate.date
        )}&`;
        queryString += `expiryType=${encodeURIComponent(
          params.expiryDate.type
        )}`;
      }

      // Remove trailing &
      queryString = queryString.replace(/&$/, "");

      const response = await fetch(
        `/api/listings${queryString ? `?${queryString}` : ""}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      setListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const FoodListing = ({
    listing,
    index,
  }: {
    listing: FoodListing;
    index: number;
  }) => {
    const postedByUser = users[listing.postedBy];
    const isOwnListing = !!(user && listing.postedBy === user.id);
    const timeLeft = getTimeLeft(listing.expiration);

    // Add state for mouse position and hover state
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [api, setApi] = useState<CarouselApi>();

    useEffect(() => {
      if (!api) return;

      api.on("select", () => {
        // Force re-render when slide changes
        setApi(api);
      });
    }, [api]);

    // Add mouse move handler
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
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
        className="bg-[#F9F3F0] rounded-xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer relative"
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered
            ? `
                perspective(1000px) 
                rotateX(${(mousePosition.y - 150) / 15}deg) 
                rotateY(${(mousePosition.x - 400) / 15}deg)
              `
            : "none",
          boxShadow: isHovered
            ? "0 10px 20px rgba(0, 0, 0, 0.1)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
        onClick={() => router.push(`/listing/${listing._id}`)}
      >
        <div className="flex flex-col md:flex-row h-auto md:h-48">
          {/* Image Section */}
          <div className="relative w-full h-48 md:w-72 md:h-48 overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <ImageCarousel
                images={listing.images}
                onImageClick={() => {}}
              />
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <Badge
              className={`absolute top-3 right-3 z-10 ${
                timeLeft.unit === "hours"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              } px-3 py-1 rounded-full font-medium`}
            >
              <Clock className="w-3 h-3 inline-block mr-1" />
              {`${timeLeft.value} ${timeLeft.unit} left`}
            </Badge>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 md:p-6 flex flex-col">
            {/* Main Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* Top Section */}
              <div>
                {/* Food Name */}
                <h3 className="text-2xl text-[#1C716F] mb-1 font-['joane'] font-semibold">
                  {listing.foodType
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </h3>

                {/* Seller */}
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-lg font-medium text-[#6B7280]">
                    {postedByUser ? postedByUser.name : "Unknown"}
                  </span>
                </div>
              </div>

              {/* Bottom Section - Quantity and Location */}
              <div className="grid grid-cols-2 gap-8 mt-auto pt-4">
                <div className="flex items-center text-gray-600">
                  <Package className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-base">{`${listing.quantity} ${listing.quantityUnit}`}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="text-base italic">{listing.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
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
    <div className="flex flex-col min-h-screen bg-[#ECFDED]">
      <Navbar user={currentUser} onLogout={handleLogout} />
      <div className="flex flex-1 pt-16">
        <div className="flex-1 overflow-auto p-6 bg-[#ECFDED]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            <div className="mb-8 bg-[#F9F3F0] rounded-xl shadow-sm border border-gray-100">
              <AdvancedSearchForm
                onSearch={handleAdvancedSearch}
                locations={uniqueLocations}
              />
            </div>

            {isLoading && (
              <div className="grid grid-cols-1 gap-6">
                {[...Array(3)].map((_, index) => (
                  <ListingSkeleton key={index} />
                ))}
              </div>
            )}

            {error && (
              <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                {error}
              </div>
            )}

            {!isLoading && !error && (
              <>
                {listings.length === 0 ? (
                  <div className="text-center text-gray-500 py-12">
                    No active listings available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6">
                    {listings.map((listing, index) => (
                      <FoodListing
                        key={listing._id}
                        listing={listing}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {user && <DonateButton />}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FoodListings;
