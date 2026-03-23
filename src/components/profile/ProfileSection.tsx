import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor,
  Users,
  ImageIcon,
  ArrowLeft,
  Heart,
  MessageCircle,
  Camera,
  Loader2,
  UserPlus,
  Check,
  X,
  Edit3,
  Eye,
  LogOut,
  Trash2,
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

  // Modals & UI State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [editData, setEditData] = useState({ full_name: "", bio: "" });
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

      setProfile(pRes.data);
      setEditData({
        full_name: pRes.data?.full_name || "",
        bio: pRes.data?.bio || "",
      });
      setPosts(poRes.data || []);

      if (currentUser && !isOwnProfile) {
        const { data } = await supabase
          .from("friendships")
          .select("*")
          .or(
            `and(requester_id.eq.${currentUser.id},addressee_id.eq.${profileId}),and(requester_id.eq.${profileId},addressee_id.eq.${currentUser.id})`,
          )
          .single();
        setRelation(data);
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

  // --- ACTIONS ---
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
      const path = `avatars/${profileId}-${Date.now()}`;
      await supabase.storage.from("avatars").upload(path, file);
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", profileId);
      setProfile({ ...profile, avatar_url: publicUrl });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this vibe?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (!error) {
      setPosts(posts.filter((p) => p.id !== postId));
      setSelectedPost(null);
    }
  };

  const handleAction = async (
    type: "hook" | "friend",
    status: "pending" | "accepted",
  ) => {
    await supabase.from("friendships").upsert({
      requester_id: currentUser?.id,
      addressee_id: profileId,
      status: status,
      relation_type: type,
    });
    fetchProfileData();
  };

  if (loading || !profile)
    return (
      <div className="fixed inset-0 bg-background z-[70] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        <p className="font-bold text-sm tracking-widest text-muted-foreground">
          FACELOOK
        </p>
      </div>
    );

  const isHook = isHookPartner(relation);
  const isFriend =
    relation?.status === "accepted" && relation?.relation_type === "friend";
  const hasIncomingRequest =
    relation?.status === "pending" &&
    relation?.addressee_id === currentUser?.id;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto pb-24 font-sans text-foreground">
      {/* HEADER: Back & Close Buttons */}
      <div className="sticky top-0 z-40 flex justify-between items-center px-6 py-5 bg-background/80 backdrop-blur-md">
        <button
          onClick={onBack}
          className="p-2 hover:bg-secondary/20 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-full"
            >
              <LogOut size={22} />
            </button>
          )}
          <button
            onClick={onBack}
            className="p-2 bg-foreground text-background rounded-full hover:scale-110 transition-transform"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 relative">
        {/* Cover Gradient */}
        <div className="h-32 w-full bg-gradient-to-br from-rose-500/10 via-blue-500/5 to-transparent rounded-[2.5rem] mb-[-4rem]" />

        {/* Avatar & Edit Section */}
        <div className="flex items-end justify-between px-2">
          <div className="relative group">
            <div
              className={cn(
                "w-32 h-32 rounded-[2.5rem] overflow-hidden ring-8 ring-background shadow-2xl transition-all",
                isHook && "ring-rose-500 shadow-rose-100",
              )}
            >
              <img
                src={profile.avatar_url || "/placeholder.png"}
                className="w-full h-full object-cover"
              />
            </div>
            {isOwnProfile && (
              <label className="absolute bottom-1 right-1 bg-foreground text-background p-2.5 rounded-2xl cursor-pointer shadow-xl hover:bg-rose-500 transition-colors border-4 border-background">
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
              <Edit3 size={16} /> EDIT PROFILE
            </button>
          )}
        </div>

        {/* Profile Info */}
        <div className="mt-6 space-y-1 px-2">
          <h1 className="text-3xl font-black flex items-center gap-2 tracking-tighter">
            {profile.full_name}{" "}
            {isHook && <Anchor className="text-rose-500" size={24} />}
          </h1>
          <p className="text-rose-500 font-black text-sm uppercase tracking-widest opacity-80">
            @{profile.username}
          </p>
          <p className="pt-3 text-[16px] leading-relaxed font-medium text-foreground/70 max-w-sm">
            {profile.bio || "No vibes added yet. ✨"}
          </p>
        </div>

        {/* Action Buttons for Others */}
        {!isOwnProfile && (
          <div className="flex gap-3 mt-8 px-2">
            {hasIncomingRequest ? (
              <button
                onClick={() => handleAction(relation.relation_type, "accepted")}
                className="flex-1 bg-green-600 text-white font-black py-4 rounded-3xl shadow-xl shadow-green-100 transition-active"
              >
                ACCEPT REQUEST
              </button>
            ) : (
              <>
                <button className="flex-1 bg-secondary/20 font-bold py-4 rounded-3xl flex items-center justify-center gap-2 transition-active">
                  <MessageCircle size={20} /> Chat
                </button>
                <button
                  onClick={() => handleAction("hook", "pending")}
                  disabled={relation?.status}
                  className={cn(
                    "flex-[1.5] font-black py-4 rounded-3xl flex items-center justify-center gap-2 transition-all shadow-xl",
                    isHook
                      ? "bg-rose-600 text-white"
                      : "bg-white border-2 border-rose-500 text-rose-600",
                  )}
                >
                  <Heart size={20} className={isHook ? "fill-current" : ""} />
                  {isHook
                    ? "HOOKED"
                    : relation?.status === "pending"
                      ? "PENDING"
                      : "HOOK UP"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-10 p-2">
          {[
            { label: "Posts", count: posts.length },
            { label: "Hooks", count: profile.hook_count || 0 },
            { label: "Friends", count: profile.friend_count || 0 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-secondary/5 border border-secondary/10 p-5 rounded-[2rem] text-center"
            >
              <div className="text-2xl font-black tracking-tighter">
                {stat.count}
              </div>
              <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="px-6 mt-12">
        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6 ml-2">
          The Feed
        </h3>

        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPost(post)}
                className="aspect-square rounded-[1.5rem] bg-secondary/10 overflow-hidden relative cursor-pointer"
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Eye className="text-white" size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed rounded-[3rem] border-secondary/20">
            <p className="text-muted-foreground font-bold text-sm">
              Nothing shared yet. 🌵
            </p>
          </div>
        )}
      </div>

      {/* MODALS SECTION */}
      <AnimatePresence>
        {/* Edit Modal */}
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
              className="bg-background w-full max-w-md rounded-[3rem] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black tracking-tighter">
                  Edit Profile
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-secondary/20 p-2 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">
                    Display Name
                  </label>
                  <input
                    value={editData.full_name}
                    onChange={(e) =>
                      setEditData({ ...editData, full_name: e.target.value })
                    }
                    className="w-full bg-secondary/10 border-none rounded-2xl p-4 font-bold focus:ring-2 ring-rose-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">
                    About You
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    className="w-full bg-secondary/10 border-none rounded-2xl p-4 font-bold h-32 focus:ring-2 ring-rose-500 resize-none transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full bg-foreground text-background py-5 rounded-[2rem] font-black mt-10 shadow-xl active:scale-95 transition-transform"
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

        {/* Full Post View */}
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="flex justify-between p-6">
              <button
                onClick={() => setSelectedPost(null)}
                className="text-white p-2 bg-white/10 rounded-full hover:bg-white/20"
              >
                <X size={24} />
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="text-rose-500 bg-rose-500/10 p-3 rounded-2xl"
                >
                  <Trash2 size={22} />
                </button>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={selectedPost.image_url}
                className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
              />
            </div>
            <div className="p-10 bg-gradient-to-t from-black to-transparent">
              <p className="text-white text-xl font-bold italic">
                "{selectedPost.content}"
              </p>
              <p className="text-white/40 text-xs mt-3 uppercase tracking-widest font-black">
                {new Date(selectedPost.created_at).toDateString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Logout Prompt */}
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-background p-10 rounded-[3.5rem] shadow-2xl max-w-xs w-full text-center">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <LogOut size={40} />
              </div>
              <h3 className="text-2xl font-black mb-2 tracking-tighter">
                Leaving so soon?
              </h3>
              <p className="text-muted-foreground text-sm mb-10 font-medium">
                You'll need to log back in to see your vibes.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => signOut()}
                  className="bg-rose-600 text-white py-5 rounded-[2rem] font-black shadow-lg shadow-rose-200"
                >
                  LOGOUT
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="font-bold py-2 text-muted-foreground hover:text-foreground"
                >
                  GO BACK
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
