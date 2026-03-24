import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, ArrowLeft, Loader2, CheckCheck, Search, MessageSquare, 
  Smile, Bell, Trash2, UserX, ShieldAlert, Check, Image as ImageIcon, 
  Mic, StopCircle, Play, Volume2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// --- AUDIO HELPERS ---
const playSound = (type: 'send' | 'receive' | 'notif') => {
  const audio = new Audio(`/${type}.mp3`);
  audio.play().catch(() => {}); 
};

// --- SMOKE/DHUWAN EFFECT ---
const SmokeEffect = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[...Array(8)].map((_, i) => (
      <motion.div key={i} initial={{ scale: 0, opacity: 0.8 }} animate={{ scale: 2.5, opacity: 0, x: (Math.random()-0.5)*100, y: (Math.random()-0.5)*100 }} transition={{ duration: 0.6 }} className="absolute w-8 h-8 bg-gray-300/60 rounded-full blur-xl" />
    ))}
  </div>
);

// --- TYPING INDICATOR ---
const TypingIndicator = () => (
  <div className="flex gap-1.5 px-4 py-3 bg-white/50 backdrop-blur-md w-fit rounded-2xl rounded-bl-none border border-white/20 mb-4 shadow-sm">
    {[0, 1, 2].map((i) => (
      <motion.div key={i} animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} className="w-2 h-2 bg-blue-500 rounded-full" />
    ))}
  </div>
);

// --- STICKERS ---
const FUNNY_STICKERS = [
  { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f45e/512.gif", label: "Chappal" },
  { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f602/512.gif", label: "LOL" },
  { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.gif", label: "Fire" },
  { url: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f4af/512.gif", label: "100" },
];

// --- DELETE MODAL ---
const DeleteMenu = ({ isOpen, isOwner, onCancel, onDeleteMe, onDeleteEveryone }: any) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[3000] flex items-end justify-center bg-black/20 backdrop-blur-sm p-4">
        <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-6 shadow-2xl border border-white/50">
          <p className="text-center font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 mb-6">Message Options</p>
          <div className="space-y-3">
            <button onClick={onDeleteMe} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl font-bold text-gray-700">Delete for me <Trash2 size={18} /></button>
            {isOwner && <button onClick={onDeleteEveryone} className="w-full flex items-center justify-between p-4 bg-red-50 text-red-600 rounded-2xl font-bold">Delete for everyone <UserX size={18} /></button>}
            <button onClick={onCancel} className="w-full p-4 font-black uppercase text-xs text-gray-400">Cancel</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- MAIN CHAT TRAY ---
export default function ChatTray({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [view, setView] = useState<"list" | "chat">("list");
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [popup, setPopup] = useState<{ visible: boolean; msg: any }>({ visible: false, msg: null });

  useEffect(() => {
    if (!user) return;
    loadAll();
    const globalChannel = supabase.channel("global_updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` }, (payload) => {
        if (selectedConvId !== payload.new.conversation_id) {
          playSound('notif');
          setPopup({ visible: true, msg: payload.new });
          setTimeout(() => setPopup({ visible: false, msg: null }), 5000);
          loadAll();
        } else {
          playSound('receive');
        }
      }).subscribe();
    return () => { supabase.removeChannel(globalChannel); };
  }, [user, selectedConvId]);

  const loadAll = async () => {
    if (!user) return;
    const { data } = await supabase.from("conversations").select("*").or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`).order("last_message_at", { ascending: false });
    if (data) {
      const enriched = await Promise.all(data.map(async (c) => {
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", c.participant_1_id === user.id ? c.participant_2_id : c.participant_1_id).single();
        const unreadCount = (c.last_sender_id !== user.id && c.status === 'spam') ? 1 : 0;
        return { ...c, other_profile: prof, unread: unreadCount };
      }));
      setConversations(enriched);
      setTotalUnread(enriched.reduce((acc, curr) => acc + curr.unread, 0));
    }
  };

  const activeConv = conversations.find(c => c.id === selectedConvId);

  return (
    <div className="relative">
      <AnimatePresence>
        {popup.visible && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-[3000] w-[90%] max-w-[350px] bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-2xl text-white"><Bell size={18} /></div>
            <div className="flex-1 min-w-0"><p className="text-[10px] font-black text-blue-600 uppercase">New Vibe</p><p className="text-sm font-bold truncate">{popup.msg?.content}</p></div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-y-0 right-0 w-full sm:w-[420px] z-[1000] bg-white/90 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-white/30">
            {view === "list" ? (
              <div className="flex flex-col h-full">
                <div className="p-8 bg-gradient-to-br from-blue-700 to-indigo-900 text-white">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">Vibe-Chat</h2>
                    <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={20} /></button>
                  </div>
                  <input className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-sm outline-none" placeholder="Search vibes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {conversations.map((conv) => (
                    <div key={conv.id} onClick={() => { setSelectedConvId(conv.id); setView("chat"); }} className="flex items-center gap-4 p-4 hover:bg-white rounded-[2.5rem] cursor-pointer mb-2 transition-all relative">
                      <Avatar profile={conv.other_profile} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black uppercase text-gray-800">{conv.other_profile?.full_name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{conv.last_message}</p>
                      </div>
                      {conv.unread > 0 && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-black animate-pulse">!</div>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              activeConv && <ChatView conversation={activeConv} onBack={() => { setView("list"); loadAll(); }} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- CHAT VIEW (MERGED) ---
function ChatView({ conversation, onBack }: any) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [convStatus, setConvStatus] = useState(conversation.status || "normal");

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    const channel = supabase.channel(`chat_${conversation.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${conversation.id}` }, (p) => {
        if (p.eventType === "INSERT") setMessages(prev => [...prev, p.new]);
        if (p.eventType === "DELETE") {
          setDeletingId(p.old.id);
          setTimeout(() => { setMessages(prev => prev.filter(m => m.id !== p.old.id)); setDeletingId(null); }, 600);
        }
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId !== user?.id) {
          setIsTyping(payload.typing);
          setTimeout(() => setIsTyping(false), 3000);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversation.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const loadMessages = async () => {
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversation.id).order("created_at", { ascending: true });
    setMessages(data || []);
  };

  const handleSend = async (content: string, type: 'text' | 'image' | 'voice' | 'sticker' = 'text') => {
    if (!content.trim() || !user) return;
    const isSpamReplying = convStatus === "spam" && conversation.last_sender_id !== user.id;

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversation.id, sender_id: user.id,
      receiver_id: conversation.participant_1_id === user.id ? conversation.participant_2_id : conversation.participant_1_id,
      content, type
    });

    if (!error) {
      playSound('send');
      setText(""); setShowStickers(false);
      const updateObj: any = { 
        last_message: type === 'text' ? content : `Sent a ${type}`, 
        last_message_at: new Date().toISOString(), 
        last_sender_id: user.id 
      };
      if (isSpamReplying) {
        updateObj.status = 'normal';
        setConvStatus('normal');
      }
      await supabase.from("conversations").update(updateObj).eq("id", conversation.id);
    }
  };

  const uploadFile = async (file: File, folder: 'images' | 'voice') => {
    setUploading(true);
    const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
    const { data } = await supabase.storage.from('chat-assets').upload(`${folder}/${fileName}`, file);
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('chat-assets').getPublicUrl(data.path);
      handleSend(publicUrl, folder === 'images' ? 'image' : 'voice');
    }
    setUploading(false);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = () => {
      const blob = new Blob(audioChunks.current, { type: 'audio/ogg' });
      uploadFile(new File([blob], "voice.ogg"), 'voice');
      audioChunks.current = [];
    };
    mediaRecorder.current.start(); setIsRecording(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#f8faff] relative">
      <DeleteMenu isOpen={!!selectedMsg} isOwner={selectedMsg?.sender_id === user?.id} onCancel={() => setSelectedMsg(null)}
        onDeleteMe={() => setMessages(prev => prev.filter(m => m.id !== selectedMsg.id))}
        onDeleteEveryone={async () => { await supabase.from("messages").delete().eq("id", selectedMsg.id); setSelectedMsg(null); }} />

      <div className="p-4 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack}><ArrowLeft size={20} /></button>
          <Avatar profile={conversation.other_profile} />
          <div>
            <p className="font-black text-xs uppercase tracking-widest truncate">{conversation.other_profile?.full_name}</p>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full animate-pulse ${convStatus === 'spam' ? 'bg-orange-500' : 'bg-green-500'}`} />
              <span className="text-[9px] font-black text-gray-400 uppercase">{convStatus === 'spam' ? 'Pending Approval' : 'Live Vibe'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {convStatus === "spam" && conversation.last_sender_id !== user?.id && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 rounded-[2.5rem] text-center mb-6">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">New Connection Request</p>
            <p className="text-[11px] text-gray-500 font-bold">Reply to start a normal conversation.</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((m) => (
            <motion.div key={m.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={() => setSelectedMsg(m)} className={`flex relative ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
              {deletingId === m.id && <SmokeEffect />}
              <div className={`p-4 rounded-[1.8rem] max-w-[80%] shadow-sm ${m.sender_id === user?.id ? "bg-blue-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"}`}>
                {m.type === 'image' && <motion.img whileHover={{ scale: 1.05 }} src={m.content} className="w-48 rounded-2xl mb-2" />}
                {m.type === 'voice' && <button onClick={(e) => { e.stopPropagation(); new Audio(m.content).play(); }} className="flex items-center gap-3 bg-black/10 p-2 rounded-xl"><Play size={16} /> <div className="h-1 w-20 bg-current/20 rounded-full" /><Volume2 size={14}/></button>}
                {m.type === 'text' && <p className="text-[13px] font-semibold">{m.content}</p>}
                {m.type === 'sticker' && <motion.img whileHover={{ scale: 1.2 }} src={m.content} className="w-24 h-24" />}

                <div className="flex items-center gap-1 mt-1 opacity-40 text-[8px] font-black justify-end uppercase">
                  {formatDistanceToNow(new Date(m.created_at))}
                  {m.sender_id === user?.id && (convStatus === "spam" ? <Check size={10} /> : <CheckCheck size={10} />)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white/80 border-t flex flex-col gap-2">
        <AnimatePresence>
          {showStickers && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="flex justify-around bg-gray-50 p-3 rounded-3xl mb-2 shadow-inner border border-gray-100">
              {FUNNY_STICKERS.map(s => <motion.img key={s.label} whileTap={{ scale: 0.8 }} src={s.url} onClick={() => handleSend(s.url, 'sticker')} className="w-12 h-12 cursor-pointer" />)}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-full">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0], 'images')} />
            <ImageIcon size={20} className="text-gray-400" />
          </label>
          <button onClick={() => setShowStickers(!showStickers)} className={`p-2 rounded-full transition-colors ${showStickers ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}><Smile size={20} /></button>

          <input className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-sm outline-none font-bold" placeholder="Vibe..." value={text} 
            onChange={(e) => {
              setText(e.target.value);
              supabase.channel(`chat_${conversation.id}`).send({ type: "broadcast", event: "typing", payload: { userId: user?.id, typing: true } });
            }} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend(text)} 
          />

          {text.length === 0 ? (
            <button onClick={isRecording ? () => { mediaRecorder.current?.stop(); setIsRecording(false); } : startRecording} className={`p-3 rounded-full ${isRecording ? "bg-red-500 animate-pulse text-white" : "bg-gray-100 text-gray-500"}`}>
              {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>
          ) : (
            <button onClick={() => handleSend(text)} className="bg-blue-600 p-3 rounded-full text-white shadow-lg"><Send size={18} /></button>
          )}
        </div>
      </div>
      {uploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-50"><Loader2 className="animate-spin text-blue-600" /></div>}
    </div>
  );
}

function Avatar({ profile }: any) {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-xs border-2 border-white shadow-sm overflow-hidden shrink-0">
      {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : profile?.full_name?.[0]}
    </div>
  );
}