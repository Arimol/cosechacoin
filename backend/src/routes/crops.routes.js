import { Router } from "express";
import { z } from "zod";
import { aiService } from "../services/ai.service.js";
import { listCropsFromDb } from "../services/supabase.service.js";

export const cropsRouter = Router();

const cropSchema = z.object({
  crop_type: z.enum(["coffee", "beans", "cacao"]),
  region: z.string().min(1),
  area_hectares: z.number().positive(),
  soil_moisture: z.number().min(0).max(1).optional(),
  rainfall_mm: z.number().nonnegative().optional(),
  temperature_c: z.number().optional(),
});

cropsRouter.get("/", async (_req, res, next) => {
  try {
    const result = await listCropsFromDb();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

cropsRouter.post("/predict-yield", async (req, res, next) => {
  try {
    const body = cropSchema.parse(req.body);
    const prediction = await aiService.predictYield({
      crop_type: body.crop_type,
      region: body.region,
      area_hectares: body.area_hectares,
      soil_moisture: body.soil_moisture ?? 0.45,
      rainfall_mm: body.rainfall_mm ?? 120,
      temperature_c: body.temperature_c ?? 24,
    });
    res.json(prediction);
  } catch (err) {
    if (err.name === "ZodError") {
      err.status = 400;
    }
    next(err);
  }
});
