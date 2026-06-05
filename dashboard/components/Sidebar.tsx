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
		   <path d="M16 28 L16 8" stroke="#1A5C38" strokeWidth="2" strokeLinecap="round"/>
		   <path d="M16 10 C16 10 11 8 10 4 C13 4 16 7 16 10Z" stroke="#1A5C38" strokeWidth="1.5" strokeLinejoin="round"/>
		   <path d="M16 10 C16 10 21 8 22 4 C19 4 16 7 16 10Z" stroke="#1A5C38" strokeWidth="1.5" strokeLinejoin="round"/>
		   <path d="M16 16 C16 16 11 14 10 10 C13 10 16 13 16 16Z" stroke="#1A5C38" strokeWidth="1.5" strokeLinejoin="round"/>
		   <path d="M16 16 C16 16 21 14 22 10 C19 10 16 13 16 16Z" stroke="#1A5C38" strokeWidth="1.5" strokeLinejoin="round"/>
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
