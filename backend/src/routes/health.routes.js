import { Router } from "express";
import { aiService } from "../services/ai.service.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res, next) => {
  try {
    let aiStatus = { status: "unreachable" };
    try {
      aiStatus = await aiService.health();
    } catch {
      aiStatus = { status: "unreachable" };
    }
    res.json({
      service: "cosechacoin-backend",
      status: "ok",
      timestamp: new Date().toISOString(),
      stellarNetwork: process.env.STELLAR_NETWORK || "testnet",
      ai: aiStatus,
    });
  } catch (err) {
    next(err);
  }
});
