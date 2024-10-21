import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCurrentUser } from "../lib/auth";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, MapPinIcon, ScaleIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CreateListingFormProps {
  onListingCreated: () => void;
  onClose: () => void;
}

export default function CreateListingForm({
  onListingCreated,
  onClose,
}: CreateListingFormProps) {
  const [formData, setFormData] = useState({
    foodType: "",
    description: "",
    quantity: "",
    quantityType: "solid",
    quantityUnit: "Kg",
    source: "",
    expirationDate: "",
    expirationTime: "00:00",
    location: "",
    images: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
    if (formData.images.length === 0) {
      setError("Please upload at least one image");
      return;
    }
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

      // Combine date and time for expiration
      const expiration = new Date(
        `${formData.expirationDate}T${formData.expirationTime}`
      );

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images") {
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

      onListingCreated();
      onClose();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl bg-gray-800 text-gray-100">
      <CardHeader>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[70vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="foodType" className="text-sm font-medium text-gray-200">Food Type</Label>
              <Input
                id="foodType"
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600 text-gray-100 focus:border-green-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-200">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600 text-gray-100 focus:border-green-400 min-h-[100px]"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium text-gray-200">Quantity</Label>
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
                    className="bg-gray-700 border-gray-600 text-gray-100 focus:border-green-400"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-200">Type & Unit</Label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="quantityType"
                      checked={formData.quantityType === "liquid"}
                      onCheckedChange={handleQuantityTypeChange}
                    />
                    <Label htmlFor="quantityType" className="text-sm">
                      {formData.quantityType === "solid" ? "Solid" : "Liquid"}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="quantityUnit"
                      checked={
                        formData.quantityType === "solid"
                          ? formData.quantityUnit === "g"
                          : formData.quantityUnit === "ml"
                      }
                      onCheckedChange={handleQuantityUnitChange}
                    />
                    <Label htmlFor="quantityUnit" className="text-sm">{formData.quantityUnit}</Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source" className="text-sm font-medium text-gray-200">Source</Label>
              <Input
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                required
                className="bg-gray-700 border-gray-600 text-gray-100 focus:border-green-400"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="expirationDate" className="text-sm font-medium text-gray-200">Expiration Date</Label>
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="text-gray-400" />
                  <Input
                    id="expirationDate"
                    name="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border-gray-600 text-gray-100 focus:border-green-400"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="expirationTime" className="text-sm font-medium text-gray-200">Expiration Time</Label>
                <Input
                  id="expirationTime"
                  name="expirationTime"
                  type="time"
                  value={formData.expirationTime}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border-gray-600 text-gray-100 focus:border-green-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-200">Location</Label>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="text-gray-400" />
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="bg-gray-700 border-gray-600 text-gray-100 focus:border-green-400"
                />
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Label htmlFor="images" className="text-sm font-medium text-gray-200">Images (1-5)</Label>
              <Input
                type="file"
                id="images"
                accept="image/*"
                onChange={handleImageChange}
                multiple
                className="bg-gray-700 border-gray-600 text-gray-100 focus:border-green-400"
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
            <Button
              type="submit"
              disabled={isSubmitting || formData.images.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              {isSubmitting ? "Creating..." : "Create Listing"}
            </Button>
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
