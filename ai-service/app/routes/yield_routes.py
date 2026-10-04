from fastapi import APIRouter, HTTPException
from app.schemas.yield_schema import YieldPredictionRequest, YieldPredictionResponse
from app.models.yield_model import predict_crop_yield

router = APIRouter(prefix="/predict-yield", tags=["Crop Yield ML"])

@router.post("", response_model=YieldPredictionResponse)
def get_yield_prediction(req: YieldPredictionRequest):
    try:
        return predict_crop_yield(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Yield prediction inference error: {str(e)}")
