import { HostAuthShell } from "@/components/auth/host/HostAuthShell";

/**
 * Layout for host-only auth experiences (host login + onboarding wizard).
 *
 * Crucially does NOT render the public Navbar (no `[الكل][عقارات][فنادق]`
 * tabs, no guest dropdown) and uses a slimmer footer. Hosts land in a
 * focused space that signals "you're entering a partner area".
 */
export default function HostAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <HostAuthShell>{children}</HostAuthShell>;
}
