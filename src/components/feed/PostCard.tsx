import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Anchor, MoreHorizontal } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import ReactionPicker from "./ReactionPicker";

interface PostCardProps {
  post: Post;
  index: number;
}

const reactionEmojis: Record<string, string> = {
  heart: "❤️", cry: "😢", sad: "😔", happy: "😄", chappal: "🩴",
};

export default function PostCard({ post, index }: PostCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const author = post.profiles;

  const [hooked, setHooked] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [localLikes, setLocalLikes] = useState(post.likes ?? 0);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timeAgo = post.created_at
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : "";

  const handleLikeDown = useCallback(() => {
    longPressTimer.current = setTimeout(() => setShowReactions(true), 400);
  }, []);

  const handleLikeUp = useCallback(() => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    if (!showReactions && !selectedReaction) {
      handleReaction("heart");
    }
  }, [showReactions, selectedReaction]);

  const handleReaction = async (reaction: string) => {
    if (!user) return;
    setSelectedReaction(reaction);
    setShowReactions(false);
    setLocalLikes((v) => v + 1);

    await supabase.from("post_reactions").upsert(
      { post_id: post.id, user_id: user.id, reaction },
      { onConflict: "post_id,user_id" }
    );

    await supabase
      .from("posts")
      .update({ likes: localLikes + 1 })
      .eq("id", post.id);

    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const removeReaction = async () => {
    if (!user || !selectedReaction) return;
    setSelectedReaction(null);
    setLocalLikes((v) => Math.max(0, v - 1));

    await supabase
      .from("post_reactions")
      .delete()
      .eq("post_id", post.id)
      .eq("user_id", user.id);

    await supabase
      .from("posts")
      .update({ likes: Math.max(0, localLikes - 1) })
      .eq("id", post.id);

    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const avatarFallback = author?.full_name?.[0]?.toUpperCase() ?? "?";
  const displayName = author?.full_name ?? author?.username ?? "Anonymous";
  const displayUsername = author?.username ? `@${author.username}` : "";

  return (
    <motion.article
      className="glass-card overflow-hidden"
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      data-testid={`card-post-${post.id}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full ring-2 ring-primary/30 overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {author?.avatar_url ? (
              <img src={author.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              avatarFallback
            )}
          </div>
          <div>
            <p className="font-semibold text-sm">{displayName}</p>
            <p className="text-xs text-muted-foreground">{displayUsername && <span>{displayUsername} · </span>}{timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setHooked(!hooked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              hooked ? "bg-primary text-primary-foreground" : "glass hover:bg-white/[0.08]"
            }`}
            whileTap={{ scale: 0.92 }}
            data-testid={`button-hook-${post.id}`}
          >
            <Anchor className="w-3.5 h-3.5" />
            {hooked ? "Hooked" : "Hook"}
          </motion.button>
          <button className="text-muted-foreground" data-testid={`button-more-${post.id}`}>
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 pb-3 text-sm leading-relaxed">{post.content}</p>
      )}

      {/* Image */}
      {post.image_url && (
        <div className="relative overflow-hidden">
          <img src={post.image_url} alt="" className="w-full aspect-[3/2] object-cover" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/5" />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="relative">
          <motion.button
            onPointerDown={handleLikeDown}
            onPointerUp={handleLikeUp}
            onPointerLeave={() => {
              if (longPressTimer.current) clearTimeout(longPressTimer.current);
            }}
            onClick={selectedReaction ? removeReaction : undefined}
            className={`flex items-center gap-1.5 text-sm transition-colors ${selectedReaction ? "text-red-400" : "text-muted-foreground"}`}
            whileTap={{ scale: 0.9 }}
            data-testid={`button-react-${post.id}`}
          >
            {selectedReaction ? (
              <span className="text-base leading-none">{reactionEmojis[selectedReaction]}</span>
            ) : (
              <Heart className="w-5 h-5" />
            )}
            <span>{localLikes}</span>
          </motion.button>
          <ReactionPicker isOpen={showReactions} onSelect={handleReaction} onClose={() => setShowReactions(false)} />
        </div>

        <button className="flex items-center gap-1.5 text-sm text-muted-foreground" data-testid={`button-comment-${post.id}`}>
          <MessageCircle className="w-5 h-5" />
          <span>{post.comments}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-muted-foreground" data-testid={`button-share-${post.id}`}>
          <Share2 className="w-5 h-5" />
          <span>{post.shares}</span>
        </button>
      </div>
    </motion.article>
  );
}
