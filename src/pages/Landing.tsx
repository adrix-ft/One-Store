import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import BentoFeatures from "../components/landing/BentoFeatures";
import Integrations from "../components/landing/Integrations";
import Testimonials from "../components/landing/Testimonials";
import Footer from "../components/landing/Footer";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Landing() {
  return (
    <div className="bg-zinc-50 min-h-screen text-zinc-900 font-sans selection:bg-zinc-200 overflow-x-hidden relative pb-20 md:pb-0">
      <Helmet>
        <title>OneStore | Game Key Storefront Infrastructure</title>
        <meta name="description" content="Build your game key storefront in minutes. Zero escrow, instant P2P UPI settlements, and automated Steam catalog sync." />
        <meta property="og:title" content="OneStore | Game Key Storefront Infrastructure" />
        <meta property="og:description" content="Build your game key storefront in minutes. Zero escrow, instant P2P UPI settlements, and automated Steam catalog sync." />
      </Helmet>

      <Navbar />
      <main>
        <Hero />
        <BentoFeatures />
        <Integrations />
        <Testimonials />
      </main>
      <Footer />

      {/* Sticky Mobile CTA */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <Link 
          to="/signup" 
          className="w-full shadow-2xl flex items-center justify-center bg-black hover:bg-zinc-800 text-white px-6 py-3.5 rounded-xl font-medium transition-colors"
        >
          Create your store &rarr;
        </Link>
      </div>
    </div>
  );
}
