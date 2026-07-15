import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(n: number): string {
  return `${Math.round(n)}%`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function getStatusColor(value: number): "green" | "yellow" | "red" {
  if (value < 60) return "green";
  if (value < 80) return "yellow";
  return "red";
}

export function getRiskLabel(score: number): string {
  if (score < 30) return "Low";
  if (score < 60) return "Moderate";
  if (score < 80) return "High";
  return "Critical";
}

export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}
