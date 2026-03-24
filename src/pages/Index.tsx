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
  Share2,
  MoreVertical,
} from "lucide-react";

// Components Imports (Ensure these paths are correct in your project)
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";
import NotificationPanel from "@/components/NotificationPanel";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

// --- TIKTOK STYLE VIDEO COMPONENT ---
function TikTokVideo({ videoId }: { videoId: string }) {
  return (
    <div className="relative w-full h-[75vh] bg-black mb-6 rounded-[2.5rem] overflow-hidden shadow-2xl border-[6px] border-white">
      <iframe
        className="w-full h-full scale-[1.6] pointer-events-none"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1`}
        allow="autoplay; encrypted-media"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

      {/* Video Info */}
      <div className="absolute bottom-8 left-6 text-white z-10">
        <h3 className="font-black text-lg italic truncate">@Facelook_Vibes</h3>
        <p className="text-sm font-medium opacity-90">
          Experience the new era of Social 🚀 #Trending
        </p>
      </div>

      {/* Side Actions */}
      <div className="absolute right-4 bottom-12 flex flex-col gap-5 items-center z-10">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Heart className="text-white fill-white w-6 h-6" />
          </div>
          <span className="text-white text-[10px] font-bold mt-1">2.4M</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <MessageCircle className="text-white w-6 h-6" />
          </div>
          <span className="text-white text-[10px] font-bold mt-1">10K</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
            <Share2 className="text-white w-6 h-6" />
          </div>
          <span className="text-white text-[10px] font-bold mt-1">Share</span>
        </div>
      </div>
    </div>
  );
}

// --- RASHIFAL CARD (BLACK & BLUE THEME) ---
function RashifalCard({ name }: { name: string }) {
  const LUCKY_MESSAGES = [
    "Aaj naya avsar milega!",
    "Dil ki suno, dimag ki nahi.",
    "Aaj ka din lucky hai!",
    "Paisa aur Pyaar dono milenge.",
  ];
  const msg = LUCKY_MESSAGES[Math.floor(Math.random() * LUCKY_MESSAGES.length)];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="mx-4 mb-6 rounded-[2rem] p-5 border-2 border-blue-100 shadow-lg shadow-blue-50 bg-white"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-blue-200 shadow-lg">
          <Sparkles className="text-white w-6 h-6" />
        </div>
        <div>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">
            Daily Horoscope
          </p>
          <h2 className="text-black font-black text-lg leading-tight">
            Hi {name}, <span className="text-blue-600">{msg}</span>
          </h2>
          <p className="text-gray-400 text-[11px] font-bold mt-1">
            🔢 Lucky Number: {Math.floor(Math.random() * 99)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN INDEX ---
export default function Index() {
  const { user, profile, loading } = useAuth();
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);

  const displayName = profile?.full_name || "Guest";

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Zap className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative bg-[#F8FAFF]">
      {/* HEADER */}
      <header className="relative z-[100] h-16 flex items-center gap-4 px-5 bg-white/80 backdrop-blur-2xl border-b border-gray-100">
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-6 h-6 text-blue-600 fill-blue-600" />
          <h1 className="text-2xl font-black italic tracking-tighter">
            FACELOOK
          </h1>
        </div>

        <div
          className={`flex-1 flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all bg-gray-100 ${searchFocus ? "ring-2 ring-blue-500 bg-white shadow-md" : ""}`}
        >
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vibes..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className="bg-transparent outline-none text-sm w-full font-bold text-black"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!user && (
            <button
              onClick={() => (window.location.href = "/auth")}
              className="text-[10px] font-black bg-black text-white px-4 py-2 rounded-xl"
            >
              LOGIN
            </button>
          )}
          <button
            onClick={() => setAlertsOpen(true)}
            className="p-2.5 bg-gray-50 rounded-xl border border-gray-100"
          >
            <Bell size={18} className="text-black" />
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 bg-gray-50 rounded-xl border border-gray-100"
          >
            <Settings size={18} className="text-black" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <div className="relative flex-1 overflow-hidden flex">
        {/* SIDE DRAWER BUTTONS */}
        <button
          onClick={() => setFlicksOpen(true)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-50 h-32 w-8 bg-blue-600 text-white rounded-r-3xl flex items-center justify-center shadow-xl"
        >
          <span className="text-[9px] font-black [writing-mode:vertical-rl] rotate-180 tracking-widest">
            FLICKS
          </span>
        </button>

        <button
          onClick={() => setStoriesOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-50 h-32 w-8 bg-black text-white rounded-l-3xl flex items-center justify-center shadow-xl"
        >
          <span className="text-[9px] font-black [writing-mode:vertical-rl] tracking-widest">
            STORIES
          </span>
        </button>

        {/* FEED SCROLL */}
        <main className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-32 px-2">
          <RashifalCard name={displayName} />

          <div className="px-2">
            <TikTokVideo videoId="9Wv6I-pE_S0" />{" "}
            {/* Trending Music/Video ID */}
          </div>

          <MainFeed />
        </main>
      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="absolute bottom-0 left-0 right-0 z-[100] h-24 bg-white/90 backdrop-blur-3xl border-t border-gray-100 flex items-center justify-around px-4">
        <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 cursor-pointer transition-all">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
            <Heart className="w-6 h-6 text-black" />
          </div>
          <span className="text-[9px] font-black text-black">M-HEART</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 cursor-pointer transition-all">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
            <ImagePlus className="w-6 h-6 text-black" />
          </div>
          <span className="text-[9px] font-black text-black">POST</span>
        </div>

        {/* CENTER PROFILE BUTTON */}
        <button
          onClick={() => setProfileOpen(true)}
          className="flex flex-col items-center -mt-10 group"
        >
          <div className="w-20 h-20 rounded-[2.5rem] bg-white p-1.5 shadow-2xl border border-gray-50 group-active:scale-90 transition-all">
            <div className="w-full h-full rounded-[2rem] bg-blue-600 overflow-hidden flex items-center justify-center border-4 border-blue-50">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              ) : (
                <User className="text-white w-8 h-8" />
              )}
            </div>
          </div>
          <span className="text-[10px] font-black text-blue-600 mt-2 tracking-[0.2em]">
            MY SPACE
          </span>
        </button>

        <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 cursor-pointer transition-all">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
            <Gamepad2 className="w-6 h-6 text-black" />
          </div>
          <span className="text-[9px] font-black text-black">TASKS</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 opacity-40 hover:opacity-100 cursor-pointer transition-all">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
            <Camera className="w-6 h-6 text-black" />
          </div>
          <span className="text-[9px] font-black text-black">SNAPY</span>
        </div>
      </nav>

      {/* OVERLAYS (All Functional) */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed inset-0 z-[200] bg-white p-6"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-black">
                SYSTEM SETTINGS
              </h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="p-2 bg-gray-100 rounded-full text-black"
              >
                <X />
              </button>
            </div>
            <SettingsPanel onClose={() => setSettingsOpen(false)} />
          </motion.div>
        )}

        {alertsOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[200] bg-white"
          >
            <div className="h-16 flex items-center justify-between px-6 border-b bg-gray-50">
              <span className="font-black text-black">NOTIFICATIONS</span>
              <X
                onClick={() => setAlertsOpen(false)}
                className="text-black cursor-pointer"
              />
            </div>
            <NotificationPanel />
          </motion.div>
        )}

        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>

      {/* FLOATING CHAT VIBE */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-28 right-6 w-14 h-14 bg-black rounded-2xl flex items-center justify-center shadow-2xl z-50 border-2 border-white/20 active:scale-90 transition-transform"
      >
        <MessageCircle className="text-blue-500 fill-blue-500" />
      </button>

      {/* TRAYS */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />
      <ChatTray isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Stories logic integration */}
      <AnimatePresence>
        {storiesOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[300] bg-black"
          >
            <div className="absolute top-10 left-6 z-50 flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white" />
              <span className="text-white font-bold">Your Story</span>
            </div>
            <button
              onClick={() => setStoriesOpen(false)}
              className="absolute top-10 right-6 z-50 text-white bg-white/20 p-2 rounded-full"
            >
              <X />
            </button>
            <div className="w-full h-full flex items-center justify-center text-white/20 font-black text-4xl italic">
              STORY MODE
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
