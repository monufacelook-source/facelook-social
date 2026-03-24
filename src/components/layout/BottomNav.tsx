import { motion, AnimatePresence } from "framer-motion";
import { Search, Anchor, Users, Bell, UsersRound, X } from "lucide-react";
import { useState } from "react";
import NotificationPanel from "./NotificationPanel"; // 👈 Sahi path check kar lena

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "search", icon: Search, label: "Search" },
  { id: "hooks", icon: Anchor, label: "Hook Requests" },
  { id: "friends", icon: Users, label: "Friends" },
  { id: "notifications", icon: Bell, label: "Alerts" },
  { id: "groups", icon: UsersRound, label: "Groups" },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Jab alerts par click ho toh drawer khule
  const handleTabClick = (tabId: string) => {
    if (tabId === "notifications") {
      setShowNotifDrawer(true);
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <>
      {/* --- Notification Slide-up Drawer --- */}
      <AnimatePresence>
        {showNotifDrawer && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 mt-10">
              <h2 className="text-xl font-bold text-white">
                Activity Notifications
              </h2>
              <button
                onClick={() => setShowNotifDrawer(false)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
              <NotificationPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Bottom Navigation Bar --- */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/10"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 25 }}
      >
        <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <tab.icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] font-medium relative z-10">
                  {tab.label}
                </span>

                {/* 🔔 Red Dot for Notifications (Optional) */}
                {tab.id === "notifications" && (
                  <span className="absolute top-2 right-4 w-2 h-2 bg-rose-500 rounded-full border border-black shadow-lg" />
                )}
              </motion.button>
            );
          })}
        </div>s
      </motion.nav>
    </>
  );
}
