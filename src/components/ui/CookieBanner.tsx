import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem("cookie-consent");
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-50 flex justify-center">
      <div className="bg-white border border-zinc-200 shadow-xl rounded-xl p-4 md:p-6 max-w-3xl w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-900 font-medium mb-1">We use cookies</p>
          <p className="text-xs text-zinc-500">
            We use essential cookies to make our platform work and to securely route P2P UPI payments. 
            By continuing to use OneStore, you consent to our <Link to="/privacy" className="underline hover:text-zinc-900">Privacy Policy</Link>.
          </p>
        </div>
        <div className="flex shrink-0 gap-3 w-full md:w-auto">
          <button 
            onClick={acceptCookies}
            className="w-full md:w-auto bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
