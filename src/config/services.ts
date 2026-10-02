// Single source of truth for the nine BookMyGlobal verticals.
// Used by the header mega-menu, footer, homepage bento, /services hub and /services/[slug].

export type ServiceIcon =
  | "visa" | "attestation" | "flights" | "hotels" | "tours" | "cruises" | "bus" | "yoga" | "community";

export interface ServiceFaq { q: string; a: string }

export interface Service {
  slug: string;
  pillar: string;             // "01"
  title: string;
  kicker: string;             // small caps label on cards
  summary: string;            // 1-2 sentences for cards
  icon: ServiceIcon;
  enquiryType: string;        // matches /api/enquiries types
  indiaOnly?: boolean;
  href: string;               // where the card links
  // Detail page content (only for services that use /services/[slug])
  detail?: {
    intro: string;
    included: string[];
    steps: { title: string; text: string }[];
    needs: string[];
    goodToKnow: string;
    faqs: ServiceFaq[];
    related: string[];
  };
}

export const SERVICES: Service[] = [
  {
    slug: "visa-assistance",
    pillar: "01",
    title: "Visa Application Assistance",
    kicker: "Documents",
    summary:
      "Guidance through visa applications from India: the right visa type, a checklist for your profile, form review and appointment support.",
    icon: "visa",
    enquiryType: "VISA",
    indiaOnly: true,
    href: "/services/visa-assistance",
    detail: {
      intro:
        "Visa paperwork is rarely difficult, it is just unforgiving about small mistakes. We help travellers applying from India work out which visa they need, prepare the application and supporting documents properly, and line up appointments where a consulate or visa centre asks for one.",
      included: [
        "Help choosing the right visa type for your trip",
        "A document checklist matched to your profile",
        "Review of your application form before it is submitted",
        "Support with booking biometric or interview appointments",
        "Guidance on itineraries, cover letters and proof of funds",
        "Follow-up support until the consulate responds",
      ],
      steps: [
        { title: "Tell us about the trip", text: "Destination, dates, purpose of travel and who is travelling." },
        { title: "Get your checklist", text: "We send the documents and forms that apply to your case." },
        { title: "Share and review", text: "You upload documents; we check them for gaps and inconsistencies." },
        { title: "Apply with confidence", text: "We support submission and appointments, then help you track the outcome." },
      ],
      needs: [
        "A passport with enough validity for the destination's rules",
        "Travel dates and a draft itinerary",
        "Proof of funds, employment or study as the consulate requires",
        "Recent photographs to the consulate's specification",
      ],
      goodToKnow:
        "BookMyGlobal is a private travel services company. We are not an embassy or a government body and we cannot guarantee a visa. The decision, processing time and official fees are set by the destination country, and official fees are separate from our service fee.",
      faqs: [
        { q: "Can you guarantee my visa?", a: "No. Only the destination country's authorities decide. What we do is reduce avoidable mistakes so your application is complete and consistent." },
        { q: "When should I start?", a: "As soon as your dates are firm. Many countries accept applications only within a window before travel, so check the official rules for your destination and tell us your dates early." },
        { q: "Which countries do you support?", a: "Send us an enquiry with your destination and we will confirm whether we can help and what the process looks like." },
      ],
      related: ["attestation", "flights", "hotels"],
    },
  },
  {
    slug: "attestation",
    pillar: "02",
    title: "MEA & Embassy Attestation",
    kicker: "Documents",
    summary:
      "Support with MEA apostille and attestation, and embassy legalisation where required, so your Indian documents are accepted abroad.",
    icon: "attestation",
    enquiryType: "ATTESTATION",
    indiaOnly: true,
    href: "/services/attestation",
    detail: {
      intro:
        "Documents issued in India usually have to be authenticated before another country will accept them. India has been a member of the Hague Apostille Convention since 2005, so for member countries an apostille from the Ministry of External Affairs is enough. For other countries the documents are attested and then legalised by that country's embassy. We work out which route applies and help you through it.",
      included: [
        "Confirming whether apostille or attestation applies to your destination",
        "A checklist of originals, notarisation and any prior attestations",
        "Coordination of the MEA apostille or attestation step",
        "Support with embassy legalisation where the destination requires it",
        "Courier and status updates while your documents are in process",
        "Guidance on translations if the destination asks for them",
      ],
      steps: [
        { title: "Tell us the document and destination", text: "Degree, marriage certificate, police clearance, affidavit or something else, and where it is going." },
        { title: "We confirm the route", text: "Apostille or attestation, plus any steps that must happen first." },
        { title: "Submission", text: "Your documents go through the authorised channels with the right supporting papers." },
        { title: "Delivery", text: "Authenticated documents come back to you with tracking." },
      ],
      needs: [
        "The original documents (we will tell you which ones)",
        "A copy of your passport",
        "The destination country and the purpose (study, work, family, business)",
        "Any earlier attestations your document may need first",
      ],
      goodToKnow:
        "The Ministry of External Affairs authenticates the signature and seal on a document, not its contents. Rules, fees and turnaround are set by the authorities and can change, so we confirm the current position for your case when you enquire.",
      faqs: [
        { q: "What is the difference between apostille and attestation?", a: "An apostille is a single certificate accepted by countries that are members of the Hague Convention. For non-member countries, documents are attested by the MEA and then legalised by the destination country's embassy." },
        { q: "How long does it take?", a: "It depends on the document type and the authorities' turnaround. We give you an estimate for your specific case." },
        { q: "Do I need to send originals?", a: "Usually yes. When you enquire we tell you exactly which originals and copies are needed." },
      ],
      related: ["visa-assistance", "flights", "hotels"],
    },
  },
  {
    slug: "flights",
    pillar: "03",
    title: "Flight Booking",
    kicker: "Bookings",
    summary:
      "Search and book flights worldwide, with your other travel documents already in the same account.",
    icon: "flights",
    enquiryType: "FLIGHT",
    href: "/services/flights",
    detail: {
      intro:
        "Tell us where you are going and when, and we come back with options that suit your dates and budget. Your tickets, and the documents that go with the trip, stay together in one account.",
      included: [
        "Options across airlines for your route and dates",
        "Plain-language explanation of fare rules and baggage",
        "One-way, return and multi-city itineraries",
        "Group and family bookings",
        "Help with changes and cancellations within airline rules",
        "E-tickets and itineraries kept in your dashboard",
      ],
      steps: [
        { title: "Share your route", text: "Cities, dates, number of travellers and any preferences." },
        { title: "Compare options", text: "We send fares and conditions side by side." },
        { title: "Confirm and pay", text: "You see the full total before you pay." },
        { title: "Travel with your documents", text: "Tickets and trip details sit in your account." },
      ],
      needs: [
        "Names exactly as they appear on each traveller's passport",
        "Route, dates and preferred timings",
        "A contact email and phone number",
        "Passport validity and visa status for international trips",
      ],
      goodToKnow:
        "Fares, taxes and change fees are set by airlines and can vary by the hour. We confirm the total before you pay, and cancellation or change terms follow the airline's fare rules.",
      faqs: [
        { q: "Can I book for a group?", a: "Yes. Tell us the number of travellers and we will ask the airlines about group options." },
        { q: "Can I change a ticket later?", a: "Changes depend on the fare you choose. We explain the change and refund rules before you confirm." },
        { q: "Do you also help with the visa?", a: "Yes. Visa and attestation support sits in the same account, so you can plan both together." },
      ],
      related: ["hotels", "visa-assistance", "tours"],
    },
  },
  {
    slug: "hotels",
    pillar: "04",
    title: "Hotel Booking",
    kicker: "Bookings",
    summary:
      "From budget stays to resorts: book your room alongside everything else for the trip.",
    icon: "hotels",
    enquiryType: "HOTEL",
    href: "/services/hotels",
    detail: {
      intro:
        "Whether you need a simple room near the airport or a week at a resort, share what matters to you and we will shortlist stays that fit. Your hotel confirmations live next to your flights and documents.",
      included: [
        "Shortlists by budget, area and style of stay",
        "Clear explanation of room types, meals and cancellation terms",
        "Family, group and long-stay options",
        "Confirmation vouchers kept in your dashboard",
        "Help adjusting a booking when your plans change",
        "Pairing your stay with flights, tours or a visa",
      ],
      steps: [
        { title: "Tell us what you need", text: "Destination, dates, guests, budget and must-haves." },
        { title: "Review the shortlist", text: "Options with prices and conditions in one place." },
        { title: "Confirm", text: "You see the total and the cancellation terms before you pay." },
        { title: "Check in", text: "Your voucher is in your account when you travel." },
      ],
      needs: [
        "Destination and check-in and check-out dates",
        "Number of guests and rooms",
        "Budget range and preferences",
        "Guest names for the booking",
      ],
      goodToKnow:
        "Room rates and cancellation terms are set by each property. We show them before you confirm, and taxes or local charges collected at the hotel are noted where the property lists them.",
      faqs: [
        { q: "Can you find something for a large family?", a: "Yes. Tell us the guests and ages and we will look for rooms or apartments that work." },
        { q: "What if my plans change?", a: "It depends on the rate you choose. We explain the terms up front and help you adjust within them." },
        { q: "Can I book hotels and flights together?", a: "Yes, they sit in the same account." },
      ],
      related: ["flights", "tours", "cruises"],
    },
  },
  {
    slug: "tours",
    pillar: "05",
    title: "Tours & Activities",
    kicker: "Bookings",
    summary:
      "Day trips, experiences and things to do at your destination, powered by Viator and booked through us.",
    icon: "tours",
    enquiryType: "TOURS",
    href: "/services/tours",
    detail: {
      intro:
        "Once you know where you are staying, the next question is what to do there. We connect you to tours and activities through partners like Viator, so you can book experiences in the same place as the rest of your trip.",
      included: [
        "City tours, day trips and skip-the-line entries where available",
        "Food, culture and adventure experiences",
        "Options for families, couples and groups",
        "Booking through partners such as Viator",
        "Vouchers stored with your trip",
        "Ideas for filling a free day at your destination",
      ],
      steps: [
        { title: "Pick a destination", text: "Tell us where you are going and what you enjoy." },
        { title: "Choose experiences", text: "We suggest activities with what is included and what is not." },
        { title: "Book", text: "Confirm the ones you like, with the terms shown up front." },
        { title: "Go", text: "Show your voucher on the day." },
      ],
      needs: [
        "Destination and dates",
        "Number and ages of travellers",
        "Interests and how active you would like to be",
        "Budget per person",
      ],
      goodToKnow:
        "Tours and activities are operated by third-party providers. Availability, inclusions and cancellation rules are theirs and are shown before you book.",
      faqs: [
        { q: "Who operates the tours?", a: "Independent operators listed through partners such as Viator. The operator's terms are shown before you confirm." },
        { q: "Can I book after I arrive?", a: "Often yes, but popular experiences sell out. Booking ahead is safer." },
        { q: "Can I add tours to a hotel booking?", a: "Yes. Everything sits in the same account." },
      ],
      related: ["hotels", "flights", "cruises"],
    },
  },
  {
    slug: "cruises",
    pillar: "06",
    title: "Cruise Travel",
    kicker: "Bookings",
    summary:
      "Cruise itineraries and cabin bookings for travellers who would rather just float by.",
    icon: "cruises",
    enquiryType: "CRUISE",
    href: "/services/cruises",
    detail: {
      intro:
        "A cruise takes care of the transport, the meals and the hotel in one go, but choosing the right ship, cabin and itinerary takes some care. Tell us how you like to travel and we will help you compare.",
      included: [
        "Itinerary comparison across cruise lines and regions",
        "Cabin type guidance (inside, ocean view, balcony, suite)",
        "Explanation of what the fare includes and what costs extra",
        "Family and group bookings",
        "Pre- and post-cruise flights and hotels",
        "Visa and document guidance for ports on your route",
      ],
      steps: [
        { title: "Share your idea", text: "Region, month, number of nights and who is travelling." },
        { title: "Compare itineraries", text: "We shortlist ships and cabins with clear inclusions." },
        { title: "Confirm", text: "You see the total and the payment schedule." },
        { title: "Prepare", text: "We help with flights, hotels and any documents you need." },
      ],
      needs: [
        "Preferred region and travel month",
        "Number of nights and travellers",
        "Cabin preference and budget",
        "Passport validity for the whole voyage",
      ],
      goodToKnow:
        "Cruise fares usually exclude port charges, gratuities, excursions and drinks packages unless stated. We point these out before you book.",
      faqs: [
        { q: "Do I need a visa for cruise ports?", a: "It depends on the ports and your passport. We help you check before you book." },
        { q: "Can you book flights to the port?", a: "Yes. We can put flights and a pre-cruise hotel in the same plan." },
        { q: "Are cruises good for families?", a: "Many are. Tell us the ages of the children and we will look at family-friendly ships." },
      ],
      related: ["flights", "hotels", "visa-assistance"],
    },
  },
  {
    slug: "international-bus",
    pillar: "07",
    title: "International Bus Booking",
    kicker: "Bookings",
    summary:
      "Cross-border bus routes for the trips where a flight is overkill and a bus gets you there.",
    icon: "bus",
    enquiryType: "BUS",
    href: "/services/international-bus",
    detail: {
      intro:
        "For some journeys a bus is the sensible choice: shorter distances, city-centre to city-centre, and often a lower fare. Tell us the route and we will look at what is available and what you need to cross the border.",
      included: [
        "Cross-border routes where operators run them",
        "Timetable and fare comparison",
        "Seat and luggage rules explained",
        "Guidance on the documents needed at the border",
        "Onward hotel or flight connections",
        "Tickets kept in your dashboard",
      ],
      steps: [
        { title: "Tell us the route", text: "Where from, where to, and when." },
        { title: "Compare operators", text: "We list timings, fares and conditions." },
        { title: "Book", text: "Confirm the seats you want." },
        { title: "Cross the border", text: "Carry the documents we list for you." },
      ],
      needs: [
        "Route and travel date",
        "Number of passengers and names as on passports",
        "Passport and any visa for the country you are entering",
        "Luggage details",
      ],
      goodToKnow:
        "Availability depends on the route and operator. Border rules and required documents are set by the countries involved and can change, so check them before you travel.",
      faqs: [
        { q: "Which routes do you cover?", a: "It depends on operators. Send us your route and we will tell you what is available." },
        { q: "Do I need a visa?", a: "For most border crossings you do, depending on your passport. We can help with that too." },
        { q: "Can I book return tickets?", a: "Where the operator offers them, yes." },
      ],
      related: ["visa-assistance", "hotels", "flights"],
    },
  },
  {
    slug: "yoga-retreats",
    pillar: "08",
    title: "Yoga Retreats in Rishikesh",
    kicker: "Our own",
    summary:
      "Retreats in Rishikesh run directly by BookMyGlobal, not resold. Choose the Foundation or Immersion programme.",
    icon: "yoga",
    enquiryType: "RETREAT",
    href: "/yoga-retreats",
  },
  {
    slug: "community",
    pillar: "09",
    title: "Traveler Community",
    kicker: "Together",
    summary:
      "A meetup and social space for people who travel: find who is nearby, swap notes, plan together.",
    icon: "community",
    enquiryType: "COMMUNITY",
    href: "/community",
  },
];

export const SLUG_ALIASES: Record<string, string> = {
  "mea-attestation": "attestation",
  "flight-booking": "flights",
  "tours-activities": "tours",
  "hotel-booking": "hotels",
  "cruise-packages": "cruises",
  "bus": "international-bus",
};

export const getService = (slug: string) => {
  const normalized = SLUG_ALIASES[slug] || slug;
  return SERVICES.find((s) => s.slug === normalized);
};

export const DETAIL_SERVICES = SERVICES.filter((s) => s.detail);

