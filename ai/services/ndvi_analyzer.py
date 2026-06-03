"""
Análisis NDVI simulado a partir de cultivo y región (Costa Rica).
Genera report_hash SHA-256 para registro on-chain en complete_booster.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any


# Rangos NDVI típicos por cultivo en parcelas costarricenses
NDVI_RANGES: dict[str, tuple[float, float]] = {
    "cafe": (0.72, 0.85),
    "frijol": (0.55, 0.75),
    "cacao": (0.78, 0.88),
    "maiz": (0.50, 0.70),
}

CROP_ALIASES: dict[str, str] = {
    "coffee": "cafe",
    "beans": "frijol",
    "bean": "frijol",
    "cacao": "cacao",
    "cocoa": "cacao",
    "corn": "maiz",
    "maize": "maiz",
}

# Ligero ajuste regional del índice (condiciones agroclimáticas CR)
REGION_NDVI_DELTA: dict[str, float] = {
    "tarrazu": 0.03,
    "tarrazú": 0.03,
    "brunca": 0.01,
    "limon": 0.02,
    "limón": 0.02,
    "guanacaste": -0.05,
    "puntarenas": 0.0,
    "cartago": 0.02,
    "alajuela": 0.01,
}


def _normalize_crop(crop_type: str) -> str:
    key = crop_type.strip().lower()
    return CROP_ALIASES.get(key, key)


def _normalize_region(region: str) -> str:
    return region.strip().lower()


class NDVIAnalyzer:
    """Simula reporte de dron multiespectral y produce hash para Soroban."""

    def analyze(
        self,
        crop_type: str,
        region: str,
        booster_id: int | None = None,
    ) -> dict[str, Any]:
        """
        Genera índice NDVI determinista por cultivo/región/impulsor
        y calcula zonas de estrés y acciones recomendadas.
        """
        crop = _normalize_crop(crop_type)
        if crop not in NDVI_RANGES:
            raise ValueError(
                f"Cultivo no soportado: {crop_type}. Use: cafe, frijol, cacao, maiz"
            )

        region_norm = _normalize_region(region)
        region_compact = region_norm.replace(" ", "")

        low, high = NDVI_RANGES[crop]
        seed_bytes = f"{crop}|{region_compact}|{booster_id or 0}".encode("utf-8")
        seed_int = int(hashlib.sha256(seed_bytes).hexdigest()[:8], 16)
        fraction = (seed_int % 10_000) / 10_000.0

        ndvi_index = low + (high - low) * fraction
        ndvi_index += REGION_NDVI_DELTA.get(region_compact, 0.0)
        ndvi_index = round(min(0.92, max(0.42, ndvi_index)), 4)

        health_status = self._health_status(ndvi_index)
        stress_zones = self._stress_zones(ndvi_index, seed_int)
        recommended_action = self._recommended_action(health_status, crop, region)
        report_hash = self._build_report_hash(
            crop=crop,
            region=region,
            booster_id=booster_id,
            ndvi_index=ndvi_index,
            health_status=health_status,
            stress_zones=stress_zones,
            recommended_action=recommended_action,
        )

        return {
            "ndvi_index": ndvi_index,
            "health_status": health_status,
            "stress_zones": stress_zones,
            "recommended_action": recommended_action,
            "report_hash": report_hash,
            "crop_type": crop,
            "region": region,
            "booster_id": booster_id,
        }

    def _health_status(self, ndvi_index: float) -> str:
        if ndvi_index > 0.75:
            return "Saludable"
        if ndvi_index >= 0.55:
            return "Moderado"
        return "Critico"

    def _stress_zones(self, ndvi_index: float, seed_int: int) -> int:
        """Número de polígonos/zonas con estrés hídrico o nutricional."""
        if ndvi_index > 0.75:
            return seed_int % 2
        if ndvi_index >= 0.55:
            return 2 + (seed_int % 4)
        return 5 + (seed_int % 6)

    def _recommended_action(
        self, health_status: str, crop: str, region: str
    ) -> str:
        if health_status == "Critico":
            return (
                f"Activar riego de emergencia en {region} y aplicar análisis foliar "
                f"en las zonas críticas del cultivo de {crop}; repetir vuelo NDVI en 7 días."
            )
        if health_status == "Moderado":
            return (
                f"Programar riego inteligente por sectores en {region} y ajustar "
                f"sombra o densidad de siembra en {crop} según mapa NDVI."
            )
        return (
            f"Parcela de {crop} en {region} en buen estado: mantener monitoreo IoT "
            "y registrar este report_hash en complete_booster on-chain."
        )

    def _build_report_hash(
        self,
        crop: str,
        region: str,
        booster_id: int | None,
        ndvi_index: float,
        health_status: str,
        stress_zones: int,
        recommended_action: str,
    ) -> str:
        """Hash SHA-256 del reporte (payload registrado en Soroban)."""
        payload = {
            "version": "1",
            "crop_type": crop,
            "region": region,
            "booster_id": booster_id,
            "ndvi_index": ndvi_index,
            "health_status": health_status,
            "stress_zones": stress_zones,
            "recommended_action": recommended_action,
        }
        canonical = json.dumps(payload, sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(canonical.encode("utf-8")).hexdigest()
