import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Settings, LogOut, Shield } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import type { Database } from "../../types";

type Profile = Database['public']['Tables']['seller_profiles']['Row'];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (roleData && roleData.role === 'ADMIN') {
        setIsAdmin(true);
      }
      
      let { data, error } = await supabase
        .from('seller_profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (!data && !error) {
        const { data: newProfile, error: insertError } = await supabase
          .from('seller_profiles')
          .insert([{ 
            id: session.user.id, 
            store_name: 'My Store', 
            store_slug: `store-${Math.random().toString(36).substring(2, 8)}`,
            upi_id: ''
          }])
          .select()
          .single();
          
        if (newProfile) {
          setProfile(newProfile);
        } else if (insertError) {
          console.error("Error creating profile:", insertError);
        }
      } else if (data) {
        setProfile(data);
      } else if (error) {
        console.error("Error fetching profile:", error);
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory", path: "/dashboard/inventory", icon: Package },
    { name: "Orders", path: "/dashboard/orders", icon: ShoppingCart },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      <Helmet>
        <title>Dashboard | Only Store</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-zinc-200 flex flex-col sticky top-0 md:h-screen z-10">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200">
          <Link to="/dashboard" className="text-xl tracking-tight flex items-baseline font-bold text-zinc-900">
            Only <span className="text-zinc-400">Store</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-zinc-100 text-zinc-900" 
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 space-y-1">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <Shield className="w-5 h-5" />
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {profile && profile.subscription_status !== 'ACTIVE' && (
          <div className="bg-orange-500/10 border-b border-orange-500/50 px-6 py-3 flex items-center justify-center text-orange-600 text-sm font-medium">
            Your storefront is currently offline. Please pay your rent to go live. Contact the developer on WhatsApp: +91 7906568743
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet context={{ profile, setProfile }} />
          </div>
        </div>
      </main>
    </div>
  );
}
