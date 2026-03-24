import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Film,
  Bell,
  Search,
  Zap,
  Flame,
  MessageCircle,
  Heart,
  Share2,
  MoreHorizontal,
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

  // Debugging: Button check karne ke liye
  useEffect(() => {
    console.log("FACELOOK INDEX LOADED. Profile State:", profileOpen);
  }, [profileOpen]);

  return (
    <div className="h-screen w-screen bg-[#0b0e14] overflow-hidden flex flex-col relative font-sans text-white">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* --- HEADER --- */}
      <header className="h-16 bg-black/40 backdrop-blur-xl border-b border-white/5 z-[60] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 italic uppercase">
            FACELOOK
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10">
            <Search className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT TAB - FLICKS */}
        <div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-gradient-to-b from-purple-600 to-blue-700 text-white w-10 h-44 rounded-r-[2rem] flex items-center justify-center cursor-pointer shadow-2xl border-r border-white/20 active:scale-95 transition-all"
        >
          <span className="uppercase font-black text-[10px] tracking-[4px] [writing-mode:vertical-rl] rotate-180 opacity-80">
            FLICKS
          </span>
        </div>

        {/* MAIN FEED */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="max-w-[580px] mx-auto py-8 space-y-8 px-4">
            {/* PROMO CARD */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-900/40 to-black/40 border border-white/10 p-6">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-4 py-1.5 rounded-full">
                Trending Now
              </span>
              <h2 className="text-3xl font-bold mt-5 leading-tight">
                Digital <br />
                <span className="text-cyan-400">Identity</span>
              </h2>
              <button className="mt-6 bg-white text-black font-black px-6 py-2.5 rounded-2xl text-xs">
                START EXPLORING
              </button>
            </div>

            {/* THE FEED */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-[3px] opacity-40 px-2">
                Recent Posts
              </h3>
              <MainFeed />
            </div>
          </div>
        </main>

        {/* RIGHT TAB - CHAT */}
        <div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-white text-black w-10 h-44 rounded-l-[2rem] flex items-center justify-center cursor-pointer shadow-2xl active:scale-95 transition-all"
        >
          <span className="uppercase font-black text-[10px] tracking-[4px] [writing-mode:vertical-rl] opacity-80">
            MESSAGES
          </span>
        </div>
      </div>

      {/* --- FLOATING BOTTOM NAV (THE FIX) --- */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-[100] px-6">
        <nav className="h-20 w-full max-w-md bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] flex items-center justify-around px-4 shadow-2xl overflow-visible">
          <button
            onClick={() => setFlicksOpen(true)}
            className="p-3 text-gray-400 hover:text-cyan-400"
          >
            <Film />
          </button>
          <button className="p-3 text-gray-400 hover:text-cyan-400">
            <Heart />
          </button>

          {/* PROFILE BUTTON - Z-INDEX CHECKED */}
          <div
            onClick={() => {
              console.log("CLICK DETECTED: Opening Profile...");
              setProfileOpen(true);
            }}
            className="w-16 h-16 bg-gradient-to-tr from-cyan-400 to-purple-600 rounded-3xl flex items-center justify-center -mt-14 border-[5px] border-[#0b0e14] shadow-xl text-white cursor-pointer active:scale-90 hover:rotate-3 transition-all relative z-[110]"
          >
            <User className="w-8 h-8" />
          </div>

          <button
            onClick={() => setChatOpen(true)}
            className="p-3 text-gray-400 hover:text-cyan-400"
          >
            <MessageCircle />
          </button>
          <button className="p-3 text-gray-400 hover:text-cyan-400">
            <Bell />
          </button>
        </nav>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[200] bg-[#0b0e14]"
          >
            <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
          </motion.div>
        )}

        {/* AGAR YE "GOL-GOL" GHUME TOH ISKA MATLAB ProfileSection.tsx KHARAB HAI */}
        {profileOpen && (
          <ProfileSection
            onBack={() => {
              console.log("Closing Profile...");
              setProfileOpen(false);
            }}
          />
        )}

        {flicksOpen && (
          <FlicksTray isOpen={true} onClose={() => setFlicksOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
