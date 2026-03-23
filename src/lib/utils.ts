import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Standard Tailwind Merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 🔥 Hook Power Helpers
 * Inka use hum UI mein buttons aur delete icon dikhane ke liye karenge
 */

// 1. Check if they are Hook Partners (GF/BF status)
export const isHookPartner = (relation: any) => {
  return relation?.relation_type === "hook" && relation?.status === "accepted";
};

// 2. Check if a request is a pending Hook Proposal
export const isPendingHook = (relation: any) => {
  return relation?.relation_type === "hook" && relation?.status === "pending";
};

// 3. Special Hook Theme Classes (Dhamakedar Red/Pink UI)
export const hookTheme = {
  border: "border-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)]",
  bg: "bg-gradient-to-r from-rose-500 to-pink-600",
  text: "text-rose-600",
  ring: "ring-rose-200",
};
