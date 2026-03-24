import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Anchor,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Post } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { isHookPartner, cn } from "@/lib/utils";
import ReactionPicker from "./ReactionPicker";

interface PostCardProps {
  post: Post;
  index: number;
}

const reactionEmojis: Record<string, string> = {
  heart: "❤️",
  cry: "😢",
  sad: "😔",
  happy: "😄",
  chappal: "🩴",
};

// --- Dhuein wala animation keyframes ---
const smokeAnimation = {
  exit: {
    opacity: 0,
    y: -100,
    scale: 1.2,
    filter: "blur(20px)",
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function PostCard({ post, index }: PostCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const author = post.profiles;

  const [hooked, setHooked] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [localLikes, setLocalLikes] = useState(post.likes ?? 0);
  const [relation, setRelation] = useState<any>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchRelation = async () => {
      if (!user || user.id === post.user_id) return;
      const { data } = await supabase
        .from("friendships")
        .select("*")
        .or(
          `and(requester_id.eq.${user.id},addressee_id.eq.${post.user_id}),and(requester_id.eq.${post.user_id},addressee_id.eq.${user.id})`,
        )
        .single();
      setRelation(data);
    };
    fetchRelation();
  }, [user, post.user_id]);

  const isMyPost = user?.id === post.user_id;
  const isHook = isHookPartner(relation);
  const canDelete = isMyPost || isHook;

  const handleDeletePost = async () => {
    const confirmDelete = window.confirm(
      isHook
        ? "Hook Power: Are you sure you want to delete your partner's post? 🪝🔥"
        : "Delete this post?",
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    } else {
      alert("Error deleting post: " + error.message);
    }
  };

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

    await supabase
      .from("post_reactions")
      .upsert(
        { post_id: post.id, user_id: user.id, reaction },
        { onConflict: "post_id,user_id" },
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
    <AnimatePresence mode="wait">
      <motion.article
        key={post.id}
        className={cn(
          "glass-card overflow-hidden transition-all",
          isHook && "border-rose-500/30 shadow-[0_0_20px_rgba(225,29,72,0.15)]",
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={smokeAnimation.exit}
        transition={{ delay: index * 0.06, duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold flex-shrink-0 transition-all",
                isHook
                  ? "ring-2 ring-rose-500 animate-pulse"
                  : "ring-2 ring-primary/30 bg-gradient-to-br from-primary to-secondary",
              )}
            >
              {author?.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarFallback
              )}
            </div>
            <div>
              <p className="font-semibold text-sm flex items-center gap-1">
                {displayName}
                {isHook && (
                  <span className="text-rose-500 text-[10px] font-bold uppercase">
                    Partner 🪝
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {displayUsername && <span>{displayUsername} · </span>}
                {timeAgo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDeletePost}
                className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <motion.button
              onClick={() => setHooked(!hooked)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                hooked
                  ? "bg-primary text-primary-foreground"
                  : "glass hover:bg-white/[0.08]",
              )}
              whileTap={{ scale: 0.92 }}
            >
              <Anchor className="w-3.5 h-3.5" />
              {hooked ? "Hooked" : "Hook"}
            </motion.button>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <p className="px-4 pb-3 text-sm leading-relaxed">{post.content}</p>
        )}

        {/* Image - FIXED: Now checks both image_url and media_url */}
        {(post.image_url || post.media_url) && (
          <div className="relative overflow-hidden">
            <img
              src={post.image_url || post.media_url}
              alt=""
              className="w-full aspect-[3/2] object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="relative">
            <motion.button
              onPointerDown={handleLikeDown}
              onPointerUp={handleLikeUp}
              onClick={selectedReaction ? removeReaction : undefined}
              className={cn(
                "flex items-center gap-1.5 text-sm transition-colors",
                selectedReaction ? "text-red-400" : "text-muted-foreground",
              )}
              whileTap={{ scale: 0.9 }}
            >
              {selectedReaction ? (
                <span className="text-base leading-none">
                  {reactionEmojis[selectedReaction]}
                </span>
              ) : (
                <Heart className="w-5 h-5" />
              )}
              <span>{localLikes}</span>
            </motion.button>
            <ReactionPicker
              isOpen={showReactions}
              onSelect={handleReaction}
              onClose={() => setShowReactions(false)}
            />
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
      </motion.article>
    </AnimatePresence>
  );
}
