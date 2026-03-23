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
  MoreVertical,
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
    if (!confirm("Post delete karni hai?")) return;
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
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        <p className="font-bold text-sm tracking-widest text-muted-foreground animate-pulse">
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
      {/* Header / Cover Area */}
      <div className="relative h-48 bg-gradient-to-b from-rose-500/10 to-transparent">
        <button
          onClick={onBack}
          className="absolute top-6 left-6 p-2 bg-background/80 backdrop-blur rounded-full shadow-lg border border-border/50 transition-active"
        >
          <ArrowLeft size={20} />
        </button>
        {isOwnProfile && (
          <div className="absolute top-6 right-6 flex gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="p-2 bg-background/80 backdrop-blur rounded-full border border-border/50"
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 bg-rose-50 text-rose-600 rounded-full border border-rose-100"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="px-6 -mt-14 relative">
        {/* Avatar Area */}
        <div className="relative inline-block group">
          <div
            className={cn(
              "w-28 h-28 rounded-[2rem] overflow-hidden ring-4 ring-background shadow-2xl transition-transform duration-500 group-hover:scale-105",
              isHook && "ring-rose-500 shadow-rose-200",
            )}
          >
            <img
              src={profile.avatar_url || "/placeholder.png"}
              className="w-full h-full object-cover"
            />
          </div>
          {isOwnProfile && (
            <label className="absolute bottom-1 right-1 bg-foreground text-background p-2 rounded-xl cursor-pointer shadow-lg hover:bg-rose-500 transition-colors">
              {uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
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

        {/* Profile Info */}
        <div className="mt-5 space-y-1">
          <h1 className="text-3xl font-black flex items-center gap-2">
            {profile.full_name}{" "}
            {isHook && (
              <Anchor className="text-rose-500 fill-rose-500" size={24} />
            )}
          </h1>
          <p className="text-muted-foreground font-bold tracking-tight">
            @{profile.username}
          </p>
          <p className="pt-2 text-[15px] leading-relaxed max-w-sm">
            {profile.bio || "No bio yet. 🌿"}
          </p>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex gap-3 mt-8">
            {hasIncomingRequest ? (
              <button
                onClick={() => handleAction(relation.relation_type, "accepted")}
                className="flex-1 bg-green-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-green-100 transition-active"
              >
                Accept Request
              </button>
            ) : (
              <>
                <button className="flex-1 bg-secondary/20 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-active">
                  <MessageCircle size={20} /> Chat
                </button>
                <button
                  onClick={() => handleAction("hook", "pending")}
                  disabled={relation?.status}
                  className={cn(
                    "flex-[1.5] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl",
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
                <button
                  onClick={() => handleAction("friend", "pending")}
                  disabled={relation?.status}
                  className={cn(
                    "px-5 rounded-2xl border-2 transition-active",
                    isFriend
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-blue-50 text-blue-600 border-blue-100",
                  )}
                >
                  {isFriend ? <Check size={22} /> : <UserPlus size={22} />}
                </button>
              </>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between items-center mt-10 p-6 bg-secondary/10 rounded-[2.5rem] border border-secondary/20">
          {[
            { label: "Posts", count: posts.length, icon: ImageIcon },
            { label: "Hooks", count: profile.hook_count || 0, icon: Anchor },
            { label: "Friends", count: profile.friend_count || 0, icon: Users },
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <div className="text-xl font-black">{stat.count}</div>
              <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Section */}
      <div className="px-6 mt-10">
        <div className="flex justify-between items-end mb-6">
          <h3 className="font-black text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Gallery
          </h3>
          <div className="h-1 flex-1 mx-4 bg-secondary/10 rounded-full mb-1.5" />
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                whileHover={{ scale: 0.98 }}
                onClick={() => setSelectedPost(post)}
                className="aspect-square rounded-2xl bg-secondary/20 overflow-hidden relative cursor-pointer shadow-sm"
              >
                {post.image_url && (
                  <img
                    src={post.image_url}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Eye className="text-white shadow-xl" size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed rounded-[3rem] border-secondary/30">
            <ImageIcon
              className="mx-auto text-muted-foreground mb-3 opacity-30"
              size={40}
            />
            <p className="text-muted-foreground font-bold text-sm">
              Aakhir photo kab daloge? 😂
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
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-background w-full max-w-md rounded-[3rem] p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black">Edit Profile</h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-secondary/20 p-2 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">
                    Full Name
                  </label>
                  <input
                    value={editData.full_name}
                    onChange={(e) =>
                      setEditData({ ...editData, full_name: e.target.value })
                    }
                    className="w-full bg-secondary/10 border-none rounded-2xl p-4 font-bold focus:ring-2 ring-rose-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest ml-1 text-muted-foreground">
                    Bio
                  </label>
                  <textarea
                    value={editData.bio}
                    onChange={(e) =>
                      setEditData({ ...editData, bio: e.target.value })
                    }
                    className="w-full bg-secondary/10 border-none rounded-2xl p-4 font-bold h-32 focus:ring-2 ring-rose-500 resize-none"
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateProfile}
                className="w-full bg-foreground text-background py-5 rounded-[2rem] font-black mt-8 shadow-xl"
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

        {/* Post View Modal */}
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col p-4"
          >
            <div className="flex justify-between p-4">
              <button
                onClick={() => setSelectedPost(null)}
                className="text-white"
              >
                <ArrowLeft size={28} />
              </button>
              {isOwnProfile && (
                <button
                  onClick={() => handleDeletePost(selectedPost.id)}
                  className="text-rose-500 bg-rose-500/10 p-3 rounded-full"
                >
                  <Trash2 size={24} />
                </button>
              )}
            </div>
            <div className="flex-1 flex items-center justify-center">
              <img
                src={selectedPost.image_url}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>
            <div className="p-8">
              <p className="text-white text-lg font-bold">
                {selectedPost.content}
              </p>
              <p className="text-white/40 text-xs mt-2">
                {new Date(selectedPost.created_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Logout Confirm */}
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 text-center"
          >
            <div className="bg-background p-10 rounded-[3rem] shadow-2xl max-w-xs w-full">
              <LogOut className="mx-auto text-rose-500 mb-4" size={48} />
              <h3 className="text-xl font-black mb-2">Jaa rahe ho?</h3>
              <p className="text-muted-foreground text-sm mb-8 font-bold text-pretty">
                Are you sure you want to log out from Facelook?
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => signOut()}
                  className="bg-rose-600 text-white py-4 rounded-2xl font-black"
                >
                  LOGOUT
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="font-bold py-2 text-muted-foreground"
                >
                  Wait, Stay!
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
