import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCurrentUser } from "../lib/auth";

interface CreateListingFormProps {
  onListingCreated: () => void;
}

export default function CreateListingForm({
  onListingCreated,
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
    image: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Combine date and time for expiration
      const expiration = new Date(`${formData.expirationDate}T${formData.expirationTime}`);

      const dataToSend = {
        foodType: formData.foodType,
        description: formData.description,
        quantity: `${formData.quantity} ${formData.quantityUnit}`,
        expiration: expiration.toISOString(),
        location: formData.location,
        source: formData.source,
      };

      console.log("Sending request to create listing...");
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
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
      setFormData({
        foodType: "",
        description: "",
        quantity: "",
        quantityType: "solid",
        quantityUnit: "Kg",
        source: "",
        expirationDate: "",
        expirationTime: "00:00",
        location: "",
        image: null,
      });
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
        <Label htmlFor="source">Source</Label>
        <Input
          id="source"
          name="source"
          value={formData.source}
          onChange={handleChange}
          required
        />
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
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Listing"}
      </Button>
    </form>
  );
}
