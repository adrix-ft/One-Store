import React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types";
import { Loader2, Upload, X, Search, Plus } from "lucide-react";
import { sanitizeBio } from "../../lib/utils";

type Profile = Database['public']['Tables']['seller_profiles']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'] & {
  master_games: Database['public']['Tables']['master_games']['Row'];
};

function GameSelector({ 
  listings, 
  selectedIds, 
  onChange, 
  max, 
  label, 
  description 
}: { 
  listings: Listing[]; 
  selectedIds: string[]; 
  onChange: (ids: string[]) => void; 
  max: number;
  label: string;
  description: string;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedListings = useMemo(() => {
    return selectedIds.map(id => listings.find(l => l.id === id)).filter(Boolean) as Listing[];
  }, [listings, selectedIds]);

  const filteredAvailableListings = useMemo(() => {
    return listings
      .filter(l => !selectedIds.includes(l.id))
      .filter(l => l.master_games?.title.toLowerCase().includes(search.toLowerCase()));
  }, [listings, selectedIds, search]);

  const handleAdd = (id: string) => {
    if (selectedIds.length < max) {
      onChange([...selectedIds, id]);
      setSearch("");
      setIsOpen(false);
    }
  };

  const handleRemove = (id: string) => {
    onChange(selectedIds.filter(selectedId => selectedId !== id));
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{label} ({selectedIds.length}/{max})</label>
        <p className="text-xs text-zinc-500 mb-3">{description}</p>
      </div>

      {/* Selected Games Visuals */}
      {selectedListings.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {selectedListings.map(listing => (
            <div key={listing.id} className="flex items-center gap-3 p-2 bg-zinc-50 border border-zinc-200 rounded-lg">
              <img src={listing.master_games.header_image_url || listing.master_games.cover_image_url} alt="" className="w-16 h-10 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-zinc-900">{listing.master_games.title}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(listing.id)}
                className="p-1.5 text-zinc-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Game Search */}
      {selectedIds.length < max && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search to add game..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-sm text-zinc-900"
            />
          </div>

          {isOpen && search && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredAvailableListings.length === 0 ? (
                <div className="p-3 text-sm text-zinc-500 text-center">No games found</div>
              ) : (
                filteredAvailableListings.map(listing => (
                  <button
                    key={listing.id}
                    type="button"
                    onClick={() => handleAdd(listing.id)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-zinc-50 transition-colors text-left border-b border-zinc-100 last:border-0"
                  >
                    <img src={listing.master_games.header_image_url || listing.master_games.cover_image_url} alt="" className="w-12 h-8 object-cover rounded" />
                    <span className="text-sm font-medium text-zinc-900 truncate">{listing.master_games.title}</span>
                    <Plus className="w-4 h-4 text-zinc-400 ml-auto shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Click outside listener could be added, but for simplicity, they can just clear search */}
    </div>
  );
}

export default function Settings() {
  const { profile, setProfile } = useOutletContext<{ 
    profile: Profile | null; 
    setProfile: (p: Profile) => void;
  }>();
  
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  
  const [listings, setListings] = useState<Listing[]>([]);

  const [formData, setFormData] = useState({
    store_name: "",
    store_slug: "",
    upi_id: "",
    discord_handle: "",
    whatsapp_number: "",
    bio: "",
    brand_logo_url: "",
    promo_listing_ids: [] as string[]
  });

  useEffect(() => {
    if (profile) {
      let parsedLogoUrl = "";
      let parsedPromoIds: string[] = [];

      try {
        if (profile.brand_color?.startsWith('{')) {
          const config = JSON.parse(profile.brand_color);
          parsedLogoUrl = config.logo || "";
          parsedPromoIds = Array.isArray(config.promoIds) ? config.promoIds : [];
        } else {
          parsedLogoUrl = profile.brand_color || "";
        }
      } catch (e) {
        parsedLogoUrl = profile.brand_color || "";
      }

      setFormData({
        store_name: profile.store_name || "",
        store_slug: profile.store_slug || "",
        upi_id: profile.upi_id || "",
        discord_handle: profile.discord_handle || "",
        whatsapp_number: profile.whatsapp_number || "",
        bio: profile.bio || "",
        brand_logo_url: parsedLogoUrl,
        promo_listing_ids: parsedPromoIds
      });
      fetchListings();
    } else {
      checkSession();
    }
  }, [profile]);

  const fetchListings = async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('listings')
      .select('*, master_games(*)')
      .eq('seller_id', profile.id)
      .eq('is_active', true);
    
    if (data) {
      setListings(data as any);
    }
  };

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) navigate('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePromoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    // Limit to 4 promo games
    setFormData(prev => ({ ...prev, promo_listing_ids: selectedOptions.slice(0, 4) }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: "Logo image must be less than 2MB.", type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData(prev => ({ ...prev, brand_logo_url: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Bio sanitization
      const { isValid, sanitized } = sanitizeBio(formData.bio);
      if (!isValid) {
        setMessage({ text: "Bio contains restricted information (Phone/UPI/Off-platform deals). Please remove it.", type: 'error' });
        setLoading(false);
        return;
      }

      // Preserve existing customCovers
      let existingCustomCovers = {};
      if (profile && profile.brand_color?.startsWith('{')) {
        try {
          const config = JSON.parse(profile.brand_color);
          existingCustomCovers = config.customCovers || {};
        } catch (e) {}
      }

      const layoutConfig = {
        logo: formData.brand_logo_url,
        promoIds: formData.promo_listing_ids,
        customCovers: existingCustomCovers
      };

      const payload = {
        id: session.user.id,
        store_name: formData.store_name,
        store_slug: formData.store_slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        upi_id: formData.upi_id,
        discord_handle: formData.discord_handle,
        whatsapp_number: formData.whatsapp_number,
        bio: sanitized,
        brand_color: JSON.stringify(layoutConfig),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('seller_profiles')
        .upsert([payload as any])
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
      setMessage({ text: "Settings saved successfully!", type: 'success' });
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Failed to save settings.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="space-y-8 max-w-2xl animate-pulse">
        <div>
          <div className="h-8 bg-zinc-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
        </div>
        <div className="bg-white shadow-sm border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="h-6 bg-zinc-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-zinc-200 rounded-xl"></div>
            <div className="h-10 bg-zinc-200 rounded-xl"></div>
          </div>
        </div>
        <div className="bg-white shadow-sm border border-zinc-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="h-6 bg-zinc-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-zinc-200 rounded-xl"></div>
            <div className="h-10 bg-zinc-200 rounded-xl"></div>
            <div className="h-10 bg-zinc-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-zinc-900 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Store Settings</h1>
        <p className="text-zinc-500">Configure your public storefront and payment details.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow-sm border border-zinc-200 rounded-2xl p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Store Name *</label>
            <input
              required
              name="store_name"
              value={formData.store_name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Store Slug (URL) *</label>
            <input
              required
              name="store_slug"
              value={formData.store_slug}
              onChange={handleChange}
              placeholder="e.g. my-awesome-store"
              className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">UPI ID *</label>
            <input
              required
              name="upi_id"
              value={formData.upi_id}
              onChange={handleChange}
              placeholder="e.g. storename@okaxis"
              className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">WhatsApp Number</label>
            <input
              name="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={handleChange}
              placeholder="e.g. +91 9876543210"
              className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900"
            placeholder="Tell buyers about your store. (No phone numbers or off-platform payment requests)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Discord Handle</label>
            <input
              name="discord_handle"
              value={formData.discord_handle}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Brand Logo</label>
            <div className="flex items-center gap-4">
              {formData.brand_logo_url ? (
                <div className="relative group">
                  <img src={formData.brand_logo_url} alt="Brand Logo" className="w-12 h-12 rounded-lg object-cover border border-zinc-200" />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, brand_logo_url: "" }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center text-zinc-400">
                  <Upload className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-zinc-100 text-zinc-900 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  Upload Logo
                </button>
                <p className="text-xs text-zinc-500 mt-1">Recommended: 256x256px, max 2MB.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Storefront Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GameSelector 
              listings={listings}
              selectedIds={formData.promo_listing_ids}
              onChange={(ids) => setFormData(prev => ({ ...prev, promo_listing_ids: ids }))}
              max={4}
              label="Promo Games"
              description="Featured games shown below the header."
            />
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
