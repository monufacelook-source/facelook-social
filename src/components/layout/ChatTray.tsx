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
  Camera,
  Mic,
  Play,
  Pause,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- AUDIO SYSTEM ---
const playSound = (type: "send" | "receive" | "notif" | "delete") => {
  const sounds = {
    send: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
    receive:
      "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
    notif: "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3",
    delete: "https://www.soundjay.com/buttons/sounds/button-20.mp3",
  };
  const audio = new Audio(sounds[type]);
  audio.volume = 0.3;
  audio.play().catch(() => {});
};

// --- VOICE PLAYER COMPONENT ---
const VoicePlayer = ({ url }: { url: string }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(new Audio(url));

  const toggle = () => {
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.onended = () => setPlaying(false);
    return () => {
      audio.pause();
    };
  }, []);

  return (
    <div className="flex items-center gap-3 bg-white/20 p-2 rounded-2xl min-w-[150px]">
      <button
        onClick={toggle}
        className="bg-white text-blue-600 p-2 rounded-full shadow-lg"
      >
        {playing ? (
          <Pause size={14} fill="currentColor" />
        ) : (
          <Play size={14} fill="currentColor" />
        )}
      </button>
      <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: playing ? ["0%", "100%"] : "0%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-1/3 h-full bg-white"
        />
      </div>
    </div>
  );
};

// --- SMOKE/DHUWAN EFFECT ---
const SmokeEffect = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 0.8, x: 0, y: 0 }}
        animate={{
          scale: [1, 2, 2.5],
          opacity: 0,
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute w-8 h-8 bg-gray-300/60 rounded-full blur-xl"
      />
    ))}
  </div>
);

// --- DELETE MODAL ---
const DeleteMenu = ({
  isOpen,
  isOwner,
  onCancel,
  onDeleteMe,
  onDeleteEveryone,
}: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[3000] flex items-end justify-center bg-black/20 backdrop-blur-sm p-4">
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-2xl border border-white/50"
        >
          <p className="text-center font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 mb-6">
            Message Options
          </p>
          <div className="space-y-3">
            <button
              onClick={onDeleteMe}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all font-bold text-gray-700 active:scale-95"
            >
              Delete for me <Trash2 size={18} className="text-gray-400" />
            </button>
            {isOwner && (
              <button
                onClick={onDeleteEveryone}
                className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-2xl transition-all font-bold text-red-600 active:scale-95"
              >
                Delete for everyone <UserX size={18} />
              </button>
            )}
            <button
              onClick={onCancel}
              className="w-full p-4 font-black uppercase text-xs tracking-widest text-gray-400 hover:text-gray-600 transition-colors pt-4"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

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

const GlobalNotification = ({ msg, visible, onClose }: any) => (
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
            {msg?.content?.includes("firebasestorage") ||
            msg?.content?.includes("supabase")
              ? "Sent a file"
              : msg?.content}
          </p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

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

function Avatar({ profile, size = 10 }: { profile: any; size?: number }) {
  const letter = profile?.full_name?.[0]?.toUpperCase() ?? "?";
  return (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-black shrink-0 border-2 border-white/50 shadow-md`}
    >
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} className="w-full h-full object-cover" />
      ) : (
        letter
      )}
    </div>
  );
}

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
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [convStatus, setConvStatus] = useState(conversation.status || "normal");
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => {
              if (prev.find((m) => m.id === payload.new.id)) return prev;
              if (payload.new.sender_id !== user?.id) playSound("receive");
              return [...prev, payload.new];
            });
          } else if (payload.eventType === "DELETE") {
            playSound("delete");
            setDeletingId(payload.old.id);
            setTimeout(() => {
              setMessages((prev) =>
                prev.filter((m) => m.id !== payload.old.id),
              );
              setDeletingId(null);
            }, 600);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
          filter: `id=eq.${conversation.id}`,
        },
        (p) => {
          setConvStatus(p.new.status);
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
    if (!content.startsWith("http")) setText("");
    playSound("send");

    const isSpamReplying =
      convStatus === "spam" && conversation.last_sender_id !== user.id;
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      receiver_id:
        conversation.participant_1_id === user.id
          ? conversation.participant_2_id
          : conversation.participant_1_id,
      content,
    });

    if (!error) {
      setShowStickers(false);
      const updateObj: any = {
        last_message: content.startsWith("http")
          ? content.match(/\.(png|jpg|jpeg|gif|webp)$/i)
            ? "Sent an image"
            : "Sent a vibe"
          : content,
        last_message_at: new Date().toISOString(),
        last_sender_id: user.id,
      };
      if (isSpamReplying) updateObj.status = "normal";
      await supabase
        .from("conversations")
        .update(updateObj)
        .eq("id", conversation.id);
    }
  };

  // --- IMAGE UPLOAD SYSTEM ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `chat/${conversation.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-attachments")
      .upload(filePath, file);
    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-attachments").getPublicUrl(filePath);
      handleSend(publicUrl);
    }
  };

  // --- VOICE MESSAGE SYSTEM ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const fileName = `${Math.random()}.webm`;
        const filePath = `chat/${conversation.id}/${fileName}`;
        const { error } = await supabase.storage
          .from("chat-attachments")
          .upload(filePath, blob);
        if (!error) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("chat-attachments").getPublicUrl(filePath);
          handleSend(publicUrl);
        }
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const deleteForMe = (msgId: string) => {
    playSound("delete");
    setDeletingId(msgId);
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      setSelectedMsg(null);
      setDeletingId(null);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8faff]">
      <DeleteMenu
        isOpen={!!selectedMsg}
        isOwner={selectedMsg?.sender_id === user?.id}
        onCancel={() => setSelectedMsg(null)}
        onDeleteMe={() => deleteForMe(selectedMsg.id)}
        onDeleteEveryone={async () => {
          await supabase.from("messages").delete().eq("id", selectedMsg.id);
          setSelectedMsg(null);
        }}
      />

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
            {convStatus === "spam" ? (
              <span className="text-[9px] font-black text-orange-500 uppercase flex items-center gap-1 animate-pulse">
                <ShieldAlert size={10} /> Pending Approval
              </span>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-gray-400 uppercase">
                  Live Vibe
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {convStatus === "spam" && conversation.last_sender_id !== user?.id && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-[2.5rem] text-center mb-6 shadow-sm">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
              New Connection Request
            </p>
            <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
              This person is not in your chat list. Reply to start a normal
              conversation.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center mt-20 gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                onClick={() => setSelectedMsg(msg)}
                className={`flex cursor-pointer relative ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                {deletingId === msg.id && <SmokeEffect />}

                {msg.content.startsWith("http") ? (
                  msg.content.match(/\.(webm|mp3|wav|ogg)$/i) ? (
                    <div
                      className={`p-3 rounded-[1.8rem] ${msg.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"}`}
                    >
                      <VoicePlayer url={msg.content} />
                    </div>
                  ) : (
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      src={msg.content}
                      className="w-48 h-auto max-h-64 rounded-3xl object-cover my-2 drop-shadow-lg border-4 border-white shadow-xl"
                    />
                  )
                ) : (
                  <div
                    className={`max-w-[80%] p-4 rounded-[1.8rem] shadow-sm relative ${msg.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none shadow-blue-200" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"}`}
                  >
                    <p className="text-[13px] font-semibold leading-relaxed">
                      {msg.content}
                    </p>
                    <div className="flex items-center gap-1 mt-1 opacity-40 text-[8px] font-black justify-end uppercase">
                      {formatDistanceToNow(new Date(msg.created_at), {
                        addSuffix: false,
                      })}
                      {msg.sender_id === user?.id &&
                        (convStatus === "spam" ? (
                          <Check size={10} />
                        ) : (
                          <CheckCheck size={10} />
                        ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white/60 backdrop-blur-2xl border-t border-white/20 relative">
        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
        />

        <AnimatePresence>
          {showStickers && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: -90, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute left-4 right-4 bg-white/90 backdrop-blur-3xl p-4 rounded-[2.5rem] shadow-2xl flex justify-between items-center border border-white/50 z-50"
            >
              {FUNNY_STICKERS.map((s) => (
                <motion.img
                  key={s.label}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.8 }}
                  src={s.url}
                  onClick={() => handleSend(s.url)}
                  className="w-12 h-12 cursor-pointer transition-transform"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 bg-white rounded-full p-1.5 shadow-xl border border-gray-100">
          <button
            onClick={() => setShowStickers(!showStickers)}
            className={`p-2 ml-1 rounded-full transition-all ${showStickers ? "bg-blue-100 text-blue-600" : "text-gray-400"}`}
          >
            <Smile size={22} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-blue-500"
          >
            <Camera size={22} />
          </button>

          <input
            className="flex-1 bg-transparent px-2 py-2.5 outline-none text-sm font-bold text-gray-700 placeholder:text-gray-300"
            value={text}
            placeholder={
              isRecording ? "Recording vibe..." : "Type your vibe..."
            }
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
            onKeyDown={(e) => e.key === "Enter" && handleSend(text)}
          />

          {text.trim() ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSend(text)}
              className="bg-blue-600 p-3 rounded-full text-white shadow-lg shadow-blue-200"
            >
              <Send size={18} />
            </motion.button>
          ) : (
            <motion.button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              animate={
                isRecording
                  ? { scale: [1, 1.2, 1], backgroundColor: "#ef4444" }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1 }}
              className={`p-3 rounded-full text-white shadow-lg ${isRecording ? "bg-red-500" : "bg-indigo-600 shadow-indigo-200"}`}
            >
              <Mic size={18} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [popup, setPopup] = useState<{ visible: boolean; msg: any }>({
    visible: false,
    msg: null,
  });

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
          return { ...c, other_profile: prof };
        }),
      );
      setConversations(enriched);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadAll();
    const globalChannel = supabase
      .channel("global_updates")
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
            setPopup({ visible: true, msg: payload.new });
            setTimeout(() => setPopup({ visible: false, msg: null }), 5000);
            loadAll();
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [user, selectedConvId]);

  useEffect(() => {
    if (isOpen) loadAll();
  }, [isOpen]);

  const handleUserSearch = async (val: string) => {
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

  const openConversation = async (profile: any) => {
    let existing = conversations.find(
      (c) => c.other_profile?.id === profile.id,
    );
    if (existing) {
      setSelectedConvId(existing.id);
      setView("chat");
    } else {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          participant_1_id: user?.id,
          participant_2_id: profile.id,
          status: "spam",
          last_sender_id: user?.id,
        })
        .select()
        .single();
      if (!error) {
        await loadAll();
        setSelectedConvId(data.id);
        setView("chat");
      }
    }
  };

  const activeConv = conversations.find((c) => c.id === selectedConvId);

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
                <div className="p-8 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 text-white shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/20 rounded-xl shadow-inner">
                        <MessageSquare size={24} />
                      </div>
                      <h2 className="text-3xl font-black italic tracking-tighter uppercase">
                        Vibe-Chat
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
                      className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-white/30 outline-none focus:bg-white/20 transition-all"
                      placeholder="Search vibes..."
                      value={searchQuery}
                      onChange={(e) => handleUserSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => openConversation(p)}
                      className="flex items-center gap-4 p-4 hover:bg-blue-50 rounded-[2rem] cursor-pointer border border-dashed border-blue-200 mb-2 transition-all"
                    >
                      <Avatar profile={p} size={10} />
                      <p className="font-black text-sm uppercase text-gray-700">
                        {p.full_name}
                      </p>
                      <UserPlus size={16} className="ml-auto text-blue-500" />
                    </div>
                  ))}

                  {conversations.some(
                    (c) => c.status === "spam" && c.last_sender_id !== user?.id,
                  ) && (
                    <div className="mb-8">
                      <p className="text-[10px] font-black uppercase text-orange-400 tracking-[0.2em] mb-4 px-2 flex items-center gap-2">
                        <ShieldAlert size={12} /> Unknown Requests
                      </p>
                      {conversations
                        .filter(
                          (c) =>
                            c.status === "spam" &&
                            c.last_sender_id !== user?.id,
                        )
                        .map((conv) => (
                          <motion.div
                            key={conv.id}
                            whileHover={{ x: 5 }}
                            onClick={() => {
                              setSelectedConvId(conv.id);
                              setView("chat");
                            }}
                            className="flex items-center gap-4 p-4 bg-orange-50/40 hover:bg-orange-100/50 rounded-[2.5rem] cursor-pointer transition-all border border-orange-100 mb-2"
                          >
                            <Avatar profile={conv.other_profile} size={14} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black uppercase text-gray-800 truncate">
                                {conv.other_profile?.full_name}
                              </p>
                              <p className="text-[10px] text-orange-500 font-bold uppercase mt-1">
                                Sent a vibe request...
                              </p>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  )}

                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4 px-2">
                    Recent Vibers
                  </p>
                  {conversations
                    .filter(
                      (c) =>
                        c.status !== "spam" || c.last_sender_id === user?.id,
                    )
                    .map((conv) => (
                      <motion.div
                        whileHover={{
                          x: 5,
                          backgroundColor: "white",
                          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.05)",
                        }}
                        key={conv.id}
                        onClick={() => {
                          setSelectedConvId(conv.id);
                          setView("chat");
                        }}
                        className="flex items-center gap-4 p-4 rounded-[2.5rem] cursor-pointer transition-all border border-transparent mb-2 group"
                      >
                        <Avatar profile={conv.other_profile} size={14} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-black uppercase text-gray-800 truncate">
                              {conv.other_profile?.full_name}
                            </p>
                            <span className="text-[8px] font-bold text-gray-300">
                              {conv.last_message_at
                                ? formatDistanceToNow(
                                    new Date(conv.last_message_at),
                                    { addSuffix: false },
                                  )
                                : "NEW"}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 truncate mt-0.5 group-hover:text-blue-500 transition-colors">
                            {conv.last_message || "Start the vibe..."}
                          </p>
                        </div>
                      </motion.div>
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
    </>
  );
}
