"""
AgriPilot AI - Machine Learning Crop Yield Prediction Pipeline
Trains and rigorously benchmarks scikit-learn regression models:
- Baseline 1: Dummy Regressor (Mean Yield Baseline)
- Baseline 2: Ridge Linear Regressor
- Baseline 3: Decision Tree Regressor
- Selected Model: Random Forest Regressor (100 Estimators)

Input Features: Crop, Soil Type, Irrigation Type, Area, Rainfall, Temperature, N, P, K
Target: yield_quintals_per_acre
Output: Serialized Joblib Pipeline with ColumnTransformer + Model + Metadata
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import Ridge
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

print("=" * 70)
print("AGRIPILOT AI — MODULE 3: ML CROP YIELD PREDICTION & BENCHMARKING")
print("=" * 70)

CSV_PATH = os.path.join(DATA_DIR, "crop_yield_data.csv")
if not os.path.exists(CSV_PATH):
    raise FileNotFoundError(f"Missing yield dataset at {CSV_PATH}")

df = pd.read_csv(CSV_PATH)
print(f"Loaded yield dataset: {CSV_PATH} ({len(df)} samples across {df['crop'].nunique()} crops)")

categorical_features = ["crop", "soil_type", "irrigation_type"]
numerical_features = ["area_acres", "rainfall_mm", "temperature_c", "nitrogen_kg", "phosphorus_kg", "potassium_kg"]

X = df[categorical_features + numerical_features]
y = df["yield_quintals_per_acre"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)
print(f"Training split: {len(X_train)} samples | Testing split: {len(X_test)} samples")

# Preprocessing Pipeline
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
        ("num", StandardScaler(), numerical_features)
    ]
)

# Benchmark Multiple Regressors
regressors = {
    "Dummy Regressor (Mean Baseline)": DummyRegressor(strategy="mean"),
    "Ridge Linear Regressor (Baseline 2)": Ridge(alpha=1.0),
    "Decision Tree Regressor (Baseline 3)": DecisionTreeRegressor(max_depth=10, random_state=42),
    "Random Forest Regressor (Selected Model)": RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1)
}

benchmark_results = {}

for name, reg in regressors.items():
    pipe = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", reg)
    ])
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mape = np.mean(np.abs((y_test - y_pred) / np.maximum(y_test, 1.0))) * 100.0
    
    benchmark_results[name] = {
        "r2_score": round(float(r2), 4),
        "mae_quintals": round(float(mae), 2),
        "rmse_quintals": round(float(rmse), 2),
        "mape_percent": round(float(mape), 2)
    }
    print(f"[{name}] -> R²: {r2:.4f}, MAE: {mae:.2f} Qtl/Acre, RMSE: {rmse:.2f} Qtl/Acre")

# Final Production Pipeline
selected_pipeline = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", RandomForestRegressor(n_estimators=100, max_depth=16, random_state=42, n_jobs=-1))
])
selected_pipeline.fit(X_train, y_train)
y_pred_final = selected_pipeline.predict(X_test)

final_r2 = r2_score(y_test, y_pred_final)
final_mae = mean_absolute_error(y_test, y_pred_final)
final_rmse = np.sqrt(mean_squared_error(y_test, y_pred_final))

# Feature Importances Extraction
ohe_cats = selected_pipeline.named_steps["preprocessor"].named_transformers_["cat"].get_feature_names_out(categorical_features).tolist()
all_transformed_features = ohe_cats + numerical_features
rf_reg = selected_pipeline.named_steps["regressor"]
importances = dict(zip(all_transformed_features, [round(float(v), 4) for v in rf_reg.feature_importances_]))

# Group top aggregate importances
grouped_importances = {
    "Crop Variety": sum(v for k, v in importances.items() if k.startswith("crop_")),
    "Soil Type": sum(v for k, v in importances.items() if k.startswith("soil_type_")),
    "Irrigation Method": sum(v for k, v in importances.items() if k.startswith("irrigation_type_")),
    "Rainfall (mm)": importances.get("rainfall_mm", 0.0),
    "Temperature (°C)": importances.get("temperature_c", 0.0),
    "Fertilizer N-P-K": importances.get("nitrogen_kg", 0.0) + importances.get("phosphorus_kg", 0.0) + importances.get("potassium_kg", 0.0),
    "Acreage": importances.get("area_acres", 0.0)
}

# Export Model
MODEL_OUTPUT_PATH = os.path.join(ARTIFACTS_DIR, "yield_predictor_v1.joblib")
joblib.dump(selected_pipeline, MODEL_OUTPUT_PATH)
print(f"\nSerialized yield regression model to: {MODEL_OUTPUT_PATH}")

METADATA_PATH = os.path.join(ARTIFACTS_DIR, "yield_predictor_meta.json")
metadata = {
    "model_name": "AgriPilot ML Crop Yield Prediction Engine",
    "architecture": "ColumnTransformer + RandomForestRegressor(n_estimators=100)",
    "version": "1.0.0",
    "trained_at": datetime.now().isoformat() + "Z",
    "target": "yield_quintals_per_acre",
    "unit": "Quintals/Acre",
    "features_categorical": categorical_features,
    "features_numerical": numerical_features,
    "total_samples": len(df),
    "train_samples": len(X_train),
    "test_samples": len(X_test),
    "benchmark_comparison": benchmark_results,
    "final_metrics": {
        "r2_score": round(float(final_r2), 4),
        "mae_quintals": round(float(final_mae), 2),
        "rmse_quintals": round(float(final_rmse), 2)
    },
    "grouped_feature_importances": {k: round(v * 100.0, 2) for k, v in grouped_importances.items()},
    "limitations": [
        "Regional variations in seed genetics, hybrid vigor, and micronutrient deficiencies may alter yield by ±10-15%.",
        "Extreme catastrophic weather events (flooding, tropical cyclones, pest swarms) are outside standard statistical regression variance.",
        "Acreage calculations assume uniform topography and soil quality across the plot."
    ]
}

with open(METADATA_PATH, "w") as f:
    json.dump(metadata, f, indent=2)

print(f"Metadata and benchmark reports written to: {METADATA_PATH}")
print("\nGrouped Feature Importances:")
for g_name, imp in sorted(grouped_importances.items(), key=lambda x: x[1], reverse=True):
    print(f"  • {g_name:22s}: {imp*100.0:.2f}%")
