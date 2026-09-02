import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types";
import { QRCodeSVG } from "qrcode.react";
import { generateUpiUri } from "../../lib/utils";
import { IndianRupee, Loader2, ArrowLeft } from "lucide-react";

type Profile = Database['public']['Tables']['seller_profiles']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'] & {
  master_games: Database['public']['Tables']['master_games']['Row'];
};

export default function Checkout() {
  const { listing_id } = useParams();
  const { profile } = useOutletContext<{ profile: Profile }>();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    discord: "",
    utr: ""
  });

  const [checks, setChecks] = useState({
    paid: false,
    matched: false
  });

  useEffect(() => {
    const fetchListing = async () => {
      if (!listing_id) return;
      const { data } = await supabase
        .from('listings')
        .select(`
          *,
          master_games (*)
        `)
        .eq('id', listing_id)
        .single();
        
      if (data) {
        setListing(data as any);
      }
      setLoading(false);
    };

    fetchListing();
  }, [listing_id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="w-32 h-6 bg-zinc-200 rounded mb-6"></div>
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row text-zinc-900">
          <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col">
            <div className="h-7 w-48 bg-zinc-200 rounded mb-6"></div>
            <div className="flex gap-4 mb-8">
              <div className="w-24 h-16 bg-zinc-200 rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-5 w-40 bg-zinc-200 rounded"></div>
                <div className="h-6 w-24 bg-zinc-200 rounded"></div>
              </div>
            </div>
            <div className="bg-zinc-50 p-6 rounded-xl flex-1 flex flex-col items-center justify-center">
              <div className="h-5 w-32 bg-zinc-200 rounded mb-6"></div>
              <div className="w-48 h-48 bg-zinc-200 rounded-lg mb-6"></div>
              <div className="h-5 w-48 bg-zinc-200 rounded"></div>
            </div>
          </div>
          <div className="w-full md:w-1/2 p-8 bg-zinc-50/50">
            <div className="h-7 w-48 bg-zinc-200 rounded mb-6"></div>
            <div className="space-y-4 mb-6">
              <div className="h-20 w-full bg-zinc-200 rounded-xl"></div>
              <div className="h-20 w-full bg-zinc-200 rounded-xl"></div>
              <div className="h-20 w-full bg-zinc-200 rounded-xl"></div>
            </div>
            <div className="h-12 w-full bg-zinc-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }
  if (!listing) return <div className="text-center py-12 text-red-400">Listing not found.</div>;
  if (profile.is_paused) return <div className="text-center py-12 text-red-400">Checkout is currently disabled for this store.</div>;

  // Assuming platform fee is a fixed percentage, e.g., 5%
  const commissionInr = Number((listing.price_inr * 0.05).toFixed(2));

  // Dummy order ID for QR note (we don't have real order ID until insert, but QR needs one)
  const tempOrderId = Math.random().toString(36).substring(2, 10).toUpperCase();

  const upiUri = generateUpiUri({
    payeeVpa: profile.upi_id,
    payeeName: profile.store_name,
    amount: listing.price_inr,
    orderId: tempOrderId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checks.paid || !checks.matched) {
      setError("Please confirm both checkboxes before submitting.");
      return;
    }

    if (!/^\d{12}$/.test(formData.utr)) {
      setError("UTR must be exactly 12 digits.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('orders')
        .insert([{
          seller_id: profile.id,
          listing_id: listing.id,
          buyer_email: formData.email,
          buyer_discord: formData.discord,
          amount_inr: listing.price_inr,
          commission_inr: commissionInr,
          utr_number: formData.utr,
          status: 'PENDING_APPROVAL'
        } as any]);

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error("This UTR number has already been submitted.");
        }
        throw insertError;
      }

      alert("Order submitted! The seller will approve it shortly.");
      navigate(`/${profile.store_slug}`);
    } catch (err: any) {
      setError(err.message || "Failed to submit order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {listing.master_games && (
        <Helmet>
          <title>{listing.master_games.title} - {profile.store_name} | Only Store</title>
          <meta name="description" content={`Buy ${listing.master_games.title} for ₹${listing.price_inr} at ${profile.store_name}.`} />
          <meta property="og:title" content={`${listing.master_games.title} - ${profile.store_name}`} />
          <meta property="og:description" content={`Buy ${listing.master_games.title} for ₹${listing.price_inr} at ${profile.store_name}.`} />
          <meta property="og:image" content={listing.master_games.header_image_url || listing.master_games.cover_image_url || ''} />
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:title" content={`${listing.master_games.title} - ${profile.store_name}`} />
          <meta property="twitter:description" content={`Buy ${listing.master_games.title} for ₹${listing.price_inr} at ${profile.store_name}.`} />
          <meta property="twitter:image" content={listing.master_games.header_image_url || listing.master_games.cover_image_url || ''} />
        </Helmet>
      )}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-zinc-500 hover:text-zinc-900 mb-6 transition-colors font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
      </button>

      <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row text-zinc-900">
        
        {/* Left Col: Order Summary & QR */}
        <div className="w-full md:w-1/2 p-8 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col">
          <h2 className="text-xl font-bold tracking-tight mb-6">Order Summary</h2>
          
          <div className="flex gap-4 mb-8">
            <img 
              src={listing.master_games?.header_image_url || ''} 
              alt={listing.master_games?.title}
              className="w-24 h-16 object-cover rounded-lg bg-zinc-100"
            />
            <div>
              <h3 className="font-semibold text-zinc-900 leading-snug">{listing.master_games?.title}</h3>
              <div className="text-zinc-900 font-bold flex items-center mt-1 text-lg">
                <IndianRupee className="w-4 h-4 mr-0.5 text-zinc-400" />
                {listing.price_inr}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center space-y-5 bg-zinc-50 p-8 rounded-xl border border-zinc-200">
            <p className="text-sm font-medium text-zinc-600 text-center">Scan with any UPI app to pay</p>
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
              <QRCodeSVG value={upiUri} size={200} />
            </div>
            <p className="text-xs text-zinc-500 font-mono text-center leading-relaxed">
              UPI ID: <span className="text-zinc-900 font-medium">{profile.upi_id}</span><br/>
              Name: <span className="text-zinc-900 font-medium">{profile.store_name}</span>
            </p>
          </div>
        </div>

        {/* Right Col: Submission Form */}
        <div className="w-full md:w-1/2 p-8 bg-white">
          <h2 className="text-xl font-bold tracking-tight mb-6">Confirm Payment</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(p => ({...p, email: e.target.value}))}
                className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900"
                placeholder="Where should the key be sent?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">Discord (Optional)</label>
              <input
                value={formData.discord}
                onChange={(e) => setFormData(p => ({...p, discord: e.target.value}))}
                className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900"
                placeholder="For faster support"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">12-Digit UTR Number *</label>
              <input
                required
                pattern="\d{12}"
                title="UTR must be exactly 12 digits"
                value={formData.utr}
                onChange={(e) => setFormData(p => ({...p, utr: e.target.value}))}
                className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900 font-mono tracking-wider"
                placeholder="123456789012"
              />
            </div>

            <div className="space-y-4 bg-zinc-50 p-5 rounded-xl border border-zinc-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 accent-black"
                  checked={checks.paid}
                  onChange={(e) => setChecks(p => ({...p, paid: e.target.checked}))}
                />
                <span className="text-sm text-zinc-600 leading-snug">
                  I have successfully completed the payment of <strong className="text-zinc-900">₹{listing.price_inr}</strong> to the provided UPI ID.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="mt-1 w-4 h-4 accent-black"
                  checked={checks.matched}
                  onChange={(e) => setChecks(p => ({...p, matched: e.target.checked}))}
                />
                <span className="text-sm text-zinc-600 leading-snug">
                  I have double-checked that the UTR entered exactly matches the successful transaction.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !checks.paid || !checks.matched}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-zinc-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Order"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
