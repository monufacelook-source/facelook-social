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
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- EXTERNAL COMPONENTS ---
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";
import SearchUsers from "@/components/SearchUsers";
import NotificationPanel from "@/components/NotificationPanel";
import FriendListOverlay from "@/components/FriendListOverlay";

// ==========================================
// 1. FLICKS TRAY (THE REELS COMPONENT)
// ==========================================
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
      const { data, error } = await supabase
        .from("flicks")
        .select(`*, profiles(username, avatar_url)`)
        .order("created_at", { ascending: false });
      if (data) setFlicks(data);
      if (error) console.error("Error fetching flicks:", error);
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
          className="fixed inset-0 z-[500] bg-black flex flex-col"
        >
          {/* Flicks Header */}
          <div className="absolute top-0 w-full p-6 flex justify-between items-center z-[510] bg-gradient-to-b from-black/80 to-transparent">
            <h2 className="text-white font-black italic tracking-[4px] text-lg">
              FLICKS 📀
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-white/10 backdrop-blur-lg rounded-full text-white border border-white/20 active:scale-90 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Insta-Style Snap Scroller */}
          <div
            ref={containerRef}
            className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory scroll-smooth bg-black"
          >
            {flicks.length > 0 ? (
              flicks.map((flick, index) => (
                <div
                  key={flick.id || index}
                  className="h-screen w-full snap-start relative flex items-center justify-center overflow-hidden"
                >
                  <video
                    src={flick.video_url}
                    className="h-full w-full object-cover"
                    loop
                    autoPlay={index === 0}
                    muted
                    playsInline
                  />

                  {/* Right Actions Bar */}
                  <div className="absolute right-4 bottom-32 flex flex-col gap-7 z-[505]">
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div className="p-3.5 bg-black/20 backdrop-blur-xl rounded-full text-white border border-white/10">
                        <Heart className="w-6 h-6 fill-white" />
                      </div>
                      <span className="text-[10px] text-white font-black">
                        LIT
                      </span>
                    </motion.div>

                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div className="p-3.5 bg-blue-600/40 backdrop-blur-xl rounded-full text-white border border-blue-400/30">
                        <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      </div>
                      <span className="text-[10px] text-white font-black">
                        HOOK
                      </span>
                    </motion.div>

                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      className="flex flex-col items-center gap-1 cursor-pointer"
                    >
                      <div className="p-3.5 bg-black/20 backdrop-blur-xl rounded-full text-white border border-white/10">
                        <Share2 className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-white font-black">
                        SEND
                      </span>
                    </motion.div>
                  </div>

                  {/* Info Overlay */}
                  <div className="absolute bottom-12 left-6 right-20 z-[505]">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full border-2 border-blue-500 p-0.5 bg-black overflow-hidden">
                        <img
                          src={
                            flick.profiles?.avatar_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`
                          }
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <p className="text-white font-black text-sm tracking-widest uppercase italic">
                        @{flick.profiles?.username || "facelooker"}
                      </p>
                    </div>
                    <p className="text-white/90 text-xs font-medium leading-relaxed max-w-[85%] drop-shadow-lg">
                      {flick.caption ||
                        "No caption provided. Just Vibe! ⚡ #Facelook #Flicks"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/30 gap-5">
                <Film className="w-16 h-16 animate-pulse text-blue-600" />
                <p className="font-black text-[10px] uppercase tracking-[4px]">
                  Fetching Viral Flicks...
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ==========================================
// 2. MAIN INDEX PAGE
// ==========================================
export default function Index() {
  const { user } = useAuth();

  // Navigation States
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [friendsListOpen, setFriendsListOpen] = useState(false);

  // Notification Logic
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

    const channel = supabase
      .channel("realtime-notifications")
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
          audioRef.current
            ?.play()
            .catch((e) => console.log("Audio Play Blocked", e));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Matchmaking Demo
  const [matchIdx, setMatchIdx] = useState(0);
  const petals = Array.from({ length: 12 });
  const grooms = [
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
  ];
  const brides = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMatchIdx((prev) => (prev + 1) % grooms.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen bg-[#d1dbd3] overflow-hidden flex flex-col relative font-sans selection:bg-blue-200">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
        preload="auto"
      />

      {/* --- HEADER --- */}
      <header className="h-14 bg-white/70 backdrop-blur-2xl border-b border-green-200/50 z-[60] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-2xl font-black tracking-tighter text-blue-600 select-none italic">
          FACELOOK
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 hover:bg-green-100 rounded-full transition-colors"
          >
            <Search className="w-5 h-5 text-green-700" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-green-100 rounded-full transition-colors"
          >
            <Settings className="w-5 h-5 text-green-700" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* --- LEFT TRIGGER (FLICKS) --- */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-black/10 backdrop-blur-xl text-black/70 w-8 h-36 rounded-r-[2rem] flex items-center justify-center cursor-pointer border border-white/30 shadow-2xl"
          whileHover={{
            width: "45px",
            backgroundColor: "rgba(0,0,0,0.2)",
            color: "#000",
          }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="uppercase font-black text-[10px] tracking-[4px] [writing-mode:vertical-rl] rotate-180">
            FLICKS 📀
          </span>
        </motion.div>

        {/* --- MAIN FEED (SNAP ENABLED) --- */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32 snap-y snap-mandatory scroll-smooth">
          <div className="max-w-[640px] mx-auto py-8 space-y-12">
            {/* Viral Snap Section */}
            <section className="px-4 snap-start">
              <div className="flex items-center gap-2 mb-6">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />
                <h3 className="text-[12px] font-black text-green-900 tracking-[4px] uppercase italic">
                  Viral Now
                </h3>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {[1, 2, 3].map((v) => (
                  <div
                    key={v}
                    className="min-w-[300px] h-[180px] bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-6 relative overflow-hidden shadow-2xl border border-white/20"
                  >
                    <div className="relative z-10">
                      <span className="bg-white/20 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                        Trending
                      </span>
                      <p className="text-white font-black text-xl leading-tight mt-4 italic">
                        Next-Gen <br /> Social Hooks
                      </p>
                    </div>
                    <Film className="absolute right-[-10px] bottom-[-10px] w-32 h-32 text-white/10 rotate-12" />
                  </div>
                ))}
              </div>
            </section>

            {/* Matrimony Snap Section */}
            <section className="bg-[#2a0101] rounded-[4rem] shadow-2xl overflow-hidden border-b-[8px] border-red-900 relative min-h-[460px] mx-4 snap-start flex flex-col items-center justify-center">
              <div className="absolute inset-0 pointer-events-none z-10">
                {petals.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, 500], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                    className="absolute text-red-500/20 text-xl"
                    style={{ left: `${(i * 9) % 100}%` }}
                  >
                    🌹
                  </motion.div>
                ))}
              </div>
              <HeartIcon className="w-8 h-8 text-red-600 fill-red-600 animate-pulse mb-10 z-20" />
              <div className="flex items-center justify-around w-full z-20 px-4">
                <motion.img
                  key={matchIdx + "g"}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  src={grooms[matchIdx]}
                  className="w-28 h-40 rounded-3xl object-cover border-4 border-red-900/50 shadow-2xl rotate-[-5deg]"
                />
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center border-4 border-[#2a0101] shadow-pink-500/20 shadow-2xl">
                  <span className="text-white font-black italic text-lg">
                    VS
                  </span>
                </div>
                <motion.img
                  key={matchIdx + "b"}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  src={brides[matchIdx]}
                  className="w-28 h-40 rounded-3xl object-cover border-4 border-red-900/50 shadow-2xl rotate-[5deg]"
                />
              </div>
              <button className="z-20 mt-12 bg-white text-red-950 px-12 py-4 rounded-full text-[11px] font-black uppercase tracking-[4px] shadow-2xl active:scale-95 transition-transform">
                Find Soulmate
              </button>
            </section>

            {/* Main Feed Snap Section */}
            <div className="px-0 snap-start">
              <MainFeed />
            </div>
          </div>
        </main>

        {/* --- RIGHT TRIGGER (VIBE) --- */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-blue-600/10 backdrop-blur-xl text-blue-800/70 w-8 h-36 rounded-l-[2rem] flex items-center justify-center cursor-pointer border border-blue-200/30 shadow-2xl"
          whileHover={{
            width: "45px",
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            color: "#1e40af",
          }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="uppercase font-black text-[10px] tracking-[4px] [writing-mode:vertical-rl]">
            VIBE ⚡
          </span>
        </motion.div>
      </div>

      {/* --- BOTTOM NAV --- */}
      <nav className="h-20 bg-white/90 backdrop-blur-2xl border-t border-green-200/60 fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around px-2">
        <button
          onClick={() => setFlicksOpen(true)}
          className="flex flex-col items-center gap-1.5 group"
        >
          <Film
            className={`w-6 h-6 transition-all ${flicksOpen ? "text-blue-600 scale-110" : "text-green-900/40 group-active:scale-90"}`}
          />
          <span
            className={`text-[8px] font-black uppercase tracking-wider ${flicksOpen ? "text-blue-600" : "text-green-900/40"}`}
          >
            Flicks
          </span>
        </button>
        <button className="flex flex-col items-center gap-1.5 opacity-40">
          <Users className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-wider">
            Groups
          </span>
        </button>

        <div
          onClick={() => setProfileOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center -mt-12 border-[8px] border-[#d1dbd3] shadow-2xl text-white cursor-pointer active:scale-90 transition-all"
        >
          <User className="w-8 h-8" />
        </div>

        <button
          onClick={() => {
            setAlertsOpen(true);
            setNotifCount(0);
          }}
          className="flex flex-col items-center gap-1.5 relative group"
        >
          <Bell className="w-6 h-6 text-green-900/40 group-active:scale-90 transition-all" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {notifCount}
            </span>
          )}
          <span className="text-[8px] font-black uppercase tracking-wider text-green-900/40">
            Alerts
          </span>
        </button>
        <button className="flex flex-col items-center gap-1.5 opacity-40">
          <Bookmark className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-wider">
            Hooks
          </span>
        </button>
      </nav>

      {/* --- OVERLAY MODALS --- */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[400] bg-white flex flex-col"
          >
            <div className="h-16 bg-blue-600 flex items-center justify-between px-6 text-white shrink-0 shadow-2xl">
              <h2 className="font-black tracking-[6px] uppercase text-sm italic">
                VIBE ⚡
              </h2>
              <button
                onClick={() => setChatOpen(false)}
                className="bg-white/20 p-2 rounded-full active:scale-90"
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

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[450] bg-white/95 backdrop-blur-3xl flex flex-col p-6"
          >
            <button
              onClick={() => setSearchOpen(false)}
              className="self-end p-3 bg-black/5 rounded-full mb-8"
            >
              <X className="w-7 h-7 text-black" />
            </button>
            <div className="max-w-md mx-auto w-full">
              <SearchUsers />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertsOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[450] bg-white flex flex-col"
          >
            <div className="h-16 bg-green-900 flex items-center justify-between px-6 text-white">
              <h2 className="font-black uppercase tracking-widest">Alerts</h2>
              <button onClick={() => setAlertsOpen(false)}>
                <X className="w-7 h-7" />
              </button>
            </div>
            <NotificationPanel />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
