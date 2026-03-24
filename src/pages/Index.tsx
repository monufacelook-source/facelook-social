import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Search,
  Settings,
  BookOpen,
  Heart,
  ImagePlus,
  Gamepad2,
  Camera,
  X,
  MessageCircle,
  Bell,
  User,
  Check,
  UserX,
  Sparkles,
} from "lucide-react";
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";
import NotificationPanel from "@/components/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const TRAY_SOUND_URL =
  "https://www.soundjay.com/mechanical/sounds/mechanical-clutter-1.mp3";

function playTraySound() {
  try {
    const audio = new Audio(TRAY_SOUND_URL);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  } catch {}
}

// ── LUCKY MESSAGES ──
const LUCKY_MESSAGES = [
  "Aaj ka din aapke liye bahut shubh hai. Naya avsar aane wala hai.",
  "Taare keh rahe hain — aaj dil ki suno, dimag baad mein!",
  "Aaj paisa aur pyaar dono muskura rahe hain aap par ☀️",
  "Koi khaas mulakat ho sakti hai aaj. Taiyaar rahein! 💫",
  "Aaj creativity peak par hai. Kuch naya try karein 🎨",
  "Ghar mein khushiyan aayengi. Parivar ke saath time bitayein 🏡",
  "Career mein ek surprising turn aane wala hai aaj 🚀",
  "Swasthya achha rahega, lekin paani khub piyein 💧",
];

const LUCKY_NUMBERS = [3, 7, 9, 11, 14, 21, 27, 33, 42, 55, 66, 77, 88, 99];

function getRashifal(name: string) {
  const seed = name.charCodeAt(0) + new Date().getDate();
  const msg = LUCKY_MESSAGES[seed % LUCKY_MESSAGES.length];
  const num = LUCKY_NUMBERS[seed % LUCKY_NUMBERS.length];
  return { msg, num };
}

// ── RASHIFAL SECTION (Updated Clean Style) ──
function RashifalCard({ name }: { name: string }) {
  const { msg, num } = useMemo(() => getRashifal(name), [name]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mx-4 mb-3 p-5 rounded-[2.5rem] relative overflow-hidden bg-white/40 backdrop-blur-2xl border border-white/60 shadow-sm"
    >
      <div className="relative z-10 flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
          <Sparkles className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
            Aaj Ka Rashifal
          </p>
          <p className="text-gray-800 font-bold text-sm leading-snug">
            Hello{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600 font-black">
              {name}
            </span>
            , {msg}
          </p>
          <p className="text-amber-600 text-[11px] font-black mt-2">
            ✨ Lucky Number: {num}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── HOOK REQUESTS ──
const SUGGESTED = [
  {
    id: "s1",
    full_name: "Priya Sharma",
    username: "priya.sh",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    mutual: 4,
  },
  {
    id: "s2",
    full_name: "Arjun Dev",
    username: "arjun.d",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    mutual: 2,
  },
  {
    id: "s3",
    full_name: "Meera Lux",
    username: "meera.lx",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
    mutual: 7,
  },
];

function HooksSection() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await supabase
          .from("friendships")
          .select(
            "*, profiles:requester_id(id, full_name, username, avatar_url)",
          )
          .eq("addressee_id", user.id)
          .eq("status", "pending")
          .limit(3);
        if (mounted && data) setRequests(data);
      } catch {}
    };
    load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const visible = requests.filter((r) => !dismissed.has(r.id));
  const showSuggested = visible.length === 0;

  const accept = async (r: any) => {
    setDismissed((p) => new Set([...p, r.id]));
    if (user) {
      await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", r.id);
    }
  };

  const reject = (id: string) => setDismissed((p) => new Set([...p, id]));
  const list = showSuggested ? SUGGESTED : visible.slice(0, 3);

  return (
    <div className="mx-4 mb-3">
      <p className="text-gray-400 text-[9px] font-black uppercase tracking-widest mb-2 px-1">
        {showSuggested ? "✨ Suggested Hooks" : "🪝 Hook Requests"}
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {list.map((item) => {
          const profile = item.profiles || item;
          return (
            <div
              key={item.id}
              className="shrink-0 w-[125px] rounded-[2rem] p-4 flex flex-col items-center gap-3 bg-white/50 border border-white/60 shadow-sm"
            >
              <img
                src={profile.avatar_url || profile.avatar}
                alt={profile.full_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
              />
              <div className="text-center">
                <p className="text-gray-800 font-bold text-[11px] leading-tight truncate w-full">
                  {profile.full_name}
                </p>
                <p className="text-gray-400 text-[9px]">
                  {profile.mutual || 0} mutual
                </p>
              </div>
              {showSuggested ? (
                <button className="w-full py-1.5 rounded-xl text-[10px] font-black text-white bg-black">
                  Hook +
                </button>
              ) : (
                <div className="flex gap-1.5 w-full">
                  <button
                    onClick={() => accept(item)}
                    className="flex-1 py-1.5 rounded-xl bg-cyan-500 flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => reject(item.id)}
                    className="flex-1 py-1.5 rounded-xl bg-gray-100 flex items-center justify-center"
                  >
                    <UserX className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── STORIES TRAY ──
const STORIES = [
  {
    id: 1,
    username: "ana.ray",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
  },
  {
    id: 2,
    username: "kai.m",
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600",
  },
  {
    id: 3,
    username: "lena.v",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
  },
  {
    id: 4,
    username: "jake.p",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
  },
];

function StoriesTray({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[250] bg-black"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 36 }}
        >
          <img
            src={STORIES[active].src}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          <div className="relative z-10 flex items-center justify-between p-4 pt-12">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-white font-black text-lg italic uppercase">
                Stories
              </span>
            </div>
            <button
              onClick={onClose}
              className="bg-white/10 p-2.5 rounded-full backdrop-blur-xl"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-12">
            <p className="text-white font-black text-2xl mb-4">
              @{STORIES[active].username}
            </p>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {STORIES.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setActive(i)}
                  className="flex flex-col items-center gap-2"
                >
                  <img
                    src={s.src}
                    className={`w-14 h-14 rounded-2xl object-cover border-2 transition-all ${i === active ? "border-cyan-400 scale-110" : "border-white/30"}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── POWER BUTTON ──
function PowerButton({ icon: Icon, label, color, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl ${color} border border-white/20`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
    </motion.button>
  );
}

// ── MAIN INDEX ──
export default function Index() {
  const { profile } = useAuth();
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const displayName = profile?.full_name || profile?.username || "Friend";

  const openFlicks = useCallback(() => {
    playTraySound();
    setFlicksOpen(true);
  }, []);
  const openStories = useCallback(() => {
    playTraySound();
    setStoriesOpen(true);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative bg-[#f8faff]">
      {/* HEADER */}
      <header className="relative z-[60] h-16 flex items-center gap-3 px-5 shrink-0 bg-white/80 backdrop-blur-2xl border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-500 fill-cyan-500" />
          <h1 className="text-xl font-black italic tracking-tighter bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            FACELOOK
          </h1>
        </div>
        <div
          className={`flex-1 flex items-center gap-2 rounded-2xl px-4 py-2 transition-all ${searchFocus ? "bg-white shadow-md border-cyan-200" : "bg-gray-100 border-transparent"} border`}
        >
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className="bg-transparent outline-none text-sm w-full font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAlertsOpen(true)}
            className="p-2.5 bg-gray-100 rounded-full text-gray-600"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 bg-gray-100 rounded-full text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* MAIN AREA */}
      <div className="relative flex-1 overflow-hidden flex">
        {/* LEFT TRAY HANDLE */}
        <div
          onClick={openFlicks}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 h-32 w-1.5 bg-cyan-500 rounded-r-full cursor-pointer hover:w-3 transition-all"
        />

        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="pt-4">
            <RashifalCard name={displayName} />
          </div>
          <HooksSection />
          <MainFeed />
        </main>

        {/* RIGHT TRAY HANDLE */}
        <div
          onClick={openStories}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-50 h-32 w-1.5 bg-purple-500 rounded-l-full cursor-pointer hover:w-3 transition-all"
        />
      </div>

      {/* BOTTOM NAV */}
      <nav className="absolute bottom-0 left-0 right-0 z-[60] h-24 flex items-center justify-around px-6 bg-white/90 backdrop-blur-2xl border-t border-gray-100">
        <PowerButton icon={Heart} label="Heart" color="bg-rose-500" />
        <PowerButton icon={ImagePlus} label="Post" color="bg-cyan-500" />
        <button
          onClick={() => setProfileOpen(true)}
          className="flex flex-col items-center -mt-10"
        >
          <div className="w-16 h-16 rounded-[2rem] bg-black p-1 shadow-2xl flex items-center justify-center border-4 border-white overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-white w-8 h-8" />
            )}
          </div>
          <span className="text-[9px] font-black uppercase text-gray-400 mt-2">
            Me
          </span>
        </button>
        <PowerButton icon={Gamepad2} label="Tasks" color="bg-violet-600" />
        <PowerButton icon={Camera} label="Snapy" color="bg-orange-500" />
      </nav>

      {/* MODALS */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />
      <StoriesTray isOpen={storiesOpen} onClose={() => setStoriesOpen(false)} />
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[300] bg-white"
          >
            <SettingsPanel onClose={() => setSettingsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {alertsOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 z-[300] bg-white flex flex-col"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b">
              <h2 className="font-black">NOTIFICATIONS</h2>
              <button onClick={() => setAlertsOpen(false)}>
                <X />
              </button>
            </div>
            <NotificationPanel />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-28 right-6 z-[70] w-14 h-14 bg-black rounded-[1.8rem] shadow-2xl flex items-center justify-center border-2 border-white/20"
      >
        <MessageCircle className="w-6 h-6 text-cyan-400" />
      </button>
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[400] bg-white"
          >
            <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
