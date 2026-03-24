import { useState, useEffect, useRef } from "react";
import {
  Settings,
  User,
  Film,
  Heart as HeartIcon,
  Check,
  X,
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

// Components
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
  const [isMounted, setIsMounted] = useState(false); // 👈 Black screen fix

  // Sidebar States
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [friendsListOpen, setFriendsListOpen] = useState(false);

  // Notifications
  const [notifCount, setNotifCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Mount Check - Screen tab tak render nahi hogi jab tak client ready na ho
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. Realtime Logic
  useEffect(() => {
    if (!user || !isMounted) return;

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
          audioRef.current
            ?.play()
            .catch(() => console.log("Sound muted by browser"));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isMounted]);

  // UI Matchmaking Demo Data
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
      () => setMatchIdx((p) => (p + 1) % grooms.length),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  // Safe Guard: Pre-mount return
  if (!isMounted) return <div className="h-screen w-screen bg-[#d1dbd3]" />;

  return (
    <div className="h-screen w-screen bg-[#d1dbd3] overflow-hidden flex flex-col relative font-sans">
      <audio
        ref={audioRef}
        src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
        preload="auto"
      />

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
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-green-100 rounded-full"
          >
            <Settings className="w-5 h-5 text-green-700" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* DVD FLICKS BUTTON - LEFT SIDE (Vertical Design) */}
        <motion.div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-black text-white w-9 h-40 rounded-r-2xl flex items-center justify-center cursor-pointer shadow-2xl border border-white/10"
          whileHover={{ width: "45px", backgroundColor: "#111" }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="uppercase font-black text-[10px] tracking-[2px] [writing-mode:vertical-rl] rotate-180 opacity-80">
            FLICKS DVD
          </span>
        </motion.div>

        {/* MAIN FEED */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="max-w-[620px] mx-auto py-6 space-y-10">
            {/* Viral Cards */}
            <section className="px-4">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                <h3 className="text-[11px] font-black text-green-900 tracking-[3px] uppercase italic">
                  Viral Now
                </h3>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {[1, 2].map((v) => (
                  <div
                    key={v}
                    className="min-w-[280px] h-[160px] bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[2rem] p-5 relative overflow-hidden border border-white/20 shadow-xl"
                  >
                    <p className="text-white font-black text-lg leading-tight mt-6 italic relative z-10">
                      Next-Gen <br /> Social Hooks
                    </p>
                    <Film className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white/10 rotate-12" />
                  </div>
                ))}
              </div>
            </section>

            {/* Matrimony Card */}
            <section className="bg-[#2d0202] rounded-[3.5rem] shadow-2xl overflow-hidden border-b-[6px] border-red-900 relative min-h-[440px] mx-4 flex flex-col items-center justify-center">
              <HeartIcon className="w-6 h-6 text-red-600 fill-red-600 animate-pulse mb-10" />
              <div className="flex items-center justify-around w-full px-4">
                <img
                  src={grooms[matchIdx]}
                  className="w-24 h-32 rounded-2xl object-cover border-2 border-red-800 -rotate-6"
                />
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs italic">
                  VS
                </div>
                <img
                  src={brides[matchIdx]}
                  className="w-24 h-32 rounded-2xl object-cover border-2 border-red-800 rotate-6"
                />
              </div>
              <button className="mt-10 bg-white text-red-900 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">
                Get Matched
              </button>
            </section>

            <MainFeed />
          </div>
        </main>

        {/* F-CHAT BUTTON - RIGHT SIDE (Vertical Design) */}
        <motion.div
          onClick={() => setChatOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-blue-600 text-white w-9 h-40 rounded-l-2xl flex items-center justify-center cursor-pointer shadow-2xl"
          whileHover={{ width: "45px", backgroundColor: "#2563eb" }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="uppercase font-black text-[10px] tracking-[3px] [writing-mode:vertical-rl] text-blue-100">
            F-CHAT 🩴
          </span>
        </motion.div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="h-20 bg-white/80 backdrop-blur-lg border-t border-green-200 fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-around">
        <button
          onClick={() => setFlicksOpen(true)}
          className="flex flex-col items-center gap-1 group"
        >
          <Film
            className={`w-6 h-6 ${flicksOpen ? "text-blue-600" : "text-green-900/40"}`}
          />
          <span className="text-[7px] font-black uppercase">Flicks</span>
        </button>
        <div
          onClick={() => setProfileOpen(true)}
          className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center -mt-10 border-[6px] border-[#d1dbd3] shadow-xl text-white cursor-pointer active:scale-90 transition-all"
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
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {notifCount}
            </span>
          )}
          <span className="text-[7px] font-black uppercase text-green-900/40">
            Alerts
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
            className="fixed inset-0 z-[200] bg-white flex flex-col"
          >
            <div className="h-16 bg-blue-600 flex items-center justify-between px-6 text-white shrink-0 shadow-lg">
              <h2 className="font-black tracking-[5px] uppercase text-sm">
                F-CHAT 🩴
              </h2>
              <button
                onClick={() => setChatOpen(false)}
                className="p-2 bg-white/20 rounded-full"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-white/95 backdrop-blur-3xl flex flex-col p-6"
          >
            <button
              onClick={() => setSearchOpen(false)}
              className="self-end p-2 bg-black/5 rounded-full"
            >
              <X className="w-6 h-6 text-black" />
            </button>
            <div className="max-w-md mx-auto w-full pt-10">
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
            className="fixed inset-0 z-[300] bg-white flex flex-col"
          >
            <div className="h-16 bg-green-900 flex items-center justify-between px-6 text-white shrink-0">
              <h2 className="font-black uppercase tracking-widest">
                Notifications
              </h2>
              <button onClick={() => setAlertsOpen(false)}>
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
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {friendsListOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[400] bg-white"
          >
            <FriendListOverlay onClose={() => setFriendsListOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
