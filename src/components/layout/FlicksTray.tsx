import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Share2, MessageCircle, Anchor } from "lucide-react";
import { demoFlicks, getUserById } from "@/data/demo";
import { useState } from "react";

interface FlicksTrayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FlicksTray({ isOpen, onClose }: FlicksTrayProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flick = demoFlicks[currentIndex];
  const user = getUserById(flick.userId);

  const nextFlick = () => setCurrentIndex((i) => (i + 1) % demoFlicks.length);
  const prevFlick = () => setCurrentIndex((i) => (i - 1 + demoFlicks.length) % demoFlicks.length);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
        >
          {/* Flick Content */}
          <div className="relative w-full h-full" onClick={nextFlick}>
            <img
              src={flick.thumbnail}
              alt={flick.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30" />

            {/* Close */}
            <motion.button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="absolute top-5 left-5 glass w-10 h-10 rounded-full flex items-center justify-center z-10"
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            {/* User Info */}
            <div className="absolute bottom-24 left-5 right-16">
              <div className="flex items-center gap-3 mb-3">
                <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full border-2 border-primary" />
                <div>
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.username}</p>
                </div>
              </div>
              <p className="text-sm">{flick.caption}</p>
            </div>

            {/* Action Buttons */}
            <div className="absolute right-4 bottom-28 flex flex-col gap-5">
              {[
                { icon: Heart, count: flick.likes, color: "text-red-400" },
                { icon: MessageCircle, count: flick.comments, color: "text-foreground" },
                { icon: Share2, count: flick.shares, color: "text-foreground" },
                { icon: Anchor, count: 0, color: "text-primary" },
              ].map(({ icon: Icon, count, color }, i) => (
                <motion.button
                  key={i}
                  className="flex flex-col items-center gap-1"
                  whileTap={{ scale: 0.85 }}
                >
                  <div className="glass w-11 h-11 rounded-full flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  {count > 0 && <span className="text-[10px] font-medium">{count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}</span>}
                </motion.button>
              ))}
            </div>

            {/* Progress Dots */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-1.5">
              {demoFlicks.map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 rounded-full transition-all ${
                    i === currentIndex ? "w-6 bg-primary" : "w-3 bg-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
