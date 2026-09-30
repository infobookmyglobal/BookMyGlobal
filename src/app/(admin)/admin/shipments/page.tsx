import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Truck, ExternalLink } from "lucide-react";

export default async function AdminShipmentsPage() {
  const shipments = await prisma.shipment.findMany({
    orderBy: { createdAt: "desc" },
    include: { application: true },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-sora font-black text-navy text-2xl">Shipments</h1>
        <p className="text-muted text-xs">Manage courier bookings and AWB labels for documents returned to customers.</p>
      </div>

      <div className="bg-white border border-border-custom rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-navy text-white text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">AWB / Courier</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Dispatched At</th>
                <th className="px-6 py-4">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-custom text-xs">
              {shipments.map((ship) => (
                <tr key={ship.id} className="hover:bg-bg-custom/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-navy">
                    <div>{ship.awbNumber || "PENDING"}</div>
                    <span className="text-[9px] text-muted uppercase font-bold tracking-wider">ShipGlobal Premium</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-navy">{ship.recipientName}</div>
                    <div className="text-[10px] text-muted">{ship.recipientPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-muted max-w-xs truncate" title={ship.recipientAddress}>
                    {ship.recipientAddress}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      ship.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      ship.status === 'dispatched' ? 'bg-blue/10 text-blue' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {ship.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {ship.dispatchedAt ? format(new Date(ship.dispatchedAt), "MMM dd, yyyy HH:mm") : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {ship.trackingUrl ? (
                      <a
                        href={ship.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue font-bold flex items-center gap-1 hover:underline"
                      >
                        Track <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted font-bold">
                    No physical shipments dispatched yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
