import os
from typing import Literal

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from services.ndvi_analyzer import NdviAnalyzer
from services.yield_predictor import YieldPredictor

API_KEY = os.getenv("AI_API_KEY", "dev-ai-key-change-in-production")

app = FastAPI(
    title="CosechaCoin AI",
    description="Predicción de rendimiento y análisis NDVI para cosechas tokenizadas",
    version="0.1.0",
)

yield_predictor = YieldPredictor()
ndvi_analyzer = NdviAnalyzer()


def verify_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="API key inválida")


class YieldRequest(BaseModel):
    crop_type: Literal["coffee", "beans", "cacao"]
    region: str
    area_hectares: float = Field(gt=0)
    soil_moisture: float = Field(default=0.45, ge=0, le=1)
    rainfall_mm: float = Field(default=120, ge=0)
    temperature_c: float = Field(default=24)


class NdviRequest(BaseModel):
    parcel_id: str
    image_base64: str
    width: int = Field(default=64, gt=0)
    height: int = Field(default=64, gt=0)


@app.get("/health")
def health():
    return {"status": "ok", "service": "cosechacoin-ai"}


@app.post("/predict/yield")
def predict_yield(
    body: YieldRequest,
    x_api_key: str | None = Header(default=None),
):
    verify_api_key(x_api_key)
    result = yield_predictor.predict(
        crop_type=body.crop_type,
        region=body.region,
        area_hectares=body.area_hectares,
        soil_moisture=body.soil_moisture,
        rainfall_mm=body.rainfall_mm,
        temperature_c=body.temperature_c,
    )
    return result


@app.post("/analyze/ndvi")
def analyze_ndvi(
    body: NdviRequest,
    x_api_key: str | None = Header(default=None),
):
    verify_api_key(x_api_key)
    result = ndvi_analyzer.analyze(
        parcel_id=body.parcel_id,
        image_base64=body.image_base64,
        width=body.width,
        height=body.height,
    )
    return result
