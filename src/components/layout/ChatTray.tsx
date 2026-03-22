import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ArrowLeft, MessageSquare, Loader2, ShieldAlert } from "lucide-react";
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

// ─── helpers ────────────────────────────────────────────────────────────────

function getOtherParticipantId(conv: { participant_1_id: string; participant_2_id: string }, myId: string) {
  return conv.participant_1_id === myId ? conv.participant_2_id : conv.participant_1_id;
}

async function findOrCreateConversation(myId: string, otherId: string): Promise<string | null> {
  const [p1, p2] = [myId, otherId].sort();
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("participant_1_id", p1)
    .eq("participant_2_id", p2)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("conversations")
    .insert({ participant_1_id: p1, participant_2_id: p2 })
    .select("id")
    .single();
  return created?.id ?? null;
}

async function markAsRead(convId: string, myId: string) {
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", convId)
    .neq("sender_id", myId)
    .is("read_at", null);
}

// ─── Avatar helper ───────────────────────────────────────────────────────────

function Avatar({ profile, size = 10 }: { profile: Profile | null; size?: number }) {
  const letter = profile?.full_name?.[0]?.toUpperCase() ?? profile?.username?.[0]?.toUpperCase() ?? "?";
  const s = `w-${size} h-${size}`;
  return (
    <div className={`${s} rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt={profile.full_name ?? ""} className="w-full h-full object-cover" />
      ) : (
        letter
      )}
    </div>
  );
}

// ─── Chat View ────────────────────────────────────────────────────────────────

function ChatView({ conversation, onBack }: { conversation: ConversationWithMeta; onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("messages")
      .select("*, profiles(*)")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? []);
        setLoading(false);
        markAsRead(conversation.id, user.id);
      });
  }, [conversation.id, user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`chat-${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          const msg = payload.new as Message;
          // Fetch the sender profile for the new message
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", msg.sender_id)
            .single();
          setMessages((prev) => [...prev, { ...msg, profiles: profile }]);
          if (msg.sender_id !== user.id) markAsRead(conversation.id, user.id);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversation.id, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !user || sending) return;
    const content = text.trim();
    setText("");
    setSending(true);

    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content,
    });

    await supabase
      .from("conversations")
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq("id", conversation.id);

    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50">
        <motion.button
          onClick={onBack}
          className="w-8 h-8 rounded-full glass flex items-center justify-center flex-shrink-0"
          whileTap={{ scale: 0.9 }}
          data-testid="button-chat-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <Avatar profile={conversation.other_profile} size={8} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {conversation.other_profile?.full_name ?? conversation.other_profile?.username ?? "User"}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {conversation.other_profile?.username ? `@${conversation.other_profile.username}` : ""}
          </p>
        </div>
        {!conversation.is_friend && (
          <div className="flex items-center gap-1 text-[10px] text-amber-400 glass px-2 py-1 rounded-full">
            <ShieldAlert className="w-3 h-3" />
            Request
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          </div>
        )}
        {!loading && messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-2xl mb-1">👋</p>
            <p className="text-xs text-muted-foreground">Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <motion.div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              data-testid={`message-${msg.id}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm"
                    : "glass rounded-bl-sm"
                }`}
              >
                {msg.content}
                <p className={`text-[10px] mt-0.5 ${isMe ? "text-white/60 text-right" : "text-muted-foreground"}`}>
                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="glass-card flex items-center gap-2 px-3 py-2">
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            data-testid="input-message"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <motion.button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="text-primary disabled:opacity-40"
            whileTap={{ scale: 0.85 }}
            data-testid="button-send-message"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </>
  );
}

// ─── Conversation List ────────────────────────────────────────────────────────

function ConversationList({
  conversations,
  loading,
  onSelect,
}: {
  conversations: ConversationWithMeta[];
  loading: boolean;
  onSelect: (c: ConversationWithMeta) => void;
}) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium">No messages yet</p>
        <p className="text-xs text-muted-foreground mt-1">Start a conversation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 p-3">
      {conversations.map((conv, i) => (
        <motion.div
          key={conv.id}
          onClick={() => onSelect(conv)}
          className="glass-card p-3 cursor-pointer hover:bg-white/[0.06] transition-colors"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          whileTap={{ scale: 0.98 }}
          data-testid={`conversation-row-${conv.id}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar profile={conv.other_profile} size={10} />
              {conv.unread_count > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-red-500 flex items-center justify-center px-1">
                  <span className="text-[9px] text-white font-bold">{conv.unread_count > 9 ? "9+" : conv.unread_count}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${conv.unread_count > 0 ? "font-bold" : "font-semibold"}`}>
                  {conv.other_profile?.full_name ?? conv.other_profile?.username ?? "User"}
                </p>
                <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                  {conv.last_message_at
                    ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })
                    : ""}
                </span>
              </div>
              <p className={`text-xs truncate mt-0.5 ${conv.unread_count > 0 ? "text-foreground/80" : "text-muted-foreground"}`}>
                {conv.last_message ?? "Start chatting..."}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main ChatTray ────────────────────────────────────────────────────────────

export default function ChatTray({ isOpen, onClose }: ChatTrayProps) {
  const { user } = useAuth();
  const [view, setView] = useState<TrayView>("list");
  const [activeTab, setActiveTab] = useState<InboxTab>("inbox");
  const [selectedConv, setSelectedConv] = useState<ConversationWithMeta | null>(null);
  const [conversations, setConversations] = useState<ConversationWithMeta[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);

    // Get all conversations I'm part of
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (!convs || convs.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Get other participant IDs
    const otherIds = convs.map((c) => getOtherParticipantId(c, user.id));

    // Fetch profiles for all other participants
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", otherIds);

    const profileMap: Record<string, Profile> = {};
    (profiles ?? []).forEach((p) => { profileMap[p.id] = p; });

    // Fetch accepted friendships
    const { data: friendships } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .eq("status", "accepted")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    const friendIds = new Set<string>();
    (friendships ?? []).forEach((f) => {
      if (f.requester_id === user.id) friendIds.add(f.addressee_id);
      else friendIds.add(f.requester_id);
    });

    // Fetch unread counts
    const convIds = convs.map((c) => c.id);
    const { data: unreadMsgs } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", convIds)
      .neq("sender_id", user.id)
      .is("read_at", null);

    const unreadMap: Record<string, number> = {};
    (unreadMsgs ?? []).forEach((m) => {
      unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] ?? 0) + 1;
    });

    const enriched: ConversationWithMeta[] = convs.map((c) => {
      const otherId = getOtherParticipantId(c, user.id);
      return {
        ...c,
        other_profile: profileMap[otherId],
        unread_count: unreadMap[c.id] ?? 0,
        is_friend: friendIds.has(otherId),
      };
    });

    setConversations(enriched);
    setLoading(false);
  };

  // Refresh when tray opens
  useEffect(() => {
    if (isOpen && user) fetchConversations();
  }, [isOpen, user]);

  // Real-time: update last message + unread count when new messages arrive
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`conversations-list-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchConversations();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleSelectConv = (conv: ConversationWithMeta) => {
    setSelectedConv(conv);
    setView("chat");
    // Clear unread locally
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
    );
  };

  const handleBack = () => {
    setView("list");
    setSelectedConv(null);
    fetchConversations();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setView("list");
      setSelectedConv(null);
    }, 300);
  };

  const inboxConvs = conversations.filter((c) => c.is_friend);
  const requestConvs = conversations.filter((c) => !c.is_friend);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-80 z-50 bg-card border-l border-border/50 flex flex-col shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          >
            <AnimatePresence mode="wait">
              {view === "list" ? (
                <motion.div
                  key="list"
                  className="flex flex-col flex-1 min-h-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
                    <h2 className="font-display font-bold text-lg gradient-text">Messages</h2>
                    <motion.button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full glass flex items-center justify-center"
                      whileTap={{ scale: 0.9 }}
                      data-testid="button-close-chat"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>

                  {/* Tabs */}
                  <div className="flex px-3 pt-3 gap-2">
                    {(["inbox", "requests"] as InboxTab[]).map((tab) => {
                      const isActive = activeTab === tab;
                      const badge = tab === "inbox" ? inboxConvs.reduce((s, c) => s + c.unread_count, 0)
                        : requestConvs.reduce((s, c) => s + c.unread_count, 0);
                      return (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          data-testid={`tab-${tab}`}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors capitalize ${
                            isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/[0.04]"
                          }`}
                        >
                          {tab === "requests" && <ShieldAlert className="w-3.5 h-3.5" />}
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          {badge > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1">
                              {badge > 9 ? "9+" : badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* List */}
                  <div className="flex-1 overflow-y-auto">
                    <ConversationList
                      conversations={activeTab === "inbox" ? inboxConvs : requestConvs}
                      loading={loading}
                      onSelect={handleSelectConv}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat"
                  className="flex flex-col flex-1 min-h-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.15 }}
                >
                  {selectedConv && (
                    <ChatView conversation={selectedConv} onBack={handleBack} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
