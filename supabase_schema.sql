-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Reserved Slugs Table (Anti-Squatting / Security)
CREATE TABLE public.reserved_slugs (
    slug TEXT PRIMARY KEY
);
INSERT INTO public.reserved_slugs (slug) VALUES 
('admin'), ('api'), ('auth'), ('dashboard'), ('settings'), ('support'), 
('terms'), ('privacy'), ('explore'), ('login'), ('signup'), ('steam'), 
('valve'), ('official'), ('verified'), ('help');

-- 2. Master Games Catalog (Global Centralized Cache)
CREATE TABLE public.master_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    steam_app_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    header_image_url TEXT,
    short_description TEXT,
    genres TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seller Profiles (Multi-tenant Store Configuration)
CREATE TABLE public.seller_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    store_slug TEXT UNIQUE NOT NULL,
    store_name TEXT NOT NULL,
    upi_id TEXT NOT NULL,
    discord_handle TEXT,
    whatsapp_number TEXT,
    brand_color TEXT DEFAULT '#10B981',
    bio TEXT,
    tier TEXT DEFAULT 'FREE' CHECK (tier IN ('FREE', 'PRO')),
    platform_balance NUMERIC(10, 2) DEFAULT 0.00, -- Tracks owed commission (negative balance)
    credit_limit NUMERIC(10, 2) DEFAULT -500.00,  -- Threshold to trigger storefront pause
    is_paused BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Seller Listings (Game mapping with custom pricing)
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
    game_id UUID REFERENCES public.master_games(id) ON DELETE CASCADE,
    price_inr NUMERIC(10, 2) NOT NULL CHECK (price_inr > 0),
    is_active BOOLEAN DEFAULT TRUE,
    stock_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seller_id, game_id)
);

-- 5. Orders & Transactions (P2P UPI with UTR Tracking)
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE RESTRICT,
    listing_id UUID REFERENCES public.listings(id) ON DELETE RESTRICT,
    buyer_email TEXT NOT NULL,
    buyer_discord TEXT,
    amount_inr NUMERIC(10, 2) NOT NULL,
    commission_inr NUMERIC(10, 2) NOT NULL,
    utr_number VARCHAR(12) UNIQUE, -- Strict 12-digit UTR to prevent double-spending
    status TEXT DEFAULT 'PENDING_APPROVAL' CHECK (status IN ('PENDING_APPROVAL', 'COMPLETED', 'DISPUTED', 'CANCELLED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

-- 6. Platform Invoices (Commission Settlement)
CREATE TABLE public.commission_settlements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES public.seller_profiles(id) ON DELETE CASCADE,
    amount_paid NUMERIC(10, 2) NOT NULL,
    payment_reference TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.master_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Master games: Public read
CREATE POLICY "Public games read" ON public.master_games FOR SELECT USING (true);
CREATE POLICY "Public games insert" ON public.master_games FOR INSERT WITH CHECK (true);

-- Seller profiles: Public read, owner update
CREATE POLICY "Public profile view" ON public.seller_profiles FOR SELECT USING (true);
CREATE POLICY "Owner profile update" ON public.seller_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Owner profile insert" ON public.seller_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings: Public read active, owner full access
CREATE POLICY "Public listing view" ON public.listings FOR SELECT USING (is_active = true);
CREATE POLICY "Owner listing manage" ON public.listings FOR ALL USING (auth.uid() = seller_id);

-- Orders: Buyer can view their own, Seller can view and approve theirs
CREATE POLICY "Seller order access" ON public.orders FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Seller order update" ON public.orders FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Public order creation" ON public.orders FOR INSERT WITH CHECK (true);

-- Functions and Triggers
CREATE OR REPLACE FUNCTION handle_order_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        -- Deduct platform fee from seller balance (if FREE tier)
        UPDATE public.seller_profiles
        SET platform_balance = platform_balance - NEW.commission_inr,
            is_paused = CASE 
                WHEN (platform_balance - NEW.commission_inr) <= credit_limit THEN TRUE 
                ELSE FALSE 
            END,
            updated_at = NOW()
        WHERE id = NEW.seller_id AND tier = 'FREE';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_completed
AFTER UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION handle_order_completion();
