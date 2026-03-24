import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Share2, Anchor, Play, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- CHAPPAL ICON (Vibe check) ---
const ChappalIcon = ({ active }: { active: boolean }) => (
  <motion.img
    src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f45e/512.gif"
    className={`w-9 h-9 ${active ? "grayscale-0 scale-125" : "grayscale opacity-70"}`}
    whileTap={{ y: -30, rotate: 25, scale: 1.4 }}
    transition={{ type: "spring", stiffness: 300 }}
  />
);

export default function FlicksTray({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetching Real Data from Supabase
  useEffect(() => {
    if (isOpen) {
      fetchFlicks();
    }
  }, [isOpen]);

  const fetchFlicks = async () => {
    setLoading(true);
    // Logic: Hume wo posts chahiye jo video hain aur user ne post kiye hain
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        *,
        profiles:user_id (full_name, avatar_url, username)
      `,
      )
      .eq("file_type", "video")
      .order("created_at", { ascending: false });

    if (data) setReels(data);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[2000] bg-black flex flex-col overflow-hidden"
        >
          {/* --- TOP HEADER: BRANDING & CLOSE --- */}
          <div className="absolute top-0 left-0 right-0 p-6 z-50 flex justify-between items-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative pointer-events-auto"
            >
              <h2 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 uppercase leading-none">
                Flicks
              </h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] mt-1"
              >
                Powered by Facelook
              </motion.p>
            </motion.div>

            <button
              onClick={onClose}
              className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white pointer-events-auto hover:bg-white/20 transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* --- VERTICAL SCROLL CONTAINER --- */}
          <div className="flex-1 overflow-y-scroll snap-y snap-mandatory custom-scrollbar scroll-smooth">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-white/20 font-black uppercase text-[10px] tracking-widest">
                  Warming up DVD Tray...
                </p>
              </div>
            ) : reels.length > 0 ? (
              reels.map((reel) => (
                <FlickItem key={reel.id} flick={reel} user={user} />
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-white/50 font-bold uppercase text-xs">
                No Flicks found in Tray
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FlickItem({ flick, user }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isChappal, setIsChappal] = useState(false);

  // Intersection Observer to handle Auto-Play/Pause
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.7 },
    );

    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="h-full w-full snap-start relative bg-black flex items-center justify-center">
      {/* Video Content */}
      <video
        ref={videoRef}
        src={flick.file_url}
        loop
        playsInline
        onClick={togglePlay}
        className="h-full w-full object-cover"
      />

      {/* --- SIDE ACTIONS (THE VIBE PANEL) --- */}
      <div className="absolute right-4 bottom-28 flex flex-col gap-6 items-center z-40">
        {/* Chappal Reaction instead of Like */}
        <div className="flex flex-col items-center">
          <button onClick={() => setIsChappal(!isChappal)} className="relative">
            <ChappalIcon active={isChappal} />
            {isChappal && (
              <motion.div
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2, opacity: 0, y: -50 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none text-2xl"
              >
                🩴
              </motion.div>
            )}
          </button>
          <span className="text-[10px] font-black text-white mt-1 drop-shadow-lg">
            99+
          </span>
        </div>

        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.8 }}
            className="text-white drop-shadow-lg"
          >
            <MessageCircle size={30} strokeWidth={2.5} />
          </motion.button>
          <span className="text-[10px] font-black text-white mt-1 uppercase">
            Vibe
          </span>
        </div>

        {/* Share Button */}
        <div className="flex flex-col items-center">
          <motion.button
            whileTap={{ scale: 0.8 }}
            className="text-white drop-shadow-lg"
          >
            <Share2 size={28} strokeWidth={2.5} />
          </motion.button>
          <span className="text-[10px] font-black text-white mt-1 uppercase">
            Bhejo
          </span>
        </div>

        {/* Hook Button (Primary Action) */}
        <div className="flex flex-col items-center">
          <motion.button
            whileHover={{ rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-blue-600 rounded-full text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            <Anchor size={20} strokeWidth={3} />
          </motion.button>
          <span className="text-[10px] font-black text-blue-400 mt-1 uppercase italic">
            Hook
          </span>
        </div>
      </div>

      {/* --- USER DETAILS OVERLAY --- */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/40 to-transparent">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full border-2 border-blue-500 overflow-hidden shadow-xl">
            <img
              src={flick.profiles?.avatar_url}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-black text-white text-sm uppercase tracking-tighter">
              @{flick.profiles?.full_name}
            </p>
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
              Live from Facelook
            </p>
          </div>
        </div>

        <p className="text-white/90 text-xs font-semibold leading-relaxed line-clamp-2 pr-16 drop-shadow-sm">
          {flick.caption || "Checkout this flick! 🔥 #facelook #vibes"}
        </p>
      </div>

      {/* Center Play Icon Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Play size={70} className="text-white/20" fill="currentColor" />
        </div>
      )}
    </div>
  );
}
