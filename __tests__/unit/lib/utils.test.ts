import { resolveMediaUrl } from "@/lib/utils";

const getExpectedBaseUrl = () => {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const normalizedBaseUrl =
    rawBaseUrl && rawBaseUrl !== "undefined"
      ? rawBaseUrl
      : "http://localhost:5050";

  return normalizedBaseUrl.replace(/\/+$/, "");
};

describe("resolveMediaUrl", () => {
  it("returns empty string when path is missing", () => {
    expect(resolveMediaUrl()).toBe("");
    expect(resolveMediaUrl(null)).toBe("");
    expect(resolveMediaUrl("")).toBe("");
  });

  it("returns absolute URLs unchanged", () => {
    const absolute = "https://cdn.example.com/image.jpg";
    expect(resolveMediaUrl(absolute)).toBe(absolute);
  });

  it("returns data URLs unchanged", () => {
    const dataUrl = "data:image/png;base64,abcd";
    expect(resolveMediaUrl(dataUrl)).toBe(dataUrl);
  });

  it("normalizes malformed undefined prefixed paths", () => {
    const result = resolveMediaUrl("undefined/uploads/avatar.png");
    expect(result).toBe(`${getExpectedBaseUrl()}/uploads/avatar.png`);
  });

  it("normalizes admin undefined prefixed paths", () => {
    const result = resolveMediaUrl("/admin/undefined/uploads/avatar.png");
    expect(result).toBe(`${getExpectedBaseUrl()}/uploads/avatar.png`);
  });

  it("adds a leading slash for relative media paths", () => {
    const result = resolveMediaUrl("uploads/photos/cover.jpg");
    expect(result).toBe(`${getExpectedBaseUrl()}/uploads/photos/cover.jpg`);
  });
});
