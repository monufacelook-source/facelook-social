import { useState } from "react";
import {
  Settings,
  User,
  Film,
  Bell,
  Search,
  Users,
  Bookmark,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// TERE PURANE COMPONENTS (WAPAS AA GAYE)
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";

export default function Index() {
  // States wahi purani hain
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
            className="p-2 hover:bg-green-100 rounded-full"
          >
            <Search className="w-5 h-5 text-green-700" />
          </button>
          <button className="p-2 hover:bg-green-100 rounded-full">
            <Settings className="w-5 h-5 text-green-700" />
          </button>
        </div>
      </header>

      {/* --- MAIN FEED (Isme tera sara content hai) --- */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="max-w-[620px] mx-auto py-6">
          <MainFeed />
        </div>
      </main>

      {/* --- BOTTOM NAV --- */}
      <nav className="h-20 bg-white/80 backdrop-blur-lg border-t border-green-200 fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around">
        <button className="flex flex-col items-center gap-1">
          <Film className="w-6 h-6 text-green-900/40" />
          <span className="text-[7px] font-black uppercase text-green-900/40">
            Flicks
          </span>
        </button>

        <div
          onClick={() => setProfileOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center -mt-10 border-[6px] border-[#d1dbd3] shadow-xl text-white cursor-pointer"
        >
          <User className="w-8 h-8" />
        </div>

        <button
          onClick={() => setChatOpen(true)}
          className="flex flex-col items-center gap-1"
        >
          <Bell className="w-6 h-6 text-green-900/40" />
          <span className="text-[7px] font-black uppercase text-green-900/40">
            Chat
          </span>
        </button>
      </nav>

      {/* --- OVERLAYS (WAPAS JOD DIYE HAIN) --- */}
      <AnimatePresence>
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
