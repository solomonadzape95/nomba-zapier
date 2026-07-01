const ITEMS = [
  "NEW PAYMENT → GOOGLE SHEETS",
  "INVOICE APPROVED → BANK TRANSFER",
  "FORM SUBMITTED → PAYMENT LINK",
  "PAYMENT IN → WHATSAPP RECEIPT",
  "NEW CUSTOMER → VIRTUAL ACCOUNT",
  "ORDER PAID → BUY AIRTIME",
];

/** Infinite marquee of example automations. The list is duplicated so the
 *  -50% keyframe loops seamlessly. */
export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-[var(--color-border)] py-4">
      <div className="marquee-loop flex w-max gap-10 whitespace-nowrap">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="flex items-center gap-10 text-utility text-[var(--color-muted)]">
            {item}
            <span className="text-[var(--color-gold)]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
