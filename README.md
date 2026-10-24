# Coffee House – Yatırım Web Sitesi

Coffee House franchise / yatırım fırsatları için tek sayfalık, mobil öncelikli tanıtım sitesi ve **yatırım başvuru formu**.

- **Yatırım modelleri:** Corner CH (30 m²) 2 Milyon TL · Mahal CH (100–150 m²) 3–4 Milyon TL · Agora CH (200 m²) 6 Milyon TL
- **Başvuru formu:** Ad Soyad, İletişim (telefon + isteğe bağlı e-posta), İl / İlçe, Bütçe, Mülk Durumu, KVKK onayı
- **Başvuruların gideceği yer:** Google E-Tablo (+ e-posta bildirimi). Sunucu kurulmadıysa başvuru WhatsApp mesajı olarak gönderilir.

Derleme adımı yoktur: düz HTML, CSS ve JavaScript. Herhangi bir hostinge dosyaları yüklemeniz yeterlidir.

## Dosyalar

| Dosya | Açıklama |
| --- | --- |
| `index.html` | Ana sayfa: hero, yatırım modelleri, neler dahil, süreç, başvuru formu, SSS, Instagram |
| `kvkk.html` | KVKK Aydınlatma Metni ve Çerez Politikası (şablon) |
| `assets/js/config.js` | **Doldurmanız gereken ayarlar** (telefon, WhatsApp, form adresi…) |
| `assets/js/main.js` | Form doğrulama, il/ilçe, gönderim, mobil menü, çerez onayı |
| `assets/js/il-ilce.js` | 81 il ve 973 ilçe listesi |
| `assets/css/style.css` | Tüm stiller (renkler en üstteki `:root` bölümünde) |
| `assets/img/` | Favicon, paylaşım görseli (`og-image.png`) |
| `google-apps-script/Code.gs` | Başvuruları Google E-Tablo'ya kaydeden arka uç |
| `WEB_SITESI_PROMPTU.md` | Siteyi yapay zekâ araçlarıyla üretmek için hazırlanan prompt |

## 1. Ayarları doldurun

`assets/js/config.js` dosyasını açın:

| Ayar | Örnek | Ne işe yarar |
| --- | --- | --- |
| `formEndpoint` | `https://script.google.com/macros/s/.../exec` | Başvuruların kaydedileceği adres (bkz. 2. adım) |
| `whatsapp` | `905321234567` | WhatsApp butonları ve yedek başvuru kanalı |
| `phone` | `+90 532 123 45 67` | Sitede görünen telefon |
| `email` | `info@coffeehousetr.com` | Sitede görünen e-posta |
| `address` | `… Kadıköy / İstanbul` | Footer'daki adres |
| `responseTime` | `1 iş günü` | Teşekkür mesajında "… içinde sizi arayacağız" |
| `metaPixelId`, `ga4Id` | `1234567890`, `G-XXXX` | Reklam ölçümü (isteğe bağlı) |

Boş bırakılan iletişim bilgileri sitede otomatik olarak gizlenir.

## 2. Başvuruları Google E-Tablo'ya kaydetme

Ücretsizdir ve sunucu gerektirmez. Her başvuru tabloya bir satır olarak eklenir, aynı anda size e-posta gelir.

1. [Google E-Tablolar](https://sheets.google.com)'da yeni bir tablo açın (ör. "Coffee House Başvurular").
2. Menüden **Uzantılar → Apps Script**'e tıklayın.
3. Açılan editördeki kodu silin, `google-apps-script/Code.gs` dosyasının içeriğini yapıştırın.
4. Dosyanın başındaki `BILDIRIM_EPOSTA` değerini başvuruların gideceği e-posta adresiyle değiştirin ve kaydedin.
5. Üstteki fonksiyon listesinden **kurulum**'u seçip **Çalıştır**'a basın. Google izin isteyecek; hesabınızı seçip izin verin. ("Google bu uygulamayı doğrulamadı" uyarısında **Gelişmiş → … sayfasına git** deyin.)
6. **Dağıt → Yeni dağıtım** → tür olarak **Web uygulaması** seçin:
   - *Şu kullanıcı olarak çalıştır:* **Ben**
   - *Erişimi olanlar:* **Herkes**
7. **Dağıt**'a basın ve verilen **Web uygulaması URL'sini** (`…/exec` ile biter) kopyalayın.
8. Bu adresi `assets/js/config.js` içindeki `formEndpoint` alanına yapıştırın.

Tablodaki **Durum** sütunu açılır listedir (Yeni · Arandı · Fizibilite Gönderildi · Görüşme · Sözleşme · Olumsuz); başvuruları buradan takip edebilirsiniz. **Not** sütunu size aittir.

> `Code.gs`'de değişiklik yaparsanız **Dağıt → Dağıtımları yönet → Düzenle → Sürüm: Yeni sürüm** ile yeniden dağıtın; adres değişmez.

Arka uç; zorunlu alanları sunucuda tekrar doğrular, aynı telefondan 10 dakika içinde gelen ikinci başvuruyu kaydetmez, bot tuzağını (gizli alan) dolduran istekleri yok sayar ve tabloya formül olarak çalışabilecek değerleri metne çevirir.

### Sunucu kurmadan

`formEndpoint` boş, `whatsapp` dolu ise form, başvuru bilgilerini hazır bir WhatsApp mesajı olarak açar; ziyaretçi mesajı gönderdiğinde başvuru size ulaşır. İkisi de boşsa form gönderilemez, bu yüzden yayına almadan önce en az birini doldurun.

## 3. Yayına alma

Klasördeki dosyaları olduğu gibi yükleyin (`google-apps-script/` ve `.md` dosyaları gerekmez):

- **cPanel / FTP hosting:** Dosyaları `public_html` klasörüne yükleyin.
- **Netlify / Vercel / Cloudflare Pages:** Depoyu bağlayın; derleme komutu yok, yayın klasörü kök dizin.
- **GitHub Pages:** Depo ayarlarında *Pages → Deploy from a branch* seçin.

Site farklı bir alan adında yayınlanacaksa `index.html` içindeki `og:image` ve şema (`application/ld+json`) adreslerini o alan adına göre güncelleyin.

### Yerelde önizleme

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Yerelde (`localhost`) ve `formEndpoint` boşken form **demo modunda** çalışır: gönderim yapılmaz, teşekkür ekranı gösterilir ve veriler tarayıcı konsoluna yazılır.

## 4. Yayından önce kontrol listesi

- [ ] `assets/js/config.js`: telefon, WhatsApp, e-posta, adres, `formEndpoint`
- [ ] Google E-Tablo kurulumu yapıldı ve test başvurusu tabloya + e-postaya düştü
- [ ] `kvkk.html`: şirket unvanı, adres, MERSİS no, KVKK e-postası, saklama süresi, güncelleme tarihi (hukuk danışmanınızla gözden geçirin)
- [ ] **İçerik doğrulama:** "Neler Dahil" listesi, modellerin konsept / ideal lokasyon açıklamaları ve SSS cevapları firmanın gerçek paketini yansıtıyor (bkz. aşağıdaki not)
- [ ] Logo: şu an "CH" monogramı kullanılıyor; gerçek logoyu `.brand-mark` yerine koyun ve `assets/img/favicon.svg` dosyasını değiştirin
- [ ] İsteğe bağlı: gerçek rakamlarınız varsa `index.html` içindeki "GÜVEN ŞERİDİ" bölümünü doldurup `hidden` özelliğini kaldırın
- [ ] Reklam ölçümü kullanılacaksa `metaPixelId` / `ga4Id`

**İçerik notu:** Yatırım tutarları, model adları ve m² bilgileri size ait. "Neler Dahil" maddeleri (lokasyon analizi, mimari proje, tadilat, ekipman, eğitim, menü ve tedarik, pazarlama, operasyon desteği), model konsept açıklamaları ve SSS cevapları anahtar teslim franchise modeline göre yazıldı. Firmanın paketinde olmayan bir madde varsa çıkarın. Sitede uydurma rakam, kâr oranı veya müşteri yorumu yoktur; "yüksek kârlılık" ifadesinin yanında footer'da "kazanç garantisi değildir" notu bulunur.

## Özelleştirme

- **Renkler ve yazı tipleri:** `assets/css/style.css` başındaki `:root` değişkenleri (`--espresso`, `--caramel`, `--green`…).
- **Fotoğraf eklemek:** Hero'daki çizim (`.hero-art` içindeki SVG) yerine `<img src="assets/img/sube.jpg" alt="…">` koyabilirsiniz; görselleri WebP/JPG olarak, 1200 px genişliği geçmeyecek şekilde ekleyin.
- **SSS:** Bir soruyu değiştirirseniz `<head>` içindeki `FAQPage` verisini de güncelleyin (Google arama sonuçları için).

## Lisanslar

İkonlar [Lucide](https://lucide.dev) (ISC) ve [Simple Icons](https://simpleicons.org) (CC0); il/ilçe verisi [turkey-neighbourhoods](https://www.npmjs.com/package/turkey-neighbourhoods) (MIT).
