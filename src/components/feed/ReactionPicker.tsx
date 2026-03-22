import { motion, AnimatePresence } from "framer-motion";

interface ReactionPickerProps {
  isOpen: boolean;
  onSelect: (reaction: string) => void;
  onClose: () => void;
}

const reactions = [
  { id: "heart", emoji: "❤️", label: "Heart" },
  { id: "cry", emoji: "😢", label: "Cry" },
  { id: "sad", emoji: "😔", label: "Sad" },
  { id: "happy", emoji: "😄", label: "Happy" },
  { id: "chappal", emoji: "🩴", label: "Chappal" },
];

export default function ReactionPicker({ isOpen, onSelect, onClose }: ReactionPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute bottom-12 left-0 z-40 glass-strong rounded-2xl px-2 py-2 flex gap-1"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {reactions.map((r, i) => (
              <motion.button
                key={r.id}
                onClick={() => onSelect(r.id)}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.3, y: -4 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-2xl">{r.emoji}</span>
                <span className="text-[8px] text-muted-foreground">{r.label}</span>
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
