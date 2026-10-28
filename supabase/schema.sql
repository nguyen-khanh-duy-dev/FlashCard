-- Chạy file này trong Supabase Dashboard → SQL Editor → New query → Run

create table if not exists public.decks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.cards (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users on delete cascade,
  deck_id          uuid not null references public.decks on delete cascade,
  term             text not null,
  definition       text not null,
  example          text,
  -- Trường cho thuật toán ôn tập ngắt quãng (SM-2)
  ease             real not null default 2.5,
  interval_days    integer not null default 0,
  repetitions      integer not null default 0,
  lapses           integer not null default 0,
  due_at           timestamptz not null default now(),
  last_reviewed_at timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists cards_deck_idx on public.cards (deck_id);
create index if not exists cards_due_idx  on public.cards (user_id, due_at);

-- Bảo mật: mỗi người chỉ thấy dữ liệu của chính mình
alter table public.decks enable row level security;
alter table public.cards enable row level security;

drop policy if exists "own decks" on public.decks;
create policy "own decks" on public.decks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own cards" on public.cards;
create policy "own cards" on public.cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
