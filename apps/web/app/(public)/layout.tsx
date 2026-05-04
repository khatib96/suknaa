import { Suspense } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

/**
 * Public layout: every page that's part of the regular guest-facing site.
 *
 * Renders the global Navbar (with `[الكل][عقارات][فنادق]` tabs and the
 * "تسجيل الدخول" dropdown) and the 3-layer Footer.
 *
 * Pages that need a different chrome (host login, host onboarding wizard)
 * live in the sibling `(host-auth)/` route group and use a different layout.
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Suspense fallback={<div className="h-[72px]" />}>
        <Navbar />
      </Suspense>
      <div className="relative">{children}</div>
      <Footer />
    </>
  );
}
