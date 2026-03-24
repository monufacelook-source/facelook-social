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
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

const SmokeEffect = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 4], opacity: 0 }}
        transition={{ duration: 0.7 }}
        className="absolute w-6 h-6 bg-gray-300/50 rounded-full blur-xl"
      />
    ))}
  </div>
);

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
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [popup, setPopup] = useState<{ visible: boolean; msg: any }>({
    visible: false,
    msg: null,
  });

  useEffect(() => {
    if (!user || !isOpen) return;
    loadConversations();

    const channel = supabase
      .channel("inbox_updates")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (p) => {
          if (!selectedConv || selectedConv.id !== p.new.conversation_id) {
            playSound("notif");
            setPopup({ visible: true, msg: p.new });
            setTimeout(() => setPopup({ visible: false, msg: null }), 4000);
            loadConversations();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOpen, selectedConv]);

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
      .select(
        `*, p1:participant_1_id(full_name, avatar_url, id), p2:participant_2_id(full_name, avatar_url, id)`,
      )
      .or(
        `and(participant_1_id.eq.${user?.id},participant_2_id.eq.${otherUser.id}),and(participant_1_id.eq.${otherUser.id},participant_2_id.eq.${user?.id})`,
      )
      .maybeSingle();

    if (existing) setSelectedConv(existing);
    else {
      const { data: newC } = await supabase
        .from("conversations")
        .insert({ participant_1_id: user?.id, participant_2_id: otherUser.id })
        .select(
          `*, p1:participant_1_id(full_name, avatar_url, id), p2:participant_2_id(full_name, avatar_url, id)`,
        )
        .single();
      if (newC) setSelectedConv(newC);
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
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[6000] w-[90%] max-w-[340px] bg-white p-4 rounded-3xl shadow-2xl border flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setView("chat");
              setPopup({ visible: false, msg: null });
            }}
          >
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Bell size={16} />
            </div>
            <p className="text-sm font-bold text-black truncate flex-1">
              {popup.msg?.content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 w-full sm:w-[450px] z-[5000] bg-white shadow-2xl flex flex-col"
          >
            {view === "list" ? (
              <div className="flex flex-col h-full bg-[#f8faff]">
                <div className="p-6 bg-white border-b space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-blue-600 uppercase italic">
                      Vibe Chat
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 bg-gray-100 rounded-full"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="relative">
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      className="w-full bg-gray-100 rounded-full py-3 pl-12 pr-4 outline-none text-sm font-bold"
                      placeholder="Find someone..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border p-2 z-50">
                        {searchResults.map((u) => (
                          <div
                            key={u.id}
                            onClick={() => startNewChat(u)}
                            className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-xl cursor-pointer font-bold text-sm"
                          >
                            <img
                              src={u.avatar_url}
                              className="w-8 h-8 rounded-full"
                            />{" "}
                            {u.full_name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {conversations.map((c) => {
                    const other = c.participant_1_id === user?.id ? c.p2 : c.p1;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedConv(c);
                          setView("chat");
                        }}
                        className="flex items-center gap-4 p-4 bg-white rounded-[2rem] cursor-pointer shadow-sm hover:shadow-md transition-all"
                      >
                        <img
                          src={other?.avatar_url}
                          className="w-12 h-12 rounded-full object-cover border"
                        />
                        <div className="flex-1 truncate">
                          <p className="font-bold text-sm">
                            {other?.full_name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {c.last_message || "Tap to chat"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <ChatView
                conversation={selectedConv}
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

function ChatView({
  conversation,
  onBack,
}: {
  conversation: any;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const otherUser =
    conversation.participant_1_id === user?.id
      ? conversation.p2
      : conversation.p1;

  // LOAD & SYNC REALTIME
  useEffect(() => {
    loadMsgs();
    const channel = supabase
      .channel(`room_${conversation.id}`)
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
              // Prevent duplicate display
              if (prev.find((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
            if (payload.new.sender_id !== user?.id) playSound("receive");
          }
          if (payload.eventType === "DELETE") {
            setDeletingId(payload.old.id);
            playSound("delete");
            setTimeout(
              () =>
                setMessages((prev) =>
                  prev.filter((m) => m.id !== payload.old.id),
                ),
              800,
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMsgs = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const handleSend = async () => {
    if (!text.trim() || !user) return;

    const tempMsg = text;
    setText("");
    playSound("send");

    // Ye insert query ab seedha chalegi
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        receiver_id: otherUser.id,
        content: tempMsg,
        type: "text",
      })
      .select()
      .single();

    if (!error && data) {
      // Immediate screen update if listener is slow
      setMessages((prev) =>
        prev.find((m) => m.id === data.id) ? prev : [...prev, data],
      );

      await supabase
        .from("conversations")
        .update({
          last_message: tempMsg,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] relative">
      <div className="p-4 bg-white border-b flex items-center gap-3 sticky top-0 z-40">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <img
          src={otherUser?.avatar_url}
          className="w-9 h-9 rounded-full border"
        />
        <p className="font-black text-sm uppercase tracking-tighter">
          {otherUser?.full_name}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex relative ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            {deletingId === m.id && <SmokeEffect />}
            <div
              onDoubleClick={() => {
                if (m.sender_id === user?.id)
                  supabase.from("messages").delete().eq("id", m.id);
              }}
              className={`p-4 rounded-2xl max-w-[80%] font-bold text-sm shadow-sm transition-all ${m.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-black rounded-tl-none border border-gray-100"}`}
            >
              {m.content}
              <p className="text-[8px] opacity-40 mt-1 text-right">
                {formatDistanceToNow(new Date(m.created_at))} ago
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border">
          <input
            className="flex-1 bg-transparent py-2 outline-none font-bold text-sm"
            placeholder="Kaho kya kehna hai..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="p-3 bg-blue-600 text-white rounded-full hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
