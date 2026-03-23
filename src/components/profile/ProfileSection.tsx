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
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  if (loading || !profile)
    return (
      <div className="fixed inset-0 bg-background z-[70] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        <p className="font-bold text-sm tracking-widest text-muted-foreground uppercase">
          Facelook
        </p>
      </div>
    );

  const isHook = isHookPartner(relation);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto pb-24 font-sans text-foreground">
      {/* HEADER */}
      <div className="sticky top-0 z-50 flex justify-between items-center px-4 py-4 bg-background/60 backdrop-blur-xl border-b border-secondary/5">
        <button
          onClick={onBack}
          className="p-3 bg-secondary/10 hover:bg-secondary/20 rounded-2xl transition-all active:scale-90"
        >
          <ArrowLeft size={22} />
        </button>
        <span className="font-black tracking-tighter text-sm uppercase opacity-40">
          {isOwnProfile ? "My Space" : "Member Vibe"}
        </span>
        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-3 text-rose-500 bg-rose-500/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
            >
              <LogOut size={20} />
            </button>
          )}
          <button
            onClick={onBack}
            className="p-3 bg-foreground text-background rounded-2xl"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 relative">
        <div className="h-32 w-full bg-gradient-to-br from-rose-500/20 via-blue-500/10 to-transparent rounded-[2.5rem] mb-[-4rem]" />

        <div className="flex items-end justify-between px-2">
          <div className="relative group">
            <div
              className={cn(
                "w-32 h-32 rounded-[2.5rem] overflow-hidden ring-8 ring-background shadow-2xl transition-all",
                isHook && "ring-rose-500 shadow-rose-100",
              )}
            >
              <img
                src={
                  profile.avatar_url ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky"
                }
                className="w-full h-full object-cover"
                alt="profile"
              />
            </div>
            {isOwnProfile && (
              <label className="absolute bottom-1 right-1 bg-foreground text-background p-2.5 rounded-2xl cursor-pointer shadow-xl border-4 border-background">
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
              className="mb-2 px-6 py-3 bg-secondary/10 hover:bg-secondary/20 rounded-2xl font-black text-xs tracking-widest flex items-center gap-2 transition-all"
            >
              <Edit3 size={16} /> EDIT VIBE
            </button>
          )}
        </div>

        {/* PROFILE INFO */}
        <div className="mt-6 space-y-1 px-2">
          <h1 className="text-3xl font-black flex items-center gap-2 tracking-tighter">
            {profile.full_name}{" "}
            {isHook && <Anchor className="text-rose-500" size={24} />}
          </h1>
          <p className="text-rose-500 font-black text-sm uppercase tracking-widest opacity-80">
            @{profile.username || "user"}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {profile.current_location && (
              <span className="flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                <MapPin size={12} /> {profile.current_location}
              </span>
            )}
            {profile.school_name && (
              <span className="flex items-center gap-1 bg-secondary/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                <GraduationCap size={12} /> {profile.school_name}
              </span>
            )}
          </div>

          <p className="pt-3 text-[16px] leading-relaxed font-medium text-foreground/70 max-w-sm">
            {profile.bio || "No vibes added yet. ✨"}
          </p>
        </div>

        {/* --- STATS SECTION (FIXED & ADDED) --- */}
        <div className="grid grid-cols-3 gap-2 mt-8 px-2">
          <div className="bg-secondary/10 p-4 rounded-[2rem] text-center border border-white/5">
            <p className="text-xl font-black">{posts.length}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Posts
            </p>
          </div>
          <div className="bg-secondary/10 p-4 rounded-[2rem] text-center border border-white/5">
            <p className="text-xl font-black">{profile.friends_count || 0}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Friends
            </p>
          </div>
          <div className="bg-rose-500/10 p-4 rounded-[2rem] text-center border border-rose-500/10">
            <p className="text-xl font-black text-rose-500">
              {profile.hook_count || 0}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-rose-400">
              Hooks
            </p>
          </div>
        </div>

        {/* --- GALLERY SECTION (FIXED & ADDED) --- */}
        <div className="mt-10 px-2 pb-20">
          <div className="flex items-center gap-2 mb-6">
            <Grid size={20} className="text-rose-500" />
            <h2 className="text-xl font-black tracking-tighter uppercase">
              Gallery
            </h2>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  whileHover={{ scale: 0.98 }}
                  className="aspect-square rounded-2xl overflow-hidden bg-secondary/20 border border-white/5 relative group"
                >
                  <img
                    src={post.media_url}
                    className="w-full h-full object-cover"
                    alt="post"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Heart size={16} className="text-white fill-white" />
                    <span className="text-white text-xs font-bold">
                      {post.likes_count || 0}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-secondary/5 rounded-[3rem] border border-dashed border-secondary/20">
              <Camera size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm font-bold text-muted-foreground">
                No posts yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-background w-full max-w-md rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black tracking-tighter">
                  Customize Profile
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-secondary/20 p-2 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Inputs for full_name, bio, etc. (Same as before) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                    Full Name
                  </label>
                  <input
                    value={editData.full_name}
                    onChange={(e) =>
                      setEditData({ ...editData, full_name: e.target.value })
                    }
                    className="w-full bg-secondary/10 border-none rounded-2xl p-4 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">
                    Bio
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    className="w-full bg-secondary/10 border-none rounded-2xl p-4 font-bold h-24 resize-none"
                  />
                </div>
                {/* ... other inputs (location, school etc) */}
              </div>

              <button
                onClick={handleUpdateProfile}
                className="w-full bg-foreground text-background py-5 rounded-[2rem] font-black mt-8"
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
          <motion.div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-background p-8 rounded-[2.5rem] w-full max-w-xs text-center border border-white/10"
            >
              <LogOut size={40} className="mx-auto mb-4 text-rose-500" />
              <h3 className="text-xl font-black mb-2">Logout?</h3>
              <p className="text-sm text-muted-foreground mb-6 font-medium">
                Are you sure you want to exit the vibe?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 font-bold bg-secondary/10 rounded-2xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex-1 py-3 font-bold bg-rose-500 text-white rounded-2xl"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
