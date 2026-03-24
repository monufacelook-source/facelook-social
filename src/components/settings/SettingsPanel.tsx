import { motion } from "framer-motion";
import {
  X, Shield, MapPin, Heart, Volume2, VolumeX, LogOut,
  Lock, Eye, EyeOff, KeyRound, UserCheck, Bell, Globe,
  Trash2, ChevronRight, ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
          ? "linear-gradient(135deg, #00F2FE, #9B51E0)"
          : "rgba(255,255,255,0.15)",
        border: value ? "none" : "1px solid rgba(255,255,255,0.2)",
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
    <p className="text-white/35 text-[9px] font-black uppercase tracking-[0.2em] px-1 pt-4 pb-1">
      {label}
    </p>
  );
}

function SettingRow({ icon: Icon, label, sublabel, value, onChange, color, testId }: {
  icon: any; label: string; sublabel?: string; value: boolean; onChange: (v: boolean) => void; color: string; testId?: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl mb-2"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">{label}</p>
          {sublabel && <p className="text-white/40 text-[10px]">{sublabel}</p>}
        </div>
      </div>
      <GlassToggle value={value} onChange={onChange} testId={testId} />
    </div>
  );
}

function NavRow({ icon: Icon, label, sublabel, color, danger }: {
  icon: any; label: string; sublabel?: string; color: string; danger?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl mb-2 cursor-pointer active:scale-98"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon className={`w-5 h-5 ${danger ? "text-red-400" : "text-white"}`} />
        </div>
        <div>
          <p className={`font-bold text-sm ${danger ? "text-red-400" : "text-white"}`}>{label}</p>
          {sublabel && <p className="text-white/40 text-[10px]">{sublabel}</p>}
        </div>
      </div>
      <ChevronRight className={`w-4 h-4 ${danger ? "text-red-400/50" : "text-white/30"}`} />
    </div>
  );
}

type Tab = "privacy" | "security" | "account";

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [tab, setTab] = useState<Tab>("privacy");
  const [profileLocked, setProfileLocked]     = useState(false);
  const [locationPrivacy, setLocationPrivacy] = useState(false);
  const [hideOnlineStatus, setHideOnlineStatus] = useState(false);
  const [mHeartPrefs, setMHeartPrefs]         = useState(true);
  const [soundEnabled, setSoundEnabled]       = useState(true);
  const [notifPosts, setNotifPosts]           = useState(true);
  const [notifMessages, setNotifMessages]     = useState(true);
  const [twoFactor, setTwoFactor]             = useState(false);

  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

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
          <p className="text-white/40 text-xs">Manage your Facelook account</p>
        </div>
        <button
          data-testid="button-close-settings"
          onClick={onClose}
          className="p-2 rounded-full"
          style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Tab pills */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-4 shrink-0"
        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            style={
              tab === t.key
                ? { background: "linear-gradient(135deg, #00F2FE, #9B51E0)", color: "white" }
                : { color: "rgba(255,255,255,0.4)" }
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
            <SettingRow
              icon={Lock}
              label="Profile Lock"
              sublabel="Blur content for non-friends"
              value={profileLocked}
              onChange={setProfileLocked}
              color="bg-gradient-to-br from-violet-500 to-purple-700"
              testId="toggle-profile-lock"
            />
            <SettingRow
              icon={hideOnlineStatus ? EyeOff : Eye}
              label="Hide Online Status"
              sublabel="Others won't see when you're active"
              value={hideOnlineStatus}
              onChange={setHideOnlineStatus}
              color="bg-gradient-to-br from-slate-500 to-gray-700"
              testId="toggle-hide-status"
            />

            <SectionHeader label="Location & Data" />
            <SettingRow
              icon={MapPin}
              label="Location Privacy"
              sublabel="Hide map tags on your posts"
              value={locationPrivacy}
              onChange={setLocationPrivacy}
              color="bg-gradient-to-br from-cyan-400 to-blue-600"
              testId="toggle-location-privacy"
            />

            <SectionHeader label="Preferences" />
            <SettingRow
              icon={Heart}
              label="M-Heart Matchmaking"
              sublabel="Show matrimony profiles to you"
              value={mHeartPrefs}
              onChange={setMHeartPrefs}
              color="bg-gradient-to-br from-rose-400 to-red-700"
              testId="toggle-mheart-prefs"
            />
            <SettingRow
              icon={soundEnabled ? Volume2 : VolumeX}
              label="Sound Effects"
              sublabel="Tray eject & notification sounds"
              value={soundEnabled}
              onChange={setSoundEnabled}
              color="bg-gradient-to-br from-amber-400 to-orange-600"
              testId="toggle-sound"
            />

            <SectionHeader label="Notifications" />
            <SettingRow
              icon={Bell}
              label="Post Notifications"
              sublabel="Likes, comments on your posts"
              value={notifPosts}
              onChange={setNotifPosts}
              color="bg-gradient-to-br from-teal-400 to-green-600"
              testId="toggle-notif-posts"
            />
            <SettingRow
              icon={Bell}
              label="Message Alerts"
              sublabel="Vibe & chat notifications"
              value={notifMessages}
              onChange={setNotifMessages}
              color="bg-gradient-to-br from-indigo-400 to-blue-700"
              testId="toggle-notif-messages"
            />
          </motion.div>
        )}

        {tab === "security" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <SectionHeader label="Account Security" />
            <SettingRow
              icon={ShieldCheck}
              label="Two-Factor Auth"
              sublabel="Extra layer of protection"
              value={twoFactor}
              onChange={setTwoFactor}
              color="bg-gradient-to-br from-emerald-400 to-green-600"
              testId="toggle-2fa"
            />

            <SectionHeader label="Access" />
            <NavRow icon={KeyRound} label="Change Password" sublabel="Update your login password" color="bg-gradient-to-br from-sky-400 to-blue-600" />
            <NavRow icon={UserCheck} label="Active Sessions" sublabel="See devices logged into your account" color="bg-gradient-to-br from-violet-400 to-purple-600" />
            <NavRow icon={Globe} label="Login History" sublabel="Recent sign-in activity" color="bg-gradient-to-br from-slate-400 to-gray-600" />
            <NavRow icon={Shield} label="Blocked Users" sublabel="Manage your block list" color="bg-gradient-to-br from-orange-400 to-red-600" />
          </motion.div>
        )}

        {tab === "account" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <SectionHeader label="Language" />
            <div
              className="flex items-center justify-between p-4 rounded-2xl mb-2"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <p className="text-white font-bold text-sm">Language</p>
              </div>
              <div className="flex gap-1">
                {(["EN", "हि"] as const).map((l) => (
                  <button
                    key={l}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/60"
                    style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <SectionHeader label="Danger Zone" />
            <NavRow icon={Trash2} label="Delete Account" sublabel="Permanently remove your data" color="bg-red-500/20" danger />

            <div className="mt-4">
              <motion.button
                data-testid="button-signout"
                onClick={handleSignOut}
                whileTap={{ scale: 0.97 }}
                className="w-full p-4 rounded-2xl flex items-center gap-3"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-400" />
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
