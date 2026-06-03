import { Router } from "express";
import { z } from "zod";
import { stellarService } from "../services/stellar.service.js";

export const stellarRouter = Router();

stellarRouter.get("/config", (_req, res) => {
  res.json(stellarService.contractIds());
});

stellarRouter.get("/balance/:publicKey", async (req, res, next) => {
  try {
    const balance = await stellarService.getNativeBalance(req.params.publicKey);
    res.json({ publicKey: req.params.publicKey, balanceXlm: balance });
  } catch (err) {
    err.status = err.response?.status === 404 ? 404 : 502;
    next(err);
  }
});

const paymentSchema = z.object({
  destination: z.string().length(56),
  amount: z.string().regex(/^\d+(\.\d{1,7})?$/),
});

stellarRouter.post("/payment", async (req, res, next) => {
  try {
    const body = paymentSchema.parse(req.body);
    const result = await stellarService.buildPaymentTransaction({
      destination: body.destination,
      amount: body.amount,
    });
    res.json({
      hash: result.hash,
      ledger: result.ledger,
      envelope: result.envelope_xdr,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      err.status = 400;
    }
    next(err);
  }
});

const simulateSchema = z.object({
  contractId: z.string().min(10),
  function: z.string().min(1),
  args: z.array(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

stellarRouter.post("/simulate", async (req, res, next) => {
  try {
    const body = simulateSchema.parse(req.body);
    const simulation = await stellarService.simulateContractCall({
      contractId: body.contractId,
      fn: body.function,
      args: body.args || [],
    });
    res.json(simulation);
  } catch (err) {
    if (err.name === "ZodError") {
      err.status = 400;
    }
    next(err);
  }
});
