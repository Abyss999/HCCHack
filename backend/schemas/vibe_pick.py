from pydantic import BaseModel

from schemas.restaurant import RestaurantOut


class VibePickOut(BaseModel):
    restaurant: RestaurantOut
    narrative: str
