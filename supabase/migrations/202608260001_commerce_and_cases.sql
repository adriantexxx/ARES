create table public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  plan_id text not null check (plan_id in ('diagnosis','priority')),
  device_model text,
  issue_summary text not null check (char_length(issue_summary) between 10 and 5000),
  payment_reference text not null unique check (payment_reference ~ '^ares_[A-Za-z0-9_-]{1,180}$'),
  stripe_checkout_session_id text unique,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  status text not null default 'awaiting_payment' check (status in ('new','awaiting_payment','paid','in_progress','awaiting_customer','resolved','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_requests_user_created_idx on public.support_requests(user_id, created_at desc);
create index support_requests_org_status_idx on public.support_requests(organization_id, status);
create trigger support_requests_updated before update on public.support_requests for each row execute procedure public.touch_updated_at();
alter table public.support_requests enable row level security;
create policy "customers create own support requests" on public.support_requests for insert with check (user_id = auth.uid());
create policy "customers read own support requests" on public.support_requests for select using (user_id = auth.uid());
create policy "organisation members manage support requests" on public.support_requests for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
