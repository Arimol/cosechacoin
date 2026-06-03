import type { ApiResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";

export function getApiBaseUrl(): string {
  return API_URL;
}

export function getCropContractExplorerUrl(): string {
  const contract =
    process.env.NEXT_PUBLIC_CROP_CONTRACT ||
    "CACA6KZBXCRY53TEZGOHVYGCBJ6T7D5U2ILC6PYPM4OVUXADKH67PPCQ";
  return `https://lab.stellar.org/r/testnet/contract/${contract}`;
}

export async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) {
    return {
      success: false,
      data: null,
      error: json.error || json.message || `Error ${res.status}`,
    };
  }
  return json as ApiResponse<T>;
}

/** Inversión en cosecha on-chain */
export async function investInCrop(investorSecret: string, amount: number) {
  return fetchApi<{ hash: string }>("/api/crops/invest", {
    method: "POST",
    body: JSON.stringify({ investor_secret: investorSecret, amount }),
  });
}

/** Activar impulsor (admin) */
export async function activateBooster(boosterId: number) {
  return fetchApi<unknown>("/api/boosters/activate", {
    method: "POST",
    body: JSON.stringify({ booster_id: boosterId }),
  });
}

/** Completar impulsor con hash de reporte NDVI */
export async function completeBooster(boosterId: number, reportHash: string) {
  return fetchApi<unknown>("/api/boosters/complete", {
    method: "POST",
    body: JSON.stringify({ booster_id: boosterId, report_hash: reportHash }),
  });
}

/** Obtener report_hash desde microservicio AI */
export async function fetchNdviReport(
  cropType: string,
  region: string,
  boosterId: number
): Promise<{ report_hash: string } | null> {
  try {
    const res = await fetch(`${AI_URL}/drone/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crop_type: cropType, region, booster_id: boosterId }),
    });
    const json = await res.json();
    if (json.success && json.data?.report_hash) {
      return { report_hash: json.data.report_hash };
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchCropInfo() {
  return fetchApi<Record<string, unknown>>("/api/crops/info");
}

export async function fetchBoostersList() {
  return fetchApi<{ boosters: unknown[]; count: number }>("/api/boosters/list");
}
