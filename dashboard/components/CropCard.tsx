import type { ReactNode } from "react";
import type { CropStatus } from "@/types";

export interface CropCardProps {
  cropName: string;
  region: string;
  farmer: string;
  tokensAvailable: number;
  totalTokens: number;
  pricePerToken: number;
  priceLabel?: string;
  harvestDate: string;
  status: CropStatus;
  tokensSold?: number;
  actions?: ReactNode;
}

function statusStyles(status: CropStatus): string {
  switch (status) {
    case "Activa":
      return "bg-brand-light text-brand-dark";
    case "Validada":
      return "bg-amber-50 text-amber-900";
    case "Completada":
      return "bg-brand-dark text-white";
    default:
      return "bg-gray-100 text-ink-secondary";
  }
}

export default function CropCard({
  cropName,
  region,
  farmer,
  tokensAvailable,
  totalTokens,
  pricePerToken,
  priceLabel,
  harvestDate,
  status,
  tokensSold,
  actions,
}: CropCardProps) {
  const sold = tokensSold ?? totalTokens - tokensAvailable;
  const progress = totalTokens > 0 ? (sold / totalTokens) * 100 : 0;
  const price =
    priceLabel ?? `$${pricePerToken.toFixed(2)} USDC`;

  return (
    <article className="rounded-xl border border-border-subtle bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-ink-primary">
            {cropName}
          </h3>
          <p className="mt-1 text-sm text-ink-secondary">{region}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles(status)}`}
        >
          {status}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-secondary">Productor</dt>
          <dd className="font-medium text-ink-primary">{farmer}</dd>
        </div>
        <div>
          <dt className="text-ink-secondary">Precio / token</dt>
          <dd className="font-medium text-ink-primary">{price}</dd>
        </div>
        <div>
          <dt className="text-ink-secondary">Tokens vendidos</dt>
          <dd className="font-medium text-ink-primary">
            {sold.toLocaleString("es-CR")} / {totalTokens.toLocaleString("es-CR")}
          </dd>
        </div>
        <div>
          <dt className="text-ink-secondary">Cosecha estimada</dt>
          <dd className="font-medium text-ink-primary">{harvestDate}</dd>
        </div>
      </dl>

      <div className="mt-5">
        <div className="mb-1.5 flex justify-between text-xs text-ink-secondary">
          <span>Progreso de tokenización</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-brand-light">
          <div
            className="h-full rounded-full bg-brand-medium transition-all"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-ink-secondary">
          {tokensAvailable.toLocaleString("es-CR")} tokens disponibles
        </p>
      </div>

      {actions && <div className="mt-5 flex flex-wrap gap-2">{actions}</div>}
    </article>
  );
}
