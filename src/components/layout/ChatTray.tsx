import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  ArrowLeft,
  Loader2,
  CheckCheck,
  Crown,
  ShieldAlert,
  Image as ImageIcon,
  Video,
  Mic,
  Music,
  Edit3,
  Smile,
  Search,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationWithMeta, Message, Profile } from "@/lib/types";

// --- Types ---
interface ChatTrayProps {
  isOpen: boolean;
  onClose: () => void;
}
type TrayView = "list" | "chat";
type InboxTab = "inbox" | "requests";

// --- Helpers ---
function getOtherParticipantId(conv: any, myId: string) {
  return conv.participant_1_id === myId
    ? conv.participant_2_id
    : conv.participant_1_id;
}

const filterPhoneNumbers = (
  text: string,
  isPremium: boolean,
  isFriend: boolean,
) => {
  if (isPremium || isFriend) return text;
  const phoneRegex = /(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}/g;
  return text.replace(
    phoneRegex,
    " [📵 Number Hidden - Add Friend or Get Premium] ",
  );
};

// --- Sub-Components ---
function Avatar({ profile, size = 10 }: { profile: any; size?: number }) {
  const letter = profile?.full_name?.[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0 border-2 border-white/20 shadow-sm`}
    >
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} className="w-full h-full object-cover" />
      ) : (
        letter
      )}
    </div>
  );
}

// --- Chat View (Internal) ---
function ChatView({
  conversation,
  onBack,
}: {
  conversation: ConversationWithMeta;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const initChat = async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      if (p?.subscription_status === "premium") setIsPremium(true);

      const { data } = await supabase
        .from("messages")
        .select("*, profiles(*)")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      setMessages((data as Message[]) ?? []);
      setLoading(false);
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversation.id)
        .neq("sender_id", user.id)
        .is("read_at", null);
    };
    initChat();

    const channel = supabase
      .channel(`chat_${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          if (newMessage.sender_id !== user.id) {
            const { data: prof } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", newMessage.sender_id)
              .single();
            setMessages((prev) => [...prev, { ...newMessage, profiles: prof }]);
          }
        },
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId !== user.id) {
          setIsTyping(payload.typing);
          setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const msgText = text;
    setText("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      receiver_id: getOtherParticipantId(conversation, user.id),
      content: msgText,
      metadata: { type: "text" },
    });
    if (!error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          content: msgText,
          sender_id: user.id,
          created_at: new Date().toISOString(),
        } as any,
      ]);
      await supabase
        .from("conversations")
        .update({
          last_message: msgText,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex items-center gap-3 p-4 border-b bg-blue-600 text-white z-10 shadow-lg">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full">
          <ArrowLeft />
        </button>
        <Avatar profile={conversation.other_profile} size={8} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate uppercase italic tracking-tighter flex items-center gap-1">
            {conversation.other_profile?.full_name}{" "}
            {isPremium && <Crown size={12} className="text-yellow-400" />}
          </p>
          <span className="text-[10px] opacity-70 font-bold uppercase">
            Active
          </span>
        </div>
      </div>

      {!conversation.is_friend && (
        <div className="bg-orange-50 p-2 flex items-center gap-2 border-b border-orange-100">
          <AlertTriangle size={14} className="text-orange-600 shrink-0" />
          <p className="text-[10px] text-orange-800 font-bold uppercase tracking-tight">
            Spam Protection Active: Numbers are hidden until you are friends.
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
        {loading ? (
          <Loader2 className="animate-spin mx-auto text-blue-600 mt-10" />
        ) : (
          messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${msg.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"}`}
              >
                <p className="text-sm font-medium leading-relaxed">
                  {filterPhoneNumbers(
                    msg.content,
                    isPremium,
                    conversation.is_friend || false,
                  )}
                </p>
                <div className="flex justify-end items-center gap-1 mt-1 opacity-50 text-[8px] font-bold uppercase">
                  {formatDistanceToNow(new Date(msg.created_at), {
                    addSuffix: false,
                  })}{" "}
                  {msg.sender_id === user?.id && (
                    <CheckCheck
                      size={10}
                      className={msg.read_at ? "text-green-300" : ""}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="text-[10px] font-black text-blue-500 animate-pulse uppercase tracking-widest italic px-4">
            Typing...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t flex items-center gap-2">
        <input
          className="flex-1 bg-gray-100 px-4 py-3 rounded-2xl outline-none text-sm font-bold shadow-inner"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl active:scale-90 transition-all"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

// --- Main Chat Tray ---
export default function ChatTray({ isOpen, onClose }: ChatTrayProps) {
  const { user } = useAuth();
  const [view, setView] = useState<TrayView>("list");
  const [conversations, setConversations] = useState<ConversationWithMeta[]>(
    [],
  );
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<InboxTab>("inbox");

  const loadConversations = async () => {
    if (!user) return;
    setLoading(true);
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (convs) {
      const enriched = await Promise.all(
        convs.map(async (c) => {
          const otherId = getOtherParticipantId(c, user.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", otherId)
            .single();
          const { count: unread } = await supabase
            .from("messages")
            .select("id", { count: "exact" })
            .eq("conversation_id", c.id)
            .neq("sender_id", user.id)
            .is("read_at", null);
          const { data: f } = await supabase
            .from("friendships")
            .select("status")
            .or(
              `and(requester_id.eq.${user.id},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${user.id})`,
            )
            .maybeSingle();
          return {
            ...c,
            other_profile: profile,
            unread_count: unread || 0,
            is_friend: f?.status === "accepted",
          };
        }),
      );
      setConversations(enriched);
    }
    setLoading(false);
  };

  const handleGlobalSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 3) {
      setSearchResults([]);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("full_name", `%${val}%`)
      .neq("id", user?.id)
      .limit(5);
    setSearchResults(data || []);
  };

  const startNewChat = async (otherProfile: any) => {
    const existing = conversations.find(
      (c) => getOtherParticipantId(c, user?.id!) === otherProfile.id,
    );
    if (existing) {
      setSelectedConvId(existing.id);
      setView("chat");
      return;
    }

    const { data: newConv } = await supabase
      .from("conversations")
      .insert({
        participant_1_id: user?.id,
        participant_2_id: otherProfile.id,
        last_message: "Started a new chat",
      })
      .select()
      .single();
    if (newConv) {
      await loadConversations();
      setSelectedConvId(newConv.id);
      setView("chat");
    }
  };

  useEffect(() => {
    if (isOpen) loadConversations();
  }, [isOpen]);

  const filtered = conversations.filter((c) =>
    activeTab === "inbox" ? c.is_friend : !c.is_friend,
  );
  const activeConversation = conversations.find((c) => c.id === selectedConvId);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed inset-y-0 right-0 w-full sm:w-[400px] z-[999] bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.15)] flex flex-col border-l"
        >
          {view === "list" ? (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="p-8 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                    F-Messenger
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 bg-white/10 rounded-2xl"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-200 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    placeholder="Search friends or people..."
                    className="w-full bg-white/10 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold placeholder:text-blue-200 outline-none focus:bg-white/20 focus:ring-2 focus:ring-white/20 transition-all shadow-inner"
                    value={searchQuery}
                    onChange={(e) => handleGlobalSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mb-6">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-3 px-2">
                      People Found
                    </p>
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => startNewChat(p)}
                        className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-2xl cursor-pointer border border-dashed border-blue-200 mb-2"
                      >
                        <Avatar profile={p} size={10} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black uppercase tracking-tighter text-gray-800 truncate">
                            {p.full_name}
                          </p>
                        </div>
                        <UserPlus size={16} className="text-blue-500" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Inbox Tabs */}
                <div className="flex bg-gray-100 p-1.5 rounded-[1.5rem] mb-4 gap-1 border border-gray-200 shadow-inner">
                  {(["inbox", "requests"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-md scale-100" : "text-gray-400 scale-95 opacity-70"}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Conversation List */}
                {loading ? (
                  <Loader2 className="animate-spin mx-auto mt-10 text-blue-500" />
                ) : (
                  filtered.map((conv) => (
                    <motion.div
                      layout
                      key={conv.id}
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        setView("chat");
                      }}
                      className="p-4 mb-2 flex items-center gap-4 hover:bg-blue-50/50 rounded-[2rem] cursor-pointer border border-transparent hover:border-blue-100 transition-all group"
                    >
                      <Avatar profile={conv.other_profile} size={12} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <p
                            className={`text-sm truncate uppercase tracking-tighter ${conv.unread_count > 0 ? "font-black text-blue-600" : "font-bold text-gray-700"}`}
                          >
                            {conv.other_profile?.full_name}
                          </p>
                          {conv.unread_count > 0 && (
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse shadow-lg" />
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 truncate font-bold italic tracking-tight">
                          {conv.last_message || "Tap to chat"}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          ) : (
            activeConversation && (
              <ChatView
                conversation={activeConversation}
                onBack={() => {
                  setView("list");
                  loadConversations();
                }}
              />
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
