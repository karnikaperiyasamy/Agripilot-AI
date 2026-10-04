from fastapi import APIRouter, HTTPException
from app.schemas.simulation_schema import WhatIfSimulationRequest, WhatIfSimulationResponse
from app.models.simulation_model import simulate_what_if_scenarios

router = APIRouter(prefix="/simulate-decision", tags=["What-If Decision Simulator"])

@router.post("", response_model=WhatIfSimulationResponse)
def run_simulation(req: WhatIfSimulationRequest):
    try:
        return simulate_what_if_scenarios(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation calculation error: {str(e)}")
