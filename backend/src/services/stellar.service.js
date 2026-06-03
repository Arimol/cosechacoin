import * as Stellar from "@stellar/stellar-sdk";
import { Server as SorobanServer } from "@stellar/stellar-sdk/rpc";

const { Asset, BASE_FEE, Keypair, Networks, Operation, TransactionBuilder, nativeToScVal } =
  Stellar;

const TESTNET_PASSPHRASE = Networks.TESTNET;
const MAINNET_PASSPHRASE = Networks.PUBLIC;

function getNetworkPassphrase() {
  return process.env.STELLAR_NETWORK === "mainnet"
    ? MAINNET_PASSPHRASE
    : TESTNET_PASSPHRASE;
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
    this.server = new Stellar.Horizon.Server(this.horizonUrl);
  }

  getKeypair() {
    if (!this.sourceSecret) {
      throw new Error("STELLAR_SOURCE_SECRET no configurado");
    }
    return Keypair.fromSecret(this.sourceSecret);
  }

  getRpc() {
    return new SorobanServer(this.rpcUrl, { allowHttp: true });
  }

  async getAccount(publicKey) {
    return this.server.loadAccount(publicKey);
  }

  async getNativeBalance(publicKey) {
    const account = await this.getAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? Number(native.balance) : 0;
  }

  async buildPaymentTransaction({ destination, amount, memo }) {
    const source = this.getKeypair();
    const account = await this.getAccount(source.publicKey());

    let builder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    }).addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: String(amount),
      })
    );

    if (memo) {
      builder = builder.addMemo(memo);
    }

    const tx = builder.setTimeout(180).build();
    tx.sign(source);
    return this.server.submitTransaction(tx);
  }

  async simulateContractCall({ contractId, fn, args = [] }) {
    const rpc = this.getRpc();
    const source = this.getKeypair();
    const account = await this.getAccount(source.publicKey());

    const scArgs = args.map((a) =>
      typeof a === "string"
        ? nativeToScVal(a, { type: "string" })
        : nativeToScVal(a)
    );

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: this.network,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: contractId,
          function: fn,
          args: scArgs,
        })
      )
      .setTimeout(180)
      .build();

    return rpc.simulateTransaction(tx);
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
}

export const stellarService = new StellarService();
