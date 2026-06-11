import LZString from "lz-string";

export function compressMarkdown(markdown: string): string {
  return LZString.compressToEncodedURIComponent(markdown);
}

export function decompressMarkdown(compressed: string): string | null {
  return LZString.decompressFromEncodedURIComponent(compressed);
}

export function buildShareUrl(markdown: string): string {
  const compressed = compressMarkdown(markdown);
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL ?? "";
  return `${base}/share?d=${compressed}`;
}
