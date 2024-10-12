import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCurrentUser } from "@/app/lib/auth";

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
    quantityUnit: "kg",
    source: "",
    expirationDate: "",
    expirationTime: "00:00",
    location: "",
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
      quantityType: prev.quantityType === "solid" ? "fluid" : "solid",
      quantityUnit: prev.quantityType === "solid" ? "L" : "kg",
    }));
  };

  const handleQuantityUnitChange = () => {
    setFormData((prev) => ({
      ...prev,
      quantityUnit:
        prev.quantityType === "solid"
          ? prev.quantityUnit === "kg"
            ? "g"
            : "kg"
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
      const expiration = new Date(
        `${formData.expirationDate}T${formData.expirationTime}`
      );

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          quantity: `${formData.quantity} ${formData.quantityUnit}`,
          expiration: expiration.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create listing");
      }

      onListingCreated();
      setFormData({
        foodType: "",
        description: "",
        quantity: "",
        quantityType: "solid",
        quantityUnit: "kg",
        source: "",
        expirationDate: "",
        expirationTime: "00:00",
        location: "",
      });
    } catch (err) {
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
            {formData.quantityType === "solid" ? "Solid" : "Fluid"}
          </Label>
          <Switch
            id="quantityType"
            checked={formData.quantityType === "fluid"}
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
