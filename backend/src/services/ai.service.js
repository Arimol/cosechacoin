const DEFAULT_AI_URL = "http://localhost:8000";

export class AiService {
  constructor() {
    this.baseUrl = process.env.AI_SERVICE_URL || DEFAULT_AI_URL;
    this.apiKey = process.env.AI_API_KEY || "";
  }

  headers() {
    const h = { "Content-Type": "application/json" };
    if (this.apiKey) {
      h["X-API-Key"] = this.apiKey;
    }
    return h;
  }

  async _parseJson(res) {
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || json.detail || `AI error ${res.status}`);
    }
    if (json.success === false) {
      throw new Error(json.error || "Error en servicio AI");
    }
    return json.data ?? json;
  }

  /** Predicción de rendimiento (nuevo esquema CosechaCoin). */
  async predictYield(payload) {
    const res = await fetch(`${this.baseUrl}/predict/yield`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    return this._parseJson(res);
  }

  /** Análisis NDVI con report_hash para complete_booster. */
  async analyzeDrone({ crop_type, region, booster_id }) {
    const res = await fetch(`${this.baseUrl}/drone/analyze`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ crop_type, region, booster_id }),
    });
    return this._parseJson(res);
  }

  /** Legacy: análisis por parcel_id (backend drone.service). */
  async analyzeNdvi(payload) {
    const res = await fetch(`${this.baseUrl}/analyze/ndvi`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI NDVI error ${res.status}: ${text}`);
    }
    return res.json();
  }

  async health() {
    const res = await fetch(`${this.baseUrl}/health`, {
      headers: this.headers(),
    });
    return res.json();
  }
}

export const aiService = new AiService();
