import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { demoMessages, getUserById } from "@/data/demo";
import { useState } from "react";

interface ChatTrayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatTray({ isOpen, onClose }: ChatTrayProps) {
  const [message, setMessage] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-80 z-50 glass-strong flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="font-display font-bold text-lg gradient-text">Messages</h2>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 rounded-full glass flex items-center justify-center"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {demoMessages.map((msg, i) => {
                const user = getUserById(msg.userId);
                return (
                  <motion.div
                    key={msg.id}
                    className="glass-card p-3 cursor-pointer hover:bg-white/[0.06] transition-colors"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={user?.avatar} alt={user?.name} className="w-10 h-10 rounded-full" />
                        {user?.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm truncate">{user?.name}</p>
                          <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{msg.text}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <div className="glass-card flex items-center gap-2 px-3 py-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <motion.button className="text-primary" whileTap={{ scale: 0.85 }}>
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
