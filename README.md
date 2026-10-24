# Coffee House TR · Franchise 2026

Coffee House için yatırımcı odaklı franchise platformu: konseptleri tanıtan site, 5 adımlı bayilik başvurusu ve başvuruları yöneten CRM paneli.

**Teknoloji:** Next.js 16 (App Router, Cache Components) · TypeScript · Tailwind CSS 4 · GSAP (ScrollTrigger) · Motion (Framer Motion) · Supabase (PostgreSQL, Auth, RLS, Storage, Realtime) · Vercel

## İçindekiler

- [Neler var](#neler-var)
- [Hızlı başlangıç](#hızlı-başlangıç)
- [Supabase kurulumu](#supabase-kurulumu)
- [Vercel’e yayınlama](#vercele-yayınlama)
- [Yönetim paneli](#yönetim-paneli)
- [Güvenlik](#güvenlik)
- [Görseller ve doğrulanacak içerik](#görseller-ve-doğrulanacak-içerik)
- [Tasarım kuralları](#tasarım-kuralları)
- [Proje yapısı](#proje-yapısı)

## Neler var

**Site**

| Bölüm | Ayrıntı |
| --- | --- |
| Açılış | Oturumda bir kez oynayan logo animasyonu (yalnızca CSS, içeriği bekletmez, hareket azaltma tercihine uyar) |
| Ana ekran | “Bir marka. Üç konsept. Sınırsız vizyon.” başlığı; CORNER / MAHAL / AGORA önizlemesi. Fareyle üzerine gelince ya da dokununca arka plan ve bilgiler değişir; arka plan fare hareketine hafifçe tepki verir |
| Konseptler | Masaüstünde ekranı kaplayan, kaydırdıkça yatay ilerleyen galeri (GSAP ScrollTrigger); mobilde kaydırmalı galeri |
| Yatırım seçici | Bütçe ve mülk durumuna göre ön eşleştirme; her sonuçta “Bu modelle başvur ↗” bağlantısı. Kesin uygunluk ya da kârlılık garantisi vermez |
| Yatırım süreci | 6 aşama; kaydırdıkça ilerleyen çizgi ve vurgulanan aşama. Adımlar panelden düzenlenir |
| Konsept sayfaları | `/konseptler/corner`, `/mahal`, `/agora`: tam ekran açılış, ölçü ve yatırım bilgisi, kaydırmayla ilerleyen anlatım, galeri, başvuru |
| Başvuru | `/basvuru`: konsept → il/ilçe → bütçe → mülk → iletişim; ilerleme çizgisi, referans numaralı başarı ekranı |
| Yasal | KVKK Aydınlatma Metni, Gizlilik Politikası, Kullanım Şartları, Çerez Politikası |
| SEO | Sayfa başlıkları, açıklamalar, Open Graph görseli, `sitemap.xml`, `robots.txt`, kurum şeması |

**Yönetim paneli (`/admin`)**

- Genel bakış: dönem seçimi (7 / 30 / 90 gün, tüm zamanlar), başvuru sayıları, günlük başvuru grafiği, konsept, bütçe, durum, il ve mülk durumu kırılımları, son başvurular
- Başvurular: ad, telefon, e-posta ya da referansla arama; durum, konsept, bütçe, mülk, il, ilçe ve tarih filtreleri; sayfalama; CSV olarak indirme (Excel uyumlu)
- Yatırımcı detayı: tüm başvuru bilgileri, arama / WhatsApp / e-posta kısayolları, durum değiştirme, görüşme notları, durum geçmişi, KVKK talepleri için kalıcı silme
- Yeni başvuru bildirimi: Supabase Realtime ile anında; bağlantı koparsa 45 saniyede bir kontrol. Sekme başlığında sayaç
- İçerik ve fiyatlar: konsept adları, metrekareleri, yatırım tutarları, açıklamaları, ana görseli ve galerisi; yatırım süreci adımları; ana sayfa metinleri, iletişim bilgileri, logo ve yasal şirket bilgileri. Değişiklikler kaydedildiği anda sitede görünür

## Hızlı başlangıç

```bash
npm install
cp .env.example .env.local   # Supabase bilgilerini doldurun
npm run dev                   # http://localhost:3000
```

Supabase bilgileri girilmeden de site açılır: içerik `src/lib/defaults.ts` dosyasındaki varsayılanlardan gelir. Başvuru formu ve yönetim paneli için Supabase gerekir.

| Komut | İş |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Derlenmiş sürümü çalıştırır |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript kontrolü |

## Supabase kurulumu

1. **Proje oluşturun.** [supabase.com](https://supabase.com) → New project (bölge olarak Frankfurt, `eu-central-1` önerilir). Ücretsiz planda aynı anda en fazla 2 aktif proje olabilir; sınır doluysa mevcut bir projeyi duraklatın ya da planı yükseltin.
2. **Tabloları kurun.** SQL Editor’da `supabase/migrations` klasöründeki dosyaları sırayla çalıştırın:
   1. `20261024000000_init.sql`: tablolar, RLS kuralları, başvuru fonksiyonu, istatistikler, varsayılan içerik
   2. `20261024000100_storage.sql`: görseller için `site-media` depolama alanı

   Supabase CLI kullanıyorsanız: `supabase link --project-ref <proje-ref>` ve ardından `supabase db push`.
3. **Yönetici ekleyin.** Authentication → Users → Add user ile e-posta ve şifre belirleyin (“Auto confirm user” işaretli). Ardından SQL Editor’da:

   ```sql
   insert into public.admin_users (user_id, email)
   select id, email from auth.users where email = 'yonetici@coffeehousetr.com';
   ```

   Yöneticiler yalnızca bu yolla eklenir; panelden kimse kendine yetki veremez. Yetkiyi kaldırmak için satırı silin.
4. **Herkese açık kayıtları kapatın.** Authentication → Sign In / Providers → “Allow new users to sign up” seçeneğini kapatın. Panel girişi yalnızca sizin eklediğiniz hesaplarla yapılır.
5. **Anahtarları alın.** Project Settings → API Keys: proje adresi, publishable (anon) anahtar ve secret (service_role) anahtar.

## Vercel’e yayınlama

1. Vercel → Add New → Project → `formxweb/Coffee` deposunu seçin. Framework otomatik olarak Next.js algılanır.
2. Environment Variables bölümüne `.env.example` dosyasındaki değişkenleri girin:

   | Değişken | Zorunlu | Açıklama |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Evet | Supabase proje adresi |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Evet | Publishable / anon anahtar |
   | `SUPABASE_SECRET_KEY` | Evet | Secret / service_role anahtar. **Yalnızca sunucuda kullanılır** |
   | `NEXT_PUBLIC_SITE_URL` | Evet | Yayın adresi, ör. `https://www.coffeehousetr.com` |
   | `RATE_LIMIT_SALT` | Önerilir | IP özetleri için uzun rastgele metin |
   | `RESEND_API_KEY`, `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM` | İsteğe bağlı | Yeni başvuruda e-posta bildirimi ([Resend](https://resend.com)) |

3. Deploy edin, ardından Settings → Domains ile alan adını bağlayın.
4. Supabase → Authentication → URL Configuration → Site URL alanına yayın adresini yazın.

Ortam değişkenlerini değiştirdikten sonra yeniden deploy edin; `NEXT_PUBLIC_` değişkenleri derleme sırasında koda yerleşir.

## Yönetim paneli

`https://alanadiniz.com/admin` adresinden girilir. Giriş yapmamış kullanıcılar giriş sayfasına yönlendirilir; giriş yapmış ama yönetici olmayan hesaplar “yetki yok” sayfasını görür.

Başvuru durumları: Yeni · İletişime geçildi · Ön görüşme · Lokasyon değerlendirmesi · Fizibilite · Planlama ve sözleşme · Kurulum ve açılış · Beklemede · Olumsuz. Her durum değişikliği, değiştiren kişi ve zamanla birlikte başvurunun geçmişine yazılır.

## Güvenlik

- **Satır düzeyi güvenlik (RLS):** Tüm tablolarda açık. Başvuruları yalnızca `admin_users` tablosundaki kullanıcılar okur, günceller ve siler. Site içeriğini herkes okur, yalnızca yöneticiler yazar.
- **Sütun yetkileri:** Yöneticiler bir başvurunun yalnızca durumunu değiştirebilir; başvuru sahibinin verdiği bilgiler değiştirilemez. Notların yazarı veritabanında oturumdaki kullanıcıdan atanır.
- **Başvuru kaydı:** Tarayıcı veritabanına doğrudan yazamaz. Form, sunucudaki `/api/basvuru` adresine gider. Sunucu isteğin kaynağını kontrol eder, alanları doğrular (il/ilçe listesi dahil) ve kaydı yalnızca secret anahtarla çağrılabilen `submit_application` fonksiyonu üzerinden yapar.
- **İstek sınırı:** Aynı IP’den saatte en fazla 5 başvuru. IP adresi açık olarak saklanmaz, geri döndürülemez biçimde özetlenir. Aynı telefondan 10 dakika içindeki tekrar gönderim yeni kayıt açmaz, aynı referansı döndürür.
- **Spam koruması:** Görünmez tuzak alanı ve form doldurma süresi kontrolü. Şüpheli gönderimler kaydedilmez, ama bota başarılı görünen bir yanıt döner.
- **CSV:** Hücreler formül olarak çalıştırılamayacak şekilde dışa aktarılır.
- **Başlıklar:** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; panel sayfaları arama motorlarına kapalıdır.

## Görseller ve doğrulanacak içerik

**Gerçek marka görseli bulunmayan alanlar.** coffeehousetr.com ve Instagram hesabına geliştirme ortamından erişilemediği için hiçbir marka görseli kullanılmadı. Bu alanlarda, üzerinde “Temsili yerleşim” yazan mimari plan çizimleri gösterilir. Gerçek görseller **Yönetim paneli → İçerik ve fiyatlar** bölümünden yüklendiğinde çizimlerin yerini otomatik olarak alır.

| Alan | Nerede görünür | Önerilen görsel |
| --- | --- | --- |
| Logo | Üst menü, footer, panel | SVG ya da şeffaf PNG (yoksa yazı logosu kullanılır) |
| Corner CH ana görseli | Ana ekran, konsept galerisi, konsept sayfası | Yatay iç mekân fotoğrafı, en az 2400 px genişlik |
| Mahal CH ana görseli | Aynı | Aynı |
| Agora CH ana görseli | Aynı | Aynı |
| Konsept galerileri | Konsept sayfaları | Her konsept için 3 ila 6 fotoğraf; boşsa galeri bölümü gizlenir |

**Doğrulanması gereken metinler.** Aşağıdakiler marka verisi olmadan, uydurma rakam içermeyecek şekilde yazıldı. Panelden kontrol edip güncelleyin:

- Hakkımızda metni (“Coffee House bir kahve dükkânı markasıdır; bugün odağında markayı franchise modeliyle yeni lokasyonlara taşımak var…”)
- Konsept açıklamaları ve yatırım süreci adımlarının açıklamaları
- İletişim bilgileri (telefon, WhatsApp, e-posta, adres); boş bırakılanlar sitede gösterilmez
- Yasal sayfalardaki şirket unvanı, adres, MERSİS numarası, KVKK başvuru e-postası ve saklama süresi. Yasal metinleri yayından önce hukuk danışmanınıza onaylatın

Yatırım tutarlarının kapsamı sitede ayrıntılandırılmaz; ilgili yerlerde “kapsam ve koşullar ön görüşmede paylaşılır” denir. Hiçbir yerde kârlılık, ciro ya da geri dönüş süresi rakamı yoktur.

## Tasarım kuralları

Tasarım, “yapay zekâyla yapıldığı belli olan site” belirtilerinden kaçınacak şekilde kuruldu:

- **Renk:** Fildişi zeminler, espresso ve antrasit yüzeyler, bakır vurgular. Sert renk geçişleri, gökkuşağı, mor-siyah palet, neon ya da pastel tonlar kullanılmadı.
- **Yazı:** Bodoni Moda (başlıklar) ve Jost (metin). Inter, Geist ya da grotesk yazı tipi kullanılmadı.
- **Biçim:** Keskin köşeler ve ince çizgiler. Buzlu cam efekti, bulanık ışık lekesi, noktalı arka plan, her yere gölge ve bento kutu düzeni yok.
- **İçerik:** İkon seti, emoji, parıltı simgesi ve kıpırdayan oklar yok; yalnızca durağan ↗ işareti kullanıldı. Liste başında tik işareti, solda renkli şerit, üçlü fiyat tablosu, terminal ekranı, uydurma yorum ya da istatistik yok. Metinlerde uzun tire ve “X değil, Y” kalıbı kullanılmadı.
- **Etkileşim:** Hover efekti yalnızca tıklanabilir öğelerde.
- **Yasal sayfalar:** Kullanım şartları ve gizlilik metni mevcut.

## Proje yapısı

```
src/
  app/
    (site)/            Herkese açık sayfalar: ana sayfa, konseptler, başvuru, yasal metinler
    admin/             Giriş, panel (genel bakış, başvurular, içerik), CSV, sunucu işlemleri
    api/basvuru/       Başvuru kaydı (doğrulama, istek sınırı, bildirim)
  components/
    site/              Site bileşenleri (açılış, konsept galerisi, seçici, süreç, plan çizimleri…)
    apply/             Başvuru sihirbazı
    admin/             Panel bileşenleri (grafikler, formlar, canlı bildirim)
  lib/                 İçerik, doğrulama şemaları, seçenekler, biçimlendirme, Supabase istemcileri
  proxy.ts             Panel oturum kontrolü
supabase/migrations/   Veritabanı şeması, RLS, fonksiyonlar, depolama
```
