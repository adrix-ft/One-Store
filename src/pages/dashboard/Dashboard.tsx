import { useOutletContext, Link } from "react-router-dom";
import { IndianRupee, Activity, ShoppingCart, MessageCircleQuestion } from "lucide-react";
import type { Database } from "../../types";

type Profile = Database['public']['Tables']['seller_profiles']['Row'];

export default function Dashboard() {
  const { profile } = useOutletContext<{ profile: Profile | null }>();

  if (!profile) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-zinc-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-zinc-200 rounded-2xl"></div>
          <div className="h-32 bg-zinc-200 rounded-2xl"></div>
          <div className="h-32 bg-zinc-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const today = new Date();
  let remainingDays = 0;
  if (profile.subscription_ends_at) {
    const endsAt = new Date(profile.subscription_ends_at);
    const diffTime = endsAt.getTime() - today.getTime();
    remainingDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const isLive = profile.subscription_status === 'ACTIVE' && remainingDays > 0;

  return (
    <div className="space-y-8 text-zinc-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        {profile.store_slug && (
          <Link
            to={`/${profile.store_slug}`}
            target="_blank"
            className="text-sm font-medium bg-white text-zinc-900 px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors border border-zinc-200 shadow-sm"
          >
            View Storefront
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <h3 className="font-medium">Total Revenue</h3>
            <IndianRupee className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">₹0.00</p>
          <p className="text-sm text-zinc-400 mt-1">All time</p>
        </div>
        
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <h3 className="font-medium">Orders Pending</h3>
            <ShoppingCart className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">0</p>
          <p className="text-sm text-zinc-400 mt-1">Require approval</p>
        </div>
        
        <div className={`bg-white shadow-sm border rounded-2xl p-6 ${!isLive ? 'border-orange-500/50 bg-orange-50/50' : 'border-zinc-200'}`}>
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <h3 className="font-medium">Store Status</h3>
            <Activity className={`w-5 h-5 ${!isLive ? 'text-orange-500' : 'text-green-500'}`} />
          </div>
          <p className={`text-3xl font-bold ${!isLive ? 'text-orange-600' : 'text-green-600'}`}>
            {isLive ? 'Live' : 'Offline'}
          </p>
          <p className="text-sm text-zinc-500 mt-1 font-medium">
            {isLive 
              ? `${remainingDays} days remaining` 
              : 'Rent payment required'}
          </p>
        </div>
      </div>

      {/* Help Line Card */}
      <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6 md:p-8 mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-100 rounded-xl flex-shrink-0">
            <MessageCircleQuestion className="w-6 h-6 text-zinc-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Need help or want to go live?</h3>
            <p className="text-zinc-500 text-sm max-w-xl">
              Pay your store rent to make your storefront live, or contact the developer for any assistance or inquiries.
            </p>
          </div>
        </div>
        <a 
          href="https://wa.me/917906568743" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          Message on WhatsApp
        </a>
      </div>
    </div>
  );
}
