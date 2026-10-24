import Link from "next/link";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import { Wordmark } from "@/components/site/Wordmark";

export default function GlobalNotFound() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-ivory">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center px-5 sm:h-20 sm:px-8 lg:px-12">
          <Link href="/" aria-label="Coffee House ana sayfa">
            <Wordmark />
          </Link>
        </div>
      </header>
      <main>
        <NotFoundContent />
      </main>
    </>
  );
}
