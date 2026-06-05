"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_ITEMS } from "@/lib/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentPath = mounted ? pathname ?? "/" : "/";

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border-subtle bg-white">
      <div className="border-b border-border-subtle px-5 py-6">
        <Link href="/" className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="CosechaCoin">
            <circle cx="16" cy="16" r="15" stroke="#C9A84C" strokeWidth="2"/>
            <path d="M16 26 C16 26 8 20 8 13 C8 9 11.5 7 16 7 C20.5 7 24 9 24 13 C24 20 16 26 16 26Z" fill="#1A5C38"/>
            <path d="M16 7 L16 20" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M12 11 C12 11 14 13 16 12 C18 11 20 13 20 13" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          </svg>
          <div>
            <p className="text-sm font-semibold text-brand-dark">CosechaCoin</p>
            <p className="text-xs text-ink-secondary">Inversores</p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active = currentPath === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-light text-brand-dark"
                  : "text-ink-secondary hover:bg-surface-base hover:text-ink-primary"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] shrink-0 ${
                  active ? "text-brand-medium" : "text-ink-secondary"
                }`}
                strokeWidth={1.75}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle px-5 py-4">
        <p className="text-xs text-ink-secondary">Stellar Testnet</p>
        <p className="mt-1 text-xs font-medium text-brand-medium">
          Soroban · Cosechas tokenizadas
        </p>
      </div>
    </aside>
  );
}
