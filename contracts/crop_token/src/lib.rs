#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Symbol,
};

// --- Claves de storage (instance / persistent) ---

const KEY_INIT: Symbol = symbol_short!("INIT");
const KEY_ADMIN: Symbol = symbol_short!("ADMIN");
const KEY_CROP_INFO: Symbol = symbol_short!("CROPINFO");
const KEY_INVESTMENTS: Symbol = symbol_short!("INVEST");
const KEY_CLAIMS: Symbol = symbol_short!("CLAIMS");

// Topics de eventos on-chain
const EVT_INVEST: Symbol = symbol_short!("invest");
const EVT_VALID: Symbol = symbol_short!("valid");
const EVT_CLAIM: Symbol = symbol_short!("claim");

/// Estado del ciclo de vida de la cosecha tokenizada.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum Status {
    Active,
    HarvestValidated,
    Completed,
}

/// Metadatos públicos de la cosecha (retorno de `get_crop_info`).
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CropInfo {
    pub crop_name: String,
    pub farmer: Address,
    pub total_tokens: u32,
    pub tokens_sold: u32,
    pub price_per_token: i128,
    pub harvest_date: u64,
    pub status: Status,
    pub yield_percentage: u32,
}

#[contract]
pub struct CropTokenContract;

#[contractimpl]
impl CropTokenContract {
    /// Inicializa una cosecha nueva. Solo puede ejecutarse una vez.
    /// Registra admin, metadatos (`CROP_INFO`) y mapas vacíos de inversiones y reclamos.
    pub fn initialize(
        env: Env,
        admin: Address,
        crop_name: String,
        farmer: Address,
        total_tokens: u32,
        price_per_token: i128,
        harvest_date: u64,
    ) {
        if env.storage().instance().has(&KEY_INIT) {
            panic!("contrato ya inicializado");
        }
        if total_tokens == 0 {
            panic!("total_tokens debe ser mayor que cero");
        }
        if price_per_token <= 0 {
            panic!("price_per_token debe ser positivo");
        }
        if harvest_date == 0 {
            panic!("harvest_date invalido");
        }

        admin.require_auth();

        let crop = CropInfo {
            crop_name,
            farmer,
            total_tokens,
            tokens_sold: 0,
            price_per_token,
            harvest_date,
            status: Status::Active,
            yield_percentage: 0,
        };

        env.storage().instance().set(&KEY_INIT, &true);
        env.storage().instance().set(&KEY_ADMIN, &admin);
        env.storage().instance().set(&KEY_CROP_INFO, &crop);
        env.storage()
            .persistent()
            .set(&KEY_INVESTMENTS, &Map::<Address, u32>::new(&env));
        env.storage()
            .persistent()
            .set(&KEY_CLAIMS, &Map::<Address, bool>::new(&env));
    }

    /// Permite a un inversor comprar `amount` tokens de la cosecha.
    /// Verifica disponibilidad, actualiza `INVESTMENTS` y emite `InvestEvent`.
    pub fn invest(env: Env, investor: Address, amount: u32) {
        if amount == 0 {
            panic!("amount debe ser mayor que cero");
        }
        investor.require_auth();

        let mut crop: CropInfo = Self::load_crop(&env);
        if crop.status != Status::Active {
            panic!("la cosecha no acepta inversiones en este estado");
        }

        let available = crop.total_tokens - crop.tokens_sold;
        if amount > available {
            panic!("tokens insuficientes disponibles");
        }

        let mut investments: Map<Address, u32> = env
            .storage()
            .persistent()
            .get(&KEY_INVESTMENTS)
            .unwrap_or(Map::new(&env));

        let current = investments.get(investor.clone()).unwrap_or(0);
        investments.set(investor.clone(), current + amount);

        crop.tokens_sold += amount;
        env.storage().instance().set(&KEY_CROP_INFO, &crop);
        env.storage()
            .persistent()
            .set(&KEY_INVESTMENTS, &investments);

        env.events().publish(
            (EVT_INVEST, investor.clone()),
            (amount, crop.tokens_sold),
        );
    }

    /// Solo el admin valida el rendimiento real (0–100) y pasa el estado a `HarvestValidated`.
    pub fn validate_harvest(env: Env, admin: Address, yield_percentage: u32) {
        if yield_percentage > 100 {
            panic!("yield_percentage debe estar entre 0 y 100");
        }

        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&KEY_ADMIN)
            .expect("contrato no inicializado");
        if admin != stored_admin {
            panic!("solo el admin puede validar la cosecha");
        }

        let mut crop: CropInfo = Self::load_crop(&env);
        if crop.status != Status::Active {
            panic!("solo se valida una cosecha activa");
        }

        crop.yield_percentage = yield_percentage;
        crop.status = Status::HarvestValidated;
        env.storage().instance().set(&KEY_CROP_INFO, &crop);

        env.events()
            .publish((EVT_VALID, admin.clone()), yield_percentage);
    }

    /// El inversor reclama su retorno proporcional tras la validación de cosecha.
    /// Fórmula: tokens × price_per_token × yield_percentage / 100.
    /// Marca el reclamo en `CLAIMS` y puede cerrar la cosecha cuando todos reclamaron.
    pub fn claim_return(env: Env, investor: Address) -> i128 {
        investor.require_auth();

        let crop: CropInfo = Self::load_crop(&env);
        if crop.status != Status::HarvestValidated {
            panic!("la cosecha debe estar validada para reclamar");
        }

        let investments: Map<Address, u32> = env
            .storage()
            .persistent()
            .get(&KEY_INVESTMENTS)
            .unwrap_or(Map::new(&env));
        let tokens = investments
            .get(investor.clone())
            .unwrap_or_else(|| panic!("el inversor no tiene tokens"));

        if tokens == 0 {
            panic!("sin tokens para reclamar");
        }

        let mut claims: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&KEY_CLAIMS)
            .unwrap_or(Map::new(&env));

        if claims.get(investor.clone()).unwrap_or(false) {
            panic!("retorno ya reclamado");
        }

        let return_amount = Self::calculate_return(
            tokens,
            crop.price_per_token,
            crop.yield_percentage,
        );

        claims.set(investor.clone(), true);
        env.storage().persistent().set(&KEY_CLAIMS, &claims);

        if Self::all_investors_claimed(&investments, &claims) {
            let mut crop_done = crop;
            crop_done.status = Status::Completed;
            env.storage().instance().set(&KEY_CROP_INFO, &crop_done);
        }

        env.events().publish(
            (EVT_CLAIM, investor.clone()),
            (tokens, return_amount),
        );

        return_amount
    }

    /// Devuelve la información completa de la cosecha, incluidos tokens disponibles implícitos.
    pub fn get_crop_info(env: Env) -> CropInfo {
        Self::load_crop(&env)
    }

    /// Tokens aún disponibles para inversión.
    pub fn tokens_available(env: Env) -> u32 {
        let crop = Self::load_crop(&env);
        crop.total_tokens - crop.tokens_sold
    }

    /// Consulta cuántos tokens posee un inversor.
    pub fn investment_of(env: Env, investor: Address) -> u32 {
        let investments: Map<Address, u32> = env
            .storage()
            .persistent()
            .get(&KEY_INVESTMENTS)
            .unwrap_or(Map::new(&env));
        investments.get(investor).unwrap_or(0)
    }

    /// Indica si un inversor ya reclamó su retorno.
    pub fn has_claimed(env: Env, investor: Address) -> bool {
        let claims: Map<Address, bool> = env
            .storage()
            .persistent()
            .get(&KEY_CLAIMS)
            .unwrap_or(Map::new(&env));
        claims.get(investor).unwrap_or(false)
    }
}

impl CropTokenContract {
    fn load_crop(env: &Env) -> CropInfo {
        env.storage()
            .instance()
            .get(&KEY_CROP_INFO)
            .expect("contrato no inicializado")
    }

    /// Retorno proporcional según rendimiento validado (escala 0–100).
    fn calculate_return(tokens: u32, price_per_token: i128, yield_percentage: u32) -> i128 {
        let tokens_i = i128::from(tokens);
        let yield_i = i128::from(yield_percentage);
        tokens_i
            .checked_mul(price_per_token)
            .expect("overflow en precio")
            .checked_mul(yield_i)
            .expect("overflow en rendimiento")
            / 100_i128
    }

    fn all_investors_claimed(
        investments: &Map<Address, u32>,
        claims: &Map<Address, bool>,
    ) -> bool {
        for (investor, tokens) in investments.iter() {
            if tokens > 0 && !claims.get(investor).unwrap_or(false) {
                return false;
            }
        }
        true
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup_client(env: &Env) -> (CropTokenContractClient<'_>, Address, Address, Address) {
        env.mock_all_auths();
        let contract_id = env.register(CropTokenContract, ());
        let client = CropTokenContractClient::new(env, &contract_id);
        let admin = Address::generate(env);
        let farmer = Address::generate(env);
        let investor = Address::generate(env);

        client.initialize(
            &admin,
            &String::from_str(env, "Cafe Organico Huila"),
            &farmer,
            &10_000,
            &1_000_000,
            &1_735_689_600_u64,
        );

        (client, admin, farmer, investor)
    }

    #[test]
    fn initialize_solo_una_vez() {
        let env = Env::default();
        let (client, admin, farmer, _) = setup_client(&env);
        let info = client.get_crop_info();
        assert_eq!(info.crop_name, String::from_str(&env, "Cafe Organico Huila"));
        assert_eq!(info.status, Status::Active);
        assert_eq!(info.tokens_sold, 0);
        assert_eq!(client.tokens_available(), 10_000);

        let result = client.try_initialize(
            &admin,
            &String::from_str(&env, "Otra"),
            &farmer,
            &100,
            &100,
            &1,
        );
        assert!(result.is_err());
    }

    #[test]
    fn invest_y_evento() {
        let env = Env::default();
        let (client, _, _, investor) = setup_client(&env);

        client.invest(&investor, &1500);
        assert_eq!(client.investment_of(&investor), 1500);
        assert_eq!(client.get_crop_info().tokens_sold, 1500);
        assert_eq!(client.tokens_available(), 8500);
    }

    #[test]
    fn invest_falla_si_excede_disponibles() {
        let env = Env::default();
        let (client, _, _, investor) = setup_client(&env);
        assert!(client.try_invest(&investor, &10_001).is_err());
    }

    #[test]
    fn validate_harvest_y_claim() {
        let env = Env::default();
        let (client, admin, _, investor) = setup_client(&env);

        client.invest(&investor, &2000);
        client.validate_harvest(&admin, &80);

        let info = client.get_crop_info();
        assert_eq!(info.status, Status::HarvestValidated);
        assert_eq!(info.yield_percentage, 80);

        let retorno = client.claim_return(&investor);
        // 2000 * 1_000_000 * 80 / 100 = 1_600_000_000
        assert_eq!(retorno, 1_600_000_000);
        assert!(client.has_claimed(&investor));
        assert_eq!(client.get_crop_info().status, Status::Completed);
    }

    #[test]
    fn claim_falla_antes_de_validar() {
        let env = Env::default();
        let (client, _, _, investor) = setup_client(&env);
        client.invest(&investor, &100);
        assert!(client.try_claim_return(&investor).is_err());
    }

    #[test]
    fn claim_falla_doble_reclamo() {
        let env = Env::default();
        let (client, admin, _, investor) = setup_client(&env);
        client.invest(&investor, &500);
        client.validate_harvest(&admin, &100);
        client.claim_return(&investor);
        assert!(client.try_claim_return(&investor).is_err());
    }
}
