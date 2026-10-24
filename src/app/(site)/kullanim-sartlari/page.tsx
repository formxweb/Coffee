import type { Metadata } from "next";
import { LegalPage, controller } from "@/components/legal/LegalPage";
import { getSiteData } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kullanım Şartları",
  description: "Coffee House franchise sitesinin kullanım şartları.",
};

export default async function TermsPage() {
  const { text } = await getSiteData();
  const c = controller(text);
  return (
    <LegalPage title="Kullanım Şartları" current="/kullanim-sartlari">
      <section>
        <p>
          Bu site {c.name} tarafından Coffee House franchise modellerini tanıtmak ve bayilik başvurularını almak amacıyla yayınlanır. Siteyi kullanarak
          aşağıdaki şartları kabul etmiş sayılırsınız.
        </p>
      </section>
      <section>
        <h2>Bilgilerin niteliği</h2>
        <ul>
          <li>Sitedeki konsept, metrekare ve yatırım tutarı bilgileri genel bilgilendirme amaçlıdır ve bir satış teklifi ya da sözleşme niteliği taşımaz.</li>
          <li>Kesin yatırım tutarı, kapsamı ve koşulları ön görüşme, lokasyon değerlendirmesi ve fizibilite çalışmasıyla belirlenir ve yazılı sözleşmede yer alır.</li>
          <li>Yatırım seçicideki sonuçlar yalnızca bütçe aralığına dayalı bir ön eşleştirmedir. Hiçbir bilgi kârlılık, kazanç veya geri dönüş süresi garantisi olarak yorumlanamaz.</li>
          <li>Planlar ve çizimler temsilidir; gerçek projeler lokasyona göre hazırlanır.</li>
        </ul>
      </section>
      <section>
        <h2>Başvurular</h2>
        <p>
          Başvuru formunda verdiğiniz bilgilerin doğru ve size ait olması gerekir. Başvuru, taraflar arasında herhangi bir ödeme veya bağlayıcı taahhüt
          doğurmaz. Coffee House, başvuruları değerlendirme ve kabul etmeme hakkını saklı tutar.
        </p>
      </section>
      <section>
        <h2>Kullanım kuralları</h2>
        <ul>
          <li>Siteyi otomatik araçlarla toplu başvuru, spam veya sistemlere zarar verecek şekilde kullanamazsınız.</li>
          <li>Başkası adına izinsiz başvuru yapamazsınız.</li>
          <li>Yönetim paneline yetkisiz erişim girişiminde bulunamazsınız.</li>
        </ul>
      </section>
      <section>
        <h2>Fikri mülkiyet</h2>
        <p>
          Coffee House adı, logosu, konsept adları (Corner CH, Mahal CH, Agora CH), metinler, çizimler ve görseller {c.name}’a aittir veya lisansla
          kullanılır; izinsiz kopyalanamaz ve ticari amaçla kullanılamaz.
        </p>
      </section>
      <section>
        <h2>Sorumluluk</h2>
        <p>
          Sitedeki bilgilerin güncel ve doğru olması için özen gösterilir; ancak bilgilerin eksiksizliği garanti edilmez. Sitedeki bilgilere dayanılarak
          ön görüşme ve sözleşme süreci tamamlanmadan alınan kararlardan doğabilecek zararlardan sorumluluk kabul edilmez. Siteden bağlantı verilen
          üçüncü taraf sitelerin içeriğinden ilgili siteler sorumludur.
        </p>
      </section>
      <section>
        <h2>Değişiklikler ve uygulanacak hukuk</h2>
        <p>
          Bu şartlar güncellenebilir; güncel metin her zaman bu sayfada yayımlanır. Bu şartlara Türkiye Cumhuriyeti hukuku uygulanır.
        </p>
      </section>
    </LegalPage>
  );
}
