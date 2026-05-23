from pydantic import BaseModel


class PersonalizedFitOut(BaseModel):
    dietary_match: bool
    budget_match: bool
    cuisine_overlap: list[str]
    narrative: str
