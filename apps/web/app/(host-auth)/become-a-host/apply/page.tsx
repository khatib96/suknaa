import type { Metadata } from "next";
import { Suspense } from "react";
import { HostApplyWizard } from "@/components/auth/host/HostApplyWizard";

export const metadata: Metadata = {
  title: "التسجيل كمضيف",
  description:
    "خطوات بسيطة للانضمام كمضيف على سُكنى — 5 خطوات لا تتجاوز ثلاث دقائق.",
};

export default function HostApplyPage() {
  return (
    <section className="px-4 py-10 md:px-6 md:py-14 lg:px-8">
      <Suspense fallback={<div className="h-[600px]" />}>
        <HostApplyWizard />
      </Suspense>
    </section>
  );
}
