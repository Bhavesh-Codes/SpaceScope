// src/app/layout.tsx
import './globals.css';
import React from 'react';
import localFont from 'next/font/local';

const lemonMilk = localFont({
  src: './fonts/Lemon.otf', // Matches the new folder and simple filename
  variable: '--font-lemon-milk',
  display: 'swap',
});

export const metadata = {
  title: 'SpaceScope',
  description: 'Explore the Universe',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${lemonMilk.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}