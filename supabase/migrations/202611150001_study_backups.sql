create table public.study_backups (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 10000000),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.study_backups enable row level security;
revoke all on public.study_backups from anon, authenticated;
grant select, insert, update on public.study_backups to authenticated;
create policy own_backup_select on public.study_backups for select to authenticated using ((select auth.uid()) = user_id);
create policy own_backup_insert on public.study_backups for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_backup_update on public.study_backups for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace function public.save_study_backup(document jsonb, expected_revision integer)
returns integer language plpgsql security invoker set search_path = '' as $$
declare next_revision integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if expected_revision = 0 then
    insert into public.study_backups(user_id,payload,revision) values (auth.uid(),document,1) on conflict do nothing returning revision into next_revision;
  else
    update public.study_backups set payload=document,revision=revision+1,updated_at=now() where user_id=auth.uid() and revision=expected_revision returning revision into next_revision;
  end if;
  if next_revision is null then raise exception 'Cloud copy changed. Refresh before saving.'; end if;
  return next_revision;
end;
$$;
revoke all on function public.save_study_backup(jsonb,integer) from public,anon;
grant execute on function public.save_study_backup(jsonb,integer) to authenticated;
