"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { SUPABASE_URL } from "@/lib/env";
import { createBrowserSupabase } from "@/lib/supabase/browser";

type Incoming = { id: string; ref_code: string; full_name: string; city: string; created_at: string };

const LiveContext = createContext(0);
export const useLiveCount = () => useContext(LiveContext);

const POLL_MS = 45_000;

/**
 * Yeni başvuru bildirimleri: Supabase Realtime ile anında, ayrıca bağlantı kopsa bile
 * kaçırılmaması için periyodik kontrol. RLS gereği yalnızca yöneticiler veri alır.
 */
export function LiveNotifications({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Incoming[]>([]);
  const [count, setCount] = useState(0);
  const seen = useRef(new Set<string>());
  const since = useRef("");
  const baseTitle = useRef("");

  useEffect(() => {
    baseTitle.current = document.title.replace(/^\(\d+\)\s*/, "");
    since.current = new Date().toISOString();
    const supabase = createBrowserSupabase();

    const push = (rows: Incoming[]) => {
      const fresh = rows.filter((r) => !seen.current.has(r.id));
      if (!fresh.length) return;
      fresh.forEach((r) => seen.current.add(r.id));
      setItems((prev) => [...fresh, ...prev].slice(0, 4));
      setCount((c) => c + fresh.length);
    };

    const poll = async () => {
      const { data } = await supabase
        .from("applications")
        .select("id, ref_code, full_name, city, created_at")
        .gt("created_at", since.current)
        .order("created_at", { ascending: true })
        .limit(20);
      if (data?.length) {
        since.current = data[data.length - 1].created_at;
        push(data);
      }
    };
    const timer = window.setInterval(poll, POLL_MS);

    // Realtime yalnızca gerçek Supabase projesinde (https) açılır
    const channel = SUPABASE_URL.startsWith("https://")
      ? supabase
          .channel("yeni-basvurular")
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "applications" }, (payload) => {
            const row = payload.new as Incoming;
            if (row.created_at > since.current) since.current = row.created_at;
            push([row]);
          })
          .subscribe()
      : null;

    return () => {
      window.clearInterval(timer);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!baseTitle.current) return;
    document.title = count ? `(${count}) ${baseTitle.current}` : baseTitle.current;
  }, [count]);

  return (
    <LiveContext value={count}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-50 grid w-[min(22rem,calc(100vw-2rem))] gap-2">
        {items.map((item) => (
          <div key={item.id} className="pointer-events-auto border border-line bg-paper p-4 shadow-[0_12px_30px_-18px_rgba(27,20,17,0.5)]">
            <p className="label text-blue-ink">Yeni başvuru · {item.ref_code}</p>
            <p className="mt-2 text-ink">
              {item.full_name}, {item.city}
            </p>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <Link href={`/admin/basvurular/${item.id}`} className="text-blue-ink underline underline-offset-4">
                Başvuruyu aç
              </Link>
              <button
                type="button"
                className="text-muted hover:text-ink"
                onClick={() => setItems((prev) => prev.filter((p) => p.id !== item.id))}
              >
                Kapat
              </button>
            </div>
          </div>
        ))}
      </div>
    </LiveContext>
  );
}
