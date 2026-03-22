import { motion } from "framer-motion";
import { Anchor, GraduationCap, MapPin, Heart } from "lucide-react";
import { demoUsers } from "@/data/demo";

export default function HeartSection() {
  return (
    <div className="flex-1 overflow-y-auto pb-20 pt-16 px-4 feed-gradient">
      <div className="max-w-lg mx-auto">
        <motion.div
          className="py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400 fill-red-400" />
            In My Heart
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Find your special someone</p>
        </motion.div>

        <div className="space-y-4">
          {demoUsers.map((user, i) => (
            <motion.div
              key={user.id}
              className="glass-card p-5 space-y-3"
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-start gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-secondary/30"
                />
                <div className="flex-1">
                  <h3 className="font-display font-bold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{user.bio}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" /> {user.education}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {user.location}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span><strong className="text-foreground">{user.hookCount}</strong> Hooks</span>
                  <span><strong className="text-foreground">{user.friendCount}</strong> Friends</span>
                </div>
                <motion.button
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold"
                  whileTap={{ scale: 0.92 }}
                >
                  <Anchor className="w-3.5 h-3.5" /> Hook
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
