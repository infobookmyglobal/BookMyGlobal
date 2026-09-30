import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getApiErrorMessage(response: Response): Promise<string> {
  const status = response.status;
  let rawText = "";
  try {
    rawText = await response.text();
  } catch {
    return `Server error (${status})`;
  }

  const trimmed = rawText.trim();

  // If HTML response is returned (e.g. Cloudflare error, Next.js error page, 404, 502, 504, etc.)
  if (trimmed.startsWith("<") || trimmed.includes("<!DOCTYPE") || trimmed.includes("<html")) {
    if (status === 401 || status === 403) {
      return "Session expired or unauthorized. Please refresh or log in again.";
    }
    if (status === 404) {
      return "Requested API endpoint was not found (404).";
    }
    if (status === 502 || status === 504 || status === 524) {
      return "Server timeout or gateway error (Cloudflare/Proxy error). Please try again shortly.";
    }
    return `Server returned an invalid HTML error page (${status}). Please try again later.`;
  }

  try {
    const data = JSON.parse(trimmed);
    if (data && typeof data.error === "string" && data.error) {
      return data.error;
    }
    if (data && typeof data.message === "string" && data.message) {
      return data.message;
    }
  } catch {
    if (trimmed.length < 150 && !trimmed.includes("<")) {
      return trimmed;
    }
  }

  return `Server error (${status})`;
}

const DEFAULT_AUTHOR = "BookMyGlobal Editorial Team";

export function getBlogAuthor(_seed?: string): string {
  return DEFAULT_AUTHOR;
}



