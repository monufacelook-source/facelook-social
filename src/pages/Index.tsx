import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Zap, Search, Bell, Settings, Heart, MessageCircle, Share2,
  X, Mic, MicOff, Gamepad2, Camera, Plus, Users, Star,
  Layers, User, Send, Loader2, ImageIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import FlicksTray from "@/components/layout/FlicksTray";
import FaceTray from "@/components/layout/FaceTray";
import SettingsPanel from "@/components/settings/SettingsPanel";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const PURPLE = "#1a0b2e";
const PURPLE_MID = "#2d1b4e";
const PURPLE_LIGHT = "#6d28d9";
const ACCENT = "#a855f7";

const CHAPPAL = "🩴";

const DEMO_POSTS = [
  {
    id: "demo1",
    user_id: "demo",
    content: "Zindagi ek game hai, aur mai toh pro player hoon 🎮🔥",
    media_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=900&fit=crop",
    profiles: { full_name: "Arjun Kapoor", username: "arjun.k", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
    likes_count: 14200,
    comments_count: 832,
    hook: "Gaming is life 🎮",
  },
  {
    id: "demo2",
    user_id: "demo",
    content: "Chai peete peete duniya badal di 🍵✨ FACELOOK pe exclusive!",
    media_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=900&fit=crop",
    profiles: { full_name: "Priya Sharma", username: "priya.sh", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop" },
    likes_count: 9800,
    comments_count: 415,
    hook: "Chai lover ☕ | Creator",
  },
  {
    id: "demo3",
    user_id: "demo",
    content: "Mountains call and I must go. Himachal diaries 🏔️",
    media_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop",
    profiles: { full_name: "Rohan Das", username: "rohan.explorer", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop" },
    likes_count: 32100,
    comments_count: 1200,
    hook: "Explorer 🏔️ | Wanderer",
  },
  {
    id: "demo4",
    user_id: "demo",
    content: "Art is not what you see but what you make others see 🎨",
    media_url: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=900&fit=crop",
    profiles: { full_name: "Meera Lux", username: "meera.creates", avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop" },
    likes_count: 7600,
    comments_count: 290,
    hook: "Artist 🎨 | Dreamer",
  },
];

// ─── TIKTOK POST ─────────────────────────────────────────────────────────────

function TikTokPost({ post, height }: { post: any; height: string }) {
  const [liked, setLiked]       = useState(false);
  const [chappal, setCh]        = useState(false);
  const [likeCount, setLC]      = useState(post.likes_count || 0);
  const [chappalCount, setCC]   = useState(Math.floor((post.likes_count || 0) * 0.12));
  const [commentOpen, setCmtOpen] = useState(false);

  const handleLike = () => {
    setLiked((p) => !p);
    setLC((c: number) => liked ? c - 1 : c + 1);
  };
  const handleCh = () => {
    setCh((p) => !p);
    setCC((c: number) => chappal ? c - 1 : c + 1);
  };

  const formatCount = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  const profile = post.profiles || {};
  const avatar = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || "user"}`;

  return (
    <div
      className="relative snap-start shrink-0 overflow-hidden"
      style={{ height }}
    >
      {/* Background */}
      {post.media_url ? (
        <img src={post.media_url} alt="post" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, ${PURPLE_MID} 50%, #4c1d95 100%)` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

      {/* Right-side actions */}
      <div className="absolute right-3 bottom-24 flex flex-col gap-5 items-center z-30">
        {/* Heart */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={handleLike}
          data-testid={`button-like-${post.id}`}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-12 h-12 rounded-full backdrop-blur-xl flex items-center justify-center border transition-colors ${liked ? "bg-rose-500 border-rose-400" : "bg-black/30 border-white/20"}`}>
            <Heart className={`w-6 h-6 ${liked ? "fill-white text-white" : "text-white"}`} />
          </div>
          <span className="text-white text-[11px] font-black drop-shadow">{formatCount(likeCount)}</span>
        </motion.button>

        {/* Chappal */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={handleCh}
          data-testid={`button-chappal-${post.id}`}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-12 h-12 rounded-full backdrop-blur-xl flex items-center justify-center border text-2xl transition-colors ${chappal ? "bg-amber-500 border-amber-400" : "bg-black/30 border-white/20"}`}>
            {CHAPPAL}
          </div>
          <span className="text-white text-[11px] font-black drop-shadow">{formatCount(chappalCount)}</span>
        </motion.button>

        {/* Share */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          data-testid={`button-share-${post.id}`}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[11px] font-black drop-shadow">Share</span>
        </motion.button>

        {/* Comment */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={() => setCmtOpen(true)}
          data-testid={`button-comment-${post.id}`}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-xl border border-white/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[11px] font-black drop-shadow">{formatCount(post.comments_count || 0)}</span>
        </motion.button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 right-20 z-30">
        <div className="flex items-center gap-2 mb-2">
          <img src={avatar} alt={profile.full_name} className="w-9 h-9 rounded-full border-2 border-white object-cover" />
          <div>
            <p className="text-white font-black text-sm leading-none">{profile.full_name || "Facelooker"}</p>
            <p className="text-white/60 text-[10px] font-bold">@{profile.username || "user"}</p>
          </div>
          <button className="ml-1 px-3 py-0.5 rounded-full text-[10px] font-black text-white border border-white/50 backdrop-blur-md">
            Follow
          </button>
        </div>
        <p className="text-white/90 text-sm font-medium leading-snug line-clamp-2 mb-2">{post.content}</p>
        {/* Hooks Status */}
        {post.hook && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider"
            style={{ background: "rgba(168,85,247,0.4)", backdropFilter: "blur(12px)", border: "1px solid rgba(168,85,247,0.5)" }}
          >
            ⚓ Hooks: {post.hook}
          </div>
        )}
      </div>

      {/* Comments sheet */}
      <AnimatePresence>
        {commentOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className="absolute inset-x-0 bottom-0 z-40 rounded-t-3xl p-6"
            style={{ background: PURPLE, backdropFilter: "blur(40px)", border: "1px solid rgba(168,85,247,0.3)", maxHeight: "60%" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-lg">Comments</h3>
              <button onClick={() => setCmtOpen(false)} className="p-2 bg-white/10 rounded-full">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-white/40 text-sm text-center py-8">Comments coming soon 💬</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── CHAT / MIC PANEL ────────────────────────────────────────────────────────

const WALLPAPERS = [
  { label: "Purple Night", bg: `linear-gradient(135deg, ${PURPLE} 0%, #4c1d95 100%)` },
  { label: "Ocean", bg: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
  { label: "Sunset", bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { label: "Forest", bg: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)" },
];

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { user, profile } = useAuth();
  const [message, setMessage]     = useState("");
  const [wallIdx, setWallIdx]     = useState(0);
  const [showWall, setShowWall]   = useState(false);
  const [chatMessages, setChat]   = useState([
    { id: 1, from: "system", text: "Welcome to Vibe Chat! Start chatting 🎉", time: "Now" },
  ]);

  const sendMsg = () => {
    if (!message.trim()) return;
    setChat((p) => [...p, { id: Date.now(), from: "me", text: message.trim(), time: "Now" }]);
    setMessage("");
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="fixed inset-0 z-[300] flex flex-col"
      style={{ background: WALLPAPERS[wallIdx].bg }}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-purple-300" />
          <h2 className="text-white font-black text-lg italic tracking-tight">VIBE ⚡</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWall(!showWall)}
            className="px-3 py-1.5 rounded-full text-[10px] font-black text-white/70 border border-white/20"
          >
            🎨 Wallpaper
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 border border-white/20 rounded-full"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Wallpaper picker */}
      <AnimatePresence>
        {showWall && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden shrink-0"
          >
            <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
              {WALLPAPERS.map((w, i) => (
                <button
                  key={i}
                  onClick={() => { setWallIdx(i); setShowWall(false); }}
                  className="shrink-0 w-20 h-12 rounded-xl overflow-hidden border-2 transition-all"
                  style={{ background: w.bg, borderColor: i === wallIdx ? "#a855f7" : "rgba(255,255,255,0.2)" }}
                >
                  <span className="text-white text-[8px] font-bold">{w.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {chatMessages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[75%] px-4 py-3 rounded-2xl"
              style={{
                background: m.from === "me"
                  ? `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})`
                  : "rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <p className="text-white text-sm font-medium">{m.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="shrink-0 px-4 py-3 flex items-center gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.10)", background: "rgba(0,0,0,0.25)", backdropFilter: "blur(20px)" }}
      >
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          placeholder="Type a vibe..."
          data-testid="input-chat-message"
          className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none font-medium"
        />
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={sendMsg}
          data-testid="button-send-message"
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})` }}
        >
          <Send className="w-4 h-4 text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── SETTINGS MODAL ──────────────────────────────────────────────────────────

function SettingsModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[310]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="absolute inset-x-0 bottom-0 top-12 rounded-t-3xl overflow-hidden"
        style={{ background: PURPLE, border: "1px solid rgba(168,85,247,0.3)" }}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 w-12 bg-white/20 rounded-full mx-auto mt-3" />
        <div className="h-full overflow-y-auto p-6 pt-8 no-scrollbar">
          <SettingsPanel onClose={onClose} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CREATE POST MODAL ────────────────────────────────────────────────────────

function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { user, profile } = useAuth();
  const qc = useQueryClient();
  const [content, setContent]     = useState("");
  const [imageFile, setFile]      = useState<File | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [submitting, setSub]      = useState(false);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!content.trim() && !imageFile) return;
    if (!user) return;
    setSub(true);
    let media_url: string | null = null;
    if (imageFile) {
      const path = `${user.id}/${Date.now()}.${imageFile.name.split(".").pop()}`;
      await supabase.storage.from("posts").upload(path, imageFile, { upsert: false });
      const { data } = supabase.storage.from("posts").getPublicUrl(path);
      media_url = data.publicUrl;
    }
    await supabase.from("posts").insert({ user_id: user.id, content: content.trim(), media_url });
    setSub(false);
    qc.invalidateQueries({ queryKey: ["fl10-posts"] });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="relative z-10 w-full rounded-t-3xl p-6"
        style={{ background: PURPLE, border: "1px solid rgba(168,85,247,0.3)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-black text-xl italic">New Post</h2>
          <button onClick={onClose} className="p-2 bg-white/10 border border-white/20 rounded-full">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's your vibe today?"
          data-testid="input-post-content"
          rows={3}
          className="w-full bg-white/8 border border-white/15 rounded-2xl p-4 text-white placeholder:text-white/40 resize-none outline-none text-sm font-medium mb-3"
        />
        {preview && (
          <div className="relative rounded-2xl overflow-hidden mb-3">
            <img src={preview} alt="preview" className="w-full h-40 object-cover" />
            <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm font-bold"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <ImageIcon className="w-4 h-4" /> Photo
          </button>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={submit}
            disabled={submitting || (!content.trim() && !imageFile)}
            data-testid="button-submit-post"
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-white disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})` }}
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            POST
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── GROUPS MODAL ────────────────────────────────────────────────────────────

function GroupsModal({ onClose }: { onClose: () => void }) {
  const SAMPLE = [
    { id: 1, name: "Gamer Zone 🎮", members: 2400, type: "Public" },
    { id: 2, name: "Artists Hub 🎨", members: 890, type: "Private" },
    { id: 3, name: "Foodie Gang 🍕", members: 4100, type: "Public" },
    { id: 4, name: "Tech Talks 💻", members: 3200, type: "Private" },
  ];
  return (
    <motion.div
      className="fixed inset-0 z-[300]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="absolute inset-x-0 bottom-0 top-16 rounded-t-3xl overflow-hidden"
        style={{ background: PURPLE, border: "1px solid rgba(168,85,247,0.3)" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-white font-black text-xl italic">Groups</h2>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto h-full pb-20 no-scrollbar">
          <button
            className="w-full py-3 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 mb-2"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})` }}
          >
            <Plus className="w-4 h-4" /> Create New Group
          </button>
          {SAMPLE.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <div>
                <p className="text-white font-bold text-sm">{g.name}</p>
                <p className="text-white/40 text-[10px]">{g.members.toLocaleString()} members · {g.type}</p>
              </div>
              <button
                className="px-3 py-1.5 rounded-xl text-[10px] font-black text-white"
                style={{ background: g.type === "Public" ? `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})` : "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                {g.type === "Public" ? "Join" : "Request"}
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── M-HEART MODAL ───────────────────────────────────────────────────────────

function MHeartModal({ onClose }: { onClose: () => void }) {
  const MATCHES = [
    { id: 1, name: "Ananya Singh", age: 24, city: "Delhi", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop", compat: 94 },
    { id: 2, name: "Kavya Reddy", age: 26, city: "Hyderabad", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop", compat: 88 },
    { id: 3, name: "Riya Kapoor", age: 23, city: "Mumbai", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop", compat: 76 },
  ];
  return (
    <motion.div
      className="fixed inset-0 z-[300]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 35 }}
        className="absolute inset-x-0 bottom-0 top-12 rounded-t-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0b2e 0%, #2d0e3a 100%)", border: "1px solid rgba(236,72,153,0.3)" }}
      >
        <div className="flex items-center justify-between p-5 border-b border-pink-500/20">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
            <h2 className="text-white font-black text-xl italic">M-Heart</h2>
            <span className="text-[9px] font-black bg-pink-500/20 text-pink-300 px-2 py-1 rounded-full uppercase tracking-wider">Matrimony</span>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 gap-3 overflow-y-auto pb-20 no-scrollbar">
          {MATCHES.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)" }}
            >
              <img src={m.img} alt={m.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-400/30" />
              <div className="flex-1">
                <p className="text-white font-bold">{m.name}, {m.age}</p>
                <p className="text-white/50 text-[10px]">📍 {m.city}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-500" style={{ width: `${m.compat}%` }} />
                  </div>
                  <span className="text-pink-300 text-[10px] font-black">{m.compat}%</span>
                </div>
              </div>
              <button
                className="p-3 rounded-2xl"
                style={{ background: "linear-gradient(135deg, #ec4899, #a855f7)" }}
              >
                <Heart className="w-4 h-4 text-white fill-white" />
              </button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

interface NavBtnProps {
  icon: any; label: string; special?: boolean; onClick?: () => void; testId?: string;
}
function NavBtn({ icon: Icon, label, special, onClick, testId }: NavBtnProps) {
  return (
    <motion.button
      data-testid={testId}
      onClick={onClick}
      whileTap={{ scale: 0.87 }}
      className="flex flex-col items-center gap-1.5 shrink-0"
    >
      <div
        className={`flex items-center justify-center rounded-2xl transition-all shadow-lg ${special ? "w-16 h-16 -mt-6 shadow-purple-500/40" : "w-12 h-12"}`}
        style={{
          background: special
            ? `linear-gradient(135deg, ${ACCENT} 0%, ${PURPLE_LIGHT} 100%)`
            : "rgba(255,255,255,0.08)",
          border: special
            ? "3px solid rgba(255,255,255,0.25)"
            : "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {typeof Icon === "string"
          ? <span className="text-xl">{Icon}</span>
          : <Icon className={`${special ? "w-7 h-7" : "w-5 h-5"} text-white`} />
        }
      </div>
      <span className="text-[8px] font-black uppercase tracking-widest text-white/50">{label}</span>
    </motion.button>
  );
}

// ─── MAIN INDEX ───────────────────────────────────────────────────────────────

export default function Index() {
  const { profile, user } = useAuth();

  const [flicksOpen,    setFlicksOpen]    = useState(false);
  const [faceOpen,      setFaceOpen]      = useState(false);
  const [chatOpen,      setChatOpen]      = useState(false);
  const [settingsOpen,  setSettingsOpen]  = useState(false);
  const [createOpen,    setCreateOpen]    = useState(false);
  const [groupsOpen,    setGroupsOpen]    = useState(false);
  const [mheartOpen,    setMHeartOpen]    = useState(false);
  const [searchFocus,   setSearchFocus]   = useState(false);

  // Fetch real posts
  const { data: dbPosts } = useQuery<any[]>({
    queryKey: ["fl10-posts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles(*)")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 30000,
  });

  const posts = useMemo(() => {
    if (!dbPosts || dbPosts.length === 0) return DEMO_POSTS;
    return dbPosts.map((p: any) => ({
      ...p,
      hook: p.profiles?.hook || p.hook || "Facelook Viber ⚡",
    }));
  }, [dbPosts]);

  const FEED_HEIGHT = "calc(100vh - 56px - 80px)";

  const openFlicks = useCallback(() => { setFlicksOpen(true); }, []);
  const openFace   = useCallback(() => { setFaceOpen(true); }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col font-sans" style={{ background: "#ffffff" }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <header
        className="h-14 shrink-0 flex items-center gap-3 px-4 z-[60]"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `1px solid rgba(45,27,78,0.10)`,
          boxShadow: "0 1px 12px rgba(45,27,78,0.06)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: PURPLE }}
          >
            <Zap className="w-4 h-4 fill-purple-400 text-purple-400" />
          </div>
          <h1 className="text-lg font-black italic tracking-tight" style={{ color: PURPLE }}>
            FACELOOK <span className="text-[9px] font-black text-purple-400 not-italic align-middle">10.07</span>
          </h1>
        </div>

        {/* Search */}
        <div
          className="flex-1 flex items-center gap-2 rounded-full px-3 py-2"
          style={{
            background: searchFocus ? "rgba(168,85,247,0.06)" : "rgba(45,27,78,0.05)",
            border: searchFocus ? "1.5px solid rgba(168,85,247,0.5)" : "1.5px solid rgba(45,27,78,0.08)",
            boxShadow: searchFocus ? "0 0 16px rgba(168,85,247,0.15)" : "none",
          }}
        >
          <Search className="w-4 h-4 text-purple-400 shrink-0" />
          <input
            data-testid="input-search"
            type="text"
            placeholder="Search Facelook..."
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className="flex-1 bg-transparent outline-none text-sm font-medium placeholder:text-purple-300"
            style={{ color: PURPLE }}
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            data-testid="button-notifications"
            className="relative p-2 rounded-full"
            style={{ background: "rgba(45,27,78,0.06)", border: "1px solid rgba(45,27,78,0.08)" }}
          >
            <Bell className="w-4 h-4" style={{ color: PURPLE }} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full" />
          </button>
          <button
            data-testid="button-settings"
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-full"
            style={{ background: "rgba(45,27,78,0.06)", border: "1px solid rgba(45,27,78,0.08)" }}
          >
            <Settings className="w-4 h-4" style={{ color: PURPLE }} />
          </button>
        </div>
      </header>

      {/* ── TIKTOK FEED ────────────────────────────────── */}
      <main
        className="relative flex-none overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        style={{ height: FEED_HEIGHT }}
      >
        {/* LEFT WALL — FLICKS */}
        <button
          data-testid="button-open-flicks"
          onClick={openFlicks}
          className="fixed left-0 z-50 flex flex-col items-center justify-center cursor-pointer rounded-r-2xl"
          style={{
            top: "calc(56px + 30vh)",
            width: "32px",
            height: "140px",
            background: PURPLE,
            boxShadow: "4px 0 20px rgba(45,27,78,0.3)",
          }}
        >
          <Layers className="w-4 h-4 text-purple-300 mb-1" />
          <span
            className="text-[7px] font-black tracking-[3px] text-purple-200 uppercase"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            FLICKS
          </span>
        </button>

        {/* RIGHT WALL — FACE */}
        <button
          data-testid="button-open-face"
          onClick={openFace}
          className="fixed right-0 z-50 flex flex-col items-center justify-center cursor-pointer rounded-l-2xl"
          style={{
            top: "calc(56px + 30vh)",
            width: "32px",
            height: "140px",
            background: PURPLE_MID,
            boxShadow: "-4px 0 20px rgba(45,27,78,0.3)",
          }}
        >
          <User className="w-4 h-4 text-purple-300 mb-1" />
          <span
            className="text-[7px] font-black tracking-[3px] text-purple-200 uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
            FACE
          </span>
        </button>

        {posts.map((p: any) => (
          <TikTokPost key={p.id} post={p} height={FEED_HEIGHT} />
        ))}
      </main>

      {/* ── BOTTOM NAV ─────────────────────────────────── */}
      <nav
        className="h-20 shrink-0 flex items-center z-[60]"
        style={{
          background: PURPLE,
          borderTop: "1px solid rgba(168,85,247,0.2)",
          boxShadow: "0 -4px 24px rgba(26,11,46,0.4)",
        }}
      >
        <div className="flex items-center gap-5 px-4 overflow-x-auto no-scrollbar w-full justify-around">
          <NavBtn icon={Gamepad2}  label="Tasks"   onClick={() => {}}        testId="button-tasks" />
          <NavBtn icon={Heart}     label="M-Heart" onClick={() => setMHeartOpen(true)} testId="button-mheart" />
          <NavBtn icon={Plus}      label="POST"    onClick={() => setCreateOpen(true)} special testId="button-post" />
          <NavBtn icon={Users}     label="Groups"  onClick={() => setGroupsOpen(true)} testId="button-groups" />
          <NavBtn icon={Camera}    label="Snapy"   onClick={() => {}}        testId="button-snapy" />
          <NavBtn icon={Star}      label="Fun"     onClick={() => {}}        testId="button-fun" />
        </div>
      </nav>

      {/* ── FLOATING MIC ───────────────────────────────── */}
      <motion.button
        data-testid="button-open-chat"
        onClick={() => setChatOpen(true)}
        whileTap={{ scale: 0.85 }}
        className="fixed bottom-24 right-3 z-[70] w-12 h-12 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})`,
          border: "2px solid rgba(255,255,255,0.25)",
          boxShadow: "0 8px 32px rgba(168,85,247,0.5)",
        }}
      >
        <Mic className="w-5 h-5 text-white" />
      </motion.button>

      {/* ── OVERLAYS ───────────────────────────────────── */}
      <FlicksTray isOpen={flicksOpen} onClose={() => setFlicksOpen(false)} />
      <FaceTray   isOpen={faceOpen}   onClose={() => setFaceOpen(false)} />

      <AnimatePresence>
        {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
        {chatOpen     && <ChatPanel    onClose={() => setChatOpen(false)} />}
        {createOpen   && <CreatePostModal onClose={() => setCreateOpen(false)} />}
        {groupsOpen   && <GroupsModal  onClose={() => setGroupsOpen(false)} />}
        {mheartOpen   && <MHeartModal  onClose={() => setMHeartOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
