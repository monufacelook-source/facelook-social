import { motion } from "framer-motion";
import {
  X, Shield, MapPin, Heart, Volume2, VolumeX, LogOut,
  Lock, Eye, EyeOff, KeyRound, UserCheck, Bell, Globe,
  Trash2, ChevronRight, ShieldCheck, FileText, HelpCircle,
  LifeBuoy, ExternalLink,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const PURPLE = "#1a0b2e";
const ACCENT = "#a855f7";
const PURPLE_LIGHT = "#6d28d9";

interface SettingsPanelProps {
  onClose: () => void;
}

function GlassToggle({ value, onChange, testId }: { value: boolean; onChange: (v: boolean) => void; testId?: string }) {
  return (
    <button
      data-testid={testId}
      onClick={() => onChange(!value)}
      className="relative shrink-0 transition-all duration-300 rounded-full flex items-center px-1"
      style={{
        minWidth: "48px",
        height: "28px",
        background: value
          ? `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})`
          : "rgba(255,255,255,0.10)",
        border: value ? "none" : "1px solid rgba(255,255,255,0.15)",
      }}
    >
      <motion.div
        animate={{ x: value ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="w-5 h-5 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.2em] px-1 pt-4 pb-1">
      {label}
    </p>
  );
}

function SettingRow({ icon: Icon, label, sublabel, value, onChange, color, testId }: {
  icon: any; label: string; sublabel?: string; value: boolean; onChange: (v: boolean) => void; color: string; testId?: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-3.5 rounded-2xl mb-2"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">{label}</p>
          {sublabel && <p className="text-white/35 text-[10px]">{sublabel}</p>}
        </div>
      </div>
      <GlassToggle value={value} onChange={onChange} testId={testId} />
    </div>
  );
}

function NavRow({ icon: Icon, label, sublabel, color, danger, href }: {
  icon: any; label: string; sublabel?: string; color: string; danger?: boolean; href?: string;
}) {
  return (
    <a
      href={href || "#"}
      target={href ? "_blank" : undefined}
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3.5 rounded-2xl mb-2 active:scale-98"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className={`w-4 h-4 ${danger ? "text-red-400" : "text-white"}`} />
        </div>
        <div>
          <p className={`font-bold text-sm ${danger ? "text-red-400" : "text-white"}`}>{label}</p>
          {sublabel && <p className="text-white/35 text-[10px]">{sublabel}</p>}
        </div>
      </div>
      {href
        ? <ExternalLink className="w-3.5 h-3.5 text-white/20" />
        : <ChevronRight className={`w-4 h-4 ${danger ? "text-red-400/50" : "text-white/25"}`} />
      }
    </a>
  );
}

type Tab = "privacy" | "security" | "account";

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [tab, setTab]                       = useState<Tab>("privacy");
  const [profileLocked, setProfileLocked]   = useState(false);
  const [hideOnlineStatus, setHideStatus]   = useState(false);
  const [hideProfile, setHideProfile]       = useState(false);
  const [locationPrivacy, setLocPrivacy]    = useState(false);
  const [mHeartPrefs, setMHeart]            = useState(true);
  const [soundEnabled, setSound]            = useState(true);
  const [notifPosts, setNotifPosts]         = useState(true);
  const [notifMessages, setNotifMessages]   = useState(true);
  const [twoFactor, setTwoFactor]           = useState(false);

  const { signOut } = useAuth();
  const tabs: { key: Tab; label: string }[] = [
    { key: "privacy",  label: "Privacy" },
    { key: "security", label: "Security" },
    { key: "account",  label: "Account" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h2 className="text-white font-black text-2xl italic tracking-tight">Settings</h2>
          <p className="text-white/35 text-xs">FACELOOK 10.07 Control Center</p>
        </div>
        <button
          data-testid="button-close-settings"
          onClick={onClose}
          className="p-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Tab pills */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-4 shrink-0"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            style={
              tab === t.key
                ? { background: `linear-gradient(135deg, ${ACCENT}, ${PURPLE_LIGHT})`, color: "white" }
                : { color: "rgba(255,255,255,0.35)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar">

        {tab === "privacy" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <SectionHeader label="Profile Visibility" />
            <SettingRow icon={Lock}            label="Profile Lock"         sublabel="Blur content for non-friends"          value={profileLocked}     onChange={setProfileLocked}  color="bg-gradient-to-br from-violet-500 to-purple-700"  testId="toggle-profile-lock" />
            <SettingRow icon={EyeOff}          label="Hide Profile"         sublabel="Make profile invisible in search"      value={hideProfile}       onChange={setHideProfile}    color="bg-gradient-to-br from-gray-500 to-slate-700"     testId="toggle-hide-profile" />
            <SettingRow icon={hideOnlineStatus ? EyeOff : Eye} label="Hide Online Status" sublabel="Others won't see when you're active" value={hideOnlineStatus}  onChange={setHideStatus}     color="bg-gradient-to-br from-slate-500 to-gray-700"     testId="toggle-hide-status" />
            <SectionHeader label="Location & Data" />
            <SettingRow icon={MapPin}          label="Location Privacy"     sublabel="Hide map tags on your posts"           value={locationPrivacy}   onChange={setLocPrivacy}     color="bg-gradient-to-br from-cyan-500 to-blue-600"      testId="toggle-location-privacy" />
            <SectionHeader label="Features" />
            <SettingRow icon={Heart}           label="M-Heart Matchmaking"  sublabel="Show matrimony profiles to you"        value={mHeartPrefs}       onChange={setMHeart}         color="bg-gradient-to-br from-rose-500 to-red-700"       testId="toggle-mheart" />
            <SettingRow icon={soundEnabled ? Volume2 : VolumeX} label="Sound Effects" sublabel="Tray & notification sounds"   value={soundEnabled}      onChange={setSound}          color="bg-gradient-to-br from-amber-400 to-orange-600"   testId="toggle-sound" />
            <SectionHeader label="Notifications" />
            <SettingRow icon={Bell}            label="Post Notifications"   sublabel="Likes, comments on your posts"         value={notifPosts}        onChange={setNotifPosts}     color="bg-gradient-to-br from-teal-400 to-green-600"     testId="toggle-notif-posts" />
            <SettingRow icon={Bell}            label="Message Alerts"       sublabel="Vibe & chat notifications"             value={notifMessages}     onChange={setNotifMessages}  color="bg-gradient-to-br from-indigo-400 to-blue-600"    testId="toggle-notif-messages" />
          </motion.div>
        )}

        {tab === "security" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <SectionHeader label="Account Security" />
            <SettingRow icon={ShieldCheck} label="Two-Factor Auth" sublabel="Extra layer of protection" value={twoFactor} onChange={setTwoFactor} color="bg-gradient-to-br from-emerald-400 to-green-600" testId="toggle-2fa" />
            <SectionHeader label="Access" />
            <NavRow icon={KeyRound}  label="Password Reset"   sublabel="Change your login password"        color="bg-gradient-to-br from-sky-400 to-blue-600" />
            <NavRow icon={UserCheck} label="Active Sessions"  sublabel="Devices logged in to your account" color="bg-gradient-to-br from-violet-400 to-purple-600" />
            <NavRow icon={Globe}     label="Login History"    sublabel="Recent sign-in activity"           color="bg-gradient-to-br from-slate-400 to-gray-600" />
            <NavRow icon={Shield}    label="Blocked Users"    sublabel="Manage your block list"            color="bg-gradient-to-br from-orange-400 to-red-600" />
          </motion.div>
        )}

        {tab === "account" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <SectionHeader label="Language" />
            <div
              className="flex items-center justify-between p-3.5 rounded-2xl mb-2"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <p className="text-white font-bold text-sm">Language</p>
              </div>
              <div className="flex gap-1">
                {(["EN", "हि"] as const).map((l) => (
                  <button key={l} className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/60" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <SectionHeader label="Support" />
            <NavRow icon={FileText}   label="Privacy Policy"    sublabel="How we protect your data"          color="bg-gradient-to-br from-purple-400 to-violet-600" href="https://facelook.replit.app/privacy" />
            <NavRow icon={HelpCircle} label="Help & FAQ"        sublabel="Answers to common questions"       color="bg-gradient-to-br from-cyan-400 to-sky-600"    href="https://facelook.replit.app/help" />
            <NavRow icon={LifeBuoy}   label="Contact Support"   sublabel="Talk to the Facelook team"         color="bg-gradient-to-br from-teal-400 to-green-600"  href="mailto:support@facelook.app" />

            <SectionHeader label="Danger Zone" />
            <NavRow icon={Trash2} label="Delete Account" sublabel="Permanently remove your data" color="bg-red-500/20" danger />

            <div className="mt-3">
              <motion.button
                data-testid="button-signout"
                onClick={signOut}
                whileTap={{ scale: 0.97 }}
                className="w-full p-3.5 rounded-2xl flex items-center gap-3"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.22)" }}
              >
                <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-400" />
                </div>
                <span className="font-bold text-sm text-red-400">Sign Out</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
