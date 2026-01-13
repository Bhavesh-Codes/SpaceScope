import './globals.css';
import React from 'react';
import { Inter, Orbitron } from 'next/font/google';


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
});

export const metadata = {
  title: 'SpaceScope',
  description: 'Explore the Universe',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${orbitron.variable} font-inter bg-black text-slate-400`}>
        {children}
      </body>
    </html>
  );
}
