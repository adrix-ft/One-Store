export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      master_games: {
        Row: {
          id: string
          steam_app_id: number | null
          title: string
          cover_image_url: string
          header_image_url: string | null
          short_description: string | null
          genres: string[] | null
          created_at: string | null
        }
        Insert: {
          id?: string
          steam_app_id?: number | null
          title: string
          cover_image_url: string
          header_image_url?: string | null
          short_description?: string | null
          genres?: string[] | null
          created_at?: string | null
        }
        Update: {
          id?: string
          steam_app_id?: number | null
          title?: string
          cover_image_url?: string
          header_image_url?: string | null
          short_description?: string | null
          genres?: string[] | null
          created_at?: string | null
        }
      }
      seller_profiles: {
        Row: {
          id: string
          store_slug: string
          store_name: string
          upi_id: string
          discord_handle: string | null
          whatsapp_number: string | null
          brand_color: string | null
          bio: string | null
          tier: 'FREE' | 'PRO' | null
          platform_balance: number | null
          credit_limit: number | null
          is_paused: boolean | null
          subscription_ends_at: string | null
          subscription_status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          store_slug: string
          store_name: string
          upi_id: string
          discord_handle?: string | null
          whatsapp_number?: string | null
          brand_color?: string | null
          bio?: string | null
          tier?: 'FREE' | 'PRO' | null
          platform_balance?: number | null
          credit_limit?: number | null
          is_paused?: boolean | null
          subscription_ends_at?: string | null
          subscription_status?: 'PENDING' | 'ACTIVE' | 'EXPIRED' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          store_slug?: string
          store_name?: string
          upi_id?: string
          discord_handle?: string | null
          whatsapp_number?: string | null
          brand_color?: string | null
          bio?: string | null
          tier?: 'FREE' | 'PRO' | null
          platform_balance?: number | null
          credit_limit?: number | null
          is_paused?: boolean | null
          subscription_ends_at?: string | null
          subscription_status?: 'PENDING' | 'ACTIVE' | 'EXPIRED' | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      listings: {
        Row: {
          id: string
          seller_id: string | null
          game_id: string | null
          price_inr: number
          is_active: boolean | null
          stock_count: number | null
          created_at: string | null
          master_games?: Database['public']['Tables']['master_games']['Row']
        }
        Insert: {
          id?: string
          seller_id?: string | null
          game_id?: string | null
          price_inr: number
          is_active?: boolean | null
          stock_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          seller_id?: string | null
          game_id?: string | null
          price_inr?: number
          is_active?: boolean | null
          stock_count?: number | null
          created_at?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          seller_id: string | null
          listing_id: string | null
          buyer_email: string
          buyer_discord: string | null
          amount_inr: number
          commission_inr: number
          utr_number: string | null
          status: 'PENDING_APPROVAL' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | null
          created_at: string | null
          settled_at: string | null
          listings?: Database['public']['Tables']['listings']['Row']
          seller_profiles?: Database['public']['Tables']['seller_profiles']['Row']
        }
        Insert: {
          id?: string
          seller_id?: string | null
          listing_id?: string | null
          buyer_email: string
          buyer_discord?: string | null
          amount_inr: number
          commission_inr: number
          utr_number?: string | null
          status?: 'PENDING_APPROVAL' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | null
          created_at?: string | null
          settled_at?: string | null
        }
        Update: {
          id?: string
          seller_id?: string | null
          listing_id?: string | null
          buyer_email?: string
          buyer_discord?: string | null
          amount_inr?: number
          commission_inr?: number
          utr_number?: string | null
          status?: 'PENDING_APPROVAL' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | null
          created_at?: string | null
          settled_at?: string | null
        }
      }
      user_roles: {
        Row: {
          id: string
          role: 'SELLER' | 'ADMIN'
          created_at: string | null
        }
        Insert: {
          id: string
          role?: 'SELLER' | 'ADMIN'
          created_at?: string | null
        }
        Update: {
          id?: string
          role?: 'SELLER' | 'ADMIN'
          created_at?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
