"""
Predicción de rendimiento agrícola por reglas (Costa Rica).
Sin ML externo: pesos calibrados por cultivo, región, clima e impulsores.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class CropYieldRules:
    """Porcentaje base y bonificaciones por impulsor (puntos porcentuales)."""

    base_pct: float
    irrigation: float
    seeds: float
    drone: float
    iot: float


# Pesos por cultivo (especificación CosechaCoin)
CROP_RULES: dict[str, CropYieldRules] = {
    "cafe": CropYieldRules(base_pct=85.0, irrigation=5.0, seeds=3.0, drone=4.0, iot=3.0),
    "frijol": CropYieldRules(base_pct=70.0, irrigation=8.0, seeds=5.0, drone=3.0, iot=4.0),
    "cacao": CropYieldRules(base_pct=80.0, irrigation=4.0, seeds=6.0, drone=5.0, iot=3.0),
    "maiz": CropYieldRules(base_pct=65.0, irrigation=10.0, seeds=7.0, drone=3.0, iot=5.0),
}

# Alias en inglés (compatibilidad con backend/dashboard)
CROP_ALIASES: dict[str, str] = {
    "coffee": "cafe",
    "beans": "frijol",
    "bean": "frijol",
    "cacao": "cacao",
    "cocoa": "cacao",
    "corn": "maiz",
    "maize": "maiz",
}

# Bonificación regional (% adicional sobre rendimiento base)
REGION_CROP_BOOST: dict[tuple[str, str], float] = {
    ("cafe", "tarrazu"): 5.0,
    ("cafe", "tarrazú"): 5.0,
    ("frijol", "brunca"): 3.0,
    ("cacao", "limon"): 4.0,
    ("cacao", "limón"): 4.0,
}


def _normalize_crop(crop_type: str) -> str:
    key = crop_type.strip().lower()
    return CROP_ALIASES.get(key, key)


def _normalize_region(region: str) -> str:
    return region.strip().lower().replace(" ", "")


class YieldPredictor:
    """Motor de predicción heurística para parcelas tokenizadas."""

    def predict(self, crop_data: dict[str, Any]) -> dict[str, Any]:
        """
        Calcula rendimiento esperado (%) según cultivo, región, clima e impulsores.

        crop_data debe incluir:
        crop_type, region, planted_area_hectares, rainfall_mm, temperature_avg,
        has_irrigation, has_certified_seeds, has_drone_monitoring, has_iot_sensors
        """
        crop_type = _normalize_crop(str(crop_data.get("crop_type", "")))
        rules = CROP_RULES.get(crop_type)
        if not rules:
            raise ValueError(
                f"Cultivo no soportado: {crop_data.get('crop_type')}. "
                f"Use: cafe, frijol, cacao, maiz"
            )

        region_raw = str(crop_data.get("region", ""))
        region_key = _normalize_region(region_raw)
        planted_area = float(crop_data.get("planted_area_hectares", 0))
        if planted_area <= 0:
            raise ValueError("planted_area_hectares debe ser mayor que cero")

        rainfall_mm = float(crop_data.get("rainfall_mm", 1500))
        temperature_avg = float(crop_data.get("temperature_avg", 24))

        has_irrigation = bool(crop_data.get("has_irrigation", False))
        has_seeds = bool(crop_data.get("has_certified_seeds", False))
        has_drone = bool(crop_data.get("has_drone_monitoring", False))
        has_iot = bool(crop_data.get("has_iot_sensors", False))

        yield_pct = rules.base_pct
        boosters_impact: list[dict[str, Any]] = []

        if has_irrigation:
            yield_pct += rules.irrigation
            boosters_impact.append(
                {"booster": "riego_inteligente", "impact_pct": rules.irrigation}
            )
        if has_seeds:
            yield_pct += rules.seeds
            boosters_impact.append(
                {"booster": "semillas_certificadas", "impact_pct": rules.seeds}
            )
        if has_drone:
            yield_pct += rules.drone
            boosters_impact.append(
                {"booster": "dron_ndvi", "impact_pct": rules.drone}
            )
        if has_iot:
            yield_pct += rules.iot
            boosters_impact.append(
                {"booster": "sensores_iot", "impact_pct": rules.iot}
            )

        region_boost = REGION_CROP_BOOST.get((crop_type, region_key), 0.0)
        if region_boost > 0:
            yield_pct += region_boost
            boosters_impact.append(
                {
                    "booster": "region",
                    "region": region_raw,
                    "impact_pct": region_boost,
                }
            )

        climate_adjust = 0.0
        if rainfall_mm < 800:
            climate_adjust = -10.0
        elif rainfall_mm > 2500:
            climate_adjust = -5.0
        if climate_adjust != 0:
            yield_pct += climate_adjust
            boosters_impact.append(
                {
                    "booster": "clima",
                    "rainfall_mm": rainfall_mm,
                    "impact_pct": climate_adjust,
                }
            )

        # Temperatura extrema reduce confianza y rendimiento leve en cultivos de altura
        temp_penalty = 0.0
        if crop_type == "cafe" and (temperature_avg < 18 or temperature_avg > 26):
            temp_penalty = -3.0
        elif crop_type == "maiz" and temperature_avg > 32:
            temp_penalty = -4.0
        if temp_penalty:
            yield_pct += temp_penalty
            boosters_impact.append(
                {"booster": "temperatura", "impact_pct": temp_penalty}
            )

        yield_pct = round(min(98.0, max(35.0, yield_pct)), 2)

        confidence = self._confidence(
            rainfall_mm=rainfall_mm,
            has_drone=has_drone,
            has_iot=has_iot,
            boosters_count=len(boosters_impact),
        )

        recommendation = self._recommendation(
            crop_type=crop_type,
            yield_pct=yield_pct,
            rainfall_mm=rainfall_mm,
            has_irrigation=has_irrigation,
            has_drone=has_drone,
            planted_area=planted_area,
        )

        return {
            "yield_percentage": yield_pct,
            "confidence": confidence,
            "boosters_impact": boosters_impact,
            "recommendation": recommendation,
            "meta": {
                "crop_type": crop_type,
                "region": region_raw,
                "planted_area_hectares": planted_area,
                "temperature_avg": temperature_avg,
            },
        }

    def _confidence(
        self,
        rainfall_mm: float,
        has_drone: bool,
        has_iot: bool,
        boosters_count: int,
    ) -> float:
        score = 0.62
        if 900 <= rainfall_mm <= 2200:
            score += 0.12
        if has_drone:
            score += 0.08
        if has_iot:
            score += 0.06
        if boosters_count >= 3:
            score += 0.05
        return round(min(0.95, score), 2)

    def _recommendation(
        self,
        crop_type: str,
        yield_pct: float,
        rainfall_mm: float,
        has_irrigation: bool,
        has_drone: bool,
        planted_area: float,
    ) -> str:
        if rainfall_mm < 800 and not has_irrigation:
            return (
                "Priorizar impulsor de riego inteligente: precipitación baja "
                f"({rainfall_mm:.0f} mm) en {planted_area:.1f} ha."
            )
        if yield_pct >= 88:
            return (
                "Rendimiento proyectado alto: avanzar tokenización y validar "
                "cosecha on-chain al cierre del ciclo."
            )
        if not has_drone and crop_type in ("cafe", "cacao"):
            return (
                "Contratar vuelo NDVI (Tarrazú/Brunca) para ajustar fertilización "
                "y sostener el rendimiento proyectado."
            )
        return (
            "Mantener plan agronómico actual; monitorear humedad y registrar "
            "impulsores activos en el contrato booster."
        )
