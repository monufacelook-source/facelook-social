import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor,
  ArrowLeft,
  Heart,
  MessageCircle,
  Camera,
  Loader2,
  X,
  Edit3,
  Eye,
  LogOut,
  Trash2,
  MapPin,
  GraduationCap,
  Phone,
  Grid,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cn, isHookPartner } from "@/lib/utils";

interface ProfileSectionProps {
  onBack: () => void;
  targetUserId?: string;
}

export default function ProfileSection({
  onBack,
  targetUserId,
}: ProfileSectionProps) {
  const { user: currentUser, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [relation, setRelation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Gallery Viewer State
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const [editData, setEditData] = useState({
    full_name: "",
    bio: "",
    mobile_number: "",
    current_location: "",
    past_location: "",
    school_name: "",
  });

  const profileId = targetUserId || currentUser?.id;
  const isOwnProfile = currentUser?.id === profileId;

  const fetchProfileData = async () => {
    if (!profileId) return;
    try {
      const [pRes, poRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", profileId).single(),
        supabase
          .from("posts")
          .select("*")
          .eq("user_id", profileId)
          .order("created_at", { ascending: false }),
      ]);

      const data = pRes.data;
      setProfile(data);
      setEditData({
        full_name: data?.full_name || "",
        bio: data?.bio || "",
        mobile_number: data?.mobile_number || "",
        current_location: data?.current_location || "",
        past_location: data?.past_location || "",
        school_name: data?.school_name || "",
      });
      setPosts(poRes.data || []);

      if (currentUser && !isOwnProfile) {
        const { data: relData } = await supabase
          .from("friendships")
          .select("*")
          .or(
            `and(requester_id.eq.${currentUser.id},addressee_id.eq.${profileId}),and(requester_id.eq.${profileId},addressee_id.eq.${currentUser.id})`,
          )
          .single();
        setRelation(relData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [profileId, currentUser]);

  const handleUpdateProfile = async () => {
    setUploading(true);
    const { error } = await supabase
      .from("profiles")
      .update(editData)
      .eq("id", profileId);
    if (!error) {
      setProfile({ ...profile, ...editData });
      setIsEditModalOpen(false);
    }
    setUploading(false);
  };

  const handleUploadDP = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files?.[0]) return;
      const file = e.target.files[0];
      const path = `${profileId}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profileId);
      setProfile({ ...profile, avatar_url: publicUrl });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Viewer Navigation
  const nextImage = () => {
    if (viewerIndex !== null) {
      setViewerIndex((viewerIndex + 1) % posts.length);
    }
  };

  const prevImage = () => {
    if (viewerIndex !== null) {
      setViewerIndex((viewerIndex - 1 + posts.length) % posts.length);
    }
  };

  if (loading || !profile)
    return (
      <div className="fixed inset-0 bg-[#0f021a] z-[70] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
        <p className="font-bold text-sm tracking-widest text-purple-300/50 uppercase">
          Facelook
        </p>
      </div>
    );

  const isHook = isHookPartner(relation);

  return (
    <div className="fixed inset-0 z-50 bg-[#0f021a] overflow-y-auto pb-24 font-sans text-white">
      {/* PURPLE GRADIENT BACKGROUND BLOBS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-600/10 blur-[120px] rounded-full" />
      </div>

      {/* HEADER */}
      <div className="sticky top-0 z-50 flex justify-between items-center px-4 py-4 bg-[#0f021a]/60 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="font-black tracking-tighter text-sm uppercase text-purple-300/60">
          {isOwnProfile ? "My Space" : "Member Vibe"}
        </span>
        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-3 text-rose-400 bg-rose-500/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
            >
              <LogOut size={20} />
            </button>
          )}
          <button
            onClick={onBack}
            className="p-3 bg-white text-black rounded-2xl"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 relative z-10">
        <div className="h-40 w-full bg-gradient-to-br from-purple-600/40 via-fuchsia-500/20 to-transparent rounded-[3rem] mb-[-5rem] border border-white/5 shadow-2xl" />

        <div className="flex items-end justify-between px-2">
          <div className="relative group">
            <div
              className={cn(
                "w-36 h-36 rounded-[2.8rem] overflow-hidden ring-8 ring-[#0f021a] shadow-2xl transition-all",
                isHook && "ring-purple-500 shadow-purple-500/20",
              )}
            >
              <img
                src={
                  profile.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`
                }
                className="w-full h-full object-cover"
                alt="profile"
              />
            </div>
            {isOwnProfile && (
              <label className="absolute bottom-1 right-1 bg-white text-black p-3 rounded-2xl cursor-pointer shadow-xl border-4 border-[#0f021a] active:scale-90 transition-transform">
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Camera size={18} />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleUploadDP}
                />
              </label>
            )}
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="mb-2 px-6 py-3 bg-purple-500 text-white rounded-2xl font-black text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
            >
              <Edit3 size={16} /> EDIT VIBE
            </button>
          )}
        </div>

        {/* PROFILE INFO */}
        <div className="mt-8 space-y-1 px-2">
          <h1 className="text-4xl font-black flex items-center gap-2 tracking-tighter">
            {profile.full_name}
            {isHook && (
              <Anchor className="text-purple-400 animate-pulse" size={24} />
            )}
          </h1>
          <p className="text-purple-400 font-black text-sm uppercase tracking-widest opacity-80">
            @{profile.username || "user"}
          </p>

          <div className="flex flex-wrap gap-2 mt-5">
            {profile.current_location && (
              <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <MapPin size={12} className="text-purple-400" />{" "}
                {profile.current_location}
              </span>
            )}
            {profile.school_name && (
              <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <GraduationCap size={12} className="text-purple-400" />{" "}
                {profile.school_name}
              </span>
            )}
          </div>

          <p className="pt-4 text-lg leading-relaxed font-medium text-purple-100/70 max-w-sm">
            {profile.bio || "Adding some magic to the world... ✨"}
          </p>
        </div>

        {/* STATS SECTION */}
        <div className="grid grid-cols-3 gap-3 mt-10 px-2">
          <div className="bg-white/5 p-5 rounded-[2.2rem] text-center border border-white/5 backdrop-blur-sm">
            <p className="text-2xl font-black">{posts.length}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/40">
              Posts
            </p>
          </div>
          <div className="bg-white/5 p-5 rounded-[2.2rem] text-center border border-white/5 backdrop-blur-sm">
            <p className="text-2xl font-black">{profile.friends_count || 0}</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-300/40">
              Friends
            </p>
          </div>
          <div className="bg-purple-500/10 p-5 rounded-[2.2rem] text-center border border-purple-500/20 backdrop-blur-sm">
            <p className="text-2xl font-black text-purple-400">
              {profile.hook_count || 0}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400/60">
              Hooks
            </p>
          </div>
        </div>

        {/* GALLERY SECTION */}
        <div className="mt-12 px-2 pb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/20 rounded-xl">
                <Grid size={20} className="text-purple-400" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter uppercase">
                Gallery
              </h2>
            </div>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setViewerIndex(index)}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/5 relative group cursor-pointer shadow-lg"
                >
                  <img
                    src={
                      post.media_url ||
                      "https://via.placeholder.com/300?text=No+Image"
                    }
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt="post"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/300?text=Error";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="flex items-center gap-1.5">
                      <Heart
                        size={14}
                        className="fill-rose-500 text-rose-500"
                      />
                      <span className="text-xs font-bold">
                        {post.likes_count || 0}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-white/5 rounded-[3.5rem] border border-dashed border-white/10">
              <Camera size={48} className="mx-auto mb-4 text-purple-500/20" />
              <p className="text-sm font-black text-purple-300/30 uppercase tracking-widest">
                No vibes posted yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FULL SCREEN IMAGE VIEWER */}
      <AnimatePresence>
        {viewerIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4"
          >
            <button
              onClick={() => setViewerIndex(null)}
              className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[210]"
            >
              <X size={28} />
            </button>

            <div className="relative w-full max-w-4xl aspect-auto max-h-[80vh] flex items-center justify-center">
              <motion.img
                key={posts[viewerIndex].id}
                initial={{ opacity: 0, scale: 0.9, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                src={posts[viewerIndex].media_url}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />

              {/* Navigation Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-[-10px] sm:left-[-60px] p-4 bg-white/5 hover:bg-white/10 rounded-full"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-[-10px] sm:right-[-60px] p-4 bg-white/5 hover:bg-white/10 rounded-full"
              >
                <ChevronRight size={32} />
              </button>
            </div>

            {/* Post Info in Viewer */}
            <div className="mt-8 text-center max-w-md">
              <p className="text-lg font-medium text-white/80 italic">
                "{posts[viewerIndex].caption || "No caption vibe."}"
              </p>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Heart className="text-rose-500 fill-rose-500" size={20} />
                  <span className="font-bold">
                    {posts[viewerIndex].likes_count || 0}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-purple-400" size={20} />
                  <span className="font-bold">
                    {posts[viewerIndex].comments_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0f021a]/80 backdrop-blur-xl flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-[#1a0b2e] w-full max-w-md rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto border border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter uppercase text-purple-100">
                  Customize Profile
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-white/5 p-3 rounded-2xl hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    value={editData.full_name}
                    onChange={(e) =>
                      setEditData({ ...editData, full_name: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold focus:border-purple-500 transition-colors outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest ml-1">
                    Vibe/Bio
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold h-28 resize-none focus:border-purple-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest ml-1">
                      Current City
                    </label>
                    <input
                      value={editData.current_location}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          current_location: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-purple-400 tracking-widest ml-1">
                      School
                    </label>
                    <input
                      value={editData.school_name}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          school_name: e.target.value,
                        })
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleUpdateProfile}
                className="w-full bg-white text-black py-5 rounded-[2rem] font-black mt-10 shadow-xl shadow-white/5 active:scale-95 transition-transform"
              >
                {uploading ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  "SAVE CHANGES"
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGOUT CONFIRMATION */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 z-[110] bg-[#0f021a]/90 backdrop-blur-md flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-[#1a0b2e] p-10 rounded-[3rem] w-full max-w-xs text-center border border-white/10 shadow-2xl"
            >
              <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogOut size={32} className="text-rose-500" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-white">Logout?</h3>
              <p className="text-sm text-purple-200/50 mb-8 font-medium italic">
                End the vibe session?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => signOut()}
                  className="w-full py-4 font-black bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-500/20"
                >
                  LOGOUT
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 font-black bg-white/5 text-white rounded-2xl border border-white/10"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
