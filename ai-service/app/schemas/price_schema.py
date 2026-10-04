from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class PriceForecastRequest(BaseModel):
    crop: str = Field(..., example="Wheat")
    mandi: str = Field("Khanna (Punjab)", example="Khanna (Punjab)")
    current_price: float = Field(2450.0, example=2450.0)
    lag_7d_price: Optional[float] = None
    lag_14d_price: Optional[float] = None
    lag_30d_price: Optional[float] = None
    arrival_volume_quintals: Optional[float] = 2500.0

class PriceForecastResponse(BaseModel):
    crop: str
    mandi: str
    current_price: float
    forecast_7d: float
    forecast_14d: float
    forecast_30d: float
    expected_trend: str
    confidence_interval_lower_14d: float
    confidence_interval_upper_14d: float
    sell_now_vs_wait_recommendation: str
    rationale: str
    model_version: str
