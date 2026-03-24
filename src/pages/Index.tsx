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
  const [chatOpen, setChatOpen] = useState(false); // Ye ab 'Vibe' ke liye hai
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [friendsListOpen, setFriendsListOpen] = useState(false);

  // --- NOTIFICATION & SOUND LOGIC ---
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
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "friendships",
          filter: `addressee_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifCount((prev) => prev + 1);
          if (audioRef.current) {
            audioRef.current
              .play()
              .catch((e) => console.log("Sound error:", e));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Matchmaking & UI states
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
    const interval = setInterval(() => {
      setMatchIdx((prev) => (prev + 1) % grooms.length);
    }, 3000);
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
            className="p-2 hover:bg-green-100 rounded-full transition-all"
          >
            <Search className="w-5 h-5 text-green-700" />
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
        {/* --- FLICKS SIDE BUTTON (NEW DESIGN) --- */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-black/10 backdrop-blur-md text-black/70 w-7 h-32 rounded-r-2xl flex items-center justify-center cursor-pointer border border-white/20 shadow-xl"
          whileHover={{
            width: "35px",
            backgroundColor: "rgba(0,0,0,0.2)",
            color: "#000",
          }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="uppercase font-black text-[9px] tracking-[2px] [writing-mode:vertical-rl] rotate-180">
            FLICKS 📀
          </span>
        </motion.div>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="max-w-[620px] mx-auto py-6 space-y-10">
            {/* Viral Section */}
            <section className="px-4">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <h3 className="text-[11px] font-black text-green-900 tracking-[3px] uppercase italic">
                  Viral on Facelook
                </h3>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {[1, 2, 3].map((v) => (
                  <div
                    key={v}
                    className="min-w-[280px] h-[160px] bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-5 relative overflow-hidden shadow-xl border border-white/20"
                  >
                    <div className="relative z-10">
                      <span className="bg-white/20 text-white text-[8px] font-bold px-3 py-1 rounded-full uppercase">
                        Trending
                      </span>
                      <p className="text-white font-black text-lg leading-tight mt-3">
                        The New Era of <br /> Social Matchmaking
                      </p>
                    </div>
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
                      <Film className="w-32 h-32 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Hook Requests */}
            <section className="space-y-4 px-4">
              <h3 className="text-[11px] font-black text-green-800 tracking-[3px] uppercase px-1">
                Hook Requests
              </h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {realUsers.map((url, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="min-w-[140px] h-[190px] relative rounded-3xl overflow-hidden shadow-2xl shrink-0"
                  >
                    <img
                      src={url}
                      className="w-full h-full object-cover"
                      alt="user"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                    <div className="absolute bottom-3 w-full flex justify-center gap-2">
                      <button className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
                        <Check className="w-3 h-3" />
                      </button>
                      <button className="bg-white/20 p-2 rounded-xl text-white backdrop-blur-md">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Matrimony */}
            <section className="bg-[#2d0202] rounded-[3.5rem] shadow-2xl overflow-hidden border-b-[6px] border-red-900 relative min-h-[440px] mx-4">
              <div className="absolute inset-0 pointer-events-none z-10">
                {petals.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, 500], opacity: [0, 1, 0] }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      delay: i * 0.4,
                    }}
                    className="absolute text-red-500/20 text-xl"
                    style={{ left: `${(i * 7) % 100}%` }}
                  >
                    🌹
                  </motion.div>
                ))}
              </div>
              <div className="px-8 py-10 flex flex-col items-center relative z-20">
                <HeartIcon className="w-6 h-6 text-red-600 fill-red-600 animate-pulse mb-8" />
                <div className="flex items-center justify-around w-full">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={matchIdx + "g"}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      src={grooms[matchIdx]}
                      className="w-28 h-36 rounded-2xl object-cover border-2 border-red-800 rotate-[-4deg]"
                    />
                  </AnimatePresence>
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center border-4 border-[#2d0202] z-30 shadow-xl">
                    <span className="text-white font-black italic">VS</span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={matchIdx + "b"}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      src={brides[matchIdx]}
                      className="w-28 h-36 rounded-2xl object-cover border-2 border-red-800 rotate-[4deg]"
                    />
                  </AnimatePresence>
                </div>
                <button className="mt-10 bg-white text-red-900 px-10 py-3 rounded-full text-[10px] font-black uppercase tracking-[3px] shadow-2xl">
                  Get Matched
                </button>
              </div>
            </section>

            <div className="px-0">
              <MainFeed />
            </div>
          </div>
        </main>

        {/* --- VIBE SIDE BUTTON (NEW DESIGN) --- */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-blue-600/10 backdrop-blur-md text-blue-700/70 w-7 h-32 rounded-l-2xl flex items-center justify-center cursor-pointer border border-blue-200/20 shadow-xl"
          whileHover={{
            width: "35px",
            backgroundColor: "rgba(37, 99, 235, 0.2)",
            color: "#2563eb",
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
        <button className="flex flex-col items-center gap-1">
          <Users className="w-6 h-6 text-green-900/40" />
          <span className="text-[7px] font-black uppercase text-green-900/40">
            Groups
          </span>
        </button>
        <div
          onClick={() => setProfileOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center -mt-10 border-[6px] border-[#d1dbd3] shadow-xl text-white cursor-pointer active:scale-90 transition-transform"
        >
          <User className="w-8 h-8" />
        </div>

        <button
          onClick={() => {
            setAlertsOpen(true);
            setNotifCount(0);
          }}
          className="flex flex-col items-center gap-1 relative"
        >
          <Bell className="w-6 h-6 text-green-900/40" />
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

        <button className="flex flex-col items-center gap-1">
          <Bookmark className="w-6 h-6 text-green-900/40" />
          <span className="text-[7px] font-black uppercase text-green-900/40">
            Hooks
          </span>
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
            className="fixed inset-0 z-[250] bg-white/95 backdrop-blur-2xl flex flex-col p-6"
          >
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setSearchOpen(false)}
                className="p-2 bg-black/5 rounded-full"
              >
                <X className="w-6 h-6 text-black" />
              </button>
            </div>
            <div className="flex-1 max-w-md mx-auto w-full">
              <h2 className="text-3xl font-black italic text-blue-600 mb-8 tracking-tighter uppercase">
                Search Facelook
              </h2>
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
            className="fixed inset-0 z-[250] bg-white flex flex-col"
          >
            <div className="h-16 bg-green-900 flex items-center justify-between px-6 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-400" />
                <h2 className="font-black tracking-[3px] uppercase text-sm">
                  Notifications
                </h2>
              </div>
              <button
                onClick={() => setAlertsOpen(false)}
                className="bg-white/20 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NotificationPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[200] bg-white flex flex-col"
          >
            <div className="h-16 bg-blue-600 flex items-center justify-between px-6 text-white shrink-0 shadow-lg">
              <h2 className="font-black tracking-[5px] uppercase text-sm italic">
                VIBE ⚡
              </h2>
              <button
                onClick={() => setChatOpen(false)}
                className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
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
        {settingsOpen && (
          <div className="fixed inset-0 z-[210]">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
              onClick={() => setSettingsOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="absolute bottom-0 left-0 right-0 h-[80%] bg-white rounded-t-[3rem] shadow-2xl p-6"
            >
              <SettingsPanel
                isOpen={true}
                onClose={() => setSettingsOpen(false)}
                onManageFriends={() => {
                  setSettingsOpen(false);
                  setFriendsListOpen(true);
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {friendsListOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[300] bg-white"
          >
            <FriendListOverlay onClose={() => setFriendsListOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
