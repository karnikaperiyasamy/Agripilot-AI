from pydantic import BaseModel, Field
from typing import List, Optional

class PestRiskRequest(BaseModel):
    crop: str = Field(..., example="Rice")
    growth_stage: str = Field("Vegetative", example="Tillering/Branching")
    temperature_c: float = Field(29.0, example=29.0)
    humidity_percent: float = Field(82.0, example=82.0)
    rainfall_7d_mm: float = Field(45.0, example=45.0)
    soil_moisture_percent: float = Field(65.0, example=65.0)
    leaf_wetness_hours: float = Field(6.0, example=6.0)

class PestRiskResponse(BaseModel):
    crop: str
    growth_stage: str
    risk_tier: str
    risk_score: float
    likely_stress: str
    primary_threats: List[str]
    management_advice: List[str]
    recommended_inspections: List[str]
    model_version: str
