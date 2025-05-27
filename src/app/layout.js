import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ResponsiveNav } from "@/components/ResponsiveNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "The Journal - Design & Technology Insights",
  description:
    "Your daily dose of design insights, technology updates, and industry news",
};

export default function RootLayout({ children }) {
  // Get role
  const role =
    typeof window !== "undefined" ? localStorage.getItem("role") : null;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ResponsiveNav user={role} />

        {children}
      </body>
    </html>
  );
}
