import Link from "next/link";
import {
  Clock,
  HelpCircle,
  Mail,
  MessageCircle,
} from "lucide-react";

export function ContactSidebar() {
  return (
    <aside className="space-y-4">
      <ContactCard
        icon={<MessageCircle className="h-5 w-5" />}
        title="WhatsApp Business"
        description="الأسرع للتواصل المباشر."
        actionLabel="فتح المحادثة"
        actionHref="https://wa.me/963000000000"
        external
        note="(الرقم الرسمي قريباً)"
      />

      <ContactCard
        icon={<Mail className="h-5 w-5" />}
        title="البريد الإلكتروني"
        description="للاستفسارات الرسمية والمستندات."
        actionLabel="support@suknaa.com"
        actionHref="mailto:support@suknaa.com"
        external
      />

      <ContactCard
        icon={<Clock className="h-5 w-5" />}
        title="أوقات الدوام"
        description="خلال فترة البيتا، الدعم متاح 24/7."
      />

      <ContactCard
        icon={<HelpCircle className="h-5 w-5" />}
        title="مركز المساعدة"
        description="جواب سريع للأسئلة الشائعة."
        actionLabel="افتح المركز"
        actionHref="/help"
      />
    </aside>
  );
}

type ContactCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  external?: boolean;
  note?: string;
};

function ContactCard({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  external,
  note,
}: ContactCardProps) {
  return (
    <article className="rounded-2xl border border-[#F5EFE6] bg-white p-5 shadow-warm-sm">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-charcoal">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-charcoal/75">
            {description}
          </p>
          {actionLabel && actionHref ? (
            external ? (
              <a
                href={actionHref}
                target="_blank"
                rel="noreferrer noopener"
                className="font-numeric mt-2 inline-block text-sm font-bold text-primary hover:underline"
                dir="ltr"
              >
                {actionLabel}
              </a>
            ) : (
              <Link
                href={actionHref}
                className="mt-2 inline-block text-sm font-bold text-primary hover:underline"
              >
                {actionLabel}
              </Link>
            )
          ) : null}
          {note ? (
            <p className="mt-1 text-xs text-muted">{note}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
