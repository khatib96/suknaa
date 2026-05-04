import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "إنشاء حساب",
  description: "أنشئ حسابك على سُكنى للبدء بالحجز فوراً.",
};

type PageProps = {
  searchParams: Promise<{ intent?: string | string[] }>;
};

export default async function SignupPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const intentRaw = Array.isArray(sp.intent) ? sp.intent[0] : sp.intent;

  // Backward-compat: any old bookmark of /signup?intent=host now lands
  // on the dedicated host onboarding wizard.
  if (intentRaw === "host") {
    redirect("/become-a-host/apply");
  }

  return (
    <main className="bg-cream pt-28 pb-16 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <SignupForm />
      </div>
    </main>
  );
}
