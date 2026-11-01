import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import "@/components/loader/loader.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

/**
 * Stand-in for SF Pro Expanded (the Figma headings), which cannot ship on the web. Archivo has a width axis
 * that reaches 125%, the closest free match to an expanded grotesque.
 */
const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Ride Out",
  description: "Ride Out setup",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${archivo.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
