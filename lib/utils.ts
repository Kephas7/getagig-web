const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

export const resolveMediaUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    // Ensure we don't have double slashes
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${BASE_URL}/${cleanPath}`;
};
