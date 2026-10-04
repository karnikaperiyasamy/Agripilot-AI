from fastapi import APIRouter, HTTPException
from app.schemas.match_schema import MatchRequest, MatchResponse
from app.models.match_model import match_farmers_to_buyer

router = APIRouter(prefix="/match-buyer-farmer", tags=["Smart Match Engine"])

@router.post("", response_model=MatchResponse)
def match_partners(req: MatchRequest):
    try:
        return match_farmers_to_buyer(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching engine error: {str(e)}")
