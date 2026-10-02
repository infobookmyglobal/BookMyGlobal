import type { Metadata, Viewport } from "next";
import { Sora, DM_Sans, Geist_Mono, Newsreader } from "next/font/google";
// Must be the server-component ClerkProvider from @clerk/nextjs: it is what enables Clerk keyless mode in development.
import { ClerkProvider } from "@clerk/nextjs";
import { CMSProvider } from "@/components/CMSProvider";
import { OrganizationJsonLd, LocalBusinessJsonLd, SiteLinksSearchBoxJsonLd } from "@/components/JsonLd";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["400", "600", "700", "800"], display: "swap" });
const dmSans = DM_Sans({ variable: "--font-dmsans", subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "500", "600", "700"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bookmyglobal.com";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1329" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "BookMyGlobal — Visas, Flights, Hotels, Tours & More",
    template: "%s | BookMyGlobal",
  },
  description:
    "BookMyGlobal is your one-stop travel platform: document attestation, visas, flights, hotels, tours, cruises, international bus travel and yoga retreats in Rishikesh.",
  keywords: ["visa assistance India", "MEA attestation", "apostille service", "yoga retreat Rishikesh", "international flights India", "travel booking India"],
  authors: [{ name: "BookMyGlobal", url: APP_URL }],
  creator: "BookMyGlobal",
  publisher: "BookMyGlobal",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    siteName: "BookMyGlobal",
    url: APP_URL,
    locale: "en_IN",
    images: [{ url: `${APP_URL}/og-home.jpg`, width: 1200, height: 630, alt: "BookMyGlobal — Visas, Flights, Hotels, Tours & More" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@BookMyGlobal",
    creator: "@BookMyGlobal",
  },
  alternates: {
    canonical: APP_URL,
    languages: { "en-IN": APP_URL },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${sora.variable} ${dmSans.variable} ${geistMono.variable} ${newsreader.variable}`}>
      <body className="bmg min-h-screen bg-surface text-on-surface font-sans antialiased overflow-x-hidden">
        <ClerkProvider>
          <CMSProvider>
            <OrganizationJsonLd />
            <LocalBusinessJsonLd />
            <SiteLinksSearchBoxJsonLd />
            {children}
          </CMSProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

