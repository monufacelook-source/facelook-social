import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserCheck,
  UserX,
  Users,
  Clock,
  MessageSquare,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FriendListOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FriendListOverlay({
  isOpen,
  onClose,
}: FriendListOverlayProps) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // 1. Fetch Friends (Accepted status)
    const { data: friendsData } = await supabase
      .from("friendships")
      .select(
        `
        status,
        requester:profiles!friendships_requester_id_fkey(*),
        addressee:profiles!friendships_addressee_id_fkey(*)
      `,
      )
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    // 2. Fetch Pending Requests (Only where user is the receiver)
    const { data: requestsData } = await supabase
      .from("friendships")
      .select(
        `
        id,
        created_at,
        requester:profiles!friendships_requester_id_fkey(*)
      `,
      )
      .eq("status", "pending")
      .eq("addressee_id", user.id);

    // Filter friends to get the "other" person's profile
    const processedFriends =
      friendsData?.map((f: any) =>
        f.requester.id === user.id ? f.addressee : f.requester,
      ) || [];

    setFriends(processedFriends);
    setPendingRequests(requestsData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, user]);

  const handleAction = async (
    requestId: string,
    newStatus: "accepted" | "rejected",
  ) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: newStatus })
      .eq("id", requestId);

    if (!error) fetchData(); // Reload data
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[80vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              Network
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Custom Tabs */}
        <div className="flex p-2 bg-gray-100 m-4 rounded-2xl gap-2">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === "friends" ? "bg-white text-blue-600 shadow-md" : "text-gray-500"}`}
          >
            Friends{" "}
            <span className="bg-blue-100 px-2 py-0.5 rounded-md text-[10px]">
              {friends.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === "requests" ? "bg-white text-orange-600 shadow-md" : "text-gray-500"}`}
          >
            Requests{" "}
            <span className="bg-orange-100 px-2 py-0.5 rounded-md text-[10px]">
              {pendingRequests.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-3">
              {activeTab === "friends" ? (
                friends.length > 0 ? (
                  friends.map((friend) => (
                    <motion.div
                      layout
                      key={friend.id}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-white shadow-sm">
                            {friend.avatar_url ? (
                              <img
                                src={friend.avatar_url}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              friend.full_name[0]
                            )}
                          </div>
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-800 uppercase tracking-tight">
                            {friend.full_name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold italic">
                            @{friend.username}
                          </p>
                        </div>
                      </div>
                      <button className="p-3 bg-white text-blue-600 rounded-2xl shadow-sm hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                        <MessageSquare size={18} />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <EmptyState
                    icon={<Users size={40} />}
                    text="No friends yet. Start searching!"
                  />
                )
              ) : pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <motion.div
                    layout
                    key={req.id}
                    className="p-4 bg-orange-50/50 border border-orange-100 rounded-3xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-white">
                        {req.requester.avatar_url ? (
                          <img
                            src={req.requester.avatar_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          req.requester.full_name[0]
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-800 uppercase tracking-tight">
                          {req.requester.full_name}
                        </p>
                        <p className="text-[9px] text-orange-600 font-bold flex items-center gap-1">
                          <Clock size={10} /> Pending Request
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(req.id, "accepted")}
                        className="p-2.5 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-all active:scale-95"
                      >
                        <UserCheck size={18} />
                      </button>
                      <button
                        onClick={() => handleAction(req.id, "rejected")}
                        className="p-2.5 bg-white text-rose-600 border border-rose-100 rounded-xl shadow-sm hover:bg-rose-50 transition-all active:scale-95"
                      >
                        <UserX size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState
                  icon={<Clock size={40} />}
                  text="No pending requests."
                />
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-300 gap-3">
      {icon}
      <p className="text-xs font-bold uppercase tracking-widest">{text}</p>
    </div>
  );
}
