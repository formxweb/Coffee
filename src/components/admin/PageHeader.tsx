export function PageHeader({ title, eyebrow, children }: { title: string; eyebrow?: string; children?: React.ReactNode }) {
  return (
    <header className="border-b border-line px-5 pb-8 pt-10 sm:px-8 lg:px-12 lg:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          {eyebrow && <p className="label text-blue-ink">{eyebrow}</p>}
          <h1 className="mt-3 text-5xl">{title}</h1>
        </div>
        {children}
      </div>
    </header>
  );
}

export function PanelSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="px-5 py-10 sm:px-8 lg:px-12" aria-busy="true" aria-label="Yükleniyor">
      <div className="grid gap-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-12 animate-pulse border-b border-line bg-paper/40" />
        ))}
      </div>
    </div>
  );
}
