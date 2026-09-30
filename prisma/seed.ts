/**
 * Starter content: a few honest, India-specific journal posts and FAQs so the site
 * does not launch empty. Safe to re-run: posts are upserted by slug and FAQs are only
 * created when the FAQ table is empty. Edit or unpublish anything from the admin panel.
 *
 *   pnpm seed
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const AUTHOR = "system";

const POSTS = [
  {
    slug: "apostille-vs-attestation-india",
    title: "Apostille vs attestation: which one do your Indian documents need?",
    category: "Attestation",
    tags: "apostille, attestation, mea, documents",
    excerpt:
      "Both prove that an Indian document is genuine, but which one you need depends on where the document is going. Here is how to tell.",
    content: `
<p>If you are moving abroad to study, work or join family, another country will usually want proof that your Indian documents are genuine. That proof comes in two forms: an <strong>apostille</strong> or an <strong>attestation</strong>. They are easy to mix up, and getting it wrong costs time.</p>
<h2>The short version</h2>
<p>An apostille is a single certificate issued by India's Ministry of External Affairs (MEA). It is accepted by countries that are members of the Hague Apostille Convention, and India has been a member since 2005. For countries outside the convention, the document is attested by the MEA and then legalised by that country's embassy or consulate.</p>
<h2>How to decide</h2>
<ul>
<li><strong>Check the destination's status.</strong> Find out whether the country you are sending the document to accepts apostilles. The Hague Conference on Private International Law publishes the list of member countries.</li>
<li><strong>Ask the receiving body.</strong> A university, employer or immigration office will often tell you exactly what they need. Follow their wording.</li>
<li><strong>Look at the document type.</strong> Degrees, marriage certificates, police clearance certificates and affidavits can follow slightly different chains.</li>
</ul>
<h2>What usually comes first</h2>
<p>The MEA authenticates the signature and seal of an official, not the contents of the document. So many documents need an earlier step: verification by the issuing university or board, attestation by the state government, or notarisation for affidavits. The exact chain depends on the document, so confirm it before you start.</p>
<h2>Common mistakes</h2>
<ul>
<li>Sending photocopies when originals are required.</li>
<li>Getting a document apostilled when the destination needs embassy legalisation.</li>
<li>Skipping the state-level step and having the MEA reject the document.</li>
<li>Leaving translations until the end. Some countries want a certified translation, sometimes after the apostille.</li>
</ul>
<h2>A note on timelines and fees</h2>
<p>Government fees and turnaround times change, so treat any number you read online, including ours, as something to verify with the official source before you plan around it.</p>
<p>BookMyGlobal can help you work out the right route and coordinate the steps. We are a private company, not a government body, and the authorities make the final decision on every document.</p>
`,
  },
  {
    slug: "visa-application-checklist-indian-travellers",
    title: "A visa application checklist for Indian travellers",
    category: "Visas",
    tags: "visa, checklist, india, travel documents",
    excerpt:
      "Most visa refusals come down to gaps and inconsistencies, not bad luck. A practical checklist to go through before you apply.",
    content: `
<p>Every country has its own visa rules, but the documents that consulates ask for follow a familiar pattern. Use this list to get your application in order before you book appointments or pay any fees.</p>
<h2>Start with the official source</h2>
<p>Always begin with the embassy, consulate or official visa portal of the country you are visiting. Requirements, fees and processing times change, and third-party sites (including this one) can be out of date.</p>
<h2>The usual documents</h2>
<ul>
<li><strong>Passport.</strong> Many countries want validity well beyond your stay, often six months, and at least one or two blank pages. Check the exact rule.</li>
<li><strong>Photographs</strong> to the size and background specification given. Wrong specifications are a common reason for delay.</li>
<li><strong>Completed application form</strong> with details that match your passport exactly.</li>
<li><strong>Itinerary.</strong> Flights and accommodation plans. Many consulates advise against paying for non-refundable bookings before the visa is approved.</li>
<li><strong>Proof of funds.</strong> Recent bank statements and, where relevant, income tax returns.</li>
<li><strong>Proof of ties to India.</strong> Employment letter, business registration, enrolment letter or property documents.</li>
<li><strong>Travel insurance</strong>, where required.</li>
</ul>
<h2>Make everything consistent</h2>
<p>Dates, names, addresses and employer details should match across your form, cover letter and supporting documents. A different spelling of your name or an unexplained gap in employment is exactly what reviewers notice.</p>
<h2>Plan the timeline</h2>
<p>Many countries only accept applications within a window before travel, and biometric or interview appointments can be booked out for weeks in busy seasons. Work backwards from your travel date and start early.</p>
<h2>What no one can promise</h2>
<p>A visa is decided by the destination country. Nobody can guarantee approval, and you should be cautious of anyone who does. What good preparation can do is make sure a complete, consistent application reaches the officer.</p>
`,
  },
  {
    slug: "first-time-rishikesh-guide",
    title: "Rishikesh for first-timers: when to go and what to expect",
    category: "Rishikesh",
    tags: "rishikesh, yoga, retreat, travel tips",
    excerpt:
      "Known as the yoga capital of the world, Rishikesh rewards travellers who plan around the seasons and slow down.",
    content: `
<p>Rishikesh sits where the Ganges leaves the Himalayan foothills in Uttarakhand. It is known around the world for yoga and meditation, and it is a calm place to reset if you let it be.</p>
<h2>When to go</h2>
<ul>
<li><strong>February to April</strong> is generally pleasant and popular. The International Yoga Festival has traditionally been held in March.</li>
<li><strong>October to November</strong> is another comfortable window after the monsoon.</li>
<li><strong>The monsoon (roughly July to September)</strong> brings heavy rain, and river activities are typically paused. Landslides can affect roads, so leave buffer days.</li>
<li><strong>Summer (May to June)</strong> can be hot in the day, though mornings by the river are lovely.</li>
</ul>
<h2>Getting there</h2>
<p>Dehradun's Jolly Grant airport is the closest, roughly an hour or so from Rishikesh depending on traffic. Haridwar is the nearest major railway hub. Road conditions vary, so ask your host about the current situation.</p>
<h2>What to expect on a retreat</h2>
<p>A typical day starts early with asana and breathwork, followed by meals, rest, talks or study, and an evening practice. Food is usually simple and vegetarian, and many places in the main retreat areas are alcohol-free.</p>
<h2>What to pack</h2>
<ul>
<li>Light, comfortable clothing plus a warm layer for mornings and evenings</li>
<li>A yoga mat if you prefer your own</li>
<li>A reusable water bottle and any medicines you need</li>
<li>Modest clothing for temples and the river ghats</li>
</ul>
<h2>Come with the right expectations</h2>
<p>Rishikesh is a working town as well as a retreat destination, so expect traffic, crowds at peak times and a lot of choice in teachers and schools. A small-group retreat with a clear programme takes much of the guesswork out.</p>
<p>BookMyGlobal runs its own retreats in Rishikesh. If you would like the upcoming dates, send us an enquiry.</p>
`,
  },
  {
    slug: "planning-an-international-trip-from-india",
    title: "Planning an international trip from India: what to sort, and in what order",
    category: "Travel Tips",
    tags: "travel planning, visa, flights, hotels, india",
    excerpt:
      "The order you do things in matters. A simple sequence that avoids the classic mistakes, like booking flights before the visa is sorted.",
    content: `
<p>The stress in planning an international trip usually comes from doing the right things in the wrong order. Here is a sequence that works for most trips from India.</p>
<h2>1. Check your passport</h2>
<p>Look at the expiry date and the number of blank pages. Many countries expect your passport to be valid for months beyond your return date. Renewal takes time, so do this first.</p>
<h2>2. Find out whether you need a visa</h2>
<p>Check the official immigration page of your destination for Indian passport holders. Some countries offer visa-free entry, an e-visa or visa on arrival, while others need an embassy application with an appointment.</p>
<h2>3. Fix your dates and shape a draft itinerary</h2>
<p>Many visa applications ask for an itinerary. Draft one, but where you can, choose flexible or refundable bookings until the visa is approved.</p>
<h2>4. Apply for the visa</h2>
<p>Assemble documents, fill the form carefully and book any biometric or interview appointment. Leave a healthy margin for processing.</p>
<h2>5. Book flights and stays</h2>
<p>Once the visa is approved, or you know you do not need one, lock in flights and hotels. Compare total costs, not just the headline fare, and read the change and cancellation rules.</p>
<h2>6. Sort documents for the destination</h2>
<p>If you are travelling to study, work or settle, this is where apostille or attestation of your Indian documents comes in. Start early, because it involves several offices.</p>
<h2>7. Insurance, money and connectivity</h2>
<p>Buy travel insurance where it is required or sensible, carry a mix of payment options, and check how your phone will work abroad.</p>
<h2>8. Keep everything in one place</h2>
<p>Keep digital and printed copies of your passport, visa, tickets, hotel confirmations and insurance. Having them together saves a lot of stress at a check-in desk.</p>
`,
  },
];

const FAQS = [
  { question: "What does BookMyGlobal do?", answer: "We help travellers from India with visa application assistance, MEA and embassy attestation, flights, hotels, tours, cruises, international bus travel and yoga retreats in Rishikesh, all from one account.", category: "basics" },
  { question: "Are you a government body or an embassy?", answer: "No. BookMyGlobal is a private company. Visas and attestations are decided by the relevant authorities, and we cannot guarantee any outcome.", category: "basics" },
  { question: "How does a visa or attestation request work?", answer: "You sign in, tell us what you need and upload your documents. We review them and, if everything is in order, send you a quote. You pay after you have seen the price, and we then handle the next steps and keep you updated in your dashboard.", category: "process" },
  { question: "When do I pay?", answer: "For visa and attestation requests, after we have reviewed your request and sent you a quote. For bookings, you see the full total before you pay.", category: "payments" },
  { question: "Which payment methods do you accept?", answer: "UPI, cards and netbanking through Razorpay for payments in rupees, and cards or PayPal for other currencies, depending on what is enabled for your request.", category: "payments" },
  { question: "Are government or embassy fees included in your fee?", answer: "No. Official fees are set by the authorities and are separate from our service fee. We tell you about them up front.", category: "payments" },
  { question: "Can I get a refund?", answer: "Our refund policy explains what applies to each service. In general, government fees that have already been paid cannot be recovered. Read the Refund Policy page for details.", category: "payments" },
  { question: "How long does a request take?", answer: "It depends on the destination and the authorities' processing times. We give you an estimate for your specific case once we have reviewed it.", category: "process" },
  { question: "Are the Rishikesh yoga retreats run by you?", answer: "Yes. Unlike our partner-supplied bookings, the Rishikesh retreats are our own programmes. Send an enquiry for the next dates and fees.", category: "retreats" },
  { question: "How do you handle my personal data?", answer: "We collect only what is needed to handle your request, store documents securely and do not sell your data. Read the Privacy Policy for the full details.", category: "basics" },
];

async function main() {
  const now = Date.now();
  let i = 0;
  for (const p of POSTS) {
    const publishedAt = new Date(now - i * 24 * 60 * 60 * 1000);
    i += 1;
    await prisma.blog.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        content: p.content.trim(),
        excerpt: p.excerpt,
        category: p.category,
        tags: p.tags,
        status: "PUBLISHED",
        publishedAt,
        authorId: AUTHOR,
        seoTitle: `${p.title} | BookMyGlobal`,
        seoDescription: p.excerpt,
      },
    });
  }

  const faqCount = await prisma.fAQ.count();
  if (faqCount === 0) {
    await prisma.fAQ.createMany({ data: FAQS.map((f, idx) => ({ ...f, order: idx })) });
  }

  console.log(`Seeded ${POSTS.length} posts${faqCount === 0 ? ` and ${FAQS.length} FAQs` : " (FAQs already present, skipped)"}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
