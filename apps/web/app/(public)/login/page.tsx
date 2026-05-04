import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
  description: "ادخل إلى حسابك على سُكنى وأكمل رحلتك.",
};

type PageProps = {
  searchParams: Promise<{ intent?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const intentRaw = Array.isArray(sp.intent) ? sp.intent[0] : sp.intent;

  // Backward-compat: any old bookmark of /login?intent=host now lands
  // on the dedicated host login page.
  if (intentRaw === "host") {
    redirect("/host/login");
  }

  return (
    <main className="bg-cream pt-28 pb-16 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <LoginForm />
      </div>
    </main>
  );
}
