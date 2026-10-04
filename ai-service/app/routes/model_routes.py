from fastapi import APIRouter
from app.models.loader import registry

router = APIRouter(prefix="/models", tags=["Model Registry & Observability"])

@router.get("/status")
def get_models_status():
    return {
        "status": "HEALTHY",
        "service": "AgriTwin AI ML Engine",
        "active_models": {
            "crop_yield_predictor": registry.yield_model is not None,
            "pest_risk_classifier": registry.pest_model is not None,
            "price_forecaster": registry.price_model is not None,
            "crop_disease_cnn": registry.disease_model is not None,
            "harvest_window_estimator": True,
            "farmer_buyer_matcher": True,
            "irrigation_decision_engine": True,
            "what_if_simulator": True
        }
    }

@router.get("/registry")
def get_model_registry():
    if registry.registry_meta is not None:
        return registry.registry_meta
    return {
        "system_name": "AgriTwin AI ML Engine",
        "version": "1.0.0",
        "models": {
            "crop_yield_predictor": {"status": "ACTIVE_PRODUCTION", "type": "RandomForestRegressor"},
            "pest_risk_classifier": {"status": "ACTIVE_PRODUCTION", "type": "GradientBoostingClassifier"},
            "price_forecaster": {"status": "ACTIVE_PRODUCTION", "type": "GradientBoostingRegressor"},
            "crop_disease_cnn": {"status": "ACTIVE_PRODUCTION", "type": "PyTorch Deep CNN"}
        }
    }
