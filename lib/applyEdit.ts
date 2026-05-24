import { prisma } from "@/lib/prisma";

const ALLOWED_FIELDS: Record<string, string[]> = {
  artist: ["stageName", "realName", "bio", "imageUrl", "debutYear"],
  song:   ["title", "lyricsKo", "lyricsEn", "lyricsRomanized", "coverArt"],
  album:  ["title", "coverArt", "releaseYear", "type"],
};

export async function applyFieldEdit(
  entityType: string,
  entityId: string,
  field: string,
  value: string | null,
): Promise<void> {
  const allowed = ALLOWED_FIELDS[entityType];
  if (!allowed || !allowed.includes(field)) {
    throw new Error(`Field "${field}" is not editable on ${entityType}`);
  }

  // Coerce numeric fields
  let coerced: string | number | null = value;
  if (field === "debutYear" || field === "releaseYear") {
    coerced = value ? parseInt(value, 10) : null;
  }

  switch (entityType) {
    case "artist":
      await prisma.artist.update({ where: { id: entityId }, data: { [field]: coerced } });
      break;
    case "song":
      await prisma.song.update({ where: { id: entityId }, data: { [field]: coerced } });
      break;
    case "album":
      await prisma.album.update({ where: { id: entityId }, data: { [field]: coerced } });
      break;
    default:
      throw new Error(`Unknown entityType: ${entityType}`);
  }
}
