import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Nepaltica — NEPSE Stock Analysis",
    template: "%s | Nepaltica",
  },
  description: "Live NEPSE stock data, AI analysis, top gainers, losers and market overview for Nepali investors.",
  keywords: ["NEPSE", "Nepal stock market", "NEPSE stocks", "share price Nepal", "stock analysis Nepal", "Nepaltica"],
  authors: [{ name: "Nepaltica" }],
  creator: "Nepaltica",
  metadataBase: new URL("https://nepaltica.vercel.app"),
  openGraph: {
    title: "Nepaltica — NEPSE Stock Analysis",
    description: "Live NEPSE stock data, AI analysis, top gainers and losers for Nepali investors.",
    url: "https://nepaltica.vercel.app",
    siteName: "Nepaltica",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nepaltica — NEPSE Stock Analysis",
    description: "Live NEPSE stock data and AI analysis for Nepali investors.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}