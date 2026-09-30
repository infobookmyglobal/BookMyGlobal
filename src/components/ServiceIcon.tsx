import {
  FileCheck2, Stamp, PlaneTakeoff, Building2, Ticket, Ship, Bus, Flower2, Users, type LucideProps,
} from "lucide-react";
import type { ServiceIcon as Kind } from "@/config/services";

const MAP = {
  visa: FileCheck2,
  attestation: Stamp,
  flights: PlaneTakeoff,
  hotels: Building2,
  tours: Ticket,
  cruises: Ship,
  bus: Bus,
  yoga: Flower2,
  community: Users,
} as const;

export function ServiceIcon({ kind, ...props }: { kind: Kind } & LucideProps) {
  const Icon = MAP[kind];
  return <Icon {...props} />;
}
