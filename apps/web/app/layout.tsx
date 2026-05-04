import type { Metadata, Viewport } from "next";
import { Inter, Tajawal } from "next/font/google";
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
  title: {
    default: "سُكنى — منصتك لاكتشاف وحجز السكن في سوريا",
    template: "%s | سُكنى",
  },
  description:
    "سُكنى هي المنصة الموثوقة لاكتشاف وحجز العقارات والفنادق في سوريا. شقق، فلل، شاليهات، فنادق ومنتجعات بأسعار تناسبك.",
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
