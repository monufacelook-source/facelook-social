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
  Paperclip,
  MoreVertical,
  Pause,
  Volume2,
  Ghost,
  Trash,
  SmilePlus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- AUDIO ASSETS ---
const playSound = (type: "send" | "receive" | "notif" | "delete") => {
  const soundLinks = {
    send: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
    receive:
      "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
    notif: "https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3",
    delete: "https://www.soundjay.com/buttons/sounds/button-20.mp3",
  };
  const audio = new Audio(soundLinks[type]);
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

// --- REAL-TIME SMOKE ANIMATION ---
const SmokeEffect = () => (
  <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
    {[...Array(18)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
        animate={{
          scale: [0, 2.5, 5],
          opacity: [1, 0.4, 0],
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200,
        }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute w-10 h-10 bg-gray-300/40 rounded-full blur-2xl"
      />
    ))}
  </motion.div>
);

const FUNNY_STICKERS = [
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
  {
    url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f44a/512.gif",
    label: "Punch",
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
    loadConvs();

    const channel = supabase
      .channel("global_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (p) => {
          if (selectedConvId !== p.new.conversation_id) {
            playSound("notif");
            setPopup({ visible: true, msg: p.new });
            setTimeout(() => setPopup({ visible: false, msg: null }), 5000);
            loadConvs();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOpen, selectedConvId]);

  const loadConvs = async () => {
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
      <AnimatePresence>
        {popup.visible && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 20 }}
            exit={{ y: -100 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[5000] w-[90%] max-w-[380px] bg-white/95 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-2xl border border-blue-50 flex items-center gap-4 cursor-pointer"
            onClick={() => {
              setSelectedConvId(popup.msg.conversation_id);
              setView("chat");
              setPopup({ visible: false, msg: null });
            }}
          >
            <div className="bg-blue-600 p-3 rounded-full text-white shadow-lg">
              <Bell size={20} />
            </div>
            <div className="flex-1 truncate">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                New Alert
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
            className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-[4000] bg-[#f0f4f9] shadow-2xl flex flex-col"
          >
            {view === "list" ? (
              <div className="flex flex-col h-full">
                <div className="p-8 bg-white border-b flex justify-between items-center">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase text-blue-600">
                    Vibe
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-3 bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                  {conversations.map((c) => {
                    const other = c.participant_1_id === user?.id ? c.p2 : c.p1;
                    return (
                      <motion.div
                        key={c.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedConvId(c.id);
                          setView("chat");
                        }}
                        className="flex items-center gap-4 p-5 bg-white rounded-[2.8rem] cursor-pointer shadow-sm hover:shadow-md transition-all"
                      >
                        <img
                          src={other?.avatar_url}
                          className="w-14 h-14 rounded-full border-2 border-blue-50 object-cover"
                        />
                        <div className="flex-1 truncate">
                          <p className="font-black text-black text-sm uppercase">
                            {other?.full_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate font-medium">
                            {c.last_message}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <ChatView
                convId={selectedConvId!}
                onBack={() => {
                  setView("list");
                  loadConvs();
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
  const [showTools, setShowTools] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioChunks = useRef<Blob[]>([]);

  useEffect(() => {
    loadMsgs();
    const channel = supabase
      .channel(`room_${convId}`)
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
            }, 1000);
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

  const loadMsgs = async () => {
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
      setShowTools(false);
      await supabase
        .from("conversations")
        .update({
          last_message: type === "text" ? content : `Sent a ${type}`,
          last_message_at: new Date(),
        })
        .eq("id", convId);
    }
  };

  const uploadAndSend = async (
    file: File,
    type: "image" | "voice" | "music",
  ) => {
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

  const startRecord = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];
    mediaRecorder.current.ondataavailable = (e) =>
      audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: "audio/ogg" });
      uploadAndSend(new File([blob], "voice.ogg"), "voice");
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  const stopRecord = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const deleteMsg = async (id: string, everyone: boolean) => {
    if (everyone) {
      await supabase.from("messages").delete().eq("id", id);
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
    setSelectedMsg(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8faff] relative overflow-hidden">
      {/* DELETE MENU MODAL */}
      <AnimatePresence>
        {selectedMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[500] bg-black/40 backdrop-blur-sm flex items-end justify-center p-6"
            onClick={() => setSelectedMsg(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="w-full max-w-sm bg-white rounded-[2.5rem] p-6 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-center font-black uppercase text-[10px] text-gray-400 mb-4">
                Message Action
              </p>
              <button
                onClick={() => deleteMsg(selectedMsg.id, false)}
                className="w-full p-4 bg-gray-50 rounded-2xl flex justify-between items-center font-bold text-black"
              >
                Delete for me <Trash size={18} />
              </button>
              {selectedMsg.sender_id === user?.id && (
                <button
                  onClick={() => deleteMsg(selectedMsg.id, true)}
                  className="w-full p-4 bg-red-50 text-red-600 rounded-2xl flex justify-between items-center font-bold"
                >
                  Delete for Everyone <UserX size={18} />
                </button>
              )}
              <button
                onClick={() => setSelectedMsg(null)}
                className="w-full p-3 font-bold text-gray-400"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER */}
      <div className="p-4 border-b bg-white flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">
            V
          </div>
          <div>
            <p className="font-black text-xs uppercase tracking-widest text-black">
              Active Chat
            </p>
            <p className="text-[9px] text-green-500 font-bold uppercase animate-pulse">
              Online
            </p>
          </div>
        </div>
        <button className="p-2 text-gray-400">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
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
              onClick={() => setSelectedMsg(m)}
              className={`p-5 rounded-[2.2rem] max-w-[85%] shadow-sm relative group cursor-pointer transition-all hover:scale-[1.02] ${m.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100" : "bg-white text-black rounded-tl-none border border-gray-100"}`}
            >
              {m.type === "text" && (
                <p className="text-[14px] font-bold leading-relaxed">
                  {m.content}
                </p>
              )}
              {m.type === "image" && (
                <img src={m.content} className="w-64 rounded-3xl" />
              )}
              {m.type === "sticker" && (
                <img src={m.content} className="w-24 h-24" />
              )}
              {m.type === "voice" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    new Audio(m.content).play();
                  }}
                  className="flex items-center gap-3 p-1"
                >
                  <div className="bg-white/20 p-2 rounded-full">
                    <Play size={18} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase">
                      Voice Note
                    </span>
                    <div className="h-1 w-24 bg-current/20 rounded-full mt-1" />
                  </div>
                </button>
              )}
              {m.type === "music" && (
                <div className="flex items-center gap-4 bg-black/5 p-4 rounded-[1.5rem] border border-black/5">
                  <div className="bg-blue-600 p-3 rounded-2xl text-white animate-bounce">
                    <Music size={20} />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      new Audio(m.content).play();
                    }}
                    className="flex flex-col"
                  >
                    <span className="text-[11px] font-black uppercase">
                      Music Player
                    </span>
                    <span className="text-[9px] opacity-60">
                      Click to Play MP3
                    </span>
                  </button>
                </div>
              )}
              <div className="flex items-center justify-end gap-1 mt-2 opacity-50 text-[8px] font-black uppercase">
                {formatDistanceToNow(new Date(m.created_at))} ago
                {m.sender_id === user?.id && <CheckCheck size={10} />}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* INPUT TOOLS */}
      <div className="p-6 bg-white border-t space-y-4">
        <AnimatePresence>
          {showTools && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="grid grid-cols-4 gap-4 bg-gray-50 p-5 rounded-[2.5rem] border border-gray-100"
            >
              <label className="flex flex-col items-center gap-2 cursor-pointer group">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    uploadAndSend(e.target.files[0], "image")
                  }
                />
                <div className="p-4 bg-blue-100 text-blue-600 rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ImageIcon size={22} />
                </div>
                <span className="text-[9px] font-black uppercase">Photos</span>
              </label>
              <label className="flex flex-col items-center gap-2 cursor-pointer group">
                <input
                  type="file"
                  hidden
                  accept="audio/mp3"
                  onChange={(e) =>
                    e.target.files?.[0] &&
                    uploadAndSend(e.target.files[0], "music")
                  }
                />
                <div className="p-4 bg-purple-100 text-purple-600 rounded-3xl group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Music size={22} />
                </div>
                <span className="text-[9px] font-black uppercase">Music</span>
              </label>
              {FUNNY_STICKERS.slice(0, 2).map((s) => (
                <div
                  key={s.label}
                  onClick={() => handleSend(s.url, "sticker")}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div className="p-2 bg-yellow-50 rounded-3xl group-hover:scale-110 transition-all">
                    <img src={s.url} className="w-10 h-10" />
                  </div>
                  <span className="text-[9px] font-black uppercase">
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTools(!showTools)}
            className={`p-4 rounded-full transition-all ${showTools ? "bg-blue-600 text-white rotate-45" : "bg-gray-100 text-gray-400"}`}
          >
            <Paperclip size={22} />
          </button>

          <div className="flex-1 bg-gray-100 rounded-[2rem] px-6 py-4 flex items-center gap-3">
            <Smile size={20} className="text-gray-400" />
            <input
              className="flex-1 bg-transparent outline-none font-bold text-sm text-black placeholder:text-gray-300"
              placeholder="Kuch naya likho..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(text)}
            />
          </div>

          {text.trim() || isRecording ? (
            <button
              onClick={() => (isRecording ? stopRecord() : handleSend(text))}
              className={`${isRecording ? "bg-red-500 animate-pulse" : "bg-blue-600"} p-5 rounded-full text-white shadow-xl shadow-blue-200 transition-all active:scale-90`}
            >
              {isRecording ? <StopCircle size={22} /> : <Send size={22} />}
            </button>
          ) : (
            <button
              onMouseDown={startRecord}
              onMouseUp={stopRecord}
              onTouchStart={startRecord}
              onTouchEnd={stopRecord}
              className="p-5 bg-gray-100 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-all"
            >
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>

      {uploading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-[1000] flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <Loader2 className="animate-spin text-blue-600" size={50} />
            <div className="absolute inset-0 animate-ping border-4 border-blue-100 rounded-full" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 animate-pulse">
            Uploading vibe...
          </p>
        </div>
      )}
    </div>
  );
}
