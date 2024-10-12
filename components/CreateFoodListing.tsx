"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const CreateFoodListing: React.FC = () => {
  const [foodType, setFoodType] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiration, setExpiration] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/food-listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ foodType, description, quantity, expiration, location }),
      });

      if (!response.ok) {
        throw new Error('Failed to create food listing');
      }

      // Clear form after successful submission
      setFoodType('');
      setDescription('');
      setQuantity('');
      setExpiration('');
      setLocation('');

      alert('Food listing created successfully!');
    } catch (err) {
      console.error('Error creating food listing:', err);
      setError('Failed to create food listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Food Type"
        value={foodType}
        onChange={(e) => setFoodType(e.target.value)}
        required
      />
      <Textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />
      <Input
        type="date"
        placeholder="Expiration Date"
        value={expiration}
        onChange={(e) => setExpiration(e.target.value)}
        required
      />
      <Input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Food Listing'}
      </Button>
    </form>
  );
};

export default CreateFoodListing;