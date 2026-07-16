// Note paths can contain slashes (nested folders inside the vault), so they
// need per-segment encoding when built into a URL - encodeURIComponent alone
// would also escape the slashes themselves.
export function encodeNotePath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
}

// Next.js already URL-decodes each segment of a catch-all route param,
// so joining is all that's needed on the way back.
export function notePathFromSegments(segments: string[]): string {
  return segments.join("/");
}
