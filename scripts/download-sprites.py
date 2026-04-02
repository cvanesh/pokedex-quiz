#!/usr/bin/env python3
"""
Download Pokemon official artwork and generate thumbnails.

Full images: 475x475 PNG (as-is from PokeAPI)
Thumbnails:  128x128 PNG (resized with Pillow)

Usage: python3 scripts/download-sprites.py
"""

import os
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from PIL import Image
from io import BytesIO

TOTAL_POKEMON = 1025
BASE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork"
FULL_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "full")
THUMB_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images", "thumb")
THUMB_SIZE = (128, 128)
MAX_RETRIES = 3
MAX_WORKERS = 10  # Keep concurrency moderate to avoid rate limits


def download_and_resize(pokemon_id):
    full_path = os.path.join(FULL_DIR, f"{pokemon_id}.png")
    thumb_path = os.path.join(THUMB_DIR, f"{pokemon_id}.png")

    # Skip if both already exist
    if os.path.exists(full_path) and os.path.exists(thumb_path):
        return pokemon_id, "skipped"

    url = f"{BASE_URL}/{pokemon_id}.png"

    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "PokedexQuiz/1.0"})
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = resp.read()

            # Save full image
            if not os.path.exists(full_path):
                with open(full_path, "wb") as f:
                    f.write(data)

            # Generate and save thumbnail
            if not os.path.exists(thumb_path):
                img = Image.open(BytesIO(data))
                img.thumbnail(THUMB_SIZE, Image.LANCZOS)
                # Center on transparent 128x128 canvas to keep consistent sizing
                canvas = Image.new("RGBA", THUMB_SIZE, (0, 0, 0, 0))
                offset = ((THUMB_SIZE[0] - img.width) // 2, (THUMB_SIZE[1] - img.height) // 2)
                canvas.paste(img, offset)
                canvas.save(thumb_path, "PNG", optimize=True)

            return pokemon_id, "ok"

        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as e:
            if attempt < MAX_RETRIES - 1:
                time.sleep(2 ** attempt)
            else:
                return pokemon_id, f"FAILED: {e}"


def main():
    os.makedirs(FULL_DIR, exist_ok=True)
    os.makedirs(THUMB_DIR, exist_ok=True)

    ids = list(range(1, TOTAL_POKEMON + 1))
    done = 0
    failed = []

    print(f"Downloading {TOTAL_POKEMON} Pokemon sprites...")
    print(f"  Full:  {os.path.abspath(FULL_DIR)}")
    print(f"  Thumb: {os.path.abspath(THUMB_DIR)}")
    print()

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        futures = {pool.submit(download_and_resize, pid): pid for pid in ids}
        for future in as_completed(futures):
            pid, status = future.result()
            done += 1
            if status == "skipped":
                pass
            elif status == "ok":
                pass
            else:
                failed.append((pid, status))
                print(f"  [!] #{pid}: {status}")

            if done % 50 == 0 or done == TOTAL_POKEMON:
                print(f"  Progress: {done}/{TOTAL_POKEMON}")

    print()
    if failed:
        print(f"Failed: {len(failed)} images")
        for pid, status in sorted(failed):
            print(f"  #{pid}: {status}")
    else:
        print("All sprites downloaded successfully!")

    # Report sizes
    full_size = sum(os.path.getsize(os.path.join(FULL_DIR, f)) for f in os.listdir(FULL_DIR) if f.endswith(".png"))
    thumb_size = sum(os.path.getsize(os.path.join(THUMB_DIR, f)) for f in os.listdir(THUMB_DIR) if f.endswith(".png"))
    print(f"\nFull images:  {full_size / 1024 / 1024:.1f} MB ({len(os.listdir(FULL_DIR))} files)")
    print(f"Thumbnails:   {thumb_size / 1024 / 1024:.1f} MB ({len(os.listdir(THUMB_DIR))} files)")


if __name__ == "__main__":
    main()
