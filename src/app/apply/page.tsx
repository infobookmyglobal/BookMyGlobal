import type { Metadata } from "next";
import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Container, Eyebrow } from "@/components/site/ui";
import { ServiceApplicationForm } from "@/components/apply/ServiceApplicationForm";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Start a request | BookMyGlobal",
  description: "Tell us what you need: visa assistance or document attestation. We review first and quote a fee before any payment.",
};

export const dynamic = "force-dynamic";

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const defaultService = service?.toUpperCase() === "ATTESTATION" ? "ATTESTATION" : "VISA";
  const { userId } = await auth();

  let defaults = { fullName: "", email: "", phone: "", country: "" };
  if (userId) {
    const [clerkUser, dbUser] = await Promise.all([
      currentUser(),
      prisma.user.findUnique({ where: { clerkId: userId } }),
    ]);
    defaults = {
      fullName: dbUser?.name || [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" "),
      email: dbUser?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || "",
      phone: dbUser?.phone || "",
      country: dbUser?.country || "",
    };
  }

  const back = encodeURIComponent(`/apply?service=${defaultService}`);

  return (
    <>
      <Header />
      <main className="bg-surface-container-low pb-space-2xl pt-36">
        <Container narrow>
          <div className="mb-space-lg space-y-space-xs text-center">
            <Eyebrow>Start a request</Eyebrow>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight text-primary md:font-headline-lg md:text-headline-lg">
              Tell us what you need.
            </h1>
            <p className="mx-auto max-w-xl font-body-lg text-body-lg text-on-surface-variant">
              A few details now, documents next. We look it over and quote a fee before you pay anything.
            </p>
          </div>

          <div className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-xl md:p-space-xl">
            {userId ? (
              <ServiceApplicationForm defaultService={defaultService} defaults={defaults} />
            ) : (
              <div className="space-y-space-md py-space-lg text-center">
                <h2 className="font-headline-md text-headline-md text-primary">Create a free account to continue</h2>
                <p className="mx-auto max-w-md font-body-md text-body-md text-on-surface-variant">
                  An account lets you upload documents securely, see your status and pay online. It takes under a minute.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 pt-space-sm sm:flex-row">
                  <Link href={`/sign-up?redirect_url=${back}`} className="rounded-full bg-primary-container px-8 py-3 font-title-md text-on-primary hover:opacity-90">
                    Create account
                  </Link>
                  <Link href={`/sign-in?redirect_url=${back}`} className="rounded-full bg-surface-container px-8 py-3 font-title-md text-primary hover:bg-surface-container-high">
                    I already have one
                  </Link>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">
                  Just have a question? <Link href="/contact" className="underline hover:text-primary">Send us a message</Link> instead.
                </p>
              </div>
            )}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
