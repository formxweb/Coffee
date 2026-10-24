# Coffee House – Franchise / Yatırım Web Sitesi Promptu

Bu dosya, Coffee House (coffeehousetr.com · instagram.com/_coffeehouse.tr) için **başvuru formlu yatırım web sitesi** oluşturmak üzere yapay zekâ site oluşturucularına (Lovable, v0, Bolt, Claude, Framer AI, Wix vb.) yapıştırılacak promptu içerir.

- **Tam Prompt**: Tüm bölümler, form kuralları, veri kaydı ve teknik gereksinimler.
- **Kısa Prompt**: Karakter sınırı olan araçlar için özet sürüm.
- **Doldurulacaklar**: Promptu kullanmadan önce `[KÖŞELİ PARANTEZ]` içindeki yer tutucuları gerçek bilgilerle değiştirin.

---

## Tam Prompt

```text
ROL VE AMAÇ
Deneyimli bir web tasarımcısı ve dönüşüm (conversion) odaklı bir front-end geliştiricisisin. "Coffee House" (kısaltma: CH) kahve markası için Türkçe, mobil öncelikli, tek sayfalık (landing page) bir FRANCHISE / YATIRIM web sitesi oluştur.
Sitenin tek hedefi: ziyaretçiyi "Yatırım Başvuru Formu"nu doldurmaya ikna etmek.
Trafiğin büyük bölümü Instagram'dan (@_coffeehouse.tr) ve Instagram reklamlarından gelecek; bu yüzden mobil deneyim kusursuz, sayfa hızlı ve form 1 dakikada doldurulabilir olmalı.

MARKA BİLGİLERİ
- Marka: Coffee House (Coffee House TR)
- Web: https://www.coffeehousetr.com
- Instagram: https://www.instagram.com/_coffeehouse.tr
- Logo: [LOGO DOSYASI – SVG/PNG]
- Telefon / WhatsApp: [+90 5XX XXX XX XX]
- E-posta: [info@coffeehousetr.com]
- Başvuru bildirim e-postası: [basvuru@coffeehousetr.com]
- Merkez ofis adresi: [ADRES]
- Ana mesaj: "Anahtar teslim kurulum ve yüksek kârlılık."
- Hitap dili: "siz" (profesyonel ama sıcak). Örnek: "Bilgilerinizi bırakın, fizibilite raporuyla hemen arayalım."

TASARIM DİLİ
- Sıcak, premium, modern kahve dükkânı atmosferi. Sade, ferah, bol boşluklu düzen.
- Renk paleti (logodaki renklerle değiştirilebilir):
  - Espresso (koyu metin / koyu bölümler): #2B1D16
  - Krema (ana zemin): #F6F0E8
  - Karamel (vurgu, rozetler): #C68B4E
  - Yeşil (ana CTA butonları; Instagram paylaşımlarındaki 🟢 vurgusuyla uyumlu): #2E7D4F
- Tipografi: Başlıklarda "Fraunces" veya "Playfair Display", gövde metninde "Inter". Türkçe karakterleri (ç, ğ, ı, İ, ö, ş, ü) eksiksiz destekleyen fontlar kullan.
- Görseller: [ŞUBE FOTOĞRAFLARI]. Yoksa sıcak tonlu, doğal ışıklı kafe iç mekânı, barista ve kahve fincanı yer tutucu görselleri kullan.
- İkonlar: ince çizgili, tek renk (ör. Lucide). Glassmorphism, gökkuşağı gradient, karikatür illüstrasyon KULLANMA.
- Animasyon: sadece hafif scroll fade-up ve buton hover efektleri; "prefers-reduced-motion" açıksa animasyonları kapat.

SAYFA YAPISI (yukarıdan aşağıya)
1. Üst menü (sticky)
2. Hero
3. Güven şeridi
4. Yatırım Modelleri
5. Anahtar Teslim Kurulum: Neler Dahil?
6. Süreç (5 adım)
7. Neden Coffee House?
8. Galeri / Instagram
9. Yatırım Başvuru Formu  ← sitenin kalbi
10. Sıkça Sorulan Sorular
11. Footer
+ Sabit WhatsApp butonu ve mobilde sabit alt "Başvuru Yap" çubuğu

1) ÜST MENÜ
- Solda logo; ortada bağlantılar: Yatırım Modelleri · Neler Dahil · Süreç · SSS · İletişim (sayfa içi kaydırma).
- Sağda yeşil buton: "Başvuru Yap" → #basvuru.
- Mobilde hamburger menü; "Başvuru Yap" butonu menü kapalıyken de görünür kalsın.

2) HERO
- Üst etiket (küçük rozet): "🚀 Coffee House Yatırım Fırsatları"
- H1: "Kendi Coffee House'unuzu Açın"
- Alt başlık: "2 Milyon TL'den başlayan yatırım modelleri, anahtar teslim kurulum ve yüksek kârlılık potansiyeli. Bilgilerinizi bırakın, fizibilite raporuyla hemen arayalım."
- Birincil CTA (yeşil): "Fizibilite Raporu İste" → #basvuru
- İkincil CTA (çerçeveli): "Yatırım Modellerini İncele" → #modeller
- CTA'ların altında 3 mini rozet: "Anahtar teslim kurulum" · "Lokasyon desteği" · "Eğitim ve operasyon desteği"
- Arka plan / sağ kolon: şube iç mekân fotoğrafı veya sessiz, kısa döngü video. Mobilde metin üstte, görsel altta.

3) GÜVEN ŞERİDİ
- 4 sayaç: "[X]+ Şube" · "[X] Şehir" · "[X] Yıllık Deneyim" · "[X]+ Günlük Misafir".
- Gerçek rakam verilmediyse bu bölümü GİZLE; asla uydurma rakam yazma.

4) YATIRIM MODELLERİ (id="modeller")
- Başlık: "Size Uygun Yatırım Modelini Seçin"
- 3 kart: masaüstünde yan yana, mobilde alt alta.

  Corner CH
  - Alan: 30 m²
  - Yatırım: 2.000.000 ₺
  - İdeal lokasyon: AVM köşeleri, plaza / ofis lobileri, kampüsler, istasyonlar; al-götür ağırlıklı satış.

  Mahal CH
  - Alan: 100–150 m²
  - Yatırım: 3.000.000 – 4.000.000 ₺
  - İdeal lokasyon: mahalle ve cadde lokasyonları; oturma alanlı, sıcak mahalle kahvecisi konsepti.

  Agora CH
  - Alan: 200 m²
  - Yatırım: 6.000.000 ₺
  - İdeal lokasyon: ana caddeler, meydanlar; geniş oturma alanı, buluşma noktası konsepti.

- Her kartta: model adı, m² rozeti, büyük ve vurgulu yatırım tutarı, ideal lokasyon açıklaması, 3–4 maddelik "Neler dahil" listesi ([FİRMA TARAFINDAN DOĞRULANACAK]) ve "Bu Model İçin Başvur" butonu.
- "Bu Model İçin Başvur" butonu forma kaydırsın ve formdaki "Bütçe" alanında ilgili seçeneği OTOMATİK seçsin.
- Mahal CH kartı ortada ve hafif öne çıkarılmış olsun. "En Çok Tercih Edilen" rozeti yalnızca firma bunu doğrularsa eklensin.
- Kartların altında küçük not: "Fiyatlar [KDV DAHİL / HARİÇ] olup [AY 2026] itibarıyla geçerlidir. Kesin yatırım tutarı lokasyon ve fizibilite çalışmasına göre belirlenir."

5) ANAHTAR TESLİM KURULUM: NELER DAHİL?
- Başlık: "Anahtar Teslim Kurulum: Siz Sadece Kapıyı Açın"
- İkonlu grid (masaüstünde 4 sütun, mobilde 2 sütun):
  - Lokasyon analizi ve seçimi
  - Mimari proje ve iç mimari tasarım
  - Tadilat ve dekorasyon
  - Ekipman ve kahve makinesi kurulumu
  - Barista ve personel eğitimi
  - Menü, reçeteler ve tedarik zinciri
  - Açılış öncesi ve sonrası pazarlama
  - Sürekli operasyon desteği
- Not: Bu liste firmanın gerçek paketine göre düzenlenecek: [FİRMA TARAFINDAN DOĞRULANACAK].

6) SÜREÇ (5 ADIM)
- Yatay zaman çizelgesi (mobilde dikey):
  1. Başvuru: Formu doldurun (yaklaşık 1 dakika).
  2. Fizibilite görüşmesi: Ekibimiz sizi arar; bütçe ve lokasyonunuza özel fizibilite raporu sunar.
  3. Lokasyon ve sözleşme: Dükkânınız yoksa doğru lokasyonu birlikte buluruz.
  4. Anahtar teslim kurulum: Proje, dekorasyon ve ekipman kurulumu.
  5. Eğitim ve açılış: Ekibiniz eğitilir, Coffee House'unuz kapılarını açar.
- Toplam süre bilgisi: "Başvurudan açılışa ortalama [X] hafta" (bilinmiyorsa bu satırı gösterme).

7) NEDEN COFFEE HOUSE?
- 4 kart:
  - Kanıtlanmış iş modeli
  - Esnek yatırım seçenekleri (30 m²'den 200 m²'ye)
  - Lokasyon desteği (dükkânı olmayan yatırımcıya)
  - Yüksek kârlılık potansiyeli (lokasyona özel fizibilite raporuyla)
- Yatırımcı / şube sahibi yorumları bölümü SADECE gerçek yorumlar verilirse eklensin; sahte yorum yazma.

8) GALERİ / INSTAGRAM
- 6–8 görsellik kare grid (şube, ürün, ekip fotoğrafları).
- Buton: "Instagram'da Takip Edin @_coffeehouse.tr" → https://www.instagram.com/_coffeehouse.tr (yeni sekmede).

9) YATIRIM BAŞVURU FORMU (id="basvuru")
Başlık: "🟢 Yatırım Başvuru Formu"
Alt metin: "Anahtar teslim kurulum ve yüksek kârlılık için bilgilerinizi bırakın, fizibilite raporuyla hemen arayalım."

Düzen:
- Masaüstü: sol kolonda kısa özet (3 modelin m² ve fiyatı + "Başvurunuza en geç [1 iş günü] içinde dönüş yapıyoruz" + WhatsApp bağlantısı), sağ kolonda form kartı.
- Mobil: tek kolon, alanlar tam genişlik, dokunma alanları en az 44px.

Alanlar (sıra bu şekilde):
a) Ad Soyad – metin, ZORUNLU, en az 3 karakter, autocomplete="name".
   Hata: "Lütfen adınızı ve soyadınızı yazın."
b) İletişim – iki alan:
   - Telefon – ZORUNLU, type="tel", inputmode="numeric", maske "0 (5XX) XXX XX XX", Türkiye cep telefonu doğrulaması (5 ile başlayan 10 hane).
     Hata: "Telefon numarası 0 (5XX) XXX XX XX biçiminde olmalı."
   - E-posta – opsiyonel, geçerli e-posta biçimi kontrolü.
     Hata: "E-posta adresi ornek@alanadi.com biçiminde olmalı."
c) İl / İlçe – iki aranabilir açılır liste:
   - İl: Türkiye'nin 81 ili, ZORUNLU.
   - İlçe: seçilen ile ait ilçeler, ZORUNLU; il seçilmeden pasif ve "Önce il seçin" yazsın.
d) Bütçe – ZORUNLU, seçim kartları (radio) veya açılır liste:
   - 2 Milyon TL – Corner CH (30 m²)
   - 3–4 Milyon TL – Mahal CH (100–150 m²)
   - 6 Milyon TL – Agora CH (200 m²)
   - 6 Milyon TL üzeri / birden fazla şube
   - Henüz karar vermedim
e) Mülk Durumu – ZORUNLU, iki büyük seçim kartı (radio):
   - 🏪 Hazır dükkânım var
   - 📍 Dükkânım yok (Lokasyon desteği istiyorum)
   Koşullu alanlar: "Hazır dükkânım var" seçilirse iki opsiyonel alan açılsın: "Dükkân büyüklüğü (m²)" ve "Dükkânın semti / adresi". Diğer seçenekte bu alanlar gizlensin.
f) KVKK onayı – checkbox, ZORUNLU, varsayılan işaretsiz:
   "[KVKK Aydınlatma Metni]'ni okudum; kişisel verilerimin başvurumun değerlendirilmesi amacıyla işlenmesini kabul ediyorum." (Aydınlatma metni modal veya ayrı sayfada açılsın.)
g) Ticari ileti onayı – checkbox, OPSİYONEL, varsayılan işaretsiz:
   "Yeni yatırım fırsatları ve kampanyalar hakkında SMS / e-posta almak istiyorum."
h) Gizli alanlar (otomatik doldurulur): utm_source, utm_medium, utm_campaign, utm_content, fbclid, referrer, sayfa URL'si, gönderim zamanı, karttan seçildiyse model adı.
i) Spam koruması: görünmez honeypot alanı.

Gönder butonu:
- Metin: "Fizibilite Raporumu İste" (yeşil, mobilde tam genişlik).
- Buton her zaman tıklanabilir; tıklanınca eksik alanlar gösterilsin, sayfa ilk hatalı alana kaysın ve o alana odaklansın.
- Gönderim sırasında: buton pasif + "Gönderiliyor…" + küçük spinner.
- Butonun altında: "🔒 Bilgileriniz yalnızca başvurunuzu değerlendirmek için kullanılır."

Doğrulama davranışı:
- Alan terk edildiğinde (blur) doğrula; kullanıcı yazmaya başlayınca hata mesajı hemen kaybolsun.
- Etiketler her zaman görünür olsun; placeholder yalnızca biçim örneği için kullanılsın.
- Hata mesajları alanın hemen altında, kırmızı ama suçlayıcı olmayan dille; aria-live ile ekran okuyuculara duyurulsun.
- Tüm doğrulamalar sunucu tarafında da tekrarlansın.

Başarılı gönderim:
- Form yerine teşekkür kartı gösterilsin:
  "Teşekkürler [Ad]! Başvurunuz bize ulaştı. Fizibilite raporunuzla birlikte en kısa sürede sizi arayacağız."
- Altında iki buton: "WhatsApp'tan Yazın" (https://wa.me/[90XXXXXXXXXX]?text=Merhaba%2C%20Coffee%20House%20yat%C4%B1r%C4%B1m%20ba%C5%9Fvurusu%20yapt%C4%B1m.) ve "Instagram'da Takip Edin".

Başarısız gönderim:
- "Başvurunuz şu an gönderilemedi. Lütfen tekrar deneyin ya da WhatsApp'tan bize yazın: [TELEFON]"
- Girilen bilgiler silinmesin.

Veri kaydı ve bildirim:
- Her başvuru bir veritabanı tablosuna kaydedilsin (platformun desteklediği: Supabase / Firebase / Google Sheets).
- Aynı anda [basvuru@coffeehousetr.com] adresine tüm alanları içeren bildirim e-postası gönderilsin. Konu: "Yeni Yatırım Başvurusu – [Ad Soyad] – [İl/İlçe] – [Bütçe]".
- Tablo adı: franchise_basvurulari
  Sütunlar: id, created_at, ad_soyad, telefon, email, il, ilce, butce, secilen_model, mulk_durumu, dukkan_m2, dukkan_adresi, kvkk_onay, ticari_ileti_onay, utm_source, utm_medium, utm_campaign, utm_content, fbclid, referrer, sayfa_url, durum (varsayılan: "Yeni").
- Aynı telefon numarasından 10 dakika içinde tekrar gönderim engellensin.

Ölçümleme:
- Başarılı gönderimde Meta Pixel "Lead" ve GA4 "generate_lead" olayları tetiklensin (parametreler: butce, secilen_model, il). Kimlikler: [META_PIXEL_ID], [GA4_ID].
- KVKK uyumlu çerez onay bandı ekle; pazarlama/analitik etiketleri yalnızca onaydan sonra yüklensin.

Yönetim paneli (opsiyonel ama önerilir):
- /admin adresinde şifre korumalı basit panel: başvuru listesi, il / bütçe / mülk durumu filtreleri, durum güncelleme (Yeni · Arandı · Fizibilite Gönderildi · Görüşme · Sözleşme · Olumsuz), not alanı ve CSV dışa aktarma.

10) SIKÇA SORULAN SORULAR
- Akordeon yapısında; cevapları firma dolduracak, cevap uydurma:
  - Yatırım tutarına neler dahil? [CEVAP]
  - Franchise giriş bedeli veya royalty var mı? [CEVAP]
  - Kurulum ne kadar sürer? [CEVAP]
  - Dükkânım yoksa lokasyonu nasıl buluyoruz? [CEVAP]
  - Yatırımın geri dönüş süresi nedir? [CEVAP]
  - Daha önce kafe işletmediysem başvurabilir miyim? [CEVAP]
  - Eğitim ve açılış sonrası destek veriliyor mu? [CEVAP]
  - Fizibilite raporu ücretli mi? [CEVAP]
- SSS'nin altında tekrar CTA: "Sorunuzun cevabını bulamadınız mı? Formu doldurun, sizi arayalım." → #basvuru

11) FOOTER
- Logo, tek cümlelik marka açıklaması, telefon, e-posta, adres, Instagram ikonu.
- Bağlantılar: KVKK Aydınlatma Metni · Çerez Politikası · Gizlilik Politikası.
- "© 2026 Coffee House. Tüm hakları saklıdır."

SABİT ÖĞELER
- Masaüstünde sağ altta yuvarlak WhatsApp butonu (ön dolu mesaj: "Merhaba, Coffee House yatırım fırsatları hakkında bilgi almak istiyorum.").
- Mobilde ekranın altında sabit çubuk: "Başvuru Yap" (yeşil) + WhatsApp ikonu. Form ekrandayken bu çubuk gizlensin.

İÇERİK KURALLARI
- Şube sayısı, kâr oranı, geri dönüş süresi, ciro ve yatırımcı yorumu UYDURMA. Bilinmeyen her bilgiyi [KÖŞELİ PARANTEZ] yer tutucu olarak bırak.
- "Yüksek kârlılık" ifadesinin kullanıldığı yerlerde küçük not ekle: "Kârlılık lokasyon, işletme ve pazar koşullarına göre değişir. Fizibilite raporu bilgilendirme amaçlıdır, kazanç garantisi değildir."
- Para biçimi: "2.000.000 ₺" veya "2 Milyon TL"; aralıklar "3–4 Milyon TL".
- Buton metinleri fiille başlasın ("Başvur", "İste", "İncele", "Yazın"); "Gönder", "Tamam" gibi genel ifadeler kullanma.

TEKNİK GEREKSİNİMLER
- Teknoloji: React + Tailwind CSS (veya kullandığın platformun varsayılanı).
- Tamamen responsive: 360px'ten 1440px'e kadar; yatay kaydırma olmasın.
- <html lang="tr">, tüm metinler Türkçe ve Türkçe karakterler doğru.
- SEO:
  - Title: "Coffee House Franchise | Anahtar Teslim Kahve Dükkânı Yatırımı"
  - Meta description: "Coffee House yatırım fırsatları: Corner CH (30 m²) 2 Milyon TL, Mahal CH (100–150 m²) 3–4 Milyon TL, Agora CH (200 m²) 6 Milyon TL. Anahtar teslim kurulum için hemen başvurun."
  - Anahtar kelimeler: kahve franchise, kahve dükkânı bayilik, anahtar teslim kafe, kafe yatırımı, Coffee House bayilik.
  - Open Graph görseli (1200×630), favicon, schema.org Organization ve FAQPage işaretlemesi.
- Performans: Lighthouse mobil skoru 90+; görseller WebP ve lazy-load; fontlarda font-display: swap.
- Erişilebilirlik: WCAG 2.1 AA kontrast, görünür odak halkası, tüm form alanları klavyeyle kullanılabilir, görsellerde alt metin.
```

---

## Kısa Prompt

```text
Coffee House (coffeehousetr.com, Instagram: @_coffeehouse.tr) kahve markası için Türkçe, mobil öncelikli, tek sayfalık franchise/yatırım landing page'i oluştur. Hedef: ziyaretçinin başvuru formunu doldurması. Tasarım: sıcak, premium kahve dükkânı atmosferi; espresso (#2B1D16), krema (#F6F0E8), karamel (#C68B4E), yeşil CTA (#2E7D4F); başlıklarda Fraunces, gövdede Inter.

Bölümler: sticky menü + "Başvuru Yap" butonu; Hero ("🚀 Coffee House Yatırım Fırsatları", H1 "Kendi Coffee House'unuzu Açın", CTA "Fizibilite Raporu İste"); 3 yatırım kartı: Corner CH (30 m²) 2.000.000 ₺, Mahal CH (100–150 m²) 3–4 Milyon ₺, Agora CH (200 m²) 6.000.000 ₺; her kartta "Bu Model İçin Başvur" butonu forma kaydırıp bütçeyi otomatik seçsin; Anahtar teslim kurulumda neler dahil (lokasyon analizi, mimari proje, dekorasyon, ekipman, eğitim, menü ve tedarik, pazarlama, operasyon desteği); 5 adımlı süreç; Neden Coffee House; Instagram galerisi; başvuru formu; SSS; footer; sabit WhatsApp butonu.

Başvuru formu ("Anahtar teslim kurulum ve yüksek kârlılık için bilgilerinizi bırakın, fizibilite raporuyla hemen arayalım"):
- Ad Soyad (zorunlu)
- İletişim: Telefon (zorunlu, 0 (5XX) XXX XX XX maskesi) + E-posta (opsiyonel)
- İl / İlçe (bağlı açılır listeler, 81 il, zorunlu)
- Bütçe (zorunlu): 2 Milyon TL – Corner CH / 3–4 Milyon TL – Mahal CH / 6 Milyon TL – Agora CH / 6 Milyon TL üzeri / Henüz karar vermedim
- Mülk Durumu (zorunlu): "Hazır dükkânım var" / "Dükkânım yok (Lokasyon desteği istiyorum)"; hazır dükkân seçilirse opsiyonel m² ve semt alanı açılsın
- Zorunlu KVKK onayı, opsiyonel ticari ileti onayı, gizli UTM alanları, honeypot
Buton: "Fizibilite Raporumu İste". Blur'da doğrulama, Türkçe hata mesajları. Başarılı gönderimde "Teşekkürler [Ad]! Fizibilite raporunuzla en kısa sürede sizi arayacağız." + WhatsApp butonu. Başvurular veritabanına (franchise_basvurulari) kaydedilsin ve [basvuru@coffeehousetr.com] adresine e-posta bildirimi gitsin; Meta Pixel "Lead" ve GA4 "generate_lead" olayları tetiklensin.

Kurallar: rakam, yorum, kâr oranı uydurma; bilinmeyenleri [yer tutucu] bırak. "Yüksek kârlılık" yanında "kazanç garantisi değildir" notu olsun. Responsive (360–1440px), SEO meta etiketleri, Lighthouse 90+, WCAG AA.
```

---

## Doldurulacaklar

Promptu kullanmadan önce şu bilgileri hazırlayın ve yer tutucuların yerine yazın:

- [ ] Logo dosyası (SVG veya yüksek çözünürlüklü PNG) ve marka renkleri
- [ ] Telefon / WhatsApp numarası, e-posta, merkez ofis adresi
- [ ] Başvuruların düşeceği e-posta adresi
- [ ] Şube, ürün ve ekip fotoğrafları (Instagram'dan seçilebilir)
- [ ] Güven şeridi rakamları (şube, şehir, yıl, misafir sayısı)
- [ ] Her modelde fiyata dahil olanların listesi
- [ ] Fiyatların KDV durumu ve geçerlilik tarihi
- [ ] Başvurudan açılışa ortalama süre
- [ ] SSS cevapları (giriş bedeli, royalty, geri dönüş süresi vb.)
- [ ] KVKK Aydınlatma Metni, Çerez Politikası ve Gizlilik Politikası metinleri
- [ ] Meta Pixel ve GA4 kimlikleri
