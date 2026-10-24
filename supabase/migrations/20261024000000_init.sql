-- Coffee House TR franchise platformu: şema, güvenlik kuralları (RLS) ve varsayılan içerik

-- ---------------------------------------------------------------------------
-- Yardımcılar
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Yöneticiler
-- ---------------------------------------------------------------------------

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is 'Yönetim paneline erişebilen kullanıcılar. Yalnızca SQL ile yönetilir.';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Site içeriği: konseptler, yatırım süreci, metinler
-- ---------------------------------------------------------------------------

create table public.concepts (
  slug text primary key check (slug ~ '^[a-z0-9-]{2,32}$'),
  sort_order smallint not null default 0,
  code text not null check (char_length(code) between 1 and 4),
  name text not null check (char_length(name) between 2 and 40),
  short_name text not null check (char_length(short_name) between 2 and 24),
  area_min integer not null check (area_min > 0),
  area_max integer not null,
  price_min bigint not null check (price_min > 0),
  price_max bigint not null,
  tagline text not null default '' check (char_length(tagline) <= 160),
  description text not null default '' check (char_length(description) <= 2000),
  hero_image_url text check (hero_image_url is null or hero_image_url ~ '^https://'),
  hero_image_alt text check (hero_image_alt is null or char_length(hero_image_alt) <= 200),
  gallery jsonb not null default '[]'::jsonb check (jsonb_typeof(gallery) = 'array'),
  is_published boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint concepts_area_range check (area_max >= area_min),
  constraint concepts_price_range check (price_max >= price_min)
);

create trigger concepts_updated_at before update on public.concepts
  for each row execute function public.set_updated_at();

create table public.journey_steps (
  id uuid primary key default gen_random_uuid(),
  sort_order smallint not null default 0,
  title text not null check (char_length(title) between 1 and 80),
  description text not null default '' check (char_length(description) <= 600),
  updated_at timestamptz not null default now()
);

create trigger journey_steps_updated_at before update on public.journey_steps
  for each row execute function public.set_updated_at();

create table public.site_content (
  key text primary key check (key ~ '^[a-z0-9_.]{2,64}$'),
  value text not null default '' check (char_length(value) <= 4000),
  updated_at timestamptz not null default now()
);

create trigger site_content_updated_at before update on public.site_content
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Başvurular
-- ---------------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'meeting', 'location', 'feasibility', 'contract', 'opening', 'on_hold', 'rejected')),
  concept text not null check (concept in ('corner', 'mahal', 'agora', 'undecided')),
  city text not null check (char_length(city) between 2 and 40),
  district text not null check (char_length(district) between 2 and 60),
  budget text not null check (budget in ('2-3', '3-4', '4-6', '6+')),
  property_status text not null check (property_status in ('ready', 'need_location')),
  full_name text not null check (char_length(full_name) between 3 and 100),
  phone text not null check (phone ~ '^\+905[0-9]{9}$'),
  email text check (email is null or (char_length(email) <= 160 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$')),
  note text check (note is null or char_length(note) <= 1000),
  kvkk_consent boolean not null check (kvkk_consent),
  marketing_consent boolean not null default false,
  utm jsonb not null default '{}'::jsonb check (jsonb_typeof(utm) = 'object' and pg_column_size(utm) < 4000),
  source_path text check (source_path is null or char_length(source_path) <= 300),
  ip_hash text,
  user_agent text check (user_agent is null or char_length(user_agent) <= 300)
);

create index applications_created_at_idx on public.applications (created_at desc);
create index applications_status_idx on public.applications (status);
create index applications_location_idx on public.applications (city, district);
create index applications_phone_idx on public.applications (phone, created_at desc);

create trigger applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();

create table public.application_activity (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  created_at timestamptz not null default now(),
  author_id uuid references auth.users (id) on delete set null,
  author_email text,
  kind text not null check (kind in ('note', 'status')),
  body text check (body is null or char_length(body) between 1 and 4000),
  from_status text,
  to_status text
);

create index application_activity_application_idx on public.application_activity (application_id, created_at desc);

-- Not ve durum kayıtlarında yazarı oturumdaki kullanıcıdan al (istemci değiştiremez)
create or replace function public.set_activity_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.author_id := (select auth.uid());
  new.author_email := (select email from auth.users where id = new.author_id);
  new.created_at := now();
  return new;
end;
$$;

create trigger application_activity_author before insert on public.application_activity
  for each row execute function public.set_activity_author();

-- Durum değişikliklerini geçmişe yaz
create or replace function public.log_application_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.application_activity (application_id, kind, from_status, to_status)
    values (new.id, 'status', old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger applications_status_log after update of status on public.applications
  for each row execute function public.log_application_status();

-- ---------------------------------------------------------------------------
-- Başvuru gönderimi (yalnızca sunucu, service_role ile çağırır)
-- ---------------------------------------------------------------------------

create table public.submission_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index submission_attempts_ip_idx on public.submission_attempts (ip_hash, created_at desc);

create or replace function public.submit_application(p jsonb, p_ip_hash text, p_user_agent text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  v_phone text := p ->> 'phone';
  v_ref text;
  v_attempts integer;
begin
  if p_ip_hash is not null then
    select count(*) into v_attempts
    from public.submission_attempts
    where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';

    if v_attempts >= 5 then
      return jsonb_build_object('ok', false, 'error', 'rate_limited');
    end if;

    insert into public.submission_attempts (ip_hash) values (p_ip_hash);
    if random() < 0.02 then
      delete from public.submission_attempts where created_at < now() - interval '1 day';
    end if;
  end if;

  -- Aynı numaradan 10 dakika içinde gelen tekrar gönderim yeni kayıt açmaz
  select ref_code into v_ref
  from public.applications
  where phone = v_phone and created_at > now() - interval '10 minutes'
  order by created_at desc
  limit 1;

  if v_ref is not null then
    return jsonb_build_object('ok', true, 'ref', v_ref, 'duplicate', true);
  end if;

  for attempt in 1..5 loop
    v_ref := 'CH-' || to_char(now() at time zone 'Europe/Istanbul', 'YY') || '-';
    for i in 1..6 loop
      v_ref := v_ref || substr(v_alphabet, 1 + floor(random() * 32)::integer, 1);
    end loop;

    begin
      insert into public.applications (
        ref_code, concept, city, district, budget, property_status, full_name, phone, email, note,
        kvkk_consent, marketing_consent, utm, source_path, ip_hash, user_agent
      ) values (
        v_ref,
        p ->> 'concept',
        p ->> 'city',
        p ->> 'district',
        p ->> 'budget',
        p ->> 'property_status',
        p ->> 'full_name',
        v_phone,
        nullif(p ->> 'email', ''),
        nullif(p ->> 'note', ''),
        coalesce((p ->> 'kvkk_consent')::boolean, false),
        coalesce((p ->> 'marketing_consent')::boolean, false),
        coalesce(p -> 'utm', '{}'::jsonb),
        nullif(p ->> 'source_path', ''),
        p_ip_hash,
        left(p_user_agent, 300)
      );
      return jsonb_build_object('ok', true, 'ref', v_ref);
    exception when unique_violation then
      -- Referans numarası çakıştı; yeniden dene
    end;
  end loop;

  raise exception 'Referans numarası üretilemedi';
end;
$$;

revoke all on function public.submit_application(jsonb, text, text) from public, anon, authenticated;
grant execute on function public.submit_application(jsonb, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- Panel istatistikleri (RLS geçerli: yalnızca yönetici gerçek veriyi görür)
-- ---------------------------------------------------------------------------

create or replace function public.application_stats(p_days integer default 30)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  -- p_days null: tüm zamanlar. Tüm kırılımlar aynı dönemi kapsar.
  with params as (
    select
      (now() at time zone 'Europe/Istanbul')::date as today,
      case when p_days is null then null else greatest(least(p_days, 365), 1) end as days
  ),
  base as (
    select a.* from public.applications a, params
    where params.days is null or a.created_at > now() - make_interval(days => params.days)
  ),
  range as (
    select
      greatest(
        coalesce(
          case when params.days is null then (select min((created_at at time zone 'Europe/Istanbul')::date) from public.applications)
               else params.today - (params.days - 1) end,
          params.today
        ),
        params.today - 364
      ) as first_day,
      params.today as last_day
    from params
  ),
  days as (
    select generate_series(range.first_day, range.last_day, interval '1 day')::date as day from range
  )
  select jsonb_build_object(
    'days', (select days from params),
    'total_all', (select count(*) from public.applications),
    'period', (select count(*) from base),
    'prev_period', (
      select case when params.days is null then null else (
        select count(*) from public.applications
        where created_at <= now() - make_interval(days => params.days)
          and created_at > now() - make_interval(days => params.days * 2)
      ) end from params
    ),
    'new', (select count(*) from base where status = 'new'),
    'in_progress', (select count(*) from base where status in ('contacted', 'meeting', 'location', 'feasibility', 'contract', 'opening')),
    'by_status', coalesce((select jsonb_object_agg(status, n) from (select status, count(*) n from base group by status) s), '{}'::jsonb),
    'by_concept', coalesce((select jsonb_object_agg(concept, n) from (select concept, count(*) n from base group by concept) s), '{}'::jsonb),
    'by_budget', coalesce((select jsonb_object_agg(budget, n) from (select budget, count(*) n from base group by budget) s), '{}'::jsonb),
    'by_property', coalesce((select jsonb_object_agg(property_status, n) from (select property_status, count(*) n from base group by property_status) s), '{}'::jsonb),
    'top_cities', coalesce((
      select jsonb_agg(jsonb_build_object('city', city, 'count', n) order by n desc, city)
      from (select city, count(*) n from base group by city order by n desc, city limit 8) s
    ), '[]'::jsonb),
    'daily', (
      select jsonb_agg(jsonb_build_object('day', d.day, 'count', coalesce(c.n, 0)) order by d.day)
      from days d
      left join (
        select (created_at at time zone 'Europe/Istanbul')::date as day, count(*) n
        from base group by 1
      ) c on c.day = d.day
    )
  );
$$;

revoke all on function public.application_stats(integer) from public, anon;
grant execute on function public.application_stats(integer) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Satır düzeyi güvenlik (RLS)
-- ---------------------------------------------------------------------------

alter table public.admin_users enable row level security;
alter table public.concepts enable row level security;
alter table public.journey_steps enable row level security;
alter table public.site_content enable row level security;
alter table public.applications enable row level security;
alter table public.application_activity enable row level security;
alter table public.submission_attempts enable row level security;

-- Yöneticiler: kişi kendi kaydını, yönetici tümünü görür; yazma yalnızca SQL ile
create policy "admin_users: okuma" on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

-- Konseptler: yayındakiler herkese açık, yazma yöneticiye
create policy "concepts: herkes okur" on public.concepts
  for select to anon, authenticated
  using (is_published or (select public.is_admin()));
create policy "concepts: yönetici ekler" on public.concepts
  for insert to authenticated with check ((select public.is_admin()));
create policy "concepts: yönetici günceller" on public.concepts
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "concepts: yönetici siler" on public.concepts
  for delete to authenticated using ((select public.is_admin()));

-- Yatırım süreci adımları
create policy "journey_steps: herkes okur" on public.journey_steps
  for select to anon, authenticated using (true);
create policy "journey_steps: yönetici ekler" on public.journey_steps
  for insert to authenticated with check ((select public.is_admin()));
create policy "journey_steps: yönetici günceller" on public.journey_steps
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "journey_steps: yönetici siler" on public.journey_steps
  for delete to authenticated using ((select public.is_admin()));

-- Site metinleri
create policy "site_content: herkes okur" on public.site_content
  for select to anon, authenticated using (true);
create policy "site_content: yönetici ekler" on public.site_content
  for insert to authenticated with check ((select public.is_admin()));
create policy "site_content: yönetici günceller" on public.site_content
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "site_content: yönetici siler" on public.site_content
  for delete to authenticated using ((select public.is_admin()));

-- Başvurular: yalnızca yönetici görür, durumunu değiştirir ve (KVKK talebiyle) siler.
-- Ekleme yalnızca submit_application() üzerinden yapılır.
create policy "applications: yönetici okur" on public.applications
  for select to authenticated using ((select public.is_admin()));
create policy "applications: yönetici günceller" on public.applications
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "applications: yönetici siler" on public.applications
  for delete to authenticated using ((select public.is_admin()));

-- Başvuru geçmişi ve notlar
create policy "application_activity: yönetici okur" on public.application_activity
  for select to authenticated using ((select public.is_admin()));
create policy "application_activity: yönetici not ekler" on public.application_activity
  for insert to authenticated with check ((select public.is_admin()) and kind = 'note');

-- submission_attempts: politika yok; yalnızca submit_application() erişir

-- Tablo ve sütun yetkileri (RLS'e ek savunma katmanı)
revoke all on public.applications from anon;
revoke insert, update on public.applications from authenticated;
grant update (status) on public.applications to authenticated;
revoke all on public.application_activity from anon;
revoke update, delete on public.application_activity from authenticated;
revoke all on public.submission_attempts from anon, authenticated;
revoke insert, update, delete on public.admin_users from anon, authenticated;
revoke all on public.admin_users from anon;

-- ---------------------------------------------------------------------------
-- Canlı bildirim (Supabase Realtime)
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.applications;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- Varsayılan içerik (yönetim panelinden değiştirilebilir)
-- ---------------------------------------------------------------------------

insert into public.concepts (slug, sort_order, code, name, short_name, area_min, area_max, price_min, price_max, tagline, description) values
  ('corner', 1, '01', 'Corner CH', 'CORNER', 30, 30, 2000000, 2000000,
   '30 m²''lik kompakt Coffee House.',
   'Küçük bir alanda Coffee House menüsünü ve servisini sunmak isteyen yatırımcılar için kompakt model. Dükkânın yerleşimi, lokasyon değerlendirmesinden sonra alanın ölçülerine göre hazırlanır.'),
  ('mahal', 2, '02', 'Mahal CH', 'MAHAL', 100, 150, 3000000, 4000000,
   '100–150 m²''lik mahalle Coffee House''u.',
   'Semtinde misafir ağırlayan, oturma alanı olan bir Coffee House açmak isteyen yatırımcılar için orta ölçekli model. Dükkânın yerleşimi, lokasyon değerlendirmesinden sonra alanın ölçülerine göre hazırlanır.'),
  ('agora', 3, '03', 'Agora CH', 'AGORA', 200, 200, 6000000, 6000000,
   '200 m²''lik geniş Coffee House.',
   'Geniş oturma alanı isteyen cadde ve merkez lokasyonları için en büyük Coffee House modeli. Dükkânın yerleşimi, lokasyon değerlendirmesinden sonra alanın ölçülerine göre hazırlanır.');

insert into public.journey_steps (sort_order, title, description) values
  (1, 'Başvuru', 'Bayilik başvuru formunu doldurursunuz; başvurunuz bir referans numarasıyla kayda alınır.'),
  (2, 'Ön Görüşme', 'Ekibimiz sizinle iletişime geçer; hedeflerinizi, bütçenizi ve beklentilerinizi konuşuruz.'),
  (3, 'Lokasyon Değerlendirmesi', 'Hazır dükkânınızı ya da aday lokasyonları konseptin ihtiyaçlarına göre birlikte değerlendiririz.'),
  (4, 'Fizibilite Çalışması', 'Lokasyona özel fizibilite çalışmasıyla yatırımın çerçevesini netleştiririz.'),
  (5, 'Planlama ve Sözleşme', 'Konsept, takvim ve koşullar netleştiğinde franchise sözleşmesi imzalanır.'),
  (6, 'Kurulum ve Açılış', 'Kurulum tamamlanır ve Coffee House işletmeniz misafirlerini karşılar.');

insert into public.site_content (key, value) values
  ('hero.line1', 'Bir marka.'),
  ('hero.line2', 'Üç konsept.'),
  ('hero.line3', 'Sınırsız vizyon.'),
  ('hero.subtitle', 'Coffee House yatırım modelleriyle kendi işletmenizi hayata geçirin.'),
  ('hero.video_url', ''),
  ('hero.video_wide_url', ''),
  ('about.title', 'Kendi dükkânımızı işletiyor, aynısını sizin için kuruyoruz.'),
  ('about.body', 'Coffee House kendi şubesini işleten bir kahve markasıdır. Asıl işimiz, yatırımcılarımıza anahtar teslim Coffee House dükkânı kurmaktır.

Şubemizde ne sunuyorsak sizin dükkânınızda da onu kuruyoruz: aynı marka, aynı menü, aynı düzen. Lokasyon değerlendirmesinden açılış gününe kadar süreci birlikte yürütüyoruz.'),
  ('cta.title', 'Bilgilerinizi bırakın, fizibilite raporuyla sizi arayalım.'),
  ('cta.body', 'Başvuru formu birkaç dakika sürer. Ekibimiz başvurunuzu inceleyip ön görüşme için sizinle iletişime geçer.'),
  ('contact.phone', ''),
  ('contact.whatsapp', ''),
  ('contact.email', ''),
  ('contact.address', ''),
  ('contact.instagram', 'https://www.instagram.com/_coffeehouse.tr'),
  ('contact.website', 'https://www.coffeehousetr.com'),
  ('brand.logo_url', ''),
  ('legal.company_name', ''),
  ('legal.company_address', ''),
  ('legal.mersis', ''),
  ('legal.kvkk_email', ''),
  ('legal.retention', '2 yıl');
