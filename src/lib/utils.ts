import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return formatDate(d);
}

export function generateExcerpt(content: string, maxLength = 200): string {
  const plain = content.replace(/[#*_\[\]()>`~]/g, "").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trimEnd() + "...";
}

export function moodToColor(mood: number | null): string {
  if (mood === null) return "var(--color-text-secondary)";
  const ratio = (mood - 1) / 9;
  const r = Math.round(74 + (224 - 74) * ratio);
  const g = Math.round(111 + (122 - 111) * ratio);
  const b = Math.round(165 + (95 - 165) * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}
