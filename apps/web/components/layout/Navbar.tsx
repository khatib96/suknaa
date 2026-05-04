"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Home, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_TAB, parseTab, type TabValue } from "@/lib/tab";

const NAV_TABS: ReadonlyArray<{ key: TabValue; label: string }> = [
  { key: "all", label: "الكل" },
  { key: "real_estate", label: "عقارات" },
  { key: "hospitality", label: "فنادق" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = useMemo<TabValue>(
    () => parseTab(searchParams?.get("tab")),
    [searchParams],
  );

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const buildHref = (tab: TabValue) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (tab === DEFAULT_TAB) {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    return query ? `?${query}` : "?";
  };

  const onTabClick = (tab: TabValue) => (event: React.MouseEvent) => {
    event.preventDefault();
    const href = buildHref(tab);
    router.replace(href, { scroll: false });
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 h-[72px] border-b transition-all duration-500 ease-out",
        isScrolled
          ? "border-[#E8E0D3]/70 bg-white/85 shadow-warm-sm backdrop-blur-xl backdrop-saturate-150"
          : "border-white/10 bg-white/20 backdrop-blur-md backdrop-saturate-150",
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 md:px-6 lg:px-8">
        <Link href="/" aria-label="الذهاب للصفحة الرئيسية" className="relative flex h-11 w-[150px] shrink-0 items-center">
          <Image
            src="/logo/suknaa-logo-white.png"
            alt="شعار سُكنى"
            fill
            priority
            sizes="150px"
            className={cn(
              "object-contain transition-opacity duration-500",
              isScrolled ? "opacity-0" : "opacity-100",
            )}
          />
          <Image
            src="/logo/suknaa-logo-color.png"
            alt=""
            fill
            sizes="150px"
            aria-hidden
            className={cn(
              "object-contain transition-opacity duration-500",
              isScrolled ? "opacity-100" : "opacity-0",
            )}
          />
        </Link>

        <nav
          aria-label="تبويبات الموقع"
          className="hidden items-center rounded-full border border-[#E8E0D3] bg-white px-1.5 py-1 shadow-warm-sm md:flex"
        >
          {NAV_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={buildHref(tab.key)}
              onClick={onTabClick(tab.key)}
              aria-pressed={activeTab === tab.key}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all duration-200",
                activeTab === tab.key
                  ? "bg-primary text-white shadow-primary-glow"
                  : "text-muted hover:text-primary",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            )}
          >
            <User className="h-4 w-4" />
            تسجيل الدخول
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={10}
            className="w-56 rounded-2xl border border-[#E8E0D3] p-1.5 shadow-warm-md"
          >
            <DropdownMenuItem
              render={
                <Link
                  href="/login"
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal hover:text-primary"
                />
              }
            >
              دخول
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <Link
                  href="/host/login"
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal hover:text-primary"
                />
              }
            >
              دخول كمؤجِّر
            </DropdownMenuItem>
            <div className="my-1 h-px bg-[#F1ECE2]" aria-hidden />
            <DropdownMenuItem
              render={
                <Link
                  href="/signup"
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-charcoal hover:text-primary"
                />
              }
            >
              إنشاء حساب
            </DropdownMenuItem>
            <DropdownMenuItem
              render={
                <Link
                  href="/become-a-host"
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold text-gold hover:text-primary"
                />
              }
            >
              كن مضيفاً
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border-t border-[#E8E0D3] bg-white/95 px-4 py-2 md:hidden">
        <nav aria-label="تبويبات الموقع للجوال" className="flex items-center gap-2 overflow-x-auto">
          {NAV_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={buildHref(tab.key)}
              onClick={onTabClick(tab.key)}
              aria-pressed={activeTab === tab.key}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200",
                activeTab === tab.key
                  ? "bg-primary text-white shadow-primary-glow"
                  : "bg-white text-muted hover:text-primary",
              )}
            >
              {tab.label}
            </Link>
          ))}
          <Home className="ms-auto h-4 w-4 shrink-0 text-muted" />
        </nav>
      </div>
    </header>
  );
}
