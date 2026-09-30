import { COMPANY_ADDRESS, COMPANY_NAME, GRIEVANCE_OFFICER, SUPPORT_EMAIL } from "@/lib/contact";

/**
 * Default text for the four legal pages. An admin can override any of them from
 * Admin → Pages by creating an active page with the same slug (terms, privacy,
 * refunds, disclaimer); the override is shown instead of this default.
 *
 * IMPORTANT: this is a reasonable starting draft, not legal advice. Have a lawyer
 * review it against how you actually operate before you launch.
 */
export const LEGAL_UPDATED = "21 September 2026";

export type LegalSlug = "terms" | "privacy" | "refunds" | "disclaimer";

export const LEGAL_SLUGS: LegalSlug[] = ["terms", "privacy", "refunds", "disclaimer"];

export function getLegalDefault(slug: LegalSlug): { title: string; intro: string; html: string } {
  const co = COMPANY_NAME;
  const mail = SUPPORT_EMAIL;
  const addr = COMPANY_ADDRESS ? `<p>Registered address: ${COMPANY_ADDRESS}</p>` : "";

  switch (slug) {
    case "terms":
      return {
        title: "Terms & Conditions",
        intro: `These terms apply when you use the ${co} website and services. Please read them before you make a request.`,
        html: `
<h2>1. Who we are and what we do</h2>
<p>${co} ("we", "us") is a private travel-services company based in India. Through this website we help you with visa application assistance, document attestation, flight, hotel, tour, cruise and international bus bookings, yoga retreats in Rishikesh, and a traveller community.</p>
${addr}

<h2>2. We are not a government body</h2>
<p>We are not an embassy, consulate, visa centre, government department or airline, and we are not affiliated with any of them. We prepare, check and submit your paperwork and arrange bookings on your behalf. Decisions such as whether a visa is granted or an attestation is accepted rest entirely with the relevant authority, and we cannot guarantee any outcome or timeline.</p>

<h2>3. Your account and the information you give us</h2>
<ul>
<li>You must be at least 18 years old, or use the service with a parent or guardian.</li>
<li>Details and documents you give us must be accurate, complete and genuine. We may decline or stop a request if we believe documents are false or altered.</li>
<li>Keep your login details safe. You are responsible for activity on your account.</li>
</ul>

<h2>4. How requests and fees work</h2>
<ul>
<li>For visa assistance and attestation, you first submit a request and your documents. We review it and quote a fee. You are only asked to pay once you have seen the fee.</li>
<li>Our service fee is separate from government, embassy, courier, translation and other third-party charges, unless we have clearly said the quote includes them.</li>
<li>Bookings (flights, hotels, tours, cruises, buses) are priced by the supplier and confirmed when we or the supplier say so.</li>
<li>Payments are processed by third-party payment providers. We do not store your card details.</li>
</ul>

<h2>5. Third-party suppliers</h2>
<p>Airlines, hotels, tour operators, cruise lines, bus operators and other suppliers have their own terms, cancellation rules and fares. Those terms apply to your booking, and we act as your agent in arranging it. We are not responsible for a supplier's delays, changes, cancellations or service failures, though we will help you with them where we can.</p>

<h2>6. Yoga retreats</h2>
<p>Retreats involve physical activity. You are responsible for judging whether you are fit to take part and for telling the organisers about anything relevant. Retreat details, dates and prices are as stated at the time of booking.</p>

<h2>7. Community conduct</h2>
<p>Be respectful. Do not post unlawful, abusive, misleading or spam content. We may remove content or accounts that break these rules.</p>

<h2>8. Limits on our liability</h2>
<p>To the extent the law allows, we are not liable for indirect or consequential loss, or for loss caused by a decision of a government authority, a supplier, events outside our reasonable control, or inaccurate information you provided. Our total liability for a request is limited to the service fee you paid us for it. Nothing in these terms limits liability that cannot lawfully be limited.</p>

<h2>9. Changes to these terms</h2>
<p>We may update these terms from time to time. The date at the top of this page shows when they were last changed. Continuing to use the service after a change means you accept the updated terms.</p>

<h2>10. Governing law</h2>
<p>These terms are governed by the laws of India. Courts in India having jurisdiction over our registered office will have jurisdiction over any dispute.</p>

<h2>11. Contact</h2>
<p>Questions about these terms? Email <a href="mailto:${mail}">${mail}</a>.</p>`,
      };

    case "privacy":
      return {
        title: "Privacy Policy",
        intro: `How ${co} collects, uses, shares and protects your personal data, in line with India's Digital Personal Data Protection Act, 2023.`,
        html: `
<h2>1. Who is responsible for your data</h2>
<p>${co} decides why and how your personal data is used, which makes us the "data fiduciary" under the Digital Personal Data Protection Act, 2023 ("DPDP Act").</p>
${addr}

<h2>2. What we collect</h2>
<ul>
<li><strong>Account details:</strong> name, email, phone number and country.</li>
<li><strong>Request details:</strong> the service you want, destination, travel plans and any notes you give us.</li>
<li><strong>Documents:</strong> files you upload, such as a passport, photograph or certificates. These can be sensitive, so we treat them carefully.</li>
<li><strong>Payment records:</strong> the amount, currency, provider and payment reference. Card and UPI details are handled by the payment provider, not by us.</li>
<li><strong>Enquiries:</strong> what you write to us through forms, email or WhatsApp.</li>
<li><strong>Technical data:</strong> basic logs (such as IP address and browser) needed to run and secure the site.</li>
</ul>

<h2>3. Why we use it</h2>
<ul>
<li>To provide the service you asked for: reviewing and submitting your paperwork, making bookings, taking payment and couriering documents.</li>
<li>To communicate with you about your request, including confirmations, questions and receipts.</li>
<li>To keep the platform secure, prevent fraud and meet legal and accounting obligations.</li>
<li>To send you journal updates or offers only if you have chosen to receive them. You can opt out at any time.</li>
</ul>

<h2>4. Who we share it with</h2>
<p>We only share what is needed, with:</p>
<ul>
<li><strong>Service providers that run the platform:</strong> for example sign-in (Clerk), cloud storage and hosting (Amazon Web Services), email delivery (Resend), payments (Razorpay, Stripe, PayPal) and courier (ShipGlobal and its carriers).</li>
<li><strong>Authorities and suppliers involved in your request:</strong> embassies, consulates, visa centres, airlines, hotels and tour operators, when we act on your behalf.</li>
<li><strong>Authorities</strong> where the law requires it.</li>
</ul>
<p>We do not sell your personal data.</p>

<h2>5. Where it is stored and how long we keep it</h2>
<p>Documents are stored in private cloud storage and are opened only through short-lived secure links. Some providers may process data outside India. We keep your data for as long as needed to deliver the service and to meet legal, tax and dispute-resolution requirements, and then delete or anonymise it.</p>

<h2>6. Security</h2>
<p>We use encryption in transit, access controls and private storage. No system is perfectly secure, so please use a strong, unique password.</p>

<h2>7. Your rights</h2>
<p>Under the DPDP Act you can ask us to give you a summary of the data we hold, correct or update it, erase it (unless we must keep it by law), withdraw consent, and nominate someone to exercise your rights if you cannot. Email <a href="mailto:${mail}">${mail}</a> and we will respond within a reasonable time.</p>

<h2>8. Children</h2>
<p>Our services are meant for adults. If a request is for a child, it must be made by a parent or guardian.</p>

<h2>9. Cookies</h2>
<p>We use cookies that are necessary for sign-in and security. We do not use them to sell advertising.</p>

<h2>10. Grievances</h2>
<p>${GRIEVANCE_OFFICER ? `Grievance officer: ${GRIEVANCE_OFFICER}. ` : ""}To raise a concern about how your data is handled, email <a href="mailto:${mail}">${mail}</a>. If you are not satisfied with our response you may approach the Data Protection Board of India.</p>

<h2>11. Changes</h2>
<p>We may update this policy. The date at the top shows the latest version.</p>`,
      };

    case "refunds":
      return {
        title: "Refund Policy",
        intro: "What you can expect if you cancel a request or a booking, and how to ask for a refund.",
        html: `
<h2>1. Our service fee</h2>
<ul>
<li>If you cancel before we have started work on your request, you get a full refund of our service fee.</li>
<li>If work has started (for example we have reviewed your documents or filled in forms), we keep a fair part of the fee for the work done and refund the rest. We will tell you the amount before we process it.</li>
<li>If we cannot take your request forward for a reason on our side, we refund our service fee in full.</li>
</ul>

<h2>2. Government, embassy and third-party fees</h2>
<p>Visa fees, embassy and attestation charges, courier costs and similar amounts are paid to other organisations. Once they have been paid or submitted they are generally not refundable, even if the outcome is not what you hoped for. We will tell you which parts of a quote are third-party charges.</p>

<h2>3. Bookings (flights, hotels, tours, cruises, buses)</h2>
<p>Cancellations and refunds follow the supplier's own rules and fare conditions, which we will share at the time of booking. Suppliers and payment providers may deduct their own charges. Our service fee for a booking is refundable only if we have not yet confirmed it.</p>

<h2>4. Yoga retreats</h2>
<p>Deposits, cancellation windows and transfer options are stated when you book. If a retreat is cancelled by us, you can choose a full refund or a move to another date.</p>

<h2>5. How to ask</h2>
<p>Email <a href="mailto:${mail}">${mail}</a> with your reference number and the reason. We aim to reply within a few working days. Approved refunds go back to the original payment method and can take about 7 to 10 working days to appear, depending on your bank or provider.</p>`,
      };

    case "disclaimer":
      return {
        title: "Disclaimer",
        intro: `Important information about what ${co} does and does not do.`,
        html: `
<h2>Private service, not a government body</h2>
<p>${co} is a private company. We are not an embassy, consulate, visa centre, government department or airline, and we are not endorsed by any of them. Nothing on this site is an official government communication.</p>

<h2>No guaranteed outcomes</h2>
<p>We help you prepare and submit applications and bookings. Visa decisions, attestation acceptance, appointment availability, processing times and fees are decided by the relevant authorities and can change without notice. We cannot guarantee any result or timeline.</p>

<h2>General information only</h2>
<p>Guides, blog posts and other content are for general information and may be out of date. Always check the official website of the relevant authority before you rely on it, especially for entry rules, documents required and fees.</p>

<h2>Travel and health</h2>
<p>Check government travel advisories and health requirements for your destination. Yoga and wellness activities are not medical treatment. Speak to your doctor before taking part if you have any health concerns.</p>

<h2>Third parties and links</h2>
<p>We arrange services provided by others and may link to their sites. We do not control them and are not responsible for their content or services.</p>

<h2>Contact</h2>
<p>Questions? Email <a href="mailto:${mail}">${mail}</a>.</p>`,
      };
  }
}
