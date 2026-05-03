import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "ادخل إلى حسابك على سُكنى — كزبون أو كمؤجِّر.",
};

type PageProps = {
  searchParams: Promise<{ intent?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const intentRaw = Array.isArray(sp.intent) ? sp.intent[0] : sp.intent;

  return (
    <main className="bg-cream pt-28 pb-16 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <LoginForm initialIntent={intentRaw} />
      </div>
    </main>
  );
}
