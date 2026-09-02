import { Link } from "react-router-dom";
import { motion } from "motion/react";

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-6 flex flex-col items-center text-center">
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-7xl font-semibold tracking-tighter text-zinc-900 max-w-4xl leading-tight"
      >
        Sell game keys.<br/>Keep the cash.
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mt-6 text-lg text-zinc-500 max-w-2xl mx-auto"
      >
        Instant Steam catalog sync. Direct UPI payments. Zero escrow.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Link to="/signup" className="mt-8 inline-flex items-center justify-center bg-black hover:bg-zinc-800 text-white px-6 py-3 rounded-full font-medium transition-colors">
          Create your store &rarr;
        </Link>
      </motion.div>
    </section>
  );
}
