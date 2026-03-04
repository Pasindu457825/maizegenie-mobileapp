-- Subscription fields for profiles table
-- Run this in Supabase SQL editor before testing payment flow.

alter table public.profiles
  add column if not exists is_paid_user boolean not null default false,
  add column if not exists subscription_plan text,
  add column if not exists subscription_start_date timestamptz,
  add column if not exists subscription_end_date timestamptz,
  add column if not exists last_payment_order_id text,
  add column if not exists last_payment_amount_lkr integer;

create index if not exists idx_profiles_subscription_end_date
  on public.profiles(subscription_end_date);
