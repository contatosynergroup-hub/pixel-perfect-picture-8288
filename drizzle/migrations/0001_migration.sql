create or replace function public.is_team_member(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles r join public.profiles p on p.id = r.user_id
    where r.user_id = _user_id and p.active
  )
$$;

drop policy if exists "profiles read" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));

drop policy if exists "params read" on public.sizing_parameters;
create policy "params read team" on public.sizing_parameters for select to authenticated
  using (public.is_team_member(auth.uid()));

drop policy if exists "company read" on public.company_settings;
create policy "company read team" on public.company_settings for select to authenticated
  using (public.is_team_member(auth.uid()));