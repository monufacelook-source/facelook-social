import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ArrowLeft, Bell, Search, UserPlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- AUDIO HELPERS ---
const playSound = (type: "send" | "receive") => {
  const audio = new Audio(
    type === "send"
      ? "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
      : "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
  );
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

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
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !isOpen) return;
    loadConversations();
  }, [user, isOpen]);

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

  return (
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
                  <h2 className="text-2xl font-black text-blue-600 uppercase">
                    Messages
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
                    placeholder="Search friends..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
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
                      className="flex items-center gap-4 p-4 bg-white rounded-2xl cursor-pointer shadow-sm hover:shadow-md transition-all"
                    >
                      <img
                        src={other?.avatar_url}
                        className="w-12 h-12 rounded-full border"
                      />
                      <div className="flex-1 truncate">
                        <p className="font-bold text-sm">{other?.full_name}</p>
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const otherUser =
    conversation.participant_1_id === user?.id
      ? conversation.p2
      : conversation.p1;

  // 1. MESSAGES LOAD & REALTIME SYNC
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      // Initial Load
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);

      // Realtime Channel
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
          (payload) => {
            setMessages((prev) => {
              if (prev.find((m) => m.id === payload.new.id)) return prev;
              if (payload.new.sender_id !== user?.id) playSound("receive");
              return [...prev, payload.new];
            });
          },
        )
        .subscribe();

      return channel;
    };

    const channelPromise = fetchAndSubscribe();
    return () => {
      channelPromise.then((c) => supabase.removeChannel(c));
    };
  }, [conversation.id, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 2. SEND MESSAGE LOGIC
  const handleSend = async () => {
    if (!text.trim() || !user) return;

    const msgContent = text;
    setText(""); // Clear input immediately
    playSound("send");

    // Optimistic Update: Database se pehle hi UI par dikhao
    const tempId = Math.random().toString();
    const tempMsg = {
      id: tempId,
      content: msgContent,
      sender_id: user.id,
      created_at: new Date().toISOString(),
      conversation_id: conversation.id,
    };
    setMessages((prev) => [...prev, tempMsg]);

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        receiver_id: otherUser.id,
        content: msgContent,
        type: "text",
      })
      .select()
      .single();

    if (error) {
      console.error("Error sending:", error);
      setMessages((prev) => prev.filter((m) => m.id !== tempId)); // Remove if failed
    } else {
      // Replace temp message with real one from DB
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data : m)));

      await supabase
        .from("conversations")
        .update({
          last_message: msgContent,
          last_message_at: new Date().toISOString(),
        })
        .eq("id", conversation.id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] relative">
      <div className="p-4 bg-white border-b flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <img src={otherUser?.avatar_url} className="w-9 h-9 rounded-full" />
        <p className="font-bold text-sm uppercase">{otherUser?.full_name}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[80%] text-sm font-medium shadow-sm ${m.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-black rounded-tl-none"}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1">
          <input
            className="flex-1 bg-transparent py-3 outline-none font-bold text-sm"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className="p-2 text-blue-600">
            <Send size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}
