import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, MapPin, Heart, Volume2, VolumeX, LogOut, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsPanelProps {
  onClose: () => void;
}

function GlassToggle({
  value,
  onChange,
  testId,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  testId?: string;
}) {
  return (
    <button
      data-testid={testId}
      onClick={() => onChange(!value)}
      className={`relative w-13 h-7 rounded-full transition-colors duration-300 flex items-center px-1 shrink-0 ${value ? "bg-gradient-to-r from-[#00F2FE] to-[#9B51E0]" : "bg-white/20 border border-white/30"}`}
      style={{ minWidth: "52px" }}
    >
      <motion.div
        animate={{ x: value ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        className="w-5 h-5 rounded-full bg-white shadow-md"
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  label,
  sublabel,
  value,
  onChange,
  color,
  testId,
}: {
  icon: any;
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  color: string;
  testId?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">{label}</p>
          {sublabel && <p className="text-white/50 text-[10px]">{sublabel}</p>}
        </div>
      </div>
      <GlassToggle value={value} onChange={onChange} testId={testId} />
    </div>
  );
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [profileLocked, setProfileLocked] = useState(false);
  const [locationPrivacy, setLocationPrivacy] = useState(false);
  const [mHeartPrefs, setMHeartPrefs] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-black text-xl italic tracking-tight">Settings</h2>
          <p className="text-white/50 text-xs">Facelook Privacy & Controls</p>
        </div>
        <button
          data-testid="button-close-settings"
          onClick={onClose}
          className="bg-white/10 border border-white/20 p-2 rounded-full"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto">
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest px-1">
          Privacy
        </p>

        <SettingRow
          icon={Lock}
          label="Profile Lock"
          sublabel="Blur your profile for non-friends"
          value={profileLocked}
          onChange={setProfileLocked}
          color="bg-gradient-to-br from-violet-500 to-purple-700"
          testId="toggle-profile-lock"
        />

        <SettingRow
          icon={MapPin}
          label="Location Privacy"
          sublabel="Hide Google Maps tags on posts"
          value={locationPrivacy}
          onChange={setLocationPrivacy}
          color="bg-gradient-to-br from-cyan-400 to-blue-600"
          testId="toggle-location-privacy"
        />

        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest px-1 pt-2">
          Preferences
        </p>

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

        <div className="pt-4">
          <motion.button
            data-testid="button-signout"
            onClick={handleSignOut}
            whileTap={{ scale: 0.97 }}
            className="w-full p-4 bg-red-500/20 border border-red-400/30 rounded-2xl flex items-center gap-3 text-red-400"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-400" />
            </div>
            <span className="font-bold text-sm">Sign Out</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
