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
  Trash2,
  UserX,
  ShieldAlert,
  Check,
  Image as ImageIcon,
  Mic,
  StopCircle,
  Play,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- AUDIO HELPERS ---
const playSound = (type: "send" | "receive" | "notif") => {
  const audio = new Audio(`/${type}.mp3`);
  audio.play().catch(() => {}); // Browser policy bypass
};

// --- COMPONENTS ---
const SmokeEffect = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{
          scale: 2.5,
          opacity: 0,
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
        }}
        transition={{ duration: 0.6 }}
        className="absolute w-8 h-8 bg-gray-300/60 rounded-full blur-xl"
      />
    ))}
  </div>
);

const TypingIndicator = () => (
  <div className="flex gap-1.5 px-4 py-3 bg-white/50 backdrop-blur-md w-fit rounded-2xl rounded-bl-none border border-white/20 mb-4 shadow-sm">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        className="w-1.5 h-1.5 bg-blue-500 rounded-full"
      />
    ))}
  </div>
);

// --- MAIN CHAT TRAY ---
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  // Sound & Badge Logic
  useEffect(() => {
    if (!user) return;
    loadAll();

    const globalChannel = supabase
      .channel("global_chat")
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
            playSound("notif");
            loadAll(); // Update list & badges
          } else {
            playSound("receive");
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [user, selectedConvId]);

  const loadAll = async () => {
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
          // Calculate unread per conversation (Example logic)
          return {
            ...c,
            other_profile: prof,
            unread: c.last_sender_id !== user.id && c.status === "spam" ? 1 : 0,
          };
        }),
      );
      setConversations(enriched);
      setTotalUnread(
        enriched.reduce((acc, curr) => acc + (curr.unread || 0), 0),
      );
    }
  };

  const activeConv = conversations.find((c) => c.id === selectedConvId);

  return (
    <div className="relative">
      {/* External Badge (Inbox ke bahar count) */}
      {!isOpen && totalUnread > 0 && (
        <div className="fixed bottom-20 right-6 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-full animate-bounce shadow-lg z-[999]">
          {totalUnread} New Vibes
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-[1000] bg-white/90 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-white/30"
          >
            {view === "list" ? (
              <div className="flex flex-col h-full">
                {/* Header Updated Name */}
                <div className="p-8 bg-gradient-to-br from-blue-700 to-indigo-900 text-white">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black italic tracking-tighter">
                      VIBE-CHAT
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 bg-white/10 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <input
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-sm font-bold outline-none"
                    placeholder="Search vibes..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length > 1) {
                        supabase
                          .from("profiles")
                          .select("*")
                          .ilike("full_name", `%${e.target.value}%`)
                          .neq("id", user?.id)
                          .then(({ data }) => setSearchResults(data || []));
                      }
                    }}
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {/* Results & List */}
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConvId(conv.id);
                        setView("chat");
                      }}
                      className="flex items-center gap-4 p-4 hover:bg-white rounded-[2.5rem] cursor-pointer mb-2 transition-all relative"
                    >
                      <Avatar profile={conv.other_profile} />
                      <div className="flex-1">
                        <p className="text-sm font-black uppercase text-gray-800">
                          {conv.other_profile?.full_name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {conv.last_message}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-black">
                          !
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              activeConv && (
                <ChatView
                  conversation={activeConv}
                  onBack={() => {
                    setView("list");
                    loadAll();
                  }}
                />
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- INTERNAL CHAT VIEW ---
function ChatView({ conversation, onBack }: any) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    const sub = supabase
      .channel(`chat_${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (p) => {
          setMessages((prev) => [...prev, p.new]);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(sub);
    };
  }, [conversation.id]);

  const handleSend = async (
    content: string,
    type: "text" | "image" | "voice" = "text",
  ) => {
    if (!content.trim() || !user) return;
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      receiver_id:
        conversation.participant_1_id === user.id
          ? conversation.participant_2_id
          : conversation.participant_1_id,
      content,
      type,
    });
    if (!error) {
      playSound("send");
      setText("");
      await supabase
        .from("conversations")
        .update({
          last_message: type === "text" ? content : `Sent a ${type}`,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);
    }
  };

  const uploadFile = async (file: File, folder: "images" | "voice") => {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("chat-assets")
      .upload(`${folder}/${fileName}`, file);
    if (data) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-assets").getPublicUrl(data.path);
      handleSend(publicUrl, folder === "images" ? "image" : "voice");
    }
    setUploading(false);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (e) =>
      audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(audioChunks.current, {
        type: "audio/ogg; codecs=opus",
      });
      const file = new File([blob], "voice.ogg", { type: "audio/ogg" });
      uploadFile(file, "voice");
      audioChunks.current = [];
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8faff]">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b bg-white/50 backdrop-blur-md">
        <button onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <Avatar profile={conversation.other_profile} />
        <p className="font-black text-xs uppercase tracking-widest">
          {conversation.other_profile?.full_name}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-4 rounded-[1.8rem] max-w-[80%] shadow-sm ${m.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none"}`}
            >
              {m.type === "image" && (
                <img src={m.content} className="w-48 rounded-2xl mb-2" />
              )}
              {m.type === "voice" && (
                <div className="flex items-center gap-2">
                  <Play
                    size={16}
                    onClick={() => new Audio(m.content).play()}
                    className="cursor-pointer"
                  />
                  <div className="h-1 w-24 bg-current/20 rounded-full" />
                </div>
              )}
              {m.type === "text" && (
                <p className="text-sm font-semibold">{m.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white/80 border-t flex items-center gap-2">
        <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-all">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && uploadFile(e.target.files[0], "images")
            }
          />
          <ImageIcon size={20} className="text-gray-400" />
        </label>

        <input
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm font-bold outline-none"
          placeholder="Vibe..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(text)}
        />

        {text.length === 0 ? (
          <button
            onClick={
              isRecording
                ? () => {
                    mediaRecorder.current?.stop();
                    setIsRecording(false);
                  }
                : startRecording
            }
            className={`p-3 rounded-full ${isRecording ? "bg-red-500 animate-pulse" : "bg-gray-100 text-gray-500"}`}
          >
            {isRecording ? (
              <StopCircle size={20} className="text-white" />
            ) : (
              <Mic size={20} />
            )}
          </button>
        ) : (
          <button
            onClick={() => handleSend(text)}
            className="bg-blue-600 p-3 rounded-full text-white shadow-lg"
          >
            <Send size={18} />
          </button>
        )}
      </div>
      {uploading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-[2000]">
          <Loader2 className="animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}

function Avatar({ profile }: any) {
  return (
    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-sm overflow-hidden">
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} className="w-full h-full object-cover" />
      ) : (
        profile?.full_name?.[0]
      )}
    </div>
  );
}
