-- Site görselleri için depolama alanı: herkes görselleri açabilir, yalnızca yöneticiler yükler ve siler.
-- Herkese açık kova olduğu için dosyalar listeleme izni olmadan /object/public/ adresinden sunulur.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-media',
  'site-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do nothing;

create policy "site-media: yönetici görür" on storage.objects
  for select to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()));

create policy "site-media: yönetici yükler" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'site-media' and (select public.is_admin()));

create policy "site-media: yönetici günceller" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()))
  with check (bucket_id = 'site-media' and (select public.is_admin()));

create policy "site-media: yönetici siler" on storage.objects
  for delete to authenticated
  using (bucket_id = 'site-media' and (select public.is_admin()));
