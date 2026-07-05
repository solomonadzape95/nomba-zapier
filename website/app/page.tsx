import {
  ArrowRight,
  ArrowDownToLine,
  Send,
  Link2,
  Smartphone,
  Wifi,
  Zap,
  Undo2,
  Landmark,
  Search,
  Wallet,
  BellRing,
  PlugZap,
  MousePointerClick,
  Infinity as InfinityIcon,
} from "lucide-react";
import { Marquee } from "@/components/Marquee";
import { Logo } from "@/components/Logo";
import { NombaMark } from "@/components/NombaMark";
import { ZAPIER_INVITE } from "@/lib/links";

const PROBLEMS = [
  {
    n: "01",
    tag: "The evening goes",
    title: "Your payments live in an app",
    body: "Every sale sits inside Nomba. Copying them into a spreadsheet by hand, one row at a time, is where the night disappears.",
  },
  {
    n: "02",
    tag: "Fifty times a week",
    title: "Paying people is a chore",
    body: "Suppliers, staff, refunds. Check the amount, open the app, retype the account number, send. Again, and again, and again.",
  },
  {
    n: "03",
    tag: "The sale waits",
    title: "Every customer waits on you",
    body: "They can't pay until you personally make and send a link. If you're asleep or busy, the money just sits there.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: PlugZap,
    title: "Connect Nomba",
    body: "Paste your Nomba API keys once. Charon keeps them encrypted and talks to Nomba on your behalf — no coding, no servers.",
  },
  {
    n: "02",
    icon: MousePointerClick,
    title: "Build a flow",
    body: "Pick a trigger (“when a payment arrives”) and an action (“add a row”, “send a transfer”). Point, click, done.",
  },
  {
    n: "03",
    icon: InfinityIcon,
    title: "It runs itself",
    body: "Charon watches your Nomba account around the clock and does the work the instant it's needed — while you sleep.",
  },
];

const TRIGGERS = [
  {
    icon: ArrowDownToLine,
    title: "New Payment Received",
    body: "Fires the moment money lands in your Nomba account — a checkout payment or a virtual-account transfer.",
  },
  {
    icon: BellRing,
    title: "New Transfer or Payout",
    body: "Fires when money leaves — a payout, a supplier payment, or a bill you paid.",
  },
];

const ACTIONS = [
  {
    icon: Send,
    title: "Send Bank Transfer",
    body: "Pay any Nigerian bank account. Charon confirms the account name before the money moves.",
  },
  {
    icon: Link2,
    title: "Create Payment Link",
    body: "Generate a Nomba checkout link to send a customer, straight from any app.",
  },
  {
    icon: Smartphone,
    title: "Buy Airtime",
    body: "Top up any phone number — perfect for customer rewards or staff allowances.",
  },
  {
    icon: Wifi,
    title: "Buy Data Bundle",
    body: "Send a mobile data bundle to any number, straight from an automation.",
  },
  {
    icon: Zap,
    title: "Pay Electricity Bill",
    body: "Pay a prepaid or postpaid bill and get the vend token back automatically.",
  },
  {
    icon: Undo2,
    title: "Refund Payment",
    body: "Send a customer's money back — in full or in part — when an order is cancelled.",
  },
  {
    icon: Landmark,
    title: "Create Virtual Account",
    body: "Issue a dedicated bank account number — one per customer or per order.",
  },
];

const LOOKUPS = [
  {
    icon: Search,
    title: "Lookup Bank Account",
    body: "Confirm the real name behind any account number before you pay.",
  },
  {
    icon: Wallet,
    title: "Get Wallet Balance",
    body: "Read your available Nomba balance inside any automation.",
  },
];

const RECIPES = [
  {
    tag: "Bookkeeping",
    when: "A payment arrives in Nomba",
    then: "Add a row to Google Sheets, then text the customer a receipt.",
  },
  {
    tag: "Payouts",
    when: "You mark an invoice “approved” in Airtable",
    then: "Charon sends the bank transfer automatically.",
  },
  {
    tag: "Collection",
    when: "Someone fills in your order form",
    then: "Charon makes a payment link and emails it to them.",
  },
  {
    tag: "Loyalty",
    when: "An order is paid",
    then: "Charon sends the customer ₦100 airtime as a thank-you.",
  },
];

const STATS = [
  { value: "8,000+", label: "apps you can connect" },
  { value: "11", label: "triggers, actions & searches" },
  { value: "0", label: "lines of code" },
  { value: "24/7", label: "always watching" },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-6 pt-20 pb-16 lg:px-10 lg:pt-28">
        <p className="text-utility text-[var(--color-gold)] fade-up">
          Built on Nomba · Runs on Zapier
        </p>
        <h1 className="display-xl font-display mt-6 max-w-5xl fade-up">
          Put your money
          <br />
          on <span className="text-coin">autopilot</span>.
        </h1>
        <p
          className="mt-8 max-w-2xl text-xl text-[var(--color-muted)] fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          Charon links your Nomba account to the 8,000+ apps you already use —
          Sheets, WhatsApp, Airtable, forms and more. Payments record themselves,
          suppliers get paid the moment an invoice is approved, and customers get a
          payment link without you lifting a finger. No code.
        </p>
        <div
          className="mt-8 flex items-center gap-3 fade-up"
          style={{ animationDelay: "0.08s" }}
        >
          <span className="inline-flex items-center gap-2">
            <Logo size={22} className="text-[var(--color-gold)]" />
            <span className="font-display text-lg font-semibold text-coin">Charon</span>
          </span>
          <span className="text-utility text-[var(--color-muted)]">connects to</span>
          <span className="inline-flex items-center gap-2">
            <NombaMark size={18} className="text-[var(--color-ink)]" />
            <span className="font-display text-lg font-semibold">Nomba</span>
          </span>
        </div>
        <div
          className="mt-8 flex flex-wrap items-center gap-3 fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <a
            href={ZAPIER_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-coin"
          >
            Add Nomba to Zapier <ArrowRight size={16} />
          </a>
          <a href="#how" className="btn-outline">
            See how it works
          </a>
        </div>
        <p
          className="mt-5 text-utility text-[var(--color-muted)] fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          Works with your existing Nomba account · Nothing to install
        </p>
      </section>

      <Marquee />

      {/* ── Problem ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-6 py-24 lg:px-10">
        <p className="text-utility text-[var(--color-muted)]">The daily money grind</p>
        <h2 className="display-md font-display mt-4 max-w-3xl">
          Running a business shouldn't mean retyping account numbers all night.
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-border)] md:grid-cols-3">
          {PROBLEMS.map((p) => (
            <div key={p.n} className="bg-[var(--color-bg)] p-8">
              <div className="flex items-center justify-between">
                <span className="tabular text-4xl text-[var(--color-gold)] opacity-80">
                  {p.n}
                </span>
                <span className="text-utility text-[var(--color-muted)]">{p.tag}</span>
              </div>
              <h3 className="font-display mt-6 text-2xl">{p.title}</h3>
              <p className="mt-3 text-[var(--color-muted)]">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-[88rem] px-6 py-24 lg:px-10">
          <p className="text-utility text-[var(--color-gold)]">How it works</p>
          <h2 className="display-md font-display mt-4 max-w-3xl">
            Three steps. Then it never asks for your attention again.
          </h2>
          <div className="mt-14 grid gap-12 md:grid-cols-3">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.n}>
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--color-gold)] text-[var(--color-gold)]">
                      <Icon size={20} />
                    </span>
                    <span className="tabular text-sm text-[var(--color-muted)]">
                      STEP {s.n}
                    </span>
                  </div>
                  <h3 className="font-display mt-6 text-2xl">{s.title}</h3>
                  <p className="mt-3 text-[var(--color-muted)]">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What you can automate ────────────────────────────── */}
      <section id="automate" className="mx-auto max-w-[88rem] px-6 py-24 lg:px-10">
        <p className="text-utility text-[var(--color-muted)]">The building blocks</p>
        <h2 className="display-md font-display mt-4 max-w-3xl">
          Everything you do in Nomba, now something an app can do for you.
        </h2>

        <h3 className="text-utility mt-16 text-[var(--color-gold)]">
          Triggers — what starts a flow
        </h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {TRIGGERS.map((c) => (
            <Capability key={c.title} {...c} />
          ))}
        </div>

        <h3 className="text-utility mt-14 text-[var(--color-gold)]">
          Actions — what Charon does
        </h3>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map((c) => (
            <Capability key={c.title} {...c} />
          ))}
        </div>

        <h3 className="text-utility mt-14 text-[var(--color-gold)]">
          Look-ups — answers on demand
        </h3>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {LOOKUPS.map((c) => (
            <Capability key={c.title} {...c} />
          ))}
        </div>
      </section>

      {/* ── Recipes ──────────────────────────────────────────── */}
      <section
        id="recipes"
        className="border-y border-[var(--color-border)] bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-[88rem] px-6 py-24 lg:px-10">
          <p className="text-utility text-[var(--color-gold)]">Recipes</p>
          <h2 className="display-md font-display mt-4 max-w-3xl">
            Point A to point B. Charon carries the money across.
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {RECIPES.map((r) => (
              <div key={r.tag} className="card rounded-lg p-8">
                <span className="text-utility text-[var(--color-gold)]">{r.tag}</span>
                <div className="mt-6 flex items-start gap-4">
                  <span className="text-utility mt-1 shrink-0 text-[var(--color-muted)]">
                    When
                  </span>
                  <p className="text-lg">{r.when}</p>
                </div>
                <div className="my-4 ml-[3.5rem] h-6 w-px bg-[var(--color-border)]" />
                <div className="flex items-start gap-4">
                  <span className="text-utility mt-1 shrink-0 text-[var(--color-accent-2)]">
                    Then
                  </span>
                  <p className="text-lg">{r.then}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[88rem] px-6 py-20 lg:px-10">
        <div className="grid gap-px overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-border)] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[var(--color-bg)] p-8 text-center">
              <div className="tabular text-5xl text-coin">{s.value}</div>
              <div className="mt-3 text-[var(--color-muted)]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section id="get-started" className="mx-auto max-w-[88rem] px-6 py-28 text-center lg:px-10">
        <h2 className="display-lg font-display mx-auto max-w-4xl">
          Ready to let your money <span className="text-coin">run itself</span>?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-xl text-[var(--color-muted)]">
          Connect your Nomba account and build your first automation in minutes.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={ZAPIER_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-coin"
          >
            Add Nomba to Zapier <ArrowRight size={16} />
          </a>
          <a href="#automate" className="btn-outline">
            Explore the building blocks
          </a>
        </div>
        <p className="mx-auto mt-6 max-w-lg text-utility text-[var(--color-muted)]">
          Charon is a Zapier integration for Nomba. Bring your Nomba API keys — we
          handle the rest.
        </p>
      </section>
    </>
  );
}

function Capability({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <div className="card rounded-lg p-6">
      <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-gold)]">
        <Icon size={18} />
      </span>
      <h4 className="font-display mt-5 text-xl">{title}</h4>
      <p className="mt-2 text-[var(--color-muted)]">{body}</p>
    </div>
  );
}
