import type { Metadata } from "next";
import { Fraunces, EB_Garamond, DM_Mono } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
});
const garamond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-garamond",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Charon — put your money on autopilot",
  description:
    "Charon connects your Nomba account to the 8,000+ apps you already use. Payments record themselves, suppliers get paid automatically, and customers get payment links — with no code.",
  metadataBase: new URL("https://paywithcharon.xyz"),
  openGraph: {
    title: "Charon — put your money on autopilot",
    description:
      "Connect Nomba to the apps you already use. Payments, payouts and payment links that run themselves. No code.",
    url: "https://paywithcharon.xyz",
    siteName: "Charon",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${fraunces.variable} ${garamond.variable} ${dmMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <TopBar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
