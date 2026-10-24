/**
 * Coffee House – Yatırım başvuru formu arka ucu (Google Apps Script)
 *
 * Başvuruları bir Google E-Tablo'ya kaydeder ve her yeni başvuruda e-posta bildirimi gönderir.
 * Kurulum adımları: README.md → "Başvuruları Google E-Tablo'ya kaydetme".
 */

const AYARLAR = {
  // Yeni başvuru bildiriminin gideceği adres(ler). Birden fazlaysa virgülle ayırın. Boş bırakılırsa e-posta gönderilmez.
  BILDIRIM_EPOSTA: 'basvuru@coffeehousetr.com',
  SAYFA_ADI: 'Başvurular',
  // Aynı telefon numarasından bu süre içinde gelen ikinci başvuru kaydedilmez (saniye).
  TEKRAR_ENGEL_SANIYE: 600
};

const BUTCELER = {
  corner: '2 Milyon TL – Corner CH (30 m²)',
  mahal: '3–4 Milyon TL – Mahal CH (100–150 m²)',
  agora: '6 Milyon TL – Agora CH (200 m²)',
  '6m-ustu': '6 Milyon TL üzeri / birden fazla şube',
  kararsiz: 'Henüz karar vermedim'
};

const MULK_DURUMLARI = {
  hazir: 'Hazır dükkânım var',
  lokasyon: 'Dükkânım yok (Lokasyon desteği istiyorum)'
};

const DURUMLAR = ['Yeni', 'Arandı', 'Fizibilite Gönderildi', 'Görüşme', 'Sözleşme', 'Olumsuz'];

const SUTUNLAR = [
  ['Tarih', (b) => b.tarih],
  ['Durum', () => 'Yeni'],
  ['Ad Soyad', (b) => b.adSoyad],
  ['Telefon', (b) => b.telefon],
  ['E-posta', (b) => b.eposta],
  ['İl', (b) => b.il],
  ['İlçe', (b) => b.ilce],
  ['Bütçe', (b) => b.butce],
  ['Seçilen Model', (b) => b.secilenModel],
  ['Mülk Durumu', (b) => b.mulkDurumu],
  ['Dükkân m²', (b) => b.dukkanM2],
  ['Dükkân Semti / Adresi', (b) => b.dukkanAdresi],
  ['KVKK Onayı', () => 'Evet'],
  ['Ticari İleti Onayı', (b) => (b.ticariIleti ? 'Evet' : 'Hayır')],
  ['UTM Source', (b) => b.kaynak.utm_source],
  ['UTM Medium', (b) => b.kaynak.utm_medium],
  ['UTM Campaign', (b) => b.kaynak.utm_campaign],
  ['UTM Content', (b) => b.kaynak.utm_content],
  ['UTM Term', (b) => b.kaynak.utm_term],
  ['fbclid', (b) => b.kaynak.fbclid],
  ['gclid', (b) => b.kaynak.gclid],
  ['Referrer', (b) => b.kaynak.referrer],
  ['Sayfa URL', (b) => b.kaynak.sayfa_url],
  ['Not', () => '']
];

class DogrulamaHatasi extends Error {}

/** Formdan gelen başvuruyu kaydeder. */
function doPost(e) {
  try {
    const veri = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (veri.hp_alan) return yanit({ ok: true }); // bot tuzağı doldurulmuş: sessizce yok say

    const basvuru = dogrula(veri);
    const onbellek = CacheService.getScriptCache();
    const anahtar = 'tel_' + basvuru.telefonRakam;
    if (onbellek.get(anahtar)) return yanit({ ok: true, tekrar: true });

    const kilit = LockService.getScriptLock();
    kilit.waitLock(20000);
    try {
      const sayfa = sayfaGetir();
      sayfa.appendRow(SUTUNLAR.map(([, deger]) => formulKoru(deger(basvuru))));
      sayfa.getRange(sayfa.getLastRow(), durumSutunu()).setDataValidation(durumKurali());
    } finally {
      kilit.releaseLock();
    }
    onbellek.put(anahtar, '1', AYARLAR.TEKRAR_ENGEL_SANIYE);

    try {
      bildirimGonder(basvuru);
    } catch (hata) {
      console.error('Bildirim e-postası gönderilemedi', hata);
    }
    return yanit({ ok: true });
  } catch (hata) {
    if (hata instanceof DogrulamaHatasi) {
      console.warn('Geçersiz başvuru: ' + hata.message);
      return yanit({ ok: false, error: hata.message });
    }
    console.error(hata);
    return yanit({ ok: false, error: 'Başvuru kaydedilemedi.' });
  }
}

/** Web uygulaması adresini tarayıcıda açarak çalıştığını kontrol edebilirsiniz. */
function doGet() {
  return yanit({ ok: true, servis: 'Coffee House yatırım başvuru formu' });
}

/**
 * Bir kez elle çalıştırın: başlık satırını, "Durum" açılır listesini ve biçimleri hazırlar,
 * e-posta gönderme iznini ister.
 */
function kurulum() {
  const sayfa = sayfaGetir();
  const satirSayisi = Math.max(sayfa.getMaxRows() - 1, 1);
  sayfa.getRange(2, durumSutunu(), satirSayisi, 1).setDataValidation(durumKurali());
  sayfa.getRange(2, 1, satirSayisi, 1).setNumberFormat('dd.mm.yyyy hh:mm');
  sayfa.getRange(2, 4, satirSayisi, 1).setNumberFormat('@');
  sayfa.setColumnWidths(1, SUTUNLAR.length, 160);
  MailApp.getRemainingDailyQuota();
  console.log('Kurulum tamamlandı. Şimdi Dağıt → Yeni dağıtım → Web uygulaması adımına geçin.');
}

function dogrula(v) {
  const adSoyad = temiz(v.ad_soyad, 80).replace(/\s+/g, ' ');
  if (adSoyad.length < 3) throw new DogrulamaHatasi('Ad soyad eksik.');

  const telefonRakam = String(v.telefon_e164 || v.telefon || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^90/, '');
  if (!/^5\d{9}$/.test(telefonRakam)) throw new DogrulamaHatasi('Telefon numarası geçersiz.');

  const eposta = temiz(v.email, 120);
  if (eposta && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta)) throw new DogrulamaHatasi('E-posta adresi geçersiz.');

  const il = temiz(v.il, 40);
  const ilce = temiz(v.ilce, 60);
  if (!il || !ilce) throw new DogrulamaHatasi('İl ve ilçe seçilmeli.');
  if (!BUTCELER[v.butce]) throw new DogrulamaHatasi('Bütçe seçilmeli.');
  if (!MULK_DURUMLARI[v.mulk_durumu]) throw new DogrulamaHatasi('Mülk durumu seçilmeli.');
  if (v.kvkk_onay !== true) throw new DogrulamaHatasi('KVKK onayı gerekli.');

  const hazirDukkan = v.mulk_durumu === 'hazir';
  const kaynak = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'referrer', 'sayfa_url']
    .forEach((k) => { kaynak[k] = temiz(v[k], 300); });

  return {
    tarih: new Date(),
    adSoyad,
    telefonRakam,
    telefon: `0 (${telefonRakam.slice(0, 3)}) ${telefonRakam.slice(3, 6)} ${telefonRakam.slice(6, 8)} ${telefonRakam.slice(8)}`,
    eposta,
    il,
    ilce,
    butce: BUTCELER[v.butce],
    secilenModel: temiz(v.secilen_model, 40),
    mulkDurumu: MULK_DURUMLARI[v.mulk_durumu],
    dukkanM2: hazirDukkan ? temiz(v.dukkan_m2, 6).replace(/\D/g, '') : '',
    dukkanAdresi: hazirDukkan ? temiz(v.dukkan_adresi, 200) : '',
    ticariIleti: v.ticari_ileti_onay === true,
    kaynak
  };
}

function bildirimGonder(b) {
  if (!AYARLAR.BILDIRIM_EPOSTA) return;
  const dukkan = [b.dukkanM2 && `${b.dukkanM2} m²`, b.dukkanAdresi].filter(Boolean).join(', ');
  const kaynak = [b.kaynak.utm_source, b.kaynak.utm_medium, b.kaynak.utm_campaign].filter(Boolean).join(' / ');
  const satirlar = [
    ['Ad Soyad', b.adSoyad],
    ['Telefon', b.telefon],
    ['E-posta', b.eposta || '—'],
    ['İl / İlçe', `${b.il} / ${b.ilce}`],
    ['Bütçe', b.butce],
    ['Seçilen Model', b.secilenModel || '—'],
    ['Mülk Durumu', b.mulkDurumu],
    ['Dükkân', dukkan || '—'],
    ['Ticari İleti Onayı', b.ticariIleti ? 'Evet' : 'Hayır'],
    ['Kaynak', kaynak || b.kaynak.referrer || 'Doğrudan']
  ];
  const html =
    '<div style="font-family:Arial,sans-serif;color:#2B1D16">' +
    '<h2 style="margin:0 0 16px">Yeni yatırım başvurusu</h2>' +
    '<table cellpadding="8" style="border-collapse:collapse">' +
    satirlar.map(([k, d]) => `<tr><td style="border-bottom:1px solid #E4D8C8"><b>${kacis(k)}</b></td><td style="border-bottom:1px solid #E4D8C8">${kacis(d)}</td></tr>`).join('') +
    '</table>' +
    `<p style="margin-top:20px"><a href="tel:+90${b.telefonRakam}">Hemen ara</a> · <a href="https://wa.me/90${b.telefonRakam}">WhatsApp'tan yaz</a></p>` +
    '</div>';
  const duzMetin = satirlar.map(([k, d]) => `${k}: ${d}`).join('\n');

  const mesaj = {
    to: AYARLAR.BILDIRIM_EPOSTA,
    subject: `Yeni Yatırım Başvurusu – ${b.adSoyad} – ${b.il}/${b.ilce} – ${b.butce}`,
    body: duzMetin,
    htmlBody: html,
    name: 'Coffee House Başvuru Formu'
  };
  if (b.eposta) mesaj.replyTo = b.eposta;
  MailApp.sendEmail(mesaj);
}

function sayfaGetir() {
  const tablo = SpreadsheetApp.getActiveSpreadsheet();
  const sayfa = tablo.getSheetByName(AYARLAR.SAYFA_ADI) || tablo.insertSheet(AYARLAR.SAYFA_ADI);
  if (sayfa.getLastRow() === 0) {
    sayfa.appendRow(SUTUNLAR.map(([baslik]) => baslik));
    sayfa.getRange(1, 1, 1, SUTUNLAR.length).setFontWeight('bold').setBackground('#F3E4D1');
    sayfa.setFrozenRows(1);
  }
  return sayfa;
}

function durumSutunu() {
  return SUTUNLAR.findIndex(([baslik]) => baslik === 'Durum') + 1;
}

function durumKurali() {
  return SpreadsheetApp.newDataValidation().requireValueInList(DURUMLAR, true).setAllowInvalid(false).build();
}

function temiz(deger, enFazla) {
  return String(deger == null ? '' : deger).replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, enFazla);
}

// E-tabloda formül olarak çalıştırılmasını engelle (=, +, -, @ ile başlayan değerler)
function formulKoru(deger) {
  return typeof deger === 'string' && /^[=+\-@]/.test(deger) ? "'" + deger : deger;
}

function kacis(metin) {
  return String(metin).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function yanit(nesne) {
  return ContentService.createTextOutput(JSON.stringify(nesne)).setMimeType(ContentService.MimeType.JSON);
}
