import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Check, X, Heart, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RequestManager() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);

  // 1. Pending Requests Fetch Karo
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("friendships")
        .select(`*, profiles:requester_id (full_name, avatar_url, username)`)
        .eq("addressee_id", user.id)
        .eq("status", "pending");
      setRequests(data || []);
    };
    fetchRequests();
  }, [user]);

  // 2. Accept/Reject Function
  const handleAction = async (
    requestId: string,
    action: "accepted" | "rejected",
  ) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: action })
      .eq("id", requestId);

    if (!error) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="font-black text-xl flex items-center gap-2">
        Pending Requests{" "}
        {requests.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {requests.length}
          </span>
        )}
      </h2>

      <AnimatePresence>
        {requests.map((req) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 rounded-2xl border flex items-center justify-between shadow-sm ${
              req.relation_type === "hook"
                ? "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={req.profiles.avatar_url}
                className="w-12 h-12 rounded-full ring-2 ring-white shadow-sm"
              />
              <div>
                <p className="font-bold text-sm">{req.profiles.full_name}</p>
                <p className="text-[10px] uppercase font-black tracking-widest flex items-center gap-1">
                  {req.relation_type === "hook" ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <Heart size={10} className="fill-current animate-beat" />{" "}
                      Hook Proposal
                    </span>
                  ) : (
                    <span className="text-blue-600 flex items-center gap-1">
                      <UserPlus size={10} /> Friend Request
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleAction(req.id, "accepted")}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-md active:scale-90"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => handleAction(req.id, "rejected")}
                className="p-2 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-all active:scale-90"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {requests.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-10 italic">
          No pending requests. Chill karo! 😎
        </p>
      )}
    </div>
  );
}
