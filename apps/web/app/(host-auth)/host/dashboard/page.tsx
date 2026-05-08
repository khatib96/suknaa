"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  CalendarCheck,
  Home,
  Loader2,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

export default function HostDashboardPage() {
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
        if (!result.isHost) {
          router.replace("/become-a-host/apply");
          return;
        }
        setUser(result);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/host/login");
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
      <main className="min-h-[70vh] px-4 py-12 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-center rounded-3xl border border-[#E8E0D3] bg-white p-10 shadow-warm-md">
          <Loader2 className="h-5 w-5 animate-spin text-gold" />
          <span className="ms-3 text-sm font-semibold text-charcoal">
            جارٍ تحميل لوحة المضيف...
          </span>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-[70vh] px-4 py-12 md:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#F8D7DA] bg-[#FFF1F2] p-6 text-sm text-[#9F1239] shadow-warm-md">
          {errorMessage}
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-[70vh] px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-[#F1E5C9] bg-[#FFF8E6] px-5 py-4 text-sm font-semibold text-[#8A6A1F]">
          هذه نسخة مبدئية من لوحة المضيف.
        </div>

        <header className="space-y-2">
          <p className="text-sm font-semibold text-gold">منطقة المضيفين</p>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
              aria-hidden
            >
              <Home className="h-6 w-6" />
            </span>
            <h1 className="text-3xl font-extrabold text-charcoal md:text-4xl">
              أهلاً {displayName}
            </h1>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-muted md:text-base">
            ستتحول هذه الصفحة إلى مركز إدارة بيوت العطلات، الحجوزات، والأرباح
            خلال المراحل القادمة.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <HostCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="حالة التحقق"
            description="سنعرض حالة التحقق هنا قريباً بعد ربطها ببيانات KYC."
          />
          <HostCard
            icon={<Home className="h-5 w-5" />}
            title="بيوت عطلاتي"
            description="قريباً تقدر تضيف بيت عطلاتك الأول وتدير تفاصيله."
            tone="primary"
            action={
              <Link
                href="#"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E8E0D3] bg-white px-4 py-2 text-xs font-bold text-charcoal transition-colors hover:border-gold hover:text-gold"
              >
                <Plus className="h-4 w-4" />
                إضافة قريباً
              </Link>
            }
          />
          <HostCard
            icon={<CalendarCheck className="h-5 w-5" />}
            title="حجوزاتي"
            description="قريباً ستظهر طلبات الحجز الجديدة والحجوزات المؤكدة."
          />
          <HostCard
            icon={<Banknote className="h-5 w-5" />}
            title="أرباحي"
            description="قريباً ستتابع المدفوعات، الأرباح، وطلبات السحب من هنا."
          />
        </div>
      </div>
    </main>
  );
}

function HostCard({
  icon,
  title,
  description,
  action,
  tone = "gold",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  tone?: "primary" | "gold";
}) {
  return (
    <section className="rounded-2xl border border-[#E8E0D3] bg-white p-5 shadow-warm-md">
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          tone === "primary" ? "bg-primary/10 text-primary" : "bg-gold/10 text-gold",
        )}
      >
        {icon}
      </span>
      <h2 className="mt-4 text-lg font-extrabold text-charcoal">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-muted">{description}</p>
      {action}
    </section>
  );
}
