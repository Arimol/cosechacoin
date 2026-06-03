#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

const ADMIN: Symbol = symbol_short!("ADMIN");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum BoosterType {
    DroneNdvi,
    SmartIrrigation,
    CertifiedSeeds,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Booster {
    pub id: u32,
    pub booster_type: BoosterType,
    pub description: String,
    pub funding_goal: i128,
    pub funded_amount: i128,
    pub released: bool,
    pub beneficiary: Address,
}

#[contract]
pub struct BoosterContract;

#[contractimpl]
impl BoosterContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&symbol_short!("NEXT_ID"), &1_u32);
    }

    pub fn register_booster(
        env: Env,
        booster_type: BoosterType,
        description: String,
        funding_goal: i128,
        beneficiary: Address,
    ) -> u32 {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN)
            .expect("not initialized");
        admin.require_auth();
        let id: u32 = env.storage().instance().get(&symbol_short!("NEXT_ID")).unwrap();
        let booster = Booster {
            id,
            booster_type,
            description,
            funding_goal,
            funded_amount: 0,
            released: false,
            beneficiary: beneficiary.clone(),
        };
        env.storage().persistent().set(&(symbol_short!("BST"), id), &booster);
        env.storage().instance().set(&symbol_short!("NEXT_ID"), &(id + 1));
        id
    }

    pub fn fund(env: Env, investor: Address, booster_id: u32, amount: i128) -> i128 {
        investor.require_auth();
        let key = (symbol_short!("BST"), booster_id);
        let mut booster: Booster = env
            .storage()
            .persistent()
            .get(&key)
            .expect("booster not found");
        if booster.released {
            panic!("booster already released");
        }
        booster.funded_amount += amount;
        let funded = booster.funded_amount;
        env.storage().persistent().set(&key, &booster);
        let investor_key = (symbol_short!("INV"), booster_id, investor.clone());
        let prev: i128 = env.storage().persistent().get(&investor_key).unwrap_or(0);
        env.storage()
            .persistent()
            .set(&investor_key, &(prev + amount));
        funded
    }

    pub fn release(env: Env, booster_id: u32) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN)
            .expect("not initialized");
        admin.require_auth();
        let key = (symbol_short!("BST"), booster_id);
        let mut booster: Booster = env
            .storage()
            .persistent()
            .get(&key)
            .expect("booster not found");
        if booster.funded_amount < booster.funding_goal {
            panic!("funding goal not reached");
        }
        if booster.released {
            panic!("already released");
        }
        booster.released = true;
        env.storage().persistent().set(&key, &booster);
    }

    pub fn get_booster(env: Env, booster_id: u32) -> Booster {
        env.storage()
            .persistent()
            .get(&(symbol_short!("BST"), booster_id))
            .expect("booster not found")
    }

    pub fn list_ids(env: Env) -> Vec<u32> {
        let next: u32 = env.storage().instance().get(&symbol_short!("NEXT_ID")).unwrap_or(1);
        let mut ids = Vec::new(&env);
        for i in 1..next {
            let key = (symbol_short!("BST"), i);
            if env.storage().persistent().has(&key) {
                ids.push_back(i);
            }
        }
        ids
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn fund_and_release() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(BoosterContract, ());
        let client = BoosterContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let farmer = Address::generate(&env);
        let investor = Address::generate(&env);
        client.initialize(&admin);
        let id = client.register_booster(
            &BoosterType::DroneNdvi,
            &String::from_str(&env, "Dron NDVI parcela A"),
            &5000,
            &farmer,
        );
        client.fund(&investor, &id, &5000);
        client.release(&id);
        let b = client.get_booster(&id);
        assert!(b.released);
    }
}
