-- BulGol shared backend (Supabase free tier). Run once in SQL editor. Points only, no money.
create table profiles(id uuid primary key references auth.users on delete cascade,name text not null check(char_length(name) between 1 and 30),fan_team text,created_at timestamptz default now());
create table matches(id uuid primary key default gen_random_uuid(),owner uuid not null default auth.uid() references profiles(id),league text not null,home text not null,away text not null,
 home_badge text,away_badge text,real_event_id text,kickoff timestamptz not null,stake text check(char_length(stake)<=80),
 state text not null default 'pre' check(state in('pre','live','done')),result jsonb,winner uuid,created_at timestamptz default now());
create table match_members(match_id uuid references matches on delete cascade,user_id uuid default auth.uid() references profiles(id),primary key(match_id,user_id));
create table predictions(match_id uuid references matches on delete cascade,user_id uuid not null default auth.uid() references profiles(id),pick jsonb not null,points int,updated_at timestamptz default now(),primary key(match_id,user_id));
create table chat(id bigserial primary key,match_id uuid references matches on delete cascade,user_id uuid not null default auth.uid() references profiles(id),body text not null check(char_length(body) between 1 and 200),created_at timestamptz default now());
create table leagues(id uuid primary key default gen_random_uuid(),owner uuid default auth.uid(),name text check(char_length(name) between 1 and 40),invite_code text unique default encode(gen_random_bytes(6),'hex'));
create table league_members(league_id uuid references leagues on delete cascade,user_id uuid default auth.uid(),primary key(league_id,user_id));
alter table profiles enable row level security;alter table matches enable row level security;alter table match_members enable row level security;
alter table predictions enable row level security;alter table chat enable row level security;alter table leagues enable row level security;alter table league_members enable row level security;
create function is_member(m uuid) returns boolean language sql security definer stable as $$select exists(select 1 from match_members where match_id=m and user_id=auth.uid())$$;
create function in_league(l uuid) returns boolean language sql security definer stable as $$select exists(select 1 from league_members where league_id=l and user_id=auth.uid())$$;
create policy p_read on profiles for select using(auth.uid() is not null);
create policy p_own on profiles for all using(id=auth.uid()) with check(id=auth.uid());
create policy m_read on matches for select using(auth.uid() is not null); -- readable by link (uuid is unguessable)
create policy m_ins on matches for insert with check(owner=auth.uid());
create policy m_upd on matches for update using(owner=auth.uid());
create policy mm_ins on match_members for insert with check(user_id=auth.uid());
create policy mm_read on match_members for select using(is_member(match_id));
-- picks: you write only your own, only before kickoff; others' picks visible only after kickoff
create policy pr_write on predictions for insert with check(user_id=auth.uid() and is_member(match_id) and (select kickoff from matches where id=match_id)>now());
create policy pr_upd on predictions for update using(user_id=auth.uid() and (select kickoff from matches where id=match_id)>now());
create policy pr_read on predictions for select using(user_id=auth.uid() or (is_member(match_id) and (select kickoff from matches where id=match_id)<=now()));
create policy c_read on chat for select using(is_member(match_id));
create policy c_ins on chat for insert with check(user_id=auth.uid() and is_member(match_id));
create policy l_read on leagues for select using(in_league(id) or owner=auth.uid());
create policy l_ins on leagues for insert with check(owner=auth.uid());
create policy lm_ins on league_members for insert with check(user_id=auth.uid());
create policy lm_read on league_members for select using(in_league(league_id));
-- points are written only by a server job (service role / Edge Function at full time), never by clients: no client update policy on predictions.points.
revoke update on predictions from authenticated, anon; grant update(pick,updated_at) on predictions to authenticated;
revoke update on matches from authenticated, anon; grant update(stake,state) on matches to authenticated; -- result/winner written by server job only

-- v5: Web Push subscriptions (one row per browser endpoint; owner-only via RLS)
create table if not exists push_subscriptions(endpoint text primary key check(endpoint like 'https://%'),user_id uuid not null default auth.uid() references profiles(id) on delete cascade,p256dh text not null,auth text not null,created_at timestamptz default now());
alter table push_subscriptions enable row level security;
create policy push_sel on push_subscriptions for select using(user_id=auth.uid());
create policy push_ins on push_subscriptions for insert with check(user_id=auth.uid());
create policy push_upd on push_subscriptions for update using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy push_del on push_subscriptions for delete using(user_id=auth.uid());
-- The notify-ft Edge Function reads this table with the service role key (server-side secret, never in the repo).
alter table matches add column if not exists home_score int, add column if not exists away_score int; -- final score written at FT, used by notify-ft
