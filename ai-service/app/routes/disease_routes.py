from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.schemas.disease_schema import DiseaseClassificationResponse
from app.models.disease_model import classify_crop_image

router = APIRouter(prefix="/classify-disease", tags=["Crop Disease CNN"])

@router.post("", response_model=DiseaseClassificationResponse)
async def classify_disease(
    file: UploadFile = File(...),
    crop_hint: str = Form("Rice")
):
    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty image payload provided")
        return classify_crop_image(contents, crop_hint=crop_hint)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image classification error: {str(e)}")
