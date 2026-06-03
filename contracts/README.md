# Contratos Soroban — CosechaCoin

## Compilar

```bash
cd contracts
cargo build --release
```

Con Stellar CLI:

```bash
stellar contract build --package crop_token
stellar contract build --package booster
```

## Desplegar en Testnet

```bash
stellar keys generate --global admin --network testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/crop_token.wasm \
  --source admin \
  --network testnet
```

Copia el `CONTRACT_ID` resultante a `backend/.env` como `CROP_TOKEN_CONTRACT_ID` y `BOOSTER_CONTRACT_ID`.

## Tests

```bash
cargo test
```
