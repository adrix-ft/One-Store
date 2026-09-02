import React from "react";
import { useState, useEffect, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Plus, Loader2, IndianRupee, X, Upload, AlertCircle, CheckCircle2, Zap, PackageX, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types";

type Profile = Database['public']['Tables']['seller_profiles']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'] & {
  master_games: Database['public']['Tables']['master_games']['Row'];
};

export default function Inventory() {
  const { profile } = useOutletContext<{ profile: Profile | null }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [inventorySearchQuery, setInventorySearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGameForPrice, setSelectedGameForPrice] = useState<any | null>(null);
  const [priceInput, setPriceInput] = useState<string>("999");
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getCustomCover = (gameId: string) => {
    if (!profile || !profile.brand_color?.startsWith('{')) return null;
    try {
      const config = JSON.parse(profile.brand_color);
      return config.customCovers?.[gameId] || null;
    } catch (e) {
      return null;
    }
  };

  // Selection and Deletion State
  const [selectedListings, setSelectedListings] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Bulk Import State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [isBulking, setIsBulking] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; errors: string[], success: number } | null>(null);
  const cancelImportRef = useRef(false);

  // Custom Cover State
  const [editingCoverListing, setEditingCoverListing] = useState<Listing | null>(null);
  const [customCoverInput, setCustomCoverInput] = useState<string>("");
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);

  const fetchListings = async () => {
    if (!profile) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        master_games (*)
      `)
      .eq('seller_id', profile.id);
    
    if (data) {
      setListings(data as any);
      // Clear selection that might no longer exist
      setSelectedListings(new Set());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [profile]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.games || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const confirmAddListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedGameForPrice) return;
    
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      setErrorMsg("Please enter a valid price greater than 0.");
      return;
    }

    setIsAdding(true);
    setErrorMsg(null);
    
    try {
      // 1. Ensure game exists in master_games
      const { data: existingGame } = await supabase
        .from('master_games')
        .select('id')
        .eq('steam_app_id', selectedGameForPrice.steam_app_id)
        .maybeSingle();
        
      let gameId = existingGame?.id;
      
      if (!gameId) {
        const { data: newGame, error: insertError } = await supabase
          .from('master_games')
          .insert([{
            steam_app_id: selectedGameForPrice.steam_app_id,
            title: selectedGameForPrice.title,
            cover_image_url: selectedGameForPrice.cover_image_url,
            header_image_url: selectedGameForPrice.header_image_url,
          } as any])
          .select('id')
          .single();
          
        if (insertError) throw insertError;
        if (!newGame) throw new Error("Failed to insert game");
        gameId = newGame.id;
      }

      // 2. Add listing
      await supabase
        .from('listings')
        .insert([{
          seller_id: profile.id,
          game_id: gameId,
          price_inr: price,
          stock_count: 1,
        } as any]);
        
      fetchListings();
      setSearchResults([]);
      setSearchQuery("");
      setSelectedGameForPrice(null);
      setPriceInput("999");
      
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to add listing. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !bulkInput.trim()) return;

    const lines = bulkInput.split('\n');
    const toProcess = lines.map(line => {
      const [appIdStr, priceStr] = line.split(',');
      return { 
        appId: appIdStr?.trim(), 
        price: parseFloat(priceStr?.trim()) 
      };
    }).filter(item => item.appId && !isNaN(item.price) && item.price > 0);

    if (toProcess.length === 0) {
      alert("No valid entries found. Use format: AppID, Price");
      return;
    }

    setIsBulking(true);
    setBulkProgress({ current: 0, total: toProcess.length, success: 0, errors: [] });
    cancelImportRef.current = false;

    let currentSuccess = 0;
    const currentErrors: string[] = [];

    for (let i = 0; i < toProcess.length; i++) {
      if (cancelImportRef.current) {
        currentErrors.push("Import cancelled by user");
        break;
      }
      const item = toProcess[i];
      try {
        // 1. Check if already listed
        const alreadyListed = listings.find(l => l.master_games?.steam_app_id?.toString() === item.appId);
        if (alreadyListed) {
          throw new Error("Already in store");
        }

        // 2. Check master_games
        const { data: existingGame } = await supabase
          .from('master_games')
          .select('id')
          .eq('steam_app_id', item.appId)
          .maybeSingle();
          
        let gameId = existingGame?.id;

        if (!gameId) {
          // Fetch from Steam via our proxy
          const res = await fetch(`/api/games/details/${item.appId}`);
          const steamData = await res.json();
          
          if (steamData.error || !steamData.name) {
            throw new Error("Game not found on Steam");
          }

          const { data: newGame, error: insertError } = await supabase
            .from('master_games')
            .insert([{
              steam_app_id: item.appId,
              title: steamData.name,
              cover_image_url: steamData.header_image,
              header_image_url: steamData.header_image,
            } as any])
            .select('id')
            .single();
            
          if (insertError) throw insertError;
          gameId = newGame.id;
        }

        // 3. Add listing
        const { error: listingErr } = await supabase
          .from('listings')
          .insert([{
            seller_id: profile.id,
            game_id: gameId,
            is_active: true,
            price_inr: item.price,
            stock_count: 1,
          } as any]);

        if (listingErr) throw listingErr;
        
        currentSuccess++;
      } catch (err: any) {
        currentErrors.push(`AppID ${item.appId}: ${err.message}`);
      }

      setBulkProgress({
        current: i + 1,
        total: toProcess.length,
        success: currentSuccess,
        errors: currentErrors
      });
      
      // Small delay to prevent rate limits
      await new Promise(r => setTimeout(r, 500));
    }

    setIsBulking(false);
    fetchListings();
  };

  const handleUpdateCustomCover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !editingCoverListing) return;
    
    setIsUpdatingCover(true);
    setErrorMsg(null);
    
    try {
      let existingCustomCovers: Record<string, string> = {};
      let layoutConfig: any = {};
      
      if (profile.brand_color?.startsWith('{')) {
        try {
          layoutConfig = JSON.parse(profile.brand_color);
          existingCustomCovers = layoutConfig.customCovers || {};
        } catch (e) {}
      } else {
        layoutConfig = { logo: profile.brand_color || "" };
      }
      
      if (customCoverInput.trim()) {
        existingCustomCovers[editingCoverListing.master_games.id] = customCoverInput.trim();
      } else {
        delete existingCustomCovers[editingCoverListing.master_games.id];
      }
      
      layoutConfig.customCovers = existingCustomCovers;
      
      const { error } = await supabase
        .from('seller_profiles')
        .update({ brand_color: JSON.stringify(layoutConfig) })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      // Update local profile state implicitly via reload or we could just reload listings
      // Actually we need to reload the profile data but useOutletContext provides it, we can't easily trigger a reload of profile here
      // But we can just reload the page or fetch listings. We don't really have setProfile in Inventory.tsx
      // Wait, we can fetch listings. The custom cover is read from `profile.brand_color` which might be stale in Inventory.
      // Let's just force a reload of the window for simplicity, or we can fetch the profile locally and override.
      window.location.reload();
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update cover');
      setIsUpdatingCover(false);
    }
  };

  const handleImportAAA = () => {
    const aaaList = `1091500, 2999
1245620, 3599
814380, 2999
1174180, 3199
271590, 1499
292030, 999
1593500, 3299
990080, 3999
1086940, 2999
2215430, 3999
1151640, 3299
1817070, 3999
1817190, 3299
893620, 2999
1888160, 3599
2050650, 3999
1196590, 2999
883710, 2499
952060, 2499
412020, 1499
289070, 2999
359550, 999
1172380, 2199
1774580, 3499
1240440, 3499
976730, 1299
1716740, 4999
208650, 1299
315210, 529
805550, 1299
782330, 1799
379720, 1199
1190460, 3499
12210, 999
241930, 1299
356190, 2199
287700, 1199
1222140, 2299
205100, 999
403640, 1799
601150, 1799
1446780, 2999
582010, 2499
393380, 1299
108600, 699
252490, 1799
346110, 1299
489830, 1799
377160, 999
22380, 449
1272080, 2199
1361210, 2999
1551360, 2499
2195250, 3499
1938090, 4999
1238810, 2499
1238840, 1999
1510460, 2999
1238860, 1999
223220, 999
298110, 1499
552520, 2999
1053690, 2999
812140, 2999
2208920, 2999
594650, 1499
381210, 999
284160, 1049
255710, 1299
323190, 1299
1818150, 2499
1326470, 1299
2427650, 1299
1623730, 1299
236850, 1299
281990, 1299
394360, 1299
1158310, 2499
1384060, 2999
1051280, 2499
485510, 1299
851850, 2999
2054970, 4499
239140, 999
534380, 2499
374320, 2999
391220, 999
750920, 2199
203160, 529
200260, 529
244210, 529
1144200, 1299
686810, 1499
262060, 879
22370, 449
10150, 999
323470, 1299
454650, 1499
42690, 1299
10180, 999`;
    setBulkInput(aaaList);
    setIsBulkModalOpen(true);
  };

  const filteredListings = listings.filter(listing => 
    listing.master_games?.title?.toLowerCase().includes(inventorySearchQuery.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedListings.size === filteredListings.length && filteredListings.length > 0) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(filteredListings.map(l => l.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedListings);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedListings(newSelected);
  };

  const handleDeleteSelected = async () => {
    if (selectedListings.size === 0) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .in('id', Array.from(selectedListings));

      if (error) throw error;
      
      setSelectedListings(new Set());
      setShowDeleteConfirm(false);
      fetchListings();
    } catch (err) {
      console.error('Failed to delete listings:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 text-zinc-900">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Inventory Management</h1>
        <p className="text-zinc-500">Search the master catalog and add games to your store.</p>
      </div>

      {/* Search Master Catalog */}
      <div className="bg-white shadow-sm border border-zinc-200 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search Steam games to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-zinc-900"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </button>
          </form>
          
          <div className="hidden sm:block w-px bg-zinc-200"></div>

          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
          >
            <Upload className="w-4 h-4" /> Bulk Import
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {searchResults.map((game) => {
              const alreadyAdded = listings.some(listing => listing.master_games?.steam_app_id?.toString() === game.steam_app_id.toString());
              return (
                <div key={game.steam_app_id} className="bg-white border border-zinc-200 rounded-xl overflow-hidden group shadow-sm">
                  <img src={game.header_image_url || game.cover_image_url} alt={game.title} className="w-full h-32 object-cover bg-zinc-50" />
                  <div className="p-4">
                    <h4 className="font-semibold text-sm line-clamp-1 tracking-tight" title={game.title}>{game.title}</h4>
                    <button
                      onClick={() => !alreadyAdded && setSelectedGameForPrice(game)}
                      disabled={alreadyAdded}
                      className={`mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-md transition-colors text-sm font-medium ${
                        alreadyAdded 
                          ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                          : 'bg-zinc-100 hover:bg-black hover:text-white text-zinc-900'
                      }`}
                    >
                      {alreadyAdded ? 'Already Added' : <><Plus className="w-4 h-4" /> Add to Store</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Listings */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <h2 className="text-xl font-bold tracking-tight">Your Listings</h2>
          
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search your inventory..."
                value={inventorySearchQuery}
                onChange={(e) => setInventorySearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 text-sm shadow-sm"
              />
            </div>
            
            {selectedListings.size > 0 && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span className="hidden sm:inline">Remove {selectedListings.size}</span>
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="bg-white shadow-sm border border-zinc-200 rounded-2xl overflow-hidden animate-pulse">
            <div className="p-6 space-y-4">
              <div className="flex gap-4 mb-6">
                <div className="h-6 bg-zinc-200 rounded w-12"></div>
                <div className="h-6 bg-zinc-200 rounded w-2/5"></div>
                <div className="h-6 bg-zinc-200 rounded w-1/5"></div>
                <div className="h-6 bg-zinc-200 rounded w-1/5"></div>
              </div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-zinc-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white border border-zinc-200 shadow-sm rounded-2xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <PackageX className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Your store is empty</h3>
            <p className="text-zinc-500 max-w-sm mb-6">Start by searching for games above, or quick-start your store by importing a curated list of top AAA titles.</p>
            <div className="flex gap-4">
              <button 
                onClick={handleImportAAA} 
                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-zinc-800 transition-colors shadow-sm"
              >
                <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Quick Import AAA Titles
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm border border-zinc-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4"
                      checked={filteredListings.length > 0 && selectedListings.size === filteredListings.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4 font-medium text-zinc-500">Game</th>
                  <th className="px-6 py-4 font-medium text-zinc-500">Price</th>
                  <th className="px-6 py-4 font-medium text-zinc-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                      No games found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                  <tr key={listing.id} className={`hover:bg-zinc-50/50 transition-colors ${selectedListings.has(listing.id) ? 'bg-zinc-50' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4"
                        checked={selectedListings.has(listing.id)}
                        onChange={() => toggleSelect(listing.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative group">
                          <img src={getCustomCover(listing.master_games?.id) || listing.master_games?.header_image_url || ''} className="w-16 h-8 object-cover rounded bg-zinc-100" />
                          <button
                            onClick={() => {
                              setEditingCoverListing(listing);
                              setCustomCoverInput(getCustomCover(listing.master_games?.id) || '');
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity text-[10px] text-white font-medium"
                          >
                            Edit
                          </button>
                        </div>
                        <span className="font-medium text-zinc-900">{listing.master_games?.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono flex items-center gap-1 text-zinc-900 font-medium">
                      <IndianRupee className="w-3 h-3 text-zinc-400" />
                      {listing.price_inr}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${listing.is_active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {listing.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Set Price Modal */}
      {selectedGameForPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h3 className="font-bold text-lg">Set Store Price</h3>
              <button 
                onClick={() => { setSelectedGameForPrice(null); setErrorMsg(null); }}
                className="text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 items-center mb-6">
                <img src={selectedGameForPrice.header_image_url || selectedGameForPrice.cover_image_url} alt="Game" className="w-24 rounded-lg shadow-sm" />
                <div className="font-semibold">{selectedGameForPrice.title}</div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={confirmAddListing} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Price (INR)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="number"
                      autoFocus
                      required
                      min="1"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 text-zinc-900"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 mt-2"
                >
                  {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm & Add"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Cover Modal */}
      {editingCoverListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h3 className="font-bold text-lg">Edit Cover Image</h3>
              <button 
                onClick={() => { setEditingCoverListing(null); setErrorMsg(null); }}
                className="text-zinc-400 hover:text-zinc-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex gap-4 items-center mb-6">
                <img src={getCustomCover(editingCoverListing.master_games?.id) || editingCoverListing.master_games?.header_image_url || ''} alt="Game" className="w-24 rounded-lg shadow-sm" />
                <div className="font-semibold">{editingCoverListing.master_games?.title}</div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleUpdateCustomCover} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Custom Image URL</label>
                  <input
                    type="url"
                    autoFocus
                    placeholder="https://example.com/cover.jpg"
                    value={customCoverInput}
                    onChange={(e) => setCustomCoverInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 text-zinc-900"
                  />
                  <p className="text-xs text-zinc-500 mt-2">Leave blank to revert to the default image.</p>
                </div>
                <button
                  type="submit"
                  disabled={isUpdatingCover}
                  className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 mt-2"
                >
                  {isUpdatingCover ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Custom Cover"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h3 className="font-bold text-lg">Bulk Import Games</h3>
              <button 
                onClick={() => !isBulking && setIsBulkModalOpen(false)}
                disabled={isBulking}
                className="text-zinc-400 hover:text-zinc-900 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {bulkProgress ? (
                <div className="space-y-6">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 text-center">
                    <div className="text-3xl font-bold text-zinc-900 mb-2">
                      {bulkProgress.current} / {bulkProgress.total}
                    </div>
                    <div className="text-sm text-zinc-500 font-medium uppercase tracking-wide">
                      Games Processed
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-200 rounded-full h-2 mt-6 overflow-hidden">
                      <div 
                        className="bg-black h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-2xl font-bold text-green-700">{bulkProgress.success}</span>
                      <span className="text-xs text-green-600 uppercase font-bold tracking-wider mt-1">Added</span>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-red-600 mb-2" />
                      <span className="text-2xl font-bold text-red-700">{bulkProgress.errors.length}</span>
                      <span className="text-xs text-red-600 uppercase font-bold tracking-wider mt-1">Failed</span>
                    </div>
                  </div>

                  {bulkProgress.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-red-800 mb-2">Error Log</h4>
                      <ul className="text-xs text-red-700 space-y-1 max-h-40 overflow-y-auto font-mono">
                        {bulkProgress.errors.map((err, idx) => (
                          <li key={idx}>• {err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!isBulking ? (
                    <button
                      onClick={() => {
                        setIsBulkModalOpen(false);
                        setBulkProgress(null);
                        setBulkInput("");
                      }}
                      className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                    >
                      Close & Refresh
                    </button>
                  ) : (
                    <button
                      onClick={() => cancelImportRef.current = true}
                      className="w-full bg-red-50 text-red-600 border border-red-200 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors"
                    >
                      Cancel Import
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleBulkSubmit} className="space-y-4 flex flex-col h-full">
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-sm text-zinc-600">
                    <p className="font-semibold text-zinc-900 mb-1">Format your list as:</p>
                    <code className="bg-zinc-200 px-2 py-1 rounded text-zinc-800 font-mono">SteamAppID, Price</code>
                    <p className="mt-2">Example:</p>
                    <pre className="mt-1 bg-white border border-zinc-200 p-3 rounded text-xs font-mono text-zinc-500">
814380, 999<br/>
1086940, 1499<br/>
271590, 499
                    </pre>
                  </div>
                  
                  <div className="flex-1 min-h-[200px]">
                    <textarea
                      value={bulkInput}
                      onChange={(e) => setBulkInput(e.target.value)}
                      placeholder="Paste your list here..."
                      required
                      className="w-full h-full min-h-[200px] p-4 bg-white border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 text-zinc-900 font-mono text-sm resize-y"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={!bulkInput.trim()}
                    className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-zinc-800 disabled:opacity-50 transition-colors flex justify-center items-center gap-2 mt-4"
                  >
                    Start Import
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-bold text-lg mb-2">Remove Games</h3>
            <p className="text-zinc-500 text-sm mb-6">
              Are you sure you want to remove {selectedListings.size} game(s) from your store? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isDeleting}
                className="flex-1 flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
