from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CropRecommendationRequest(BaseModel):
    N: float = Field(..., ge=0.0, le=250.0, description="Nitrogen content in soil (kg/ha)")
    P: float = Field(..., ge=0.0, le=250.0, description="Phosphorus content in soil (kg/ha)")
    K: float = Field(..., ge=0.0, le=300.0, description="Potassium content in soil (kg/ha)")
    temperature: float = Field(..., ge=-5.0, le=55.0, description="Ambient temperature in °C")
    humidity: float = Field(..., ge=5.0, le=100.0, description="Relative humidity in %")
    ph: float = Field(..., ge=3.0, le=10.0, description="Soil pH level (3.0 - 10.0)")
    rainfall: float = Field(..., ge=0.0, le=600.0, description="Rainfall depth in mm")

class CropRecommendationCandidate(BaseModel):
    crop: str
    display_name: str
    probability_percent: float
    suitability_tier: str

class CropRecommendationResponse(BaseModel):
    recommended_crop: str
    display_name: str
    confidence_percent: float
    top_candidates: List[CropRecommendationCandidate]
    influencing_factors: Dict[str, float]
    agronomic_advisory: str
    regional_disclaimer: str
    model_version: str = "agritwin-crop-rec-rf-v1.0"
