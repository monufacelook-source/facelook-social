import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Film,
  Bell,
  Search,
  Users,
  Bookmark,
  Heart,
  X,
  Check,
  Flame,
  Zap,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// COMPONENTS
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";

export default function Index() {
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#0f0c29] overflow-hidden flex flex-col relative font-sans text-white selection:bg-cyan-500/30">
      {/* Background Glows (Image wala feel lane ke liye) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full" />

      {/* --- HEADER (Glassmorphism) --- */}
      <header className="h-16 bg-white/5 backdrop-blur-2xl border-b border-white/10 z-[60] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 italic">
            FACELOOK
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
            <Search className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT TAB (FLICKS) */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-gradient-to-b from-purple-600 to-blue-700 text-white w-10 h-44 rounded-r-[2rem] flex items-center justify-center cursor-pointer shadow-[10px_0_30px_rgba(0,0,0,0.3)] border-y border-r border-white/20"
          whileHover={{ width: "50px" }}
        >
          <span className="uppercase font-black text-[10px] tracking-[3px] [writing-mode:vertical-rl] rotate-180">
            FLICKS REELS
          </span>
        </motion.div>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32 relative">
          <div className="max-w-[620px] mx-auto py-8 space-y-8">
            {/* FEATURED CARD (Dribbble Style) */}
            <section className="px-4">
              <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-900/40 to-black/40 border border-white/10 p-1">
                <div className="bg-[#1a1635] rounded-[2.3rem] p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Flame className="w-32 h-32 text-cyan-400" />
                  </div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-3 py-1 rounded-full">
                    Trending Now
                  </span>
                  <h2 className="text-3xl font-bold mt-4 leading-tight">
                    Explore the <br />
                    <span className="text-cyan-400">Digital Realm</span>
                  </h2>
                  <p className="text-gray-400 text-sm mt-3 max-w-[200px]">
                    Connect with people across the globe in style.
                  </p>
                  <button className="mt-6 bg-white text-black font-bold px-6 py-2.5 rounded-2xl text-sm hover:scale-105 transition-transform">
                    Get Started
                  </button>
                </div>
              </div>
            </section>

            {/* FEED SECTION */}
            <div className="px-0">
              <div className="px-6 mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Recent Activity
                </h3>
                <div className="h-[1px] flex-1 bg-white/10 mx-4"></div>
              </div>
              <MainFeed />
            </div>
          </div>
        </main>

        {/* RIGHT TAB (CHAT) */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-white text-black w-10 h-44 rounded-l-[2rem] flex items-center justify-center cursor-pointer shadow-2xl"
          whileHover={{ width: "50px" }}
        >
          <span className="uppercase font-black text-[10px] tracking-[3px] [writing-mode:vertical-rl]">
            MESSAGES ⚡
          </span>
        </motion.div>
      </div>

      {/* --- BOTTOM NAV (Floating Glass) --- */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-[70] px-6">
        <nav className="h-20 w-full max-w-md bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] flex items-center justify-around px-4 shadow-2xl">
          <button
            onClick={() => setFlicksOpen(true)}
            className="p-3 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <Film className="w-6 h-6" />
          </button>
          <button className="p-3 text-gray-400 hover:text-cyan-400 transition-colors">
            <Users className="w-6 h-6" />
          </button>

          <div
            onClick={() => setProfileOpen(true)}
            className="w-16 h-16 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-3xl flex items-center justify-center -mt-12 border-[4px] border-[#0f0c29] shadow-[0_15px_30px_rgba(34,211,238,0.3)] text-white cursor-pointer active:scale-90 transition-all"
          >
            <User className="w-8 h-8" />
          </div>

          <button
            onClick={() => setChatOpen(true)}
            className="p-3 text-gray-400 hover:text-cyan-400 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
          <button className="p-3 text-gray-400 hover:text-cyan-400 transition-colors">
            <Bell className="w-6 h-6" />
          </button>
        </nav>
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-[200] bg-[#0f0c29]"
          >
            <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
          </motion.div>
        )}
        {flicksOpen && (
          <FlicksTray isOpen={true} onClose={() => setFlicksOpen(false)} />
        )}
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
