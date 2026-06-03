create table if not exists public.finance_profiles (
  user_id uuid primary key default auth.uid(),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.finance_profiles enable row level security;

drop policy if exists "finance_profiles_select_own" on public.finance_profiles;
drop policy if exists "finance_profiles_insert_own" on public.finance_profiles;
drop policy if exists "finance_profiles_update_own" on public.finance_profiles;

create policy "finance_profiles_select_own"
on public.finance_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "finance_profiles_insert_own"
on public.finance_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "finance_profiles_update_own"
on public.finance_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
