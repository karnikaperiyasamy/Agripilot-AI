from pydantic import BaseModel, Field
from typing import List, Optional

class HarvestWindowRequest(BaseModel):
    crop: str = Field(..., example="Basmati Rice")
    sowing_date: str = Field(..., example="2026-06-01")
    growth_stage: str = Field("Fruiting/GrainFilling", example="Fruiting/GrainFilling")
    field_area_acres: float = Field(5.0, example=5.0)
    avg_temperature_c: float = Field(28.0, example=28.0)

class HarvestWindowResponse(BaseModel):
    crop: str
    sowing_date: str
    days_since_sowing: int
    estimated_maturity_days: int
    maturity_percentage: float
    optimal_harvest_start: str
    optimal_harvest_end: str
    shelf_life_ambient_days: int
    shelf_life_cold_storage_days: int
    spoilage_risk_tier: str
    post_harvest_protocols: List[str]
    model_version: str
