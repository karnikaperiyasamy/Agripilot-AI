from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SimulationScenarioInput(BaseModel):
    scenario_name: str = Field(..., example="Optimized Drip + Precision Nutrients")
    crop: str = Field("Basmati Rice", example="Basmati Rice")
    area_acres: float = Field(5.0, example=5.0)
    irrigation_method: str = Field("Drip", example="Drip")
    fertilizer_intensity: str = Field("Optimized", example="Optimized") # Low, Conventional, Optimized
    expected_mandi_price: float = Field(4200.0, example=4200.0)
    selling_timing: str = Field("Post-Harvest Storage (+30d)", example="Post-Harvest Storage (+30d)") # Immediate, Post-Harvest Storage (+30d)

class SimulationScenarioResult(BaseModel):
    scenario_name: str
    estimated_yield_total: float
    unit: str
    total_revenue: float
    total_costs: float
    net_profit: float
    profit_margin_percent: float
    water_consumption_liters: float
    risk_level: str
    key_advantages: List[str]
    tradeoffs: List[str]

class WhatIfSimulationRequest(BaseModel):
    baseline: SimulationScenarioInput
    alternatives: List[SimulationScenarioInput]

class WhatIfSimulationResponse(BaseModel):
    baseline_result: SimulationScenarioResult
    alternative_results: List[SimulationScenarioResult]
    recommended_scenario: str
    expected_profit_gain: float
    explanation: str
