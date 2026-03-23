import { useState, useEffect } from "react";
import {
  Settings,
  User,
  Film,
  MessageSquare,
  Heart as HeartIcon,
  Check,
  X,
  Plus,
  Bell,
  Users,
  Bookmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import HeartSection from "@/components/feed/HeartSection";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";

export default function Index() {
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Optimized Rose Petals Animation
  const petals = Array.from({ length: 12 });

  return (
    <div className="h-screen w-screen bg-[#f0f2f5] overflow-hidden flex flex-col relative selection:bg-blue-100">
      {/* --- 1. TOP HEADER --- */}
      <header className="h-14 bg-white border-b shadow-sm z-[60] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-2xl font-black tracking-tighter text-blue-600 select-none">
          FACELOOK
        </h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* --- 2. LEFT SIDE: FLICKS TRAY (Wall Attached) --- */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-black text-white w-9 h-44 rounded-r-3xl flex items-center justify-center cursor-pointer shadow-[5px_0_15px_rgba(0,0,0,0.3)] border-y border-r border-white/20 hidden md:flex"
          whileHover={{ width: "45px", backgroundColor: "#1a1a1a" }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="uppercase font-black text-[11px] tracking-[3px] [writing-mode:vertical-rl] rotate-180 select-none">
            FLICKS DVD
          </span>
        </motion.div>

        {/* --- 3. MIDDLE CONTENT --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f8f9fa] pb-24 scroll-smooth">
          <div className="max-w-[620px] mx-auto py-6 px-4 space-y-8">
            {/* --- BIG HOOKS SECTION --- */}
            <section className="bg-white rounded-[2rem] p-5 shadow-sm border border-blue-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[11px] font-black text-blue-500 tracking-[2px] uppercase">
                  Hook Requests
                </h3>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                {[1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="min-w-[150px] bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-3"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-2 border-orange-400 p-1">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=h${i}`}
                          className="rounded-full bg-blue-50"
                          alt="user"
                        />
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-tighter">
                        Priya Sharma
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold">
                        2 mutual friends
                      </p>
                    </div>
                    <div className="flex gap-2 w-full mt-1">
                      <button className="flex-1 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                        <Check className="w-4 h-4 mx-auto" />
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-500 p-2 rounded-xl hover:bg-gray-200 transition-colors">
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </motion.div>
                ))}
                <button className="min-w-[150px] border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-4 text-center group hover:border-blue-300 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-blue-50">
                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 group-hover:text-blue-500">
                    Find More Hooks
                  </p>
                </button>
              </div>
            </section>

            {/* --- STORY SECTION --- */}
            <section className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-dashed border-blue-400 p-1 flex items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
                  <Plus className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">
                  My Story
                </span>
              </div>
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-green-500 p-1 group-hover:scale-105 transition-transform">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=s${s}`}
                      className="w-full h-full rounded-full shadow-inner"
                      alt="story"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600">
                    User {s}
                  </span>
                </div>
              ))}
            </section>

            {/* --- VIRAL SECTION --- */}
            <div className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 p-5 rounded-[2rem] shadow-xl text-white relative overflow-hidden group cursor-pointer">
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-xl animate-bounce">🔥</span>
                  <div>
                    <h4 className="font-black italic tracking-widest text-sm">
                      VIRAL ON FACELOOK
                    </h4>
                    <p className="text-[9px] font-bold opacity-80 uppercase">
                      Top Trending Posts
                    </p>
                  </div>
                </div>
                <button className="text-[10px] bg-white text-black px-4 py-1.5 rounded-full font-black uppercase hover:bg-gray-100 transition-colors">
                  Explore
                </button>
              </div>
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* --- VELVET RED MATRIMONY --- */}
            <section className="bg-[#300101] rounded-[2.5rem] shadow-2xl overflow-hidden border-2 border-[#5e0000] relative min-h-[350px]">
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {petals.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -50, x: Math.random() * 500, opacity: 0 }}
                    animate={{
                      y: 500,
                      x: Math.random() * 500,
                      opacity: [0, 1, 1, 0],
                      rotate: 720,
                    }}
                    transition={{
                      duration: Math.random() * 6 + 4,
                      repeat: Infinity,
                      delay: Math.random() * 10,
                    }}
                    className="absolute text-red-500/60 text-xl"
                  >
                    🌹
                  </motion.div>
                ))}
              </div>

              <div className="px-6 py-5 bg-[#4a0101] flex items-center justify-between border-b border-red-900/30 relative z-20">
                <div className="flex items-center gap-3">
                  <HeartIcon className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                  <span className="font-black text-white tracking-[4px] text-xs italic">
                    IN MY HEART
                  </span>
                </div>
                <button className="text-[10px] bg-red-600 text-white px-4 py-1.5 rounded-full font-black uppercase border border-red-400/30 shadow-lg">
                  Join Matrimony
                </button>
              </div>

              <div className="p-5 space-y-4 relative z-20">
                {[1, 2].map((m) => (
                  <motion.div
                    key={m}
                    whileHover={{
                      scale: 1.02,
                      backgroundColor: "rgba(255,255,255,0.08)",
                    }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-[2rem] flex gap-5 text-white shadow-inner"
                  >
                    <div className="w-24 h-28 rounded-2xl overflow-hidden shrink-0 border-2 border-red-900/50 shadow-2xl">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=m${m * 10}`}
                        className="w-full h-full object-cover bg-red-50"
                        alt="profile"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-black text-base tracking-tight mb-1">
                        {m === 1 ? "Vikram Singh" : "Ananya Iyer"},{" "}
                        {m === 1 ? "28" : "26"}
                      </h4>
                      <p className="text-[10px] text-red-400 font-black uppercase tracking-[2px] mb-2">
                        {m === 1 ? "Software Engineer" : "Doctor"} •{" "}
                        {m === 1 ? "18LPA" : "15LPA"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-red-950/50 px-2 py-1 rounded-md text-[9px] font-black border border-red-900/50">
                          {m === 1 ? "Kshatriya" : "Brahmin"}
                        </span>
                        <span className="bg-red-950/50 px-2 py-1 rounded-md text-[9px] font-black border border-red-900/50">
                          Lucknow, UP
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* --- FEED SECTION --- */}
            <div className="pt-2">
              <MainFeed />
            </div>
          </div>
        </main>

        {/* --- 4. RIGHT SIDE: CHATIKS TRAY (Wall Attached) --- */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-blue-600 text-white w-9 h-44 rounded-l-3xl flex items-center justify-center cursor-pointer shadow-[-5px_0_15px_rgba(0,0,0,0.1)] border-y border-l border-white/20 hidden md:flex"
          whileHover={{ width: "45px", backgroundColor: "#2563eb" }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="uppercase font-black text-[11px] tracking-[3px] [writing-mode:vertical-rl] rotate-0 select-none">
            CHATIKS 🩴
          </span>
        </motion.div>
      </div>

      {/* --- 5. BOTTOM MENU --- */}
      <nav className="h-16 bg-white border-t fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <button
          onClick={() => setFlicksOpen(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <Film className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-blue-600">
            Flicks
          </span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <Users className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-blue-600">
            Groups
          </span>
        </button>
        <div
          onClick={() => setProfileOpen(true)}
          className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center -mt-10 border-4 border-[#f0f2f5] shadow-xl shadow-blue-200 text-white cursor-pointer active:scale-90 transition-transform"
        >
          <User className="w-7 h-7" />
        </div>
        <button className="flex flex-col items-center gap-1 group relative">
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
          <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-blue-600">
            Alerts
          </span>
        </button>
        <button className="flex flex-col items-center gap-1 group">
          <Bookmark className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-blue-600">
            Hooks
          </span>
        </button>
      </nav>

      {/* --- FULL SCREEN TRAYS --- */}
      <AnimatePresence>
        {flicksOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 120 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <FlicksTray
              isOpen={flicksOpen}
              onClose={() => setFlicksOpen(false)}
            />
          </motion.div>
        )}

        {chatOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 35, stiffness: 120 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="h-16 bg-blue-600 flex items-center justify-between px-6 text-white shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center italic font-black">
                  🩴
                </div>
                <h2 className="font-black tracking-[4px] uppercase text-sm">
                  Chatiks
                </h2>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center font-bold hover:bg-black/20 transition-all"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <AnimatePresence>
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
