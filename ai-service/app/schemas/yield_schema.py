from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class YieldPredictionRequest(BaseModel):
    crop: str = Field(..., example="Basmati Rice")
    soil_type: str = Field("Alluvial", example="Alluvial")
    irrigation_type: str = Field("Drip", example="Drip")
    area_acres: float = Field(..., gt=0, example=5.0)
    rainfall_mm: float = Field(750.0, example=750.0)
    temperature_c: float = Field(28.0, example=28.0)
    nitrogen_kg: float = Field(120.0, example=120.0)
    phosphorus_kg: float = Field(50.0, example=50.0)
    potassium_kg: float = Field(50.0, example=50.0)

class YieldPredictionResponse(BaseModel):
    crop: str
    area_acres: float
    estimated_yield_per_acre: float
    total_estimated_yield: float
    unit: str
    confidence_interval_min: float
    confidence_interval_max: float
    r2_score: float
    key_factors: List[str]
    model_version: str
