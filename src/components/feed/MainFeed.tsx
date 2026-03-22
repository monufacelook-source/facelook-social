import { demoPosts } from "@/data/demo";
import PostCard from "./PostCard";
import { motion } from "framer-motion";

export default function MainFeed() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 pt-16 px-4 feed-gradient">
      <div className="max-w-lg mx-auto space-y-4">
        <motion.h1
          className="font-display text-2xl font-bold gradient-text py-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Your Feed
        </motion.h1>
        {demoPosts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </div>
  );
}
