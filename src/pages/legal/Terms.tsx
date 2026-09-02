import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Terms() {
  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-900 font-sans selection:bg-zinc-200">
      <Helmet>
        <title>Terms of Service | Only Store</title>
        <meta name="description" content="Only Store's Terms of Service for game key sellers and buyers." />
      </Helmet>
      <main className="max-w-3xl mx-auto px-6 py-24">
        <Link to="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-sm text-zinc-500 mb-12">Last updated: September 2026</p>
        
        <div className="space-y-8 text-zinc-600 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Platform Role and Nature of Service</h2>
            <p>
              Only Store provides software infrastructure that allows independent game key sellers to create personal digital storefronts. 
              We are a strictly business-to-business-to-consumer (B2B2C) infrastructure provider. We are <strong>not the merchant of record</strong>, 
              we do not own the inventory, and we do not hold funds in escrow at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Peer-to-Peer (P2P) Transactions</h2>
            <p>
              All payments made through Only Store storefronts are routed directly from the buyer's bank account to the seller's bank account 
              via Peer-to-Peer (P2P) UPI. By using Only Store, both buyers and sellers acknowledge that Only Store has no control over, 
              nor liability for, the actual transfer of funds. 
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Seller Obligations</h2>
            <p>
              Sellers utilizing Only Store infrastructure must possess the legal right to distribute the digital keys they list. 
              Sellers are solely responsible for customer support, honoring refunds, and ensuring the validity of their digital goods. 
              Fraudulent behavior will result in immediate termination of the storefront and a permanent ban.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Platform Rent</h2>
            <p>
              Only Store operates on a pre-paid rent model. Sellers must pay a fixed recurring rent to keep their storefronts live. There are zero commission fees per transaction—sellers keep 100% of their direct sales. Failure to pay rent will result in the storefront being temporarily taken offline.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Disclaimer of Liability</h2>
            <p>
              Only Store is provided "as is" without warranties of any kind. We are not affiliated with, authorized by, or endorsed by 
              Valve Corporation, Steam, or any game publishers. All game titles, trademarks, and copyrights are the property of their respective owners.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
