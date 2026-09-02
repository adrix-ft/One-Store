import { useEffect, useState, useMemo } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types";
import { ShoppingCart, Search } from "lucide-react";

type Profile = Database['public']['Tables']['seller_profiles']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'] & {
  master_games: Database['public']['Tables']['master_games']['Row'];
};

// Component to handle Steam vertical covers with fallback
const GameCover = ({ game, customCover }: { game: Database['public']['Tables']['master_games']['Row'] | null, customCover?: string | null }) => {
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    if (customCover) {
      setImgSrc(customCover);
    } else if (game?.steam_app_id) {
      setImgSrc(`https://cdn.akamai.steamstatic.com/steam/apps/${game.steam_app_id}/library_600x900_2x.jpg`);
    } else if (game) {
      setImgSrc(game.cover_image_url || game.header_image_url || '');
    }
  }, [game, customCover]);

  if (!game) return null;

  return (
    <img 
      src={imgSrc} 
      alt={game.title}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      onError={(e) => {
        // If vertical capsule fails, fallback to horizontal header
        if (!customCover && imgSrc.includes('library_600x900_2x.jpg')) {
          setImgSrc(game.header_image_url || game.cover_image_url || '');
        }
      }}
    />
  );
};

export default function Store() {
  const { profile } = useOutletContext<{ profile: Profile }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select(`
          *,
          master_games (*)
        `)
        .eq('seller_id', profile.id)
        .eq('is_active', true);
        
      if (data) {
        setListings(data as any);
      }
      setLoading(false);
    };

    fetchListings();
  }, [profile.id]);

  const { promoListings, otherListings, customCovers } = useMemo(() => {
    let promoIds: string[] = [];
    let customCoversParsed: Record<string, string> = {};

    try {
      if (profile.brand_color?.startsWith('{')) {
        const config = JSON.parse(profile.brand_color);
        promoIds = Array.isArray(config.promoIds) ? config.promoIds : [];
        customCoversParsed = config.customCovers || {};
      }
    } catch (e) {}

    const promos = listings.filter(l => promoIds.includes(l.id));
    
    // Filter listings based on search query
    const filtered = listings.filter(l => 
      l.master_games?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If searching, we don't exclude promo from the list, we just show everything matching
    const others = searchQuery 
      ? filtered 
      : listings.filter(l => !promoIds.includes(l.id));

    return { promoListings: promos, otherListings: others, customCovers: customCoversParsed };
  }, [listings, profile.brand_color, searchQuery]);

  return (
    <div className="space-y-12 pb-12">
      <Helmet>
        <title>{profile.store_name} | Only Store</title>
        <meta name="description" content={profile.bio || `Welcome to ${profile.store_name} on Only Store. Browse our selection of game keys.`} />
        <meta property="og:title" content={`${profile.store_name} | Only Store`} />
        <meta property="og:description" content={profile.bio || `Welcome to ${profile.store_name} on Only Store. Browse our selection of game keys.`} />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content={`${profile.store_name} | Only Store`} />
        <meta property="twitter:description" content={profile.bio || `Welcome to ${profile.store_name} on Only Store. Browse our selection of game keys.`} />
      </Helmet>
      
      {loading ? (
        <div className="space-y-12 animate-pulse">
          <div className="w-full h-[500px] md:h-[400px] lg:h-[450px] bg-zinc-200 rounded-2xl"></div>
          <section>
            <div className="h-7 bg-zinc-200 rounded-md w-48 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-zinc-200 rounded-2xl h-48"></div>
              ))}
            </div>
          </section>
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="h-8 bg-zinc-200 rounded-md w-32"></div>
              <div className="h-11 bg-zinc-200 rounded-xl w-full sm:w-96"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => <div key={i} className="aspect-[3/4] bg-zinc-200 rounded-2xl"></div>)}
            </div>
          </div>
        </div>
      ) : (
        <>
      {!searchQuery && promoListings.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight mb-6 uppercase text-zinc-400">Trending Promotions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {promoListings.map(listing => (
              <div key={`promo-${listing.id}`} className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col group">
                <Link to={`/${profile.store_slug}/game/${listing.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View {listing.master_games?.title}</span>
                </Link>
                <div className="h-32 sm:h-40 relative overflow-hidden bg-zinc-100">
                  <img 
                    src={customCovers[listing.master_games?.id] || listing.master_games?.header_image_url || listing.master_games?.cover_image_url || ''} 
                    alt={listing.master_games?.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-white font-bold text-sm sm:text-base leading-tight uppercase line-clamp-1 truncate shadow-black">
                      {listing.master_games?.title}
                    </h3>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between bg-white relative z-20">
                  <span className="text-lg font-bold">{listing.price_inr}Rs</span>
                  <Link
                    to={`/${profile.store_slug}/checkout/${listing.id}`}
                    className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                      profile.is_paused 
                        ? 'bg-zinc-100 text-zinc-400 pointer-events-none' 
                        : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold tracking-tight uppercase">
            {searchQuery ? 'Search Results' : 'Catalog'}
          </h2>
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 transition-shadow text-sm"
            />
          </div>
        </div>

        {otherListings.length === 0 ? (
          <div className="text-center py-20 bg-white border border-zinc-200 rounded-2xl text-zinc-500 shadow-sm">
            {searchQuery ? 'No games found matching your search.' : 'This store currently has no other active listings.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {otherListings.map((listing) => (
              <div key={listing.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden group hover:border-zinc-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col relative">
                <Link to={`/${profile.store_slug}/game/${listing.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View Details for {listing.master_games?.title}</span>
                </Link>
                <div className="aspect-[3/4] relative overflow-hidden bg-zinc-100">
                  <GameCover game={listing.master_games} customCover={customCovers[listing.master_games?.id]} />
                </div>
                <div className="p-4 sm:p-5 flex-1 flex flex-col bg-white">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm sm:text-base leading-tight uppercase line-clamp-2 text-zinc-900 tracking-tight">
                      {listing.master_games?.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 mt-1 uppercase tracking-wider">
                      Digital Edition
                    </p>
                  </div>
                  
                  <div className="mt-4 sm:mt-5 mb-3 sm:mb-4 text-base sm:text-lg font-bold text-zinc-900">
                    {listing.price_inr}Rs
                  </div>
                  
                  <Link
                    to={`/${profile.store_slug}/checkout/${listing.id}`}
                    className={`relative z-20 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      profile.is_paused 
                        ? 'bg-zinc-100 text-zinc-400 pointer-events-none' 
                        : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    BUY NOW
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
}
