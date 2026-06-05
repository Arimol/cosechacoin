import { Router } from "express";
import { z } from "zod";
import { stellarService } from "../services/stellar.service.js";
import { db } from "../services/supabase.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const cropsRouter = Router();

const initializeSchema = z.object({
  crop_name: z.string().min(1).max(128),
  farmer_public_key: z.string().length(56),
  total_tokens: z.number().int().positive(),
  price_per_token: z.union([z.string(), z.number()]),
  harvest_date: z.number().int().positive(),
});

const investSchema = z.object({
  investor_secret: z.string().min(56),
  amount: z.number().int().positive(),
});

const validateSchema = z.object({
  yield_percentage: z.number().int().min(0).max(100),
});

const claimSchema = z.object({
  investor_secret: z.string().min(56),
});

/** POST /api/crops/initialize — inicializa crop_token on-chain */
cropsRouter.post("/initialize", async (req, res) => {
  try {
    const body = initializeSchema.parse(req.body);
    const data = await stellarService.initializeCrop(
      body.crop_name,
      body.farmer_public_key,
      body.total_tokens,
      body.price_per_token,
      body.harvest_date
    );
    return sendSuccess(res, data, 201);
  } catch (err) {
    const status = err.name === "ZodError" ? 400 : 502;
    return sendError(res, err, status);
  }
});

/** POST /api/crops/invest — compra de tokens por un inversor */
cropsRouter.post("/invest", async (req, res) => {
  try {
    const body = investSchema.parse(req.body);
    const data = await stellarService.investInCrop(
      body.investor_secret,
      body.amount
    );
    return sendSuccess(res, data);
  } catch (err) {
    const status = err.name === "ZodError" ? 400 : 502;
    return sendError(res, err, status);
  }
});

/** POST /api/crops/validate — admin valida rendimiento de cosecha */
cropsRouter.post("/validate", async (req, res) => {
  try {
    const body = validateSchema.parse(req.body);
    const data = await stellarService.validateHarvest(body.yield_percentage);
    return sendSuccess(res, data);
  } catch (err) {
    const status = err.name === "ZodError" ? 400 : 502;
    return sendError(res, err, status);
  }
});

/** POST /api/crops/claim — inversor reclama retorno */
cropsRouter.post("/claim", async (req, res) => {
  try {
    const body = claimSchema.parse(req.body);
    const data = await stellarService.claimReturn(body.investor_secret);
    return sendSuccess(res, data);
  } catch (err) {
    const status = err.name === "ZodError" ? 400 : 502;
    return sendError(res, err, status);
  }
});

/** GET /api/crops/info — metadatos de la cosecha desde Soroban */
cropsRouter.get("/info", async (_req, res) => {
  try {
    const data = await stellarService.getCropInfo();
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, err, 502);
  }
});

/** GET /api/crops/list — lista cosechas desde DB */
cropsRouter.get("/list", async (_req, res) => {
  try {
    const crops = await db.listCrops();
    return sendSuccess(res, crops);
  } catch (err) {
    return sendError(res, err, 502);
  }
});
