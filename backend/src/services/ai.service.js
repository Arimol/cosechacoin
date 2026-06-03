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

  async predictYield(payload) {
    const res = await fetch(`${this.baseUrl}/predict/yield`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI yield error ${res.status}: ${text}`);
    }
    return res.json();
  }

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
