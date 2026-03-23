import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor,
  GraduationCap,
  MapPin,
  Heart,
  Sparkles,
  X,
  CheckCircle2,
  Trophy,
  Loader2,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { demoUsers } from "@/data/demo";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- Comparison Modal Component ---
function HeartVerdictModal({
  user1,
  user2,
  onClose,
}: {
  user1: any;
  user2: any;
  onClose: () => void;
}) {
  const [analyzing, setAnalyzing] = useState(true);

  // Fake points: In production, these would be calculated from profile fields
  const data = [
    { subject: "Caste", A: 100, B: 40, fullMark: 100 },
    { subject: "State", A: 90, B: 80, fullMark: 100 },
    { subject: "Job", A: 100, B: 60, fullMark: 100 },
    { subject: "Income", A: 70, B: 95, fullMark: 100 },
    { subject: "Location", A: 85, B: 50, fullMark: 100 },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setAnalyzing(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const winner =
    data.reduce((acc, curr) => acc + curr.A, 0) >
    data.reduce((acc, curr) => acc + curr.B, 0)
      ? user1
      : user2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-900 w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-white/50 hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-black text-center mb-6 flex items-center justify-center gap-2 text-white">
          <Sparkles className="text-rose-500" /> THE HEART'S VERDICT
        </h2>

        {analyzing ? (
          <div className="py-20 flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-xs font-black animate-pulse tracking-widest text-rose-500 uppercase">
              Calculating Compatibility...
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: "bold" }}
                  />
                  <Radar
                    name={user1.name}
                    dataKey="A"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.5}
                  />
                  <Radar
                    name={user2.name}
                    dataKey="B"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-rose-500/10 p-5 rounded-[2rem] border border-rose-500/20 text-center">
              <Trophy className="mx-auto mb-2 text-yellow-500" size={32} />
              <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest">
                AI Recommendation
              </p>
              <h3 className="text-2xl font-black uppercase text-white tracking-tighter">
                {winner.full_name || winner.name}
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase">
                Better Match based on Profile Analysis
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// --- Main HeartSection ---
export default function HeartSection() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [showVerdict, setShowVerdict] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Real Liked Profiles from Supabase
  useEffect(() => {
    const fetchLikedProfiles = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // Query to get people you have liked (friendships/interactions table)
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .neq("id", user.id)
          .limit(10); // Abhi ke liye simple fetch, logic change kar sakte hain

        if (data && data.length > 0) {
          setProfiles(data);
        } else {
          setProfiles(demoUsers); // Fallback to demo
        }
      } catch (e) {
        setProfiles(demoUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProfiles();
  }, [user]);

  // 2. Selection Toggle
  const toggleUserSelection = (clickedUser: any) => {
    const isAlreadySelected = selectedUsers.some(
      (u) => u.id === clickedUser.id,
    );

    if (isAlreadySelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== clickedUser.id));
    } else {
      if (selectedUsers.length < 2) {
        setSelectedUsers([...selectedUsers, clickedUser]);
      } else {
        // Replace the last one if 2 are already there
        setSelectedUsers([selectedUsers[1], clickedUser]);
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-32 pt-16 px-4 feed-gradient relative min-h-screen">
      <div className="max-w-lg mx-auto">
        <motion.div
          className="py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="font-display text-2xl font-bold gradient-text flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-400 fill-red-400" />
            In My Heart
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pick 2 profiles to see who matches you best
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-rose-500" size={32} />
          </div>
        ) : (
          <div className="grid gap-4">
            {profiles.map((profile, i) => {
              const isSelected = selectedUsers.some((u) => u.id === profile.id);
              return (
                <motion.div
                  key={profile.id}
                  onClick={() => toggleUserSelection(profile)}
                  className={`glass-card p-5 relative cursor-pointer border-2 transition-all duration-300 ${
                    isSelected
                      ? "border-rose-500 bg-rose-500/10 scale-[0.98]"
                      : "border-white/5 bg-white/5 hover:border-white/20"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={
                          profile.avatar_url ||
                          profile.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`
                        }
                        alt={profile.full_name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10"
                      />
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-1 text-white shadow-lg z-10"
                        >
                          <CheckCircle2 size={16} />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white truncate pr-2">
                          {profile.full_name || profile.name}
                        </h3>
                        <span className="text-[9px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-black uppercase whitespace-nowrap">
                          {profile.job_title ||
                            (profile.id % 2 === 0 ? "Govt Job" : "Private")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1 italic">
                        {profile.bio || "No bio available"}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3 text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                          <GraduationCap size={10} />{" "}
                          {profile.education || "Graduate"}
                        </span>
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                          <MapPin size={10} /> {profile.location || "India"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                    <div className="flex gap-4 text-[10px] text-gray-500">
                      <span>
                        <strong className="text-white">
                          {profile.hookCount || 0}
                        </strong>{" "}
                        Hooks
                      </span>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase transition-colors">
                      <Anchor size={10} /> View Profile
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Match Button */}
      <AnimatePresence>
        {selectedUsers.length === 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-28 left-0 right-0 px-6 z-[100]"
          >
            <button
              onClick={() => setShowVerdict(true)}
              className="w-full bg-gradient-to-r from-rose-600 to-rose-500 text-white py-4 rounded-[2rem] font-black tracking-widest shadow-[0_10px_30px_rgba(244,63,94,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/20"
            >
              <Sparkles size={20} className="animate-pulse" />
              ANALYZE MATCH (
              {selectedUsers[0].full_name || selectedUsers[0].name} &{" "}
              {selectedUsers[1].full_name || selectedUsers[1].name})
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showVerdict && (
          <HeartVerdictModal
            user1={selectedUsers[0]}
            user2={selectedUsers[1]}
            onClose={() => setShowVerdict(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
