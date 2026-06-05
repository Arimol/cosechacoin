import { Router } from "express";
import { stellarService } from "../services/stellar.service.js";
import { db } from "../services/supabase.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const demoRouter = Router();

/**
 * POST /api/demo/reset
 * Despliega contratos frescos para el demo y los registra en Supabase.
 * Llama a este endpoint UNA VEZ antes de cada demo.
 * No requiere terminal ni redespliegue manual.
 */
demoRouter.post("/reset", async (_req, res) => {
  try {
    console.log("DEMO RESET paso 1: deploy crop_token");
    const cropContractId = await stellarService.deployContract("crop_token");
    console.log("DEMO RESET crop contractId:", cropContractId);

    console.log("DEMO RESET paso 2: deploy booster");
    const boosterContractId = await stellarService.deployContract("booster");
    console.log("DEMO RESET booster contractId:", boosterContractId);

    console.log("DEMO RESET paso 3: initializeBooster");
    await stellarService.initializeBooster(boosterContractId, cropContractId);
    console.log("DEMO RESET booster inicializado");

    // IDs activos en memoria: /api/health y rutas crops/boosters
    stellarService.cropTokenContractId = cropContractId;
    stellarService.boosterContractId = boosterContractId;

    console.log("DEMO RESET paso 4: db.createCrop");
    const crop = await db.createCrop({
      contractId:      cropContractId,
      mode:            "demo",
      cropType:        "coffee",
      cropName:        "Café Tarrazú — Don Carlos Mora",
      region:          "Tarrazú, San José",
      farmerPublicKey: stellarService.getAdminKeypair().publicKey(),
      totalTokens:     100,
      pricePerToken:   250,
      harvestDate:     Math.floor(Date.now() / 1000) + 15_724_800,
    });
    console.log("DEMO RESET crop en DB:", crop.id);

    return sendSuccess(res, {
      message:          "Contratos demo listos",
      cropContractId,
      boosterContractId,
      cropDbId:         crop.id,
    }, 201);

  } catch (err) {
    console.error("DEMO RESET ERROR:", err.message, err.stack);
    return sendError(res, err, 502);
  }
});

/**
 * GET /api/demo/status
 * Retorna el crop demo activo actual y su estado.
 */
demoRouter.get("/status", async (_req, res) => {
  try {
    const crop = await db.getActiveDemoCrop();
    if (!crop) {
      return sendSuccess(res, {
        ready: false,
        message: "No hay demo activo. Llama POST /api/demo/reset",
      });
    }
    const booster = await db.getBoosterByCrop(crop.id);
    return sendSuccess(res, {
      ready: true,
      crop,
      boosterContractId: booster?.contract_id || null,
    });
  } catch (err) {
    return sendError(res, err, 502);
  }
});
