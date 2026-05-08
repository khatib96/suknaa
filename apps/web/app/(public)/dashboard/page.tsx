"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Home,
  Loader2,
  Phone,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";
import { ApiError, apiRequest, getErrorMessageAr } from "@/lib/web-api";

interface CurrentUser {
  id: string;
  email: string;
  emailVerified: boolean;
  phone?: string | null;
  phoneVerified: boolean;
  fullName?: string | null;
  isGuest: boolean;
  isHost: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  lastLoginAs: "guest" | "host" | "admin";
  preferredLanguage: string;
}

export default function GuestDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function loadUser() {
      try {
        const result = await apiRequest<CurrentUser>({
          path: "/api/me",
          method: "GET",
        });
        if (!alive) return;
        setUser(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/login");
          return;
        }
        if (!alive) return;
        setErrorMessage(getErrorMessageAr(error));
      } finally {
        if (alive) {
          setIsLoading(false);
        }
      }
    }

    void loadUser();
    return () => {
      alive = false;
    };
  }, [router]);

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.fullName?.trim() || user.email;
  }, [user]);

  if (isLoading) {
    return (
      <main className="min-h-[70vh] bg-cream px-4 pt-32 pb-16 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center rounded-3xl border border-[#E8E0D3] bg-white p-10 shadow-warm-md">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="ms-3 text-sm font-semibold text-charcoal">
            جارٍ تحميل لوحة الحساب...
          </span>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-[70vh] bg-cream px-4 pt-32 pb-16 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#F8D7DA] bg-[#FFF1F2] p-6 text-sm text-[#9F1239] shadow-warm-md">
          {errorMessage}
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-[70vh] bg-cream px-4 pt-32 pb-16 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-[#F1E5C9] bg-[#FFF8E6] px-5 py-4 text-sm font-semibold text-[#8A6A1F]">
          هذه نسخة مبدئية من لوحة الضيف، بعض الميزات لم تُفعَّل بعد.
        </div>

        <header className="space-y-2">
          <p className="text-sm font-semibold text-primary">لوحة الحساب</p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
              aria-hidden
            >
              <UserRound className="h-6 w-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-charcoal md:text-4xl">
              مرحباً {displayName}
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted md:text-base">
            هنا ستجد حجوزاتك، رحلاتك، وإعدادات حسابك عندما تكتمل ميزات الحجز.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-warm-md">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-primary">
                <UserRound className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-extrabold text-charcoal">حسابي</h2>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <p className="break-all text-charcoal" dir="ltr">
                {user.email}
              </p>
              <StatusBadge
                active={user.emailVerified}
                label={user.emailVerified ? "البريد موثق" : "البريد غير موثق"}
              />
              <StatusBadge
                active={user.phoneVerified}
                label={user.phoneVerified ? "الهاتف موثق" : "الهاتف غير موثق"}
                icon={<Phone className="h-4 w-4" />}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-warm-md">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-primary">
                <CalendarDays className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-extrabold text-charcoal">حجوزاتي</h2>
            </div>
            <p className="mt-5 text-sm leading-7 text-muted">
              قريباً ستظهر هنا الحجوزات الحالية والسابقة وتفاصيل الرحلات.
            </p>
          </section>

          <section className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-warm-md">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream text-primary">
                <Home className="h-5 w-5" />
              </span>
              <h2 className="text-lg font-extrabold text-charcoal">
                هل تريد أن تستضيف؟
              </h2>
            </div>
            <p className="mt-5 text-sm leading-7 text-muted">
              يمكنك تحويل بيتك أو شقتك إلى مصدر دخل عبر برنامج المضيفين.
            </p>
            <Link
              href="/become-a-host"
              className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-warm-sm transition-colors hover:bg-[#a84a33]"
            >
              تعرّف على الاستضافة
            </Link>
          </section>
        </div>

        {user.isHost ? (
          <Link
            href="/host/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[#E8E0D3] bg-white px-5 py-3 text-sm font-bold text-charcoal shadow-warm-sm transition-colors hover:border-primary hover:text-primary"
          >
            <ShieldCheck className="h-4 w-4" />
            الانتقال إلى لوحة المضيف
          </Link>
        ) : null}
      </div>
    </main>
  );
}

function StatusBadge({
  active,
  label,
  icon,
}: {
  active: boolean;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={
        active
          ? "inline-flex items-center gap-2 rounded-full border border-[#D5E9DD] bg-[#EDF7F1] px-3 py-1.5 text-xs font-bold text-[#1F4C3A]"
          : "inline-flex items-center gap-2 rounded-full border border-[#F8D7DA] bg-[#FFF1F2] px-3 py-1.5 text-xs font-bold text-[#9F1239]"
      }
    >
      {icon ?? (active ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />)}
      {label}
    </span>
  );
}
