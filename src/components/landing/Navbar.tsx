import { Link } from "react-router-dom";

const navLinks = ["Features", "Pricing", "FAQ"];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link to="/" className="text-xl tracking-tight flex items-baseline font-bold text-zinc-900">
          One<span className="text-zinc-400">Store</span>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-sm font-medium text-zinc-500 hover:text-black transition-colors"
          >
            {link}
          </a>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-sm font-medium text-zinc-500 hover:text-black transition-colors">
          Sign In
        </Link>
        <Link to="/signup" className="text-sm font-medium bg-black text-white rounded-full px-4 py-2 hover:bg-zinc-800 transition-colors">
          Start Selling
        </Link>
      </div>
    </nav>
  );
}
