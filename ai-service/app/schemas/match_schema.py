from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CandidateItem(BaseModel):
    id: str
    name: str
    crop: str
    quantity: float
    unit_price: float
    latitude: float
    longitude: float
    quality_grade: str

class MatchRequest(BaseModel):
    target_crop: str = Field(..., example="Wheat")
    required_quantity: float = Field(..., example=50.0)
    target_price: float = Field(..., example=2500.0)
    buyer_latitude: float = Field(28.7041, example=28.7041)
    buyer_longitude: float = Field(77.1025, example=77.1025)
    minimum_quality: str = Field("Grade A", example="Grade A")
    candidates: List[CandidateItem]

class MatchItem(BaseModel):
    candidate_id: str
    candidate_name: str
    match_score_percent: float
    distance_km: float
    quantity_fulfillment_percent: float
    price_variance_percent: float
    quality_compatibility: str
    explainable_factors: List[str]

class MatchResponse(BaseModel):
    query_crop: str
    total_candidates_analyzed: int
    top_matches: List[MatchItem]
    model_version: str
