# CosechaCoin

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
