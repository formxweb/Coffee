/** Bölüm başlığı: küçük etiket, büyük başlık ve isteğe bağlı kısa açıklama */
export function SectionHead({
  id,
  label,
  title,
  children,
  dark = false,
  className = "",
}: {
  id: string;
  label: string;
  title: string;
  children?: React.ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`max-w-3xl ${className}`}>
      <p className={`label ${dark ? "text-blue-light" : "text-blue"}`}>{label}</p>
      <h2 id={id} className="mt-4 text-title uppercase">
        {title}
      </h2>
      {children && <p className={`mt-5 text-lg sm:text-xl ${dark ? "text-soft" : "text-muted"}`}>{children}</p>}
    </div>
  );
}
