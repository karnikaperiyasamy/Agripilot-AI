from fastapi import APIRouter, HTTPException
from app.schemas.pest_schema import PestRiskRequest, PestRiskResponse
from app.models.pest_model import evaluate_pest_risk

router = APIRouter(prefix="/pest-risk", tags=["Pest & Stress Risk ML"])

@router.post("", response_model=PestRiskResponse)
def get_pest_risk(req: PestRiskRequest):
    try:
        return evaluate_pest_risk(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pest risk prediction error: {str(e)}")
