import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Minimal "business chrome" used by host login and the host onboarding
 * wizard. Replaces the public Navbar+Footer with a focused header that
 * makes the user feel they're entering a partner-only experience.
 *
 *   [Logo]  |  لوحة المضيفين                          ←  الصفحة العامة
 *
 * The right-hand link returns to the public site (`/`) so a host who
 * landed here by mistake can escape easily.
 */
export function HostAuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-40 border-b border-[#E8E0D3] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="الذهاب للصفحة العامة"
            className="flex items-center gap-3"
          >
            <span className="relative block h-9 w-[110px]">
              <Image
                src="/logo/suknaa-logo-color.png"
                alt="شعار سُكنى"
                fill
                priority
                sizes="110px"
                className="object-contain"
              />
            </span>
            <span
              aria-hidden
              className="hidden h-7 w-px bg-[#E8E0D3] sm:block"
            />
            <span className="hidden text-sm font-bold text-charcoal sm:inline-flex">
              لوحة المضيفين
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E0D3] bg-white px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-primary hover:text-primary md:text-sm"
          >
            الصفحة العامة
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#E8E0D3] bg-white py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted md:flex-row md:px-6 lg:px-8">
          <span>© 2026 سُكنى — منطقة المضيفين</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-primary">
              مركز المساعدة
            </Link>
            <Link href="#" className="hover:text-primary">
              الشروط
            </Link>
            <Link href="#" className="hover:text-primary">
              الخصوصية
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
