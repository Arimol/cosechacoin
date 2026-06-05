"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import CropCard from "@/components/CropCard";
import Button from "@/components/Button";
import InvestModal from "@/components/InvestModal";
import { MOCK_CROPS } from "@/lib/mockData";
import { getCropContractExplorerUrl, investInCrop } from "@/lib/api";
import type { Crop } from "@/types";

export default function CosechasPage() {
  const [crops] = useState<Crop[]>(MOCK_CROPS);
  const [investCrop, setInvestCrop] = useState<Crop | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const explorerUrl = (contractId: string) => getCropContractExplorerUrl(contractId);

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
        {crops.map((crop) => (
          <CropCard
            key={crop.id}
            cropName={crop.cropName}
            region={crop.region}
            farmer={crop.farmer}
            tokensAvailable={crop.tokensAvailable}
            totalTokens={crop.totalTokens}
            tokensSold={crop.tokensSold}
            pricePerToken={crop.pricePerToken}
            priceLabel={crop.priceLabel}
            harvestDate={crop.harvestDate}
            status={crop.status}
            actions={
              <>
                <Button onClick={() => setInvestCrop(crop)}>Invertir</Button>
                <Button
                  variant="secondary"
                  onClick={() => window.open(explorerUrl((crop as Crop & { contract_id: string }).contract_id), "_blank")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" strokeWidth={1.75} />
                  Ver en Stellar
                </Button>
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
