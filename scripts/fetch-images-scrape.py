#!/usr/bin/env python3
"""
fetch-images-scrape.py
======================
Scrapes K-pop artist/album images from reference sites using Scrapling,
supplementing the Wikipedia + iTunes sources in fetch-images.ts.

Sources (in priority order per artist):
  1. K-pop Fandom Wiki API  — kpop.fandom.com/api.php  (MediaWiki, no browser needed)
  2. Kprofiles.com          — scrapled via Scrapling Fetcher (static HTML, og:image)
  3. AllKpop.com            — scrapled via Scrapling StealthyFetcher (JS-rendered)

Output:
  scripts/scrapling-images-cache.json
  { "artist-slug": "https://...", "album-slug": "https://...", ... }

  fetch-images.ts reads this cache as a third-tier fallback.

Usage:
  python3 scripts/fetch-images-scrape.py
  python3 scripts/fetch-images-scrape.py --only-missing    # skip slugs already in cache
  python3 scripts/fetch-images-scrape.py --slugs btob,the-boyz,kiss-of-life

Install:
  pip install "scrapling[fetchers]"
  scrapling install
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Optional

# ── Scrapling import ──────────────────────────────────────────────────────────
try:
    from scrapling.fetchers import Fetcher, StealthyFetcher
except ImportError:
    print("ERROR: scrapling not installed. Run: pip install 'scrapling[fetchers]'", file=sys.stderr)
    sys.exit(1)

CACHE_FILE = Path(__file__).parent / "scrapling-images-cache.json"

# ── Source 1: K-pop Fandom Wiki ───────────────────────────────────────────────
# kpop.fandom.com uses the MediaWiki API — same protocol as Wikipedia.
# Titles are case-sensitive; use the exact page name.
ARTIST_FANDOM: dict[str, str] = {
    # ── Groups — originally no Wikipedia image ────────────────────────────────
    "boynextdoor":   "BOYNEXTDOOR",
    "kiss-of-life":  "KISS OF LIFE",
    "tws":           "TWS",
    "block-b":       "Block B",
    "cravity":       "CRAVITY",
    "bap":           "B.A.P",
    "the-boyz":      "THE BOYZ",
    "plave":         "PLAVE",
    # ── All major groups (Fandom as backup when Wikipedia image breaks) ────────
    "bts":              "BTS",
    "blackpink":        "BLACKPINK",
    "twice":            "TWICE",
    "aespa":            "Aespa",
    "newjeans":         "NewJeans",
    "seventeen":        "SEVENTEEN",
    "ive":              "IVE",
    "itzy":             "ITZY",
    "stray-kids":       "Stray Kids",
    "txt":              "Tomorrow X Together",
    "enhypen":          "ENHYPEN",
    "le-sserafim":      "Le Sserafim",
    "g-i-dle":          "(G)I-DLE",
    "ateez":            "ATEEZ",
    "red-velvet":       "Red Velvet",
    "nct-127":          "NCT 127",
    "nct-dream":        "NCT Dream",
    "girls-generation": "Girls' Generation",
    "shinee":           "SHINee",
    "exo":              "EXO",
    "mamamoo":          "MAMAMOO",
    "sistar":           "SISTAR",
    "2ne1":             "2NE1",
    "bigbang":          "BIGBANG",
    "winner":           "WINNER",
    "ikon":             "iKON",
    "monsta-x":         "Monsta X",
    "day6":             "DAY6",
    "got7":             "GOT7",
    "illit":            "ILLIT",
    "babymonster":      "BABYMONSTER",
    "zerobaseone":      "ZEROBASEONE",
    "riize":            "RIIZE",
    "fx":               "f(x)",
    "miss-a":           "Miss A",
    "apink":            "Apink",
    "nmixx":            "NMIXX",
    "kiiikiii":         "KiiiKiii",
    "dreamcatcher":     "Dreamcatcher",
    "everglow":         "EVERGLOW",
    "nuest":            "NU'EST",
    "gfriend":          "GFriend",
    "lovelyz":          "Lovelyz",
    "izone":            "IZ*ONE",
    "wanna-one":        "Wanna One",
    "fromis-9":         "fromis_9",
    "exid":             "EXID",
    "btob":             "BTOB",
    "ladies-code":      "Ladies' Code",
    "akmu":             "Akdong Musician",
    "oh-my-girl":       "Oh My Girl",
    "stayc":            "STAYC",
    "pentagon":         "PENTAGON",
    "treasure":         "TREASURE",
    "hearts2hearts":    "Hearts2Hearts",
    "katseye":          "KATSEYE",
    # ── Solo artists ──────────────────────────────────────────────────────────
    "lisa":             "Lisa (rapper)",
    "iu":               "IU (singer)",
    "g-dragon":         "G-Dragon",
    "taeyang":          "Taeyang",
    "zico":             "Zico",
    "hyuna":            "HyunA",
    # ── BTS solos ─────────────────────────────────────────────────────────────
    "rm-bts":       "RM (rapper)",
    "jin-bts":      "Jin (singer)",
    "suga-bts":     "Suga (rapper)",
    "j-hope-bts":   "J-Hope",
    "jimin-bts":    "Jimin",
    "v-bts":        "V (singer)",
    "jungkook-bts": "Jungkook",
    # ── BLACKPINK solos ───────────────────────────────────────────────────────
    "jisoo-blackpink":  "Jisoo",
    "jennie-blackpink": "Jennie (rapper)",
    "rose-blackpink":   "Rosé (singer)",
    "lisa-blackpink":   "Lisa (rapper)",
    # ── TWICE members ─────────────────────────────────────────────────────────
    "nayeon-twice":  "Nayeon",
    "momo-twice":    "Momo (singer)",
    "sana-twice":    "Sana (singer)",
    "jihyo-twice":   "Jihyo",
    "mina-twice":    "Mina (singer)",
    "dahyun-twice":  "Dahyun",
    "tzuyu-twice":   "Tzuyu",
    # ── aespa members ─────────────────────────────────────────────────────────
    "karina-aespa":  "Karina (singer)",
    "winter-aespa":  "Winter (singer)",
    "giselle-aespa": "Giselle (singer)",
    # ── SEVENTEEN members (some have no Wikipedia image) ──────────────────────
    "mingyu-svt":    "Mingyu_(SEVENTEEN)",
    "jeonghan-svt":  "Jeonghan",
    "wonwoo-svt":    "Wonwoo_(SEVENTEEN)",
    "dokyeom-svt":   "DK_(SEVENTEEN)",
    "s-coups-svt":   "S.Coups",
    "woozi-svt":     "Woozi",
    "hoshi-svt":     "Hoshi (singer)",
    "joshua-svt":    "Joshua (singer)",
    "seungkwan-svt": "Seungkwan",
    # ── LE SSERAFIM members ───────────────────────────────────────────────────
    "sakura-lsf":  "Miyawaki Sakura",
    "chaewon-lsf": "Kim Chae-won",
    "yunjin-lsf":  "Huh Yun-jin",
    # ── Red Velvet members ────────────────────────────────────────────────────
    "seulgi-rv": "Seulgi",
    "wendy-rv":  "Wendy (singer)",
    "joy-rv":    "Joy (singer)",
    "yeri-rv":   "Yeri",
    # ── IVE members ───────────────────────────────────────────────────────────
    "wonyoung-ive": "Jang Wonyoung",
    "yujin-ive":    "An Yujin",
    # ── MAMAMOO members ───────────────────────────────────────────────────────
    "solar-mamamoo":    "Solar (singer)",
    "moonbyul-mamamoo": "Moonbyul",
    "wheein-mamamoo":   "Wheein",
    # ── NewJeans members ──────────────────────────────────────────────────────
    "minji-newjeans":    "Minji (singer)",
    "hanni-newjeans":    "Hanni (singer)",
    "danielle-newjeans": "Danielle (singer)",
    "haerin-newjeans":   "Haerin",
    # ── (G)I-DLE members ──────────────────────────────────────────────────────
    "soyeon-gidle": "Jeon Soyeon",
    "miyeon-gidle": "Miyeon",
    "minnie-gidle": "Minnie (singer)",
    # ── BIGBANG members ───────────────────────────────────────────────────────
    "g-dragon":    "G-Dragon",
    "taeyang":     "Taeyang",
    "top-bigbang": "T.O.P",
    "daesung":     "Daesung",
    "seungri":     "Seungri",
    # ── Collaborators ─────────────────────────────────────────────────────────
    "teddy-park":   "Teddy Park",
    "slushii":      "Slushii",
    "pharrell":     "Pharrell Williams",
    "diplo":        "Diplo",
    "ryan-tedder":  "Ryan Tedder",
    "nile-rodgers": "Nile Rodgers",
    "hui":          "Hui (singer)",
}

# ── Source 2: Kprofiles.com ───────────────────────────────────────────────────
# Scrapled via Scrapling Fetcher (static HTML, og:image tag).
# URL path: kprofiles.com/{path}/   (trailing slash matters)
ARTIST_KPROFILES: dict[str, str] = {
    # Groups
    "bts":              "bts-members-profile",
    "blackpink":        "blackpink-members-profile",
    "twice":            "twice-members-profile",
    "aespa":            "aespa-members-profile",
    "newjeans":         "newjeans-members-profile",
    "seventeen":        "seventeen-members-profile",
    "ive":              "ive-members-profile",
    "itzy":             "itzy-members-profile",
    "stray-kids":       "stray-kids-members-profile",
    "txt":              "txt-members-profile",
    "enhypen":          "enhypen-members-profile",
    "le-sserafim":      "le-sserafim-members-profile",
    "g-i-dle":          "g-i-dle-members-profile",
    "ateez":            "ateez-members-profile",
    "red-velvet":       "red-velvet-members-profile",
    "nct-127":          "nct-127-members-profile",
    "nct-dream":        "nct-dream-members-profile",
    "girls-generation": "girls-generation-members-profile",
    "shinee":           "shinee-members-profile",
    "exo":              "exo-members-profile",
    "mamamoo":          "mamamoo-members-profile",
    "sistar":           "sistar-members-profile",
    "2ne1":             "2ne1-members-profile",
    "bigbang":          "bigbang-members-profile",
    "winner":           "winner-members-profile",
    "ikon":             "ikon-members-profile",
    "monsta-x":         "monsta-x-members-profile",
    "day6":             "day6-members-profile",
    "got7":             "got7-members-profile",
    "illit":            "illit-members-profile",
    "babymonster":      "babymonster-members-profile",
    "zerobaseone":      "zerobaseone-members-profile",
    "riize":            "riize-members-profile",
    "nmixx":            "nmixx-members-profile",
    "kiiikiii":         "kiiikiii-members-profile",
    "dreamcatcher":     "dreamcatcher-members-profile",
    "everglow":         "everglow-members-profile",
    "boynextdoor":      "boynextdoor-members-profile",
    "kiss-of-life":     "kiss-of-life-members-profile",
    "tws":              "tws-members-profile",
    "nuest":            "nuest-members-profile",
    "gfriend":          "gfriend-members-profile",
    "lovelyz":          "lovelyz-members-profile",
    "izone":            "iz-one-members-profile",
    "wanna-one":        "wanna-one-members-profile",
    "fromis-9":         "fromis_9-members-profile",
    "block-b":          "block-b-members-profile",
    "exid":             "exid-members-profile",
    "btob":             "btob-members-profile",
    "ladies-code":      "ladies-code-members-profile",
    "oh-my-girl":       "oh-my-girl-members-profile",
    "cravity":          "cravity-members-profile",
    "stayc":            "stayc-members-profile",
    "bap":              "b-a-p-members-profile",
    "pentagon":         "pentagon-members-profile",
    "the-boyz":         "the-boyz-members-profile",
    "treasure":         "treasure-members-profile",
    "plave":            "plave-members-profile",
    "hearts2hearts":    "hearts2hearts-members-profile",
    "katseye":          "katseye-members-profile",
    "fx":               "f-x-members-profile",
    "miss-a":           "miss-a-members-profile",
    "apink":            "apink-members-profile",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def fetch_fandom_image(title: str, size: int = 600) -> str | None:
    """Call the K-pop Fandom MediaWiki API (no scraping required)."""
    url = (
        "https://kpop.fandom.com/api.php"
        f"?action=query&titles={urllib.parse.quote(title)}"
        f"&prop=pageimages&format=json&pithumbsize={size}&redirects=1"
    )
    req = urllib.request.Request(
        url, headers={"User-Agent": "AegyoArena/1.0 (+https://aegyoarena.com)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        pages = data.get("query", {}).get("pages", {})
        page = list(pages.values())[0]
        if "missing" in page:
            return None
        return page.get("thumbnail", {}).get("source")
    except Exception:
        return None


def fetch_kprofiles_image(path: str, fetcher: "Fetcher") -> str | None:
    """Scrape og:image from a kprofiles.com group profile page."""
    url = f"https://kprofiles.com/{path}/"
    try:
        page = fetcher.get(url)
        og = page.find('meta[property="og:image"]')
        if og:
            src = og.attrib.get("content", "").strip()
            return src if src.startswith("http") else None
        return None
    except Exception:
        return None


async def fetch_allkpop_image(slug: str, stage_name: str) -> str | None:
    """Scrape og:image from AllKpop artist page using StealthyFetcher."""
    url = f"https://www.allkpop.com/artists/{slug}"
    try:
        fetcher = StealthyFetcher()
        page = await fetcher.async_fetch(url)
        og = page.find('meta[property="og:image"]')
        if og:
            src = og.attrib.get("content", "").strip()
            return src if src.startswith("http") and "allkpop" in src else None
        return None
    except Exception:
        return None


# ── Main ──────────────────────────────────────────────────────────────────────

def load_cache() -> dict:
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text())
    return {}


def save_cache(cache: dict) -> None:
    CACHE_FILE.write_text(json.dumps(cache, indent=2, ensure_ascii=False))
    print(f"  → Cache saved to {CACHE_FILE}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrapling image fetcher for Aegyo Arena")
    parser.add_argument("--only-missing", action="store_true",
                        help="Skip slugs already in the cache")
    parser.add_argument("--slugs", default="",
                        help="Comma-separated list of artist slugs to process")
    parser.add_argument("--source", choices=["fandom", "kprofiles", "all"], default="all",
                        help="Which source(s) to use (default: all)")
    args = parser.parse_args()

    cache = load_cache()
    fetcher = Fetcher(auto_match=False)

    # Build the target slug list
    if args.slugs:
        targets = [s.strip() for s in args.slugs.split(",")]
    else:
        # Union of all slugs across all source maps
        targets = sorted(set(ARTIST_FANDOM.keys()) | set(ARTIST_KPROFILES.keys()))

    if args.only_missing:
        targets = [s for s in targets if s not in cache or not cache[s]]

    print(f"🔍  Scrapling image fetch — {len(targets)} artists\n")
    updated = 0
    skipped = 0

    for slug in targets:
        fandom_title   = ARTIST_FANDOM.get(slug)
        kprofiles_path = ARTIST_KPROFILES.get(slug)

        if not fandom_title and not kprofiles_path:
            skipped += 1
            continue

        img: str | None = None
        sources_tried: list[str] = []

        # ── Source 1: Fandom API ──────────────────────────────────────────────
        if args.source in ("fandom", "all") and fandom_title:
            sources_tried.append("fandom")
            img = fetch_fandom_image(fandom_title)
            time.sleep(0.25)   # gentle rate limit

        # ── Source 2: Kprofiles ───────────────────────────────────────────────
        if not img and args.source in ("kprofiles", "all") and kprofiles_path:
            sources_tried.append("kprofiles")
            img = fetch_kprofiles_image(kprofiles_path, fetcher)
            time.sleep(0.5)

        if img:
            cache[slug] = img
            print(f"  ✓  {slug:30s}  ({sources_tried[-1]})  {img[:70]}")
            updated += 1
        else:
            print(f"  ·  {slug:30s}  no image  (tried: {', '.join(sources_tried)})")
            skipped += 1

    save_cache(cache)
    print(f"\n✅  Done — {updated} updated, {skipped} skipped")
    print(f"   Cache: {CACHE_FILE}")
    print("\nNext step: run fetch-images.ts to apply the cache to the DB.")


if __name__ == "__main__":
    main()
