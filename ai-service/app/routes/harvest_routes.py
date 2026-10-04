from fastapi import APIRouter, HTTPException
from app.schemas.harvest_schema import HarvestWindowRequest, HarvestWindowResponse
from app.models.harvest_model import estimate_harvest_window

router = APIRouter(prefix="/harvest-window", tags=["Harvest Window Phenology"])

@router.post("", response_model=HarvestWindowResponse)
def get_harvest_window(req: HarvestWindowRequest):
    try:
        return estimate_harvest_window(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Harvest window estimation error: {str(e)}")
