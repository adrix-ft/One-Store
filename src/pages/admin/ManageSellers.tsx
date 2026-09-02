import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ShieldAlert, ShieldCheck, Search, Loader2 } from "lucide-react";
import type { Database } from "../../types";

type Profile = Database['public']['Tables']['seller_profiles']['Row'];

export default function ManageSellers() {
  const [sellers, setSellers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSellers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seller_profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (data) {
      setSellers(data);
    } else {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleUpdateSubscription = async (sellerId: string, daysToAdd: number | null) => {
    setActionLoading(sellerId);
    
    try {
      let updatePayload = {};
      
      if (daysToAdd === null) {
        // Revoke access
        updatePayload = {
          subscription_status: 'EXPIRED',
          subscription_ends_at: new Date(0).toISOString()
        };
      } else {
        // Add days (assume from today for simplicity)
        const date = new Date();
        date.setDate(date.getDate() + daysToAdd);
        
        updatePayload = {
          subscription_status: 'ACTIVE',
          subscription_ends_at: date.toISOString()
        };
      }
      
      const { error } = await supabase
        .from('seller_profiles')
        .update(updatePayload)
        .eq('id', sellerId);
        
      if (error) throw error;
      
      // Update local state
      setSellers(sellers.map(s => s.id === sellerId ? { ...s, ...updatePayload } : s));
      
    } catch (err) {
      console.error("Error updating subscription:", err);
      alert("Failed to update subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredSellers = sellers.filter(s => 
    s.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.store_slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-zinc-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Manage Sellers</h1>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 bg-zinc-50 uppercase border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Store</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Expires</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading sellers...
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    No sellers found.
                  </td>
                </tr>
              ) : (
                filteredSellers.map((seller) => {
                  const endsAt = seller.subscription_ends_at ? new Date(seller.subscription_ends_at) : null;
                  const isLive = seller.subscription_status === 'ACTIVE' && endsAt && endsAt > new Date();
                  
                  return (
                    <tr key={seller.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-900">{seller.store_name}</div>
                        <div className="text-zinc-500 font-mono text-xs">/{seller.store_slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <ShieldCheck className="w-3.5 h-3.5" /> Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                            <ShieldAlert className="w-3.5 h-3.5" /> Offline
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-zinc-600">
                          {endsAt ? endsAt.toLocaleDateString() : 'Never'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleUpdateSubscription(seller.id, 30)}
                          disabled={actionLoading === seller.id}
                          className="inline-flex items-center px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          {actionLoading === seller.id ? <Loader2 className="w-4 h-4 animate-spin" /> : '+ 30 Days'}
                        </button>
                        <button
                          onClick={() => handleUpdateSubscription(seller.id, null)}
                          disabled={actionLoading === seller.id}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
