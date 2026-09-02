import { Users, Store, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSellers: 0,
    activeStores: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: totalSellers } = await supabase
          .from('seller_profiles')
          .select('*', { count: 'exact', head: true });
          
        const { count: activeStores } = await supabase
          .from('seller_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('subscription_status', 'ACTIVE');
          
        setStats({
          totalSellers: totalSellers || 0,
          activeStores: activeStores || 0,
          totalRevenue: 0, // Placeholder
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 text-zinc-900">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <h3 className="font-medium">Total Sellers</h3>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">{stats.totalSellers}</p>
          <p className="text-sm text-zinc-400 mt-1">Registered on platform</p>
        </div>
        
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <h3 className="font-medium">Active Stores</h3>
            <Store className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">{stats.activeStores}</p>
          <p className="text-sm text-zinc-400 mt-1">Currently paying rent</p>
        </div>
        
        <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl p-6">
          <div className="flex items-center justify-between text-zinc-500 mb-4">
            <h3 className="font-medium">Total Rent Revenue</h3>
            <IndianRupee className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-3xl font-bold text-zinc-900">₹0.00</p>
          <p className="text-sm text-zinc-400 mt-1">Estimated</p>
        </div>
      </div>
    </div>
  );
}
