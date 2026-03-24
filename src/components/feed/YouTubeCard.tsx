import {
  Zap,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";

export default function YouTubeCard({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mx-4 mb-8 bg-white rounded-[2.8rem] overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md"
    >
      {/* Header Section */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-600 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-rose-100">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[2px] text-rose-500">
                Trending Now
              </span>
            </div>
            <h3 className="font-bold text-[14px] text-gray-800 leading-tight">
              {title}
            </h3>
          </div>
        </div>
        <button className="p-2 bg-gray-50 rounded-full text-gray-400">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* YouTube Video Container */}
      <div className="relative aspect-video w-full bg-black group">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&showinfo=0&autohide=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        {/* Glass Overlay on Top (Optional for Style) */}
        <div className="absolute inset-0 pointer-events-none border-[6px] border-white/5 rounded-[2.8rem]" />
      </div>

      {/* Interaction Bar */}
      <div className="p-5 flex items-center justify-between bg-gray-50/40 backdrop-blur-sm">
        <div className="flex gap-6">
          <button className="group flex items-center gap-2 text-gray-400 hover:text-rose-500 transition-all active:scale-90">
            <div className="p-2 rounded-xl group-hover:bg-rose-50 transition-colors">
              <Heart className="w-5 h-5 group-hover:fill-rose-500" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider">
              Love
            </span>
          </button>

          <button className="group flex items-center gap-2 text-gray-400 hover:text-cyan-500 transition-all active:scale-90">
            <div className="p-2 rounded-xl group-hover:bg-cyan-50 transition-colors">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider">
              Discuss
            </span>
          </button>
        </div>

        <button className="p-2.5 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-black transition-all active:rotate-12">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
