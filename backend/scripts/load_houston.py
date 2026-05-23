"""Seed the Atlas `restaurants` collection from the enriched Houston JSON.

For each row, also fetches a photo_reference via Place Details so the Swift app
gets real restaurant images. Skips this lookup if photo_url is already set
(makes the script idempotent and safe to re-run).
"""
from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")

import sys
sys.path.insert(0, str(ROOT))

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from models.restaurant import Restaurant

PLACES_KEY = os.environ["GOOGLE_PLACES_API_KEY"]
PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"
PLACE_PHOTO_URL = "https://maps.googleapis.com/maps/api/place/photo"
DATA = ROOT / "scripts" / "houston_restaurants.json"


def photo_url(client: httpx.Client, place_id: str) -> str | None:
    resp = client.get(
        PLACE_DETAILS_URL,
        params={"key": PLACES_KEY, "place_id": place_id, "fields": "photos"},
        timeout=10.0,
    )
    body = resp.json()
    photos = body.get("result", {}).get("photos") or []
    if not photos:
        return None
    ref = photos[0].get("photo_reference")
    if not ref:
        return None
    return f"{PLACE_PHOTO_URL}?maxwidth=800&photoreference={ref}&key={PLACES_KEY}"


async def main() -> None:
    rows = json.loads(DATA.read_text())
    print(f"seeding {len(rows)} restaurants")

    url = os.environ["MONGO_URL_ATLAS"]
    db_name = os.environ.get("MONGO_DB_NAME", "dishmatch")
    client = AsyncIOMotorClient(url, uuidRepresentation="standard", tz_aware=True)
    await init_beanie(database=client[db_name], document_models=[Restaurant])

    inserted = updated = 0
    with httpx.Client() as http:
        for row in rows:
            existing = await Restaurant.find_one(Restaurant.google_place_id == row["google_place_id"])
            if existing is None:
                purl = photo_url(http, row["google_place_id"])
                doc = Restaurant(
                    google_place_id=row["google_place_id"],
                    name=row["name"],
                    cuisine_tags=row["cuisine_tags"],
                    price_tier=row.get("price_tier"),
                    rating=row.get("rating"),
                    photo_url=purl,
                    address=row.get("address"),
                    lat=row["lat"],
                    lng=row["lng"],
                    menu=row.get("menu", []),
                    vibe_blurb=row.get("vibe_blurb"),
                    reviews=[],
                    menu_reviews=row.get("menu_reviews", []),
                    overall_vibe_quotes=row.get("overall_vibe_quotes", []),
                    is_seed=True,
                )
                await doc.insert()
                inserted += 1
                print(f"  + {row['name']}")
            else:
                existing.name = row["name"]
                existing.cuisine_tags = row["cuisine_tags"]
                existing.price_tier = row.get("price_tier")
                existing.rating = row.get("rating")
                existing.address = row.get("address")
                existing.lat = row["lat"]
                existing.lng = row["lng"]
                existing.menu = row.get("menu", [])
                existing.vibe_blurb = row.get("vibe_blurb")
                existing.menu_reviews = row.get("menu_reviews", [])
                existing.overall_vibe_quotes = row.get("overall_vibe_quotes", [])
                existing.is_seed = True
                if not existing.photo_url:
                    existing.photo_url = photo_url(http, row["google_place_id"])
                await existing.save()
                updated += 1
                print(f"  ~ {row['name']}")

    print(f"\ndone. inserted={inserted} updated={updated}")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
