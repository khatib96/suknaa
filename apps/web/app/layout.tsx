import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "سُكنى",
  description: "منصة سُكنى لحجز العقارات والفنادق في سوريا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-charcoal">
        <Navbar />
        <div className="relative">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
