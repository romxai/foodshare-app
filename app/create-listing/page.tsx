"use client";

import CreateListingForm from "@/components/CreateListingForm";
import { useRouter } from "next/navigation";

export default function CreateListingPage() {
  const router = useRouter();

  const handleListingCreated = () => {
    router.push("/");
  };

  return (
    <CreateListingForm
      onListingCreated={handleListingCreated}
      onClose={() => router.push("/")}
    />
  );
}
