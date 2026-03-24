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
  Edit3, // Pen icon for writing animation
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationWithMeta, Message, Profile } from "@/lib/types";

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

const filterPhoneNumbers = (text: string, isPremium: boolean) => {
  if (isPremium) return text;
  const phoneRegex = /(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}/g;
  return text.replace(phoneRegex, " [📵 Number Hidden - Get Premium ₹49] ");
};

// --- Modern Writing Indicator ---
function WritingIndicator() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-2xl w-fit border border-gray-200 shadow-sm">
      <motion.div
        animate={{ rotate: [0, -20, 0], x: [0, 2, 0] }}
        transition={{ repeat: Infinity, duration: 0.6 }}
        className="text-blue-600"
      >
        <Edit3 size={14} />
      </motion.div>
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        Writing...
      </span>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
            className="w-1 h-1 bg-blue-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function Avatar({
  profile,
  size = 10,
}: {
  profile: Profile | null;
  size?: number;
}) {
  const letter =
    profile?.full_name?.[0]?.toUpperCase() ??
    profile?.username?.[0]?.toUpperCase() ??
    "?";
  return (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0 border-2 border-white/10 shadow-lg`}
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        letter
      )}
    </div>
  );
}

// --- Chat View ---
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    const checkPremium = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      if (data?.subscription_status === "premium") setIsPremium(true);
    };
    checkPremium();

    const fetchMsgs = async () => {
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
    fetchMsgs();

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
          // Auto hide indicator after 3s of no signal
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

  const sendTypingSignal = (isWriting: boolean) => {
    supabase.channel(`chat_${conversation.id}`).send({
      type: "broadcast",
      event: "typing",
      payload: { userId: user?.id, typing: isWriting },
    });
  };

  const handleSend = async (contentStr?: string, type: string = "text") => {
    const finalContent = contentStr || text.trim();
    if (!finalContent || !user) return;

    const otherId = getOtherParticipantId(conversation, user.id);
    if (!contentStr) setText("");
    sendTypingSignal(false);

    const tempMsg = {
      id: Math.random().toString(),
      content: finalContent,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      metadata: { type },
    };
    setMessages((prev) => [...prev, tempMsg as any]);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      receiver_id: otherId,
      content: finalContent,
      metadata: { type },
    });

    if (!error) {
      await supabase
        .from("conversations")
        .update({
          last_message: type === "text" ? finalContent : `Sent a ${type}`,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const type = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
        ? "video"
        : "audio";
    // Logic: In production, upload to Supabase Storage first, then send URL
    handleSend(`[${type}] ${file.name}`, type);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex items-center gap-3 p-4 border-b bg-blue-600 text-white relative z-10">
        <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <Avatar profile={conversation.other_profile} size={8} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate flex items-center gap-1">
            {conversation.other_profile?.full_name || "User"}
            {isPremium && <Crown className="w-3 h-3 text-yellow-400" />}
          </p>
          <span className="text-[10px] opacity-70">Active Now</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto mt-10 text-blue-600" />
        ) : (
          messages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border"}`}
              >
                {/* Render Logic for different types */}
                {msg.metadata?.type === "image" ? (
                  <div className="rounded-lg overflow-hidden mb-1 bg-black/5">
                    <ImageIcon className="opacity-20 m-4" />
                    {msg.content}
                  </div>
                ) : msg.metadata?.type === "video" ? (
                  <div className="flex items-center gap-2 italic opacity-80">
                    <Video size={14} /> {msg.content}
                  </div>
                ) : msg.metadata?.type === "audio" ? (
                  <div className="flex items-center gap-2 italic opacity-80">
                    <Mic size={14} /> Voice Message
                  </div>
                ) : (
                  filterPhoneNumbers(msg.content, isPremium)
                )}

                <div className="flex justify-end items-center gap-1 mt-1 opacity-60 text-[9px]">
                  {formatDistanceToNow(new Date(msg.created_at), {
                    addSuffix: false,
                  })}
                  {msg.sender_id === user?.id && (
                    <CheckCheck className="w-3 h-3" />
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {isTyping && <WritingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t bg-white">
        <input
          type="file"
          hidden
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*,video/*,audio/*"
        />
        <div className="flex items-center gap-4 mb-3 px-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ImageIcon size={18} />
            </div>
            <span className="text-[8px] font-bold text-gray-400">IMG</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Video size={18} />
            </div>
            <span className="text-[8px] font-bold text-gray-400">VIDEO</span>
          </button>
          <button
            onClick={() => alert("Recording voice...")}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-2 bg-red-50 text-red-600 rounded-xl group-hover:bg-red-600 group-hover:text-white transition-all">
              <Mic size={18} />
            </div>
            <span className="text-[8px] font-bold text-gray-400">VOICE</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-600 group-hover:text-white transition-all">
              <Music size={18} />
            </div>
            <span className="text-[8px] font-bold text-gray-400">MP3</span>
          </button>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-2xl border shadow-inner">
          <input
            className="flex-1 bg-transparent px-3 outline-none text-sm font-medium"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              sendTypingSignal(true);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Write something..."
          />
          <button
            onClick={() => handleSend()}
            className="bg-blue-600 p-2.5 rounded-xl text-white active:scale-95 transition-all shadow-md shadow-blue-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Tray ---
export default function ChatTray({ isOpen, onClose }: ChatTrayProps) {
  const { user } = useAuth();
  const [view, setView] = useState<TrayView>("list");
  const [conversations, setConversations] = useState<ConversationWithMeta[]>(
    [],
  );
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
    if (!convs) {
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      convs.map(async (c) => {
        const otherId = getOtherParticipantId(c, user.id);
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", otherId)
          .single();
        const { count } = await supabase
          .from("messages")
          .select("id", { count: "exact" })
          .eq("conversation_id", c.id)
          .neq("sender_id", user.id)
          .is("read_at", null);
        const { data: friendship } = await supabase
          .from("friendships")
          .select("status")
          .or(
            `and(requester_id.eq.${user.id},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${user.id})`,
          )
          .maybeSingle();
        return {
          ...c,
          other_profile: profile,
          unread_count: count || 0,
          is_friend: friendship?.status === "accepted",
        };
      }),
    );
    setConversations(enriched);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadConversations();
      const channel = supabase
        .channel("convos")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "conversations" },
          () => loadConversations(),
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen]);

  const filteredConvs = conversations.filter((c) =>
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
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] z-[300] bg-white shadow-2xl flex flex-col border-l"
        >
          {view === "list" ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b flex justify-between items-center bg-blue-600 text-white">
                <h2 className="text-xl font-black uppercase tracking-tighter italic">
                  F-Messenger
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full"
                >
                  <X />
                </button>
              </div>
              <div className="flex p-2 bg-gray-100 gap-2">
                {(["inbox", "requests"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mt-20 text-blue-500" />
                ) : (
                  filteredConvs.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        setView("chat");
                      }}
                      className="p-4 flex items-center gap-4 hover:bg-blue-50 cursor-pointer border-b transition-colors"
                    >
                      <Avatar profile={conv.other_profile} size={12} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p
                            className={`text-sm truncate ${conv.unread_count > 0 ? "font-black text-black" : "font-semibold text-gray-700"}`}
                          >
                            {conv.other_profile?.full_name || "User"}
                          </p>
                          {conv.last_message_at && (
                            <span className="text-[10px] text-gray-400">
                              {formatDistanceToNow(
                                new Date(conv.last_message_at),
                              )}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs truncate ${conv.unread_count > 0 ? "text-blue-600 font-bold" : "text-gray-400"}`}
                        >
                          {conv.last_message || "Start a conversation"}
                        </p>
                      </div>
                      {conv.unread_count > 0 && (
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
                      )}
                    </div>
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
