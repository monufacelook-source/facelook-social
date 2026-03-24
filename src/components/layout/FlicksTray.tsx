import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, Film, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

const FLICKS = [
  {
    id: 1,
    username: "zahra.k",
    likes: "12.4K",
    caption: "Golden hour vibes ✨ #facelook",
    src: "https://images.unsplash.com/photo-1504276048855-f3d60e69632f?w=500&h=900&fit=crop",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80",
  },
  {
    id: 2,
    username: "dev.raj",
    likes: "8.9K",
    caption: "Mountain life hits different 🏔️",
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=900&fit=crop",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
  },
  {
    id: 3,
    username: "mia.lux",
    likes: "34K",
    caption: "Road trip never ends 🚗🌅",
    src: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=900&fit=crop",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80",
  },
  {
    id: 4,
    username: "aria.v",
    likes: "21K",
    caption: "City lights never sleep 🌆",
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500&h=900&fit=crop",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80",
  },
];

export default function FlicksTray({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const flick = FLICKS[current];

  const goNext = () => setCurrent((p) => Math.min(p + 1, FLICKS.length - 1));
  const goPrev = () => setCurrent((p) => Math.max(p - 1, 0));

  const toggleLike = (id: number) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[240] bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-y-0 left-0 w-[85vw] max-w-[380px] z-[250] flex flex-col bg-black overflow-hidden"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 38 }}
          >
            <img
              src={flick.src}
              alt={flick.caption}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

            <div className="relative z-10 flex items-center justify-between p-4 pt-10">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-white fill-white" />
                <span className="text-white font-black text-lg italic tracking-tight">
                  FLICKS
                </span>
              </div>
              <button
                data-testid="button-close-flicks"
                onClick={onClose}
                className="bg-white/15 backdrop-blur-xl border border-white/20 p-2 rounded-full"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-end p-5 pb-10">
              <div className="flex items-end justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={flick.avatar}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                      alt={flick.username}
                    />
                    <span className="text-white font-black text-sm">
                      @{flick.username}
                    </span>
                  </div>
                  <p className="text-white/90 text-sm font-medium leading-snug">
                    {flick.caption}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-5">
                  <button
                    data-testid={`button-like-flick-${flick.id}`}
                    onClick={() => toggleLike(flick.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <motion.div whileTap={{ scale: 1.4 }}>
                      <Heart
                        className={`w-7 h-7 ${liked.has(flick.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                      />
                    </motion.div>
                    <span className="text-white text-[10px] font-bold">
                      {flick.likes}
                    </span>
                  </button>
                  <button className="flex flex-col items-center gap-1">
                    <Share2 className="w-6 h-6 text-white" />
                    <span className="text-white text-[10px] font-bold">
                      Share
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8">
                <button
                  data-testid="button-flick-prev"
                  onClick={goPrev}
                  disabled={current === 0}
                  className="bg-white/15 backdrop-blur-xl border border-white/20 p-3 rounded-full disabled:opacity-30"
                >
                  <ChevronUp className="w-5 h-5 text-white" />
                </button>
                <div className="flex gap-1.5">
                  {FLICKS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 rounded-full transition-all ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                    />
                  ))}
                </div>
                <button
                  data-testid="button-flick-next"
                  onClick={goNext}
                  disabled={current === FLICKS.length - 1}
                  className="bg-white/15 backdrop-blur-xl border border-white/20 p-3 rounded-full disabled:opacity-30"
                >
                  <ChevronDown className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
