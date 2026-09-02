import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Inventory from "./pages/dashboard/Inventory";
import Orders from "./pages/dashboard/Orders";
import Settings from "./pages/dashboard/Settings";
import StoreLayout from "./pages/storefront/StoreLayout";
import Store from "./pages/storefront/Store";
import GameDetails from "./pages/storefront/GameDetails";
import Checkout from "./pages/storefront/Checkout";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageSellers from "./pages/admin/ManageSellers";
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Refunds from "./pages/legal/Refunds";
import Compliance from "./pages/legal/Compliance";
import NotFound from "./pages/NotFound";
import ThankYou from "./pages/ThankYou";
import CookieBanner from "./components/ui/CookieBanner";
import { Link } from "react-router-dom";

// Placeholder component for footer links to prevent hitting the /:store_slug route
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold text-zinc-900 mb-4">{title}</h1>
      <p className="text-zinc-500 mb-8 max-w-md">This page is a placeholder. In a production environment, this would contain the full content for {title}.</p>
      <Link to="/" className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-zinc-800 transition-colors">
        Return Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <CookieBanner />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Auth type="login" />} />
        <Route path="/signup" element={<Auth type="signup" />} />
        <Route path="/thank-you" element={<ThankYou />} />
        
        {/* Footer Link Routes */}
        <Route path="/p2p-upi" element={<PlaceholderPage title="P2P UPI" />} />
        <Route path="/pricing" element={<PlaceholderPage title="Pricing" />} />
        <Route path="/about" element={<PlaceholderPage title="About Us" />} />
        
        {/* Legal Routes */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refunds" element={<Refunds />} />
        <Route path="/compliance" element={<Compliance />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
           <Route index element={<Dashboard />} />
           <Route path="inventory" element={<Inventory />} />
           <Route path="orders" element={<Orders />} />
           <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
           <Route index element={<AdminDashboard />} />
           <Route path="sellers" element={<ManageSellers />} />
        </Route>

        <Route path="/:store_slug" element={<StoreLayout />}>
           <Route index element={<Store />} />
           <Route path="game/:listing_id" element={<GameDetails />} />
           <Route path="checkout/:listing_id" element={<Checkout />} />
        </Route>
        
        {/* 404 Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

