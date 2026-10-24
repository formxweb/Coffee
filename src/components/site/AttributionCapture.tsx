"use client";

import { useEffect } from "react";
import { ATTRIBUTION_FIELDS, ATTRIBUTION_KEY, readAttribution, type Attribution } from "@/lib/attribution";

/** Siteye gelinen kampanya bağlantısını (utm vb.) oturum boyunca saklar; yalnızca başvuruyla birlikte gönderilir. */
export function AttributionCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      let data: Attribution = readAttribution();
      if (ATTRIBUTION_FIELDS.some((k) => params.get(k))) {
        data = {};
        for (const k of ATTRIBUTION_FIELDS) {
          const v = params.get(k);
          if (v) data[k] = v.slice(0, 120);
        }
      }
      if (!data.referrer && document.referrer) {
        const ref = new URL(document.referrer);
        if (ref.host !== window.location.host) data.referrer = document.referrer.slice(0, 300);
      }
      sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(data));
    } catch {
      // Gizli sekme vb.: kaynak bilgisi olmadan devam et
    }
  }, []);
  return null;
}
