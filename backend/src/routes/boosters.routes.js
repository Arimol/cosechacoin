import { Router } from "express";
import { z } from "zod";
import { stellarService } from "../services/stellar.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const boostersRouter = Router();

const boosterTypeEnum = z.enum([
  "drone_ndvi",
  "smart_irrigation",
  "certified_seeds",
  "iot_sensors",
  "organic_certification",
]);

const fundSchema = z.object({
  investor_secret: z.string().min(56),
  booster_type: boosterTypeEnum,
  amount: z.union([z.string(), z.number()]),
  provider_public_key: z.string().length(56),
});

const activateSchema = z.object({
  booster_id: z.number().int().positive(),
});

const completeSchema = z.object({
  booster_id: z.number().int().positive(),
  report_hash: z.string().min(8).max(256),
});

/** POST /api/boosters/fund — financia un impulsor */
boostersRouter.post("/fund", async (req, res) => {
  try {
    const body = fundSchema.parse(req.body);
    const data = await stellarService.fundBooster(
      body.investor_secret,
      body.booster_type,
      body.amount,
      body.provider_public_key
    );
    return sendSuccess(res, data, 201);
  } catch (err) {
    const status = err.name === "ZodError" ? 400 : 502;
    return sendError(res, err, status);
  }
});

/** POST /api/boosters/activate — admin activa impulsor */
boostersRouter.post("/activate", async (req, res) => {
  try {
    const body = activateSchema.parse(req.body);
    const data = await stellarService.activateBooster(body.booster_id);
    return sendSuccess(res, data);
  } catch (err) {
    const status = err.name === "ZodError" ? 400 : 502;
    return sendError(res, err, status);
  }
});

/** POST /api/boosters/complete — admin cierra impulsor con report_hash */
boostersRouter.post("/complete", async (req, res) => {
  try {
    const body = completeSchema.parse(req.body);
    const data = await stellarService.completeBooster(
      body.booster_id,
      body.report_hash
    );
    return sendSuccess(res, data);
  } catch (err) {
    const status = err.name === "ZodError" ? 400 : 502;
    return sendError(res, err, status);
  }
});

/** GET /api/boosters/list — todos los impulsores on-chain */
boostersRouter.get("/list", async (_req, res) => {
  try {
    const data = await stellarService.listBoosters();
    return sendSuccess(res, { boosters: data, count: data.length });
  } catch (err) {
    return sendError(res, err, 502);
  }
});
