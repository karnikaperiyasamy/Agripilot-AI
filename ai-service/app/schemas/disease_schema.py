from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class DiseaseAlternative(BaseModel):
    class_name: str
    display_name: str
    probability_percent: float

class DiseaseClassificationResponse(BaseModel):
    crop: str
    predicted_class: str
    display_name: str
    confidence: float
    is_healthy: bool = False
    is_uncertain: bool = False
    requires_expert_review: bool = False
    top_classes: List[DiseaseAlternative] = []
    symptoms: List[str] = []
    organic_treatment: List[str] = []
    chemical_treatment: List[str] = []
    preventive_measures: List[str] = []
    image_validation_notes: Optional[str] = None
    model_version: str = "agritwin-disease-cnn-v1.0"
