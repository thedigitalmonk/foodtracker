import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ExpiryStatus } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return "no-date";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate + "T00:00:00");
  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "expired";
  if (diffDays <= 3) return "expiring-soon";
  return "ok";
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

export function addDaysToToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}
