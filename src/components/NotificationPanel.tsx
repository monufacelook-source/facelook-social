import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Check, X, Bell, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

export default function NotificationPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Pending Requests Fetch karna
  const fetchRequests = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("friendships")
      .select(
        `
        id,
        status,
        requester:profiles!requester_id(id, full_name, avatar_url, username)
      `,
      )
      .eq("addressee_id", user.id)
      .eq("status", "pending");

    if (!error) setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    // Real-time update: Agar koi request bheje toh turant dikhe
    const channel = supabase
      .channel("friendship_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "friendships" },
        () => fetchRequests(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // 2. Request Accept/Decline Logic
  const handleAction = async (
    requestId: string,
    newStatus: "accepted" | "declined",
  ) => {
    if (newStatus === "accepted") {
      await supabase
        .from("friendships")
        .update({ status: "accepted" })
        .eq("id", requestId);
    } else {
      await supabase.from("friendships").delete().eq("id", requestId);
    }

    fetchRequests();
    queryClient.invalidateQueries({ queryKey: ["posts"] }); // Feed refresh karne ke liye
  };

  if (loading) return null;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        Notifications
      </h2>

      <div className="space-y-3">
        {requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-sm">
            No new friend requests. 🏝️
          </p>
        ) : (
          requests.map((req) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-3 flex items-center justify-between border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {req.requester.avatar_url ? (
                    <img
                      src={req.requester.avatar_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white/50" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {req.requester.full_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    sent you a request
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(req.id, "accepted")}
                  className="p-2 bg-primary rounded-full hover:scale-110 transition-transform"
                >
                  <Check className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => handleAction(req.id, "declined")}
                  className="p-2 bg-white/10 rounded-full hover:scale-110 transition-transform"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
