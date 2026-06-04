# CosechaCoin — Script de demo (hackathon)

Demo automatizada del flujo completo: predicción IA, tokenización de cosecha, inversión, impulsor dron NDVI, validación y reclamo de retorno en **Stellar Testnet**.

## Requisitos previos

1. **Contratos Soroban** desplegados en testnet y variables en `../backend/.env`:
   - `STELLAR_SOURCE_SECRET` / `STELLAR_SOURCE_PUBLIC_KEY`
   - `CROP_TOKEN_CONTRACT_ID`
   - `BOOSTER_CONTRACT_ID`
   - `AI_API_KEY` (si el servicio IA lo exige)

2. **Backend Node** en el puerto 4000:

   ```powershell
   cd ..\backend
   npm install
   npm run dev
   ```

3. **Microservicio IA** en el puerto 8000:

   ```powershell
   cd ..\ai
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

4. Cuenta testnet con **XLM suficiente** para varias transacciones Soroban.

## Ejecutar el demo

```powershell
cd C:\PROYECTOS\cosechacoin\demo
npm install
npm start
```

El script lee automáticamente `../backend/.env` (dotenv).

### URLs alternativas

```powershell
$env:DEMO_API_URL="http://192.168.1.10:4000"
$env:DEMO_AI_URL="http://192.168.1.10:8000"
npm start
```

## Pasos del flujo (10)

| Paso | Acción |
|------|--------|
| 1 | Health backend + IA |
| 2 | POST `/predict/yield` |
| 3 | POST `/api/crops/initialize` |
| 4 | POST `/api/crops/invest` |
| 5 | POST `/api/boosters/fund` (`drone_ndvi`) |
| 6 | POST `/drone/analyze` |
| 7 | POST `/api/boosters/complete` (con `report_hash`) |
| 8 | POST `/api/crops/validate` |
| 9 | POST `/api/crops/claim` |
| 10 | Resumen + enlaces Stellar Expert |

Entre pasos hay una pausa de **2 segundos** para seguir el flujo en vivo.

## Comportamiento ante errores

Si un paso falla, se muestra el error en rojo y el script **continúa** con los siguientes pasos cuando es posible. Al final verás qué pasos pasaron y cuáles fallaron.

## Explorador

- Transacciones: `https://stellar.expert/explorer/testnet/tx/{hash}`
- Cuenta demo: `https://stellar.expert/explorer/testnet/account/{STELLAR_SOURCE_PUBLIC_KEY}`

## Nota sobre tipos de booster

La API usa el enum en snake_case: `drone_ndvi` (no `DroneNDVI`). El script ya envía el valor correcto.
