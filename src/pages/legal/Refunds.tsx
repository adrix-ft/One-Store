import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Refunds() {
  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-900 font-sans selection:bg-zinc-200">
      <Helmet>
        <title>Refund Policy | Only Store</title>
        <meta name="description" content="Only Store's refund and dispute resolution policy for P2P transactions." />
      </Helmet>
      <main className="max-w-3xl mx-auto px-6 py-24">
        <Link to="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Refund Policy</h1>
        <p className="text-sm text-zinc-500 mb-12">Last updated: September 2026</p>
        
        <div className="space-y-8 text-zinc-600 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. No Escrow, No Central Processing</h2>
            <p>
              Only Store provides software infrastructure for independent sellers. All transactions initiated on our platform are 
              <strong> Direct Peer-to-Peer (P2P) UPI payments</strong> where buyers pay sellers directly into their respective bank accounts. 
              Because Only Store never holds funds in escrow and does not act as a payment processor, <strong>Only Store cannot issue, mandate, or process refunds.</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Buyer-Seller Resolution</h2>
            <p>
              All refund requests must be handled directly between the buyer and the seller. If a digital game key is defective, 
              already redeemed, or otherwise invalid, buyers must contact the seller's support channels directly. Sellers operating 
              on Only Store are expected to maintain their own refund and replacement policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Fraudulent Seller Behavior</h2>
            <p>
              While Only Store cannot refund payments, we strictly enforce seller quality. If a seller repeatedly fails to deliver 
              valid keys or refuses legitimate replacements, buyers can report the storefront to <code>support@onlystore.gg</code>. 
              Upon investigation, Only Store reserves the right to permanently terminate the seller's access to the infrastructure.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
