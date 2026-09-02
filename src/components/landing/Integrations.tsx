import { motion } from "motion/react";
import { Gamepad2, Smartphone, MessageCircle, Database } from "lucide-react";

const integrations = [
  { name: "Steam Web API", icon: Gamepad2 },
  { name: "Google Pay", icon: Smartphone },
  { name: "PhonePe", icon: Smartphone },
  { name: "Paytm", icon: Smartphone },
  { name: "Discord", icon: MessageCircle },
  { name: "Supabase", icon: Database },
];

const marqueeItems = [...integrations, ...integrations, ...integrations];

export default function Integrations() {
  return (
    <section className="py-16 overflow-hidden bg-zinc-50 border-y border-zinc-200/50">
      <div className="flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-16 whitespace-nowrap px-8"
        >
          {marqueeItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx} 
                className="flex items-center gap-2 opacity-40 hover:opacity-100 grayscale transition-all cursor-default"
              >
                <Icon className="w-6 h-6 text-zinc-900" />
                <span className="font-medium text-lg text-zinc-900">{item.name}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
