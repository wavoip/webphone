import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullnameLetters(fullName: string | undefined | null) {
  if (!fullName) return "?";

  const parts = fullName.trim().split(/\s+/);

  if (parts.length === 1) {
    const name = parts[0];
    if (name.length === 1) {
      return name.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  const first = parts[0][0];
  const last = parts[parts.length - 1][0];

  return (first + last).toUpperCase();
}
