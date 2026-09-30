import { PenLine } from "lucide-react";

export function AuthorBox({
  name = "BookMyGlobal Editorial Team",
  role = "Travel & documentation desk",
  bio = "We write about visas, attestation, travel planning and Rishikesh for travellers from India. Rules change, so always check the official source before you act.",
}: { name?: string; role?: string; bio?: string }) {
  return (
    <div className="mt-space-xl flex gap-space-md rounded-2xl bg-surface-container-low p-space-lg">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container/50 text-secondary">
        <PenLine className="h-5 w-5" />
      </span>
      <div>
        <p className="font-eyebrow text-eyebrow uppercase tracking-wider text-secondary">Written by</p>
        <p className="font-title-md text-title-md text-primary">{name}</p>
        <p className="font-label-sm text-label-sm text-on-surface-variant">{role}</p>
        <p className="mt-2 font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{bio}</p>
      </div>
    </div>
  );
}
