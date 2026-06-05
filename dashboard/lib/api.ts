const API_URL = "https://cosechacoin-backend.onrender.com";

export async function getCrops() {
  try {
    const res = await fetch(`${API_URL}/api/crops/list`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || [];
  } catch {
    return null;
  }
}

export async function getDemoStatus() {
  try {
    const res = await fetch(`${API_URL}/api/demo/status`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export async function getHealth() {
  try {
    const res = await fetch(`${API_URL}/api/health`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

export function getCropContractExplorerUrl(contractId: string): string {
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
}

export async function investInCrop(contractId: string, amount: number) {
  const res = await fetch(`${API_URL}/api/crops/invest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ investor_secret: "", amount }),
  });
  const json = await res.json();
  return json.data || json;
}

export async function activateBooster(boosterId: number) {
  const res = await fetch(`${API_URL}/api/boosters/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ booster_id: boosterId }),
  });
  const json = await res.json();
  return json.data || json;
}

export async function fetchNdviReport(
  cropType: string,
  region: string,
  boosterId: number
) {
  const AI_URL = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";
  const res = await fetch(`${AI_URL}/drone/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      crop_type: cropType,
      region: region,
      booster_id: boosterId,
    }),
  });
  const json = await res.json();
  return json.data || json;
}

export async function completeBooster(boosterId: number, reportHash: string) {
  const res = await fetch(`${API_URL}/api/boosters/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ booster_id: boosterId, report_hash: reportHash }),
  });
  const json = await res.json();
  return json.data || json;
}
