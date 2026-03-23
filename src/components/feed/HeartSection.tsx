import React, { useState } from "react";
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
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { demoUsers } from "@/data/demo";

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

  // Fake points based on your logic: Caste, State, Job, Income, Location
  // In real app, these will come from user1 and user2 data
  const data = [
    { subject: "Caste", A: 100, B: 40, fullMark: 100 },
    { subject: "State", A: 90, B: 80, fullMark: 100 },
    { subject: "Job", A: 100, B: 60, fullMark: 100 },
    { subject: "Income", A: 70, B: 95, fullMark: 100 },
    { subject: "Location", A: 85, B: 50, fullMark: 100 },
  ];

  React.useEffect(() => {
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
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4"
    >
      <div className="bg-card w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-secondary/20 rounded-full"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-black text-center mb-6 flex items-center justify-center gap-2">
          <Sparkles className="text-rose-500" /> THE HEART'S VERDICT
        </h2>

        {analyzing ? (
          <div className="py-20 flex flex-col items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full mb-4"
            />
            <p className="text-xs font-black animate-pulse tracking-widest text-rose-500">
              ANALYZING PROFILES...
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
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
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
              <Trophy className="mx-auto mb-2 text-yellow-500" />
              <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest">
                Recommended Choice
              </p>
              <h3 className="text-2xl font-black uppercase">{winner.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Based on Caste priority & Job stability
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// --- Main HeartSection ---
export default function HeartSection() {
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [showVerdict, setShowVerdict] = useState(false);

  const toggleUserSelection = (user: any) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else if (selectedUsers.length < 2) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 pt-16 px-4 feed-gradient relative">
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
            Select 2 profiles to compare
          </p>
        </motion.div>

        <div className="space-y-4">
          {demoUsers.map((user, i) => {
            const isSelected = selectedUsers.find((u) => u.id === user.id);
            return (
              <motion.div
                key={user.id}
                onClick={() => toggleUserSelection(user)}
                className={`glass-card p-5 space-y-3 cursor-pointer border-2 transition-all ${isSelected ? "border-rose-500 bg-rose-500/5" : "border-transparent"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-secondary/30"
                    />
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-rose-500 rounded-full p-1 text-white">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-display font-bold">{user.name}</h3>
                      <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                        {user.id % 2 === 0 ? "Govt Job" : "Private"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {user.bio}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground font-bold uppercase">
                  <span className="flex items-center gap-1">
                    <GraduationCap size={12} /> {user.education}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {user.location}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>
                      <strong className="text-foreground">
                        {user.hookCount}
                      </strong>{" "}
                      Hooks
                    </span>
                  </div>
                  <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-black uppercase">
                    <Anchor size={12} /> Hook
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Match Button */}
      <AnimatePresence>
        {selectedUsers.length === 2 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-24 left-0 right-0 px-6 z-50"
          >
            <button
              onClick={() => setShowVerdict(true)}
              className="w-full bg-rose-500 text-white py-4 rounded-[2rem] font-black tracking-widest shadow-2xl shadow-rose-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Sparkles size={20} /> ANALYZE MATCH ({selectedUsers[0].name} &{" "}
              {selectedUsers[1].name})
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
