"use client";

import { useState } from "react";
import Button from "./Button";

interface InvestModalProps {
  cropLabel: string;
  open: boolean;
  onClose: () => void;
  onInvest: (amount: number, secret: string) => Promise<void>;
}

export default function InvestModal({
  cropLabel,
  open,
  onClose,
  onInvest,
}: InvestModalProps) {
  const [amount, setAmount] = useState(10);
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onInvest(amount, secret);
      onClose();
      setSecret("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al invertir");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invest-title"
    >
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-white p-6">
        <h2 id="invest-title" className="text-lg font-semibold text-ink-primary">
          Invertir en {cropLabel}
        </h2>
        <p className="mt-2 text-sm text-ink-secondary">
          Se enviará una transacción a Soroban Testnet. Requiere la clave secreta
          del inversor (solo desarrollo).
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-primary">
              Cantidad de tokens
            </label>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-brand-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-primary">
              Clave secreta inversor (S...)
            </label>
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-border-subtle px-3 py-2 text-sm outline-none focus:border-brand-medium"
              placeholder="SB..."
            />
          </div>
          {error && (
            <p className="text-sm text-red-700">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Procesando…" : "Confirmar inversión"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
