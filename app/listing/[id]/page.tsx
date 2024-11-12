"use client";

import ListingDetails from "@/components/ListingDetails";

export default function ListingPage({ params }: { params: { id: string } }) {
  return <ListingDetails id={params.id} />;
}
