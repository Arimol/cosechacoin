import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Map, Sprout, Zap } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  title: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    title: "Panel de inversión",
  },
  {
    href: "/cosechas",
    label: "Cosechas",
    icon: Sprout,
    title: "Cosechas tokenizadas",
  },
  {
    href: "/impulsores",
    label: "Impulsores",
    icon: Zap,
    title: "Impulsores agrícolas",
  },
  {
    href: "/mapa",
    label: "Mapa",
    icon: Map,
    title: "Mapa de parcelas",
  },
];

export function getPageTitle(pathname: string | null): string {
  const item = NAV_ITEMS.find((n) => n.href === (pathname ?? "/"));
  return item?.title ?? "CosechaCoin";
}
