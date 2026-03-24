import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Search,
  Settings,
  Film,
  BookOpen,
  Heart,
  ImagePlus,
  Gamepad2,
  Camera,
  X,
  MessageCircle,
  Bell,
  User,
} from "lucide-react";
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";
import NotificationPanel from "@/components/NotificationPanel";

const TRAY_SOUND_URL =
  "https://www.soundjay.com/mechanical/sounds/mechanical-clutter-1.mp3";

function playTraySound() {
  try {
    const audio = new Audio(TRAY_SOUND_URL);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  } catch {}
}

const STORIES = [
  {
    id: 1,
    username: "ana.ray",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=350&fit=crop",
  },
  {
    id: 2,
    username: "kai.m",
    src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=350&fit=crop",
  },
  {
    id: 3,
    username: "lena.v",
    src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=350&fit=crop",
  },
  {
    id: 4,
    username: "jake.p",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=350&fit=crop",
  },
];

function StoriesTray({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeStory, setActiveStory] = useState(0);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[240] bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-y-0 right-0 w-[85vw] max-w-[380px] z-[250] flex flex-col overflow-hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 38 }}
          >
            <img
              src={STORIES[activeStory].src}
              alt="story"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40" />

            <div className="relative z-10 flex items-center justify-between p-4 pt-10">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-white fill-white" />
                <span className="text-white font-black text-lg italic tracking-tight">
                  STORIES
                </span>
              </div>
              <button
                data-testid="button-close-stories"
                onClick={onClose}
                className="bg-white/15 backdrop-blur-xl border border-white/20 p-2 rounded-full"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-end p-5 pb-10">
              <p className="text-white font-black text-lg mb-1">
                @{STORIES[activeStory].username}
              </p>
              <div className="flex gap-2 mt-4">
                {STORIES.map((s, i) => (
                  <button
                    key={s.id}
                    data-testid={`button-story-${s.id}`}
                    onClick={() => setActiveStory(i)}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <img
                      src={s.src}
                      alt={s.username}
                      className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${i === activeStory ? "border-[#00F2FE] scale-110" : "border-white/30"}`}
                    />
                    <span className="text-white/70 text-[9px] font-bold truncate w-full text-center">
                      @{s.username}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[310] flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/25 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        <motion.div
          className="relative w-full max-w-sm bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden"
          initial={{ scale: 0.85, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
        >
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, #9B51E0, transparent)",
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{
              background: "radial-gradient(circle, #00F2FE, transparent)",
            }}
          />
          <div className="relative z-10">
            <SettingsPanel onClose={onClose} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PowerButton({
  icon: Icon,
  label,
  color,
  onClick,
  testId,
}: {
  icon: any;
  label: string;
  color: string;
  onClick?: () => void;
  testId?: string;
}) {
  return (
    <motion.button
      data-testid={testId}
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${color} border border-white/20`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-widest text-white/70">
        {label}
      </span>
    </motion.button>
  );
}

export default function Index() {
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const openFlicks = useCallback(() => {
    playTraySound();
    setFlicksOpen(true);
  }, []);

  const openStories = useCallback(() => {
    playTraySound();
    setStoriesOpen(true);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative select-none font-sans">
      {/* ── WET PAPER BACKGROUND ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-50" />
      <div
        className="absolute top-[-20%] left-[-15%] w-[70vw] h-[70vw] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #00F2FE 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-25%] right-[-15%] w-[80vw] h-[80vw] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #9B51E0 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-[40%] left-[30%] w-[50vw] h-[50vw] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{
          background: "radial-gradient(circle, #00F2FE 0%, #9B51E0 100%)",
        }}
      />

      {/* ── HEADER ── */}
      <header className="relative z-[60] h-16 bg-white/15 backdrop-blur-2xl border-b border-white/25 flex items-center gap-3 px-4 shrink-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <Zap className="w-5 h-5 text-[#00F2FE] fill-[#00F2FE]" />
          <h1 className="text-xl font-black italic tracking-tight bg-gradient-to-r from-[#00F2FE] to-[#9B51E0] bg-clip-text text-transparent">
            FACELOOK
          </h1>
        </div>

        <div
          className={`flex-1 flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-3 py-2 transition-all ${searchOpen ? "ring-2 ring-[#00F2FE]/40" : ""}`}
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            ref={searchRef}
            data-testid="input-search"
            type="text"
            placeholder="Search Facelook..."
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            data-testid="button-notifications"
            onClick={() => setAlertsOpen(true)}
            className="p-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full"
          >
            <Bell className="w-4 h-4 text-gray-600" />
          </button>
          <button
            data-testid="button-settings"
            onClick={() => setSettingsOpen(true)}
            className="p-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full"
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
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[50] bg-white/15 backdrop-blur-2xl border border-white/25 border-l-0 h-36 w-8 rounded-r-2xl flex items-center justify-center shadow-xl cursor-pointer"
          whileHover={{ width: 40, backgroundColor: "rgba(0,242,254,0.15)" }}
          whileTap={{ scale: 0.94 }}
        >
          <span className="uppercase font-black text-[8px] tracking-[2.5px] [writing-mode:vertical-rl] rotate-180 text-gray-500">
            FLICKS 📀
          </span>
        </motion.button>

        {/* CENTER FEED */}
        <main className="flex-1 overflow-y-auto pb-28 px-2">
          <MainFeed />
        </main>

        {/* RIGHT WALL TRAY — STORIES */}
        <motion.button
          data-testid="button-open-stories"
          onClick={openStories}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-[50] bg-white/15 backdrop-blur-2xl border border-white/25 border-r-0 h-36 w-8 rounded-l-2xl flex items-center justify-center shadow-xl cursor-pointer"
          whileHover={{ width: 40, backgroundColor: "rgba(155,81,224,0.15)" }}
          whileTap={{ scale: 0.94 }}
        >
          <span className="uppercase font-black text-[8px] tracking-[2.5px] [writing-mode:vertical-rl] text-gray-500">
            STORIES ✨
          </span>
        </motion.button>
      </div>

      {/* ── BOTTOM POWER BAR ── */}
      <nav className="absolute bottom-0 left-0 right-0 z-[60] h-24 bg-white/15 backdrop-blur-2xl border-t border-white/25 flex items-center justify-around px-6">
        <PowerButton
          icon={Heart}
          label="M-Heart"
          color="bg-gradient-to-br from-rose-400 to-red-600"
          testId="button-mheart"
        />
        <PowerButton
          icon={ImagePlus}
          label="Post"
          color="bg-gradient-to-br from-cyan-400 to-blue-600"
          testId="button-post"
        />

        {/* Center profile button */}
        <motion.button
          data-testid="button-profile"
          onClick={() => setProfileOpen(true)}
          whileTap={{ scale: 0.88 }}
          className="flex flex-col items-center gap-1.5 -mt-8"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00F2FE] to-[#9B51E0] flex items-center justify-center border-4 border-white/50 shadow-2xl">
            <User className="w-8 h-8 text-white" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/70">
            Me
          </span>
        </motion.button>

        <PowerButton
          icon={Gamepad2}
          label="Tasks"
          color="bg-gradient-to-br from-violet-400 to-purple-700"
          testId="button-tasks"
        />
        <PowerButton
          icon={Camera}
          label="Snapy"
          color="bg-gradient-to-br from-amber-400 to-orange-600"
          testId="button-snapy"
        />
      </nav>

      {/* ── OVERLAYS ── */}

      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />
      <StoriesTray isOpen={storiesOpen} onClose={() => setStoriesOpen(false)} />

      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal onClose={() => setSettingsOpen(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            className="fixed inset-0 z-[200] bg-white flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
          >
            <div className="h-16 bg-gradient-to-r from-[#00F2FE] to-[#9B51E0] flex items-center justify-between px-6 text-white shrink-0">
              <h2 className="font-black tracking-widest uppercase text-sm italic">
                VIBE ⚡
              </h2>
              <button
                data-testid="button-close-chat"
                onClick={() => setChatOpen(false)}
                className="bg-white/20 p-2 rounded-full"
              >
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
                <h2 className="font-black tracking-widest uppercase text-sm">
                  Notifications
                </h2>
              </div>
              <button
                data-testid="button-close-alerts"
                onClick={() => setAlertsOpen(false)}
                className="bg-white/20 p-2 rounded-full"
              >
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
        whileTap={{ scale: 0.88 }}
        className="fixed bottom-28 right-4 z-[70] w-12 h-12 bg-gradient-to-br from-[#00F2FE] to-[#9B51E0] rounded-full flex items-center justify-center shadow-xl border-2 border-white/30"
      >
        <MessageCircle className="w-5 h-5 text-white" />
      </motion.button>
    </div>
  );
}
