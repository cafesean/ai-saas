import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const base64ToArrayBuffer = (base64String: string) => {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

const mimeTypes = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
  "application/pdf": "pdf",
  "application/zip": "zip",
  "text/plain": "txt",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};

export const getFileExtension = (base64String: string) => {
  const mimeType = base64String.split(";")[0]?.split(":")[1];
  return mimeTypes[mimeType as keyof typeof mimeTypes] || "unknown";
};

export const getTimeAgo = (date: Date | string) => {
  const givenTime = dayjs(String(date));
  const now = dayjs();
  const timeAgo = now.to(givenTime);
  return timeAgo;
};

export const isPartialBoolean = (value: string): boolean => {
  const lowerValue = value.toLowerCase();
  return "true".startsWith(lowerValue) || "false".startsWith(lowerValue);
};

export const capitalizeFirstLetterLowercase = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const toPercent = (decimal: number, decimalPlaces = 0) => {
  return (decimal * 100).toFixed(decimalPlaces) + "%";
};

export function formatNumber(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function formatSize(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString() + "B";
}

export const formatName = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}
