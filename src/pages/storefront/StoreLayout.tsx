import { Outlet, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types";

type Profile = Database['public']['Tables']['seller_profiles']['Row'];

export default function StoreLayout() {
  const { store_slug } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!store_slug) return;
      
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('store_slug', store_slug)
        .single();
        
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };
    
    fetchProfile();
  }, [store_slug]);

  if (loading) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-zinc-500">Loading store...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center text-red-500">Store not found.</div>;
  }

  const today = new Date();
  const endsAt = profile.subscription_ends_at ? new Date(profile.subscription_ends_at) : new Date(0);
  const isLive = profile.subscription_status === 'ACTIVE' && endsAt > today;

  if (!isLive) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 mb-4">Store Unavailable</h1>
        <p className="text-zinc-500 mb-8 max-w-md">This storefront is currently offline or undergoing maintenance.</p>
      </div>
    );
  }

  let parsedLogoUrl = "";
  if (profile.brand_color) {
    try {
      if (profile.brand_color.startsWith('{')) {
        const config = JSON.parse(profile.brand_color);
        parsedLogoUrl = config.logo || "";
      } else {
        parsedLogoUrl = profile.brand_color;
      }
    } catch (e) {
      parsedLogoUrl = profile.brand_color;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight flex items-center gap-3">
            {parsedLogoUrl ? (
              <img src={parsedLogoUrl} alt={profile.store_name} className="w-8 h-8 rounded-lg object-cover border border-zinc-200 shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-xs shadow-sm">
                {profile.store_name.substring(0, 2).toUpperCase()}
              </div>
            )}
            {profile.store_name}
          </div>
          <div className="flex items-center gap-4">
            {profile.whatsapp_number && (
              <div className="text-sm text-zinc-500 font-medium">
                WA: <span className="text-zinc-900">{profile.whatsapp_number}</span>
              </div>
            )}
            {profile.discord_handle && (
              <div className="text-sm text-zinc-500 font-medium">
                Discord: <span className="text-zinc-900">{profile.discord_handle}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={{ profile }} />
      </main>
    </div>
  );
}
