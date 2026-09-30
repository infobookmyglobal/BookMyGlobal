import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Package, MapPin } from "lucide-react";

const SERVICE_LABEL: Record<string, string> = {
  VISA: "Visa assistance",
  ATTESTATION: "Document attestation",
};

export default async function TrackingPage() {
  const { userId } = await auth();
  const user = await prisma.user.findUnique({
    where: { clerkId: userId! },
    include: {
      applications: {
        where: { shipment: { isNot: null } },
        include: { shipment: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const apps = user?.applications ?? [];
  const statusSteps = ["pending", "dispatched", "in_transit", "out_for_delivery", "delivered"];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-sora font-black text-navy text-2xl">Track shipment</h1>

      {apps.length === 0 ? (
        <div className="bg-white border border-border-custom rounded-2xl p-10 text-center">
          <Package className="w-12 h-12 text-muted mx-auto mb-3" />
          <p className="text-muted text-sm">
            Nothing has been shipped yet. When we courier your documents back to you, tracking shows up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => {
            const shipment = app.shipment!;
            const currentIdx = Math.max(0, statusSteps.indexOf(shipment.status));
            return (
              <div key={app.id} className="bg-white border border-border-custom rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-sora font-black text-navy">{SERVICE_LABEL[app.productType] || app.productType}</p>
                    <p className="text-xs text-muted">#{app.id.slice(-8).toUpperCase()}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue/10 text-blue">
                    {shipment.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {statusSteps.map((step, i) => (
                    <div key={step} className="flex items-center flex-1">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                          i <= currentIdx ? "bg-blue text-white" : "bg-gray-100 text-muted"
                        }`}
                      >
                        {i + 1}
                      </div>
                      {i < statusSteps.length - 1 && <div className={`flex-1 h-0.5 ${i < currentIdx ? "bg-blue" : "bg-gray-200"}`} />}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] font-bold text-muted">
                  {["Pending", "Dispatched", "In transit", "Out for delivery", "Delivered"].map((s) => (
                    <span key={s} className="text-center">{s}</span>
                  ))}
                </div>

                <div className="bg-bg-custom rounded-xl p-4 space-y-2 text-sm">
                  {shipment.awbNumber && (
                    <div className="flex justify-between">
                      <span className="text-muted font-bold">AWB number</span>
                      <span className="font-black font-mono">{shipment.awbNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted font-bold">Ship to</span>
                    <span className="font-bold">{shipment.recipientName}</span>
                  </div>
                  {shipment.trackingUrl && (
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-blue font-bold text-xs hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5" /> Track on the courier's website
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
