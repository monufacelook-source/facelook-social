import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  MessageCircle,
  Share2,
  Disc,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- CUSTOM CHAPPAL ICON (SVG) ---
const ChappalIcon = ({ size = 24, filled = false }: any) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "#ef4444" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 21c-1.5 0-3-.5-4-1.5s-1.5-2.5-1.5-4c0-2.5 1-7 5-11 1-1 2.5-1.5 4-1.5s3 .5 4 1.5c4 4 5 8.5 5 11 0 1.5-.5 3-1.5 4s-2.5 1.5-4 1.5h-7z" />
    <path d="M8 9s2 1 4 1 4-1 4-1" />
  </svg>
);

// --- CASSETTE LOADING ANIMATION ---
const CassetteLoader = () => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ y: -500, opacity: 0 }}
    className="absolute inset-0 z-[5000] bg-black flex flex-col items-center justify-center"
  >
    <motion.div
      animate={{ y: [0, -10, 0], rotateX: [0, 20, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="w-64 h-40 bg-zinc-800 rounded-lg border-4 border-zinc-700 relative p-4 flex flex-col justify-between shadow-[0_0_50px_rgba(59,130,246,0.3)]"
    >
      <div className="flex justify-between">
        <div className="w-12 h-12 rounded-full border-4 border-dashed border-zinc-600 animate-spin" />
        <div className="w-12 h-12 rounded-full border-4 border-dashed border-zinc-600 animate-spin" />
      </div>
      <div className="text-center">
        <h2 className="text-blue-500 font-black italic tracking-widest text-xl">
          FLICKS
        </h2>
        <p className="text-[8px] text-zinc-500 uppercase tracking-[0.3em]">
          Powered by Facelook
        </p>
      </div>
      <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-1/2 h-full bg-blue-600"
        />
      </div>
    </motion.div>
    <p className="mt-8 text-white font-bold text-xs animate-pulse uppercase tracking-widest">
      Inserting Media...
    </p>
  </motion.div>
);

export default function FlicksTray({ isOpen, onClose }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [flicks, setFlicks] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- FACELOOK HOOK SYSTEM (Load Data) ---
  const loadFlicks = async () => {
    setLoading(true);

    // 1. Fetch Internal Flicks (From your Supabase)
    const { data: internal } = await supabase
      .from("flicks")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false });

    // 2. Dummy External Flicks (Instagram/FB style placeholders)
    const external = [
      {
        id: "ext_1",
        video_url:
          "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-light-1282-large.mp4",
        caption: "Trending on Instagram 🔥",
        is_external: true,
        vibes_count: 1200,
        chappal_count: 45,
        profiles: { full_name: "Insta-Vibe", avatar_url: "" },
      },
      {
        id: "ext_2",
        video_url:
          "https://assets.mixkit.co/videos/preview/mixkit-dancing-in-a-nightclub-4340-large.mp4",
        caption: "Mood right now! #FaceLook",
        is_external: true,
        vibes_count: 850,
        chappal_count: 12,
        profiles: { full_name: "TrendSetter", avatar_url: "" },
      },
    ];

    // Mix and Shuffle
    const combined = [...(internal || []), ...external].sort(
      () => Math.random() - 0.5,
    );
    setFlicks(combined);

    // Animation delay for "Cassette" feel
    setTimeout(() => setLoading(false), 2500);
  };

  useEffect(() => {
    if (isOpen) loadFlicks();
  }, [isOpen]);

  // Reaction Hook
  const handleReaction = async (id: string, type: "vibe" | "chappal") => {
    // Logic for updating counts in Supabase
    setFlicks((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            [type === "vibe" ? "vibes_count" : "chappal_count"]:
              (f[type === "vibe" ? "vibes_count" : "chappal_count"] || 0) + 1,
          };
        }
        return f;
      }),
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[4000] bg-black flex flex-col"
        >
          {loading && <CassetteLoader />}

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[100] bg-gradient-to-b from-black/80 to-transparent">
            <div>
              <h1 className="text-2xl font-black italic text-white tracking-tighter">
                FLICKS
              </h1>
              <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">
                By Facelook
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Vertical Video Feed */}
          <div className="flex-1 relative overflow-hidden bg-zinc-950">
            {flicks.length > 0 && (
              <motion.div
                key={flicks[currentIndex]?.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full h-full relative"
              >
                <video
                  src={flicks[currentIndex].video_url}
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Interaction Overlay */}
                <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center">
                  {/* Vibe (Like) */}
                  <button
                    onClick={() =>
                      handleReaction(flicks[currentIndex].id, "vibe")
                    }
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full group-active:scale-150 transition-all text-white hover:text-pink-500">
                      <Heart size={28} fill="currentColor" />
                    </div>
                    <span className="text-[10px] font-black text-white shadow-sm">
                      {flicks[currentIndex].vibes_count || 0}
                    </span>
                  </button>

                  {/* Chappal (Dislike) */}
                  <button
                    onClick={() =>
                      handleReaction(flicks[currentIndex].id, "chappal")
                    }
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full group-active:scale-150 transition-all text-white hover:text-orange-500">
                      <ChappalIcon size={28} filled={false} />
                    </div>
                    <span className="text-[10px] font-black text-white shadow-sm">
                      {flicks[currentIndex].chappal_count || 0}
                    </span>
                  </button>

                  <button className="flex flex-col items-center gap-1">
                    <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white">
                      <MessageCircle size={28} />
                    </div>
                    <span className="text-[10px] font-black text-white">
                      Share
                    </span>
                  </button>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden bg-zinc-800">
                      <img
                        src={flicks[currentIndex].profiles?.avatar_url}
                        alt=""
                      />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white italic">
                        @
                        {flicks[currentIndex].profiles?.full_name
                          ?.replace(/\s/g, "")
                          .toLowerCase()}
                      </p>
                      {flicks[currentIndex].is_external && (
                        <span className="text-[8px] bg-blue-600 px-1.5 rounded text-white font-bold uppercase">
                          Trending Reel
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-200 font-medium line-clamp-2 w-[80%]">
                    {flicks[currentIndex].caption}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Navigation Arrows */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="p-2 bg-black/20 rounded-full text-white disabled:opacity-20"
              >
                <ChevronUp size={32} />
              </button>
              <button
                disabled={currentIndex === flicks.length - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="p-2 bg-black/20 rounded-full text-white disabled:opacity-20"
              >
                <ChevronDown size={32} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
