from pydantic import BaseModel, Field
from typing import List, Optional

class IrrigationRequest(BaseModel):
    crop: str = Field(..., example="Wheat")
    growth_stage: str = Field("Flowering", example="Flowering")
    soil_type: str = Field("Alluvial", example="Alluvial")
    field_area_acres: float = Field(3.0, example=3.0)
    temperature_c: float = Field(26.0, example=26.0)
    soil_moisture_percent: float = Field(38.0, example=38.0)
    recent_rainfall_mm: float = Field(0.0, example=0.0)

class IrrigationResponse(BaseModel):
    crop: str
    irrigate_today: bool
    urgency: str
    crop_water_requirement_mm_day: float
    recommended_water_depth_mm: float
    recommended_total_liters: float
    estimated_water_savings_drip_liters: float
    scientific_basis: str
    model_version: str
