import * as Stellar from "@stellar/stellar-sdk";
import { Api as SorobanApi, Server as SorobanServer } from "@stellar/stellar-sdk/rpc";

const {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  scValToNative,
} = Stellar;

const { XdrLargeInt, xdr } = Stellar;

const TESTNET_PASSPHRASE = Networks.TESTNET;
const MAINNET_PASSPHRASE = Networks.PUBLIC;

const BOOSTER_TYPE_SYMBOL = {
  drone_ndvi: "DroneNDVI",
  smart_irrigation: "SmartIrrigation",
  certified_seeds: "CertifiedSeeds",
  iot_sensors: "IoTSensors",
  organic_certification: "OrganicCertification",
};

function getNetworkPassphrase() {
  return process.env.STELLAR_NETWORK === "mainnet"
    ? MAINNET_PASSPHRASE
    : TESTNET_PASSPHRASE;
}

function addressToScVal(publicKeyOrContract) {
  return Address.fromString(publicKeyOrContract).toScVal();
}

function u32ToScVal(value) {
  return Stellar.xdr.ScVal.scvU32(Number(value));
}

function u64ToScVal(value) {
  const big = BigInt(value);
  return new Stellar.XdrLargeInt("u64", big).toScVal();
}

function i128ToScVal(value) {
  const big = BigInt(value);
  return new Stellar.XdrLargeInt("i128", big).toScVal();
}

function stringToScVal(value) {
  return nativeToScVal(String(value), { type: "string" });
}

function boosterTypeToScVal(boosterType) {
  const symbol = BOOSTER_TYPE_SYMBOL[boosterType];
  if (!symbol) {
    throw new Error(`Tipo de impulsor no válido: ${boosterType}`);
  }
  return Stellar.xdr.ScVal.scvVec([Stellar.xdr.ScVal.scvSymbol(symbol)]);
}

function normalizeEnum(value) {
  if (value == null) return value;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.tag) return value.tag;
  return value;
}

function normalizeCropInfo(raw) {
  if (!raw || typeof raw !== "object") return raw;
  return {
    crop_name: raw.crop_name,
    farmer: raw.farmer,
    total_tokens: Number(raw.total_tokens),
    tokens_sold: Number(raw.tokens_sold),
    price_per_token: String(raw.price_per_token),
    harvest_date: Number(raw.harvest_date),
    status: normalizeEnum(raw.status),
    yield_percentage: Number(raw.yield_percentage),
    tokens_available:
      Number(raw.total_tokens) - Number(raw.tokens_sold),
  };
}

function normalizeBoosterInfo(raw) {
  if (!raw || typeof raw !== "object") return raw;
  return {
    id: Number(raw.id),
    booster_type: normalizeEnum(raw.booster_type),
    investor: raw.investor,
    provider: raw.provider,
    amount: String(raw.amount),
    status: normalizeEnum(raw.status),
    report_hash: raw.report_hash ?? "",
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class StellarService {
  constructor() {
    this.network = getNetworkPassphrase();
    this.horizonUrl =
      process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
    this.rpcUrl =
      process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
    this.sourceSecret = process.env.STELLAR_SOURCE_SECRET;
    this.cropTokenContractId = process.env.CROP_TOKEN_CONTRACT_ID;
    this.boosterContractId = process.env.BOOSTER_CONTRACT_ID;
    this.horizon = new Stellar.Horizon.Server(this.horizonUrl);
    this.rpc = new SorobanServer(this.rpcUrl, { allowHttp: true });
  }

  getAdminKeypair() {
    if (!this.sourceSecret) {
      throw new Error("STELLAR_SOURCE_SECRET no configurado en .env");
    }
    return Keypair.fromSecret(this.sourceSecret);
  }

  keypairFromSecret(secret) {
    return Keypair.fromSecret(secret);
  }

  requireCropContract() {
    if (!this.cropTokenContractId) {
      throw new Error("CROP_TOKEN_CONTRACT_ID no configurado");
    }
    return this.cropTokenContractId;
  }

  requireBoosterContract() {
    if (!this.boosterContractId) {
      throw new Error("BOOSTER_CONTRACT_ID no configurado");
    }
    return this.boosterContractId;
  }

  async loadAccount(publicKey) {
    return this.horizon.loadAccount(publicKey);
  }

  /**
   * Simula una llamada de solo lectura al contrato (sin enviar transacción).
   */
  async simulateRead(contractId, method, scArgs, publicKey) {
    const signer = publicKey || this.getAdminKeypair().publicKey();
    const account = await this.loadAccount(signer);
    const contract = new Contract(contractId);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(contract.call(method, ...scArgs))
      .setTimeout(60)
      .build();

    const sim = await this.rpc.simulateTransaction(tx);
    if (SorobanApi.isSimulationError(sim)) {
      const detail = sim.error || JSON.stringify(sim);
      throw new Error(`Simulación fallida (${method}): ${detail}`);
    }
    if (!sim.result?.retval) {
      return null;
    }
    return scValToNative(sim.result.retval);
  }

  /**
   * Prepara, firma y envía una transacción de contrato; espera confirmación en la red.
   */
  async invokeContract(contractId, method, scArgs, signKeypair) {
    const account = await this.loadAccount(signKeypair.publicKey());
    const contract = new Contract(contractId);

    let tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(contract.call(method, ...scArgs))
      .setTimeout(60)
      .build();

    tx = await this.rpc.prepareTransaction(tx);
    tx.sign(signKeypair);

    const sendResult = await this.rpc.sendTransaction(tx);
    const confirmed = await this.pollTransactionRaw(sendResult.hash);

    if (confirmed.status !== "SUCCESS") {
      throw new Error(
        `Transacción fallida (${method}): ${JSON.stringify(confirmed)}`
      );
    }

    let returnValue = null;
    try {
      if (confirmed.returnValue) {
        const retBuf = Buffer.from(confirmed.returnValue, "base64");
        const scVal = Stellar.xdr.ScVal.fromXDR(retBuf);
        const arm = scVal.switch?.()?.name ?? "";
        if (arm !== "scvVoid") {
          returnValue = scValToNative(scVal);
        }
      }
    } catch (_) {
      returnValue = null;
    }

    return {
      hash: sendResult.hash,
      status: confirmed.status,
      ledger: confirmed.ledger,
      returnValue,
    };
  }

  async pollTransaction(hash, maxAttempts = 40) {
    for (let i = 0; i < maxAttempts; i++) {
      const tx = await this.rpc.getTransaction(hash);
      if (tx.status !== SorobanApi.GetTransactionStatus.NOT_FOUND) {
        return tx;
      }
      await sleep(1500);
    }
    throw new Error("Timeout esperando confirmación de la transacción en Soroban");
  }

  /** Poll via JSON-RPC directo (evita parser defectuoso de getTransaction en SDK). */
  async pollTransactionRaw(hash, maxAttempts = 40) {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(this.rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getTransaction",
          params: { hash },
        }),
      });
      const json = await response.json();
      const status = json?.result?.status;
      if (status && status !== "NOT_FOUND") {
        return json.result;
      }
      await sleep(1500);
    }
    throw new Error("Timeout esperando confirmación de la transacción");
  }

  // --- crop_token ---

  /** Inicializa el contrato crop_token (solo admin / cuenta fuente). */
  async initializeCrop(
    cropName,
    farmerPublicKey,
    totalTokens,
    pricePerToken,
    harvestDate
  ) {
    const contractId = this.requireCropContract();
    const admin = this.getAdminKeypair();

    const result = await this.invokeContract(
      contractId,
      "initialize",
      [
        addressToScVal(admin.publicKey()),
        stringToScVal(cropName),
        addressToScVal(farmerPublicKey),
        u32ToScVal(totalTokens),
        i128ToScVal(pricePerToken),
        u64ToScVal(harvestDate),
      ],
      admin
    );

    return {
      ...result,
      contractId,
      admin: admin.publicKey(),
      farmer: farmerPublicKey,
    };
  }

  /** Inversor compra tokens de la cosecha. */
  async investInCrop(investorSecret, amount) {
    const contractId = this.requireCropContract();
    const investor = this.keypairFromSecret(investorSecret);

    return this.invokeContract(
      contractId,
      "invest",
      [addressToScVal(investor.publicKey()), u32ToScVal(amount)],
      investor
    );
  }

  /** Admin valida el rendimiento de la cosecha (0–100). */
  async validateHarvest(yieldPercentage) {
    const contractId = this.requireCropContract();
    const admin = this.getAdminKeypair();

    return this.invokeContract(
      contractId,
      "validate_harvest",
      [addressToScVal(admin.publicKey()), u32ToScVal(yieldPercentage)],
      admin
    );
  }

  /** Inversor reclama retorno proporcional tras validación. */
  async claimReturn(investorSecret) {
    const contractId = this.requireCropContract();
    const investor = this.keypairFromSecret(investorSecret);

    const result = await this.invokeContract(
      contractId,
      "claim_return",
      [addressToScVal(investor.publicKey())],
      investor
    );

    return {
      ...result,
      returnAmount: result.returnValue != null ? String(result.returnValue) : null,
    };
  }

  /** Consulta metadatos on-chain de la cosecha. */
  async getCropInfo() {
    const contractId = this.requireCropContract();
    const raw = await this.simulateRead(contractId, "get_crop_info", []);
    return normalizeCropInfo(raw);
  }

  // --- booster ---

  /** Inversor financia un impulsor; retorna el booster_id creado. */
  async fundBooster(investorSecret, boosterType, amount, providerPublicKey) {
    const contractId = this.requireBoosterContract();
    const investor = this.keypairFromSecret(investorSecret);

    const result = await this.invokeContract(
      contractId,
      "fund_booster",
      [
        addressToScVal(investor.publicKey()),
        boosterTypeToScVal(boosterType),
        i128ToScVal(amount),
        addressToScVal(providerPublicKey),
      ],
      investor
    );

    return {
      ...result,
      boosterId: result.returnValue != null ? Number(result.returnValue) : null,
    };
  }

  /** Admin activa un impulsor pendiente. */
  async activateBooster(boosterId) {
    const contractId = this.requireBoosterContract();
    const admin = this.getAdminKeypair();

    return this.invokeContract(
      contractId,
      "activate_booster",
      [addressToScVal(admin.publicKey()), u32ToScVal(boosterId)],
      admin
    );
  }

  /** Admin completa impulsor y registra hash del reporte NDVI. */
  async completeBooster(boosterId, reportHash) {
    const contractId = this.requireBoosterContract();
    const admin = this.getAdminKeypair();

    return this.invokeContract(
      contractId,
      "complete_booster",
      [
        addressToScVal(admin.publicKey()),
        u32ToScVal(boosterId),
        stringToScVal(reportHash),
      ],
      admin
    );
  }

  /** Obtiene un impulsor por id. */
  async getBooster(boosterId) {
    const contractId = this.requireBoosterContract();
    const raw = await this.simulateRead(contractId, "get_booster", [
      u32ToScVal(boosterId),
    ]);
    return normalizeBoosterInfo(raw);
  }

  /** Lista todos los impulsores del contrato. */
  async listBoosters() {
    const contractId = this.requireBoosterContract();
    const raw = await this.simulateRead(contractId, "list_boosters", []);
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map(normalizeBoosterInfo);
  }

  contractIds() {
    return {
      cropToken: this.cropTokenContractId || null,
      booster: this.boosterContractId || null,
      network: process.env.STELLAR_NETWORK || "testnet",
      horizonUrl: this.horizonUrl,
      rpcUrl: this.rpcUrl,
    };
  }

  /**
   * Despliega un contrato WASM desde base64 en .env.
   * Retorna el nuevo contractId.
   */
  async deployContract(contractName) {
    console.log("deployContract inicio:", contractName);

    const envKey = contractName === "crop_token"
      ? "CROP_TOKEN_WASM_BASE64"
      : "BOOSTER_WASM_BASE64";
    const wasmBase64 = process.env[envKey];
    if (!wasmBase64) throw new Error(`${envKey} no configurado en .env`);

    const wasmBuffer = Buffer.from(wasmBase64, "base64");
    console.log("WASM buffer length:", wasmBuffer.length);

    const admin = this.getAdminKeypair();

    // 1. Upload WASM
    const account1 = await this.loadAccount(admin.publicKey());
    const uploadTx = new TransactionBuilder(account1, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(
        Stellar.Operation.uploadContractWasm({ wasm: wasmBuffer })
      )
      .setTimeout(60)
      .build();

    const preparedUpload = await this.rpc.prepareTransaction(uploadTx);
    preparedUpload.sign(admin);
    const uploadSend = await this.rpc.sendTransaction(preparedUpload);
    console.log("upload hash:", uploadSend.hash);
    const uploadConfirmed = await this.pollTransactionRaw(uploadSend.hash);
    if (uploadConfirmed.status !== "SUCCESS") {
      throw new Error(`Upload WASM fallido: ${uploadConfirmed.status}`);
    }
    console.log("upload SUCCESS");

    // 2. Calcular wasmHash
    const wasmHash = Stellar.hash(wasmBuffer);

    // 3. Generar salt determinístico único
    const salt = crypto.getRandomValues(new Uint8Array(32));

    // 4. Calcular contractId ANTES de enviarlo
    const networkId = Buffer.from(
      Stellar.hash(Buffer.from(this.network))
    );
    const deployerAddress = Stellar.Address.fromString(admin.publicKey());
    const preimage = Stellar.xdr.HashIdPreimage.envelopeTypeContractId(
      new Stellar.xdr.HashIdPreimageContractId({
        networkId,
        contractIdPreimage:
          Stellar.xdr.ContractIdPreimage.contractIdPreimageFromAddress(
            new Stellar.xdr.ContractIdPreimageFromAddress({
              address: deployerAddress.toScAddress(),
              salt: Buffer.from(salt),
            })
          ),
      })
    );
    const contractId = Stellar.StrKey.encodeContract(
      Stellar.hash(preimage.toXDR())
    );
    console.log("contractId calculado:", contractId);

    // 5. Crear instancia del contrato
    const account2 = await this.loadAccount(admin.publicKey());
    const createTx = new TransactionBuilder(account2, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(
        Stellar.Operation.createCustomContract({
          address: deployerAddress,
          wasmHash,
          salt: Buffer.from(salt),
        })
      )
      .setTimeout(60)
      .build();

    const preparedCreate = await this.rpc.prepareTransaction(createTx);
    preparedCreate.sign(admin);
    const createSend = await this.rpc.sendTransaction(preparedCreate);
    console.log("create hash:", createSend.hash);
    const createConfirmed = await this.pollTransactionRaw(createSend.hash);
    console.log("create status:", createConfirmed.status);
    if (createConfirmed.status !== "SUCCESS") {
      throw new Error(`Create contract fallido: ${createConfirmed.status}`);
    }

    return contractId;
  }

  /**
   * Inicializa el contrato booster apuntando al crop dado.
   */
  async initializeBooster(boosterContractId, cropContractId) {
    const admin = this.getAdminKeypair();
    return this.invokeContract(
      boosterContractId,
      "initialize",
      [
        addressToScVal(admin.publicKey()),
        addressToScVal(cropContractId),
      ],
      admin
    );
  }
}

export const stellarService = new StellarService();
