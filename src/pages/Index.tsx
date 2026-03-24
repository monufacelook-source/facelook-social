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

const LUCKY_MESSAGES = [
  "Aaj ka din aapke liye bahut shubh hai. Naya avsar aane wala hai.",
  "Taare keh rahe hain — aaj dil ki suno, dimag baad mein!",
  "Aaj paisa aur pyaar dono muskura rahe hain aap par ✨",
  "Koi khaas mulakat ho sakti hai aaj. Taiyaar rahein! 🤝",
  "Aaj creativity peak par hai. Kuch naya try karein 🎨",
  "Ghar mein khushiyan aayengi. Parivar ke saath time bitayein ❤️",
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

function RashifalCard({ name }: { name: string }) {
  const { msg, num } = useMemo(() => getRashifal(name), [name]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-3 rounded-3xl overflow-hidden relative p-4"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <div className="relative z-10 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-0.5">
            Aaj Ka Rashifal
          </p>
          <p className="text-white font-bold text-sm leading-snug">
            Hello <span className="text-cyan-400">{name}</span>, {msg}
          </p>
          <p className="text-amber-400 text-[10px] font-black mt-1.5">
            🔢 Lucky Number: {num}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

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
];

function HooksSection() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
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
        if (data) setRequests(data);
      } catch {}
    };
    load();
  }, [user]);

  const visible = requests.filter((r) => !dismissed.has(r.id));
  const list = visible.length === 0 ? SUGGESTED : visible;

  return (
    <div className="mx-4 mb-3">
      <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-2 px-1">
        Discover People
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {list.map((profile: any) => (
          <div
            key={profile.id}
            className="shrink-0 w-[120px] rounded-2xl p-3 flex flex-col items-center gap-2 bg-white border shadow-sm"
          >
            <img
              src={profile.avatar_url || profile.avatar}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
            />
            <div className="text-center">
              <p className="text-gray-800 font-bold text-[11px] truncate w-24 text-center">
                {profile.full_name}
              </p>
              <p className="text-gray-400 text-[9px]">
                {profile.mutual || 0} mutual
              </p>
            </div>
            <button className="w-full py-1 rounded-xl text-[10px] font-black text-white bg-black">
              Hook +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const STORIES = [
  {
    id: 1,
    username: "ana.ray",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=1000&fit=crop",
  },
  {
    id: 2,
    username: "kai.m",
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=1000&fit=crop",
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
        >
          <img
            src={STORIES[active].src}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-12 right-4 z-50 bg-black/40 p-2 rounded-full text-white"
          >
            <X />
          </button>
          <div className="absolute bottom-10 left-6 z-50 text-white font-black text-xl">
            @{STORIES[active].username}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PowerButton({ icon: Icon, label, color, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${color} border border-white/20`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
        {label}
      </span>
    </motion.button>
  );
}

export default function Index() {
  const { user, profile, loading } = useAuth();
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  const displayName = profile?.full_name || "Guest";

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Zap className="animate-pulse text-cyan-500" />
      </div>
    );

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative bg-[#f0f2f5] text-gray-800">
      {/* HEADER */}
      <header className="relative z-[60] h-16 flex items-center gap-3 px-4 shrink-0 bg-white/80 backdrop-blur-xl border-b">
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-5 h-5 text-cyan-500 fill-cyan-500" />
          <h1 className="text-xl font-black italic tracking-tighter text-black">
            FACELOOK
          </h1>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          {!user && (
            <button className="text-[10px] font-bold bg-black text-white px-3 py-1.5 rounded-full">
              LOGIN
            </button>
          )}
          <button
            onClick={() => setAlertsOpen(true)}
            className="p-2 bg-gray-100 rounded-full"
          >
            <Bell size={18} />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 bg-gray-100 rounded-full"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="relative flex-1 overflow-hidden flex">
        {/* LEFT TRAY BUTTON */}
        <div
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 h-32 w-6 bg-white/40 backdrop-blur-md rounded-r-xl flex items-center justify-center border border-l-0 shadow-sm"
        >
          <span className="text-[8px] font-black [writing-mode:vertical-rl] rotate-180">
            FLICKS
          </span>
        </div>

        <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="pt-4">
            <RashifalCard name={displayName} />
          </div>
          <HooksSection />
          <MainFeed />
        </main>

        {/* RIGHT TRAY BUTTON */}
        <div
          onClick={() => setStoriesOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 h-32 w-6 bg-white/40 backdrop-blur-md rounded-l-xl flex items-center justify-center border border-r-0 shadow-sm"
        >
          <span className="text-[8px] font-black [writing-mode:vertical-rl]">
            STORIES
          </span>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <nav className="absolute bottom-0 left-0 right-0 z-[60] h-24 bg-white/90 backdrop-blur-2xl border-t flex items-center justify-around px-4">
        <PowerButton icon={Heart} label="M-Heart" color="bg-rose-500" />
        <PowerButton icon={ImagePlus} label="Post" color="bg-cyan-500" />

        <button
          onClick={() => setProfileOpen(true)}
          className="flex flex-col items-center -mt-10"
        >
          <div className="w-16 h-16 rounded-[2rem] bg-black p-1 shadow-2xl border-4 border-white overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-white w-full h-full p-3" />
            )}
          </div>
          <span className="text-[9px] font-black text-gray-400 mt-2 uppercase">
            Me
          </span>
        </button>

        <PowerButton icon={Gamepad2} label="Tasks" color="bg-purple-500" />
        <PowerButton icon={Camera} label="Snapy" color="bg-amber-500" />
      </nav>

      {/* OVERLAYS & MODALS */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />
      <StoriesTray isOpen={storiesOpen} onClose={() => setStoriesOpen(false)} />

      <AnimatePresence>
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
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
        {alertsOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[300] bg-white"
          >
            <NotificationPanel />
            <button
              onClick={() => setAlertsOpen(false)}
              className="fixed top-5 right-5 p-2 bg-gray-100 rounded-full"
            >
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-black rounded-3xl flex items-center justify-center shadow-2xl z-50 border-2 border-white/20"
      >
        <MessageCircle className="text-cyan-400" />
      </button>

      <ChatTray isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
