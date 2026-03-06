const FALLBACK_BASE_URL = "http://localhost:5050";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const normalizedBaseUrl =
  rawBaseUrl && rawBaseUrl !== "undefined" ? rawBaseUrl : FALLBACK_BASE_URL;
const BASE_URL = normalizedBaseUrl.replace(/\/+$/, "");

const normalizeMediaPath = (path: string) => {
  let normalized = path.trim();

  // Defensive fix for bad relative paths like "undefined/uploads/..."
  // or "/admin/undefined/uploads/..." seen in client logs.
  normalized = normalized
    .replace(/^\/admin\/undefined\//i, "/")
    .replace(/^admin\/undefined\//i, "/")
    .replace(/^\/undefined\//i, "/")
    .replace(/^undefined\//i, "/");

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  return normalized;
};

export const resolveMediaUrl = (path?: string | null) => {
  if (!path) return "";

  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }

  const cleanPath = normalizeMediaPath(path);
  return `${BASE_URL}${cleanPath}`;
};
