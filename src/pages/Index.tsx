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
  Share2,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Components Imports (Assume these exist in your folder)
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";
import SearchUsers from "@/components/SearchUsers";
import NotificationPanel from "@/components/NotificationPanel";
import FriendListOverlay from "@/components/FriendListOverlay";

// --- 1. FLICKS TRAY COMPONENT (Merged & Snapping Ready) ---
function FlicksTray({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [flicks, setFlicks] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFlicks = async () => {
      const { data } = await supabase
        .from("flicks")
        .select(`*, profiles(username, avatar_url)`)
        .order("created_at", { ascending: false });
      if (data) setFlicks(data);
    };
    if (isOpen) fetchFlicks();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[300] bg-black flex flex-col"
        >
          <div className="absolute top-0 w-full p-6 flex justify-between items-center z-[310] bg-gradient-to-b from-black/60 to-transparent">
            <h2 className="text-white font-black italic tracking-[4px] text-lg">
              FLICKS
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth"
          >
            {flicks.length > 0 ? (
              flicks.map((flick, index) => (
                <div
                  key={flick.id || index}
                  className="h-screen w-full snap-start relative flex items-center justify-center bg-zinc-900"
                >
                  <video
                    src={flick.video_url}
                    className="h-full w-full object-cover"
                    loop
                    autoPlay={index === 0}
                    muted
                    playsInline
                  />
                  <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-[305]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20">
                        <Heart className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-white font-bold">
                        LIT
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20">
                        <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </div>
                      <span className="text-[10px] text-white font-bold">
                        HOOK
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20">
                        <Share2 className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-white font-bold">
                        SEND
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-10 left-6 right-20 z-[305]">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={
                          flick.profiles?.avatar_url ||
                          "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        }
                        className="w-10 h-10 rounded-full border-2 border-blue-500"
                      />
                      <p className="text-white font-black text-sm">
                        @{flick.profiles?.username || "facelooker"}
                      </p>
                    </div>
                    <p className="text-white/80 text-xs line-clamp-2">
                      {flick.caption || "Vibing on Facelook! ⚡"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/40">
                <Film className="w-12 h-12 animate-pulse" />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- 2. MAIN INDEX PAGE ---
export default function Index() {
  const { user } = useAuth();
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [friendsListOpen, setFriendsListOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Supabase Notification Realtime
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
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friendships",
          filter: `addressee_id=eq.${user.id}`,
        },
        () => {
          setNotifCount((prev) => prev + 1);
          audioRef.current?.play().catch(() => {});
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Matchmaking Demo States
  const [matchIdx, setMatchIdx] = useState(0);
  const grooms = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
  ];
  const brides = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  ];
  useEffect(() => {
    const interval = setInterval(
      () => setMatchIdx((prev) => (prev + 1) % grooms.length),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#d1dbd3] overflow-hidden flex flex-col relative font-sans">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
        preload="auto"
      />

      {/* Header */}
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
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-green-100 rounded-full"
          >
            <Settings className="w-5 h-5 text-green-700" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side Flicks Trigger */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-black/10 backdrop-blur-md w-7 h-32 rounded-r-2xl flex items-center justify-center cursor-pointer border border-white/20 shadow-xl"
          whileHover={{ width: "35px" }}
        >
          <span className="uppercase font-black text-[9px] tracking-[2px] [writing-mode:vertical-rl] rotate-180">
            FLICKS 📀
          </span>
        </motion.div>

        {/* Main Feed with SNAP SCROLLING */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32 snap-y snap-mandatory scroll-smooth">
          <div className="max-w-[620px] mx-auto py-6 space-y-10">
            {/* Snap Section 1: Viral */}
            <section className="px-4 snap-start">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <h3 className="text-[11px] font-black text-green-900 uppercase tracking-[3px]">
                  Viral on Facelook
                </h3>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {[1, 2].map((v) => (
                  <div
                    key={v}
                    className="min-w-[280px] h-[160px] bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-5 relative shadow-xl"
                  >
                    <p className="text-white font-black text-lg">
                      The New Era of <br /> Social Matchmaking
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Snap Section 2: Matrimony */}
            <section className="bg-[#2d0202] rounded-[3.5rem] shadow-2xl mx-4 min-h-[440px] snap-start relative flex flex-col items-center justify-center p-8">
              <HeartIcon className="w-6 h-6 text-red-600 fill-red-600 animate-pulse mb-8" />
              <div className="flex items-center justify-around w-full">
                <motion.img
                  key={matchIdx + "g"}
                  src={grooms[matchIdx]}
                  className="w-24 h-32 rounded-2xl border-2 border-red-800 rotate-[-4deg]"
                />
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-black italic shadow-xl">
                  VS
                </div>
                <motion.img
                  key={matchIdx + "b"}
                  src={brides[matchIdx]}
                  className="w-24 h-32 rounded-2xl border-2 border-red-800 rotate-[4deg]"
                />
              </div>
              <button className="mt-8 bg-white text-red-900 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[2px]">
                Get Matched
              </button>
            </section>

            {/* Snap Section 3: Feed */}
            <div className="px-0 snap-start">
              <MainFeed />
            </div>
          </div>
        </main>

        {/* Right Side Vibe Trigger */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-blue-600/10 backdrop-blur-md w-7 h-32 rounded-l-2xl flex items-center justify-center cursor-pointer border border-blue-200/20 shadow-xl"
          whileHover={{ width: "35px" }}
        >
          <span className="uppercase font-black text-[9px] tracking-[3px] [writing-mode:vertical-rl]">
            VIBE ⚡
          </span>
        </motion.div>
      </div>

      {/* Bottom Nav */}
      <nav className="h-20 bg-white/80 backdrop-blur-lg border-t border-green-200 fixed bottom-0 left-0 right-0 z-[60] flex items-center justify-around">
        <button
          onClick={() => setFlicksOpen(true)}
          className="flex flex-col items-center gap-1"
        >
          <Film
            className={`w-6 h-6 ${flicksOpen ? "text-blue-600" : "text-green-900/40"}`}
          />
          <span className="text-[7px] font-black uppercase">Flicks</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Users className="w-6 h-6 text-green-900/40" />
          <span className="text-[7px] font-black uppercase">Groups</span>
        </button>
        <div
          onClick={() => setProfileOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center -mt-10 border-[6px] border-[#d1dbd3] shadow-xl text-white cursor-pointer active:scale-90"
        >
          <User className="w-8 h-8" />
        </div>
        <button
          onClick={() => setAlertsOpen(true)}
          className="flex flex-col items-center gap-1 relative"
        >
          <Bell className="w-6 h-6 text-green-900/40" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
              {notifCount}
            </span>
          )}
          <span className="text-[7px] font-black uppercase">Alerts</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <Bookmark className="w-6 h-6 text-green-900/40" />
          <span className="text-[7px] font-black uppercase">Hooks</span>
        </button>
      </nav>

      {/* --- OVERLAYS --- */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] bg-white/95 flex flex-col p-6"
          >
            <button
              onClick={() => setSearchOpen(false)}
              className="self-end p-2 bg-black/5 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            <SearchUsers />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[400] bg-white flex flex-col"
          >
            <div className="h-16 bg-blue-600 flex items-center justify-between px-6 text-white shadow-lg">
              <h2 className="font-black tracking-[5px] uppercase text-sm italic">
                VIBE ⚡
              </h2>
              <button
                onClick={() => setChatOpen(false)}
                className="bg-white/20 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Other Overlays (Profile, Alerts, Settings) follow same pattern */}
    </div>
  );
}
