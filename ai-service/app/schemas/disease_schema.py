from pydantic import BaseModel, Field
from typing import List, Optional

class DiseaseClassificationResponse(BaseModel):
    crop: str
    predicted_class: str
    display_name: str
    confidence: float
    is_uncertain: bool
    requires_expert_review: bool
    symptoms: List[str]
    organic_treatment: List[str]
    chemical_treatment: List[str]
    preventive_measures: List[str]
    model_version: str
