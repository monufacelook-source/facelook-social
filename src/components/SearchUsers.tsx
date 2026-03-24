import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  UserPlus,
  Anchor,
  Lock,
  MapPin,
  Loader2,
  Check,
  Clock,
  UserCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SearchUsers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- 1. Friend Request Logic ---
  const handleSendRequest = async (
    targetUserId: string,
    targetName: string,
  ) => {
    if (!currentUser) return;

    const { error } = await supabase.from("friendships").insert([
      {
        requester_id: currentUser.id,
        addressee_id: targetUserId,
        status: "pending",
      },
    ]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sent! 🚀",
        description: `Request sent to ${targetName}.`,
      });
      // Local state update for instant feel
      setResults((prev) =>
        prev.map((p) =>
          p.id === targetUserId
            ? {
                ...p,
                friendship: { status: "pending", requester_id: currentUser.id },
              }
            : p,
        ),
      );
    }
  };

  // --- 2. Accept Request Logic ---
  const handleAcceptRequest = async (
    targetUserId: string,
    targetName: string,
  ) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("requester_id", targetUserId)
      .eq("addressee_id", currentUser.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Connected! 🎉",
        description: `You are now friends with ${targetName}.`,
      });
      setResults((prev) =>
        prev.map((p) =>
          p.id === targetUserId
            ? { ...p, friendship: { status: "accepted" } }
            : p,
        ),
      );
    }
  };

  // --- 3. Search Logic ---
  useEffect(() => {
    const searchPeople = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .or(
          `full_name.ilike.%${query}%,username.ilike.%${query}%,location.ilike.%${query}%`,
        )
        .neq("id", currentUser?.id)
        .neq("privacy_status", "hidden")
        .limit(5);

      if (!error && profiles) {
        const enriched = await Promise.all(
          profiles.map(async (p) => {
            const { data: f } = await supabase
              .from("friendships")
              .select("status, requester_id")
              .or(
                `and(requester_id.eq.${currentUser?.id},addressee_id.eq.${p.id}),and(requester_id.eq.${p.id},addressee_id.eq.${currentUser?.id})`,
              )
              .maybeSingle();
            return { ...p, friendship: f };
          }),
        );
        setResults(enriched);
      }
      setLoading(false);
    };

    const timer = setTimeout(searchPeople, 500);
    return () => clearTimeout(timer);
  }, [query, currentUser?.id]);

  return (
    <div className="relative w-full max-w-md mx-auto mb-6 px-4">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search new people..."
          className="w-full bg-gray-100 border-2 border-transparent rounded-2xl py-4 pl-12 pr-12 text-base outline-none focus:border-blue-500/30 focus:bg-white transition-all shadow-inner text-black font-medium"
        />
        {loading && (
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-blue-600" />
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute top-full left-4 right-4 mt-4 bg-white/90 backdrop-blur-xl border border-white/20 rounded-[2.5rem] overflow-hidden z-[300] shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
          >
            {results.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 flex items-center justify-between border-b border-gray-50 last:border-0 hover:bg-blue-50/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg overflow-hidden shrink-0">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <span className="font-black text-blue-600 text-xl uppercase">
                          {profile.full_name?.[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="overflow-hidden">
                    <p className="text-md font-black text-gray-900 flex items-center gap-1 truncate uppercase tracking-tight">
                      {profile.full_name}
                      {profile.privacy_status === "locked" && (
                        <Lock className="w-3 h-3 text-gray-400" />
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase">
                      {profile.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {profile.location}
                        </span>
                      )}
                      {profile.age && <span>• {profile.age} yrs</span>}
                    </div>
                  </div>
                </div>

                {/* Animated Buttons Logic */}
                <div className="flex items-center gap-2">
                  {!profile.friendship ? (
                    // SEND REQUEST BUTTON
                    <motion.button
                      whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        handleSendRequest(profile.id, profile.full_name)
                      }
                      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-blue-200 uppercase tracking-widest transition-all"
                    >
                      <UserPlus className="w-4 h-4" /> Add
                    </motion.button>
                  ) : profile.friendship.status === "pending" ? (
                    profile.friendship.requester_id === currentUser?.id ? (
                      // SENT / WAITING
                      <div className="flex items-center gap-2 bg-orange-100 text-orange-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-orange-200">
                        <Clock className="w-4 h-4" /> Sent
                      </div>
                    ) : (
                      // ACCEPT BUTTON (STYLISH & BIG)
                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 10px 20px rgba(22, 163, 74, 0.2)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() =>
                          handleAcceptRequest(profile.id, profile.full_name)
                        }
                        className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-xl uppercase tracking-widest border-b-4 border-green-700 active:border-b-0 transition-all"
                      >
                        <UserCheck className="w-4 h-4" /> Accept
                      </motion.button>
                    )
                  ) : (
                    // ALREADY FRIENDS
                    <div className="flex items-center gap-2 bg-green-50 text-green-600 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100">
                      <Check className="w-4 h-4" /> Friends
                    </div>
                  )}

                  <motion.button
                    whileHover={{ rotate: 15 }}
                    className="p-3 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100"
                  >
                    <Anchor className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
