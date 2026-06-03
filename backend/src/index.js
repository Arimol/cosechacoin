import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { healthRouter } from "./routes/health.routes.js";
import { cropsRouter } from "./routes/crops.routes.js";
import { boostersRouter } from "./routes/boosters.routes.js";
import { stellarRouter } from "./routes/stellar.routes.js";
import { aiRouter } from "./routes/ai.routes.js";

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

app.use("/api/health", healthRouter);
app.use("/api/crops", cropsRouter);
app.use("/api/boosters", boostersRouter);
app.use("/api/stellar", stellarRouter);
app.use("/api/ai", aiRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Error interno del servidor",
  });
});

app.listen(PORT, () => {
  console.log(`CosechaCoin API escuchando en http://localhost:${PORT}`);
});
