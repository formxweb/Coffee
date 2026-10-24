import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Yönetim paneli", template: "%s | Coffee House Yönetim" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-white text-ink">{children}</div>;
}
