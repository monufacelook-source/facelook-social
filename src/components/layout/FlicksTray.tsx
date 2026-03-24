import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Share2, Film } from "lucide-react";
import { useState, useRef } from "react";

const FLICKS = [
  {
    id: 1,
    username: "zahra.k",
    hearts: 12400,
    chappals: 320,
    comments: 891,
    caption: "Golden hour vibes ✨ #facelook #sunset",
    src: "https://images.unsplash.com/photo-1504276048855-f3d60e69632f?w=800&h=1400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
  },
  {
    id: 2,
    username: "dev.raj",
    hearts: 8900,
    chappals: 140,
    comments: 452,
    caption: "Mountain life hits different 🏔️ #travel",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
  },
  {
    id: 3,
    username: "mia.lux",
    hearts: 34000,
    chappals: 890,
    comments: 2100,
    caption: "Road trip never ends 🚗🌅 #roadtrip #vibes",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=1400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
  },
  {
    id: 4,
    username: "aria.v",
    hearts: 21000,
    chappals: 560,
    comments: 1340,
    caption: "City lights never sleep 🌆 #citylife #night",
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=1400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop",
  },
  {
    id: 5,
    username: "riya.s",
    hearts: 45000,
    chappals: 210,
    comments: 3200,
    caption: "Ocean therapy 🌊 feeling alive #beach #summer",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1400&fit=crop",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop",
  },
];

function formatCount(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return String(n);
}

function FlickItem({ flick }: { flick: (typeof FLICKS)[0] }) {
  const [hearts, setHearts] = useState(flick.hearts);
  const [chappals, setChappals] = useState(flick.chappals);
  const [hearted, setHearted] = useState(false);
  const [chappalled, setChappalled] = useState(false);

  const toggleHeart = () => {
    setHearts((v) => (hearted ? v - 1 : v + 1));
    setHearted((v) => !v);
    if (chappalled) {
      setChappals((v) => v - 1);
      setChappalled(false);
    }
  };

  const toggleChappal = () => {
    setChappals((v) => (chappalled ? v - 1 : v + 1));
    setChappalled((v) => !v);
    if (hearted) {
      setHearts((v) => v - 1);
      setHearted(false);
    }
  };

  return (
    <div className="relative w-full h-full snap-start snap-always shrink-0 overflow-hidden bg-black">
      <img
        src={flick.src}
        alt={flick.caption}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/20" />

      {/* Watermark */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/20 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
        <Film className="w-3 h-3 text-cyan-400" />
        <span className="text-[9px] font-black text-white/70 tracking-widest uppercase">
          Flicks powered by Facelook
        </span>
      </div>

      {/* Bottom info + actions */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between p-5 pb-8">
        {/* Left: user + caption */}
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={flick.avatar}
              alt={flick.username}
              className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-lg"
            />
            <div>
              <p className="text-white font-black text-sm leading-none">
                @{flick.username}
              </p>
              <p className="text-white/50 text-[9px]">Facelook Creator</p>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium leading-snug max-w-[220px]">
            {flick.caption}
          </p>
        </div>

        {/* Right: action buttons */}
        <div className="flex flex-col items-center gap-5">
          {/* Heart */}
          <motion.button
            data-testid={`button-heart-flick-${flick.id}`}
            onClick={toggleHeart}
            whileTap={{ scale: 1.4 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md transition-colors ${hearted ? "bg-red-500/30" : "bg-black/30"}`}
            >
              <Heart
                className={`w-6 h-6 transition-colors ${hearted ? "fill-red-500 text-red-500" : "text-white"}`}
              />
            </div>
            <span className="text-white text-[10px] font-bold">
              {formatCount(hearts)}
            </span>
          </motion.button>

          {/* Chappal */}
          <motion.button
            data-testid={`button-chappal-flick-${flick.id}`}
            onClick={toggleChappal}
            whileTap={{ scale: 1.4 }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md transition-colors text-2xl ${chappalled ? "bg-amber-500/30" : "bg-black/30"}`}
            >
              🩴
            </div>
            <span className="text-white text-[10px] font-bold">
              {formatCount(chappals)}
            </span>
          </motion.button>

          {/* Comments */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md bg-black/30">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-[10px] font-bold">
              {formatCount(flick.comments)}
            </span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-11 h-11 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-md bg-black/30">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-[10px] font-bold">Share</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlicksTray({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[250] bg-black"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 36 }}
        >
          {/* Close button */}
          <button
            data-testid="button-close-flicks"
            onClick={onClose}
            className="absolute top-10 right-4 z-[260] bg-black/40 backdrop-blur-xl border border-white/20 p-2.5 rounded-full shadow-xl"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Vertical snap scroll — TikTok style */}
          <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar flex flex-col">
            {FLICKS.map((flick) => (
              <FlickItem key={flick.id} flick={flick} />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
