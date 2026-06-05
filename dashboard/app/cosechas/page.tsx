"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import CropCard from "@/components/CropCard";
import Button from "@/components/Button";
import InvestModal from "@/components/InvestModal";
import { MOCK_CROPS } from "@/lib/mockData";
import { investInCrop } from "@/lib/api";
import type { Crop, CropStatus } from "@/types";

const API_URL = "https://cosechacoin-backend.onrender.com";

function mapStatus(status: string): CropStatus {
  if (status === "active") return "Activa";
  if (status === "validated") return "Validada";
  if (status === "completed") return "Completada";
  if (status === "Activa" || status === "Validada" || status === "Completada" || status === "Pendiente") {
    return status as CropStatus;
  }
  return "Pendiente";
}

function formatHarvestDate(value: string | number | undefined): string {
  if (value == null) return "—";
  const num = typeof value === "number" ? value : Number(value);
  if (!isNaN(num) && num > 1000000000) {
    return new Date(num * 1000).toLocaleDateString("es-CR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return String(value).slice(0, 10);
}

export default function CosechasPage() {
  const [apiCrops, setApiCrops] = useState<any[]>([]);
  const [investCrop, setInvestCrop] = useState<Crop | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/crops/list`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data && json.data.length > 0) {
          setApiCrops(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const displayCrops = apiCrops.length > 0 ? apiCrops : MOCK_CROPS;

  async function handleInvest(amount: number, secret: string) {
    const res = await investInCrop(secret, amount);
    if (!res.success) {
      throw new Error(res.error || "No se pudo completar la inversión");
    }
    setToast(`Inversión enviada. Hash: ${(res.data as { hash?: string })?.hash ?? "confirmado"}`);
  }

  return (
    <div>
      <PageHeader
        title="Cosechas tokenizadas"
        description="Participa en cosechas agrícolas respaldadas por contratos Soroban en Stellar Testnet."
      />

      {toast && (
        <div className="mb-6 rounded-lg border border-brand-medium/30 bg-brand-light px-4 py-3 text-sm text-brand-dark">
          {toast}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {displayCrops.map((crop: any) => (
          <CropCard
            key={crop.id || crop.contract_id}
            cropName={crop.cropName || crop.crop_name}
            region={crop.region}
            farmer={
              crop.farmer ||
              (crop.crop_name?.includes("Don Carlos")
                ? "Don Carlos Mora"
                : `${crop.farmer_public_key?.slice(0, 8)}…`)
            }
            tokensAvailable={crop.tokensAvailable ?? crop.total_tokens ?? 0}
            totalTokens={crop.totalTokens ?? crop.total_tokens ?? 0}
            tokensSold={crop.tokensSold ?? crop.tokens_sold ?? 0}
            pricePerToken={crop.pricePerToken ?? crop.price_per_token ?? 0}
            priceLabel={crop.priceLabel || `$${crop.price_per_token} USDC`}
            harvestDate={formatHarvestDate(crop.harvestDate ?? crop.harvest_date)}
            status={mapStatus(crop.status)}
            actions={
              <>
                <Button onClick={() => setInvestCrop(crop)}>Invertir</Button>
                {crop.contract_id && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/contract/${crop.contract_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-brand-dark hover:bg-brand-light/50"
                  >
                    Ver en Stellar ↗
                  </a>
                )}
              </>
            }
          />
        ))}
      </div>

      <InvestModal
        cropLabel={
          investCrop
            ? `${investCrop.cropName} — ${investCrop.region}`
            : ""
        }
        open={!!investCrop}
        onClose={() => setInvestCrop(null)}
        onInvest={handleInvest}
      />
    </div>
  );
}
