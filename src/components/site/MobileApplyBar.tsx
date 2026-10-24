"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Mobilde ilk ekran geçildikten sonra görünen sabit başvuru butonu. */
export function MobileApplyBar() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  if (pathname.startsWith("/basvuru")) return null;
  const concept = pathname.match(/^\/konseptler\/([a-z0-9-]+)$/)?.[1];

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line-dark bg-espresso p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      inert={!visible}
    >
      <Link href={concept ? `/basvuru?konsept=${concept}` : "/basvuru"} className="btn-solid w-full">
        Bayilik Başvurusu <span aria-hidden="true">↗</span>
      </Link>
    </div>
  );
}
