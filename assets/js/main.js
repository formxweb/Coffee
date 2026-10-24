/* Coffee House – site davranışları ve yatırım başvuru formu */
(() => {
  'use strict';

  const cfg = Object.assign({ instagram: 'https://www.instagram.com/_coffeehouse.tr' }, window.CH_CONFIG || {});
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLocal = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

  const storage = (area) => ({
    get(key) { try { return window[area].getItem(key); } catch (e) { return null; } },
    set(key, value) { try { window[area].setItem(key, value); } catch (e) { /* gizli sekme vb. */ } },
    remove(key) { try { window[area].removeItem(key); } catch (e) { /* yok say */ } }
  });
  const local = storage('localStorage');
  const session = storage('sessionStorage');

  /* ---------- İletişim bilgileri ---------- */

  const onlyDigits = (v) => String(v || '').replace(/\D/g, '');
  const waNumber = onlyDigits(cfg.whatsapp);
  const contact = {
    whatsapp: waNumber.length >= 11,
    phone: onlyDigits(cfg.phone).length >= 10,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(cfg.email || '').trim()),
    address: String(cfg.address || '').trim() !== ''
  };
  const WA_DEFAULT = 'Merhaba, Coffee House yatırım fırsatları hakkında bilgi almak istiyorum.';
  const waUrl = (text) => `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

  $$('[data-requires]').forEach((el) => {
    el.hidden = !el.dataset.requires.split('|').some((key) => contact[key]);
  });
  $$('[data-wa-link]').forEach((a) => { a.href = waUrl(WA_DEFAULT); });
  $$('[data-contact]').forEach((el) => {
    const type = el.dataset.contact;
    const label = el.matches('[data-contact-label]') ? el : $('[data-contact-label]', el);
    if (type === 'phone' && contact.phone) {
      el.href = 'tel:' + String(cfg.phone).replace(/[^\d+]/g, '');
      label.textContent = cfg.phone;
    } else if (type === 'email' && contact.email) {
      el.href = 'mailto:' + cfg.email.trim();
      label.textContent = cfg.email.trim();
    } else if (type === 'address' && contact.address) {
      label.textContent = cfg.address.trim();
    }
  });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Üst menü ---------- */

  const header = $('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const nav = $('[data-nav]');
  const navToggle = $('[data-nav-toggle]');
  const setNav = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    $('use', navToggle).setAttribute('href', open ? '#i-x' : '#i-menu');
  };
  navToggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); navToggle.focus(); }
  });

  /* ---------- Görünme animasyonu ---------- */

  const reveals = $$('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Mobil alt çubuk ---------- */

  const bar = $('[data-mobile-bar]');
  const formSection = $('#basvuru');
  if (bar && 'IntersectionObserver' in window) {
    const seen = new Map();
    const update = () => {
      const show = !seen.get('hero') && !seen.get('form');
      bar.classList.toggle('is-visible', show);
      bar.inert = !show;
      bar.setAttribute('aria-hidden', String(!show));
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => seen.set(entry.target.dataset.watch, entry.isIntersecting));
      update();
    });
    $('.hero').dataset.watch = 'hero';
    formSection.dataset.watch = 'form';
    io.observe($('.hero'));
    io.observe(formSection);
  }

  /* ---------- Kampanya kaynağı (UTM) ---------- */

  const ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
  let attribution = {};
  try { attribution = JSON.parse(session.get('ch_kaynak') || '{}') || {}; } catch (e) { attribution = {}; }
  const params = new URLSearchParams(location.search);
  if (ATTR_KEYS.some((key) => params.has(key))) {
    attribution = {};
    ATTR_KEYS.forEach((key) => { if (params.get(key)) attribution[key] = params.get(key).slice(0, 200); });
  }
  if (!attribution.referrer && document.referrer) {
    try {
      if (new URL(document.referrer).host !== location.host) attribution.referrer = document.referrer.slice(0, 300);
    } catch (e) { /* geçersiz referrer */ }
  }
  session.set('ch_kaynak', JSON.stringify(attribution));

  /* ---------- Çerez onayı ve ölçümleme ---------- */

  const CONSENT_KEY = 'ch_cerez_onayi';
  const consentBox = $('[data-consent]');
  const loadTrackers = () => {
    if (cfg.ga4Id && !window.gtag) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(cfg.ga4Id);
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', cfg.ga4Id);
    }
    if (cfg.metaPixelId && !window.fbq) {
      /* Meta Pixel temel kodu */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', cfg.metaPixelId);
      window.fbq('track', 'PageView');
    }
  };
  if (cfg.metaPixelId || cfg.ga4Id) {
    const decision = local.get(CONSENT_KEY);
    if (decision === 'kabul') loadTrackers();
    else if (decision !== 'red' && consentBox) consentBox.hidden = false;
  }
  if (consentBox) {
    $('[data-consent-accept]', consentBox).addEventListener('click', () => {
      local.set(CONSENT_KEY, 'kabul'); consentBox.hidden = true; loadTrackers();
    });
    $('[data-consent-reject]', consentBox).addEventListener('click', () => {
      local.set(CONSENT_KEY, 'red'); consentBox.hidden = true;
    });
  }
  const trackLead = (data, method) => {
    const model = data.secilen_model || data.butce;
    if (window.fbq) window.fbq('track', 'Lead', { content_name: model, content_category: data.butce });
    if (window.gtag) window.gtag('event', 'generate_lead', { butce: data.butce, secilen_model: data.secilen_model, yontem: method });
  };

  /* ---------- Başvuru formu ---------- */

  const form = $('[data-form]');
  if (!form) return;

  const BUDGETS = {
    corner: { label: '2 Milyon TL – Corner CH (30 m²)', model: 'Corner CH' },
    mahal: { label: '3–4 Milyon TL – Mahal CH (100–150 m²)', model: 'Mahal CH' },
    agora: { label: '6 Milyon TL – Agora CH (200 m²)', model: 'Agora CH' },
    '6m-ustu': { label: '6 Milyon TL üzeri / birden fazla şube', model: '' },
    kararsiz: { label: 'Henüz karar vermedim', model: '' }
  };
  const PROPERTY = {
    hazir: 'Hazır dükkânım var',
    lokasyon: 'Dükkânım yok (Lokasyon desteği istiyorum)'
  };

  const el = form.elements;
  const live = $('[data-live]', form);
  const alertBox = $('[data-form-alert]', form);
  const submitBtn = $('[data-submit]', form);
  const success = $('[data-success]');
  const conditional = $('[data-conditional="hazir"]', form);
  let selectedModel = '';
  let busy = false;

  // Telefon: 10 haneli, 5 ile başlayan cep numarası; ekranda 0 (5XX) XXX XX XX
  const telDigits = (value) => {
    let d = onlyDigits(value).replace(/^0+/, '');
    if (d.startsWith('90')) d = d.slice(2).replace(/^0+/, '');
    return d.slice(0, 10);
  };
  const formatTel = (d) => {
    if (!d) return '';
    let s = '0 (' + d.slice(0, 3);
    if (d.length >= 3) s += ')';
    if (d.length > 3) s += ' ' + d.slice(3, 6);
    if (d.length > 6) s += ' ' + d.slice(6, 8);
    if (d.length > 8) s += ' ' + d.slice(8, 10);
    return s;
  };
  let lastTel = '';
  el.telefon.addEventListener('input', (e) => {
    let d = telDigits(el.telefon.value);
    if (e.inputType === 'deleteContentBackward' && d === lastTel) d = d.slice(0, -1);
    lastTel = d;
    el.telefon.value = formatTel(d);
  });

  // İl / ilçe
  const places = window.IL_ILCE || {};
  const ilFragment = document.createDocumentFragment();
  Object.keys(places).forEach((il) => ilFragment.appendChild(new Option(il, il)));
  el.il.appendChild(ilFragment);
  el.il.addEventListener('change', () => {
    const list = places[el.il.value] || [];
    el.ilce.length = 1;
    list.forEach((ilce) => el.ilce.appendChild(new Option(ilce, ilce)));
    el.ilce.options[0].textContent = list.length ? 'İlçe seçin' : 'Önce il seçin';
    el.ilce.disabled = !list.length;
    el.ilce.value = '';
    setError('ilce', '');
  });

  const value = (name) => {
    const field = el[name];
    if (!field) return '';
    if (field instanceof RadioNodeList) return field.value;
    if (field.type === 'checkbox') return field.checked;
    return field.value;
  };

  const rules = {
    ad_soyad: (v) => {
      v = v.trim();
      if (!v) return 'Adınızı ve soyadınızı yazın.';
      if (v.length < 3) return 'Ad soyad en az 3 karakter olmalı.';
      return '';
    },
    telefon: (v) => {
      const d = telDigits(v);
      if (!d) return 'Telefon numaranızı yazın.';
      if (!/^5\d{9}$/.test(d)) return 'Telefon numarası 0 (5XX) XXX XX XX biçiminde olmalı.';
      return '';
    },
    email: (v) => {
      v = v.trim();
      return v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? 'E-posta adresi ornek@alanadi.com biçiminde olmalı.' : '';
    },
    il: (v) => (v ? '' : 'İl seçin.'),
    ilce: (v) => (v ? '' : 'İlçe seçin.'),
    butce: (v) => (v ? '' : 'Bütçe aralığınızı seçin.'),
    mulk_durumu: (v) => (v ? '' : 'Mülk durumunuzu seçin.'),
    dukkan_m2: (v) => {
      v = v.trim();
      return v && !(/^\d{1,5}$/.test(v) && Number(v) >= 5) ? 'Metrekareyi rakamla yazın (ör. 120).' : '';
    },
    kvkk_onay: (v) => (v ? '' : 'Devam etmek için KVKK Aydınlatma Metni’ni onaylayın.')
  };

  const activeFields = () => Object.keys(rules).filter((name) => name !== 'dukkan_m2' || value('mulk_durumu') === 'hazir');
  const fieldBox = (name) => $(`[data-field="${name}"]`, form);
  const inputsOf = (name) => {
    const field = el[name];
    return field instanceof RadioNodeList ? Array.from(field) : [field];
  };

  // Radyo gruplarında hata metnini her seçeneğe bağla
  ['butce', 'mulk_durumu'].forEach((name) => {
    const errId = $('[data-error]', fieldBox(name)).id;
    inputsOf(name).forEach((input) => input.setAttribute('aria-describedby', errId));
  });

  function setError(name, message) {
    const box = fieldBox(name);
    if (!box) return;
    box.classList.toggle('is-invalid', Boolean(message));
    $('[data-error]', box).textContent = message;
    inputsOf(name).forEach((input) => {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    });
  }
  const validate = (name) => {
    const message = rules[name](value(name));
    setError(name, message);
    return !message;
  };

  // Alan terk edilince doğrula; kullanıcı düzeltmeye başlayınca hatayı hemen kaldır
  form.addEventListener('focusout', (e) => {
    const name = e.target.name;
    if (!rules[name] || e.target.type === 'radio' || e.target.type === 'checkbox') return;
    if (name === 'ilce' && el.ilce.disabled) return;
    validate(name);
  });
  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (rules[name] && ['text', 'tel', 'email'].includes(e.target.type)) setError(name, '');
  });
  form.addEventListener('change', (e) => {
    const name = e.target.name;
    if (['radio', 'checkbox'].includes(e.target.type) || e.target.tagName === 'SELECT') {
      if (rules[name] && (value(name) || fieldBox(name).classList.contains('is-invalid'))) validate(name);
    }
    if (name === 'mulk_durumu') {
      conditional.hidden = value('mulk_durumu') !== 'hazir';
      if (conditional.hidden) setError('dukkan_m2', '');
    }
  });

  // Model kartlarından gelindiğinde bütçeyi otomatik seç
  $$('[data-select-budget]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const code = link.dataset.selectBudget;
      const radio = $(`input[name="butce"][value="${code}"]`, form);
      if (radio && !form.hidden) {
        radio.checked = true;
        setError('butce', '');
      }
      selectedModel = (BUDGETS[code] && BUDGETS[code].model) || '';
      e.preventDefault();
      formSection.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      $('#basvuru-baslik').focus({ preventScroll: true });
    });
  });

  const collect = () => {
    const d = telDigits(value('telefon'));
    const butce = value('butce');
    const mulk = value('mulk_durumu');
    return Object.assign({
      ad_soyad: value('ad_soyad').trim().replace(/\s+/g, ' '),
      telefon: formatTel(d),
      telefon_e164: '+90' + d,
      email: value('email').trim(),
      il: value('il'),
      ilce: value('ilce'),
      butce,
      butce_etiket: BUDGETS[butce].label,
      secilen_model: selectedModel,
      mulk_durumu: mulk,
      mulk_etiket: PROPERTY[mulk],
      dukkan_m2: mulk === 'hazir' ? value('dukkan_m2').trim() : '',
      dukkan_adresi: mulk === 'hazir' ? value('dukkan_adresi').trim() : '',
      kvkk_onay: true,
      ticari_ileti_onay: Boolean(value('ticari_ileti_onay')),
      sayfa_url: location.href.split('#')[0],
      hp_alan: value('hp_alan')
    }, attribution);
  };

  const whatsappMessage = (data) => {
    const lines = [
      'Merhaba, Coffee House yatırım başvurusu yapmak istiyorum.',
      '',
      `Ad Soyad: ${data.ad_soyad}`,
      `Telefon: ${data.telefon}`
    ];
    if (data.email) lines.push(`E-posta: ${data.email}`);
    lines.push(`İl / İlçe: ${data.il} / ${data.ilce}`, `Bütçe: ${data.butce_etiket}`, `Mülk Durumu: ${data.mulk_etiket}`);
    const shop = [data.dukkan_m2 && `${data.dukkan_m2} m²`, data.dukkan_adresi].filter(Boolean).join(', ');
    if (shop) lines.push(`Dükkân: ${shop}`);
    return lines.join('\n');
  };

  const setBusy = (state) => {
    busy = state;
    submitBtn.disabled = state;
    submitBtn.setAttribute('aria-busy', String(state));
    $('[data-spinner]', submitBtn).hidden = !state;
    $('[data-submit-label]', submitBtn).textContent = state ? 'Gönderiliyor…' : 'Fizibilite Raporumu İste';
  };

  const showAlert = (message) => {
    alertBox.replaceChildren();
    alertBox.insertAdjacentHTML('afterbegin', '<svg class="icon" aria-hidden="true"><use href="#i-triangle-alert"/></svg>');
    const text = document.createElement('span');
    text.textContent = message + ' ';
    if (contact.whatsapp) {
      const link = document.createElement('a');
      link.href = waUrl(WA_DEFAULT);
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'WhatsApp’tan bize yazın.';
      text.appendChild(link);
    }
    alertBox.appendChild(text);
    alertBox.hidden = false;
  };

  const showSuccess = (data, method) => {
    const firstName = data.ad_soyad.split(' ')[0];
    const when = cfg.responseTime ? `${cfg.responseTime} içinde` : 'en kısa sürede';
    $('[data-success-title]', success).textContent = `Teşekkürler, ${firstName}!`;
    $('[data-success-text]', success).textContent = method === 'whatsapp'
      ? 'Başvuru bilgileriniz WhatsApp mesajı olarak hazırlandı. Mesajı gönderdiğinizde başvurunuz ekibimize ulaşır ve fizibilite raporunuzla sizi ararız.'
      : `Başvurunuz bize ulaştı. Fizibilite raporunuzla birlikte ${when} sizi arayacağız.`;
    const wa = $('[data-success-wa]', success);
    wa.href = method === 'whatsapp' ? waUrl(whatsappMessage(data)) : waUrl('Merhaba, Coffee House yatırım başvurusu yaptım.');
    $('[data-success-wa-label]', success).textContent = method === 'whatsapp' ? 'WhatsApp’ı Tekrar Aç' : 'WhatsApp’tan Yazın';
    form.hidden = true;
    success.hidden = false;
    success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    success.focus({ preventScroll: true });
  };

  const sendToEndpoint = async (data) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      // text/plain: Google Apps Script CORS ön isteğini (preflight) desteklemediği için
      const res = await fetch(cfg.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || body.ok === false) throw new Error(body.error || `HTTP ${res.status}`);
    } finally {
      clearTimeout(timer);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy) return;
    alertBox.hidden = true;

    const invalid = activeFields().filter((name) => !validate(name));
    if (invalid.length) {
      const first = inputsOf(invalid[0])[0];
      first.focus({ preventScroll: true });
      fieldBox(invalid[0]).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      live.textContent = `Formda ${invalid.length} alan eksik ya da hatalı.`;
      return;
    }

    const data = collect();
    if (data.hp_alan) { showSuccess(data, 'form'); return; }

    // Sunucu ayarlanmamışsa başvuruyu WhatsApp mesajı olarak hazırla (açılır pencere engeline takılmaması için await'ten önce)
    if (!cfg.formEndpoint && !isLocal) {
      if (contact.whatsapp) {
        const url = waUrl(whatsappMessage(data));
        const win = window.open(url, '_blank');
        if (win) win.opener = null; else location.href = url;
        trackLead(data, 'whatsapp');
        showSuccess(data, 'whatsapp');
      } else {
        console.error('[Coffee House] Form gönderim adresi (formEndpoint) ve WhatsApp numarası ayarlanmamış. assets/js/config.js dosyasını doldurun.');
        showAlert('Başvurunuz şu an gönderilemiyor. Lütfen daha sonra tekrar deneyin.');
      }
      return;
    }

    setBusy(true);
    try {
      if (cfg.formEndpoint) {
        await sendToEndpoint(data);
      } else {
        // Yerel önizleme: gerçek gönderim yapılmaz
        await new Promise((resolve) => setTimeout(resolve, 600));
        console.info('[Coffee House] Demo modu: başvuru gönderilmedi.', data);
      }
      trackLead(data, 'form');
      showSuccess(data, 'form');
    } catch (err) {
      console.error('[Coffee House] Başvuru gönderilemedi:', err);
      showAlert('Başvurunuz şu an gönderilemedi. Bağlantınızı kontrol edip tekrar deneyin.');
    } finally {
      setBusy(false);
    }
  });
})();
