import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Anchor, MoreHorizontal } from "lucide-react";
import { DemoPost, getUserById } from "@/data/demo";
import { useState, useRef, useCallback } from "react";
import ReactionPicker from "./ReactionPicker";

interface PostCardProps {
  post: DemoPost;
  index: number;
}

export default function PostCard({ post, index }: PostCardProps) {
  const user = getUserById(post.userId);
  const [liked, setLiked] = useState(false);
  const [hooked, setHooked] = useState(post.hooked);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLikeDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => setShowReactions(true), 400);
  }, []);

  const handleLikeUp = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!showReactions) setLiked((v) => !v);
  }, [showReactions]);

  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction);
    setShowReactions(false);
    setLiked(true);
    // Sound would play here with howler.js when backend is connected
  };

  const reactionEmojis: Record<string, string> = {
    heart: "❤️", cry: "😢", sad: "😔", happy: "😄", chappal: "🩴",
  };

  return (
    <motion.article
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <motion.img
            src={user?.avatar}
            alt={user?.name}
            className="w-10 h-10 rounded-full ring-2 ring-primary/30"
            whileTap={{ scale: 0.95 }}
          />
          <div>
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{post.createdAt}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setHooked(!hooked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              hooked ? "bg-primary text-primary-foreground" : "glass hover:bg-white/[0.08]"
            }`}
            whileTap={{ scale: 0.92 }}
          >
            <Anchor className="w-3.5 h-3.5" />
            {hooked ? "Hooked" : "Hook"}
          </motion.button>
          <button className="text-muted-foreground">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="px-4 pb-3 text-sm leading-relaxed">{post.content}</p>

      {/* Image */}
      {post.image && (
        <div className="relative overflow-hidden">
          <img src={post.image} alt="" className="w-full aspect-[3/2] object-cover" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/5" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.button
              onPointerDown={handleLikeDown}
              onPointerUp={handleLikeUp}
              onPointerLeave={() => {
                if (longPressTimer.current) clearTimeout(longPressTimer.current);
              }}
              className={`flex items-center gap-1.5 text-sm ${liked ? "text-red-400" : "text-muted-foreground"}`}
              whileTap={{ scale: 0.9 }}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-red-400" : ""}`} />
              <span>{selectedReaction ? reactionEmojis[selectedReaction] : (post.likes + (liked ? 1 : 0))}</span>
            </motion.button>
            <ReactionPicker isOpen={showReactions} onSelect={handleReaction} onClose={() => setShowReactions(false)} />
          </div>

          <button className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments}</span>
          </button>

          <button className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Share2 className="w-5 h-5" />
            <span>{post.shares}</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}
