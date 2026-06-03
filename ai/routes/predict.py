"""
Rutas de predicción de rendimiento agrícola.
"""

import os

from fastapi import APIRouter, Header, HTTPException
from pydantic import AliasChoices, BaseModel, Field, model_validator

from services.yield_predictor import YieldPredictor

router = APIRouter()
_predictor = YieldPredictor()
_API_KEY = os.getenv("AI_API_KEY", "")


def _verify_api_key(x_api_key: str | None) -> None:
    if _API_KEY and x_api_key != _API_KEY:
        raise HTTPException(status_code=401, detail="API key inválida")


class YieldRequest(BaseModel):
    crop_type: str = Field(
        ...,
        description="cafe | frijol | cacao | maiz (o alias coffee, beans)",
    )
    region: str = Field(..., min_length=2, max_length=64)
    planted_area_hectares: float | None = Field(
        default=None,
        gt=0,
        validation_alias=AliasChoices("planted_area_hectares", "area_hectares"),
    )
    area_hectares: float | None = Field(default=None, gt=0)
    rainfall_mm: float = Field(default=1500, ge=0)
    temperature_avg: float | None = Field(default=None)
    temperature_c: float | None = Field(default=None)
    soil_moisture: float | None = Field(default=None, ge=0, le=1)
    has_irrigation: bool | None = None
    has_certified_seeds: bool = False
    has_drone_monitoring: bool = False
    has_iot_sensors: bool = False

    @model_validator(mode="after")
    def normalize_legacy_fields(self) -> "YieldRequest":
        if self.planted_area_hectares is None and self.area_hectares is not None:
            object.__setattr__(self, "planted_area_hectares", self.area_hectares)
        if self.planted_area_hectares is None:
            raise ValueError("planted_area_hectares o area_hectares es requerido")
        if self.temperature_avg is None:
            object.__setattr__(
                self, "temperature_avg", self.temperature_c if self.temperature_c is not None else 24.0
            )
        if self.has_irrigation is None and self.soil_moisture is not None:
            object.__setattr__(self, "has_irrigation", self.soil_moisture >= 0.5)
        if self.has_irrigation is None:
            object.__setattr__(self, "has_irrigation", False)
        return self


class YieldResponse(BaseModel):
    success: bool
    data: dict | None = None
    error: str | None = None


@router.post("/yield", response_model=YieldResponse)
def predict_yield(
    body: YieldRequest,
    x_api_key: str | None = Header(default=None),
):
    """POST /predict/yield — predicción de rendimiento con impulsores."""
    _verify_api_key(x_api_key)
    try:
        result = _predictor.predict(body.model_dump())
        return {"success": True, "data": result, "error": None}
    except ValueError as exc:
        return {"success": False, "data": None, "error": str(exc)}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
