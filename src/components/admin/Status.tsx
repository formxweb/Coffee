import { statusLabel } from "@/lib/options";

/** Durum: metin + küçük kare işaret (renk tek başına anlam taşımaz). */
export function StatusMark({ status }: { status: string }) {
  const style =
    status === "new"
      ? "bg-blue border-blue"
      : status === "rejected" || status === "on_hold"
        ? "border-muted"
        : "border-blue bg-transparent";
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 border ${style}`} />
      {statusLabel(status)}
    </span>
  );
}
