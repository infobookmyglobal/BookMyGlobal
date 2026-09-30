import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getTracking } from "@/lib/shipglobal";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate the user either owns the application or is an admin
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: { application: true },
  });

  if (!shipment) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  if (shipment.application.userId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!shipment.awbNumber) {
    return NextResponse.json({ status: "pending", events: [] });
  }

  try {
    const trackingInfo = await getTracking(shipment.awbNumber);
    return NextResponse.json(trackingInfo);
  } catch (error: any) {
    console.error("Tracking API failed:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tracking details" }, { status: 500 });
  }
}
