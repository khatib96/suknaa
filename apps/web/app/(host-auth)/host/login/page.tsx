import type { Metadata } from "next";
import { HostLoginForm } from "@/components/auth/host/HostLoginForm";

export const metadata: Metadata = {
  title: "دخول المضيفين",
  description: "ادخل لوحة المضيفين على سُكنى لإدارة عقاراتك وأرباحك.",
};

export default function HostLoginPage() {
  return (
    <section className="px-4 py-12 md:px-6 md:py-16 lg:px-8">
      <HostLoginForm />
    </section>
  );
}
