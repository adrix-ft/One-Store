import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { CheckCircle2 } from "lucide-react";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
      <Helmet>
        <title>Thank You | Only Store</title>
        <meta name="description" content="Your order was successful." />
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <div className="bg-white border border-zinc-200 rounded-2xl p-8 max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Payment Successful</h1>
        <p className="text-sm text-zinc-500 mb-8 text-center leading-relaxed">
          Your P2P UPI transaction has been verified. The seller has been notified and your digital key will be delivered shortly.
        </p>
        
        <Link to="/" className="w-full bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
}
