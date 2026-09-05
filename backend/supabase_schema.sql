-- Run this once in the Supabase SQL editor (Project > SQL Editor) after creating your project.
-- Requires: Supabase Auth already enabled (default on every project).

create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('restaurant', 'ngo', 'admin')),
  org_name text not null,
  city text,
  phone text,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table surplus_logs (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references profiles (id) on delete cascade,
  food_type text not null,
  quantity_kg numeric not null,
  storage text,
  pickup_time timestamptz,
  packaging text,
  photo_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references profiles (id) on delete cascade,
  log_id uuid references surplus_logs (id) on delete set null,
  food_type text not null,
  quantity_kg numeric not null,
  pickup_window text,
  status text not null default 'available' check (status in ('available', 'claimed', 'completed', 'expired')),
  created_at timestamptz not null default now()
);

create table claims (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references marketplace_listings (id) on delete cascade,
  ngo_id uuid not null references profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'picked_up', 'cancelled')),
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null unique references profiles (id) on delete cascade,
  plan text not null default 'basic' check (plan in ('basic', 'pro')),
  status text not null default 'inactive' check (status in ('inactive', 'pending_verification', 'active')),
  payment_note text,
  verified_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- Row Level Security: the backend uses the service-role key (bypasses RLS) for all access,
-- so enabling RLS here just blocks any direct client-side access via the anon/public key.
alter table profiles enable row level security;
alter table surplus_logs enable row level security;
alter table marketplace_listings enable row level security;
alter table claims enable row level security;
alter table subscriptions enable row level security;

-- Create the storage bucket used for surplus-log photos: Storage > New bucket > "surplus-photos" (public).
