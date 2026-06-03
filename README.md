# CosechaCoin

<<<<<<< HEAD
Monorepo para tokenizar cosechas agrícolas (café, frijoles, cacao) en **Stellar** mediante contratos **Soroban**, con impulsores financiados por inversores: drones NDVI, riego inteligente y semillas certificadas.

## Estructura

```
cosechacoin/
├── contracts/          # Soroban (Rust): crop_token, booster
├── backend/            # Node.js + Express + Stellar SDK
├── ai/                 # Python + FastAPI (rendimiento y NDVI)
├── mobile/             # Flutter (productores)
├── dashboard/          # Next.js (inversores)
├── docker-compose.yml  # Postgres + backend + ai
└── README.md
```

## Requisitos

| Componente   | Herramientas                                      |
|-------------|---------------------------------------------------|
| Contratos   | Rust, `cargo`, [Stellar CLI / Soroban](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup) |
| Backend     | Node.js ≥ 20                                      |
| AI          | Python ≥ 3.11                                     |
| Dashboard   | Node.js ≥ 20                                      |
| Mobile      | Flutter ≥ 3.8                                     |
| Docker      | Docker Desktop (opcional, stack local)            |

## Inicio rápido con Docker

1. Copia variables de entorno del backend:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Edita `backend/.env` con tus claves de Stellar Testnet y Supabase.

2. Levanta PostgreSQL, AI y API:

   ```bash
   docker compose up --build
   ```

3. Servicios:

   - API: http://localhost:4000/api/health
   - AI: http://localhost:8000/health
   - Postgres: `localhost:5432` (usuario/contraseña/DB: `cosechacoin`)

## Backend (Node.js)

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Endpoints principales:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Estado del API y del servicio AI |
| GET | `/api/crops` | Cosechas (Supabase) |
| POST | `/api/crops/predict-yield` | Predicción vía AI |
| GET | `/api/boosters` | Impulsores |
| POST | `/api/boosters` | Registrar impulsor |
| GET | `/api/stellar/config` | Red y contratos |
| POST | `/api/stellar/simulate` | Simular llamada Soroban |
| POST | `/api/ai/drone/missions` | Crear misión NDVI |

## AI (FastAPI)

```bash
cd ai
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
set AI_API_KEY=dev-ai-key-change-in-production
uvicorn main:app --reload --port 8000
```

- `POST /predict/yield` — predicción de kg por cultivo y región
- `POST /analyze/ndvi` — análisis NDVI desde imagen base64
- Header: `X-API-Key` (mismo valor que `AI_API_KEY` en backend)

## Contratos Soroban

```bash
cd contracts
cargo build --release
# Despliegue (con Stellar CLI instalado):
# stellar contract build
# stellar contract deploy --wasm target/wasm32-unknown-unknown/release/crop_token.wasm --network testnet
```

| Contrato    | Ruta | Función |
|------------|------|---------|
| `crop_token` | `contracts/crop_token` | Token de cosecha: mint, transfer, metadata |
| `booster`    | `contracts/booster`    | Impulsores: fund, release |

Tras desplegar, guarda los `CONTRACT_ID` en `backend/.env`.

## Dashboard (Next.js)

```bash
cd dashboard
cp .env.example .env.local
npm install
npm run dev
```

Abre http://localhost:3000 — panel de inversores conectado al backend.

## Mobile (Flutter)

```bash
cd mobile
flutter pub get
flutter run
```

La app consulta `http://10.0.2.2:4000` en emulador Android (localhost del host). En dispositivo físico usa la IP de tu máquina.

## Supabase (esquema sugerido)

Ejecuta en el SQL Editor de Supabase:

```sql
create table if not exists crops (
  id uuid primary key default gen_random_uuid(),
  crop_type text not null,
  region text not null,
  expected_yield_kg numeric,
  ndvi_score numeric,
  stellar_contract_id text,
  created_at timestamptz default now()
);

create table if not exists boosters (
  id uuid primary key default gen_random_uuid(),
  booster_type text not null,
  description text,
  funding_goal numeric not null,
  funded_amount numeric default 0,
  released boolean default false,
  beneficiary_public_key text,
  created_at timestamptz default now()
);
```

## Variables de entorno

Ver `backend/.env.example` (Stellar Testnet, Soroban RPC, Supabase, AI) y `dashboard/.env.example`.

## Licencia

Proyecto privado — CosechaCoin.
=======
Plataforma Stellar para tokenizar cosechas críticas de Costa Rica — conectando productores locales con inversores globales mediante smart contracts, IA y drones agrícolas.

## El problema

Costa Rica está perdiendo su soberanía alimentaria:

- Frijol: −72% de hectáreas cultivadas desde 1990. Hoy el 80% es importado.
- Maíz criollo: −90% de área cultivada. El 99.4% del consumo nacional es importado.
- Café: −10% en cosecha 2025/26 más nuevo arancel del 15% en Estados Unidos.

El productor no tiene acceso a financiamiento justo. Los intermediarios retienen el 30–40% del valor de la cosecha. Los bancos no prestan sin historial crediticio formal.

## La solución

CosechaCoin tokeniza cosechas futuras en la blockchain Stellar. El productor emite tokens de su cosecha. El inversor compra fracciones desde $50 USDC. Los pagos se liberan automáticamente vía smart contracts Soroban cuando la IA valida el rendimiento.

Los inversores pueden además financiar mejoras concretas en la parcela mediante Impulsores:

| Impulsor |                     Descripción                                          |
|----------|--------------------------------------------------------------------------|
| Drones NDVI       | Vuelo y análisis de salud del cultivo registrado on-chain       |
| Riego inteligente | Goteo y sensores IoT conectados al smart contract               |
| Semillas certificadas | Pago directo al vivero, trazabilidad de variedad on-chain   |
| Sensores IoT          | Datos en tiempo real hacia el modelo de predicción IA       |
| Certificación orgánica| Rainforest / orgánico — el token sube de categoría y valor  |

## Cultivos objetivo

Café de especialidad (Tarrazú, Los Santos), frijol criollo (Brunca, Chorotega, Huetar Norte), maíz criollo heirloom (Guanacaste), cacao nativo Bribri (Limón) y papa de altura (Cartago).

## Arquitectura
cosechacoin/
├── contracts/          # Smart contracts Soroban en Rust
│   ├── crop_token/     # Emisión y gestión de tokens de cosecha
│   └── booster/        # Liberación de impulsores
├── backend/            # Node.js + Express + Stellar SDK
├── ai/                 # Python + FastAPI — predicción de rendimiento y análisis NDVI
├── mobile/             # Flutter — app para productor e inversor
└── dashboard/          # Next.js — dashboard web para inversores

## Stack

| Capa |      Tecnología                |
|------|-------------------------       |
| Blockchain | Stellar + Soroban        |
| Pagos | USDC on Stellar               |
| Backend | Node.js + Express           |
| IA | Python + FastAPI                 |
| Mobile | Flutter                      |
| Dashboard | Next.js                   |
| Base de datos | Supabase / PostgreSQL |

## Integración Stellar

- **Soroban** — contratos para emisión de tokens, escrow y liberación de impulsores
- **USDC on Stellar** — pagos estables sin volatilidad para el productor
- **Stellar DEX** — mercado secundario de tokens de cosecha entre inversores
- **Stellar Anchors** — conversión fiat (colones) a USDC sin fricción

Red de desarrollo: Testnet

## Impacto en Costa Rica

Financia directamente a pequeños productores sin acceso bancario, elimina intermediarios, preserva variedades criollas en riesgo de extinción y convierte el historial on-chain en colateral crediticio real. Modelo escalable a toda Latinoamérica.

## Equipo

Desarrollado por Ariel Molbert https://oriceti.com Oriceti, Costa Rica.
Hackathon Stellar — TechRebel 2026.

## Licencia

MIT
>>>>>>> 37574aebaca36efa39ba07512f67bba75fcb95af
