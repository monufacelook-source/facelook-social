import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
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
  Flame,
  TrendingUp,
  Music,
  Play,
  Pause,
  Send,
  Layers,
  Ghost,
  Crown,
  Rocket,
  Hash,
  Globe,
} from "lucide-react";

// --- CUSTOM STYLES (Add to your globals.css or Tailwind) ---
// .no-scrollbar::-webkit-scrollbar { display: none; }
// .glass-morphism { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); }

// --- DUMMY DATA ---
const TRENDING_TAGS = [
  "#Facelook2026",
  "#VibeCheck",
  "#DigitalArt",
  "#TechLife",
  "#IndiaGaming",
];
const STORIES = [
  {
    id: 1,
    user: "Sonal",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
  },
  {
    id: 2,
    user: "Aman",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  },
  {
    id: 3,
    user: "Riya",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
  },
  {
    id: 4,
    user: "Ishaan",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
  },
];

const FEED_VIDEOS = [
  {
    id: "v1",
    videoId: "9Wv6I-pE_S0",
    author: "TechBurner",
    likes: "500K",
    comments: "12K",
  },
  {
    id: "v2",
    videoId: "hPr-Yc92fS0",
    author: "CarryMinati",
    likes: "1.2M",
    comments: "90K",
  },
  {
    id: "v3",
    videoId: "L_LUpnj4PNo",
    author: "FlyingBeast",
    likes: "300K",
    comments: "8K",
  },
];

// --- HELPER COMPONENTS ---

const IconButton = ({ icon: Icon, label, color, onClick }: any) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="flex flex-col items-center gap-2 group"
  >
    <div
      className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all ${color} group-hover:shadow-2xl`}
    >
      <Icon className="w-6 h-6 text-white" />
    </div>
    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">
      {label}
    </span>
  </motion.button>
);

// --- 1. FULL SCREEN TIKTOK FEED (No Card Style) ---
function FullScreenTikTokFeed({ video }: { video: any }) {
  const [playing, setPlaying] = useState(true);

  return (
    <div className="relative w-full h-[88vh] bg-black overflow-hidden snap-start shrink-0 first:mt-0">
      {/* Background Video */}
      <iframe
        className="absolute inset-0 w-full h-full scale-[1.8] pointer-events-none"
        src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.videoId}&modestbranding=1&rel=0`}
        allow="autoplay; encrypted-media"
      />

      {/* Interaction Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-40">
        <div className="flex flex-col items-center">
          <motion.div
            whileTap={{ scale: 0.8 }}
            className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20"
          >
            <Heart className="w-7 h-7 text-white fill-white" />
          </motion.div>
          <span className="text-white text-xs font-black mt-1">
            {video.likes}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-black mt-1">
            {video.comments}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs font-black mt-1">Share</span>
        </div>
        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden animate-spin-slow">
          <img
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=100"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-8 left-6 right-20 z-40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white overflow-hidden">
            <img src="https://avatar.iran.liara.run/public" alt="user" />
          </div>
          <h4 className="text-white font-black text-lg">
            @{video.author}{" "}
            <span className="ml-2 text-[10px] bg-blue-500 px-2 py-0.5 rounded-full uppercase">
              Follow
            </span>
          </h4>
        </div>
        <p className="text-white/90 text-sm font-medium line-clamp-2 leading-relaxed">
          The future of Facelook is here! 🚀 No cards, just pure immersion.
          {TRENDING_TAGS.map((t) => (
            <span key={t} className="text-blue-400 ml-1 cursor-pointer">
              {t}
            </span>
          ))}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Music className="w-4 h-4 text-white animate-pulse" />
          <marquee className="text-white text-xs font-bold w-40">
            Original Audio - Facelook Vibes 2026
          </marquee>
        </div>
      </div>
    </div>
  );
}

// --- 2. THE MAIN DASHBOARD ---
export default function Dashboard() {
  // States
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  // Custom Horoscrop Logic (No Card)
  const rashifalMsg =
    "Aaj ka din blue vibes ke saath shuru hoga. Luck level: 99%";

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white text-black font-sans selection:bg-blue-200">
      {/* --- TOP NAVIGATION (GLASS) --- */}
      <header className="fixed top-0 left-0 right-0 z-[100] h-16 flex items-center justify-between px-6 bg-white/60 backdrop-blur-2xl border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
            <Zap className="text-blue-400 fill-blue-400 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black italic tracking-tighter text-black">
            FACELOOK
          </h1>
        </div>

        {/* Global Search Focus Area */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 items-center bg-gray-100/50 rounded-2xl px-4 py-2 border border-transparent focus-within:border-blue-400 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Explore trends..."
            className="bg-transparent border-none outline-none text-sm font-bold w-full px-3"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.location.href = "/auth")}
            className="text-[10px] font-black bg-blue-600 text-white px-6 py-2.5 rounded-2xl shadow-xl shadow-blue-100 hover:scale-105 transition-transform"
          >
            LOGIN
          </button>
          <div
            onClick={() => setAlertsOpen(true)}
            className="relative p-2.5 bg-gray-50 rounded-2xl cursor-pointer"
          >
            <Bell size={20} className="text-black" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </div>
          <div
            onClick={() => setSettingsOpen(true)}
            className="p-2.5 bg-gray-50 rounded-2xl cursor-pointer"
          >
            <Settings size={20} className="text-black" />
          </div>
        </div>
      </header>

      {/* --- MAIN CONTENT (SCROLLABLE) --- */}
      <main className="flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory pt-16 pb-24 bg-white">
        {/* RASHIFAL STRIP (Edge to Edge) */}
        <div className="w-full bg-blue-600 py-3 px-6 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-4">
            <Sparkles className="text-white w-5 h-5 animate-spin-slow" />
            <p className="text-white text-xs font-black uppercase tracking-widest whitespace-nowrap">
              Rashifal Today:{" "}
              <span className="text-blue-100 italic">{rashifalMsg}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white font-bold bg-white/20 px-2 py-0.5 rounded">
              LUCKY: 07
            </span>
          </div>
        </div>

        {/* STORIES TRAY (Horizontal No-Card Style) */}
        <div className="w-full py-6 flex gap-4 overflow-x-auto no-scrollbar px-6 bg-white border-b border-gray-50">
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="w-16 h-16 rounded-[2rem] bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
              <ImagePlus className="text-gray-400 w-6 h-6" />
            </div>
            <span className="text-[9px] font-black text-gray-400">ADD</span>
          </div>
          {STORIES.map((s) => (
            <div
              key={s.id}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div className="w-16 h-16 rounded-[2rem] p-0.5 bg-gradient-to-tr from-blue-600 to-cyan-400">
                <img
                  src={s.img}
                  className="w-full h-full object-cover rounded-[1.8rem] border-2 border-white"
                />
              </div>
              <span className="text-[9px] font-black text-black uppercase">
                {s.user}
              </span>
            </div>
          ))}
        </div>

        {/* FEED SECTIONS (TikTok Style) */}
        <div className="flex flex-col w-full">
          {FEED_VIDEOS.map((v) => (
            <FullScreenTikTokFeed key={v.id} video={v} />
          ))}
        </div>

        {/* SIMPLE LIST FEED (Bottom Segment) */}
        <div className="p-8 bg-gray-50">
          <h2 className="text-3xl font-black mb-6">MORE DISCOVERIES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex gap-4 items-center bg-white p-6 rounded-[3rem] shadow-sm"
              >
                <div className="w-20 h-20 bg-blue-100 rounded-[2.5rem] shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-gray-100 rounded-full mb-3" />
                  <div className="h-3 w-1/2 bg-gray-50 rounded-full" />
                </div>
                <MoreVertical className="text-gray-300" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* --- SIDEBAR BUTTONS (Tiktok Styled Trays) --- */}
      <div
        onClick={() => setFlicksOpen(true)}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-[110] w-10 h-40 bg-blue-600 rounded-r-[2.5rem] flex flex-col items-center justify-center shadow-2xl cursor-pointer hover:w-12 transition-all"
      >
        <Layers className="text-white w-5 h-5 mb-2" />
        <span className="text-[10px] font-black [writing-mode:vertical-rl] text-white tracking-[0.3em]">
          FLICKS
        </span>
      </div>

      <div
        onClick={() => setStoriesOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[110] w-10 h-40 bg-black rounded-l-[2.5rem] flex flex-col items-center justify-center shadow-2xl cursor-pointer hover:w-12 transition-all"
      >
        <span className="text-[10px] font-black [writing-mode:vertical-rl] text-white tracking-[0.3em] rotate-180">
          EXPLORE
        </span>
        <Globe className="text-white w-5 h-5 mt-2" />
      </div>

      {/* --- BOTTOM NAVIGATION (The "Air" Dock) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-[120] h-28 flex items-center justify-center px-6 pointer-events-none">
        <nav className="w-full max-w-lg h-20 bg-white/80 backdrop-blur-3xl border border-white/20 rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] flex items-center justify-around px-4 pointer-events-auto transform transition-transform duration-500">
          <IconButton icon={Heart} label="Vibe" color="bg-rose-500" />
          <IconButton icon={ImagePlus} label="Upload" color="bg-cyan-500" />

          {/* CENTRAL ME BUTTON */}
          <div
            onClick={() => setProfileOpen(true)}
            className="flex flex-col items-center -mt-16 cursor-pointer"
          >
            <div className="w-24 h-24 p-2 bg-white rounded-[3.5rem] shadow-2xl transform active:scale-90 transition-all">
              <div className="w-full h-full rounded-[3rem] bg-black overflow-hidden border-4 border-blue-50 flex items-center justify-center">
                <User className="text-white w-10 h-10" />
              </div>
            </div>
            <span className="text-[11px] font-black text-black mt-2 tracking-widest uppercase">
              My Space
            </span>
          </div>

          <IconButton icon={Gamepad2} label="Games" color="bg-indigo-600" />
          <IconButton icon={Camera} label="Lens" color="bg-amber-500" />
        </nav>
      </div>

      {/* --- OVERLAYS (GLASS PANELS) --- */}
      <AnimatePresence>
        {/* Settings Panel */}
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-4 z-[200] bg-white/90 backdrop-blur-3xl rounded-[4rem] border border-gray-100 shadow-2xl p-10 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                  <Settings />
                </div>
                <h2 className="text-3xl font-black italic">CONTROL CENTER</h2>
              </div>
              <X
                className="w-10 h-10 p-2 bg-gray-100 rounded-full cursor-pointer"
                onClick={() => setSettingsOpen(false)}
              />
            </div>
            {/* Functional Settings Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 bg-gray-50 rounded-[2.5rem]">
                <h3 className="font-black text-blue-600 mb-4">ACCOUNT</h3>
                <p className="text-sm font-bold text-gray-500 hover:text-black cursor-pointer mb-3 uppercase">
                  Privacy Shield
                </p>
                <p className="text-sm font-bold text-gray-500 hover:text-black cursor-pointer uppercase">
                  Data Logs
                </p>
              </div>
              <div className="p-8 bg-gray-50 rounded-[2.5rem]">
                <h3 className="font-black text-cyan-600 mb-4">DISPLAY</h3>
                <p className="text-sm font-bold text-gray-500 hover:text-black cursor-pointer mb-3 uppercase">
                  Dark Ghost Mode
                </p>
                <p className="text-sm font-bold text-gray-500 hover:text-black cursor-pointer uppercase">
                  Ultra HD Playback
                </p>
              </div>
              <div className="p-8 bg-blue-600 rounded-[2.5rem] text-white">
                <Rocket className="mb-4" />
                <h3 className="font-black mb-2">PRO PLAN</h3>
                <p className="text-xs font-bold opacity-80 uppercase">
                  Upgrade for unlimited vibes
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Overlay */}
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}

        {/* Floating Chat Bubble */}
        <motion.button
          onClick={() => setChatOpen(true)}
          whileHover={{ scale: 1.1 }}
          className="fixed bottom-32 right-8 w-16 h-16 bg-black rounded-[2rem] z-[130] flex items-center justify-center shadow-2xl border-2 border-white/20 active:rotate-12 transition-all"
        >
          <MessageCircle className="text-blue-400 fill-blue-400 w-8 h-8" />
        </motion.button>
      </AnimatePresence>

      {/* Trays Implementation */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />
      <ChatTray isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

// --- CSS STYLES FOR ANIMATION ---
// Add this to your Tailwind config or CSS file:
// @keyframes spin-slow {
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// }
// .animate-spin-slow { animation: spin-slow 8s linear infinite; }
