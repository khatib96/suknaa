"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Field, inputClass } from "@/components/auth/form-primitives";
import {
  contactSchema,
  type ContactFormValues,
} from "@/lib/contact-schema";

export function ContactForm() {
  const [submitState, setSubmitState] = useState<"idle" | "ok">("idle");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const { register, handleSubmit, formState, reset } = form;
  const { errors, isSubmitting } = formState;

  const onSubmit = (values: ContactFormValues) =>
    new Promise<void>((resolve) =>
      setTimeout(() => {
        console.info("[mock] contact form submitted", values);
        setSubmitState("ok");
        reset();
        resolve();
      }, 600),
    );

  if (submitState === "ok") {
    return (
      <div className="rounded-3xl border border-[#E8F3EE] bg-[#E8F3EE] p-8 text-center md:p-10">
        <h2 className="text-2xl font-extrabold text-[#2C6850]">
          استلمنا رسالتك ✓
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#2C6850]/85 md:text-base">
          سيتواصل معك فريق سُكنى خلال 24 ساعة كحدٍّ أقصى. شكراً على ثقتك بنا.
        </p>
        <button
          type="button"
          onClick={() => setSubmitState("idle")}
          className="mt-5 inline-flex items-center justify-center rounded-full border border-[#2C6850] px-5 py-2 text-sm font-bold text-[#2C6850] transition-colors hover:bg-[#2C6850] hover:text-white"
        >
          إرسال رسالة أخرى
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl border border-[#F5EFE6] bg-white p-7 shadow-warm-md md:p-9"
      noValidate
    >
      <h2 className="text-2xl font-extrabold text-charcoal">أرسل رسالة</h2>
      <p className="mt-2 text-sm text-muted">
        املأ الحقول أدناه وسنتواصل معك بأسرع وقت ممكن.
      </p>

      <div className="mt-7 space-y-4">
        <Field id="name" label="الاسم الكامل" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="مثال: أحمد عبدالله"
            {...register("name")}
            className={inputClass(Boolean(errors.name))}
          />
        </Field>

        <Field id="email" label="البريد الإلكتروني" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
            {...register("email")}
            className={inputClass(Boolean(errors.email))}
          />
        </Field>

        <Field id="subject" label="الموضوع" error={errors.subject?.message}>
          <input
            id="subject"
            type="text"
            placeholder="مثال: استفسار عن طريقة الحجز"
            {...register("subject")}
            className={inputClass(Boolean(errors.subject))}
          />
        </Field>

        <Field id="message" label="الرسالة" error={errors.message?.message}>
          <textarea
            id="message"
            rows={6}
            placeholder="اكتب رسالتك هنا..."
            {...register("message")}
            className={cn(
              "block w-full rounded-xl border bg-white px-4 py-3 text-sm leading-7 text-charcoal placeholder:text-muted/70 focus-visible:outline-none focus-visible:ring-2",
              errors.message
                ? "border-[#B83A3A] focus-visible:border-[#B83A3A] focus-visible:ring-[#B83A3A]/20"
                : "border-[#E8E0D3] focus-visible:border-primary focus-visible:ring-primary/20",
            )}
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-base font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isSubmitting ? "جارٍ الإرسال..." : "إرسال الرسالة"}
        </button>
      </div>
    </form>
  );
}
