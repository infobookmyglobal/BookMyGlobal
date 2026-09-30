import type { Metadata } from "next";
import { Sora, DM_Sans, Geist_Mono, Newsreader } from "next/font/google";
// Must be the server-component ClerkProvider from @clerk/nextjs: it is what enables Clerk keyless mode in development.
import { ClerkProvider } from "@clerk/nextjs";
import { CMSProvider } from "@/components/CMSProvider";
import { OrganizationJsonLd } from "@/components/JsonLd";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const dmSans = DM_Sans({ variable: "--font-dmsans", subsets: ["latin"], weight: ["400", "500", "700"] });
const newsreader = Newsreader({ variable: "--font-newsreader", subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "500", "600", "700"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bookmyglobal.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "BookMyGlobal — Visas, Flights, Hotels, Tours & More",
    template: "%s | BookMyGlobal",
  },
  description:
    "BookMyGlobal is your one-stop travel platform: document attestation, visas, flights, hotels, tours, cruises, international bus travel and yoga retreats in Rishikesh.",
  openGraph: {
    type: "website",
    siteName: "BookMyGlobal",
    url: APP_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable} ${geistMono.variable} ${newsreader.variable}`}>
      <body className="bmg min-h-screen bg-surface text-on-surface font-sans antialiased">
        <ClerkProvider>
          <CMSProvider>
            <OrganizationJsonLd />
            {children}
          </CMSProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
