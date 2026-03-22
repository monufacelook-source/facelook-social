import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Eye, EyeOff, Globe, KeyRound, Shield } from "lucide-react";
import { useState } from "react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [profileLocked, setProfileLocked] = useState(false);
  const [hideStatus, setHideStatus] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");

  const labels = {
    en: { title: "Settings", password: "Reset Password", lock: "Profile Lock", status: "Hide Live Status", language: "Language" },
    hi: { title: "सेटिंग्स", password: "पासवर्ड रीसेट", lock: "प्रोफ़ाइल लॉक", status: "लाइव स्टेटस छुपाएं", language: "भाषा" },
  };
  const t = labels[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background overflow-y-auto"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
        >
          <div className="max-w-lg mx-auto px-5 py-6">
            <div className="flex items-center gap-3 mb-8">
              <motion.button onClick={onClose} className="glass w-10 h-10 rounded-full flex items-center justify-center" whileTap={{ scale: 0.9 }}>
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <h1 className="font-display text-2xl font-bold gradient-text">{t.title}</h1>
            </div>

            <div className="space-y-3">
              {/* Password Reset */}
              <motion.button className="glass-card w-full p-4 flex items-center gap-4 text-left" whileTap={{ scale: 0.98 }}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-sm">{t.password}</span>
              </motion.button>

              {/* Profile Lock */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-secondary" />
                  </div>
                  <span className="font-medium text-sm">{t.lock}</span>
                </div>
                <button
                  onClick={() => setProfileLocked(!profileLocked)}
                  className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${profileLocked ? "bg-primary" : "bg-muted"}`}
                >
                  <motion.div className="w-5 h-5 rounded-full bg-foreground" animate={{ x: profileLocked ? 18 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                </button>
              </div>

              {/* Hide Status */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    {hideStatus ? <EyeOff className="w-5 h-5 text-accent" /> : <Eye className="w-5 h-5 text-accent" />}
                  </div>
                  <span className="font-medium text-sm">{t.status}</span>
                </div>
                <button
                  onClick={() => setHideStatus(!hideStatus)}
                  className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${hideStatus ? "bg-primary" : "bg-muted"}`}
                >
                  <motion.div className="w-5 h-5 rounded-full bg-foreground" animate={{ x: hideStatus ? 18 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} />
                </button>
              </div>

              {/* Language */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-sm">{t.language}</span>
                </div>
                <div className="flex gap-1">
                  {(["en", "hi"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "glass"}`}
                    >
                      {l === "en" ? "EN" : "हि"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
