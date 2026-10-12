"""
AgriPilot AI - Machine Learning Crop Recommendation Pipeline
Trains and rigorously benchmarks scikit-learn classification models:
- Baseline 1: Gaussian Naive Bayes
- Baseline 2: Decision Tree Classifier
- Baseline 3: Logistic Regression
- Selected Model: Random Forest Classifier (100 Estimators)

Input Features: N, P, K, Temperature, Humidity, pH, Rainfall
Target: 22 Major Agricultural Crops
Output: Serialized Joblib Pipeline with Preprocessor + Model + Metadata
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

print("=" * 70)
print("AGRIPILOT AI — MODULE 2: ML CROP RECOMMENDATION TRAINING & BENCHMARKING")
print("=" * 70)

# 1. Dataset Generation / Curation based on ICAR & Agricultural Benchmark Ranges
CSV_PATH = os.path.join(DATA_DIR, "crop_recommendation_data.csv")

CROPS_SPEC = {
    # Crop: (N_mean, N_std), (P_mean, P_std), (K_mean, K_std), (Temp_mean, Temp_std), (Hum_mean, Hum_std), (pH_mean, pH_std), (Rain_mean, Rain_std)
    "rice":        ((80, 12), (48, 8), (40, 5), (23.6, 2.5), (82.2, 3.5), (6.4, 0.4), (236.1, 30.0)),
    "maize":       ((77, 14), (48, 9), (20, 4), (22.3, 3.0), (65.0, 6.0), (6.2, 0.4), (84.7, 15.0)),
    "chickpea":    ((40, 10), (68, 7), (80, 5), (18.8, 1.5), (16.8, 2.0), (7.3, 0.5), (80.0, 10.0)),
    "kidneybeans": ((20, 8),  (67, 8), (20, 4), (20.1, 2.5), (21.6, 2.5), (5.7, 0.3), (105.9, 25.0)),
    "pigeonpeas":  ((20, 7),  (67, 8), (20, 4), (27.7, 4.0), (48.0, 12.0),(5.8, 0.6), (149.4, 25.0)),
    "mothbeans":   ((21, 8),  (48, 7), (20, 4), (28.1, 2.5), (53.1, 8.0), (6.8, 0.8), (51.1, 10.0)),
    "mungbean":    ((20, 7),  (48, 7), (20, 4), (28.5, 1.5), (85.9, 3.0), (6.7, 0.4), (48.4, 8.0)),
    "blackgram":   ((40, 9),  (67, 8), (19, 4), (29.9, 2.5), (65.1, 3.5), (7.1, 0.3), (67.8, 6.0)),
    "lentil":      ((18, 7),  (68, 8), (19, 4), (24.5, 3.5), (64.8, 3.5), (6.9, 0.4), (45.6, 5.0)),
    "pomegranate": ((18, 7),  (18, 5), (40, 5), (21.8, 2.5), (90.1, 2.5), (6.4, 0.5), (107.5, 6.0)),
    "banana":      ((100, 12),(73, 9), (50, 5), (27.3, 1.8), (80.3, 2.5), (5.9, 0.3), (104.6, 12.0)),
    "mango":       ((20, 8),  (27, 6), (30, 5), (31.2, 2.5), (50.1, 3.0), (5.7, 0.6), (94.7, 7.0)),
    "grapes":      ((23, 8),  (132, 9),(200, 5), (23.8, 5.0), (81.8, 2.0), (6.0, 0.3), (69.6, 4.0)),
    "watermelon":  ((99, 12), (17, 5), (50, 5), (25.5, 1.5), (85.1, 3.0), (6.4, 0.4), (50.7, 5.0)),
    "muskmelon":   ((100, 11),(17, 5), (50, 5), (28.6, 1.5), (92.3, 1.5), (6.3, 0.3), (24.6, 3.0)),
    "apple":       ((20, 8),  (134, 8),(199, 5), (22.6, 1.5), (92.3, 1.5), (5.9, 0.3), (112.6, 8.0)),
    "orange":      ((19, 7),  (16, 5), (10, 3), (22.7, 4.0), (92.1, 1.5), (7.0, 0.5), (110.4, 6.0)),
    "papaya":      ((49, 12), (59, 8), (50, 5), (33.7, 4.0), (92.4, 1.8), (6.7, 0.3), (142.6, 35.0)),
    "coconut":     ((21, 8),  (16, 5), (30, 5), (27.4, 1.5), (94.8, 2.0), (5.9, 0.3), (175.6, 25.0)),
    "cotton":      ((117, 14),(46, 8), (19, 4), (23.9, 1.5), (79.8, 3.0), (6.9, 0.5), (80.3, 12.0)),
    "jute":        ((78, 12), (46, 8), (39, 5), (24.9, 1.2), (79.6, 3.0), (6.7, 0.4), (174.7, 20.0)),
    "coffee":      ((101, 12),(28, 6), (29, 5), (25.5, 2.0), (58.8, 4.0), (6.7, 0.4), (158.0, 25.0))
}

np.random.seed(42)
records = []
samples_per_crop = 100

for crop, params in CROPS_SPEC.items():
    (n_m, n_s), (p_m, p_s), (k_m, k_s), (t_m, t_s), (h_m, h_s), (ph_m, ph_s), (r_m, r_s) = params
    for _ in range(samples_per_crop):
        n_val = max(0.0, np.random.normal(n_m, n_s))
        p_val = max(5.0, np.random.normal(p_m, p_s))
        k_val = max(5.0, np.random.normal(k_m, k_s))
        t_val = np.clip(np.random.normal(t_m, t_s), 8.0, 45.0)
        h_val = np.clip(np.random.normal(h_m, h_s), 10.0, 100.0)
        ph_val = np.clip(np.random.normal(ph_m, ph_s), 3.5, 9.5)
        r_val = max(15.0, np.random.normal(r_m, r_s))
        
        records.append({
            "N": round(n_val, 2),
            "P": round(p_val, 2),
            "K": round(k_val, 2),
            "temperature": round(t_val, 2),
            "humidity": round(h_val, 2),
            "ph": round(ph_val, 2),
            "rainfall": round(r_val, 2),
            "label": crop
        })

df = pd.DataFrame(records)
df.to_csv(CSV_PATH, index=False)
print(f"Dataset generated and saved: {CSV_PATH} ({len(df)} records across {len(CROPS_SPEC)} crops)")

# 2. Train-Test Split (Prevent Data Leakage)
X = df[["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]]
y = df["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"Training set: {X_train.shape[0]} samples | Testing set: {X_test.shape[0]} samples")

# 3. Benchmark Multiple Baseline Models
models = {
    "Gaussian Naive Bayes (Baseline 1)": GaussianNB(),
    "Decision Tree Classifier (Baseline 2)": DecisionTreeClassifier(max_depth=12, random_state=42),
    "Logistic Regression (Baseline 3)": LogisticRegression(max_iter=1000, random_state=42),
    "Random Forest Classifier (Selected)": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
}

benchmark_results = {}

for name, clf in models.items():
    pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", clf)
    ])
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    prec = precision_score(y_test, y_pred, average="weighted")
    rec = recall_score(y_test, y_pred, average="weighted")
    
    benchmark_results[name] = {
        "accuracy": round(float(acc) * 100.0, 2),
        "f1_weighted": round(float(f1) * 100.0, 2),
        "precision": round(float(prec) * 100.0, 2),
        "recall": round(float(rec) * 100.0, 2)
    }
    print(f"[{name}] -> Accuracy: {acc*100.0:.2f}%, F1: {f1*100.0:.2f}%")

# 4. Train and Serialize Final Production Pipeline
selected_pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42, n_jobs=-1))
])
selected_pipeline.fit(X_train, y_train)
y_test_pred = selected_pipeline.predict(X_test)

final_acc = accuracy_score(y_test, y_test_pred)
final_f1 = f1_score(y_test, y_test_pred, average="weighted")
report = classification_report(y_test, y_test_pred, output_dict=True)

# Feature Importances
rf_model = selected_pipeline.named_steps["classifier"]
feature_importances = dict(zip(X.columns.tolist(), [round(float(v), 4) for v in rf_model.feature_importances_]))

# 5. Export Model Artifact
MODEL_OUTPUT_PATH = os.path.join(ARTIFACTS_DIR, "crop_recommender_v1.joblib")
joblib.dump(selected_pipeline, MODEL_OUTPUT_PATH)
print(f"\nTrained pipeline serialized to: {MODEL_OUTPUT_PATH}")

# 6. Save Metadata & Evaluation Metrics
METADATA_PATH = os.path.join(ARTIFACTS_DIR, "crop_recommender_meta.json")
metadata = {
    "model_name": "AgriPilot ML Crop Recommendation Engine",
    "architecture": "StandardScaler + RandomForestClassifier(n_estimators=100)",
    "version": "1.0.0",
    "trained_at": datetime.utcnow().isoformat() + "Z",
    "features": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"],
    "target_classes": sorted(df["label"].unique().tolist()),
    "num_classes": len(CROPS_SPEC),
    "total_samples": len(df),
    "train_samples": len(X_train),
    "test_samples": len(X_test),
    "benchmark_comparison": benchmark_results,
    "final_metrics": {
        "accuracy_percent": round(final_acc * 100.0, 2),
        "f1_score_percent": round(final_f1 * 100.0, 2)
    },
    "feature_importances": feature_importances,
    "limitations": [
        "Trained on agronomic agro-climatic envelopes; field microclimates and pest pressures must be verified locally.",
        "Soil electrical conductivity (EC) and organic carbon (OC) are not included in baseline dataset.",
        "Recommendations in Tamil Nadu require verification against local TNAU crop calendar."
    ]
}

with open(METADATA_PATH, "w") as f:
    json.dump(metadata, f, indent=2)

print(f"Metadata and benchmark reports written to: {METADATA_PATH}")
print("\nFeature Importances:")
for f_name, imp in sorted(feature_importances.items(), key=lambda x: x[1], reverse=True):
    print(f"  • {f_name:12s}: {imp*100.0:.2f}%")
