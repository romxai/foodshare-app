"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Package } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface AdvancedSearchFormProps {
  onSearch: (params: any) => void;
}

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({
  onSearch,
}) => {
  const [location, setLocation] = useState("");
  const [datePosted, setDatePosted] = useState<Date | undefined>();
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("Kg");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();

  const handleQuantityUnitChange = (value: string) => {
    setQuantityUnit(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      location,
      datePosted: datePosted ? format(datePosted, "yyyy-MM-dd") : undefined,
      quantity:
        quantity && quantityUnit
          ? { value: parseFloat(quantity), unit: quantityUnit }
          : undefined,
      expiryDate: expiryDate ? format(expiryDate, "yyyy-MM-dd") : undefined,
    });
  };

  const handleClear = () => {
    setLocation("");
    setDatePosted(undefined);
    setQuantity("");
    setQuantityUnit("");
    setExpiryDate(undefined);
    onSearch({});
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-[#F9F3F0] p-6 rounded-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Location Field */}
        <div className="space-y-2">
          <Label
            htmlFor="location"
            className="text-sm font-medium text-gray-600"
          >
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location..."
              className="pl-10 bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 placeholder:text-gray-400 placeholder:italic font-['Verdana Pro Cond']"
            />
          </div>
        </div>

        {/* Quantity Field with Unit Selection */}
        <div className="space-y-2">
          <Label
            htmlFor="quantity"
            className="text-sm font-medium text-gray-600"
          >
            Quantity
          </Label>
          <div className="flex gap-4">
            {/* Quantity Input - 60% */}
            <div className="w-3/5">
              <div className="flex items-center gap-2 w-full">
                <Package className="text-gray-400 flex-shrink-0" />
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity..."
                  className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 w-full"
                />
              </div>
            </div>

            {/* Unit Toggle Group - 40% */}
            <div className="w-2/5">
              <ToggleGroup
                type="single"
                value={quantityUnit}
                onValueChange={handleQuantityUnitChange}
                className="justify-start gap-2"
              >
                {["Kg", "g", "L", "ml"].map((unit) => (
                  <ToggleGroupItem
                    key={unit}
                    value={unit}
                    className="bg-[#ADA8B3] text-white text-sm hover:bg-[#1C716F] hover:text-white data-[state=on]:bg-[#065553] data-[state=on]:text-white border-0 outline-none px-3 py-2"
                  >
                    {unit === "Kg" && "KG"}
                    {unit === "g" && "G"}
                    {unit === "L" && "L"}
                    {unit === "ml" && "ML"}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </div>

        {/* Date Posted Field */}
        <div className="space-y-2">
          <Label
            htmlFor="datePosted"
            className="text-sm font-medium text-gray-600"
          >
            Date Posted
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-10 bg-[#F9F3F0] border-[#ada8b3] border-2 text-left font-['Verdana Pro Cond'] hover:bg-[#F9F3F0] hover:border-[#065553]",
                  datePosted ? "text-gray-800" : "text-gray-400 italic"
                )}
              >
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                {datePosted ? format(datePosted, "PPP") : "Select date posted"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={datePosted}
                onSelect={setDatePosted}
                initialFocus
                classNames={{
                  day_selected: "bg-[#065553] text-white hover:bg-[#065553]",
                  day_today: "bg-gray-400 text-white",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Expiry Date Field */}
        <div className="space-y-2">
          <Label
            htmlFor="expiryDate"
            className="text-sm font-medium text-gray-600"
          >
            Expiry Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full pl-10 bg-[#F9F3F0] border-[#ada8b3] border-2 text-left font-['Verdana Pro Cond'] hover:bg-[#F9F3F0] hover:border-[#065553]",
                  expiryDate ? "text-gray-800" : "text-gray-400 italic"
                )}
              >
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                {expiryDate ? format(expiryDate, "PPP") : "Select expiry date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={expiryDate}
                onSelect={setExpiryDate}
                initialFocus
                classNames={{
                  day_selected: "bg-[#065553] text-white hover:bg-[#065553]",
                  day_today: "bg-gray-400 text-white",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          onClick={handleClear}
          className="bg-emerald-600 text-white hover:bg-emerald-700 px-8"
        >
          Clear
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 text-white hover:bg-emerald-700 px-8"
        >
          Apply Filters
        </Button>
      </div>
    </form>
  );
};

export default AdvancedSearchForm;
