import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GoldenButtonProps {
  children: ReactNode;
  onClick: () => void;
  position: "left" | "right";
}

export default function GoldenButton({ children, onClick, position }: GoldenButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="golden-btn w-11 h-11 flex items-center justify-center z-50 fixed top-4"
      style={{ [position]: "1rem" }}
      whileHover={{ scale: 1.1, rotate: position === "left" ? -15 : 15 }}
      whileTap={{ scale: 0.92 }}
      animate={{ rotate: [0, 3, -3, 0] }}
      transition={{ rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
    >
      {children}
    </motion.button>
  );
}
