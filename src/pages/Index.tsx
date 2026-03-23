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
  Zap,
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

  // Real Style Image Links
  const realUsers = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop", // Male 1
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop", // Female 1
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", // Male 2
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", // Female 2
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop", // Male 3
  ];

  return (
    <div className="h-screen w-screen bg-[#e8edea] overflow-hidden flex flex-col relative selection:bg-green-200 font-sans">
      {/* --- HEADER (Settings Fix) --- */}
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-green-100 z-[60] flex items-center justify-between px-6 shrink-0 shadow-sm">
        <h1 className="text-2xl font-black tracking-tighter text-blue-600 select-none">
          FACELOOK
        </h1>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full active:scale-90 transition-all"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* --- LEFT SIDE TRAY --- */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-black text-white w-9 h-40 rounded-r-2xl flex items-center justify-center cursor-pointer shadow-2xl border-y border-r border-white/20"
          whileHover={{ width: "45px" }}
        >
          <span className="uppercase font-black text-[10px] tracking-[2px] [writing-mode:vertical-rl] rotate-180">
            FLICKS DVD
          </span>
        </motion.div>

        <main className="flex-1 overflow-y-auto custom-scrollbar pb-24 scroll-smooth">
          <div className="max-w-[620px] mx-auto py-6 px-4 space-y-12">
            {/* --- HOOK REQUESTS (Box Style + 3 Visible) --- */}
            <section className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[11px] font-black text-gray-500 tracking-[3px] uppercase">
                  Hook Requests
                </h3>
                <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1">
                {realUsers.map((url, i) => (
                  <div
                    key={i}
                    className="min-w-[140px] h-[190px] relative bg-white rounded-3xl overflow-hidden shadow-md border border-gray-100 group"
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      alt="hook-user"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 p-3 w-full text-center">
                      <p className="text-[10px] font-black text-white uppercase mb-2">
                        User {i + 1}
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button className="bg-blue-600 text-white p-1.5 rounded-lg shadow-lg hover:scale-110 transition-transform">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button className="bg-white/20 backdrop-blur-md text-white p-1.5 rounded-lg border border-white/30 hover:scale-110 transition-transform">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* --- STORY SECTION --- */}
            <section className="flex gap-4 overflow-x-auto no-scrollbar px-2">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-14 h-14 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer shadow-sm">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-[9px] font-bold text-gray-500 uppercase italic">
                  Your Story
                </span>
              </div>
              {realUsers.map((url, s) => (
                <div
                  key={s}
                  className="flex flex-col items-center gap-2 shrink-0 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-blue-600 shadow-md">
                    <img
                      src={url}
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                      alt="story"
                    />
                  </div>
                  <span className="text-[9px] font-black text-gray-600 uppercase">
                    Active
                  </span>
                </div>
              ))}
            </section>

            {/* --- MATCHMAKING VS STYLE (In My Heart) --- */}
            <section className="bg-[#2d0202] rounded-[3rem] shadow-2xl overflow-hidden border-b-4 border-red-900 relative min-h-[420px] mx-1">
              {/* Petals Animation */}
              <div className="absolute inset-0 pointer-events-none z-10">
                {petals.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 500, opacity: [0, 1, 0], rotate: 360 }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    className="absolute text-red-500/20"
                    style={{ left: `${Math.random() * 100}%` }}
                  >
                    🌹
                  </motion.div>
                ))}
              </div>

              <div className="px-8 py-8 flex flex-col items-center relative z-20">
                <div className="flex items-center gap-3 mb-8">
                  <HeartIcon className="w-5 h-5 text-red-600 fill-red-600 animate-pulse" />
                  <span className="font-black text-white tracking-[6px] text-[10px] uppercase">
                    Velvet Matrimony
                  </span>
                </div>

                {/* THE VS MATCHUP */}
                <div className="flex items-center justify-between w-full gap-2 px-2">
                  {/* Boy */}
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-red-800 shadow-2xl rotate-[-3deg]">
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop"
                        className="w-full h-full object-cover"
                        alt="groom"
                      />
                    </div>
                    <span className="text-[10px] font-black text-white/70 italic uppercase">
                      The Groom
                    </span>
                  </div>

                  {/* VS Middle */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center border-4 border-[#2d0202] shadow-xl z-30">
                      <span className="text-white font-black italic">VS</span>
                    </div>
                    <div className="h-20 w-px bg-gradient-to-b from-transparent via-red-800 to-transparent"></div>
                  </div>

                  {/* Girl */}
                  <div className="flex-1 flex flex-col items-center gap-3">
                    <div className="w-24 h-32 rounded-2xl overflow-hidden border-2 border-red-800 shadow-2xl rotate-[3deg]">
                      <img
                        src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop"
                        className="w-full h-full object-cover"
                        alt="bride"
                      />
                    </div>
                    <span className="text-[10px] font-black text-white/70 italic uppercase">
                      The Bride
                    </span>
                  </div>
                </div>

                <div className="mt-8 text-center space-y-2">
                  <p className="text-white font-black tracking-tighter text-lg italic">
                    "A Perfect Celestial Match"
                  </p>
                  <button className="bg-red-600 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-xl">
                    Get Matched
                  </button>
                </div>
              </div>
            </section>

            <MainFeed />
          </div>
        </main>

        {/* --- RIGHT SIDE TRAY --- */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-blue-600 text-white w-9 h-40 rounded-l-2xl flex items-center justify-center cursor-pointer shadow-2xl border-y border-l border-white/20"
          whileHover={{ width: "45px" }}
        >
          <span className="uppercase font-black text-[10px] tracking-[2px] [writing-mode:vertical-rl] rotate-0">
            CHATIKS 🩴
          </span>
        </motion.div>
      </div>

      {/* --- BOTTOM MENU --- */}
      <nav className="h-20 bg-white border-t border-green-100 fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around px-2">
        <button
          onClick={() => setFlicksOpen(true)}
          className="flex flex-col items-center gap-1"
        >
          <Film className="w-6 h-6 text-gray-400" />
          <span className="text-[8px] font-black uppercase text-gray-400">
            Flicks
          </span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Users className="w-6 h-6 text-gray-400" />
          <span className="text-[8px] font-black uppercase text-gray-400">
            Groups
          </span>
        </button>
        <div
          onClick={() => setProfileOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center -mt-12 border-[6px] border-[#e8edea] shadow-xl text-white cursor-pointer active:scale-90 transition-transform"
        >
          <User className="w-8 h-8" />
        </div>
        <button className="flex flex-col items-center gap-1 relative">
          <Bell className="w-6 h-6 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="text-[8px] font-black uppercase text-gray-400">
            Alerts
          </span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Bookmark className="w-6 h-6 text-gray-400" />
          <span className="text-[8px] font-black uppercase text-gray-400">
            Hooks
          </span>
        </button>
      </nav>

      {/* OVERLAYS */}
      <AnimatePresence>
        {flicksOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="fixed inset-0 z-[110] bg-black"
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
            className="fixed inset-0 z-[110] bg-white flex flex-col"
          >
            <div className="h-16 bg-blue-600 flex items-center justify-between px-6 text-white shrink-0">
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

      {/* SETTINGS PANEL (With Close Fix) */}
      <AnimatePresence>
        {settingsOpen && (
          <div className="fixed inset-0 z-[120]">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 bottom-0 w-[80%] bg-white shadow-2xl flex flex-col"
            >
              <div className="h-16 border-b flex items-center justify-between px-6">
                <h2 className="font-black uppercase tracking-widest">
                  Settings
                </h2>
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="p-2 bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-6">
                <SettingsPanel
                  isOpen={true}
                  onClose={() => setSettingsOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
