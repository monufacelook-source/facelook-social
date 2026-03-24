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
  Search,
  Plus,
  Trash,
  SmilePlus,
  Volume2,
  UserPlus,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- AUDIO HELPERS ---
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

// --- SMOKE EFFECT ---
const SmokeEffect = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 1 }}
        animate={{
          scale: [0, 3, 5],
          opacity: [1, 0.4, 0],
          x: (Math.random() - 0.5) * 250,
          y: (Math.random() - 0.5) * 250,
        }}
        transition={{ duration: 0.8 }}
        className="absolute w-8 h-8 bg-gray-300/60 rounded-full blur-2xl"
      />
    ))}
  </div>
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ visible: boolean; msg: any }>({
    visible: false,
    msg: null,
  });

  useEffect(() => {
    if (!user || !isOpen) return;
    loadConversations();

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
        `*, p1:participant_1_id(full_name, avatar_url, id), p2:participant_2_id(full_name, avatar_url, id)`,
      )
      .or(`participant_1_id.eq.${user?.id},participant_2_id.eq.${user?.id}`)
      .order("last_message_at", { ascending: false });
    if (data) setConversations(data);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) return setSearchResults([]);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .ilike("full_name", `%${query}%`)
      .neq("id", user?.id)
      .limit(5);
    setSearchResults(data || []);
  };

  const startNewChat = async (otherUser: any) => {
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant_1_id.eq.${user?.id},participant_2_id.eq.${otherUser.id}),and(participant_1_id.eq.${otherUser.id},participant_2_id.eq.${user?.id})`,
      )
      .maybeSingle();

    if (existing) {
      setSelectedConvId(existing.id);
    } else {
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ participant_1_id: user?.id, participant_2_id: otherUser.id })
        .select()
        .single();
      if (newConv) setSelectedConvId(newConv.id);
    }
    setView("chat");
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {popup.visible && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 20 }}
            exit={{ y: -100 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[6000] w-[90%] max-w-[360px] bg-white p-4 rounded-[2rem] shadow-2xl border border-blue-50 flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setSelectedConvId(popup.msg.conversation_id);
              setView("chat");
              setPopup({ visible: false, msg: null });
            }}
          >
            <div className="bg-blue-600 p-2 rounded-2xl text-white shadow-lg">
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
            className="fixed inset-y-0 right-0 w-full sm:w-[450px] z-[5000] bg-[#f8faff] shadow-2xl flex flex-col"
          >
            {view === "list" ? (
              <div className="flex flex-col h-full">
                <div className="p-8 bg-white border-b space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase text-blue-600">
                      Inbox
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-3 bg-gray-100 rounded-full hover:bg-gray-200"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {/* FRIEND SEARCH SYSTEM */}
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      className="w-full bg-gray-100 rounded-full py-4 pl-12 pr-4 outline-none font-bold text-sm"
                      placeholder="Search friends..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border p-2 z-50">
                        {searchResults.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => startNewChat(u)}
                            className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-2xl cursor-pointer"
                          >
                            <img
                              src={u.avatar_url}
                              className="w-10 h-10 rounded-full border"
                            />
                            <p className="font-bold text-sm">{u.full_name}</p>
                            <UserPlus
                              size={16}
                              className="ml-auto text-blue-600"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                        className="flex items-center gap-4 p-5 bg-white rounded-[2.5rem] cursor-pointer shadow-sm hover:shadow-md transition-all"
                      >
                        <img
                          src={other?.avatar_url}
                          className="w-14 h-14 rounded-full border-2 border-blue-50 object-cover"
                        />
                        <div className="flex-1 truncate">
                          <p className="font-black text-black text-sm uppercase">
                            {other?.full_name}
                          </p>
                          <p className="text-xs text-gray-400 truncate font-medium">
                            {c.last_message || "Start a conversation"}
                          </p>
                        </div>
                        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                          {c.last_message_at &&
                            formatDistanceToNow(new Date(c.last_message_at))}
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
  const [isRecording, setIsRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
            }, 800);
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

  // --- FIX: Message Sending Logic ---
  const handleSend = async (content: string, type: any = "text") => {
    if (!content.trim() || !user) return;

    // Optimistic UI for Send button responsiveness
    const msgText = content;
    setText("");
    setShowStickers(false);

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
      content: msgText,
      type,
    });

    if (!error) {
      playSound("send");
      await supabase
        .from("conversations")
        .update({
          last_message: type === "text" ? msgText : `Sent a ${type}`,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", convId);
    } else {
      console.error("Msg Error:", error);
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
    const chunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/ogg" });
      uploadAndSend(new File([blob], "voice.ogg"), "voice");
    };
    mediaRecorder.current.start();
    setIsRecording(true);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <AnimatePresence>
        {selectedMsg && (
          <div
            className="absolute inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-end justify-center p-6"
            onClick={() => setSelectedMsg(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="w-full max-w-sm bg-white rounded-[2.5rem] p-6 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-center font-black uppercase text-[10px] text-gray-400">
                Manage Message
              </p>
              <button
                onClick={() => {
                  supabase.from("messages").delete().eq("id", selectedMsg.id);
                  setSelectedMsg(null);
                }}
                className="w-full p-4 bg-red-50 text-red-600 rounded-2xl flex justify-between items-center font-bold"
              >
                Delete for Everyone <Trash2 size={18} />
              </button>
              <button
                onClick={() => setSelectedMsg(null)}
                className="w-full p-3 font-bold text-gray-400"
              >
                Back
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-4 border-b flex items-center gap-3 sticky top-0 bg-white/80 backdrop-blur-md z-30">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <p className="font-black text-xs uppercase tracking-tighter">
          Live Conversation
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#f8faff]">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex relative ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            {deletingId === m.id && <SmokeEffect />}
            <div
              onClick={() => setSelectedMsg(m)}
              className={`p-5 rounded-[2.2rem] max-w-[85%] shadow-sm relative group cursor-pointer ${m.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none shadow-blue-100" : "bg-white text-black rounded-tl-none border border-gray-100"}`}
            >
              {m.type === "text" && (
                <p className="text-sm font-bold">{m.content}</p>
              )}
              {m.type === "image" && (
                <img src={m.content} className="w-60 rounded-3xl" />
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
                  className="flex items-center gap-2 font-black uppercase text-[10px]"
                >
                  <Play size={16} fill="currentColor" /> Play Voice
                </button>
              )}
              {m.type === "music" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    new Audio(m.content).play();
                  }}
                  className="flex items-center gap-3 bg-black/5 p-3 rounded-2xl border border-black/5"
                >
                  <Music size={18} />{" "}
                  <span className="text-[10px] font-black uppercase">
                    Play Music File
                  </span>
                </button>
              )}
              <p className="text-[8px] mt-1 opacity-50 text-right uppercase font-black">
                {formatDistanceToNow(new Date(m.created_at))} ago
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-6 bg-white border-t">
        <AnimatePresence>
          {showStickers && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex justify-around bg-gray-50 p-4 rounded-[2rem] border mb-4"
            >
              {FUNNY_STICKERS.map((s) => (
                <img
                  key={s.label}
                  src={s.url}
                  onClick={() => handleSend(s.url, "sticker")}
                  className="w-12 h-12 cursor-pointer hover:scale-110"
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[2.5rem] border shadow-inner">
          <input
            type="file"
            id="up-img"
            hidden
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && uploadAndSend(e.target.files[0], "image")
            }
          />
          <input
            type="file"
            id="up-mus"
            hidden
            accept="audio/mp3"
            onChange={(e) =>
              e.target.files?.[0] && uploadAndSend(e.target.files[0], "music")
            }
          />

          <button
            onClick={() => document.getElementById("up-img")?.click()}
            className="p-3 text-gray-400 hover:text-blue-600"
          >
            <ImageIcon size={22} />
          </button>
          <button
            onClick={() => setShowStickers(!showStickers)}
            className="p-3 text-gray-400 hover:text-yellow-500"
          >
            <SmilePlus size={22} />
          </button>
          <button
            onClick={() => document.getElementById("up-mus")?.click()}
            className="p-3 text-gray-400 hover:text-purple-600"
          >
            <Music size={22} />
          </button>

          <input
            className="flex-1 bg-transparent px-2 outline-none font-bold text-sm text-black"
            placeholder="Kaho kya kehna hai..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(text)}
          />

          {text.trim() || isRecording ? (
            <button
              onClick={() =>
                isRecording ? mediaRecorder.current?.stop() : handleSend(text)
              }
              className={`${isRecording ? "bg-red-500 animate-pulse" : "bg-blue-600"} p-4 rounded-full text-white shadow-lg`}
            >
              {isRecording ? <StopCircle size={22} /> : <Send size={22} />}
            </button>
          ) : (
            <button
              onMouseDown={startRecord}
              onMouseUp={() => setIsRecording(false)}
              className="p-4 bg-gray-200 text-gray-500 rounded-full hover:bg-blue-100 hover:text-blue-600"
            >
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>

      {uploading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center z-[500]">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-[10px] font-black uppercase mt-2 tracking-widest text-blue-600">
            Uploading...
          </p>
        </div>
      )}
    </div>
  );
}
