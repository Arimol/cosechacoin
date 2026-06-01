# CosechaCoin

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
