import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AdvancedSearchParams {
  location?: string;
  datePosted?: string;
  quantity?: string;
  expiryDate?: string;
  postedBy?: string;
}

interface AdvancedSearchFormProps {
  onSearch: (params: AdvancedSearchParams) => void;
}

const AdvancedSearchForm: React.FC<AdvancedSearchFormProps> = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [datePosted, setDatePosted] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [postedBy, setPostedBy] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ location, datePosted, quantity, expiryDate, postedBy });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter location"
        />
      </div>
      <div>
        <Label htmlFor="datePosted">Date Posted</Label>
        <Input
          id="datePosted"
          type="date"
          value={datePosted}
          onChange={(e) => setDatePosted(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter quantity"
        />
      </div>
      <div>
        <Label htmlFor="expiryDate">Expiry Date</Label>
        <Input
          id="expiryDate"
          type="date"
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="postedBy">Posted By</Label>
        <Input
          id="postedBy"
          value={postedBy}
          onChange={(e) => setPostedBy(e.target.value)}
          placeholder="Enter user name"
        />
      </div>
      <Button type="submit">Apply Filters</Button>
    </form>
  );
};

export default AdvancedSearchForm;
