"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import BoosterCard from "@/components/BoosterCard";
import Button from "@/components/Button";
import { MOCK_BOOSTERS } from "@/lib/mockData";
import {
  activateBooster,
  completeBooster,
  fetchNdviReport,
} from "@/lib/api";
import type { Booster } from "@/types";

export default function ImpulsoresPage() {
  const [boosters, setBoosters] = useState<Booster[]>(MOCK_BOOSTERS);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleActivate(id: number) {
    setLoadingId(id);
    setMessage(null);
    const res = await activateBooster(id);
    setLoadingId(null);
    if (res.success) {
      setBoosters((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: "Activo" as const } : b
        )
      );
      setMessage(`Impulsor #${id} activado en Soroban.`);
    } else {
      setMessage(res.error || "Error al activar (verifique backend admin).");
    }
  }

  async function handleComplete(booster: Booster) {
    setLoadingId(booster.id);
    setMessage(null);

    let reportHash = `ndvi_manual_${booster.id}_${Date.now()}`;
    if (booster.cropType && booster.region) {
      const ndvi = await fetchNdviReport(
        booster.cropType,
        booster.region,
        booster.id
      );
      if (ndvi?.report_hash) {
        reportHash = ndvi.report_hash;
      }
    }

    const res = await completeBooster(booster.id, reportHash);
    setLoadingId(null);

    if (res.success) {
      setBoosters((prev) =>
        prev.map((b) =>
          b.id === booster.id ? { ...b, status: "Completado" as const } : b
        )
      );
      setMessage(
        `Impulsor #${booster.id} completado. report_hash: ${reportHash.slice(0, 16)}…`
      );
    } else {
      setMessage(res.error || "Error al completar impulsor.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Impulsores agrícolas"
        description="Financiamiento de drones NDVI, riego inteligente, semillas certificadas, sensores IoT y certificación orgánica."
      />

      {message && (
        <div className="mb-6 rounded-lg border border-border-subtle bg-white px-4 py-3 text-sm text-ink-primary">
          {message}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {boosters.map((booster) => (
          <BoosterCard
            key={booster.id}
            boosterType={booster.boosterType}
            parcel={booster.parcel}
            amount={booster.amountLabel}
            status={booster.status}
            provider={booster.provider}
            actions={
              <>
                {booster.status === "Pendiente" && (
                  <Button
                    disabled={loadingId === booster.id}
                    onClick={() => handleActivate(booster.id)}
                  >
                    Activar impulsor
                  </Button>
                )}
                {booster.status === "Activo" && (
                  <Button
                    disabled={loadingId === booster.id}
                    onClick={() => handleComplete(booster)}
                  >
                    Completar con reporte NDVI
                  </Button>
                )}
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}
