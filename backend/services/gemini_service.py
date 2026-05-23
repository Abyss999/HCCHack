"""Vibe-pick: pick one restaurant from the group's top-3 using Gemini.

Lazy-fetches Google Places reviews for top-3 candidates on first call and
caches them on the Restaurant document so future demo runs skip the API.
"""
from __future__ import annotations

import json
from typing import Any

import httpx
from fastapi import HTTPException, status

from config import Settings, get_settings
from models.restaurant import Restaurant
from models.user import User

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
PLACE_DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json"


class GeminiService:
    def __init__(self, settings: Settings | None = None) -> None:
        self.settings = settings or get_settings()

    async def vibe_pick(
        self,
        members: list[User],
        top: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """`top` rows are matching_service.get_top_3() output:
        {restaurant: Restaurant, yes_count, total, score_pct}.
        Returns {pick_restaurant_id, name, reasoning}.
        """
        if not self.settings.google_gemini_api_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="GOOGLE_GEMINI_API_KEY is not configured",
            )
        if not top:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No top-3 yet")

        async with httpx.AsyncClient(timeout=15.0) as http:
            for row in top:
                r: Restaurant = row["restaurant"]
                if not r.reviews and self.settings.google_places_api_key:
                    r.reviews = await self._fetch_reviews(http, r.google_place_id)
                    await r.save()

            prompt = self._build_prompt(members, top)
            resp = await http.post(
                f"{GEMINI_URL}?key={self.settings.google_gemini_api_key}",
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.7, "responseMimeType": "application/json"},
                },
            )
            if resp.status_code >= 400:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"Gemini error: {resp.text[:200]}",
                )
            body = resp.json()

        try:
            text = body["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(text)
            pick_name = parsed["pick"]
            reasoning = parsed["reasoning"]
        except (KeyError, IndexError, json.JSONDecodeError) as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Could not parse Gemini response: {exc}",
            ) from exc

        chosen = next(
            (row["restaurant"] for row in top if row["restaurant"].name == pick_name),
            top[0]["restaurant"],
        )
        return {
            "pick_restaurant_id": chosen.id,
            "name": chosen.name,
            "reasoning": reasoning,
        }

    @staticmethod
    async def _fetch_reviews(http: httpx.AsyncClient, place_id: str) -> list[str]:
        from config import get_settings as _s
        resp = await http.get(
            PLACE_DETAILS_URL,
            params={"key": _s().google_places_api_key, "place_id": place_id, "fields": "reviews"},
        )
        if resp.status_code != 200:
            return []
        result = resp.json().get("result", {})
        return [rev.get("text", "")[:600] for rev in (result.get("reviews") or [])[:5]]

    @staticmethod
    def _build_prompt(members: list[User], top: list[dict[str, Any]]) -> str:
        group_prefs = []
        for u in members:
            p = u.preferences
            group_prefs.append({
                "name": u.name,
                "cuisines": p.cuisine_preferences,
                "dietary": p.dietary_restrictions,
                "budget": p.budget_range,
            })

        candidates = []
        for row in top:
            r: Restaurant = row["restaurant"]
            candidates.append({
                "name": r.name,
                "cuisine_tags": r.cuisine_tags,
                "price_tier": r.price_tier,
                "rating": r.rating,
                "vibe_blurb": r.vibe_blurb,
                "menu_highlights": r.menu[:5],
                "reviews": r.reviews[:5],
                "group_yes_pct": row["score_pct"],
            })

        return (
            "You are picking one restaurant for a group based on vibe, group preferences, "
            "and real customer reviews. The group already voted; here are their top 3.\n\n"
            f"GROUP MEMBERS AND PREFERENCES:\n{json.dumps(group_prefs, indent=2)}\n\n"
            f"TOP 3 CANDIDATES (with reviews):\n{json.dumps(candidates, indent=2)}\n\n"
            "Pick the ONE restaurant whose vibe + menu + reviews best fit the group. "
            "Weigh reviews heavily (they're real). Tie-break with group_yes_pct.\n\n"
            'Respond ONLY with JSON: {"pick": "<exact restaurant name>", "reasoning": "<2 sentences explaining the pick based on vibe and reviews>"}'
        )


def get_gemini_service() -> GeminiService:
    return GeminiService()
