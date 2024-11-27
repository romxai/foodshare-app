import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FoodListing, User } from "@/types";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPinIcon, ScaleIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TimePicker } from "@/components/ui/TimePicker";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface EditListingFormProps {
  listingId: string;
  onListingUpdated: () => void;
  onClose: () => void;
}

const EditListingForm: React.FC<EditListingFormProps> = ({
  listingId,
  onListingUpdated,
  onClose,
}) => {
  const [listing, setListing] = useState<FoodListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    foodType: "",
    description: "",
    quantity: "",
    quantityType: "solid",
    quantityUnit: "Kg",
    expirationDate: "",
    expirationTime: "",
    location: "",
    images: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setListing(data);
          setExistingImages(data.images || []);
          setFormData({
            foodType: data.foodType,
            description: data.description,
            quantity: data.quantity,
            quantityType: data.quantityType,
            quantityUnit: data.quantityUnit,
            expirationDate: format(new Date(data.expiration), "yyyy-MM-dd"),
            expirationTime: format(new Date(data.expiration), "HH:mm"),
            location: data.location,
            images: [],
          });
        }
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

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

  const handleQuantityTypeChange = () => {
    setFormData((prev) => ({
      ...prev,
      quantityType: prev.quantityType === "solid" ? "liquid" : "solid",
      quantityUnit: prev.quantityType === "solid" ? "L" : "Kg",
    }));
  };

  const handleQuantityUnitChange = () => {
    setFormData((prev) => ({
      ...prev,
      quantityUnit:
        prev.quantityType === "solid"
          ? prev.quantityUnit === "Kg"
            ? "g"
            : "Kg"
          : prev.quantityUnit === "L"
          ? "ml"
          : "L",
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      const totalImages =
        existingImages.length + formData.images.length + newImages.length;

      if (totalImages > 5) {
        setError("You can only upload up to 5 images in total");
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

  const removeExistingImage = async (imageUrl: string) => {
    try {
      setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
    } catch (error) {
      console.error("Error removing image:", error);
      setError("Failed to remove image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const expiration = new Date(
        `${formData.expirationDate}T${formData.expirationTime}`
      );

      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("foodType", formData.foodType);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("quantity", formData.quantity.toString());
      formDataToSend.append("quantityUnit", formData.quantityUnit);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("expiration", expiration.toISOString());

      // Add existing images as a JSON string
      formDataToSend.append("existingImages", JSON.stringify(existingImages));

      // Add new images
      formData.images.forEach((image, index) => {
        formDataToSend.append(`image${index}`, image);
      });

      const response = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update listing");
      }

      const data = await response.json();
      console.log("Listing updated successfully:", data);

      router.push("/listings");
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#CCD9BF]">
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
            <h1 className="text-3xl font-[500] text-[#065553] font-joane font-semibold mb-8 tracking-wide">
              Edit Food Listing
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
                  className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0"
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
                  className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 min-h-[100px]"
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
                  <Label className="text-[#1C716F] font-['Verdana Pro Cond']">
                    Unit
                  </Label>
                  <ToggleGroup
                    type="single"
                    value={formData.quantityUnit}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        quantityUnit: value,
                      }))
                    }
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
                          "w-full bg-[#F9F3F0] border-[#ada8b3] border-2 text-left font-['Verdana Pro Cond'] hover:bg-[#F9F3F0] hover:border-[#065553]",
                          formData.expirationDate
                            ? "text-gray-800"
                            : "text-gray-400 italic"
                        )}
                      >
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
                    showIcon={false}
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
                <div className="relative">
                  <Input
                    type="file"
                    id="images"
                    accept="image/*"
                    onChange={handleImageChange}
                    multiple
                    disabled={
                      existingImages.length + formData.images.length >= 5
                    }
                    className="bg-transparent border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 h-auto
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-['Verdana Pro Cond']
                      file:bg-transparent
                      file:text-[#1C716F]
                      hover:file:bg-[#ECFDED]
                      hover:file:text-[#065553]
                      file:transition-colors
                      file:cursor-pointer
                      file:my-1
                      cursor-pointer
                      py-[0.25rem]"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {existingImages.map((url, index) => (
                    <div key={`existing-${index}`} className="relative">
                      <Image
                        src={url}
                        alt={`Existing ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {previewUrls.map((url, index) => (
                    <div key={`new-${index}`} className="relative">
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
                <p className="text-sm text-gray-500">
                  {5 - (existingImages.length + formData.images.length)} image
                  slots remaining
                </p>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] font-['Verdana Pro Cond']"
              >
                {isSubmitting ? "Updating..." : "Update Listing"}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditListingForm;
