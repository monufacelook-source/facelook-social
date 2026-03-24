import { useState } from "react";
import { Zap, Search, Settings, User, Film, MessageCircle, Bell } from "lucide-react";

// SARE IMPORTS RAHNE DO, LEKIN RENDER NAHI KARENGE
import FlicksTray from "@/components/layout/FlicksTray";
import ChatTray from "@/components/layout/ChatTray";
import MainFeed from "@/components/feed/MainFeed";
import ProfileSection from "@/components/profile/ProfileSection";

export default function Index() {
  const [flicksOpen, setFlicksOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-[#0f0c29] flex flex-col relative text-white">
      {/* HEADER */}
      <header className="h-16 bg-white/5 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
          <h1 className="text-xl font-black italic">FACELOOK</h1>
        </div>
      </header>

      {/* MAIN TEST AREA */}
      <main className="flex-1 flex flex-col items-center justify-center p-10">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">DEBUG MODE ON 🛠️</h2>
        <p className="text-gray-400 text-center">
          Bhai, maine saare heavy components (Feed, Chat, Profile) band kar diye hain.<br/>
          Agar ye screen dikh rahi hai, toh niche wale buttons ek-ek karke dabao test karne ke liye.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <button onClick={() => setChatOpen(!chatOpen)} className="p-4 bg-white/10 rounded-2xl border border-white/20">
            Test Chat {chatOpen ? "✅" : "❌"}
          </button>
          <button onClick={() => setFlicksOpen(!flicksOpen)} className="p-4 bg-white/10 rounded-2xl border border-white/20">
            Test Flicks {flicksOpen ? "✅" : "❌"}
          </button>
        </div>
      </main>

      {/* SIRF TABHI RENDER HONGE JAB BUTTON DABAYEGA */}
      {chatOpen && (
        <div className="fixed inset-0 z-[200] bg-black">
          <button onClick={() => setChatOpen(false)} className="absolute top-5 right-5 z-[210] bg-white text-black p-2 rounded-full">CLOSE</button>
          <ChatTray isOpen={true} onClose={() => setChatOpen(false)} />
        </div>
      )}

      {flicksOpen && <FlicksTray isOpen={true} onClose={() => setFlicksOpen(false)} />}
    </div>
  );
}