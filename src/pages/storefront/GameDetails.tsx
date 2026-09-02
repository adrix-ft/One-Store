import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useOutletContext, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types";
import { ShoppingCart, ArrowLeft, ShieldCheck, Check } from "lucide-react";
import DOMPurify from 'dompurify';

type Profile = Database['public']['Tables']['seller_profiles']['Row'];
type Listing = Database['public']['Tables']['listings']['Row'] & {
  master_games: Database['public']['Tables']['master_games']['Row'];
};

export default function GameDetails() {
  const { listing_id } = useParams();
  const { profile } = useOutletContext<{ profile: Profile }>();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [steamData, setSteamData] = useState<any>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  const customCover = useMemo(() => {
    try {
      if (profile.brand_color?.startsWith('{')) {
        const config = JSON.parse(profile.brand_color);
        return config.customCovers?.[listing?.master_games?.id || ''] || null;
      }
    } catch (e) {}
    return null;
  }, [profile.brand_color, listing?.master_games?.id]);

  useEffect(() => {
    const fetchListingAndDetails = async () => {
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
        
        let localCustomCover = null;
        try {
          if (profile.brand_color?.startsWith('{')) {
            const config = JSON.parse(profile.brand_color);
            localCustomCover = config.customCovers?.[data.master_games.id];
          }
        } catch (e) {}

        const defaultImage = localCustomCover || data.master_games.header_image_url || data.master_games.cover_image_url;
        setActiveImage(defaultImage);
        
        // Fetch detailed steam info
        if (data.master_games.steam_app_id) {
          try {
            const res = await fetch(`/api/games/details/${data.master_games.steam_app_id}`);
            const sData = await res.json();
            if (!sData.error) {
              setSteamData(sData);
              if (sData.screenshots && sData.screenshots.length > 0) {
                // Keep header image as active first, or switch to screenshot
              }
            }
          } catch (e) {
            console.error(e);
          }
        }
      }
      setLoading(false);
    };

    fetchListingAndDetails();
  }, [listing_id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-24 animate-pulse">
        <div className="w-32 h-6 bg-zinc-200 rounded mb-6"></div>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            <div className="w-full aspect-video bg-zinc-200 rounded-2xl"></div>
            <div className="flex gap-3 pb-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex-shrink-0 w-32 aspect-video bg-zinc-200 rounded-lg"></div>
              ))}
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 mt-8">
              <div className="w-48 h-6 bg-zinc-200 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="w-full h-4 bg-zinc-200 rounded"></div>
                <div className="w-full h-4 bg-zinc-200 rounded"></div>
                <div className="w-5/6 h-4 bg-zinc-200 rounded"></div>
                <div className="w-full h-4 bg-zinc-200 rounded"></div>
                <div className="w-4/5 h-4 bg-zinc-200 rounded"></div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/3">
            <div className="sticky top-6 space-y-6">
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="w-full h-8 bg-zinc-200 rounded mb-4"></div>
                <div className="w-32 h-6 bg-zinc-200 rounded-full mb-6"></div>
                <div className="w-full h-24 bg-zinc-200 rounded-xl mb-6"></div>
                <div className="w-full h-12 bg-zinc-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Game not found</h2>
        <Link to={`/${profile.store_slug}`} className="text-blue-600 hover:underline">
          Return to store
        </Link>
      </div>
    );
  }

  const cleanDescription = steamData?.about_the_game 
    ? DOMPurify.sanitize(steamData.about_the_game) 
    : '';

  const cleanShortDescription = steamData?.short_description
    ? DOMPurify.sanitize(steamData.short_description)
    : '';

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <Helmet>
        <title>{listing.master_games?.title} | {profile.store_name}</title>
      </Helmet>

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Store
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Media & Description */}
        <div className="lg:w-2/3 space-y-6">
          {/* Main Image Viewport */}
          <div className="w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden relative border border-zinc-200 shadow-sm">
            <img 
              src={activeImage} 
              alt={listing.master_games?.title}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          </div>

          {/* Thumbnails (Screenshots) */}
          {steamData?.screenshots && steamData.screenshots.length > 0 && (
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
              <button 
                onClick={() => setActiveImage(customCover || listing.master_games.header_image_url || listing.master_games.cover_image_url)}
                className={`flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden border-2 transition-all ${activeImage === (customCover || listing.master_games.header_image_url || listing.master_games.cover_image_url) ? 'border-zinc-900' : 'border-transparent hover:border-zinc-300'}`}
              >
                <img src={customCover || listing.master_games.header_image_url || listing.master_games.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
              </button>
              {steamData.screenshots.slice(0, 6).map((screenshot: any) => (
                <button 
                  key={screenshot.id}
                  onClick={() => setActiveImage(screenshot.path_full)}
                  className={`flex-shrink-0 w-32 aspect-video rounded-lg overflow-hidden border-2 transition-all ${activeImage === screenshot.path_full ? 'border-zinc-900' : 'border-transparent hover:border-zinc-300'}`}
                >
                  <img src={screenshot.path_thumbnail} alt={`Screenshot ${screenshot.id}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* About Section */}
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 mt-8">
            <h2 className="text-xl font-bold tracking-tight mb-6">About This Game</h2>
            {cleanDescription ? (
              <div 
                className="prose prose-zinc max-w-none text-zinc-600 prose-headings:text-zinc-900 prose-a:text-blue-600 prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: cleanDescription }}
              />
            ) : (
              <p className="text-zinc-500">No detailed description available.</p>
            )}
          </div>

          {/* System Requirements */}
          {(steamData?.pc_requirements?.minimum || steamData?.pc_requirements?.recommended) && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 mt-8">
              <h2 className="text-xl font-bold tracking-tight mb-6">System Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                {steamData.pc_requirements.minimum && (
                  <div 
                    className="prose prose-sm prose-zinc max-w-none text-zinc-600 [&>ul]:pl-4 [&>ul]:list-disc"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(steamData.pc_requirements.minimum) }}
                  />
                )}
                {steamData.pc_requirements.recommended && (
                  <div 
                    className="prose prose-sm prose-zinc max-w-none text-zinc-600 [&>ul]:pl-4 [&>ul]:list-disc"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(steamData.pc_requirements.recommended) }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Buy Box & Meta */}
        <div className="lg:w-1/3">
          <div className="sticky top-6 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h1 className="text-2xl font-bold tracking-tight mb-2 leading-tight uppercase">
                {listing.master_games?.title}
              </h1>
              
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 uppercase tracking-wide mb-6">
                Digital Edition
              </div>

              {cleanShortDescription && (
                <div 
                  className="text-sm text-zinc-600 mb-6 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: cleanShortDescription }}
                />
              )}

              <div className="space-y-4 mb-6">
                {steamData?.developers && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Developer</span>
                    <span className="font-medium text-zinc-900 text-right">{steamData.developers.join(', ')}</span>
                  </div>
                )}
                {steamData?.publishers && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Publisher</span>
                    <span className="font-medium text-zinc-900 text-right">{steamData.publishers.join(', ')}</span>
                  </div>
                )}
                {steamData?.release_date?.date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Release Date</span>
                    <span className="font-medium text-zinc-900">{steamData.release_date.date}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-100 pt-6">
                <div className="text-3xl font-bold text-zinc-900 mb-6 flex items-baseline">
                  {listing.price_inr}<span className="text-xl ml-1">Rs</span>
                </div>

                <Link
                  to={`/${profile.store_slug}/checkout/${listing.id}`}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base font-semibold transition-all duration-200 ${
                    profile.is_paused 
                      ? 'bg-zinc-100 text-zinc-400 pointer-events-none' 
                      : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm hover:shadow-md'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {profile.is_paused ? 'STORE PAUSED' : 'BUY NOW'}
                </Link>
              </div>

              <ul className="mt-6 space-y-3">
                <li className="flex items-center text-sm text-zinc-600">
                  <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                  Instant Digital Delivery
                </li>
                <li className="flex items-center text-sm text-zinc-600">
                  <Check className="w-4 h-4 mr-2 text-zinc-400" />
                  100% Secure Transaction
                </li>
                <li className="flex items-center text-sm text-zinc-600">
                  <Check className="w-4 h-4 mr-2 text-zinc-400" />
                  Guaranteed Working Key
                </li>
              </ul>
            </div>

            {/* Genres / Tags Box */}
            {steamData?.genres && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold tracking-tight text-zinc-900 mb-4 uppercase">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {steamData.genres.map((genre: any) => (
                    <span key={genre.id} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-full">
                      {genre.description}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
