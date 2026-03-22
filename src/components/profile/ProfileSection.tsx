import { motion } from "framer-motion";
import { Anchor, Users, ImageIcon, ArrowLeft } from "lucide-react";
import { demoUsers, demoPosts } from "@/data/demo";

interface ProfileSectionProps {
  onBack: () => void;
}

export default function ProfileSection({ onBack }: ProfileSectionProps) {
  const user = demoUsers[0]; // Demo: show first user as current
  const userPosts = demoPosts.filter((p) => p.image);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto pb-20">
      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-br from-primary/40 via-secondary/30 to-primary/20">
        <motion.button
          onClick={onBack}
          className="absolute top-5 left-5 glass w-10 h-10 rounded-full flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Avatar & Info */}
      <div className="px-5 -mt-12 relative">
        <motion.img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-background shadow-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        />
        <h1 className="font-display text-2xl font-bold mt-3">{user.name}</h1>
        <p className="text-sm text-muted-foreground">{user.username}</p>
        <p className="text-sm mt-2">{user.bio}</p>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          {[
            { icon: ImageIcon, label: "Posts", count: user.postCount },
            { icon: Anchor, label: "Hooks", count: user.hookCount },
            { icon: Users, label: "Friends", count: user.friendCount },
          ].map(({ icon: Icon, label, count }, i) => (
            <motion.div
              key={label}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                <Icon className="w-4 h-4 text-primary" />
                {count}
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="px-4 mt-6">
        <h2 className="font-display font-semibold text-sm text-muted-foreground mb-3">Photos & Videos</h2>
        <div className="grid grid-cols-3 gap-1 rounded-xl overflow-hidden">
          {userPosts.map((post, i) => (
            <motion.div
              key={post.id}
              className="aspect-square relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <img src={post.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/5" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
