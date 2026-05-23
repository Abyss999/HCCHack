"""Fix Perplexity's fake Place IDs by calling Google Places Find-Place per row.

Reads the JSON array embedded in `Demo tasks/perplexity.txt`, queries Places
Find-Place-From-Text for each restaurant, and overwrites google_place_id,
lat, lng, and rating with values from Google's response. Writes the cleaned
data to `scripts/houston_restaurants.json`.

Run once before load_houston.py.
"""
from __future__ import annotations

import json
import os
import re
import sys
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

PLACES_KEY = os.environ["GOOGLE_PLACES_API_KEY"]
FIND_PLACE_URL = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"

SRC = ROOT.parent / "Demo tasks" / "perplexity.txt"
OUT = ROOT / "scripts" / "houston_restaurants.json"


def extract_json_array(text: str) -> list[dict]:
    m = re.search(r"\[\s*\n\s*\{", text)
    if not m:
        raise SystemExit("could not locate JSON array in perplexity.txt")
    start = m.start()
    depth, end = 0, None
    in_str = esc = False
    for i, c in enumerate(text[start:], start):
        if esc:
            esc = False; continue
        if c == "\\" and in_str:
            esc = True; continue
        if c == '"':
            in_str = not in_str; continue
        if in_str:
            continue
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                end = i + 1; break
    return json.loads(text[start:end])


def find_place(client: httpx.Client, name: str, address: str) -> dict | None:
    query = f"{name}, {address}"
    params = {
        "key": PLACES_KEY,
        "input": query,
        "inputtype": "textquery",
        "fields": "place_id,name,geometry/location,rating,formatted_address",
    }
    resp = client.get(FIND_PLACE_URL, params=params, timeout=10.0)
    resp.raise_for_status()
    body = resp.json()
    if body.get("status") not in ("OK", "ZERO_RESULTS"):
        print(f"  ! API status={body.get('status')} error={body.get('error_message')}", file=sys.stderr)
        return None
    candidates = body.get("candidates", [])
    return candidates[0] if candidates else None


def main() -> None:
    rows = extract_json_array(SRC.read_text())
    print(f"loaded {len(rows)} rows from perplexity.txt")

    cleaned: list[dict] = []
    with httpx.Client() as client:
        for i, row in enumerate(rows, 1):
            print(f"[{i}/{len(rows)}] {row['name']}")
            hit = find_place(client, row["name"], row["address"])
            if hit is None:
                print(f"  ! no Google match, dropping")
                continue

            loc = hit.get("geometry", {}).get("location", {})
            row["google_place_id"] = hit["place_id"]
            if "lat" in loc and "lng" in loc:
                row["lat"] = loc["lat"]
                row["lng"] = loc["lng"]
            if "rating" in hit:
                row["rating"] = hit["rating"]
            if hit.get("formatted_address"):
                row["address"] = hit["formatted_address"]
            cleaned.append(row)
            time.sleep(0.05)

    OUT.write_text(json.dumps(cleaned, indent=2))
    print(f"\nwrote {len(cleaned)} cleaned rows to {OUT}")


if __name__ == "__main__":
    main()
