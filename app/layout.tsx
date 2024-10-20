import React from "react";
import "@/app/globals.css";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "FoodShare App",
  description: "A platform for sharing surplus food",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100">
        {children}
      </body>
    </html>
  );
}
