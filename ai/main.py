"""
Microservicio CosechaCoin AI — FastAPI.
Predicción de rendimiento y análisis NDVI (dron) para cosechas tokenizadas.
"""

import os
from typing import Any

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from routes import drone, predict
from services.ndvi_analyzer import NDVIAnalyzer
from services.yield_predictor import YieldPredictor

API_KEY = os.getenv("AI_API_KEY", "dev-ai-key-change-in-production")

app = FastAPI(
    title="CosechaCoin AI",
    description=(
        "Predicción de rendimiento agrícola y análisis NDVI simulado "
        "para parcelas en Costa Rica"
    ),
    version="0.2.0",
)

# CORS: backend Node (4000) y dashboard Next.js (3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4000",
        "http://127.0.0.1:4000",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ndvi_analyzer = NDVIAnalyzer()

app.include_router(predict.router, prefix="/predict", tags=["Predicción"])
app.include_router(drone.router, prefix="/drone", tags=["Dron NDVI"])


def verify_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="API key inválida")


@app.get("/health")
def health() -> dict[str, str]:
    """Estado del microservicio."""
    return {"status": "ok", "service": "cosechacoin-ai", "version": "0.2.0"}


class LegacyNdviRequest(BaseModel):
    """Esquema usado por backend Node (drone.service)."""

    parcel_id: str
    image_base64: str = Field(default="")
    width: int = Field(default=64, gt=0)
    height: int = Field(default=64, gt=0)


@app.post("/analyze/ndvi")
def analyze_ndvi_legacy(
    body: LegacyNdviRequest,
    x_api_key: str | None = Header(default=None),
) -> dict[str, Any]:
    """
    Compatibilidad con backend Node: simula NDVI por parcel_id como región.
    Para flujo booster use POST /drone/analyze con report_hash on-chain.
    """
    verify_api_key(x_api_key)
    region = body.parcel_id.replace("_", " ") or "Tarrazú"
    result = ndvi_analyzer.analyze(crop_type="cafe", region=region)
    return {
        "parcel_id": body.parcel_id,
        "mean_ndvi": result["ndvi_index"],
        "health_score": int(result["ndvi_index"] * 100),
        "report_hash": result["report_hash"],
        "health_status": result["health_status"],
        "recommended_action": result["recommended_action"],
        "stress_zones": result["stress_zones"],
    }
