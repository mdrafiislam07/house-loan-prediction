import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// used automatically for Bangla text (language toggle)
const notoBengali = Noto_Sans_Bengali({
  variable: "--font-bn",
  subsets: ["bengali", "latin"],
});

export const metadata: Metadata = {
  title: "HomeLoan AI | House loan approval estimator",
  description:
    "Estimate your monthly EMI and house loan approval chance. Numbers are calculated by code and explained by Gemini AI.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}