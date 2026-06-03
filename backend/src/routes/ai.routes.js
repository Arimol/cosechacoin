import { Router } from "express";
import { z } from "zod";
import { aiService } from "../services/ai.service.js";
import { droneService } from "../services/drone.service.js";

export const aiRouter = Router();

const missionSchema = z.object({
  parcelId: z.string().min(1),
  farmerId: z.string().min(1),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

aiRouter.post("/drone/missions", (req, res, next) => {
  try {
    const body = missionSchema.parse(req.body);
    const mission = droneService.createMission(body);
    res.status(201).json(mission);
  } catch (err) {
    if (err.name === "ZodError") {
      err.status = 400;
    }
    next(err);
  }
});

aiRouter.get("/drone/missions", (req, res) => {
  const missions = droneService.listMissions({
    farmerId: req.query.farmerId,
    parcelId: req.query.parcelId,
  });
  res.json({ missions });
});

const ndviMissionSchema = z.object({
  imageBase64: z.string().min(10),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

aiRouter.post("/drone/missions/:id/ndvi", async (req, res, next) => {
  try {
    const body = ndviMissionSchema.parse(req.body);
    const result = await droneService.runNdviAnalysis(req.params.id, body);
    res.json(result);
  } catch (err) {
    if (err.name === "ZodError") {
      err.status = 400;
    }
    next(err);
  }
});

aiRouter.get("/status", async (_req, res, next) => {
  try {
    const health = await aiService.health();
    res.json(health);
  } catch (err) {
    next(err);
  }
});
