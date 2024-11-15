"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCurrentUser } from "../lib/auth";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import {
  CalendarIcon,
  MapPinIcon,
  ScaleIcon,
  ArrowLeft,
  Package,
  Clock,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navbar from "./Navbar";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Footer from "@/components/Footer";
import { useAuthGuard } from "@/utils/authGuard";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/ui/TimePicker";

interface CreateListingFormProps {
  onListingCreated: () => void;
  onClose: () => void;
}

export default function CreateListingForm({
  onListingCreated,
  onClose,
}: CreateListingFormProps) {
  useAuthGuard();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const [formData, setFormData] = useState({
    foodType: "",
    description: "",
    quantity: "",
    quantityUnit: "Kg",
    servings: "",
    source: "",
    expirationDate: "",
    expirationTime: "00:00",
    location: "",
    images: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuantityUnitChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      quantityUnit: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      if (formData.images.length + newImages.length > 5) {
        setError("You can only upload up to 5 images");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));

      const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
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

      const expiration = new Date(
        `${formData.expirationDate}T${formData.expirationTime}`
      );

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "servings" || key === "quantity") {
          formDataToSend.append(key, parseFloat(value as string).toString());
        } else if (key !== "images") {
          formDataToSend.append(key, value as string);
        }
      });
      formDataToSend.append("expiration", expiration.toISOString());

      formData.images.forEach((image, index) => {
        formDataToSend.append(`image${index}`, image);
      });

      console.log("Sending request to create listing...");
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to create listing");
      }

      const data = await response.json();
      console.log("Listing created successfully:", data);

      router.push("/listings");
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#ECFDED]">
      <Navbar user={currentUser} onLogout={() => router.push("/login")} />
      <div className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            className="mb-6 text-gray-600 hover:text-emerald-600"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="bg-[#F9F3F0] rounded-xl p-8 shadow-lg">
            <h1 className="text-3xl font-[500] text-[#065553] font-korolev mb-8 tracking-wide">
              Create New Food Listing
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="foodType"
                  className="text-sm font-medium text-gray-600"
                >
                  Food Type
                </Label>
                <Input
                  id="foodType"
                  name="foodType"
                  value={formData.foodType}
                  onChange={handleChange}
                  required
                  className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond']"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-600"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 min-h-[100px] font-['Verdana Pro Cond']"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="quantity"
                    className="text-sm font-medium text-gray-600"
                  >
                    Quantity
                  </Label>
                  <div className="flex items-center space-x-2">
                    <ScaleIcon className="text-gray-400" />
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium text-gray-600">
                    Unit
                  </Label>
                  <ToggleGroup
                    type="single"
                    value={formData.quantityUnit}
                    onValueChange={handleQuantityUnitChange}
                    className="justify-start gap-2"
                  >
                    {["Kg", "L"].map((unit) => (
                      <ToggleGroupItem
                        key={unit}
                        value={unit}
                        className="bg-[#ADA8B3] text-white text-sm hover:bg-[#1C716F] hover:text-white data-[state=on]:bg-[#065553] data-[state=on]:text-white border-0 outline-none px-3 py-2"
                      >
                        {unit === "Kg" && "KG"}
                        {unit === "L" && "L"}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="servings"
                    className="text-sm font-medium text-gray-600"
                  >
                    Servings
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Package className="text-gray-400" />
                    <Input
                      id="servings"
                      name="servings"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.servings}
                      onChange={handleChange}
                      required
                      className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="source"
                  className="text-sm font-medium text-gray-600"
                >
                  Source
                </Label>
                <Input
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleChange}
                  required
                  className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="expirationDate"
                    className="text-sm font-medium text-gray-600"
                  >
                    Expiration Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-10 bg-[#F9F3F0] border-[#ada8b3] border-2 text-left font-['Verdana Pro Cond'] hover:bg-[#F9F3F0] hover:border-[#065553]",
                          formData.expirationDate
                            ? "text-gray-800"
                            : "text-gray-400 italic"
                        )}
                      >
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        {formData.expirationDate
                          ? format(new Date(formData.expirationDate), "PPP")
                          : "Select expiry date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formData.expirationDate
                            ? new Date(formData.expirationDate)
                            : undefined
                        }
                        onSelect={(date) =>
                          setFormData((prev) => ({
                            ...prev,
                            expirationDate: date
                              ? format(date, "yyyy-MM-dd")
                              : "",
                          }))
                        }
                        initialFocus
                        classNames={{
                          day_selected:
                            "bg-[#065553] text-white hover:bg-[#065553]",
                          day_today: "bg-gray-400 text-white",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex-1 space-y-2">
                  <Label
                    htmlFor="expirationTime"
                    className="text-sm font-medium text-gray-600"
                  >
                    Expiration Time
                  </Label>
                  <TimePicker
                    value={formData.expirationTime}
                    onChange={(time) =>
                      setFormData((prev) => ({
                        ...prev,
                        expirationTime: time,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-gray-600"
                >
                  Location
                </Label>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="text-gray-400" />
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0"
                  />
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <Label
                  htmlFor="images"
                  className="text-sm font-medium text-gray-600"
                >
                  Images (1-5)
                </Label>
                <Input
                  type="file"
                  id="images"
                  accept="image/*"
                  onChange={handleImageChange}
                  multiple
                  className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0"
                  title="Maximum file size: 5MB per image"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || formData.images.length === 0}
                  className="bg-[#1C716F] hover:bg-[#065553] text-white px-8 font-['Verdana Pro Cond']"
                >
                  {isSubmitting ? "Creating..." : "Create Listing"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
