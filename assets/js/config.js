/*
 * Coffee House – site ayarları
 * Boş bırakılan iletişim bilgileri sitede gizlenir; doldurduğunuzda ilgili butonlar ve bağlantılar görünür.
 * Ayrıntılar için README.md dosyasına bakın.
 */
window.CH_CONFIG = {
  // Başvuruların gönderileceği Google Apps Script web uygulaması adresi.
  // Kurulum: README.md → "Başvuruları Google E-Tablo'ya kaydetme".
  // Örnek: "https://script.google.com/macros/s/AKfy.../exec"
  formEndpoint: "",

  // WhatsApp numarası; ülke koduyla, boşluksuz. Örnek: "905321234567"
  whatsapp: "",

  // Sitede görünecek telefon. Örnek: "+90 532 123 45 67"
  phone: "",

  // Sitede görünecek e-posta. Örnek: "info@coffeehousetr.com"
  email: "",

  // Merkez ofis adresi (footer'da görünür).
  address: "",

  // Başarılı başvuru mesajındaki dönüş süresi. Örnek: "1 iş günü". Boşsa "en kısa sürede" yazar.
  responseTime: "",

  // Ölçümleme (isteğe bağlı). Doldurulursa çerez onay bandı gösterilir; etiketler yalnızca onaydan sonra yüklenir.
  metaPixelId: "",
  ga4Id: ""
};
