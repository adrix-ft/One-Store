import { Database, QrCode, TrendingDown, ShieldCheck } from "lucide-react";

export default function BentoFeatures() {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto" id="features">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <Database className="w-6 h-6 text-zinc-900 mb-4" />
          <h3 className="font-semibold text-zinc-900 mb-1">Master Catalog</h3>
          <p className="text-sm text-zinc-500">Auto-syncs Steam art and data.</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <QrCode className="w-6 h-6 text-zinc-900 mb-4" />
          <h3 className="font-semibold text-zinc-900 mb-1">Direct UPI</h3>
          <p className="text-sm text-zinc-500">Buyers pay your bank directly.</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <TrendingDown className="w-6 h-6 text-zinc-900 mb-4" />
          <h3 className="font-semibold text-zinc-900 mb-1">Post-Paid Fees</h3>
          <p className="text-sm text-zinc-500">Sell now, settle commissions later.</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <ShieldCheck className="w-6 h-6 text-zinc-900 mb-4" />
          <h3 className="font-semibold text-zinc-900 mb-1">UTR Guard</h3>
          <p className="text-sm text-zinc-500">12-digit verification blocks fake receipts.</p>
        </div>

      </div>
    </section>
  );
}
