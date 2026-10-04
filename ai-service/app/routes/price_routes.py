from fastapi import APIRouter, HTTPException
from app.schemas.price_schema import PriceForecastRequest, PriceForecastResponse
from app.models.price_model import forecast_market_prices

router = APIRouter(prefix="/price-forecast", tags=["Mandi Price Forecasting ML"])

@router.post("", response_model=PriceForecastResponse)
def get_price_forecast(req: PriceForecastRequest):
    try:
        return forecast_market_prices(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price forecasting error: {str(e)}")
