-- Vietnam Travel authentication + per-user data schema
-- Run this once in Supabase SQL Editor for the project used by the app.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Traveler',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_travel_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  saved_provinces text[] not null default '{}',
  visited_provinces text[] not null default '{}',
  ai_chats jsonb not null default '{}'::jsonb,
  itineraries jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_travel_data enable row level security;

create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read own travel data"
on public.user_travel_data for select
using (auth.uid() = user_id);

create policy "Users can insert own travel data"
on public.user_travel_data for insert
with check (auth.uid() = user_id);

create policy "Users can update own travel data"
on public.user_travel_data for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(coalesce(new.email, 'Traveler'), '@', 1)),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  insert into public.user_travel_data (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
