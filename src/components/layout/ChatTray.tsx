import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  ArrowLeft,
  Loader2,
  CheckCheck,
  Smile,
  Bell,
  Trash2,
  UserX,
  ImageIcon,
  Mic,
  StopCircle,
  Play,
  Music,
  MoreVertical,
  Volume2,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- AUDIO SYSTEM ---
const playSound = (type: "send" | "receive" | "notif" | "delete") => {
  const soundLinks = {
    send: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
    receive:
      "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
    notif: "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3",
    delete: "https://www.soundjay.com/buttons/sounds/button-20.mp3",
  };
  const audio = new Audio(soundLinks[type]);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

// --- SMOKE EFFECT COMPONENT ---
const SmokeEffect = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 1 }}
        animate={{
          scale: [0, 2, 4],
          opacity: [1, 0.5, 0],
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
        }}
        transition={{ duration: 0.7 }}
        className="absolute w-6 h-6 bg-gray-300/50 rounded-full blur-xl"
      />
    ))}
  </div>
);

const STICKERS = [
  {
    url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f45e/512.gif",
    label: "Chappal",
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
  const [popup, setPopup] = useState<{ visible: boolean; msg: any }>({
    visible: false,
    msg: null,
  });

  useEffect(() => {
    if (!user || !isOpen) return;
    loadConversations();

    const channel = supabase
      .channel("realtime_notifs")
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
            loadConversations();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOpen, selectedConvId]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from("conversations")
      .select(
        `*, p1:participant_1_id(full_name, avatar_url), p2:participant_2_id(full_name, avatar_url)`,
      )
      .or(`participant_1_id.eq.${user?.id},participant_2_id.eq.${user?.id}`)
      .order("last_message_at", { ascending: false });
    if (data) setConversations(data);
  };

  return (
    <div className="relative">
      {/* POPUP NOTIFICATION */}
      <AnimatePresence>
        {popup.visible && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 20 }}
            exit={{ y: -100 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[5000] w-[90%] max-w-[350px] bg-white p-4 rounded-3xl shadow-2xl border flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setView("chat");
              setSelectedConvId(popup.msg.conversation_id);
            }}
          >
            <div className="bg-blue-600 p-2 rounded-2xl text-white">
              <Bell size={18} />
            </div>
            <div className="flex-1 truncate">
              <p className="text-[10px] font-black text-blue-600 uppercase">
                New Message
              </p>
              <p className="text-sm font-bold text-black truncate">
                {popup.msg?.content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-[4000] bg-[#f8faff] shadow-2xl flex flex-col border-l border-white/20"
          >
            {view === "list" ? (
              <div className="flex flex-col h-full">
                <div className="p-8 bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">
                      Messages
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 bg-white/10 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {conversations.map((c) => {
                    const other = c.participant_1_id === user?.id ? c.p2 : c.p1;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedConvId(c.id);
                          setView("chat");
                        }}
                        className="flex items-center gap-4 p-4 hover:bg-white rounded-[2rem] cursor-pointer mb-2 transition-all shadow-sm bg-white/40"
                      >
                        <img
                          src={other?.avatar_url}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                        />
                        <div className="flex-1 truncate">
                          <p className="text-sm font-black uppercase text-black">
                            {other?.full_name}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate font-medium">
                            {c.last_message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <ChatView
                convId={selectedConvId!}
                onBack={() => {
                  setView("list");
                  loadConversations();
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChatView({ convId, onBack }: { convId: string; onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const channel = supabase
      .channel(`chat_${convId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (p) => {
          if (p.eventType === "INSERT") {
            setMessages((prev) => [...prev, p.new]);
            if (p.new.sender_id !== user?.id) playSound("receive");
          }
          if (p.eventType === "DELETE") {
            setDeletingId(p.old.id);
            playSound("delete");
            setTimeout(() => {
              setMessages((prev) => prev.filter((m) => m.id !== p.old.id));
              setDeletingId(null);
            }, 700);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const handleSend = async (content: string, type: any = "text") => {
    if (!content.trim() || !user) return;
    const { data: conv } = await supabase
      .from("conversations")
      .select("*")
      .eq("id", convId)
      .single();
    const receiverId =
      conv.participant_1_id === user.id
        ? conv.participant_2_id
        : conv.participant_1_id;

    const { error } = await supabase.from("messages").insert({
      conversation_id: convId,
      sender_id: user.id,
      receiver_id: receiverId,
      content,
      type,
    });

    if (!error) {
      setText("");
      playSound("send");
      await supabase
        .from("conversations")
        .update({
          last_message: type === "text" ? content : `Sent a ${type}`,
          last_message_at: new Date(),
        })
        .eq("id", convId);
    }
  };

  const uploadFile = async (file: File, type: "image" | "voice" | "music") => {
    setUploading(true);
    const path = `${type}s/${Date.now()}_${file.name}`;
    const { data } = await supabase.storage
      .from("chat-assets")
      .upload(path, file);
    if (data) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("chat-assets").getPublicUrl(data.path);
      handleSend(publicUrl, type);
    }
    setUploading(false);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/ogg" });
      uploadFile(new File([blob], "voice.ogg"), "voice");
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8faff] relative">
      {/* HEADER */}
      <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={20} />
          </button>
          <p className="font-black text-xs uppercase tracking-widest">
            Active Chat
          </p>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex relative ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            {deletingId === m.id && <SmokeEffect />}
            <div
              onContextMenu={(e) => {
                e.preventDefault();
                if (confirm("Delete for everyone?"))
                  supabase.from("messages").delete().eq("id", m.id);
              }}
              className={`p-4 rounded-[1.8rem] max-w-[80%] shadow-sm ${m.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-black rounded-tl-none"}`}
            >
              {m.type === "text" && (
                <p className="text-[13px] font-bold">{m.content}</p>
              )}
              {m.type === "image" && (
                <img src={m.content} className="w-48 rounded-2xl" />
              )}
              {m.type === "sticker" && (
                <img src={m.content} className="w-20 h-20" />
              )}
              {m.type === "voice" && (
                <button
                  onClick={() => new Audio(m.content).play()}
                  className="flex items-center gap-2"
                >
                  <Play size={16} fill="white" /> Voice Msg
                </button>
              )}
              {m.type === "music" && (
                <button
                  onClick={() => new Audio(m.content).play()}
                  className="flex items-center gap-2 bg-black/10 p-2 rounded-xl"
                >
                  <Music size={16} /> MP3 File
                </button>
              )}
              <p className="text-[8px] mt-1 opacity-50 text-right uppercase">
                {formatDistanceToNow(new Date(m.created_at))} ago
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT PANEL */}
      <div className="p-4 bg-white border-t flex flex-col gap-3">
        <AnimatePresence>
          {showStickers && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              className="flex justify-around bg-gray-50 p-3 rounded-2xl border mb-1"
            >
              {STICKERS.map((s) => (
                <img
                  key={s.label}
                  src={s.url}
                  onClick={() => {
                    handleSend(s.url, "sticker");
                    setShowStickers(false);
                  }}
                  className="w-10 h-10 cursor-pointer hover:scale-110"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <input
            type="file"
            id="chat-img"
            hidden
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && uploadFile(e.target.files[0], "image")
            }
          />
          <input
            type="file"
            id="chat-music"
            hidden
            accept="audio/mp3"
            onChange={(e) =>
              e.target.files?.[0] && uploadFile(e.target.files[0], "music")
            }
          />

          <button
            onClick={() => document.getElementById("chat-img")?.click()}
            className="p-2 text-gray-400 hover:text-blue-600"
          >
            <ImageIcon size={20} />
          </button>
          <button
            onClick={() => document.getElementById("chat-music")?.click()}
            className="p-2 text-gray-400 hover:text-indigo-600"
          >
            <Music size={20} />
          </button>
          <button
            onClick={() => setShowStickers(!showStickers)}
            className="p-2 text-gray-400 hover:text-yellow-500"
          >
            <Smile size={20} />
          </button>

          <input
            className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm font-bold outline-none"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(text)}
          />

          {text.trim() ? (
            <button
              onClick={() => handleSend(text)}
              className="bg-blue-600 p-3 rounded-full text-white"
            >
              <Send size={18} />
            </button>
          ) : (
            <button
              onMouseDown={startRecording}
              onMouseUp={() => mediaRecorder.current?.stop()}
              className={`p-3 rounded-full ${isRecording ? "bg-red-500 animate-pulse text-white" : "bg-gray-100 text-gray-500"}`}
            >
              {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>
          )}
        </div>
      </div>

      {uploading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50">
          <Loader2 className="animate-spin text-blue-600" size={30} />
        </div>
      )}
    </div>
  );
}
