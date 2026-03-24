import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  ArrowLeft,
  Loader2,
  CheckCheck,
  Search,
  UserPlus,
  MessageSquare,
  Smile,
  Bell,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- CUSTOM STICKERS (Chappal, Gaddha, etc.) ---
const FUNNY_STICKERS = [
  {
    url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f45e/512.gif",
    label: "Chappal",
  },
  {
    url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f573_fe0f/512.gif",
    label: "Gaddha",
  },
  {
    url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f3ca/512.gif",
    label: "Dub Mro",
  },
  {
    url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.gif",
    label: "LOL",
  },
  {
    url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif",
    label: "Fire",
  },
  {
    url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4af/512.gif",
    label: "100",
  },
];

// --- POP-UP NOTIFICATION COMPONENT ---
const GlobalNotification = ({
  msg,
  visible,
  onClose,
}: {
  msg: any;
  visible: boolean;
  onClose: () => void;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 20, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        onClick={onClose}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-[350px] bg-white/80 backdrop-blur-2xl border border-white/40 p-4 rounded-[2rem] shadow-2xl flex items-center gap-4 cursor-pointer"
      >
        <div className="bg-blue-600 p-2 rounded-2xl text-white shadow-lg">
          <Bell size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
            New Vibe
          </p>
          <p className="text-sm font-bold text-gray-800 truncate">
            {msg.content.startsWith("http") ? "Sent a Sticker" : msg.content}
          </p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- TYPING INDICATOR ---
const TypingIndicator = () => (
  <div className="flex gap-1.5 px-4 py-3 bg-white/50 backdrop-blur-md w-fit rounded-2xl rounded-bl-none border border-white/20 mb-4 shadow-sm">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        className="w-2 h-2 bg-blue-500 rounded-full"
      />
    ))}
  </div>
);

// --- AVATAR ---
function Avatar({ profile, size = 10 }: { profile: any; size?: number }) {
  const letter = profile?.full_name?.[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0 border-2 border-white/50 shadow-md`}
    >
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} className="w-full h-full object-cover" />
      ) : (
        letter
      )}
    </div>
  );
}

// --- CHAT WINDOW COMPONENT ---
function ChatView({
  conversation,
  onBack,
}: {
  conversation: any;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const initChat = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      setMessages(data || []);
      setLoading(false);
    };
    initChat();

    const channel = supabase
      .channel(`chat_room_${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.find((m) => m.id === payload.new.id)
              ? prev
              : [...prev, payload.new],
          );
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

  const handleSend = async (content: string) => {
    if (!content.trim() || !user) return;
    const msgToHide = content;
    if (!content.startsWith("http")) setText(""); // Clear text only if not sticker

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      receiver_id:
        conversation.participant_1_id === user.id
          ? conversation.participant_2_id
          : conversation.participant_1_id,
      content: msgToHide,
    });

    if (!error) {
      setShowStickers(false);
      await supabase
        .from("conversations")
        .update({
          last_message: content.startsWith("http") ? "Sent a sticker" : content,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8faff]">
      <div className="flex items-center gap-3 p-4 bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-30 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full active:scale-90"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar profile={conversation.other_profile} size={10} />
        <div className="flex-1">
          <p className="font-black text-sm uppercase italic tracking-tighter text-gray-800">
            {conversation.other_profile?.full_name}
          </p>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-gray-400 uppercase">
              Live Vibe
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center mt-20 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              {msg.content.startsWith("http") ? (
                <motion.img
                  whileHover={{ scale: 1.2 }}
                  src={msg.content}
                  className="w-28 h-28 object-contain my-2"
                />
              ) : (
                <div
                  className={`max-w-[80%] p-4 rounded-[1.8rem] shadow-sm ${msg.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"}`}
                >
                  <p className="text-[13px] font-semibold leading-relaxed">
                    {msg.content}
                  </p>
                  <div className="flex items-center gap-1 mt-1 opacity-40 text-[8px] font-black justify-end">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: false,
                    })}
                    {msg.sender_id === user?.id && <CheckCheck size={10} />}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white/60 backdrop-blur-2xl border-t border-white/20 relative">
        <AnimatePresence>
          {showStickers && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: -90, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute left-4 right-4 bg-white/90 backdrop-blur-2xl p-4 rounded-[2.5rem] shadow-2xl flex justify-between items-center border border-white/50"
            >
              {FUNNY_STICKERS.map((s) => (
                <img
                  key={s.label}
                  src={s.url}
                  onClick={() => handleSend(s.url)}
                  className="w-12 h-12 cursor-pointer hover:scale-125 transition-transform active:rotate-12"
                  title={s.label}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 bg-white rounded-full p-1.5 shadow-xl border border-gray-100">
          <button
            onClick={() => setShowStickers(!showStickers)}
            className={`p-2 ml-2 rounded-full transition-colors ${showStickers ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
          >
            <Smile size={24} />
          </button>
          <input
            className="flex-1 bg-transparent px-3 py-2.5 outline-none text-sm font-bold text-gray-700"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              supabase
                .channel(`chat_room_${conversation.id}`)
                .send({
                  type: "broadcast",
                  event: "typing",
                  payload: { userId: user?.id, typing: true },
                });
            }}
            placeholder="Type your vibe..."
            onKeyDown={(e) => e.key === "Enter" && handleSend(text)}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend(text)}
            className="bg-blue-600 p-3 rounded-full text-white shadow-lg"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN TRAY ---
export default function ChatTray({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "chat">("list");
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [popup, setPopup] = useState<{ visible: boolean; msg: any }>({
    visible: false,
    msg: null,
  });

  const loadAllData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });
    if (data) {
      const enriched = await Promise.all(
        data.map(async (c) => {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq(
              "id",
              c.participant_1_id === user.id
                ? c.participant_2_id
                : c.participant_1_id,
            )
            .single();
          return { ...c, other_profile: prof };
        }),
      );
      setConversations(enriched);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadAllData();
    // NOTIFICATION LISTENER
    const globalChannel = supabase
      .channel("global_notifs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (selectedConvId !== payload.new.conversation_id) {
            setPopup({ visible: true, msg: payload.new });
            setTimeout(() => setPopup({ visible: false, msg: null }), 5000);
            loadAllData();
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [user, selectedConvId]);

  useEffect(() => {
    if (isOpen) loadAllData();
  }, [isOpen]);

  const handleGlobalSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
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

  const activeConversation = conversations.find((c) => c.id === selectedConvId);

  return (
    <>
      <GlobalNotification
        visible={popup.visible}
        msg={popup.msg}
        onClose={() => setPopup({ visible: false, msg: null })}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-[1000] bg-white/80 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-white/30"
          >
            {view === "list" ? (
              <div className="flex flex-col h-full">
                <div className="p-8 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 text-white shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/20 rounded-xl">
                        <MessageSquare size={24} />
                      </div>
                      <h2 className="text-3xl font-black italic tracking-tighter">
                        VIBE-CHAT
                      </h2>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                      size={16}
                    />
                    <input
                      className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold placeholder:text-white/30 outline-none focus:bg-white/20"
                      placeholder="Find someone new..."
                      value={searchQuery}
                      onChange={(e) => handleGlobalSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSelectedConvId(p.id);
                        setView("chat");
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-blue-50/50 rounded-[2rem] cursor-pointer border border-dashed border-blue-200 mb-2"
                    >
                      <Avatar profile={p} size={10} />
                      <p className="font-black text-sm uppercase text-gray-700">
                        {p.full_name}
                      </p>
                      <UserPlus size={16} className="ml-auto text-blue-500" />
                    </div>
                  ))}
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4 px-2">
                    Recent Chats
                  </p>
                  {conversations.map((conv) => (
                    <motion.div
                      whileHover={{ x: 5 }}
                      key={conv.id}
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        setView("chat");
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-white hover:shadow-xl rounded-[2.5rem] cursor-pointer transition-all border border-transparent mb-2 group"
                    >
                      <Avatar profile={conv.other_profile} size={14} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-black uppercase text-gray-800 truncate">
                            {conv.other_profile?.full_name}
                          </p>
                          <span className="text-[8px] font-bold text-gray-300">
                            NOW
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5 group-hover:text-blue-500">
                          {conv.last_message || "Start the conversation..."}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              activeConversation && (
                <ChatView
                  conversation={activeConversation}
                  onBack={() => {
                    setView("list");
                    loadAllData();
                  }}
                />
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
