"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApiError, apiRequest, getErrorMessageAr } from "@/lib/web-api";
import {
  HOST_APPLY_STEP_FIELDS,
  HOST_APPLY_TOTAL_STEPS,
  hostApplySchema,
  parseHostApplyStep,
  type HostApplyStep,
  type HostApplyValues,
} from "@/lib/auth-schemas";
import { WizardProgressBar } from "./WizardProgressBar";
import { Step1Category } from "./wizard-steps/Step1Category";
import { Step2Subtype } from "./wizard-steps/Step2Subtype";
import { Step3BasicInfo } from "./wizard-steps/Step3BasicInfo";
import { Step4QuickContext } from "./wizard-steps/Step4QuickContext";
import { Step5Review } from "./wizard-steps/Step5Review";

const SKIPPABLE_STEPS = new Set<HostApplyStep>([4]);

/**
 * Container for the 5-step host onboarding wizard.
 *
 * - Single `useForm` instance shared with all step components via FormProvider.
 * - Active step lives in the URL (`?step=N`) so the back button works.
 * - On "next", we run `form.trigger([...stepFields])` and only advance on success.
 * - Step 4 is skippable; "تخطي" jumps straight to step 5 without validating.
 *
 * State (form values) lives in React only — refresh resets the wizard. This is
 * acceptable for Phase 1 (mock); when the backend lands in Phase 2 we'll
 * persist a draft on the server keyed by an anonymous session id.
 */
export function HostApplyWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const step = useMemo<HostApplyStep>(
    () => parseHostApplyStep(searchParams?.get("step")),
    [searchParams],
  );

  const [submitState, setSubmitState] = useState<
    "idle" | "submitting" | "ok" | "email_verification_required" | "phone_verification_required"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [pendingBecomeHostPayload, setPendingBecomeHostPayload] = useState<
    Record<string, unknown> | null
  >(null);

  const form = useForm<HostApplyValues>({
    resolver: zodResolver(hostApplySchema),
    mode: "onChange",
    defaultValues: {
      hostCategory: undefined,
      hostSubtype: undefined,
      fullName: "",
      phone: "",
      email: "",
      password: "",
      cityId: "",
      acceptTerms: false,
      portfolioSize: undefined,
      startTimeline: undefined,
      biggestChallenge: undefined,
    } as Partial<HostApplyValues> as HostApplyValues,
  });

  const goToStep = (next: HostApplyStep) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("step", String(next));
    router.replace(`?${params.toString()}`, { scroll: false });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const validateStep = async (which: HostApplyStep): Promise<boolean> => {
    const fields = HOST_APPLY_STEP_FIELDS[which];
    if (fields.length === 0) return true;
    return form.trigger([...fields] as Array<keyof HostApplyValues>);
  };

  const onNext = async () => {
    const ok = await validateStep(step);
    if (!ok) return;
    if (step < HOST_APPLY_TOTAL_STEPS) {
      goToStep((step + 1) as HostApplyStep);
    }
  };

  const onPrev = () => {
    if (step > 1) {
      goToStep((step - 1) as HostApplyStep);
    }
  };

  const onSkip = () => {
    if (step < HOST_APPLY_TOTAL_STEPS) {
      goToStep((step + 1) as HostApplyStep);
    }
  };

  const normalizePhone = (phone: string): string => phone.replace(/[^\d+]/g, "");

  const mapBecomeHostPayload = (values: HostApplyValues): Record<string, unknown> => ({
    hostCategory: values.hostCategory,
    hostSubtype: values.hostSubtype === "re_office" ? "real_estate_office" : values.hostSubtype,
    displayName: values.fullName,
    companyName: null,
    companyRegistration: null,
    taxId: null,
    bioAr: null,
    bioEn: null,
    withdrawalSchedule: "monthly",
  });

  const ensureAuthenticated = async (values: HostApplyValues): Promise<boolean> => {
    try {
      await apiRequest({ path: "/api/me", method: "GET" });
      return true;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    }

    try {
      await apiRequest({
        path: "/api/auth/signup",
        method: "POST",
        body: {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          preferredLanguage: "ar",
          marketingOptIn: false,
        },
      });
      setSubmitState("email_verification_required");
      return false;
    } catch (error) {
      if (error instanceof ApiError && error.code === "EMAIL_ALREADY_EXISTS") {
        const loginResult = await apiRequest<{
          requires_2fa?: boolean;
        }>({
          path: "/api/auth/login",
          method: "POST",
          body: {
            email: values.email,
            password: values.password,
            rememberMe: false,
          },
        });
        if (loginResult.requires_2fa) {
          throw new Error("هذا الحساب مفعّل عليه التحقق بخطوتين. سجل الدخول من صفحة المضيف ثم أكمل الطلب.");
        }
        return true;
      }

      if (error instanceof ApiError && error.code === "EMAIL_NOT_VERIFIED") {
        setSubmitState("email_verification_required");
        return false;
      }

      throw error;
    }
  };

  const tryBecomeHost = async (payload: Record<string, unknown>): Promise<void> => {
    await apiRequest({
      path: "/api/me/become-host",
      method: "POST",
      body: payload,
    });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    setSubmitState("submitting");
    const becomeHostPayload = mapBecomeHostPayload(values);
    setPendingBecomeHostPayload(becomeHostPayload);

    try {
      const isAuthed = await ensureAuthenticated(values);
      if (!isAuthed) {
        return;
      }

      await tryBecomeHost(becomeHostPayload);
      setSubmitState("ok");
      router.push("/become-a-host/kyc");
    } catch (error) {
      if (error instanceof ApiError && error.code === "PHONE_VERIFICATION_REQUIRED") {
        setSubmitState("phone_verification_required");
        return;
      }
      setSubmitState("idle");
      setErrorMessage(getErrorMessageAr(error));
    }
  });

  const requestOtp = async () => {
    const phone = form.getValues("phone");
    setErrorMessage(null);
    setIsSendingOtp(true);
    try {
      await apiRequest({
        path: "/api/auth/otp/request",
        method: "POST",
        body: {
          purpose: "phone_verification",
          channel: "phone",
          destination: normalizePhone(phone),
        },
      });
    } catch (error) {
      setErrorMessage(getErrorMessageAr(error));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtpAndRetry = async () => {
    const phone = form.getValues("phone");
    if (!otpCode.trim() || !pendingBecomeHostPayload) {
      return;
    }
    setErrorMessage(null);
    setIsVerifyingOtp(true);
    try {
      await apiRequest({
        path: "/api/auth/otp/verify",
        method: "POST",
        body: {
          purpose: "phone_verification",
          destination: normalizePhone(phone),
          code: otpCode.trim(),
        },
      });
      await tryBecomeHost(pendingBecomeHostPayload);
      setSubmitState("ok");
      router.push("/become-a-host/kyc");
    } catch (error) {
      setErrorMessage(getErrorMessageAr(error));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const isLastStep = step === HOST_APPLY_TOTAL_STEPS;
  const submitted = submitState === "ok";
  const isSkippable = SKIPPABLE_STEPS.has(step) && !submitted;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {!submitted ? <WizardProgressBar currentStep={step} /> : null}

      <div
        className={cn(
          "rounded-3xl border border-[#E8E0D3] bg-white shadow-warm-md",
          submitted ? "p-7 md:p-9" : "p-7 md:p-10",
        )}
      >
        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate>
            {errorMessage ? (
              <p className="mb-5 rounded-xl border border-[#F8D7DA] bg-[#FFF1F2] px-4 py-3 text-sm text-[#9F1239]">
                {errorMessage}
              </p>
            ) : null}
            {submitState === "email_verification_required" ? (
              <p className="mb-5 rounded-xl border border-[#D5E9DD] bg-[#EDF7F1] px-4 py-3 text-sm text-[#1F4C3A]">
                أنشأنا حسابك بنجاح. تحقق من بريدك الإلكتروني أولاً، ثم سجّل الدخول كمضيف لإكمال الطلب.
              </p>
            ) : null}
            {submitState === "phone_verification_required" ? (
              <div className="mb-5 space-y-3 rounded-2xl border border-[#F1E5C9] bg-[#FFF8E6] p-4 text-sm text-[#8A6A1F]">
                <p className="font-semibold">يلزم توثيق رقم الهاتف قبل تفعيل حساب المضيف.</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      void requestOtp();
                    }}
                    disabled={isSendingOtp}
                    className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSendingOtp ? "جارٍ إرسال الرمز..." : "إرسال رمز التحقق"}
                  </button>
                  <input
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    dir="ltr"
                    placeholder="123456"
                    className="rounded-xl border border-[#E8E0D3] bg-white px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      void verifyOtpAndRetry();
                    }}
                    disabled={isVerifyingOtp}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isVerifyingOtp ? "جارٍ التحقق..." : "تأكيد الرمز وإكمال الطلب"}
                  </button>
                </div>
              </div>
            ) : null}
            {step === 1 ? <Step1Category /> : null}
            {step === 2 ? <Step2Subtype /> : null}
            {step === 3 ? <Step3BasicInfo /> : null}
            {step === 4 ? <Step4QuickContext /> : null}
            {step === 5 ? <Step5Review submitted={submitted} /> : null}

            {!submitted ? (
              <div className="mt-9 flex flex-col-reverse gap-3 border-t border-[#F1ECE2] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={onPrev}
                  disabled={step === 1}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#E8E0D3] bg-white px-5 py-2.5 text-sm font-semibold text-charcoal transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4" />
                  السابق
                </button>

                <div className="flex items-center gap-2 sm:gap-3">
                  {isSkippable ? (
                    <button
                      type="button"
                      onClick={onSkip}
                      className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:text-primary"
                    >
                      تخطي هذه الخطوة
                    </button>
                  ) : null}

                  {!isLastStep ? (
                    <button
                      type="button"
                      onClick={onNext}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95"
                    >
                      التالي
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitState === "submitting"}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] hover:shadow-warm-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitState === "submitting" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {submitState === "submitting"
                        ? "جارٍ إنشاء الحساب..."
                        : "أنشئ حسابي"}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </form>
        </FormProvider>
      </div>

      {!submitted ? (
        <p className="text-center text-xs text-muted">
          عندك حساب مضيف؟{" "}
          <Link
            href="/host/login"
            className="font-semibold text-primary hover:underline"
          >
            سجّل دخولك
          </Link>
        </p>
      ) : null}
    </div>
  );
}
