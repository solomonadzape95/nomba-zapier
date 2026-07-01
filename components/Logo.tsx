/**
 * Charon coin mark — a struck coin with a value-crossing arrow.
 * A nod to the fare Charon took to carry you across, minus the mythology.
 * Uses `currentColor`, so it takes the coin-gold from its parent
 * (e.g. `text-[var(--color-gold)]`).
 */
export function Logo({ size, className = "" }: { size?: number; className?: string }) {
  const dim = size ?? "1em";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={dim}
      height={dim}
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* coin */}
      <circle cx="50" cy="50" r="44" />
      <circle cx="50" cy="50" r="33" strokeWidth={2.5} opacity="0.5" />
      {/* value crossing the coin */}
      <path d="M34 62 L66 38" />
      <path d="M52 38 L66 38 L66 52" />
    </svg>
  );
}
