-- Esquema sugerido para CosechaCoin en Supabase (PostgreSQL)

create table if not exists crops (
  id uuid primary key default gen_random_uuid(),
  crop_type text not null check (crop_type in ('coffee', 'beans', 'cacao')),
  region text not null,
  expected_yield_kg numeric,
  ndvi_score numeric,
  stellar_contract_id text,
  farmer_public_key text,
  created_at timestamptz default now()
);

create table if not exists boosters (
  id uuid primary key default gen_random_uuid(),
  booster_type text not null check (
    booster_type in ('drone_ndvi', 'smart_irrigation', 'certified_seeds')
  ),
  description text,
  funding_goal numeric not null,
  funded_amount numeric default 0,
  released boolean default false,
  beneficiary_public_key text,
  soroban_booster_id integer,
  created_at timestamptz default now()
);

create index if not exists idx_crops_created on crops (created_at desc);
create index if not exists idx_boosters_created on boosters (created_at desc);
