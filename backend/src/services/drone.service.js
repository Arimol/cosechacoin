import { aiService } from "./ai.service.js";

/**
 * Orquesta misiones de dron NDVI y envía imágenes al servicio AI.
 */
export class DroneService {
  constructor() {
    this.missions = new Map();
  }

  createMission({ parcelId, farmerId, coordinates }) {
    const id = `mission_${Date.now()}_${parcelId}`;
    const mission = {
      id,
      parcelId,
      farmerId,
      coordinates,
      status: "scheduled",
      createdAt: new Date().toISOString(),
      ndviResult: null,
    };
    this.missions.set(id, mission);
    return mission;
  }

  getMission(id) {
    return this.missions.get(id) || null;
  }

  listMissions({ farmerId, parcelId } = {}) {
    let list = [...this.missions.values()];
    if (farmerId) {
      list = list.filter((m) => m.farmerId === farmerId);
    }
    if (parcelId) {
      list = list.filter((m) => m.parcelId === parcelId);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  async runNdviAnalysis(missionId, { imageBase64, width, height }) {
    const mission = this.missions.get(missionId);
    if (!mission) {
      throw new Error(`Misión no encontrada: ${missionId}`);
    }
    mission.status = "analyzing";
    const ndviResult = await aiService.analyzeNdvi({
      parcel_id: mission.parcelId,
      image_base64: imageBase64,
      width: width || 64,
      height: height || 64,
    });
    mission.ndviResult = ndviResult;
    mission.status = "completed";
    mission.completedAt = new Date().toISOString();
    return { mission, ndviResult };
  }
}

export const droneService = new DroneService();
