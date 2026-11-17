create type public.app_role as enum ('admin','vendedor');
create type public.client_type as enum ('residencial','comercial','industrial','rural');
create type public.quote_modality as enum ('fotovoltaico','boiler','piscina','manual');
create type public.quote_status as enum ('rascunho','enviado','negociacao','aprovado','perdido','expirado');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "profiles read" on public.profiles for select to authenticated using (true);
create policy "profiles update own" on public.profiles for update to authenticated using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "roles read own or admin" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "roles admin insert" on public.user_roles for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "roles admin delete" on public.user_roles for delete to authenticated using (public.has_role(auth.uid(),'admin'));
grant insert, delete on public.user_roles to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare first_user boolean;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1)), new.email);
  select not exists (select 1 from public.user_roles where role = 'admin') into first_user;
  insert into public.user_roles (user_id, role) values (new.id, case when first_user then 'admin'::public.app_role else 'vendedor'::public.app_role end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  name text not null,
  document text,
  phone text,
  whatsapp text,
  email text,
  cep text,
  address text,
  city text,
  state text,
  client_type public.client_type not null default 'residencial',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clients to authenticated;
grant all on public.clients to service_role;
alter table public.clients enable row level security;
create policy "clients select" on public.clients for select to authenticated using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "clients insert" on public.clients for insert to authenticated with check (owner_id = auth.uid());
create policy "clients update" on public.clients for update to authenticated using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "clients delete" on public.clients for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  default_margin numeric not null default 0,
  sort_order int not null default 0
);
grant select on public.product_categories to authenticated;
grant insert, update, delete on public.product_categories to authenticated;
grant all on public.product_categories to service_role;
alter table public.product_categories enable row level security;
create policy "cat read" on public.product_categories for select to authenticated using (true);
create policy "cat admin write" on public.product_categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

insert into public.product_categories (slug,name,sort_order) values
('modulos','Módulos fotovoltaicos',1),('inversores','Inversores',2),('microinversores','Microinversores',3),
('estruturas','Estruturas',4),('cabos','Cabos e conectores',5),('protecoes','Proteções elétricas',6),
('boilers','Boilers',7),('coletores_agua','Coletores solares de água',8),('coletores_piscina','Coletores de piscina',9),
('bombas','Bombas e controladores',10),('tubulacoes','Tubulações',11),('conexoes','Conexões',12),
('acessorios','Acessórios',13),('servicos','Serviços e mão de obra',14);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  code text,
  category_id uuid references public.product_categories(id),
  manufacturer text,
  model text,
  description text not null,
  specs jsonb not null default '{}'::jsonb,
  unit text not null default 'un',
  cost_price numeric not null default 0,
  sale_price numeric not null default 0,
  supplier text,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products read" on public.products for select to authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "products admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.sizing_parameters (
  modality public.quote_modality primary key,
  params jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.sizing_parameters to authenticated;
grant all on public.sizing_parameters to service_role;
alter table public.sizing_parameters enable row level security;
create policy "params read" on public.sizing_parameters for select to authenticated using (true);
create policy "params admin write" on public.sizing_parameters for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.sizing_parameters (modality, params) values
('fotovoltaico','{"perdas_pct":20,"area_por_modulo_m2":2.6,"custo_disponibilidade_kwh":100,"compensacao_pct":100}'),
('boiler','{"litros_por_pessoa":50,"eficiencia_coletor_pct":50,"irradiacao_kwh_m2_dia":4.5,"area_coletor_m2":2}'),
('piscina','{"perda_diaria_c_aberta":2,"perda_diaria_c_capa":1,"razao_area_coletor":0.8,"area_coletor_m2":3.3}');

create table public.company_settings (
  id int primary key default 1 check (id = 1),
  legal_name text, trade_name text default 'GT Solar', cnpj text, address text, phone text, whatsapp text,
  email text, website text, logo_url text, bank_info text, payment_terms text, warranties text,
  proposal_text text, general_conditions text, default_validity_days int not null default 15,
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.company_settings to authenticated;
grant all on public.company_settings to service_role;
alter table public.company_settings enable row level security;
create policy "company read" on public.company_settings for select to authenticated using (true);
create policy "company admin write" on public.company_settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.company_settings (id) values (1);

create sequence public.quote_number_seq;
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  number text unique not null default ('GT-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.quote_number_seq')::text, 4, '0')),
  seller_id uuid not null default auth.uid(),
  client_id uuid references public.clients(id) on delete set null,
  modality public.quote_modality not null,
  status public.quote_status not null default 'rascunho',
  title text,
  sizing_input jsonb not null default '{}'::jsonb,
  sizing_result jsonb not null default '{}'::jsonb,
  labor_cost numeric not null default 0,
  travel_cost numeric not null default 0,
  freight_cost numeric not null default 0,
  extra_cost numeric not null default 0,
  tax_pct numeric not null default 0,
  margin_pct numeric not null default 0,
  discount numeric not null default 0,
  total_cost numeric not null default 0,
  total_value numeric not null default 0,
  payment_terms text,
  execution_days int,
  notes text,
  lost_reason text,
  next_contact date,
  valid_until date,
  revision int not null default 0,
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.quotes to authenticated;
grant all on public.quotes to service_role;
alter table public.quotes enable row level security;
create policy "quotes select" on public.quotes for select to authenticated using (seller_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "quotes insert" on public.quotes for insert to authenticated with check (seller_id = auth.uid());
create policy "quotes update" on public.quotes for update to authenticated using (seller_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "quotes delete" on public.quotes for delete to authenticated using (seller_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  description text not null,
  category_slug text,
  unit text not null default 'un',
  quantity numeric not null default 1,
  unit_cost numeric not null default 0,
  unit_price numeric not null default 0,
  sort_order int not null default 0
);
grant select, insert, update, delete on public.quote_items to authenticated;
grant all on public.quote_items to service_role;
alter table public.quote_items enable row level security;
create policy "items via quote" on public.quote_items for all to authenticated
  using (exists (select 1 from public.quotes q where q.id = quote_id and (q.seller_id = auth.uid() or public.has_role(auth.uid(),'admin'))))
  with check (exists (select 1 from public.quotes q where q.id = quote_id and (q.seller_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

create table public.quote_revisions (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  revision int not null,
  snapshot jsonb not null,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);
grant select, insert on public.quote_revisions to authenticated;
grant all on public.quote_revisions to service_role;
alter table public.quote_revisions enable row level security;
create policy "rev via quote" on public.quote_revisions for all to authenticated
  using (exists (select 1 from public.quotes q where q.id = quote_id and (q.seller_id = auth.uid() or public.has_role(auth.uid(),'admin'))))
  with check (exists (select 1 from public.quotes q where q.id = quote_id and (q.seller_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

create table public.quote_status_history (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  status public.quote_status not null,
  note text,
  changed_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
grant select, insert on public.quote_status_history to authenticated;
grant all on public.quote_status_history to service_role;
alter table public.quote_status_history enable row level security;
create policy "hist via quote" on public.quote_status_history for all to authenticated
  using (exists (select 1 from public.quotes q where q.id = quote_id and (q.seller_id = auth.uid() or public.has_role(auth.uid(),'admin'))))
  with check (exists (select 1 from public.quotes q where q.id = quote_id and (q.seller_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

create or replace function public.log_quote_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.quote_status_history (quote_id, status, note, changed_by) values (new.id, new.status, new.lost_reason, auth.uid());
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger quotes_status_log_ins after insert on public.quotes for each row execute function public.log_quote_status();
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$ begin new.updated_at := now(); return new; end $$;
create trigger quotes_touch before update on public.quotes for each row execute function public.touch_updated_at();
create or replace function public.log_quote_status_upd()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.quote_status_history (quote_id, status, note, changed_by) values (new.id, new.status, new.lost_reason, auth.uid());
  end if;
  return new;
end $$;
create trigger quotes_status_log_upd after update on public.quotes for each row execute function public.log_quote_status_upd();
create trigger clients_touch before update on public.clients for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
grant usage on sequence public.quote_number_seq to authenticated;