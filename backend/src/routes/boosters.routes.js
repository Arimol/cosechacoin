import { Router } from "express";
import { z } from "zod";
import { listBoostersFromDb } from "../services/supabase.service.js";

export const boostersRouter = Router();

const boosterSchema = z.object({
  booster_type: z.enum(["drone_ndvi", "smart_irrigation", "certified_seeds"]),
  description: z.string().min(3),
  funding_goal: z.number().positive(),
  beneficiary_public_key: z.string().min(56).max(56),
});

boostersRouter.get("/", async (_req, res, next) => {
  try {
    const result = await listBoostersFromDb();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

boostersRouter.post("/", async (req, res, next) => {
  try {
    const body = boosterSchema.parse(req.body);
    res.status(201).json({
      message: "Impulsor registrado (persistir en Supabase / contrato Soroban)",
      booster: {
        ...body,
        funded_amount: 0,
        released: false,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err.name === "ZodError") {
      err.status = 400;
    }
    next(err);
  }
});
