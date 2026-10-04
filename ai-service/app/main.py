from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.yield_routes import router as yield_router
from app.routes.disease_routes import router as disease_router
from app.routes.pest_routes import router as pest_router
from app.routes.price_routes import router as price_router
from app.routes.harvest_routes import router as harvest_router
from app.routes.match_routes import router as match_router
from app.routes.irrigation_routes import router as irrigation_router
from app.routes.simulation_routes import router as simulation_router
from app.routes.model_routes import router as model_router

app = FastAPI(
    title="AgriTwin AI - Agricultural ML & Decision Support Engine",
    description="Microservice providing real-time crop yield predictions, deep learning disease diagnosis, pest outbreak risks, mandi market price forecasting, smart matching, and FAO-56 irrigation planning.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all agricultural ML pipelines
app.include_router(yield_router, prefix="/api/ml")
app.include_router(disease_router, prefix="/api/ml")
app.include_router(pest_router, prefix="/api/ml")
app.include_router(price_router, prefix="/api/ml")
app.include_router(harvest_router, prefix="/api/ml")
app.include_router(match_router, prefix="/api/ml")
app.include_router(irrigation_router, prefix="/api/ml")
app.include_router(simulation_router, prefix="/api/ml")
app.include_router(model_router, prefix="/api/ml")

@app.get("/")
def root():
    return {
        "service": "AgriTwin AI Machine Learning Engine",
        "tagline": "Grow Smarter. Sell Better. Earn More.",
        "status": "ONLINE",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "HEALTHY", "service": "agritwin-ai-ml"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
