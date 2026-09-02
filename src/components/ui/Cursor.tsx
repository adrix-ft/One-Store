import { motion } from "motion/react";

export default function Cursor({ x, y, color, name, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y: y + 20 }}
      animate={{ opacity: 1, x, y: [y, y - 10, y] }}
      transition={{ delay, duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      className="absolute pointer-events-none z-10 flex flex-col items-center"
      style={{ left: x, top: y }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
        <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 01.35-.15h6.44c.45 0 .67-.54.35-.85L5.5 3.21z" stroke="white" strokeWidth="1.5" />
      </svg>
      <div className="bg-white/10 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full mt-1 border border-white/20 whitespace-nowrap shadow-xl font-medium">
        {name}
      </div>
    </motion.div>
  );
}
