import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export const db = {

  async createCrop({ contractId, mode, cropType, cropName, region,
                     farmerPublicKey, totalTokens, pricePerToken, harvestDate }) {
    const { rows } = await pool.query(
      `INSERT INTO crops
         (contract_id, mode, status, crop_type, crop_name, region,
          farmer_public_key, total_tokens, price_per_token, harvest_date)
       VALUES ($1,$2,'active',$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [contractId, mode, cropType, cropName, region,
       farmerPublicKey, totalTokens, pricePerToken, harvestDate]
    );
    return rows[0];
  },

  async updateCropStatus(contractId, status, extra = {}) {
    const fields = Object.entries(extra);
    let query = `UPDATE crops SET status=$1`;
    const values = [status];
    fields.forEach(([k, v], i) => {
      query += `, ${k}=$${i + 2}`;
      values.push(v);
    });
    query += ` WHERE contract_id=$${values.length + 1}`;
    values.push(contractId);
    await pool.query(query, values);
  },

  async getCropByContract(contractId) {
    const { rows } = await pool.query(
      `SELECT * FROM crops WHERE contract_id=$1`, [contractId]
    );
    if (!rows[0]) throw new Error(`Crop no encontrado: ${contractId}`);
    return rows[0];
  },

  async listCrops(mode = null) {
    const query = mode
      ? `SELECT * FROM crops WHERE mode=$1 ORDER BY created_at DESC`
      : `SELECT * FROM crops ORDER BY created_at DESC`;
    const values = mode ? [mode] : [];
    const { rows } = await pool.query(query, values);
    return rows;
  },

  async createBooster({ cropId, contractId, boosterType,
                        investorPublicKey, providerPublicKey, amount }) {
    const { rows } = await pool.query(
      `INSERT INTO boosters
         (crop_id, contract_id, booster_type,
          investor_public_key, provider_public_key, amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending')
       RETURNING *`,
      [cropId, contractId, boosterType,
       investorPublicKey, providerPublicKey, amount]
    );
    return rows[0];
  },

  async updateBooster(contractId, boosterIdOnchain, fields = {}) {
    const extra = Object.entries(fields);
    let query = `UPDATE boosters SET booster_id_onchain=$1`;
    const values = [boosterIdOnchain];
    extra.forEach(([k, v], i) => {
      query += `, ${k}=$${i + 2}`;
      values.push(v);
    });
    query += ` WHERE contract_id=$${values.length + 1}`;
    values.push(contractId);
    await pool.query(query, values);
  },

  async getActiveDemoCrop() {
    const { rows } = await pool.query(
      `SELECT * FROM crops
       WHERE mode='demo' AND status != 'completed'
       ORDER BY created_at DESC LIMIT 1`
    );
    return rows[0] || null;
  },

  async getBoosterByCrop(cropId) {
    const { rows } = await pool.query(
      `SELECT * FROM boosters WHERE crop_id=$1
       ORDER BY created_at DESC LIMIT 1`,
      [cropId]
    );
    return rows[0] || null;
  },
};
