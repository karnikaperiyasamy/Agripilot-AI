from fastapi import APIRouter, HTTPException
from app.schemas.irrigation_schema import IrrigationRequest, IrrigationResponse
from app.models.irrigation_model import calculate_irrigation_decision

router = APIRouter(prefix="/irrigation-decision", tags=["FAO-56 Irrigation Engine"])

@router.post("", response_model=IrrigationResponse)
def get_irrigation_decision(req: IrrigationRequest):
    try:
        return calculate_irrigation_decision(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Irrigation decision error: {str(e)}")
