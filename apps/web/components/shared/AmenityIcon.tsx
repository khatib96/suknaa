import * as Lucide from "lucide-react";
import { Tag } from "lucide-react";

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const ICON_MAP: Record<string, IconComponent> = Lucide as unknown as Record<
  string,
  IconComponent
>;

/**
 * Renders a Lucide icon by name (string). Falls back to a generic Tag icon
 * if the name is unknown — never crashes on a missing amenity icon.
 */
export function AmenityIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? Tag;
  return <Icon className={className} aria-hidden />;
}
