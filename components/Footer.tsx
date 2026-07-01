import Link from "next/link";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] px-6 py-16 lg:px-10">
      <div className="mx-auto max-w-[88rem]">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div className="max-w-md">
            <div className="flex items-center gap-2.5">
              <Logo size={34} className="text-[var(--color-gold)]" />
              <span className="font-display text-2xl font-semibold text-coin">Charon</span>
            </div>
            <p className="mt-4 text-[var(--color-muted)]">
              Charon connects your Nomba account to the apps you already use, so your
              money runs itself. Built on the Nomba API for Nigerian businesses.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-utility">
            <Link href="#how" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              How it works
            </Link>
            <Link href="#automate" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              Automate
            </Link>
            <Link href="#recipes" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              Recipes
            </Link>
            <Link href="#get-started" className="text-[var(--color-muted)] hover:text-[var(--color-ink)]">
              Get started
            </Link>
          </div>
        </div>
        <div className="rule my-10" />
        <div className="flex flex-col items-start justify-between gap-3 text-utility text-[var(--color-muted)] sm:flex-row sm:items-center">
          <span>paywithcharon.xyz</span>
          <span>Powered by Nomba · Runs on Zapier</span>
        </div>
      </div>
    </footer>
  );
}
