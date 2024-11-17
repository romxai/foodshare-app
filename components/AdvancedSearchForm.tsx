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
  locations: string[];
}

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({
  onSearch,
  locations,
}) => {
  const [location, setLocation] = useState<string>("all");
  const [datePosted, setDatePosted] = useState<Date | undefined>();
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("Kg");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();

  const handleQuantityUnitChange = (value: string) => {
    setQuantityUnit(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create search params object, only including filled fields
    const searchParams: any = {};

    if (location && location !== "all") {
      searchParams.location = location;
    }

    if (datePosted) {
      searchParams.datePosted = format(datePosted, "yyyy-MM-dd");
    }

    if (quantity && quantityUnit) {
      searchParams.quantity = {
        value: parseFloat(quantity),
        unit: quantityUnit,
      };
    }

    if (expiryDate) {
      // Set the time to the start of the day for consistent comparison
      const selectedDate = new Date(expiryDate);
      selectedDate.setHours(0, 0, 0, 0);

      // Send as ISO string to maintain timezone consistency
      searchParams.expiryDate = {
        date: selectedDate.toISOString(),
        type: "after", // Indicate we want items expiring on or after this date
      };
    }

    // Only call onSearch when Apply Filters is clicked
    onSearch(searchParams);
  };

  const handleClear = () => {
    // Clear all form fields
    setLocation("all");
    setDatePosted(undefined);
    setQuantity("");
    setQuantityUnit("Kg"); // Reset to default
    setExpiryDate(undefined);

    // Clear all filters by passing empty object
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#F9F3F0] p-6 rounded-xl">
      <h2 className="text-2xl font-korolev text-[#065553] mb-6 tracking-wide">
        Filters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium text-gray-600">
            Location
          </Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="bg-[#F9F3F0] border-[#ada8b3] border-2 text-gray-800 focus:border-[#065553] focus:ring-0 font-['Verdana Pro Cond']">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent className="bg-[#F9F3F0] border-[#ada8b3] border-2 font-['Verdana Pro Cond']">
              <SelectItem
                value="all"
                className="font-['Verdana Pro Cond'] focus:bg-[#1C716F] focus:text-[#F9F3F0] hover:bg-[#1C716F] hover:text-[#F9F3F0] cursor-pointer"
              >
                All Locations
              </SelectItem>
              {locations?.map((loc) => (
                <SelectItem
                  key={loc}
                  value={loc}
                  className="font-['Verdana Pro Cond'] focus:bg-[#1C716F] focus:text-[#F9F3F0] hover:bg-[#1C716F] hover:text-[#F9F3F0] cursor-pointer"
                >
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Posted */}
        <div className="space-y-2">
          <Label htmlFor="datePosted" className="text-sm font-medium text-gray-600">
            Date Posted
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full bg-[#F9F3F0] border-[#ada8b3] border-2 text-left font-['Verdana Pro Cond'] hover:bg-[#F9F3F0] hover:border-[#065553]",
                  datePosted ? "text-gray-800" : "text-gray-400 italic"
                )}
              >
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

        {/* Expiry Date */}
        <div className="space-y-2">
          <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-600">
            Expiry Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full bg-[#F9F3F0] border-[#ada8b3] border-2 text-left font-['Verdana Pro Cond'] hover:bg-[#F9F3F0] hover:border-[#065553]",
                  expiryDate ? "text-gray-800" : "text-gray-400 italic"
                )}
              >
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

        {/* Buttons */}
        <div className="flex gap-2 items-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            className="flex-1 bg-[#F9F3F0] border-[#ada8b3] border-2 text-[#1C716F] hover:bg-[#F9F3F0] hover:border-[#065553] hover:text-[#065553] font-['Verdana Pro Cond']"
          >
            Clear
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#1C716F] hover:bg-[#065553] text-[#F9F3F0] font-['Verdana Pro Cond']"
          >
            Apply
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AdvancedSearchForm;
