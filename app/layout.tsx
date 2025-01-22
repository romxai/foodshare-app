import React from "react";
import "@/app/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Giving Table",
  description: "A platform for sharing surplus food",
};

const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div
      role="alert"
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
    >
      <strong className="font-bold">Oops! Something went wrong:</strong>
      <pre className="mt-2 text-sm">{error.message}</pre>
    </div>
  );
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">{children}</body>
    </html>
  );
}
