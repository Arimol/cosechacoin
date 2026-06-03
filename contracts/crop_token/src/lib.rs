#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum CropType {
    Coffee,
    Beans,
    Cacao,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CropMetadata {
    pub crop_type: CropType,
    pub region: String,
    pub harvest_season: String,
    pub expected_yield_kg: u32,
    pub ndvi_score: u32,
}

#[contract]
pub struct CropTokenContract;

#[contractimpl]
impl CropTokenContract {
    pub fn initialize(env: Env, admin: Address, metadata: CropMetadata, total_supply: i128) {
        if env.storage().instance().has(&ADMIN) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&symbol_short!("META"), &metadata);
        env.storage().instance().set(&symbol_short!("SUPPLY"), &total_supply);
        env.storage().instance().set(&symbol_short!("MINTED"), &0_i128);
    }

    pub fn mint(env: Env, to: Address, amount: i128) -> i128 {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN)
            .expect("not initialized");
        admin.require_auth();
        let supply: i128 = env.storage().instance().get(&symbol_short!("SUPPLY")).unwrap();
        let minted: i128 = env.storage().instance().get(&symbol_short!("MINTED")).unwrap_or(0);
        if minted + amount > supply {
            panic!("exceeds total supply");
        }
        let new_minted = minted + amount;
        env.storage().instance().set(&symbol_short!("MINTED"), &new_minted);
        let balance_key = (symbol_short!("BAL"), to.clone());
        let balance: i128 = env.storage().persistent().get(&balance_key).unwrap_or(0);
        env.storage().persistent().set(&balance_key, &(balance + amount));
        new_minted
    }

    pub fn balance(env: Env, owner: Address) -> i128 {
        let balance_key = (symbol_short!("BAL"), owner);
        env.storage().persistent().get(&balance_key).unwrap_or(0)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let from_key = (symbol_short!("BAL"), from.clone());
        let balance: i128 = env.storage().persistent().get(&from_key).unwrap_or(0);
        if balance < amount {
            panic!("insufficient balance");
        }
        env.storage()
            .persistent()
            .set(&from_key, &(balance - amount));
        let to_key = (symbol_short!("BAL"), to.clone());
        let to_balance: i128 = env.storage().persistent().get(&to_key).unwrap_or(0);
        env.storage()
            .persistent()
            .set(&to_key, &(to_balance + amount));
    }

    pub fn metadata(env: Env) -> CropMetadata {
        env.storage()
            .instance()
            .get(&symbol_short!("META"))
            .expect("not initialized")
    }

    pub fn total_supply(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&symbol_short!("SUPPLY"))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn mint_and_transfer() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(CropTokenContract, ());
        let client = CropTokenContractClient::new(&env, &contract_id);
        let admin = Address::generate(&env);
        let farmer = Address::generate(&env);
        let investor = Address::generate(&env);
        let meta = CropMetadata {
            crop_type: CropType::Coffee,
            region: String::from_str(&env, "Huila"),
            harvest_season: String::from_str(&env, "2026-1"),
            expected_yield_kg: 5000,
            ndvi_score: 72,
        };
        client.initialize(&admin, &meta, &10000);
        client.mint(&farmer, &3000);
        assert_eq!(client.balance(&farmer), 3000);
        client.transfer(&farmer, &investor, &1000);
        assert_eq!(client.balance(&investor), 1000);
    }
}
