// Curated videos attached to a specific artist or song page — official dance
// practices, showcases, fancams, reels. Rendered by <EntityVideos>; stored in the
// self-healing Video table (lib/videos-db.ts). Reuses the site's existing embed
// kinds (YouTube / Instagram / TikTok). Client-safe: types only, no DB imports.
export type VideoKind = "youtube" | "instagram" | "tiktok";

export type VideoItem = {
  kind: VideoKind;
  ref: string; // youtube video id | instagram permalink | tiktok url
  title: string | null;
  titleEs: string | null;
  note: string | null; // short context line under the embed
  noteEs: string | null;
};
