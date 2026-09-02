import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

type Profile = Database['public']['Tables']['seller_profiles']['Row'];
type Order = Database['public']['Tables']['orders']['Row'] & {
  listings: {
    master_games: {
      title: string;
    };
  };
};

export default function Orders() {
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        listings (
          master_games (title)
        )
      `)
      .eq('seller_id', profile.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setOrders(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, [profile]);

  const handleApprove = async (orderId: string) => {
    const confirmed = window.confirm(
      "Have you verified that the funds are physically credited to your bank/UPI app, and the sender UTR matches this order?"
    );
    if (!confirmed) return;

    setApproving(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'COMPLETED', settled_at: new Date().toISOString() } as any)
        .eq('id', orderId);
        
      if (error) throw error;
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to approve order.");
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="space-y-8 text-zinc-900">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Orders</h1>
        <p className="text-zinc-500">Buyers will message you their receipt on WhatsApp. Verify the UTR in your bank, send them the key, and approve the order here.</p>
      </div>

      <div className="bg-white shadow-sm border border-zinc-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-6 space-y-4">
            <div className="flex gap-4 mb-6">
              <div className="h-6 bg-zinc-200 rounded w-1/6"></div>
              <div className="h-6 bg-zinc-200 rounded w-2/6"></div>
              <div className="h-6 bg-zinc-200 rounded w-1/6"></div>
              <div className="h-6 bg-zinc-200 rounded w-1/6"></div>
              <div className="h-6 bg-zinc-200 rounded w-1/6"></div>
            </div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-zinc-200 rounded-xl"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No orders yet.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 font-medium text-zinc-500">Date</th>
                <th className="px-6 py-4 font-medium text-zinc-500">Game</th>
                <th className="px-6 py-4 font-medium text-zinc-500">Buyer Info</th>
                <th className="px-6 py-4 font-medium text-zinc-500">UTR / Amount</th>
                <th className="px-6 py-4 font-medium text-zinc-500">Status</th>
                <th className="px-6 py-4 font-medium text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-zinc-600">
                    {new Date(order.created_at || '').toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {order.listings?.master_games?.title || 'Unknown Game'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-zinc-900">{order.buyer_email}</div>
                    {order.buyer_discord && <div className="text-xs text-zinc-500 mt-1">Discord: {order.buyer_discord}</div>}
                  </td>
                  <td className="px-6 py-4 font-mono">
                    <div className="text-zinc-900 font-semibold">₹{order.amount_inr}</div>
                    <div className="text-xs text-zinc-500 mt-1 tracking-wider">UTR: {order.utr_number}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      order.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                      'bg-zinc-100 text-zinc-500'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {order.status === 'PENDING_APPROVAL' && (
                      <button
                        onClick={() => handleApprove(order.id)}
                        disabled={approving === order.id}
                        className="bg-black text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-zinc-800 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        {approving === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
