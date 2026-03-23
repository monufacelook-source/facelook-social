import { useState } from "react";
import {
  Settings,
  User,
  Film,
  MessageSquare,
  Heart as HeartIcon,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import GoldenButton from "@/components/layout/GoldenButton";
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import HeartSection from "@/components/feed/HeartSection";
import ProfileSection from "@/components/profile/ProfileSection";
import SettingsPanel from "@/components/settings/SettingsPanel";

export default function Index() {
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#f0f2f5] overflow-hidden flex flex-col relative font-sans">
      {/* --- 1. TOP HEADER (Private Hooks) --- */}
      <header className="h-20 bg-white border-b shadow-sm z-40 flex flex-col justify-center px-4 shrink-0">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-black gradient-text">FACELOOK</h1>
          <div className="flex gap-2">
            <User
              className="w-5 h-5 text-gray-400"
              onClick={() => setProfileOpen(true)}
            />
          </div>
        </div>
        {/* Private Friends Hooks */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 border-2 border-white shadow-sm shrink-0 flex-none"
            />
          ))}
          <span className="text-[10px] text-gray-400 self-center">Hooks</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* --- 2. LEFT SIDE: FLICKS (DVD Style) --- */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            onClick={() => setFlicksOpen(true)}
            className="w-16 h-16 bg-black rounded-full border-4 border-gray-700 flex items-center justify-center cursor-pointer shadow-2xl group"
          >
            <div className="w-6 h-6 bg-gray-400 rounded-full border-2 border-black flex items-center justify-center">
              <Film className="w-3 h-3 text-black" />
            </div>
            <span className="absolute -bottom-6 text-[10px] font-bold text-gray-600 group-hover:text-black">
              FLICKS
            </span>
          </motion.div>
        </div>

        {/* --- 3. MIDDLE: CONTENT (Scrollable) --- */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-[550px] mx-auto py-4 px-2 space-y-4">
            {/* Story Section */}
            <section className="bg-white p-3 rounded-xl shadow-sm overflow-x-auto flex gap-3 no-scrollbar">
              <div
                className="w-24 h-40 bg-gray-200 rounded-xl shrink-0 flex items-end p-2 font-bold text-[10px] text-white bg-cover"
                style={{
                  backgroundImage: "url(https://source.unsplash.com/random/1)",
                }}
              >
                Your Story
              </div>
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className="w-24 h-40 bg-blue-100 rounded-xl shrink-0 border-2 border-blue-400"
                />
              ))}
            </section>

            {/* Viral on Facelook */}
            <div className="bg-orange-500 p-3 rounded-xl text-white shadow-lg flex justify-between items-center">
              <span className="font-bold text-sm">🔥 VIRAL ON FACELOOK</span>
              <span className="text-[10px] bg-white/20 px-2 py-1 rounded">
                Trending #1
              </span>
            </div>

            {/* In My Heart Section */}
            <section className="bg-white rounded-xl shadow-sm overflow-hidden border-t-4 border-pink-500">
              <div className="p-3 bg-pink-50 font-bold text-pink-600 text-sm flex items-center gap-2">
                <HeartIcon className="w-4 h-4" /> IN MY HEART
              </div>
              <HeartSection />
            </section>

            {/* Main Post Feed */}
            <MainFeed />
          </div>
        </main>

        {/* --- 4. RIGHT SIDE: CHATIKS (Tray Toggle) --- */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30">
          <motion.div
            whileTap={{ scale: 0.9 }}
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-xl border-b-4 border-blue-800"
          >
            <MessageSquare className="text-white w-6 h-6" />
            <span className="absolute -bottom-6 text-[10px] font-bold text-blue-600">
              CHATIK
            </span>
          </motion.div>
        </div>
      </div>

      {/* --- 5. TRAYS (Full Screen Overlays) --- */}

      {/* Flicks Overlay (DVD Style Video Scroll) */}
      <AnimatePresence>
        {flicksOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <button
              onClick={() => setFlicksOpen(false)}
              className="absolute top-5 right-5 text-white z-[60]"
            >
              X
            </button>
            <div className="flex-1 overflow-y-scroll snap-y snap-mandatory">
              {/* Yahan aapka Video Scroll code aayega */}
              <div className="h-full w-full snap-start flex items-center justify-center text-white border-b border-white/10">
                <p>Video 1 (Scroll Up/Down)</p>
                <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center">
                  <ThumbsUp className="w-8 h-8" />
                  <Share2 className="w-8 h-8" />
                  <span className="text-2xl">🩴</span> {/* Chappal Hook */}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatiks Tray */}
      <ChatTray isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Settings & Profile Panels */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <AnimatePresence>
        {profileOpen && <ProfileSection onBack={() => setProfileOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
