// Contact details come from env so no phone number is ever hard-coded.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
export const WHATSAPP_URL = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : `${process.env.NEXT_PUBLIC_APP_URL || ""}/contact`;
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "info@bookmyglobal.com";
export const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE || (WHATSAPP_NUMBER ? `+${WHATSAPP_NUMBER}` : "");

// Business identity shown in the legal pages. Set these to your registered details.
export const COMPANY_NAME = process.env.NEXT_PUBLIC_COMPANY_NAME || "BookMyGlobal";
export const COMPANY_ADDRESS = process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "";
export const GRIEVANCE_OFFICER = process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER || "";
