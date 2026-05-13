import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const tajawal = localFont({
  variable: "--font-tajawal",
  display: "swap",
  src: [
    {
      path: "../assets/fonts/tajawal/tajawal-arabic-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/tajawal/tajawal-arabic-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/tajawal/tajawal-arabic-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/tajawal/tajawal-arabic-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
  ],
});

const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: "../assets/fonts/inter/inter-latin-wght-normal.woff2",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "سُكنى — منصتك لاكتشاف وحجز السكن في سوريا",
    template: "%s | سُكنى",
  },
  description:
    "سُكنى هي المنصة الموثوقة لاكتشاف وحجز بيوت العطلات والفنادق في سوريا. شقق، فلل، شاليهات، فنادق ومنتجعات بأسعار تناسبك.",
  applicationName: "سُكنى",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#C85A3D",
  width: "device-width",
  initialScale: 1,
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
      <body className="min-h-full bg-background text-charcoal">{children}</body>
    </html>
  );
}
