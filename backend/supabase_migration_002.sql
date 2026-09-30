-- Migration 002: private payment screenshots, "I have paid" confirmation, 30-day plan periods,
-- and rejection reasons. Run once in the Supabase SQL editor. Safe to re-run.

alter table subscriptions add column if not exists payment_proof_url text;   -- legacy (public URLs), no longer written
alter table subscriptions add column if not exists payment_proof_path text;  -- path in the private payment-proofs bucket
alter table subscriptions add column if not exists paid_confirmed boolean not null default false;
alter table subscriptions add column if not exists amount_inr integer;
alter table subscriptions add column if not exists submitted_at timestamptz;
alter table subscriptions add column if not exists verified_at timestamptz;
alter table subscriptions add column if not exists current_period_end timestamptz;
alter table subscriptions add column if not exists rejection_reason text;

alter table subscriptions drop constraint if exists subscriptions_status_check;
alter table subscriptions add constraint subscriptions_status_check
  check (status in ('inactive', 'pending_verification', 'active', 'rejected'));

-- Private bucket for payment screenshots (admins view them through signed URLs)
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
