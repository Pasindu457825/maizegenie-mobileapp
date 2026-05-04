-- PayHere payment tracking table
create table if not exists public.subscription_payments (
  order_id text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  billing_cycle text not null check (billing_cycle in ('monthly', 'annual')),
  amount_lkr integer not null,
  currency text not null default 'LKR',
  status text not null default 'pending',
  gateway_payment_id text,
  raw_notify jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  paid_at timestamptz
);

create index if not exists idx_subscription_payments_user_id
  on public.subscription_payments(user_id);

create index if not exists idx_subscription_payments_status
  on public.subscription_payments(status);
