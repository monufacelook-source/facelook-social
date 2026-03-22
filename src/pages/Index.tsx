import { useState } from "react";
import { Settings, User, Film, MessageSquare, Heart as HeartIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GoldenButton from "@/components/layout/GoldenButton";
import BottomNav from "@/components/layout/BottomNav";
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import HeartSection from "@/components/feed/HeartSection";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";

type View = "feed" | "heart";

export default function Index() {
  const [activeTab, setActiveTab] = useState("search");
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [view, setView] = useState<View>("feed");

  return (
    <div className="h-screen w-screen bg-background overflow-hidden flex flex-col">
      {/* Top Bar */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 glass-strong"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className="flex items-center justify-between px-16 py-3 max-w-lg mx-auto">
          {/* Tray Buttons */}
          <div className="flex gap-2">
            <motion.button
              onClick={() => setFlicksOpen(true)}
              className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium"
              whileTap={{ scale: 0.92 }}
            >
              <Film className="w-3.5 h-3.5 text-primary" /> Flicks
            </motion.button>
          </div>

          <h1 className="font-display text-lg font-bold gradient-text">Facelook</h1>

          <div className="flex gap-2">
            <motion.button
              onClick={() => setView(view === "heart" ? "feed" : "heart")}
              className={`glass px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium ${view === "heart" ? "bg-secondary/20" : ""}`}
              whileTap={{ scale: 0.92 }}
            >
              <HeartIcon className="w-3.5 h-3.5 text-red-400" />
            </motion.button>
            <motion.button
              onClick={() => setChatOpen(true)}
              className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium"
              whileTap={{ scale: 0.92 }}
            >
              <MessageSquare className="w-3.5 h-3.5 text-primary" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Golden Buttons */}
      <GoldenButton position="left" onClick={() => setSettingsOpen(true)}>
        <Settings className="w-5 h-5" />
      </GoldenButton>
      <GoldenButton position="right" onClick={() => setProfileOpen(true)}>
        <User className="w-5 h-5" />
      </GoldenButton>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {view === "feed" ? (
          <motion.div key="feed" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MainFeed />
          </motion.div>
        ) : (
          <motion.div key="heart" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HeartSection />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Trays & Panels */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />
      <ChatTray isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Profile */}
      <AnimatePresence>
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
