import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, controller } from "@/components/legal/LegalPage";
import { getSiteData } from "@/lib/content";

export const metadata: Metadata = {
  title: "Gizlilik Politikası",
  description: "Coffee House franchise sitesinde kişisel verilerin nasıl toplandığı, korunduğu ve saklandığı.",
};

export default async function PrivacyPage() {
  const { text } = await getSiteData();
  const c = controller(text);
  return (
    <LegalPage title="Gizlilik Politikası" current="/gizlilik">
      <section>
        <p>
          Bu politika, {c.name} tarafından işletilen Coffee House franchise sitesini ziyaret ettiğinizde ve bayilik başvurusu yaptığınızda
          bilgilerinizin nasıl ele alındığını açıklar. Kişisel verilerin işlenmesine ilişkin ayrıntılar <Link href="/kvkk">KVKK Aydınlatma Metni</Link>’nde
          yer alır.
        </p>
      </section>
      <section>
        <h2>Topladığımız bilgiler</h2>
        <ul>
          <li>Başvuru formunda kendi isteğinizle verdiğiniz bilgiler: ad soyad, telefon, e-posta, il ve ilçe, konsept, bütçe aralığı, mülk durumu ve ek açıklama.</li>
          <li>Başvurunun hangi kampanya bağlantısından geldiğini gösteren bilgiler (ör. utm parametreleri).</li>
          <li>Güvenlik için tarayıcı bilgisi ve geri döndürülemez biçimde özetlenmiş IP adresi.</li>
        </ul>
        <p className="mt-4">Sitede reklam veya ziyaretçi takibi amaçlı çerez kullanılmaz; ayrıntılar için <Link href="/cerez-politikasi">Çerez Politikası</Link>’na bakın.</p>
      </section>
      <section>
        <h2>Bilgilerinizi nasıl kullanırız</h2>
        <p>
          Bilgileriniz yalnızca bayilik başvurunuzu değerlendirmek, sizinle iletişime geçmek ve onay verdiyseniz yeni yatırım fırsatları hakkında bilgi
          göndermek için kullanılır. Bilgileriniz satılmaz ve reklam amacıyla üçüncü kişilerle paylaşılmaz.
        </p>
      </section>
      <section>
        <h2>Güvenlik</h2>
        <ul>
          <li>Site ile tarayıcınız arasındaki tüm trafik şifrelenir (HTTPS).</li>
          <li>Başvuru kayıtlarına yalnızca yetkilendirilmiş Coffee House yöneticileri erişebilir; erişim veritabanı düzeyinde satır bazlı güvenlik kurallarıyla sınırlandırılır.</li>
          <li>Form, otomatik gönderimlere karşı istek sınırlaması ve sunucu tarafı doğrulamayla korunur.</li>
        </ul>
      </section>
      <section>
        <h2>Saklama ve silme</h2>
        <p>
          Başvuru kayıtları, başvurunun sonuçlanmasından itibaren {c.retention} süreyle saklanır. Kaydınızın silinmesini istediğinizde talebiniz
          değerlendirilerek kaydınız yönetim panelinden kalıcı olarak silinir.
        </p>
      </section>
      <section>
        <h2>İletişim</h2>
        <p>
          Gizlilikle ilgili sorularınız için{" "}
          {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : "sitedeki iletişim kanallarından"} bize ulaşabilirsiniz. Bu politika
          güncellendiğinde sayfanın başındaki tarih değişir.
        </p>
      </section>
    </LegalPage>
  );
}
