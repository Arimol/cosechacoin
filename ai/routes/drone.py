"""
Rutas de análisis NDVI simulado (dron agrícola).
"""

import os

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel, Field

from services.ndvi_analyzer import NDVIAnalyzer

router = APIRouter()
_analyzer = NDVIAnalyzer()
_API_KEY = os.getenv("AI_API_KEY", "")


def _verify_api_key(x_api_key: str | None) -> None:
    if _API_KEY and x_api_key != _API_KEY:
        raise HTTPException(status_code=401, detail="API key inválida")


class DroneAnalyzeRequest(BaseModel):
    crop_type: str = Field(..., description="cafe | frijol | cacao | maiz")
    region: str = Field(..., min_length=2, max_length=64)
    booster_id: int | None = Field(default=None, ge=1)


class DroneResponse(BaseModel):
    success: bool
    data: dict | None = None
    error: str | None = None


@router.post("/analyze", response_model=DroneResponse)
def analyze_drone(
    body: DroneAnalyzeRequest,
    x_api_key: str | None = Header(default=None),
):
    """
    POST /drone/analyze — reporte NDVI y report_hash para complete_booster.
    """
    _verify_api_key(x_api_key)
    try:
        result = _analyzer.analyze(
            crop_type=body.crop_type,
            region=body.region,
            booster_id=body.booster_id,
        )
        return {
            "success": True,
            "data": {
                "ndvi_index": result["ndvi_index"],
                "health_status": result["health_status"],
                "stress_zones": result["stress_zones"],
                "recommended_action": result["recommended_action"],
                "report_hash": result["report_hash"],
            },
            "error": None,
        }
    except ValueError as exc:
        return {"success": False, "data": None, "error": str(exc)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
