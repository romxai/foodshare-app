"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FoodListing, User } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import {
  CalendarDays,
  MapPin,
  Package,
  ArrowLeft,
  Mail,
  Clock,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListingDetailsSkeleton } from "@/components/ui/ListingDetailsSkeleton";
import { useAuthGuard } from "@/utils/authGuard";
import Footer from "@/components/Footer";

interface ListingDetailsProps {
  id: string;
}

// Add interface for seller at the top of the file
interface SellerWithPhone extends User {
  phoneNumber?: string;
}

const ListingDetails: React.FC<ListingDetailsProps> = ({ id }) => {
  useAuthGuard();
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<SellerWithPhone | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/listings/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setListing(data);
          setSelectedImage(data.imagePaths[0]);

          // Fetch seller details
          const sellerResponse = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ userIds: [data.postedBy] }),
          });
          if (sellerResponse.ok) {
            const sellerData = await sellerResponse.json();
            setSeller(sellerData[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  if (isLoading) {
    return <ListingDetailsSkeleton />;
  }

  if (!listing || !currentUser) {
    return null;
  }

  const { date, time } = formatDateTime(listing.expiration);

  // Add check for listing owner
  const isOwner =
    currentUser?.id === listing.postedBy ||
    currentUser?._id === listing.postedBy;

  return (
    <div className="flex flex-col min-h-screen bg-[#CCD9BF]">
      <Navbar user={currentUser} onLogout={() => router.push("/login")} />
      <div className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-[#F9F3F0] rounded-xl p-8 shadow-lg">
            <Button
              variant="ghost"
              className="mb-6 text-gray-600 hover:text-emerald-600"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image Section */}
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt={listing.foodType}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                  />
                </div>
                {listing.imagePaths && listing.imagePaths.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {listing.imagePaths.map((image, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        className={`relative w-20 h-20 rounded-md overflow-hidden cursor-pointer ${
                          selectedImage === image
                            ? "ring-2 ring-emerald-500"
                            : "opacity-70"
                        }`}
                        onClick={() => setSelectedImage(image)}
                      >
                        <Image
                          src={image}
                          alt={`${listing.foodType} ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                {/* Food Name */}
                <h1 className="text-3xl font-[500] text-[#065553] font-korolev mb-1 tracking-wide">
                  {listing.foodType}
                </h1>

                <div className="space-y-8">
                  {/* Description with ScrollArea */}
                  <ScrollArea
                    className="h-[200px] rounded-md border border-[#ADA8B3] p-4 relative"
                    style={
                      {
                        "--scrollbar-size": "8px",
                        "--scrollbar-thumb": "#065553",
                        "--scrollbar-track": "#1C716F",
                        "--scrollbar-hover": "#044442",
                      } as React.CSSProperties
                    }
                  >
                    <p className="text-gray-600 italic font-['Verdana Pro Cond'] whitespace-pre-line pr-4">
                      {listing.description}
                    </p>
                  </ScrollArea>

                  <div className="grid grid-cols-1 gap-4 mt-8">
                    {/* Quantity and Servings */}
                    <div className="flex items-center text-gray-600 font-['Verdana Pro Cond']">
                      <Package className="h-5 w-5 mr-3 text-[#065553]" />
                      <span>
                        <span className="text-[#1C716F]">Quantity:</span>{" "}
                        <span className="italic">{`${listing.quantity} ${listing.quantityUnit}`}</span>
                        {(listing as FoodListing & { servings?: number })
                          .servings && (
                          <span className="ml-2">
                            • <span className="text-[#1C716F]">Servings:</span>{" "}
                            <span className="italic">
                              {
                                (listing as FoodListing & { servings?: number })
                                  .servings
                              }{" "}
                              approx.
                            </span>
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Expiry */}
                    <div className="flex items-center text-gray-600 font-['Verdana Pro Cond']">
                      <Clock className="h-5 w-5 mr-3 text-[#065553]" />
                      <span>
                        <span className="text-[#1C716F]">Expires on</span>{" "}
                        <span className="italic">{`${date} at ${time}`}</span>
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-gray-600 font-['Verdana Pro Cond']">
                      <MapPin className="h-5 w-5 mr-3 text-[#065553]" />
                      <span className="italic">{listing.location}</span>
                    </div>

                    {/* Posted By */}
                    {seller && (
                      <div className="flex items-center text-gray-600 font-['Verdana Pro Cond']">
                        <CalendarDays className="h-5 w-5 mr-3 text-[#065553]" />
                        <span>
                          <span className="text-[#1C716F]">Posted by</span>{" "}
                          <span className="italic">{seller.name}</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <Button
                      className="bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0]"
                      onClick={() => {
                        if (seller?.email) {
                          window.location.href = `mailto:${seller.email}`;
                        }
                      }}
                      disabled={isOwner}
                      title={isOwner ? "This is your listing" : ""}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      <span className="font-['Verdana Pro Cond']">
                        Send an Email
                      </span>
                    </Button>

                    <Button
                      className="bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0]"
                      onClick={() => {
                        if (seller?.phoneNumber && listing && seller?.name) {
                          const formattedDate = new Date(
                            listing.createdAt
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          });

                          const message = `Hello *${seller.name}*,\n\nI am contacting you from FoodShare, i would love to enquire more about your listing on *${listing.foodType}*, posted on _${formattedDate}_.\n\nThank you,\n_${currentUser?.name}._`;

                          const cleanPhone = seller.phoneNumber.replace(
                            /\D/g,
                            ""
                          );
                          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            message
                          )}`;
                          window.open(whatsappUrl, "_blank");
                        }
                      }}
                      disabled={isOwner}
                      title={isOwner ? "This is your listing" : ""}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span className="font-['Verdana Pro Cond']">
                        Contact on WhatsApp
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ListingDetails;
