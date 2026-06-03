#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, Map, String, Symbol, Vec,
};

// --- Claves de storage ---

const KEY_INIT: Symbol = symbol_short!("INIT");
const KEY_ADMIN: Symbol = symbol_short!("ADMIN");
const KEY_CROP: Symbol = symbol_short!("CROP");
const KEY_BOOSTERS: Symbol = symbol_short!("BOOSTERS");
const KEY_COUNT: Symbol = symbol_short!("COUNT");

// Topics de eventos on-chain
const EVT_FUNDED: Symbol = symbol_short!("funded");
const EVT_ACTIVE: Symbol = symbol_short!("active");
const EVT_DONE: Symbol = symbol_short!("done");

/// Tipo de impulsor agrícola financiado por inversores.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BoosterType {
    DroneNDVI,
    SmartIrrigation,
    CertifiedSeeds,
    IoTSensors,
    OrganicCertification,
}

/// Estado del ciclo de vida del impulsor.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BoosterStatus {
    Pending,
    Active,
    Completed,
}

/// Información completa de un impulsor (retorno de `get_booster` / `list_boosters`).
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BoosterInfo {
    pub id: u32,
    pub booster_type: BoosterType,
    pub investor: Address,
    pub provider: Address,
    pub amount: i128,
    pub status: BoosterStatus,
    pub report_hash: String,
}

#[contract]
pub struct BoosterContract;

#[contractimpl]
impl BoosterContract {
    /// Vincula el contrato con un `crop_token` y registra al administrador. Solo una vez.
    pub fn initialize(env: Env, admin: Address, crop_contract: Address) {
        if env.storage().instance().has(&KEY_INIT) {
            panic!("contrato ya inicializado");
        }
        admin.require_auth();

        env.storage().instance().set(&KEY_INIT, &true);
        env.storage().instance().set(&KEY_ADMIN, &admin);
        env.storage().instance().set(&KEY_CROP, &crop_contract);
        env.storage().instance().set(&KEY_COUNT, &0_u32);
        env.storage()
            .persistent()
            .set(&KEY_BOOSTERS, &Map::<u32, BoosterInfo>::new(&env));
    }

    /// El inversor financia un impulsor: crea registro en estado `Pending` y emite `booster_funded`.
    pub fn fund_booster(
        env: Env,
        investor: Address,
        booster_type: BoosterType,
        amount: i128,
        provider: Address,
    ) -> u32 {
        if amount <= 0 {
            panic!("amount debe ser positivo");
        }
        investor.require_auth();
        Self::require_initialized(&env);

        let mut boosters: Map<u32, BoosterInfo> = env
            .storage()
            .persistent()
            .get(&KEY_BOOSTERS)
            .unwrap_or(Map::new(&env));

        let id = Self::next_booster_id(&env);
        let info = BoosterInfo {
            id,
            booster_type: booster_type.clone(),
            investor: investor.clone(),
            provider: provider.clone(),
            amount,
            status: BoosterStatus::Pending,
            report_hash: String::from_str(&env, ""),
        };

        boosters.set(id, info);
        env.storage().persistent().set(&KEY_BOOSTERS, &boosters);

        env.events().publish(
            (EVT_FUNDED, investor.clone(), provider.clone()),
            (id, amount, booster_type),
        );

        id
    }

    /// Solo el admin activa un impulsor en estado `Pending` → `Active`.
    pub fn activate_booster(env: Env, admin: Address, booster_id: u32) {
        admin.require_auth();
        Self::require_admin(&env, &admin);

        let mut boosters = Self::load_boosters(&env);
        let mut info = Self::get_booster_from_map(&boosters, booster_id);

        if info.status != BoosterStatus::Pending {
            panic!("solo impulsores pendientes pueden activarse");
        }

        info.status = BoosterStatus::Active;
        boosters.set(booster_id, info.clone());
        env.storage().persistent().set(&KEY_BOOSTERS, &boosters);

        env.events()
            .publish((EVT_ACTIVE, admin.clone()), booster_id);
    }

    /// Solo el admin completa un impulsor activo y registra el hash del reporte (p. ej. NDVI).
    pub fn complete_booster(
        env: Env,
        admin: Address,
        booster_id: u32,
        report_hash: String,
    ) {
        if report_hash.is_empty() {
            panic!("report_hash no puede estar vacio");
        }
        admin.require_auth();
        Self::require_admin(&env, &admin);

        let mut boosters = Self::load_boosters(&env);
        let mut info = Self::get_booster_from_map(&boosters, booster_id);

        if info.status != BoosterStatus::Active {
            panic!("solo impulsores activos pueden completarse");
        }

        info.status = BoosterStatus::Completed;
        info.report_hash = report_hash.clone();
        boosters.set(booster_id, info.clone());
        env.storage().persistent().set(&KEY_BOOSTERS, &boosters);

        env.events().publish(
            (EVT_DONE, admin.clone(), booster_id),
            report_hash,
        );
    }

    /// Devuelve la información completa de un impulsor por id.
    pub fn get_booster(env: Env, booster_id: u32) -> BoosterInfo {
        Self::require_initialized(&env);
        let boosters = Self::load_boosters(&env);
        Self::get_booster_from_map(&boosters, booster_id)
    }

    /// Lista todos los impulsores registrados en el contrato.
    pub fn list_boosters(env: Env) -> Vec<BoosterInfo> {
        Self::require_initialized(&env);
        let boosters = Self::load_boosters(&env);
        let mut list = Vec::new(&env);
        for (_, info) in boosters.iter() {
            list.push_back(info);
        }
        list
    }

    /// Dirección del contrato `crop_token` vinculado.
    pub fn crop_contract(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&KEY_CROP)
            .expect("contrato no inicializado")
    }

    /// Cantidad total de impulsores creados.
    pub fn booster_count(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&KEY_COUNT)
            .unwrap_or(0)
    }
}

impl BoosterContract {
    fn require_initialized(env: &Env) {
        if !env.storage().instance().has(&KEY_INIT) {
            panic!("contrato no inicializado");
        }
    }

    fn require_admin(env: &Env, caller: &Address) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&KEY_ADMIN)
            .expect("contrato no inicializado");
        if caller != &admin {
            panic!("solo el admin puede ejecutar esta accion");
        }
    }

    fn load_boosters(env: &Env) -> Map<u32, BoosterInfo> {
        env.storage()
            .persistent()
            .get(&KEY_BOOSTERS)
            .unwrap_or(Map::new(env))
    }

    fn get_booster_from_map(boosters: &Map<u32, BoosterInfo>, booster_id: u32) -> BoosterInfo {
        boosters
            .get(booster_id)
            .unwrap_or_else(|| panic!("impulsor no encontrado"))
    }

    fn next_booster_id(env: &Env) -> u32 {
        let count: u32 = env.storage().instance().get(&KEY_COUNT).unwrap_or(0);
        let id = count
            .checked_add(1)
            .expect("overflow en BOOSTER_COUNT");
        env.storage().instance().set(&KEY_COUNT, &id);
        id
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup(
        env: &Env,
    ) -> (
        BoosterContractClient<'_>,
        Address,
        Address,
        Address,
        Address,
        Address,
    ) {
        env.mock_all_auths();
        let contract_id = env.register(BoosterContract, ());
        let client = BoosterContractClient::new(env, &contract_id);
        let admin = Address::generate(env);
        let crop = Address::generate(env);
        let investor = Address::generate(env);
        let provider = Address::generate(env);

        client.initialize(&admin, &crop);

        (client, admin, crop, investor, provider, contract_id)
    }

    #[test]
    fn initialize_vincula_crop_y_solo_una_vez() {
        let env = Env::default();
        let (client, admin, crop, _, _, _) = setup(&env);

        assert_eq!(client.crop_contract(), crop);
        assert_eq!(client.booster_count(), 0);

        let crop2 = Address::generate(&env);
        assert!(client.try_initialize(&admin, &crop2).is_err());
    }

    #[test]
    fn fund_activate_complete_flujo() {
        let env = Env::default();
        let (client, admin, _, investor, provider, _) = setup(&env);

        let id = client.fund_booster(
            &investor,
            &BoosterType::DroneNDVI,
            &5_000_000,
            &provider,
        );
        assert_eq!(id, 1);
        assert_eq!(client.booster_count(), 1);

        let pending = client.get_booster(&id);
        assert_eq!(pending.status, BoosterStatus::Pending);
        assert_eq!(pending.booster_type, BoosterType::DroneNDVI);
        assert_eq!(pending.amount, 5_000_000);
        assert_eq!(pending.investor, investor);
        assert_eq!(pending.provider, provider);
        assert!(pending.report_hash.is_empty());

        client.activate_booster(&admin, &id);
        let active = client.get_booster(&id);
        assert_eq!(active.status, BoosterStatus::Active);

        let hash = String::from_str(&env, "ndvi_report_sha256_abc123def456");
        client.complete_booster(&admin, &id, &hash);
        let done = client.get_booster(&id);
        assert_eq!(done.status, BoosterStatus::Completed);
        assert_eq!(done.report_hash, hash);
    }

    #[test]
    fn list_boosters_devuelve_todos() {
        let env = Env::default();
        let (client, admin, _, investor, provider, _) = setup(&env);

        let id1 = client.fund_booster(
            &investor,
            &BoosterType::SmartIrrigation,
            &1_000,
            &provider,
        );
        let id2 = client.fund_booster(
            &investor,
            &BoosterType::IoTSensors,
            &2_000,
            &provider,
        );
        client.activate_booster(&admin, &id1);
        client.complete_booster(
            &admin,
            &id1,
            &String::from_str(&env, "hash_riego_001"),
        );

        let list = client.list_boosters();
        assert_eq!(list.len(), 2);

        let b1 = client.get_booster(&id1);
        let b2 = client.get_booster(&id2);
        assert_eq!(b1.status, BoosterStatus::Completed);
        assert_eq!(b2.status, BoosterStatus::Pending);
    }

    #[test]
    fn activate_falla_si_no_es_admin() {
        let env = Env::default();
        let (client, _, _, investor, provider, _) = setup(&env);
        let id = client.fund_booster(
            &investor,
            &BoosterType::CertifiedSeeds,
            &500,
            &provider,
        );
        assert!(client.try_activate_booster(&investor, &id).is_err());
    }

    #[test]
    fn complete_falla_sin_activar() {
        let env = Env::default();
        let (client, admin, _, investor, provider, _) = setup(&env);
        let id = client.fund_booster(
            &investor,
            &BoosterType::OrganicCertification,
            &800,
            &provider,
        );
        let hash = String::from_str(&env, "hash_org_001");
        assert!(client.try_complete_booster(&admin, &id, &hash).is_err());
    }

    #[test]
    fn fund_falla_amount_invalido() {
        let env = Env::default();
        let (client, _, _, investor, provider, _) = setup(&env);
        assert!(client
            .try_fund_booster(&investor, &BoosterType::DroneNDVI, &0, &provider)
            .is_err());
    }
}
