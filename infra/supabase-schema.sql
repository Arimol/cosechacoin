-- Esquema CosechaCoin v2 — multi-cosecha, demo + producción

drop table if exists boosters cascade;
drop table if exists crops cascade;

create table crops (
  id                  uuid primary key default gen_random_uuid(),
  contract_id         text unique,
  mode                text not null default 'production'
                        check (mode in ('demo','production')),
  status              text not null default 'pending'
                        check (status in ('pending','active','validated','completed')),
  crop_type           text not null check (crop_type in ('coffee','beans','cacao')),
  crop_name           text not null,
  region              text not null,
  farmer_public_key   text not null,
  total_tokens        int  not null,
  price_per_token     numeric not null,
  harvest_date        bigint not null,
  yield_percentage    int default 0,
  ndvi_score          numeric,
  expected_yield_kg   numeric,
  created_at          timestamptz default now()
);

create table boosters (
  id                  uuid primary key default gen_random_uuid(),
  crop_id             uuid references crops(id) on delete cascade,
  contract_id         text unique,
  booster_id_onchain  int,
  booster_type        text not null check (
                        booster_type in (
                          'drone_ndvi','smart_irrigation',
                          'certified_seeds','iot_sensors',
                          'organic_certification'
                        )),
  investor_public_key text,
  provider_public_key text,
  amount              numeric,
  status              text not null default 'pending'
                        check (status in ('pending','active','completed')),
  report_hash         text default '',
  created_at          timestamptz default now()
);

create index idx_crops_mode    on crops   (mode);
create index idx_crops_status  on crops   (status);
create index idx_crops_created on crops   (created_at desc);
create index idx_boosters_crop on boosters(crop_id);
