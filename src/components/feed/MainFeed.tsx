import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Post } from "@/lib/types";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import YouTubeCard from "./YouTubeCard"; // 👈 Ye import check kar lena

async function fetchPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Post[]) ?? [];
}

function PostSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/[0.08]" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-28 bg-white/[0.08] rounded-full" />
          <div className="h-2.5 w-16 bg-white/[0.05] rounded-full" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-white/[0.06] rounded-full" />
        <div className="h-3 w-4/5 bg-white/[0.06] rounded-full" />
      </div>
      <div className="h-44 w-full bg-white/[0.06] rounded-xl" />
    </div>
  );
}

export default function MainFeed() {
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    refetchInterval: 30000,
  });

  // ── YOUTUBE VIDEOS DATA ──
  const ytVideos = [
    { id: "dQw4w9WgXcQ", title: "Facelook Trending Vibes" },
    { id: "L_LUpnjLp8M", title: "Future of Tech" },
    { id: "y6120QOlsfU", title: "Lofi Beats for Coding" },
    { id: "3JZ_D3ELwOQ", title: "Varanasi Morning Aura" }
  ];

  return (
    <div className="px-4 pb-20"> {/* pb-20 taaki bottom nav ke peeche na chupe */}
      <div className="max-w-lg mx-auto space-y-4">
        <motion.h1
          className="font-display text-xl font-bold gradient-text pt-1 pb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Feed
        </motion.h1>

        <CreatePost />

        {isLoading && (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        )}

        {error && (
          <div className="glass-card p-6 text-center">
            <p className="text-muted-foreground text-sm">Could not load posts. Check your Supabase table setup.</p>
          </div>
        )}

        {!isLoading && !error && posts && posts.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-2xl mb-2">👋</p>
            <p className="font-semibold text-sm">No posts yet</p>
            <p className="text-muted-foreground text-xs mt-1">Be the first to share something!</p>
          </div>
        )}

        {/* ── POSTS + YOUTUBE INJECTION LOGIC ── */}
        {posts?.map((post, i) => {
          // Har 3 posts ke baad ek video dikhega (index 2, 5, 8...)
          const showVideo = (i + 1) % 3 === 0;
          const videoIndex = Math.floor(i / 3) % ytVideos.length;
          const video = ytVideos[videoIndex];

          return (
            <div key={post.id} className="space-y-4">
              <PostCard post={post} index={i} />

              {showVideo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <YouTubeCard videoId={video.id} title={video.title} />
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}