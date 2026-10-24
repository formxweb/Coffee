import Link from "next/link";

export function NotFoundContent() {
  return (
    <section className="flex min-h-[80svh] items-end bg-white pt-32">
      <div className="mx-auto w-full max-w-[1600px] px-5 pb-20 sm:px-8 lg:px-12">
        <p className="label text-blue-ink">404</p>
        <h1 className="mt-6 text-title uppercase">Sayfa bulunamadı.</h1>
        <p className="mt-6 max-w-md text-lg text-muted">Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-line">
            Ana sayfaya dön <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/basvuru" className="btn-solid">
            Bayilik başvurusu <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
