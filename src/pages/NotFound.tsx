import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
      <Helmet>
        <title>404 - Page Not Found | OneStore</title>
        <meta name="description" content="The page you are looking for could not be found." />
      </Helmet>
      <h1 className="text-4xl font-bold text-zinc-900 mb-4 tracking-tight">404</h1>
      <h2 className="text-xl font-medium text-zinc-900 mb-4">Page Not Found</h2>
      <p className="text-zinc-500 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-zinc-800 transition-colors">
        Return Home
      </Link>
    </div>
  );
}
