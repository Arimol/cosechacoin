export type CropStatus = "Activa" | "Validada" | "Completada" | "Pendiente";

export type BoosterStatus = "Pendiente" | "Activo" | "Completado";

export type BoosterType =
  | "Dron NDVI"
  | "Riego inteligente"
  | "Semillas certificadas"
  | "Sensores IoT"
  | "Certificación orgánica";

export interface Crop {
  id: string;
  cropName: string;
  region: string;
  farmer: string;
  tokensAvailable: number;
  totalTokens: number;
  tokensSold: number;
  pricePerToken: number;
  priceLabel: string;
  harvestDate: string;
  status: CropStatus;
  lat?: number;
  lng?: number;
}

export interface Booster {
  id: number;
  boosterType: BoosterType;
  parcel: string;
  amount: number;
  amountLabel: string;
  status: BoosterStatus;
  provider: string;
  cropType?: string;
  region?: string;
}

export interface DashboardMetrics {
  activeCrops: number;
  capitalInvestedUsdc: number;
  averageYieldPct: number;
  activeBoosters: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
