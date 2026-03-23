import { useState } from "react";
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
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";

export default function Index() {
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const petals = Array.from({ length: 15 });

  // REAL HUMAN IMAGES (No Avatars)
  const realUsers = [
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop", // Aryan
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", // Zoya
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", // Story 1
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", // Story 2
  ];

  return (
    <div className="h-screen w-screen bg-[#f0f2f5] overflow-hidden flex flex-col relative selection:bg-blue-100 font-sans">
      {/* --- HEADER --- */}
      <header className="h-14 bg-white border-b z-[60] flex items-center justify-between px-6 shrink-0 shadow-sm">
        <h1 className="text-2xl font-black tracking-tighter text-blue-600 select-none">
          FACELOOK
        </h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full active:scale-90"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* --- LEFT SIDE TRAY (Mobile Fixed) --- */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-black text-white w-9 h-40 rounded-r-2xl flex items-center justify-center cursor-pointer shadow-2xl border-y border-r border-white/20"
          whileHover={{ width: "45px" }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="uppercase font-black text-[10px] tracking-[2px] [writing-mode:vertical-rl] rotate-180">
            FLICKS DVD
          </span>
        </motion.div>

        {/* --- MAIN CONTENT (No Box Style) --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f0f2f5] pb-24 scroll-smooth">
          <div className="max-w-[620px] mx-auto py-6 px-4 space-y-10">
            {/* HOOK REQUESTS */}
            <section className="space-y-4 px-2">
              <h3 className="text-[11px] font-black text-gray-500 tracking-[3px] uppercase">
                Hook Requests
              </h3>
              <div className="flex gap-6 overflow-x-auto no-scrollbar py-2">
                {[0, 1].map((i) => (
                  <div
                    key={i}
                    className="min-w-[150px] flex flex-col items-center gap-3"
                  >
                    <img
                      src={realUsers[i]}
                      className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-white"
                      alt="real-user"
                    />
                    <div className="text-center">
                      <p className="text-xs font-black uppercase text-gray-800">
                        {i === 0 ? "Aryan Khan" : "Zoya Ahmed"}
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">
                        Wants to Hook
                      </p>
                    </div>
                    <div className="flex gap-2 w-full">
                      <button className="flex-1 bg-blue-600 text-white p-2 rounded-xl shadow-md">
                        <Check className="w-4 h-4 mx-auto" />
                      </button>
                      <button className="flex-1 bg-white text-gray-300 p-2 rounded-xl border">
                        <X className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* STORIES */}
            <section className="flex gap-4 overflow-x-auto no-scrollbar px-2">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-16 h-16 rounded-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer">
                  <Plus className="w-5 h-5 text-gray-500" />
                </div>
                <span className="text-[10px] font-bold text-gray-500">
                  Add Story
                </span>
              </div>
              {realUsers.map((url, s) => (
                <div
                  key={s}
                  className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full p-0.5 border-2 border-blue-500">
                    <img
                      src={url}
                      className="w-full h-full rounded-full object-cover"
                      alt="story"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-700">
                    User {s + 1}
                  </span>
                </div>
              ))}
            </section>

            {/* VIRAL TRENDING (Real News Style) */}
            <div className="relative h-52 rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-xl mx-2">
              <img
                src="https://images.unsplash.com/photo-1523995444067-ce1368ba967a?w=800&q=80"
                className="absolute inset-0 w-full h-full object-cover"
                alt="news"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-6 flex flex-col justify-end">
                <span className="bg-red-600 text-white text-[9px] font-black w-fit px-2 py-0.5 rounded-sm mb-2 tracking-widest uppercase">
                  Global Alert
                </span>
                <h4 className="font-black text-white text-lg leading-tight uppercase italic tracking-tighter">
                  Strategic Partnerships Reshape Global Diplomacy
                </h4>
                <p className="text-[10px] text-gray-300 font-bold mt-1 uppercase tracking-[2px]">
                  Trending Viral • 1.5M Active
                </p>
              </div>
            </div>

            {/* VELVET RED MATRIMONY (Real Actress Style) */}
            <section className="bg-[#300101] rounded-[3rem] shadow-2xl overflow-hidden border-2 border-[#5e0000] relative min-h-[380px] mx-2">
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {petals.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -50, x: Math.random() * 500, opacity: 0 }}
                    animate={{
                      y: 600,
                      x: Math.random() * 500,
                      opacity: [0, 1, 1, 0],
                      rotate: 720,
                    }}
                    transition={{
                      duration: Math.random() * 6 + 4,
                      repeat: Infinity,
                      delay: Math.random() * i,
                    }}
                    className="absolute text-red-500/30 text-xl"
                  >
                    🌹
                  </motion.div>
                ))}
              </div>
              <div className="px-8 py-6 flex items-center justify-between relative z-20">
                <div className="flex items-center gap-3">
                  <HeartIcon className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" />
                  <span className="font-black text-white tracking-[5px] text-xs italic">
                    IN MY HEART
                  </span>
                </div>
                <button className="text-[9px] bg-red-600 text-white px-5 py-2 rounded-full font-black uppercase tracking-widest shadow-xl">
                  Join Now
                </button>
              </div>
              <div className="px-6 pb-10 relative z-20">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[2.5rem] flex gap-6 text-white">
                  <div className="w-28 h-32 rounded-3xl overflow-hidden shrink-0 border-2 border-red-900 shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop"
                      className="w-full h-full object-cover"
                      alt="bride"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="font-black text-xl tracking-tight mb-1 italic">
                      Sanya Malhotra, 25
                    </h4>
                    <p className="text-[10px] text-red-400 font-black uppercase tracking-[3px] mb-3">
                      Actor & Artist • Delhi
                    </p>
                    <div className="flex gap-2">
                      <span className="bg-red-950/60 px-3 py-1 rounded-full text-[9px] font-black border border-red-900/50 uppercase tracking-tighter">
                        Brahmin
                      </span>
                      <span className="bg-red-950/60 px-3 py-1 rounded-full text-[9px] font-black border border-red-900/50 uppercase tracking-tighter">
                        5'6" Height
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FEED SECTION */}
            <MainFeed />
          </div>
        </main>

        {/* --- RIGHT SIDE TRAY (Mobile Fixed) --- */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-blue-600 text-white w-9 h-40 rounded-l-2xl flex items-center justify-center cursor-pointer shadow-2xl border-y border-l border-white/20"
          whileHover={{ width: "45px" }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="uppercase font-black text-[10px] tracking-[2px] [writing-mode:vertical-rl] rotate-0">
            CHATIKS 🩴
          </span>
        </motion.div>
      </div>

      {/* --- BOTTOM MENU --- */}
      <nav className="h-20 bg-white border-t fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around px-2">
        <button
          onClick={() => setFlicksOpen(true)}
          className="flex flex-col items-center gap-1"
        >
          <Film className="w-6 h-6 text-gray-400" />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
            Flicks
          </span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Users className="w-6 h-6 text-gray-400" />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
            Groups
          </span>
        </button>
        <div
          onClick={() => setProfileOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center -mt-12 border-[6px] border-[#f0f2f5] shadow-xl text-white cursor-pointer active:scale-90 transition-transform"
        >
          <User className="w-8 h-8" />
        </div>
        <button className="flex flex-col items-center gap-1 relative">
          <Bell className="w-6 h-6 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
            Alerts
          </span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Bookmark className="w-6 h-6 text-gray-400" />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
            Hooks
          </span>
        </button>
      </nav>

      {/* TRAYS */}
      <AnimatePresence>
        {flicksOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
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
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="h-16 bg-blue-600 flex items-center justify-between px-6 text-white shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">🩴</span>
                <h2 className="font-black tracking-[4px] uppercase text-sm">
                  Chatiks
                </h2>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="font-bold text-xl"
              >
                ✕
              </button>
            </div>
            <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
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
