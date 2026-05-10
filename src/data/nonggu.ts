import rawData from "./nonggu_clean.json";

export type Fit = "perfect" | "loose" | "tight" | "too_small" | "too_large" | "unknown";

export interface NonGuReview {
  id: number;
  author: string;
  date: string | null;
  rating: number | null;
  breed: string | null;
  gender: "female" | "male" | null;
  weight: number | null;
  chest: number | null;
  back: number | null;
  size: string | null;
  fit: Fit;
  review: string;
  photo: string | null;
}

export const NONGGU_REVIEWS = rawData as NonGuReview[];

// Mined from review data (median weight per size)
export const NONGGU_SIZE_TABLE: Array<{ size: string; weightMin: number; weightMax: number; chestApprox: number }> = [
  { size: "M",   weightMin: 0,  weightMax: 5,   chestApprox: 42 },
  { size: "L",   weightMin: 5,  weightMax: 7,   chestApprox: 48 },
  { size: "XL",  weightMin: 7,  weightMax: 11,  chestApprox: 52 },
  { size: "2XL", weightMin: 11, weightMax: 14,  chestApprox: 58 },
  { size: "3XL", weightMin: 14, weightMax: 18,  chestApprox: 62 },
  { size: "4XL", weightMin: 18, weightMax: 26,  chestApprox: 70 },
  { size: "5XL", weightMin: 26, weightMax: 99,  chestApprox: 78 },
];

export const SIZE_ORDER = ["M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];

export function fitLabel(f: Fit): string {
  switch (f) {
    case "perfect": return "딱 맞음";
    case "loose": return "넉넉함";
    case "tight": return "약간 작음";
    case "too_small": return "작아요";
    case "too_large": return "커요";
    default: return "후기 참고";
  }
}

export function fitTone(f: Fit): "primary" | "soft" | "warn" {
  if (f === "perfect") return "primary";
  if (f === "tight" || f === "too_small") return "warn";
  return "soft";
}

// Mask author handles like "abcd****" -> first 2 chars + ***
export function maskAuthor(a: string | undefined | null): string {
  if (!a) return "익명";
  const clean = String(a).replace(/\*+$/, "");
  return clean.slice(0, 2) + "**님";
}
