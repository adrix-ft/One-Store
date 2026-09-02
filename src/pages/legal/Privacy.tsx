import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Privacy() {
  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-900 font-sans selection:bg-zinc-200">
      <Helmet>
        <title>Privacy Policy | Only Store</title>
        <meta name="description" content="Only Store's privacy policy and data protection guidelines." />
      </Helmet>
      <main className="max-w-3xl mx-auto px-6 py-24">
        <Link to="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-12">Last updated: September 2026</p>
        
        <div className="space-y-8 text-zinc-600 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Information We Collect</h2>
            <p>
              Only Store collects minimal data necessary to operate the storefront infrastructure. 
              For sellers, we collect email addresses, store profiles, and UPI IDs. 
              For buyers, we may collect email addresses exclusively for delivering digital goods (game keys) 
              post-purchase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Payment Data Independence</h2>
            <p>
              Only Store <strong>never collects, processes, or stores</strong> sensitive payment information such as credit card numbers, 
              CVCs, or banking passwords. All transactions utilize Direct P2P UPI routing. The only financial data processed 
              by our system is the public UPI ID provided by the seller and the UTR (Unique Transaction Reference) number submitted by the buyer to verify the transfer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. How We Use Your Data</h2>
            <p>
              Data is strictly used to facilitate the B2B2C transaction flow. We use seller emails for platform billing and updates. 
              We use buyer emails strictly to dispatch purchased digital goods. We do not sell, rent, or trade personal data to third parties under any circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Cookies and Local Storage</h2>
            <p>
              We use standard session cookies and local storage to maintain authentication states (e.g., keeping you logged in) 
              and to temporarily store shopping cart data on the client side. We do not use third-party tracking pixels for behavioral advertising.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
