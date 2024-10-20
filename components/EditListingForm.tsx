import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FoodListing } from "@/types";
import Image from "next/image";

interface EditListingFormProps {
  listing: FoodListing;
  onListingUpdated: () => void;
  onClose: () => void;
}

export default function EditListingForm({
  listing,
  onListingUpdated,
  onClose,
}: EditListingFormProps) {
  const [formData, setFormData] = useState({
    foodType: listing.foodType,
    description: listing.description,
    quantity: listing.quantity,
    quantityType: listing.quantityType,
    quantityUnit: listing.quantityUnit,
    expirationDate: new Date(listing.expiration).toISOString().split('T')[0],
    expirationTime: new Date(listing.expiration).toTimeString().split(' ')[0].slice(0, 5),
    location: listing.location,
    images: [] as File[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>(listing.imagePaths || []);

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
      formDataToSend.append('id', listing._id); // Add the listing ID to the form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "images") {
          formDataToSend.append(key, value as string);
        }
      });
      formDataToSend.append("expiration", expiration.toISOString());

      formData.images.forEach((image, index) => {
        formDataToSend.append(`image${index}`, image);
      });

      const response = await fetch(`/api/listings`, {
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

      onListingUpdated();
      onClose();
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="foodType">Food Type</Label>
        <Input
          id="foodType"
          name="foodType"
          value={formData.foodType}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex-grow">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="quantityType">
            {formData.quantityType === "solid" ? "Solid" : "Liquid"}
          </Label>
          <Switch
            id="quantityType"
            checked={formData.quantityType === "liquid"}
            onCheckedChange={handleQuantityTypeChange}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="quantityUnit">{formData.quantityUnit}</Label>
          <Switch
            id="quantityUnit"
            checked={
              formData.quantityType === "solid"
                ? formData.quantityUnit === "g"
                : formData.quantityUnit === "ml"
            }
            onCheckedChange={handleQuantityUnitChange}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="expirationDate">Expiration Date</Label>
        <Input
          id="expirationDate"
          name="expirationDate"
          type="date"
          value={formData.expirationDate}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="expirationTime">Expiration Time</Label>
        <Input
          id="expirationTime"
          name="expirationTime"
          type="time"
          value={formData.expirationTime}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="images">Images (1-5):</Label>
        <Input
          type="file"
          id="images"
          accept="image/*"
          onChange={handleImageChange}
          multiple
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative">
              <Image
                src={url}
                alt={`Preview ${index + 1}`}
                width={100}
                height={100}
                style={{ objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update Listing"}
      </Button>
    </form>
  );
}