import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Twitter, Github, MessageCircle } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [hasConsent, setHasConsent] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && hasConsent) {
      console.log("Subscribing email:", email);
      alert("Thanks for subscribing!");
      setEmail("");
      setHasConsent(false);
    }
  };

  return (
    <footer className="bg-white border-t border-zinc-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* 1. Compliant Newsletter Block */}
        <div className="border-b border-zinc-200 pb-12 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-md">
            <h3 className="text-xl font-semibold text-zinc-900 mb-2 tracking-tight">Stay in the loop.</h3>
            <p className="text-sm text-zinc-500">Get platform updates, feature releases, and seller tips directly in your inbox.</p>
          </div>
          
          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm w-full sm:w-72 focus:outline-none focus:border-zinc-400 text-zinc-900 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!hasConsent}
                className="bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                Subscribe
              </button>
            </div>
            <label htmlFor="newsletter-consent" className="flex items-start gap-2 cursor-pointer mt-1">
              <input 
                type="checkbox" 
                id="newsletter-consent"
                required 
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="mt-1 rounded border-zinc-300 text-black focus:ring-black"
              />
              <span className="text-xs text-zinc-500 max-w-sm">
                I consent to receiving platform updates and acknowledge the <Link to="/privacy" className="text-zinc-900 underline hover:no-underline">Privacy Policy</Link>.
              </span>
            </label>
          </form>
        </div>

        {/* 2. Multi-Column Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 border-b border-zinc-200 pb-12">
          
          <div className="col-span-2 md:col-span-2 pr-8">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl tracking-tight flex items-baseline font-bold text-zinc-900">
                One<span className="text-zinc-400">Store</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              The compliant storefront infrastructure for independent game key sellers.
            </p>
            <div className="text-xs text-zinc-400 leading-relaxed">
              OneStore Technologies Pvt. Ltd.<br/>
              Koramangala 4th Block,<br/>
              Bengaluru, Karnataka 560034, India
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-4">Product</h4>
            <ul>
              <li><Link to="/#features" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">Features</Link></li>
              <li><Link to="/p2p-upi" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">P2P UPI</Link></li>
              <li><Link to="/pricing" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-4">Company</h4>
            <ul>
              <li><Link to="/about" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">About Us</Link></li>
              <li><a href="mailto:support@onestore.gg" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-4">Legal</h4>
            <ul>
              <li><Link to="/terms" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">Privacy Policy</Link></li>
              <li><Link to="/refunds" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">Refund Policy</Link></li>
              <li><Link to="/compliance" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">DPDP Compliance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-4">Connect</h4>
            <ul>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">
                  <span className="flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter</span>
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">
                  <span className="flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer block mb-3">
                  <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Discord/Community</span>
                </a>
              </li>
            </ul>
          </div>
          
        </div>
        
        {/* 3. Legal Disclaimers & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} OneStore. All rights reserved.</p>
          <p className="max-w-xl text-left md:text-right leading-relaxed">
            Not affiliated with, authorized by, or endorsed by Valve Corporation or Steam. All game titles, trademarks, and copyrights are the property of their respective owners.
          </p>
        </div>
        
      </div>
    </footer>
  );
}
