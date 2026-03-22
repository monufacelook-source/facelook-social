import { motion } from "framer-motion";
import { Search, Anchor, Users, Bell, UsersRound } from "lucide-react";

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
  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-40 glass-strong"
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
              onClick={() => onTabChange(tab.id)}
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
              <span className="text-[10px] font-medium relative z-10">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
