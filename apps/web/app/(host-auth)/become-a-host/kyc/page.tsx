import type { Metadata } from "next";
import { KycSubmissionForm } from "@/components/auth/host/KycSubmissionForm";

export const metadata: Metadata = {
  title: "تحقق الهوية للمضيف",
  description: "ارفع وثائق KYC المطلوبة لتفعيل حساب المضيف على سُكنى.",
};

export default function HostKycPage() {
  return (
    <section className="px-4 py-10 md:px-6 md:py-14 lg:px-8">
      <KycSubmissionForm />
    </section>
  );
}
