"use client";

import { useEffect, useRef, useState } from "react";

const WIDE_QUERY = "(min-aspect-ratio: 1/1)";

/**
 * Ana ekranın arka plan videosu. Ekran yatay ise üç panelli geniş sürüm, dikey ise telefon sürümü yüklenir.
 * Hareket azaltma ya da veri tasarrufu açıksa video hiç yüklenmez, poster görseli kalır.
 */
export function HeroVideo({ portrait, wide }: { portrait: string; wide: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) return;
    const mq = window.matchMedia(WIDE_QUERY);
    const pick = () => setSrc(mq.matches ? wide : portrait);
    pick();
    mq.addEventListener("change", pick);
    return () => mq.removeEventListener("change", pick);
  }, [portrait, wide]);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;
    video.muted = true;
    video.play().catch(() => {
      // Otomatik oynatma engellendiyse poster görünür kalır
    });
  }, [src]);

  return (
    <video
      ref={ref}
      id="hero-video"
      src={src ?? undefined}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setVisible(true)}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}
    />
  );
}

/** Otomatik oynayan videoyu durdurma ve yeniden başlatma düğmesi */
export function HeroVideoToggle({ className = "" }: { className?: string }) {
  const [state, setState] = useState<"none" | "playing" | "paused">("none");

  useEffect(() => {
    const video = document.getElementById("hero-video") as HTMLVideoElement | null;
    if (!video) return;
    const onPlay = () => setState("playing");
    const onPause = () => setState("paused");
    video.addEventListener("playing", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("playing", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  if (state === "none") return null;

  return (
    <button
      type="button"
      onClick={() => {
        const video = document.getElementById("hero-video") as HTMLVideoElement | null;
        if (!video) return;
        if (video.paused) void video.play();
        else video.pause();
      }}
      className={`text-sm font-medium text-white/80 underline underline-offset-4 hover:text-white ${className}`}
    >
      {state === "playing" ? "Videoyu durdur" : "Videoyu oynat"}
    </button>
  );
}
