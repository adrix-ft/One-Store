import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, Shield } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import type { Database } from "../../types";

type UserRole = Database['public']['Tables']['user_roles']['Row'];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }
      
      const { data } = await supabase
        .from('user_roles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (data && data.role === 'ADMIN') {
        setIsAdmin(true);
      } else {
        // Not an admin, kick them back to dashboard or home
        navigate('/dashboard');
      }
      setLoading(false);
    };
    
    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center">Loading admin...</div>;
  }

  if (!isAdmin) return null;

  const navItems = [
    { name: "Overview", path: "/admin", icon: LayoutDashboard },
    { name: "Manage Sellers", path: "/admin/sellers", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      <Helmet>
        <title>Admin Dashboard | Only Store</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col sticky top-0 md:h-screen z-10 text-zinc-100">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Link to="/admin" className="text-xl tracking-tight flex items-center gap-2 font-bold text-white">
            <Shield className="w-5 h-5 text-indigo-400" />
            Admin <span className="text-zinc-500">Panel</span>
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
                    ? "bg-indigo-500/10 text-indigo-400" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
