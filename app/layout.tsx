import React from 'react';
import '@/app/globals.css';

export const metadata = {
  title: 'FoodShare App',
  description: 'A platform for sharing surplus food',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
