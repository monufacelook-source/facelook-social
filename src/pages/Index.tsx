import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Search, Settings, BookOpen, Heart, ImagePlus,
  Gamepad2, Camera, X, MessageCircle, Bell, User,
  Check, UserX, Sparkles,
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

// ── RASHIFAL CARD ──
function RashifalCard({ name }: { name: string }) {
  const { msg, num } = useMemo(() => getRashifal(name), [name]);
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mx-4 mb-3 rounded-3xl overflow-hidden relative"
      style={{
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 8px 32px rgba(0,242,254,0.08)",
      }}
    >
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, #00F2FE 0%, transparent 60%), radial-gradient(ellipse at bottom right, #9B51E0 0%, transparent 60%)",
        }}
      />
      <div className="relative z-10 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-0.5">
            Aaj Ka Rashifal
          </p>
          <p className="text-white font-bold text-sm leading-snug">
            Hello{" "}
            <span className="bg-gradient-to-r from-[#00F2FE] to-[#9B51E0] bg-clip-text text-transparent font-black">
              {name}
            </span>
            , {msg}
          </p>
          <p className="text-amber-400 text-[10px] font-black mt-1.5">
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
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
    mutual: 4,
  },
  {
    id: "s2",
    full_name: "Arjun Dev",
    username: "arjun.d",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
    mutual: 2,
  },
  {
    id: "s3",
    full_name: "Meera Lux",
    username: "meera.lx",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
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
          .select("*, profiles:requester_id(id, full_name, username, avatar_url)")
          .eq("addressee_id", user.id)
          .eq("status", "pending")
          .limit(3);
        if (mounted && data) setRequests(data);
      } catch {}
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  const visible = requests.filter((r) => !dismissed.has(r.id));
  const showSuggested = visible.length === 0;

  const accept = async (r: any) => {
    setDismissed((p) => new Set([...p, r.id]));
    if (user) {
      await supabase.from("friendships").update({ status: "accepted" }).eq("id", r.id);
    }
  };

  const reject = (id: string) => setDismissed((p) => new Set([...p, id]));

  const list = showSuggested ? SUGGESTED : visible.slice(0, 3);

  return (
    <div className="mx-4 mb-3">
      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-2 px-1">
        {showSuggested ? "✨ Suggested Hooks" : "🪝 Hook Requests"}
      </p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {list.map((item) => {
          const profile = item.profiles || item;
          return (
            <div
              key={item.id}
              className="shrink-0 w-[120px] rounded-2xl p-3 flex flex-col items-center gap-2"
              style={{
                background: "rgba(255,255,255,0.07)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <img
                src={profile.avatar_url || profile.avatar}
                alt={profile.full_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
              />
              <div className="text-center">
                <p className="text-white font-bold text-[11px] leading-tight truncate w-full text-center">
                  {profile.full_name}
                </p>
                <p className="text-white/40 text-[9px]">
                  {profile.mutual || 0} mutual
                </p>
              </div>
              {showSuggested ? (
                <button
                  className="w-full py-1 rounded-xl text-[10px] font-black text-white bg-gradient-to-r from-[#00F2FE] to-[#9B51E0]"
                >
                  Hook +
                </button>
              ) : (
                <div className="flex gap-1 w-full">
                  <button
                    onClick={() => accept(item)}
                    className="flex-1 py-1 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#9B51E0] flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => reject(item.id)}
                    className="flex-1 py-1 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center"
                  >
                    <UserX className="w-3 h-3 text-white/60" />
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
  { id: 1, username: "ana.ray", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=1000&fit=crop" },
  { id: 2, username: "kai.m",   src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=1000&fit=crop" },
  { id: 3, username: "lena.v",  src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=1000&fit=crop" },
  { id: 4, username: "jake.p",  src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=1000&fit=crop" },
];

function StoriesTray({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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
            alt="story"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

          <div className="relative z-10 flex items-center justify-between p-4 pt-12">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-white" />
              <span className="text-white font-black text-lg italic tray-label">
                STORIES
              </span>
            </div>
            <button
              data-testid="button-close-stories"
              onClick={onClose}
              className="bg-black/40 backdrop-blur-xl border border-white/20 p-2.5 rounded-full"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Progress bars */}
          <div className="relative z-10 flex gap-1 px-4">
            {STORIES.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full bg-white/30 overflow-hidden">
                <div className={`h-full bg-white transition-all ${i < active ? "w-full" : i === active ? "w-1/2" : "w-0"}`} />
              </div>
            ))}
          </div>

          <div className="absolute inset-0 z-10 flex">
            <div className="flex-1" onClick={() => setActive((p) => Math.max(0, p - 1))} />
            <div className="flex-1" onClick={() => setActive((p) => Math.min(STORIES.length - 1, p + 1))} />
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-10">
            <p className="text-white font-black text-xl mb-4">@{STORIES[active].username}</p>
            <div className="flex gap-2">
              {STORIES.map((s, i) => (
                <button
                  key={s.id}
                  data-testid={`button-story-${s.id}`}
                  onClick={() => setActive(i)}
                  className="flex flex-col items-center gap-1"
                >
                  <img
                    src={s.src}
                    alt={s.username}
                    className={`w-11 h-11 rounded-full object-cover border-2 transition-all ${i === active ? "border-[#00F2FE] scale-110" : "border-white/30"}`}
                  />
                  <span className="text-white/60 text-[8px] font-bold">@{s.username}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── SETTINGS MODAL (full-screen) ──
function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[310]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 top-16 overflow-hidden rounded-t-[2rem]"
          style={{
            background: "rgba(10, 8, 30, 0.85)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 35 }}
        >
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #9B51E0, transparent)" }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #00F2FE, transparent)" }}
          />
          <div className="relative z-10 h-full overflow-y-auto p-6">
            <SettingsPanel onClose={onClose} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── POWER BUTTON ──
function PowerButton({ icon: Icon, label, color, onClick, testId }: {
  icon: any; label: string; color: string; onClick?: () => void; testId?: string;
}) {
  return (
    <motion.button
      data-testid={testId}
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${color} border border-white/20`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{label}</span>
    </motion.button>
  );
}

// ── INDEX ──
export default function Index() {
  const { profile } = useAuth();
  const [flicksOpen, setFlicksOpen]   = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [chatOpen, setChatOpen]       = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen]   = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const displayName = profile?.full_name || profile?.username || "Friend";

  const openFlicks = useCallback(() => { playTraySound(); setFlicksOpen(true); }, []);
  const openStories = useCallback(() => { playTraySound(); setStoriesOpen(true); }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative font-sans">

      {/* ── WET PAPER BACKGROUND ── */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0f9ff 100%)" }} />
      <div className="absolute top-[-25%] left-[-20%] w-[75vw] h-[75vw] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #00F2FE 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-30%] right-[-20%] w-[85vw] h-[85vw] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #9B51E0 0%, transparent 70%)" }} />
      <div className="absolute top-[35%] left-[20%] w-[60vw] h-[60vw] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #00F2FE 0%, #9B51E0 100%)" }} />

      {/* ── HEADER ── */}
      <header
        className="relative z-[60] h-14 flex items-center gap-3 px-4 shrink-0"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderBottom: "1px solid rgba(255,255,255,0.20)",
        }}
      >
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-5 h-5 text-[#00F2FE] fill-[#00F2FE]" />
          <h1 className="text-lg font-black italic tracking-tight bg-gradient-to-r from-[#00F2FE] to-[#9B51E0] bg-clip-text text-transparent">
            FACELOOK
          </h1>
        </div>

        <div
          className="flex-1 flex items-center gap-2 rounded-full px-3 py-2 transition-all"
          style={{
            background: "rgba(255,255,255,0.20)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: searchFocus ? "1px solid rgba(0,242,254,0.5)" : "1px solid rgba(255,255,255,0.25)",
            boxShadow: searchFocus ? "0 0 12px rgba(0,242,254,0.2)" : "none",
          }}
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            data-testid="input-search"
            type="text"
            placeholder="Search Facelook..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            data-testid="button-notifications"
            onClick={() => setAlertsOpen(true)}
            className="p-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Bell className="w-4 h-4 text-gray-600" />
          </button>
          <button
            data-testid="button-settings"
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-full"
            style={{
              background: "rgba(255,255,255,0.18)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      {/* ── MAIN AREA ── */}
      <div className="relative flex-1 overflow-hidden flex">

        {/* LEFT WALL TRAY — FLICKS */}
        <motion.button
          data-testid="button-open-flicks"
          onClick={openFlicks}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] h-36 w-8 rounded-r-2xl flex items-center justify-center cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderLeft: "none",
            boxShadow: "4px 0 20px rgba(0,242,254,0.1)",
          }}
          whileHover={{ width: 42 }}
          whileTap={{ scale: 0.93 }}
        >
          <span className="tray-label uppercase font-black text-[8px] tracking-[2.5px] [writing-mode:vertical-rl] rotate-180">
            FLICKS 📀
          </span>
        </motion.button>

        {/* SCROLLABLE FEED */}
        <main className="flex-1 overflow-y-auto no-scrollbar pb-28">
          {/* Rashifal Card */}
          <div className="pt-3">
            <RashifalCard name={displayName} />
          </div>

          {/* Hook Requests */}
          <HooksSection />

          {/* Main Feed */}
          <MainFeed />
        </main>

        {/* RIGHT WALL TRAY — STORIES */}
        <motion.button
          data-testid="button-open-stories"
          onClick={openStories}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] h-36 w-8 rounded-l-2xl flex items-center justify-center cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.22)",
            borderRight: "none",
            boxShadow: "-4px 0 20px rgba(155,81,224,0.1)",
          }}
          whileHover={{ width: 42 }}
          whileTap={{ scale: 0.93 }}
        >
          <span className="tray-label uppercase font-black text-[8px] tracking-[2.5px] [writing-mode:vertical-rl]">
            STORIES ✨
          </span>
        </motion.button>
      </div>

      {/* ── BOTTOM POWER BAR ── */}
      <nav
        className="absolute bottom-0 left-0 right-0 z-[60] h-24 flex items-center justify-around px-4"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderTop: "1px solid rgba(255,255,255,0.20)",
        }}
      >
        <PowerButton icon={Heart}     label="M-Heart" color="bg-gradient-to-br from-rose-400 to-red-600"    testId="button-mheart" />
        <PowerButton icon={ImagePlus} label="Post"    color="bg-gradient-to-br from-cyan-400 to-blue-600"   testId="button-post" />

        <motion.button
          data-testid="button-profile"
          onClick={() => setProfileOpen(true)}
          whileTap={{ scale: 0.85 }}
          className="flex flex-col items-center gap-1 -mt-8"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F2FE] to-[#9B51E0] flex items-center justify-center shadow-2xl"
            style={{ border: "4px solid rgba(255,255,255,0.4)" }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="me" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Me</span>
        </motion.button>

        <PowerButton icon={Gamepad2} label="Tasks" color="bg-gradient-to-br from-violet-400 to-purple-700" testId="button-tasks" />
        <PowerButton icon={Camera}   label="Snapy" color="bg-gradient-to-br from-amber-400 to-orange-600"  testId="button-snapy" />
      </nav>

      {/* ── OVERLAYS ── */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />
      <StoriesTray isOpen={storiesOpen} onClose={() => setStoriesOpen(false)} />

      <AnimatePresence>
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: "rgba(8,6,24,0.95)", backdropFilter: "blur(40px)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
          >
            <div className="h-16 bg-gradient-to-r from-[#00F2FE] to-[#9B51E0] flex items-center justify-between px-6 text-white shrink-0">
              <h2 className="font-black tracking-widest uppercase text-sm italic">VIBE ⚡</h2>
              <button data-testid="button-close-chat" onClick={() => setChatOpen(false)} className="bg-white/20 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1">
              <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {alertsOpen && (
          <motion.div
            className="fixed inset-0 z-[250] bg-white flex flex-col"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
          >
            <div className="h-16 bg-gradient-to-r from-[#00F2FE] to-[#9B51E0] flex items-center justify-between px-6 text-white shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <h2 className="font-black tracking-widest uppercase text-sm">Notifications</h2>
              </div>
              <button data-testid="button-close-alerts" onClick={() => setAlertsOpen(false)} className="bg-white/20 p-2 rounded-full">
                <X className="w-5 h-5" />
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

      {/* Floating Chat Button */}
      <motion.button
        data-testid="button-open-chat"
        onClick={() => setChatOpen(true)}
        whileTap={{ scale: 0.85 }}
        className="fixed bottom-28 right-4 z-[70] w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
        style={{
          background: "linear-gradient(135deg, #00F2FE, #9B51E0)",
          border: "2px solid rgba(255,255,255,0.3)",
        }}
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </motion.button>
    </div>
  );
}
