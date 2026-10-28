import { motion } from "framer-motion";

export type FaceMood = "pleading" | "pout" | "sad" | "happy" | "shy" | "love" | "sleepy" | "giggle";

const bg: Record<FaceMood, string> = {
  pleading: "#FFF1C9",
  pout: "#FFE4EC",
  sad: "#E0EFFF",
  happy: "#FFE4EC",
  shy: "#FFDADF",
  love: "#FFD1DC",
  sleepy: "#E9E4FF",
  giggle: "#DFF8E8",
};

export default function CuteFace({
  mood = "pleading",
  size = 84,
  delay = 0,
  className = "",
}: {
  mood?: FaceMood;
  size?: number;
  delay?: number;
  className?: string;
}) {
  const id = `${mood}-${size}-${delay}`;
  return (
    <motion.div
      initial={{ scale: 0, rotate: -12 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.1, rotate: 4 }}
      className={`relative shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-[0_8px_20px_rgba(247,90,138,0.25)]">
        <defs>
          <radialGradient id={`g-${id}`} cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="35%" stopColor={bg[mood]} />
            <stop offset="100%" stopColor={bg[mood]} stopOpacity="1" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill={`url(#g-${id})`} stroke="#fff" strokeWidth="4" />
        {/* blush */}
        <ellipse cx="24" cy="62" rx="9" ry="6.5" fill="#FB7BA0" opacity="0.45" />
        <ellipse cx="76" cy="62" rx="9" ry="6.5" fill="#FB7BA0" opacity="0.45" />
        <ellipse cx="24" cy="62" rx="4" ry="2.5" fill="#fff" opacity="0.5" />
        <ellipse cx="76" cy="62" rx="4" ry="2.5" fill="#fff" opacity="0.5" />

        {mood === "pleading" && (
          <g>
            <ellipse cx="32" cy="44" rx="10" ry="12" fill="#3B2314" />
            <ellipse cx="68" cy="44" rx="10" ry="12" fill="#3B2314" />
            <circle cx="35" cy="40" r="4.5" fill="white" />
            <circle cx="71" cy="40" r="4.5" fill="white" />
            <circle cx="33.5" cy="48" r="1.8" fill="white" opacity="0.9" />
            <circle cx="69.5" cy="48" r="1.8" fill="white" opacity="0.9" />
            {/* sparkles in eyes */}
            <path d="M28 32 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2-2.8 -2.8-1.2 2.8-1.2z" fill="white" opacity="0.9" />
            <path d="M64 32 l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2-2.8 -2.8-1.2 2.8-1.2z" fill="white" opacity="0.9" />
            <path d="M42 70 Q50 66 58 70 Q54 76 50 76 Q46 76 42 70" fill="#4A2C1F" />
            <path d="M20 54 Q22 62 18 68" stroke="#7DD3E0" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="17" cy="71" r="3.5" fill="#7DD3E0" />
          </g>
        )}
        {mood === "pout" && (
          <g>
            <ellipse cx="32" cy="44" rx="6.5" ry="8" fill="#3B2314" />
            <ellipse cx="68" cy="44" rx="6.5" ry="8" fill="#3B2314" />
            <circle cx="34" cy="42" r="2.2" fill="white" />
            <circle cx="70" cy="42" r="2.2" fill="white" />
            <ellipse cx="50" cy="70" rx="7" ry="6" fill="#8B4A3A" />
            <ellipse cx="50" cy="69" rx="4" ry="3" fill="#C97A6A" />
          </g>
        )}
        {mood === "sad" && (
          <g>
            <ellipse cx="32" cy="44" rx="6" ry="7.5" fill="#3B2314" />
            <ellipse cx="68" cy="44" rx="6" ry="7.5" fill="#3B2314" />
            <circle cx="34" cy="42" r="2" fill="white" />
            <circle cx="70" cy="42" r="2" fill="white" />
            <path d="M38 72 Q50 62 62 72" stroke="#4A2C1F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M76 50 Q79 58 75 64 Q71 58 74 50" fill="#7DD3E0" />
            <circle cx="75" cy="67" r="2.5" fill="#7DD3E0" opacity="0.7" />
          </g>
        )}
        {mood === "happy" && (
          <g>
            <path d="M22 44 Q32 36 42 44" stroke="#3B2314" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M58 44 Q68 36 78 44" stroke="#3B2314" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M36 62 Q50 78 64 62 Q50 70 36 62" fill="#7A2E2E" />
            <path d="M38 63 Q50 76 62 63 Q56 66 50 66 Q44 66 38 63" fill="#E85D6B" />
            <ellipse cx="50" cy="71" rx="6" ry="4" fill="#F9A8B8" opacity="0.8" />
          </g>
        )}
        {mood === "shy" && (
          <g>
            <ellipse cx="32" cy="45" rx="5.5" ry="7" fill="#3B2314" />
            <ellipse cx="68" cy="45" rx="5.5" ry="7" fill="#3B2314" />
            <circle cx="34" cy="43" r="1.8" fill="white" />
            <circle cx="70" cy="43" r="1.8" fill="white" />
            <path d="M42 65 Q50 71 58 65" stroke="#4A2C1F" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            {/* hands covering */}
            <ellipse cx="18" cy="72" rx="8" ry="10" fill="#fff" stroke="#FFE4EC" strokeWidth="2" />
            <ellipse cx="82" cy="72" rx="8" ry="10" fill="#fff" stroke="#FFE4EC" strokeWidth="2" />
          </g>
        )}
        {mood === "love" && (
          <g>
            <path d="M32 38 c-3-5-11-3-11 2 c0 4 5 8 11 12 c6-4 11-8 11-12 c0-5-8-7-11-2" fill="#F75A8A" />
            <path d="M68 38 c-3-5-11-3-11 2 c0 4 5 8 11 12 c6-4 11-8 11-12 c0-5-8-7-11-2" fill="#F75A8A" />
            <path d="M40 64 Q50 74 60 64 Q55 68 50 68 Q45 68 40 64" fill="#7A2E2E" />
            <ellipse cx="50" cy="70" rx="5" ry="3.5" fill="#E85D6B" />
          </g>
        )}
        {mood === "sleepy" && (
          <g>
            <path d="M24 44 Q32 48 40 44" stroke="#3B2314" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M60 44 Q68 48 76 44" stroke="#3B2314" strokeWidth="4" strokeLinecap="round" fill="none" />
            <ellipse cx="50" cy="66" rx="6" ry="5" fill="#4A2C1F" />
            <circle cx="78" cy="28" r="3" fill="#B8A6FF" opacity="0.7" />
            <text x="82" y="24" fontSize="12" fontWeight="800" fill="#8B7CFF">z</text>
            <text x="88" y="16" fontSize="9" fontWeight="800" fill="#B8A6FF">z</text>
          </g>
        )}
        {mood === "giggle" && (
          <g>
            <path d="M24 42 Q32 36 40 42 Q32 46 24 42" fill="#3B2314" />
            <path d="M60 42 Q68 36 76 42 Q68 46 60 42" fill="#3B2314" />
            <path d="M35 60 Q50 76 65 60 Q57 64 50 64 Q43 64 35 60" fill="#7A2E2E" />
            <path d="M40 62 Q50 72 60 62" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
