import { motion, AnimatePresence } from "framer-motion";
import {
  X, ArrowLeft, Camera, Edit3, LogOut, Grid, Clock, Loader2,
  Users, Heart, ImageIcon, Anchor, ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const PURPLE = "#1a0b2e";
const PURPLE_MID = "#2d1b4e";
const ACCENT = "#a855f7";
const PURPLE_LIGHT = "#6d28d9";

interface FaceTrayProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
}

// ─── STAT COUNTER ─────────────────────────────────────────────────────────────

function StatBox({ label, value, accent, onClick }: { label: string; value: number | string; accent?: boolean; onClick?: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 flex-1 py-3 rounded-2xl transition-all"
      style={{
        background: accent ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.06)",
        border: accent ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <span className={`text-xl font-black ${accent ? "text-purple-300" : "text-white"}`}>{value}</span>
      <span className={`text-[8px] font-black uppercase tracking-widest ${accent ? "text-purple-400/70" : "text-white/35"}`}>{label}</span>
      {onClick && <ChevronRight className="w-2.5 h-2.5 text-white/20 mt-0.5" />}
    </motion.button>
  );
}

// ─── FRIEND LIST MODAL ────────────────────────────────────────────────────────

function FriendListModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("friendships")
        .select("*, requester:requester_id(id,full_name,username,avatar_url), addressee:addressee_id(id,full_name,username,avatar_url)")
        .eq("status", "accepted")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .limit(30);
      if (data) {
        setFriends(data.map((f: any) => f.requester_id === userId ? f.addressee : f.requester));
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  return (
    <motion.div
      className="absolute inset-0 z-10"
      style={{ background: PURPLE }}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
    >
      <div className="flex items-center gap-3 p-5 border-b border-white/10">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <h2 className="text-white font-black text-lg">Friends</h2>
      </div>
      <div className="overflow-y-auto p-4 space-y-2 no-scrollbar" style={{ height: "calc(100% - 73px)" }}>
        {loading && <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-purple-400 w-7 h-7" /></div>}
        {!loading && friends.length === 0 && (
          <div className="text-center pt-16">
            <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm font-bold">No friends yet</p>
          </div>
        )}
        {friends.map((f: any) => (
          <div key={f?.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <img
              src={f?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f?.username}`}
              className="w-10 h-10 rounded-full object-cover border border-purple-400/30"
              alt={f?.full_name}
            />
            <div>
              <p className="text-white font-bold text-sm">{f?.full_name || "Facelooker"}</p>
              <p className="text-white/40 text-[10px]">@{f?.username || "user"}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── HOOKS LIST MODAL ─────────────────────────────────────────────────────────

function HooksModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [hooks, setHooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("friendships")
        .select("*, requester:requester_id(id,full_name,username,avatar_url), addressee:addressee_id(id,full_name,username,avatar_url)")
        .eq("status", "hooked")
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
        .limit(20);
      if (data) setHooks(data.map((h: any) => h.requester_id === userId ? h.addressee : h.requester));
      setLoading(false);
    };
    load();
  }, [userId]);
  return (
    <motion.div
      className="absolute inset-0 z-10"
      style={{ background: PURPLE }}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
    >
      <div className="flex items-center gap-3 p-5 border-b border-white/10">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><ArrowLeft className="w-4 h-4 text-white" /></button>
        <Anchor className="w-5 h-5 text-purple-400" />
        <h2 className="text-white font-black text-lg">My Hooks</h2>
      </div>
      <div className="overflow-y-auto p-4 space-y-2 no-scrollbar" style={{ height: "calc(100% - 73px)" }}>
        {loading && <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-purple-400 w-7 h-7" /></div>}
        {!loading && hooks.length === 0 && <p className="text-center text-white/40 text-sm pt-16">No hooks yet ⚓</p>}
        {hooks.map((h: any) => (
          <div key={h?.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
            <img src={h?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${h?.username}`} className="w-10 h-10 rounded-full object-cover border border-purple-400/40" alt={h?.full_name} />
            <div><p className="text-white font-bold text-sm">{h?.full_name || "Facelooker"}</p><p className="text-purple-400 text-[10px]">Hooked ⚓</p></div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── M-HEART LIST MODAL ───────────────────────────────────────────────────────

function MHeartListModal({ onClose }: { onClose: () => void }) {
  const MATCHES = [
    { id: "m1", full_name: "Ananya Singh", username: "ananya.s", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", compat: 94 },
    { id: "m2", full_name: "Kavya Reddy",  username: "kavya.r",  avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", compat: 88 },
  ];
  return (
    <motion.div className="absolute inset-0 z-10" style={{ background: PURPLE }}
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
    >
      <div className="flex items-center gap-3 p-5 border-b border-white/10">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><ArrowLeft className="w-4 h-4 text-white" /></button>
        <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
        <h2 className="text-white font-black text-lg">M-Heart Friends</h2>
      </div>
      <div className="overflow-y-auto p-4 space-y-2 no-scrollbar" style={{ height: "calc(100% - 73px)" }}>
        {MATCHES.map((m) => (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)" }}>
            <img src={m.avatar_url} className="w-10 h-10 rounded-full object-cover border border-pink-400/40" alt={m.full_name} />
            <div className="flex-1"><p className="text-white font-bold text-sm">{m.full_name}</p><p className="text-white/40 text-[10px]">@{m.username}</p></div>
            <span className="text-pink-300 text-[10px] font-black">{m.compat}% Match</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── FACE TRAY ────────────────────────────────────────────────────────────────

export default function FaceTray({ isOpen, onClose, targetUserId }: FaceTrayProps) {
  const { user: currentUser, signOut } = useAuth();
  const [profile, setProfile]   = useState<any>(null);
  const [posts, setPosts]       = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [editData, setEditData] = useState({ full_name: "", bio: "" });
  const [stats, setStats]       = useState({ friends: 0, hooks: 0, likes: 0 });
  const [watchHours]            = useState(Math.floor(Math.random() * 80) + 12);
  const [watchMins]             = useState(Math.floor(Math.random() * 59) + 1);

  // Sub-modal states
  const [subModal, setSubModal] = useState<"friends" | "hooks" | "mheart" | null>(null);

  const profileId = targetUserId || currentUser?.id;
  const isOwn = currentUser?.id === profileId;

  useEffect(() => {
    if (!isOpen || !profileId) return;
    const load = async () => {
      setLoading(true);
      const [pRes, poRes, fRes, hRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", profileId).single(),
        supabase.from("posts").select("*").eq("user_id", profileId).order("created_at", { ascending: false }),
        supabase.from("friendships").select("*", { count: "exact", head: true }).eq("status", "accepted").or(`requester_id.eq.${profileId},addressee_id.eq.${profileId}`),
        supabase.from("friendships").select("*", { count: "exact", head: true }).eq("status", "hooked").or(`requester_id.eq.${profileId},addressee_id.eq.${profileId}`),
      ]);
      setProfile(pRes.data);
      setEditData({ full_name: pRes.data?.full_name || "", bio: pRes.data?.bio || "" });
      setPosts(poRes.data || []);
      setStats({
        friends: fRes.count || 0,
        hooks:   hRes.count || 0,
        likes:   (poRes.data || []).reduce((acc: number, p: any) => acc + (p.likes_count || 0), 0),
      });
      setLoading(false);
    };
    load();
  }, [isOpen, profileId]);

  const saveProfile = async () => {
    if (!profileId) return;
    setUploading(true);
    await supabase.from("profiles").update(editData).eq("id", profileId);
    setProfile((p: any) => ({ ...p, ...editData }));
    setUploading(false);
    setEditOpen(false);
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;
    setUploading(true);
    const path = `${profileId}/${Date.now()}.${file.name.split(".").pop()}`;
    await supabase.storage.from("avatars").upload(path, file);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profileId);
    setProfile((p: any) => ({ ...p, avatar_url: data.publicUrl }));
    setUploading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex-1" onClick={onClose} />
          <motion.div
            className="w-full max-w-sm h-full overflow-hidden flex flex-col relative"
            style={{ background: PURPLE, borderLeft: "1px solid rgba(168,85,247,0.25)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 34 }}
          >
            {/* Header bar */}
            <div
              className="h-14 flex items-center justify-between px-5 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <button onClick={onClose} className="p-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}>
                <X className="w-4 h-4 text-white" />
              </button>
              <h2 className="text-white font-black text-sm uppercase tracking-widest italic">Face Hub</h2>
              {isOwn && (
                <button
                  onClick={() => setLogoutConfirm(true)}
                  className="p-2 rounded-full"
                  style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
                {/* Cover & Avatar */}
                <div
                  className="h-32 relative shrink-0"
                  style={{ background: `linear-gradient(135deg, ${PURPLE_MID} 0%, #4c1d95 100%)` }}
                >
                  <div
                    className="absolute -bottom-10 left-5 w-20 h-20 rounded-[1.5rem] overflow-hidden ring-4"
                    style={{ ringColor: PURPLE, background: PURPLE_MID }}
                  >
                    <img
                      src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username}`}
                      className="w-full h-full object-cover"
                      alt="avatar"
                    />
                    {isOwn && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Camera className="w-5 h-5 text-white" />}
                        <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
                      </label>
                    )}
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => setEditOpen(true)}
                      data-testid="button-edit-profile"
                      className="absolute bottom-3 right-4 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})` }}
                    >
                      <Edit3 className="w-3 h-3" /> EDIT VIBE
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="mt-12 px-5">
                  <h1 className="text-white font-black text-2xl tracking-tight">{profile?.full_name || "Facelooker"}</h1>
                  <p className="text-purple-400 font-bold text-xs uppercase tracking-widest">@{profile?.username || "user"}</p>
                  <p className="text-white/60 text-sm mt-2 leading-relaxed">{profile?.bio || "Living the Facelook life ⚡"}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-2 px-5 mt-5">
                  <StatBox label="Posts" value={posts.length} />
                  <StatBox label="Friends" value={stats.friends} onClick={() => setSubModal("friends")} />
                  <StatBox label="Hooks" value={stats.hooks} accent onClick={() => setSubModal("hooks")} />
                  <StatBox label="M-Heart" value="💕" onClick={() => setSubModal("mheart")} />
                  <StatBox label="Likes" value={stats.likes >= 1000 ? `${(stats.likes / 1000).toFixed(1)}K` : stats.likes} />
                </div>

                {/* FACELOOK TIME */}
                <div
                  className="mx-5 mt-4 p-4 rounded-2xl flex items-center gap-3"
                  style={{ background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.20)" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})` }}>
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[8px] font-black uppercase tracking-widest">Facelook Time</p>
                    <p className="text-purple-300 font-black text-lg">{watchHours}h {watchMins}m</p>
                    <p className="text-white/30 text-[9px]">Total watch time this month</p>
                  </div>
                </div>

                {/* Gallery */}
                <div className="px-5 mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Grid className="w-4 h-4 text-purple-400" />
                    <h3 className="text-white font-black text-sm uppercase tracking-widest">Gallery</h3>
                  </div>
                  {posts.length === 0 ? (
                    <div
                      className="py-12 rounded-2xl text-center"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(255,255,255,0.10)" }}
                    >
                      <ImageIcon className="w-8 h-8 mx-auto text-white/20 mb-2" />
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest">No posts yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5">
                      {posts.map((p: any) => (
                        <div
                          key={p.id}
                          className="aspect-square rounded-xl overflow-hidden relative"
                          style={{ background: PURPLE_MID }}
                        >
                          {(p.media_url || p.image_url) ? (
                            <img
                              src={p.media_url || p.image_url}
                              alt="post"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center p-2"
                              style={{ background: `linear-gradient(135deg, ${PURPLE_MID}, #4c1d95)` }}
                            >
                              <p className="text-white/60 text-[8px] font-bold text-center line-clamp-3">{p.content}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
              {editOpen && (
                <motion.div
                  className="absolute inset-0 z-20 flex flex-col"
                  style={{ background: PURPLE_MID }}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 35 }}
                >
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h2 className="text-white font-black text-lg">Customize Vibe</h2>
                    <button onClick={() => setEditOpen(false)} className="p-2 bg-white/08 rounded-full">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
                    <input
                      value={editData.full_name}
                      onChange={(e) => setEditData((d) => ({ ...d, full_name: e.target.value }))}
                      placeholder="Full Name"
                      data-testid="input-full-name"
                      className="w-full p-4 rounded-2xl outline-none text-white text-sm font-bold"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                    />
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData((d) => ({ ...d, bio: e.target.value }))}
                      placeholder="Bio"
                      rows={4}
                      data-testid="input-bio"
                      className="w-full p-4 rounded-2xl outline-none text-white text-sm font-bold resize-none"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                    />
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={saveProfile}
                      data-testid="button-save-profile"
                      className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})` }}
                    >
                      {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "SAVE CHANGES"}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sub-modals */}
            <AnimatePresence>
              {subModal === "friends" && profileId && <FriendListModal userId={profileId} onClose={() => setSubModal(null)} />}
              {subModal === "hooks"   && profileId && <HooksModal      userId={profileId} onClose={() => setSubModal(null)} />}
              {subModal === "mheart" && <MHeartListModal onClose={() => setSubModal(null)} />}
            </AnimatePresence>

            {/* Logout confirm */}
            <AnimatePresence>
              {logoutConfirm && (
                <motion.div
                  className="absolute inset-0 z-30 flex items-center justify-center p-6"
                  style={{ background: "rgba(26,11,46,0.92)", backdropFilter: "blur(16px)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0.88 }}
                    animate={{ scale: 1 }}
                    className="w-full max-w-xs p-8 rounded-3xl text-center"
                    style={{ background: PURPLE_MID, border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    <LogOut className="w-10 h-10 text-red-400 mx-auto mb-4" />
                    <h3 className="text-white font-black text-xl mb-2">Logout?</h3>
                    <p className="text-white/40 text-sm mb-6">See you again soon!</p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => { signOut(); onClose(); }}
                        data-testid="button-confirm-logout"
                        className="w-full py-3.5 rounded-2xl font-black text-white bg-red-500"
                      >
                        LOGOUT
                      </button>
                      <button
                        onClick={() => setLogoutConfirm(false)}
                        className="w-full py-3.5 rounded-2xl font-black text-white/70"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        CANCEL
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
