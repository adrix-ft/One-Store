import { useOutletContext, Link } from "react-router-dom";
import { IndianRupee, Activity, ShoppingCart } from "lucide-react";
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

  const isDebtAlert = profile.platform_balance !== null && profile.platform_balance <= (profile.credit_limit || -500) * 0.8;

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

        <div className={`bg-white shadow-sm border rounded-2xl p-6 ${isDebtAlert ? 'border-red-500/50 bg-red-50/50' : 'border-zinc-200'}`}>
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <h3 className="font-medium">Platform Balance</h3>
            <Activity className={`w-5 h-5 ${isDebtAlert ? 'text-red-500' : 'text-zinc-400'}`} />
          </div>
          <p className={`text-3xl font-bold ${isDebtAlert ? 'text-red-600' : 'text-zinc-900'}`}>
            ₹{Math.abs(profile.platform_balance || 0).toFixed(2)}
          </p>
          <p className="text-sm text-zinc-400 mt-1">
            {profile.platform_balance !== null && profile.platform_balance < 0 ? 'Owed to platform' : 'All clear'}
          </p>
        </div>
      </div>
    </div>
  );
}
