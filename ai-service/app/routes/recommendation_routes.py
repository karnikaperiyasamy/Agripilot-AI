from fastapi import APIRouter, HTTPException
from app.schemas.recommendation_schema import CropRecommendationRequest, CropRecommendationResponse
from app.models.recommendation_model import recommend_crop_ml

router = APIRouter(prefix="/recommend-crop", tags=["Crop Recommendation ML"])

@router.post("", response_model=CropRecommendationResponse)
def get_crop_recommendation(payload: CropRecommendationRequest):
    try:
        return recommend_crop_ml(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation inference error: {str(e)}")
