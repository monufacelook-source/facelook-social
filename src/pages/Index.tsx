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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// COMPONENTS IMPORT
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";

export default function Index() {
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Matchmaking Demo States
  const [matchIdx, setMatchIdx] = useState(0);
  const grooms = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchIdx((prev) => (prev + 1) % grooms.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#d1dbd3] overflow-hidden flex flex-col relative font-sans text-black">
      {/* --- HEADER --- */}
      <header className="h-14 bg-white/60 backdrop-blur-xl border-b border-green-200/50 z-[60] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-2xl font-black tracking-tighter text-blue-600 italic">
          FACELOOK
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 hover:bg-green-100 rounded-full transition-all"
          >
            <Search className="w-5 h-5 text-green-700" />
          </button>
          <button className="p-2 hover:bg-green-100 rounded-full transition-all">
            <Settings className="w-5 h-5 text-green-700" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* FLICKS SIDE TAB */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-black text-white w-9 h-40 rounded-r-2xl flex items-center justify-center cursor-pointer shadow-2xl"
          whileHover={{ width: "45px" }}
        >
          <span className="uppercase font-black text-[10px] tracking-[2px] [writing-mode:vertical-rl] rotate-180 opacity-70">
            FLICKS DVD
          </span>
        </motion.div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="max-w-[620px] mx-auto py-6 space-y-10">
            {/* VIRAL SECTION */}
            <section className="px-4">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <h3 className="text-[11px] font-black text-green-900 tracking-[3px] uppercase italic">
                  Viral on Facelook
                </h3>
              </div>
              <div className="min-w-full h-[160px] bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-5 relative overflow-hidden shadow-xl border border-white/20">
                <p className="text-white font-black text-lg leading-tight mt-3">
                  Welcome Back to <br /> Facelook Social
                </p>
              </div>
            </section>

            {/* FEED */}
            <div className="px-0">
              <MainFeed />
            </div>
          </div>
        </main>

        {/* CHAT SIDE TAB */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-blue-600 text-white w-9 h-40 rounded-l-2xl flex items-center justify-center cursor-pointer shadow-2xl"
          whileHover={{ width: "45px" }}
        >
          <span className="uppercase font-black text-[10px] tracking-[3px] [writing-mode:vertical-rl] text-blue-100">
            F-CHAT ⚡
          </span>
        </motion.div>
      </div>

      {/* --- BOTTOM NAV --- */}
      <nav className="h-20 bg-white/80 backdrop-blur-lg border-t border-green-200 fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around">
        <button
          onClick={() => setFlicksOpen(true)}
          className="flex flex-col items-center gap-1"
        >
          <Film className="w-6 h-6 text-green-900/40" />
          <span className="text-[7px] font-black uppercase">Flicks</span>
        </button>
        <div
          onClick={() => setProfileOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center -mt-10 border-[6px] border-[#d1dbd3] shadow-xl text-white cursor-pointer active:scale-95 transition-transform"
        >
          <User className="w-8 h-8" />
        </div>
        <button
          onClick={() => setChatOpen(true)}
          className="flex flex-col items-center gap-1"
        >
          <Bell className="w-6 h-6 text-green-900/40" />
          <span className="text-[7px] font-black uppercase">Chat</span>
        </button>
      </nav>

      {/* --- OVERLAYS --- */}
      <AnimatePresence>
        {flicksOpen && (
          <FlicksTray isOpen={true} onClose={() => setFlicksOpen(false)} />
        )}
        {chatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[200] bg-white"
          >
            <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
          </motion.div>
        )}
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
