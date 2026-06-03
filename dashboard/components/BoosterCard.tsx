import type { ReactNode } from "react";
import type { BoosterStatus, BoosterType } from "@/types";

export interface BoosterCardProps {
  boosterType: BoosterType | string;
  parcel: string;
  amount: string;
  status: BoosterStatus;
  provider: string;
  actions?: ReactNode;
}

function statusColor(status: BoosterStatus): {
  badge: string;
  dot: string;
} {
  switch (status) {
    case "Pendiente":
      return {
        badge: "bg-gray-100 text-ink-secondary",
        dot: "bg-gray-400",
      };
    case "Activo":
      return {
        badge: "bg-brand-light text-brand-medium",
        dot: "bg-brand-medium",
      };
    case "Completado":
      return {
        badge: "bg-brand-dark text-white",
        dot: "bg-brand-dark",
      };
    default:
      return {
        badge: "bg-gray-100 text-ink-secondary",
        dot: "bg-gray-400",
      };
  }
}

export default function BoosterCard({
  boosterType,
  parcel,
  amount,
  status,
  provider,
  actions,
}: BoosterCardProps) {
  const colors = statusColor(status);

  return (
    <article className="rounded-xl border border-border-subtle bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${colors.dot}`}
            aria-hidden
          />
          <div>
            <h3 className="font-semibold text-ink-primary">{boosterType}</h3>
            <p className="mt-1 text-sm text-ink-secondary">{parcel}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${colors.badge}`}
        >
          {status}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-secondary">Monto financiado</dt>
          <dd className="font-medium text-ink-primary">{amount}</dd>
        </div>
        <div>
          <dt className="text-ink-secondary">Proveedor</dt>
          <dd className="font-medium text-ink-primary">{provider}</dd>
        </div>
      </dl>

      {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}
