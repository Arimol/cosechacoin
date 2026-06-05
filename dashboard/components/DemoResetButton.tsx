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
          <p className="font-semibold text-ink-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
     xmlns="http://www.w3.org/2000/svg" 
     style={{display:"inline",marginRight:"8px",verticalAlign:"middle"}}>
  <path d="M12 2C12 2 4 6 4 13C4 17.4 7.6 21 12 21C16.4 21 20 17.4 20 13C20 6 12 2 12 2Z" 
        stroke="#1A5C38" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M12 21L12 10" stroke="#1A5C38" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M12 14C12 14 9 12 8 9C10 9 12 11 12 14Z" 
        stroke="#1A5C38" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M12 14C12 14 15 12 16 9C14 9 12 11 12 14Z" 
        stroke="#1A5C38" strokeWidth="1.5" strokeLinejoin="round"/>
</svg>Demo en Blockchain Real
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
