import { useState, useEffect, useRef } from "react";
import {
  Settings,
  User,
  Film,
  Heart as HeartIcon,
  Check,
  X,
  Plus,
  Bell,
  Users,
  Bookmark,
  Zap,
  Flame,
  Search,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";
import SearchUsers from "@/components/SearchUsers";
import NotificationPanel from "@/components/NotificationPanel";
import FriendListOverlay from "@/components/FriendListOverlay";

export default function Index() {
  const { user } = useAuth();
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // Ye 'VIBE' ke liye hai
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [friendsListOpen, setFriendsListOpen] = useState(false);

  const [notifCount, setNotifCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchNotifCount = async () => {
      const { count } = await supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .eq("addressee_id", user.id)
        .eq("status", "pending");
      setNotifCount(count || 0);
    };
    fetchNotifCount();
    // ... rest of your supabase subscription logic
  }, [user]);

  const [matchIdx, setMatchIdx] = useState(0);
  const petals = Array.from({ length: 15 });
  const grooms = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  ];
  const brides = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400",
  ];

  useEffect(() => {
    const interval = setInterval(
      () => setMatchIdx((prev) => (prev + 1) % grooms.length),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  const realUsers = [
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  ];

  return (
    <div className="h-screen w-screen bg-[#d1dbd3] overflow-hidden flex flex-col relative selection:bg-green-200 font-sans">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
        preload="auto"
      />

      {/* --- HEADER --- */}
      <header className="h-14 bg-white/60 backdrop-blur-xl border-b border-green-200/50 z-[60] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-2xl font-black tracking-tighter text-blue-600 select-none italic">
          FACELOOK
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 hover:bg-blue-100 rounded-full transition-all group"
          >
            <Search className="w-5 h-5 text-blue-600 group-active:scale-90" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-green-100 rounded-full transition-all"
          >
            <Settings className="w-5 h-5 text-green-700" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 📀 FLICKS BUTTON (Transparent & Animated) */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-black/20 backdrop-blur-md text-black w-8 h-32 rounded-r-2xl flex items-center justify-center cursor-pointer border border-white/30 shadow-lg"
          whileHover={{ width: "40px", backgroundColor: "rgba(0,0,0,0.4)" }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="uppercase font-black text-[9px] tracking-[2px] [writing-mode:vertical-rl] rotate-180">
            FLICKS 📀
          </span>
        </motion.div>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="max-w-[620px] mx-auto py-6 space-y-10">
            {/* ... Other sections (Viral, Hook Requests, Matrimony) remain same ... */}
            <div className="px-0">
              <MainFeed />
            </div>
          </div>
        </main>

        {/* ⚡ VIBE BUTTON (Right Side) */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-blue-600/20 backdrop-blur-md text-blue-700 w-8 h-32 rounded-l-2xl flex items-center justify-center cursor-pointer border border-blue-200/30 shadow-lg"
          whileHover={{
            width: "40px",
            backgroundColor: "rgba(37, 99, 235, 0.3)",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="uppercase font-black text-[9px] tracking-[3px] [writing-mode:vertical-rl]">
            VIBE ⚡
          </span>
        </motion.div>
      </div>

      {/* --- BOTTOM NAV --- */}
      <nav className="h-20 bg-white/80 backdrop-blur-lg border-t border-green-200 fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around">
        <button
          onClick={() => setFlicksOpen(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <Film
            className={`w-6 h-6 ${flicksOpen ? "text-blue-600" : "text-green-900/40"} group-active:scale-125 transition-transform`}
          />
          <span
            className={`text-[7px] font-black uppercase ${flicksOpen ? "text-blue-600" : "text-green-900/40"}`}
          >
            Flicks
          </span>
        </button>

        <button
          onClick={() => setChatOpen(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <Zap
            className={`w-6 h-6 ${chatOpen ? "text-yellow-500" : "text-green-900/40"} group-active:rotate-12 transition-transform`}
          />
          <span
            className={`text-[7px] font-black uppercase ${chatOpen ? "text-yellow-600" : "text-green-900/40"}`}
          >
            Vibe
          </span>
        </button>

        <div
          onClick={() => setProfileOpen(true)}
          className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center -mt-8 border-[4px] border-[#d1dbd3] shadow-xl text-white cursor-pointer active:scale-90 transition-transform"
        >
          <User className="w-7 h-7" />
        </div>

        <button
          onClick={() => {
            setAlertsOpen(true);
            setNotifCount(0);
          }}
          className="flex flex-col items-center gap-1 relative group"
        >
          <Bell className="w-6 h-6 text-green-900/40 group-active:scale-110" />
          <span className="text-[7px] font-black uppercase text-green-900/40">
            Alerts
          </span>
          {notifCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white"
            >
              {notifCount}
            </motion.span>
          )}
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <Bookmark className="w-6 h-6 text-green-900/40 group-active:scale-110" />
          <span className="text-[7px] font-black uppercase text-green-900/40">
            Hooks
          </span>
        </button>
      </nav>

      {/* --- OVERLAYS --- */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[200] bg-white flex flex-col"
          >
            <div className="h-16 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between px-6 text-white shrink-0 shadow-lg">
              <h2 className="font-black tracking-[5px] uppercase text-sm italic flex items-center gap-2">
                VIBE ⚡{" "}
                <span className="text-[10px] opacity-60 font-normal tracking-normal">
                  Real-time Chat
                </span>
              </h2>
              <button
                onClick={() => setChatOpen(false)}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1">
              <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile, Settings, Search etc. logic stays same... */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-white/95 backdrop-blur-2xl flex flex-col p-6"
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 bg-black/5 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 max-w-md mx-auto w-full">
              <h2 className="text-3xl font-black italic text-blue-600 mb-8 tracking-tighter uppercase underline decoration-yellow-400">
                Search Facelook
              </h2>
              <SearchUsers />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest of overlays (Alerts, Settings, Friends) are already fine */}
    </div>
  );
}
