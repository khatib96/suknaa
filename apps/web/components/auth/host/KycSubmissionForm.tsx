"use client";

import { useMemo, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { ApiError, apiRequest, getErrorMessageAr } from "@/lib/web-api";

type KycFileKind =
  | "id_front"
  | "id_back"
  | "selfie"
  | "ownership_proof"
  | "company_registration"
  | "tax_certificate"
  | "authorization_letter"
  | "hotel_license";

const FILE_FIELDS: Array<{
  kind: KycFileKind;
  label: string;
  requirement: "always" | "host_type";
}> = [
  { kind: "id_front", label: "صورة الهوية (الوجه الأمامي)", requirement: "always" },
  { kind: "id_back", label: "صورة الهوية (الوجه الخلفي)", requirement: "always" },
  { kind: "selfie", label: "سيلفي مع الهوية", requirement: "always" },
  { kind: "ownership_proof", label: "إثبات ملكية", requirement: "host_type" },
  { kind: "company_registration", label: "سجل تجاري", requirement: "host_type" },
  { kind: "tax_certificate", label: "شهادة ضريبية", requirement: "host_type" },
  { kind: "authorization_letter", label: "كتاب تفويض (عند الحاجة)", requirement: "host_type" },
  { kind: "hotel_license", label: "رخصة فندق", requirement: "host_type" },
];

interface KycHistoryItem {
  id: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string | null;
}

export function KycSubmissionForm() {
  const [idDocumentType, setIdDocumentType] = useState("national_id");
  const [files, setFiles] = useState<Partial<Record<KycFileKind, File>>>({});
  const [uploadedKeys, setUploadedKeys] = useState<Partial<Record<KycFileKind, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [history, setHistory] = useState<KycHistoryItem[]>([]);

  const requiredMissing = useMemo(() => {
    return FILE_FIELDS.filter((field) => field.requirement === "always").filter((field) => {
      return !files[field.kind] && !uploadedKeys[field.kind];
    });
  }, [files, uploadedKeys]);

  const fetchHistory = async () => {
    try {
      const historyResult = await apiRequest<{
        items?: KycHistoryItem[];
      }>({
        path: "/api/me/kyc/history?limit=5",
        method: "GET",
      });
      setHistory(historyResult.items ?? []);
    } catch {
      // Keep the form usable even if history fails.
    }
  };

  const uploadSingleFile = async (kind: KycFileKind, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("fileKind", kind);
    formData.append("file", file);
    const uploadResult = await apiRequest<{
      storageKey?: string;
    }>({
      path: "/api/me/kyc/upload",
      method: "POST",
      body: formData,
    });
    if (!uploadResult.storageKey) {
      throw new Error("تعذر رفع الملف");
    }
    return uploadResult.storageKey;
  };

  const submit = async () => {
    if (requiredMissing.length > 0) {
      setErrorMessage("الرجاء إرفاق الملفات المطلوبة أولاً.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setMissingFields([]);
    setIsSubmitting(true);

    try {
      const nextKeys: Partial<Record<KycFileKind, string>> = { ...uploadedKeys };
      for (const field of FILE_FIELDS) {
        const selected = files[field.kind];
        if (!selected || nextKeys[field.kind]) {
          continue;
        }
        nextKeys[field.kind] = await uploadSingleFile(field.kind, selected);
      }
      setUploadedKeys(nextKeys);

      await apiRequest({
        path: "/api/me/kyc",
        method: "POST",
        body: {
          idDocumentType,
          idFrontKey: nextKeys.id_front,
          idBackKey: nextKeys.id_back,
          selfieKey: nextKeys.selfie,
          ownershipProofKey: nextKeys.ownership_proof,
          companyRegistrationKey: nextKeys.company_registration,
          taxCertificateKey: nextKeys.tax_certificate,
          authorizationLetterKey: nextKeys.authorization_letter,
          hotelLicenseKey: nextKeys.hotel_license,
        },
      });

      setSuccessMessage("تم إرسال طلب KYC بنجاح. سيظهر في سجل الطلبات بالأسفل.");
      await fetchHistory();
    } catch (error) {
      if (error instanceof ApiError && error.code === "KYC_INVALID_DOCS") {
        const missing = error.details?.missingFields;
        if (Array.isArray(missing)) {
          setMissingFields(missing.filter((v): v is string => typeof v === "string"));
        }
      }
      setErrorMessage(getErrorMessageAr(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="rounded-3xl border border-[#E8E0D3] bg-white p-6 shadow-warm-md md:p-8">
        <h1 className="text-2xl font-extrabold text-charcoal md:text-3xl">
          تحقق الهوية (KYC)
        </h1>
        <p className="mt-2 text-sm text-muted">
          ارفع الوثائق المطلوبة حسب نوع حسابك. الملفات تبقى ضمن مسار آمن ولا تُعرض مفاتيح التخزين في الواجهة.
        </p>
        <div className="mt-4 rounded-xl border border-[#E8E0D3] bg-cream/60 px-4 py-3 text-xs leading-relaxed text-charcoal">
          <p className="font-semibold">متطلبات KYC حسب نوع المضيف:</p>
          <p className="mt-1">
            فرد: <span className="font-semibold">id_front, id_back, selfie, ownership_proof</span>
          </p>
          <p>
            مكتب عقاري: <span className="font-semibold">id_front, id_back, selfie, company_registration, tax_certificate</span>
          </p>
          <p>
            شركة فندقية: <span className="font-semibold">id_front, id_back, selfie, company_registration, tax_certificate, hotel_license</span>
          </p>
          <p className="mt-1 text-muted">
            الحقول الموسومة بـ * مطلوبة دائمًا. الحقول الموسومة بـ &quot;حسب نوع المضيف&quot; قد تكون إلزامية بحسب subtype.
          </p>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-[#F8D7DA] bg-[#FFF1F2] px-4 py-3 text-sm text-[#9F1239]">
            {errorMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p className="mt-4 rounded-xl border border-[#D5E9DD] bg-[#EDF7F1] px-4 py-3 text-sm text-[#1F4C3A]">
            {successMessage}
          </p>
        ) : null}
        {missingFields.length > 0 ? (
          <p className="mt-3 text-xs text-[#9F1239]">
            مستندات ناقصة بحسب نوع الحساب: {missingFields.join("، ")}
          </p>
        ) : null}

        <div className="mt-6 space-y-5">
          <label className="block space-y-1">
            <span className="text-sm font-semibold text-charcoal">نوع وثيقة الهوية</span>
            <select
              value={idDocumentType}
              onChange={(event) => setIdDocumentType(event.target.value)}
              className="w-full rounded-xl border border-[#E8E0D3] bg-white px-3 py-2 text-sm"
            >
              <option value="national_id">بطاقة شخصية</option>
              <option value="passport">جواز سفر</option>
              <option value="driver_license">رخصة قيادة</option>
            </select>
          </label>

          {FILE_FIELDS.map((field) => (
            <label key={field.kind} className="block space-y-1">
              <span className="text-sm font-semibold text-charcoal">
                {field.label}{" "}
                {field.requirement === "always" ? (
                  <span className="text-[#9F1239]">*</span>
                ) : (
                  <span className="text-xs font-medium text-muted">(حسب نوع المضيف)</span>
                )}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setFiles((prev) => ({ ...prev, [field.kind]: file }));
                }}
                className="w-full rounded-xl border border-[#E8E0D3] bg-white px-3 py-2 text-sm file:me-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-1 file:text-sm file:font-semibold"
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            void submit();
          }}
          disabled={isSubmitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-white shadow-warm-md transition-all duration-200 hover:bg-[#a84a33] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isSubmitting ? "جارٍ رفع وإرسال الملفات..." : "إرسال طلب KYC"}
        </button>
      </div>

      <div className="rounded-3xl border border-[#E8E0D3] bg-white p-6 shadow-warm-md">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-charcoal">آخر طلبات KYC</h2>
          <button
            type="button"
            onClick={() => {
              void fetchHistory();
            }}
            className="rounded-full border border-[#E8E0D3] px-4 py-1.5 text-xs font-semibold text-charcoal hover:border-primary hover:text-primary"
          >
            تحديث السجل
          </button>
        </div>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-muted">لا يوجد سجل بعد.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#F1ECE2] bg-cream/40 px-4 py-3 text-sm"
              >
                <p className="font-semibold text-charcoal">الحالة: {item.status}</p>
                <p className="text-xs text-muted">
                  تاريخ الإرسال: {new Date(item.submittedAt).toLocaleString("en-GB")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
