"use client";

import EditListingForm from "@/components/EditListingForm";
import { useRouter } from "next/navigation";

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <EditListingForm 
      listingId={params.id}
      onListingUpdated={() => router.push('/account')}
      onClose={() => router.push('/account')}
    />
  );
} 