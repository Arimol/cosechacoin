"""Modelo heurístico de rendimiento agrícola por tipo de cultivo y condiciones."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class CropProfile:
    base_kg_per_ha: float
    optimal_temp_c: float
    optimal_rainfall_mm: float
    optimal_moisture: float


PROFILES: dict[str, CropProfile] = {
    "coffee": CropProfile(
        base_kg_per_ha=1200.0,
        optimal_temp_c=22.0,
        optimal_rainfall_mm=180.0,
        optimal_moisture=0.55,
    ),
    "beans": CropProfile(
        base_kg_per_ha=1800.0,
        optimal_temp_c=24.0,
        optimal_rainfall_mm=140.0,
        optimal_moisture=0.50,
    ),
    "cacao": CropProfile(
        base_kg_per_ha=900.0,
        optimal_temp_c=26.0,
        optimal_rainfall_mm=200.0,
        optimal_moisture=0.60,
    ),
}

REGION_FACTORS: dict[str, float] = {
    "huila": 1.08,
    "antioquia": 1.05,
    "nariño": 1.02,
    "cauca": 1.0,
    "default": 0.95,
}


class YieldPredictor:
    def predict(
        self,
        crop_type: str,
        region: str,
        area_hectares: float,
        soil_moisture: float,
        rainfall_mm: float,
        temperature_c: float,
    ) -> dict:
        profile = PROFILES.get(crop_type)
        if not profile:
            raise ValueError(f"Tipo de cultivo no soportado: {crop_type}")

        region_key = region.strip().lower()
        region_factor = REGION_FACTORS.get(region_key, REGION_FACTORS["default"])

        temp_factor = 1.0 - min(abs(temperature_c - profile.optimal_temp_c) / 20.0, 0.35)
        rain_factor = 1.0 - min(
            abs(rainfall_mm - profile.optimal_rainfall_mm) / profile.optimal_rainfall_mm,
            0.4,
        )
        moisture_factor = 1.0 - min(
            abs(soil_moisture - profile.optimal_moisture) / 0.5,
            0.35,
        )

        kg_per_ha = (
            profile.base_kg_per_ha
            * region_factor
            * temp_factor
            * rain_factor
            * moisture_factor
        )
        total_kg = round(kg_per_ha * area_hectares, 2)
        confidence = round(
            min(0.95, 0.55 + (temp_factor + rain_factor + moisture_factor) / 6),
            2,
        )

        return {
            "crop_type": crop_type,
            "region": region,
            "area_hectares": area_hectares,
            "predicted_kg_per_hectare": round(kg_per_ha, 2),
            "predicted_total_kg": total_kg,
            "confidence": confidence,
            "factors": {
                "region": round(region_factor, 3),
                "temperature": round(temp_factor, 3),
                "rainfall": round(rain_factor, 3),
                "soil_moisture": round(moisture_factor, 3),
            },
        }
