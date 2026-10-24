import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Çerez Politikası",
  description: "Coffee House franchise sitesinde kullanılan çerezler ve tarayıcı kayıtları.",
};

export default function CookiePage() {
  return (
    <LegalPage title="Çerez Politikası" current="/cerez-politikasi">
      <section>
        <p>
          Bu sitede reklam, ziyaretçi takibi veya analiz amaçlı çerez kullanılmaz. Yalnızca sitenin çalışması için gerekli olan aşağıdaki kayıtlar
          tutulur; bu nedenle çerez onayı istenmez.
        </p>
      </section>
      <section>
        <h2>Zorunlu çerezler</h2>
        <ul>
          <li>
            <strong>Yönetim paneli oturumu:</strong> Yalnızca yönetim paneline giriş yapan Coffee House yöneticilerinin tarayıcısında, oturumu açık
            tutmak için kullanılır. Ziyaretçiler ve başvuru sahipleri için oluşturulmaz.
          </li>
        </ul>
      </section>
      <section>
        <h2>Oturum süresince tutulan tarayıcı kayıtları</h2>
        <p>Aşağıdaki bilgiler tarayıcınızın oturum depolamasında (sessionStorage) tutulur ve sekmeyi kapattığınızda silinir; sunucuya kendiliğinden gönderilmez:</p>
        <ul>
          <li>Açılış animasyonunun bu oturumda gösterildiği bilgisi,</li>
          <li>Başvuru formunu tamamlamadan sayfayı yenilerseniz yanıtlarınızın kaybolmaması için form taslağı,</li>
          <li>Siteye geldiğiniz kampanya bağlantısının bilgisi (yalnızca başvuru gönderirseniz başvurunuzla birlikte kaydedilir).</li>
        </ul>
      </section>
      <section>
        <h2>Tercihleriniz</h2>
        <p>
          Tarayıcı ayarlarınızdan çerezleri ve site verilerini dilediğiniz zaman silebilirsiniz. Zorunlu çerezleri engellemeniz yalnızca yönetim
          panelinin çalışmasını etkiler.
        </p>
      </section>
    </LegalPage>
  );
}
