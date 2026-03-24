import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, UserPlus, Anchor, Lock, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast"; // Toast notification ke liye

export default function SearchUsers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- 1. Friend Request Bhejne ka Function ---
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
      if (error.code === "23505") {
        toast({
          title: "Already Sent",
          description: `You've already sent a request to ${targetName}.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Success! 🎉",
        description: `Friend request sent to ${targetName}.`,
      });
    }
  };

  // --- 2. Search Logic ---
  useEffect(() => {
    const searchPeople = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .or(
          `full_name.ilike.%${query}%,username.ilike.%${query}%,location.ilike.%${query}%`,
        )
        .neq("id", currentUser?.id)
        .neq("privacy_status", "hidden")
        .limit(5);

      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    };

    const timer = setTimeout(searchPeople, 500);
    return () => clearTimeout(timer);
  }, [query, currentUser?.id]);

  return (
    <div className="relative w-full max-w-md mx-auto mb-6 px-4">
      {/* Search Input Area */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search friends by name or city..."
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-lg text-white"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-4 right-4 mt-2 glass-card border border-white/[0.1] rounded-2xl overflow-hidden z-50 shadow-2xl bg-black/80 backdrop-blur-xl"
          >
            {results.map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 hover:bg-white/[0.05] flex items-center justify-between border-b border-white/[0.05] last:border-0"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar Section */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10 overflow-hidden">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                    ) : (
                      <span className="font-bold text-white">
                        {profile.full_name?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info Section */}
                  <div>
                    <p className="text-sm font-semibold text-white flex items-center gap-1">
                      {profile.full_name}
                      {profile.privacy_status === "locked" && (
                        <Lock className="w-3 h-3 text-muted-foreground" />
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
                      {profile.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          {profile.location}
                        </span>
                      )}
                      {profile.age && <span>• {profile.age} Years</span>}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleSendRequest(profile.id, profile.full_name)
                    }
                    className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-colors group"
                    title="Add Friend"
                  >
                    <UserPlus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  </button>
                  <button
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-full transition-colors group"
                    title="Hook Partner"
                  >
                    <Anchor className="w-4 h-4 text-rose-500 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
