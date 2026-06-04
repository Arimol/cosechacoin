import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { cropsRouter } from "./routes/crops.routes.js";
import { boostersRouter } from "./routes/boosters.routes.js";
import { demoRouter } from "./routes/demo.routes.js";
import { stellarService } from "./services/stellar.service.js";
import { sendError, sendSuccess } from "./utils/response.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin.split(",").map((o) => o.trim()),
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

/** GET /api/health — estado del API y contratos Stellar configurados */
app.get("/api/health", (_req, res) => {
  try {
    return sendSuccess(res, {
      service: "cosechacoin-backend",
      status: "ok",
      timestamp: new Date().toISOString(),
      stellar: stellarService.contractIds(),
    });
  } catch (err) {
    return sendError(res, err, 500);
  }
});

app.use("/api/crops", cropsRouter);
app.use("/api/boosters", boostersRouter);
app.use("/api/demo", demoRouter);

/** Manejo global de errores no capturados en rutas */
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  return sendError(res, err, status);
});

const server = app.listen(PORT, () => {
  console.log(`CosechaCoin API escuchando en http://localhost:${PORT}`);
});
server.setTimeout(120000);
