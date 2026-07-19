// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NavBar from "../components/NavBar";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MALAKIA",
  description: "Μαλακία",
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white m-0 p-0">
      <body className={`${inter.className} bg-white text-black m-0 p-0`}>
        <Providers>
          <NavBar />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}