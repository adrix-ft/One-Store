import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function Compliance() {
  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-900 font-sans selection:bg-zinc-200">
      <Helmet>
        <title>DPDP Compliance | OneStore</title>
        <meta name="description" content="OneStore's alignment with the Indian Digital Personal Data Protection (DPDP) Act of 2023." />
      </Helmet>
      <main className="max-w-3xl mx-auto px-6 py-24">
        <Link to="/" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mb-4">DPDP Compliance</h1>
        <p className="text-sm text-zinc-500 mb-12">Last updated: September 2026</p>
        
        <div className="space-y-8 text-zinc-600 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. DPDP Act 2023 Alignment</h2>
            <p>
              OneStore operates in strict alignment with the Digital Personal Data Protection (DPDP) Act, 2023 of India. 
              We act as a Data Fiduciary regarding the minimal seller account information we hold, and as a Data Processor 
              when facilitating key deliveries to buyers on behalf of our sellers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Principle of Data Minimization</h2>
            <p>
              We adhere strictly to data minimization. We do not collect non-essential telemetry, nor do we process 
              sensitive financial tokens (such as debit/credit card data), as all transactions are conducted externally via 
              user-operated P2P UPI applications.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Your Rights as a Digital Nagrik</h2>
            <p>
              Under the DPDP Act, you have the right to access, correct, and erase your personal data. 
              If you wish to view the data associated with your account, correct any inaccuracies, or request complete 
              erasure of your presence from our infrastructure, you may submit a request to our Data Protection Officer at 
              <code> privacy@onestore.gg</code>. We will fulfill these requests within the legally mandated timelines.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
