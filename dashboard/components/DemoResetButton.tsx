"use client";

import { useState } from "react";

const API_URL = "https://cosechacoin-backend.onrender.com";

export default function DemoResetButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [contractId, setContractId] = useState<string | null>(null);

  async function handleReset() {
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/api/demo/reset`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setContractId(json.data.cropContractId);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-semibold text-green-800">
              Demo activa en Stellar Testnet
            </p>
            <p className="text-sm text-green-700">
              Contrato desplegado y verificable en blockchain:
            </p>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${contractId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-green-800 underline break-all"
            >
              {contractId}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-border-subtle bg-white px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="flex items-center gap-2 font-semibold text-ink-primary">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7 2C5 7 4 13 6 20L9 21.5L10 11Z"
                fill="#1A5C38"
              />
              <path
                d="M17 2C19 7 20 13 18 20L15 21.5L14 11Z"
                fill="#1A5C38"
              />
              <ellipse cx="12" cy="12.5" rx="3.2" ry="7.5" fill="#C9A84C" />
              <ellipse cx="12" cy="12.5" rx="2.2" ry="6.2" fill="#DDB94A" />
              <path
                d="M10 7.5h4M10 10h4M10 12.5h4M10 15h4M10 17.5h4"
                stroke="#B8943A"
                strokeWidth="0.6"
                strokeLinecap="round"
              />
              <path
                d="M12 20.5V22"
                stroke="#1A5C38"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Demo en Blockchain Real
          </p>
          <p className="text-sm text-ink-secondary">
            Despliega contratos frescos en Stellar Testnet verificables públicamente.
            Tarda ~30 segundos.
          </p>
        </div>
        <button
          onClick={handleReset}
          disabled={status === "loading"}
          className="ml-4 rounded-lg bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark/90 disabled:opacity-60"
        >
          {status === "loading" ? "Desplegando… (~30s)" : "Iniciar Demo Real"}
        </button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">
          Error al conectar. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}
