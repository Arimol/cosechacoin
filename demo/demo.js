/**
 * CosechaCoin — Demo punta a punta (hackathon)
 * Backend :4000 | IA :8000 | Stellar Testnet
 *
 * Ejecutar: npm start (desde demo/)
 * Requiere backend/.env con STELLAR_SOURCE_SECRET y contratos desplegados.
 */

const path = require("path");
const fetch = require("node-fetch");
require("dotenv").config({
  path: path.join(__dirname, "..", "backend", ".env"),
});

// —— Configuración ——
const API_BASE = process.env.DEMO_API_URL || "http://localhost:4000";
const AI_BASE = process.env.DEMO_AI_URL || process.env.AI_SERVICE_URL || "http://localhost:8000";
const AI_API_KEY = process.env.AI_API_KEY || "";
const STELLAR_PUBLIC = process.env.STELLAR_SOURCE_PUBLIC_KEY || "";
const STELLAR_SECRET = process.env.STELLAR_SOURCE_SECRET || "";
let CROP_CONTRACT = process.env.CROP_TOKEN_CONTRACT_ID || "";
let BOOSTER_CONTRACT = process.env.BOOSTER_CONTRACT_ID || "";

const EXPLORER_TX = "https://stellar.expert/explorer/testnet/tx";
const EXPLORER_CONTRACT = "https://stellar.expert/explorer/testnet/contract";
const EXPLORER_ACCOUNT = "https://stellar.expert/explorer/testnet/account";

const STEP_DELAY_MS = 2000;
const TOTAL_STEPS = 11;

// —— Colores consola ——
const c = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function logOk(msg) {
  console.log(`${c.green}✓${c.reset} ${msg}`);
}
function logErr(msg) {
  console.log(`${c.red}✗${c.reset} ${msg}`);
}
function logInfo(msg) {
  console.log(`${c.yellow}→${c.reset} ${msg}`);
}
function logStep(n, title) {
  console.log(`\n${c.cyan}━━━ PASO ${n}/${TOTAL_STEPS} — ${title} ━━━${c.reset}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Registro de resultados por paso */
const results = [];

function recordStep(step, name, ok, detail = "") {
  results.push({ step, name, ok, detail });
}

function txLink(hash) {
  if (!hash) return "(sin hash)";
  return `${EXPLORER_TX}/${hash}`;
}

function extractHash(data) {
  if (!data || typeof data !== "object") return null;
  return data.hash || data.txHash || data.transactionHash || null;
}

async function requestJson(method, url, body = null, extraHeaders = {}) {
  const headers = { Accept: "application/json", ...extraHeaders };
  if (body) headers["Content-Type"] = "application/json";

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  let parsed;
  const text = await res.text();
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }

  if (!res.ok) {
    const errMsg =
      parsed?.error ||
      parsed?.detail ||
      parsed?.message ||
      `HTTP ${res.status}`;
    throw new Error(typeof errMsg === "string" ? errMsg : JSON.stringify(errMsg));
  }

  if (parsed.success === false) {
    throw new Error(parsed.error || "Error en respuesta API");
  }

  return parsed;
}

async function runStep(stepNum, name, fn) {
  try {
    const detail = await fn();
    recordStep(stepNum, name, true, detail);
    return { ok: true, detail };
  } catch (err) {
    const msg = err.message || String(err);
    logErr(msg);
    recordStep(stepNum, name, false, msg);
    return { ok: false, error: msg };
  } finally {
    await sleep(STEP_DELAY_MS);
  }
}

// Transacciones acumuladas para resumen
const txHashes = [];

async function main() {
  console.log(`\n${c.cyan}╔══════════════════════════════════════════════╗`);
  console.log(`║     CosechaCoin — Demo Stellar Testnet       ║`);
  console.log(`╚══════════════════════════════════════════════╝${c.reset}\n`);

  if (!STELLAR_PUBLIC || !STELLAR_SECRET) {
    logErr(
      "Faltan STELLAR_SOURCE_PUBLIC_KEY o STELLAR_SOURCE_SECRET en backend/.env"
    );
    process.exit(1);
  }

  // Obtener IDs activos del backend
  try {
    const statusRes = await requestJson("GET", `${API_BASE}/api/demo/status`);
    if (statusRes.data?.ready && statusRes.data?.crop?.contract_id) {
      CROP_CONTRACT = statusRes.data.crop.contract_id;
      const healthRes = await requestJson("GET", `${API_BASE}/api/health`);
      BOOSTER_CONTRACT = healthRes.data?.stellar?.booster || BOOSTER_CONTRACT;
      logInfo("IDs activos desde backend:");
      logInfo(`Crop:    ${CROP_CONTRACT}`);
      logInfo(`Booster: ${BOOSTER_CONTRACT}`);
    }
  } catch (_) {
    logInfo("Usando IDs del .env (demo/status no disponible)");
  }

  logInfo(`Backend: ${API_BASE}`);
  logInfo(`IA:      ${AI_BASE}`);
  logInfo(`Cuenta:  ${STELLAR_PUBLIC}`);
  if (CROP_CONTRACT) logInfo(`Crop:    ${CROP_CONTRACT}`);
  if (BOOSTER_CONTRACT) logInfo(`Booster: ${BOOSTER_CONTRACT}`);

  let boosterId = 1;
  let reportHash = "";

  // —— PASO 1 ——
  await runStep(1, "Verificar servicios", async () => {
    logStep(1, "Verificar servicios");

    const backend = await requestJson("GET", `${API_BASE}/api/health`);
    const bData = backend.data || backend;
    logOk(`Backend OK — ${bData.service || "cosechacoin-backend"}`);
    if (bData.stellar) {
      logInfo(`Contratos: ${JSON.stringify(bData.stellar)}`);
    }

    const ai = await requestJson("GET", `${AI_BASE}/health`);
    logOk(`IA OK — ${ai.service || ai.status || "ok"}`);

    return "Servicios en línea";
  });

  // —— PASO 2 ——
  await runStep(2, "Predicción IA", async () => {
    logStep(2, "Predicción IA antes de tokenizar");

    const aiHeaders = AI_API_KEY ? { "X-Api-Key": AI_API_KEY } : {};
    const res = await requestJson(
      "POST",
      `${AI_BASE}/predict/yield`,
      {
        crop_type: "cafe",
        region: "Tarrazu",
        planted_area_hectares: 2.5,
        rainfall_mm: 1800,
        temperature_avg: 22,
        has_irrigation: true,
        has_drone_monitoring: true,
      },
      aiHeaders
    );

    const data = res.data || res;
    const yieldPct = data.yield_percentage ?? "—";
    const rec = data.recommendation ?? "—";
    logOk(`Rendimiento proyectado: ${yieldPct}%`);
    logInfo(`Recomendación: ${rec}`);

    return `Rendimiento ${yieldPct}%`;
  });

  // —— PASO 3 ——
  const harvestDate =
    Math.floor(Date.now() / 1000) + Math.round(6 * 30.44 * 24 * 3600);

  await runStep(3, "Inicializar cosecha", async () => {
    logStep(3, "Inicializando cosecha en Stellar Testnet");

    const res = await requestJson("POST", `${API_BASE}/api/crops/initialize`, {
      crop_name: "Café Tarrazú Don Carlos",
      farmer_public_key: STELLAR_PUBLIC,
      total_tokens: 100,
      price_per_token: "250",
      harvest_date: harvestDate,
    });

    const data = res.data || res;
    const hash = extractHash(data);
    if (hash) {
      txHashes.push({ paso: 3, accion: "initialize crop", hash });
      logOk(`TX: ${hash}`);
      logInfo(txLink(hash));
    }
    if (CROP_CONTRACT) {
      logInfo(`Contrato: ${EXPLORER_CONTRACT}/${CROP_CONTRACT}`);
    }

    return hash ? `TX ${hash.slice(0, 8)}…` : "Cosecha inicializada";
  });

  // —— PASO 4 ——
  await runStep(4, "Invertir en cosecha", async () => {
    logStep(4, "Inversión en tokens de la cosecha");

    const res = await requestJson("POST", `${API_BASE}/api/crops/invest`, {
      investor_secret: STELLAR_SECRET,
      amount: 10,
    });

    const data = res.data || res;
    const hash = extractHash(data);
    if (hash) {
      txHashes.push({ paso: 4, accion: "invest", hash });
      logOk(`TX confirmada en Testnet: ${hash}`);
      logInfo(txLink(hash));
    }

    return hash ? `TX ${hash.slice(0, 8)}…` : "Inversión registrada";
  });

  // —— PASO 5 ——
  await runStep(5, "Financiar booster dron", async () => {
    logStep(5, "Financiando booster Dron NDVI");

    const res = await requestJson("POST", `${API_BASE}/api/boosters/fund`, {
      investor_secret: STELLAR_SECRET,
      booster_type: "drone_ndvi",
      amount: "50",
      provider_public_key: STELLAR_PUBLIC,
    });

    const data = res.data || res;
    const id =
      data.boosterId ??
      data.booster_id ??
      (data.returnValue != null ? Number(data.returnValue) : null);

    if (id != null) {
      boosterId = Number(id);
      logOk(`booster_id generado: ${boosterId}`);
    } else {
      logInfo("Respuesta sin booster_id explícito; se usará 1 en pasos siguientes");
      boosterId = 1;
    }

    const hash = extractHash(data);
    if (hash) {
      txHashes.push({ paso: 5, accion: "fund_booster", hash });
      logInfo(`TX: ${txLink(hash)}`);
    }

    return `booster_id=${boosterId}`;
  });

  // —— PASO 5b — Activar booster ——
  await runStep("5b", "Activar booster", async () => {
    logStep("5b", "Activando booster (admin)");

    const res = await requestJson("POST", `${API_BASE}/api/boosters/activate`, {
      booster_id: boosterId,
    });

    const data = res.data || res;
    const hash = extractHash(data);
    if (hash) {
      txHashes.push({ paso: "5b", accion: "activate_booster", hash });
      logOk(`Booster activado — TX: ${hash}`);
      logInfo(txLink(hash));
    }

    return `booster_id=${boosterId} activado`;
  });

  // —— PASO 6 ——
  await runStep(6, "Análisis NDVI", async () => {
    logStep(6, "Análisis NDVI del dron (IA)");

    const aiHeaders = AI_API_KEY ? { "X-Api-Key": AI_API_KEY } : {};
    const res = await requestJson(
      "POST",
      `${AI_BASE}/drone/analyze`,
      {
        crop_type: "cafe",
        region: "Tarrazu",
        booster_id: boosterId,
      },
      aiHeaders
    );

    const data = res.data || res;
    reportHash = data.report_hash || "";
    logOk(`ndvi_index: ${data.ndvi_index ?? "—"}`);
    logOk(`health_status: ${data.health_status ?? "—"}`);
    logInfo(`recommended_action: ${data.recommended_action ?? "—"}`);
    logOk(`report_hash: ${reportHash || "—"}`);

    if (!reportHash) {
      throw new Error("El servicio IA no devolvió report_hash");
    }

    return `NDVI ${data.ndvi_index}, hash ${reportHash.slice(0, 12)}…`;
  });

  // —— PASO 7 ——
  await runStep(7, "Completar booster on-chain", async () => {
    logStep(7, "Registrando reporte NDVI en Stellar");

    const res = await requestJson("POST", `${API_BASE}/api/boosters/complete`, {
      booster_id: boosterId,
      report_hash: reportHash,
    });

    const data = res.data || res;
    const hash = extractHash(data);
    if (hash) {
      txHashes.push({ paso: 7, accion: "complete_booster", hash });
      logOk(`Reporte NDVI on-chain — TX: ${hash}`);
      logInfo(txLink(hash));
    }

    return hash ? `TX ${hash.slice(0, 8)}…` : `Booster ${boosterId} completado`;
  });

  // —— PASO 8 ——
  await runStep(8, "Validar cosecha", async () => {
    logStep(8, "Validación de cosecha (admin + IA)");

    const res = await requestJson("POST", `${API_BASE}/api/crops/validate`, {
      yield_percentage: 92,
    });

    const data = res.data || res;
    const hash = extractHash(data);
    if (hash) {
      txHashes.push({ paso: 8, accion: "validate_harvest", hash });
      logInfo(`TX: ${txLink(hash)}`);
    }
    logOk("Cosecha validada — lista para reclamar retornos");

    return "yield 92% validado";
  });

  // —— PASO 9 ——
  await runStep(9, "Reclamar retorno", async () => {
    logStep(9, "Reclamo de retorno del inversor");

    const res = await requestJson("POST", `${API_BASE}/api/crops/claim`, {
      investor_secret: STELLAR_SECRET,
    });

    const data = res.data || res;
    const hash = extractHash(data);
    const retorno = data.returnAmount ?? data.return_amount;
    if (hash) {
      txHashes.push({ paso: 9, accion: "claim_return", hash });
      logOk(`Retorno reclamado — TX: ${hash}`);
      logInfo(txLink(hash));
    }
    if (retorno != null) logInfo(`Monto retorno: ${retorno}`);

    return hash ? `TX ${hash.slice(0, 8)}…` : "Retorno reclamado";
  });

  // —— PASO 11 ——
  logStep(11, "Resumen final");
  recordStep(11, "Resumen final", true, "");

  console.log(`\n${c.cyan}── Tabla de transacciones ──${c.reset}`);
  if (txHashes.length === 0) {
    logInfo("No se registraron hashes de transacción en esta ejecución.");
  } else {
    console.log(
      `${"Paso".padEnd(6)} ${"Acción".padEnd(22)} Hash / enlace`
    );
    console.log("-".repeat(72));
    for (const row of txHashes) {
      const short = row.hash.length > 16 ? `${row.hash.slice(0, 16)}…` : row.hash;
      console.log(
        `${String(row.paso).padEnd(6)} ${row.accion.padEnd(22)} ${short}`
      );
      console.log(`${c.dim}       ${txLink(row.hash)}${c.reset}`);
    }
  }

  console.log(`\n${c.cyan}── Cuenta Stellar Testnet ──${c.reset}`);
  console.log(`${EXPLORER_ACCOUNT}/${STELLAR_PUBLIC}`);

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);

  console.log(`\n${c.cyan}── Resultado por paso ──${c.reset}`);
  for (const r of results) {
    const icon = r.ok ? `${c.green}OK${c.reset}` : `${c.red}FAIL${c.reset}`;
    console.log(
      `  [${icon}] Paso ${r.step}: ${r.name}${r.detail ? ` — ${r.detail}` : ""}`
    );
  }

  const txCount = txHashes.length;
  if (failed.length === 0) {
    console.log(
      `\n${c.green}CosechaCoin demo completado — ${txCount} transacciones en Stellar Testnet${c.reset}\n`
    );
  } else {
    console.log(
      `\n${c.yellow}Demo finalizado: ${passed}/${results.length} pasos OK, ${failed.length} fallidos.${c.reset}`
    );
    console.log(
      `${c.green}Transacciones registradas en Testnet: ${txCount}${c.reset}\n`
    );
    process.exitCode = 1;
  }
}

main().catch((err) => {
  logErr(`Error fatal: ${err.message}`);
  process.exit(1);
});
