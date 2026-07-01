"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#automate", label: "What you can automate" },
  { href: "#recipes", label: "Recipes" },
];

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 bg-[color-mix(in_srgb,var(--color-bg)_82%,transparent)] backdrop-blur">
      <nav className="mx-auto flex max-w-[88rem] items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Charon">
          <Logo size={38} className="text-[var(--color-gold)]" />
          <span className="font-display text-3xl font-semibold leading-none tracking-tight text-coin">
            Charon
          </span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="hidden px-3 py-2 text-utility text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)] md:inline-block"
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link href="#get-started" className="btn-coin">
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
