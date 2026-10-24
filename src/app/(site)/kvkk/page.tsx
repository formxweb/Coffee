import type { Metadata } from "next";
import { LegalPage, controller } from "@/components/legal/LegalPage";
import { getSiteData } from "@/lib/content";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni",
  description: "Coffee House bayilik başvuru formu kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni.",
};

export default async function KvkkPage() {
  const { text } = await getSiteData();
  const c = controller(text);
  return (
    <LegalPage title="KVKK Aydınlatma Metni" current="/kvkk">
      <section>
        <h2>Veri sorumlusu</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) uyarınca kişisel verileriniz, veri sorumlusu sıfatıyla <strong>{c.name}</strong>{" "}
          tarafından aşağıda açıklanan kapsamda işlenir.
        </p>
        {(c.address || c.mersis || c.email) && (
          <ul>
            {c.address && <li>Adres: {c.address}</li>}
            {c.mersis && <li>MERSİS numarası: {c.mersis}</li>}
            {c.email && <li>Başvuru adresi: <a href={`mailto:${c.email}`}>{c.email}</a></li>}
          </ul>
        )}
      </section>
      <section>
        <h2>İşlenen kişisel veriler</h2>
        <ul>
          <li><strong>Kimlik:</strong> ad, soyad.</li>
          <li><strong>İletişim:</strong> telefon numarası, e-posta adresi.</li>
          <li><strong>Başvuru bilgileri:</strong> ilgilenilen konsept, yatırım düşünülen il ve ilçe, bütçe aralığı, mülk durumu ve ek açıklama.</li>
          <li><strong>Pazarlama:</strong> ticari elektronik ileti onayı; başvurunun hangi reklam veya bağlantı üzerinden geldiğine ilişkin kampanya bilgileri.</li>
          <li><strong>İşlem güvenliği:</strong> başvuru tarihi, tarayıcı bilgisi ve kötüye kullanımı önlemek için geri döndürülemez biçimde özetlenmiş (hash) IP adresi.</li>
        </ul>
      </section>
      <section>
        <h2>İşleme amaçları</h2>
        <ul>
          <li>Bayilik başvurunuzun alınması, kayda geçirilmesi ve değerlendirilmesi,</li>
          <li>Sizinle telefon, e-posta veya WhatsApp üzerinden iletişime geçilmesi ve ön görüşmenin yapılması,</li>
          <li>Lokasyon değerlendirmesi ve fizibilite çalışmasının yürütülmesi,</li>
          <li>Franchise sözleşmesi öncesi süreçlerin yönetilmesi,</li>
          <li>Onay vermeniz halinde yeni yatırım fırsatları hakkında ticari elektronik ileti gönderilmesi,</li>
          <li>Başvuru formunun kötüye kullanılmasının ve istenmeyen gönderimlerin önlenmesi.</li>
        </ul>
      </section>
      <section>
        <h2>Toplama yöntemi ve hukuki sebepler</h2>
        <p>
          Kişisel verileriniz, bu sitedeki bayilik başvuru formu aracılığıyla elektronik ortamda toplanır. Verileriniz KVKK’nın 5/2-c maddesi (bir
          sözleşmenin kurulmasıyla doğrudan ilgili olması) ve 5/2-f maddesi (temel hak ve özgürlüklerinize zarar vermemek kaydıyla meşru menfaat)
          kapsamında işlenir. Ticari elektronik ileti gönderimi yalnızca açık rızanız bulunması halinde, KVKK’nın 5/1 maddesi ve 6563 sayılı
          Elektronik Ticaretin Düzenlenmesi Hakkında Kanun kapsamında yapılır.
        </p>
      </section>
      <section>
        <h2>Aktarım</h2>
        <p>
          Kişisel verileriniz yukarıdaki amaçlarla sınırlı olarak; başvuru kayıtlarının saklandığı veritabanı ve barındırma hizmeti sağlayıcılarına
          ve hukuki yükümlülüklerimiz kapsamında talep halinde yetkili kamu kurum ve kuruluşlarına aktarılabilir. Hizmet sağlayıcılarının sunucularının
          yurt dışında bulunması halinde aktarım, KVKK’nın 9. maddesinde öngörülen şartlara uygun olarak gerçekleştirilir.
        </p>
      </section>
      <section>
        <h2>Saklama süresi</h2>
        <p>
          Başvuru verileriniz, başvurunun sonuçlanmasından itibaren {c.retention} süreyle veya ilgili mevzuatın öngördüğü süre boyunca saklanır; süre
          sonunda silinir, yok edilir ya da anonim hale getirilir.
        </p>
      </section>
      <section>
        <h2>Haklarınız</h2>
        <p>
          KVKK’nın 11. maddesi uyarınca; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, işleme amacını ve amacına
          uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse
          düzeltilmesini, KVKK’nın 7. maddesi çerçevesinde silinmesini veya yok edilmesini isteme, bu işlemlerin aktarıldığı üçüncü kişilere
          bildirilmesini isteme, münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme ve kanuna
          aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme haklarına sahipsiniz.
        </p>
        <p className="mt-4">
          Taleplerinizi Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e uygun olarak
          {c.email ? (
            <>
              {" "}
              <a href={`mailto:${c.email}`}>{c.email}</a> adresine e-posta ile
            </>
          ) : (
            " sitedeki iletişim kanalları üzerinden"
          )}
          {c.address ? ` ya da ${c.address} adresine yazılı olarak` : ""} iletebilirsiniz. Ticari elektronik ileti onayınızı dilediğiniz zaman geri
          alabilirsiniz.
        </p>
      </section>
    </LegalPage>
  );
}
