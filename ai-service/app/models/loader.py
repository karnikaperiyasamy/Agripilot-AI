import os
import json
import joblib
import torch
import torch.nn as nn

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")

class AgriTwinDiseaseClassifier(nn.Module):
    def __init__(self, num_classes=14):
        super(AgriTwinDiseaseClassifier, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2, 2),

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((4, 4))
        )
        self.classifier = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(128 * 4 * 4, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

class ModelRegistry:
    def __init__(self):
        self.yield_model = None
        self.pest_model = None
        self.price_model = None
        self.disease_model = None
        self.disease_meta = None
        self.registry_meta = None
        self.load_models()

    def load_models(self):
        # 1. Load Yield Model
        yield_path = os.path.join(ARTIFACTS_DIR, "yield_predictor_v1.joblib")
        if os.path.exists(yield_path):
            try:
                self.yield_model = joblib.load(yield_path)
            except Exception as e:
                print(f"Failed to load yield model: {e}")

        # 2. Load Pest Model
        pest_path = os.path.join(ARTIFACTS_DIR, "pest_risk_classifier_v1.joblib")
        if os.path.exists(pest_path):
            try:
                self.pest_model = joblib.load(pest_path)
            except Exception as e:
                print(f"Failed to load pest model: {e}")

        # 3. Load Price Model
        price_path = os.path.join(ARTIFACTS_DIR, "price_forecaster_v1.joblib")
        if os.path.exists(price_path):
            try:
                self.price_model = joblib.load(price_path)
            except Exception as e:
                print(f"Failed to load price model: {e}")

        # 4. Load Disease Model
        meta_path = os.path.join(ARTIFACTS_DIR, "disease_classes.json")
        cnn_path = os.path.join(ARTIFACTS_DIR, "crop_disease_cnn_v1.pth")
        if os.path.exists(meta_path) and os.path.exists(cnn_path):
            try:
                with open(meta_path, "r") as f:
                    self.disease_meta = json.load(f)
                num_classes = len(self.disease_meta["classes"])
                self.disease_model = AgriTwinDiseaseClassifier(num_classes=num_classes)
                self.disease_model.load_state_dict(torch.load(cnn_path, map_location=torch.device('cpu')))
                self.disease_model.eval()
            except Exception as e:
                print(f"Failed to load disease model: {e}")

        # 5. Load Registry Metadata
        reg_path = os.path.join(ARTIFACTS_DIR, "model_registry.json")
        if os.path.exists(reg_path):
            try:
                with open(reg_path, "r") as f:
                    self.registry_meta = json.load(f)
            except Exception as e:
                print(f"Failed to load registry metadata: {e}")

# Global singleton
registry = ModelRegistry()
