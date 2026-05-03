import Link from "next/link";
import { Camera, Globe, Play, Send } from "lucide-react";
import type { ReactNode } from "react";

const discoverLinks = ["الرئيسية", "البحث", "الوجهات"];
const supportLinks = ["مركز المساعدة", "تواصل معنا", "الشروط"];
const hostLinks = ["كن مضيفاً", "دليل المضيف"];
const appLinks = ["Google Play", "App Store"];

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="bg-[#3D3935]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-white md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <p className="text-base font-semibold">اشترك واكتشف وجهات سورية مذهلة شهرياً</p>
          <form className="flex w-full max-w-md items-center gap-2">
            <input
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              className="h-11 flex-1 rounded-full border border-white/20 bg-white/10 px-4 text-sm text-white placeholder:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            />
            <button
              type="button"
              className="h-11 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-[#a84a33]"
            >
              اشتراك
            </button>
          </form>
        </div>
      </div>

      <div className="bg-charcoal">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 text-[#C9C1B5] md:grid-cols-2 md:px-6 lg:grid-cols-5 lg:px-8">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-extrabold text-primary">سُكنى</h3>
            <p className="mt-3 text-sm leading-7">
              منصتك الموثوقة لاكتشاف وحجز السكن في سوريا بتجربة عربية حديثة وآمنة.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <SocialIcon icon={<Camera className="h-4 w-4" />} />
              <SocialIcon icon={<Globe className="h-4 w-4" />} />
              <SocialIcon icon={<Send className="h-4 w-4" />} />
              <SocialIcon icon={<Play className="h-4 w-4" />} />
            </div>
          </div>

          <FooterColumn title="اكتشف" links={discoverLinks} />
          <FooterColumn title="الدعم" links={supportLinks} />
          <FooterColumn title="للمضيفين" links={hostLinks} />
          <FooterColumn title="التطبيق" links={appLinks} />
        </div>
      </div>

      <div className="bg-[#1A1715]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-[#C9C1B5] md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <div className="order-3 md:order-1">© 2026 سُكنى</div>
          <div className="order-1 flex items-center justify-center gap-2 md:order-2">
            <button type="button" className="rounded-full px-3 py-1 text-[#C9C1B5] transition-colors hover:text-white">
              AR
            </button>
            <span>/</span>
            <button type="button" className="rounded-full px-3 py-1 text-[#C9C1B5] transition-colors hover:text-white">
              EN
            </button>
          </div>
          <div className="order-2 flex items-center gap-4 md:order-3">
            <Link href="#" className="transition-colors hover:text-white">
              Cookies
            </Link>
            <Link href="#" className="transition-colors hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-3 text-base font-bold text-white">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link}>
            <Link href="#" className="text-sm transition-colors hover:text-white">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ icon }: { icon: ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-[#C9C1B5] transition-colors hover:border-white/40 hover:text-white"
    >
      {icon}
    </button>
  );
}
