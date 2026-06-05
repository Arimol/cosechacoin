const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
