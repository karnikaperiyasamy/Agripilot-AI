# AgriPilot AI — RESTful API Contract & Endpoint Documentation

## 1. Overview & Service Ports

AgriPilot AI provides a dual-layer RESTful architecture:
1. **API Gateway (Node.js / Express):** Port `5000` (Default base route: `http://localhost:5000/api`)
2. **Machine Learning Microservice (FastAPI):** Port `8000` (Default base route: `http://localhost:8000/api/ml`)

Client applications communicate primarily through the API Gateway, which handles authentication, telemetry logging, Prisma database persistence, and internal proxying with resilient fallback protection.

---

## 2. Authentication & Authorization

All authenticated endpoints require an `Authorization` header containing a valid JSON Web Token (JWT):
```http
Authorization: Bearer <eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...>
```
When accessing unauthenticated development routes, the gateway automatically resolves the active session or safely defaults to a fallback agricultural workspace.

---

## 3. Machine Learning Endpoints

### 3.1 Classify Crop Disease (PyTorch CNN)
Analyzes an uploaded leaf image, evaluates 14 foliar pathology classes, calculates top-3 candidate probabilities, checks confidence thresholds, and stores the diagnostic record in SQLite.

- **URL:** `POST /api/ai/classify-disease` (via Gateway) or `POST /api/ml/classify-disease` (direct ML service)
- **Content-Type:** `multipart/form-data`
- **Request Form Fields:**
  - `file`: Binary image file (JPEG, PNG, WebP; Max 10MB)
  - `crop_hint` (Optional): String e.g. `"Rice"`, `"Tomato"`, `"Potato"`, `"Corn"`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "crop": "Rice",
    "predicted_class": "rice_bacterial_blight",
    "display_name": "Bacterial Blight (Xanthomonas oryzae)",
    "confidence": 92.4,
    "is_healthy": false,
    "is_uncertain": false,
    "requires_expert_review": false,
    "top_classes": [
      {
        "class_name": "rice_bacterial_blight",
        "display_name": "Bacterial Blight (Xanthomonas oryzae)",
        "probability_percent": 92.4
      },
      {
        "class_name": "rice_brown_spot",
        "display_name": "Brown Spot (Bipolaris oryzae)",
        "probability_percent": 4.8
      },
      {
        "class_name": "rice_blast",
        "display_name": "Rice Blast (Magnaporthe oryzae)",
        "probability_percent": 2.1
      }
    ],
    "symptoms": [
      "Water-soaked lesions on leaf margins",
      "Wavy lesions turning yellow to white with bacterial ooze"
    ],
    "organic_treatment": [
      "Spray fresh cow dung water extract (20%)",
      "Apply Pseudomonas fluorescens @ 10g/L"
    ],
    "chemical_treatment": [
      "Streptocycline 150mg + Copper oxychloride 1g per liter of water"
    ],
    "preventive_measures": [
      "Avoid excess nitrogen application",
      "Maintain clean field bunds and drain excess water"
    ],
    "image_validation_notes": "Input normalized and validated (256x256 RGB tensor).",
    "model_version": "agritwin-disease-cnn-v1.0"
  },
  "savedRecord": {
    "id": "clyabc1234567890",
    "createdAt": "2026-10-12T16:00:00.000Z",
    "riskLevel": "Medium",
    "expertReviewStatus": "RESOLVED"
  }
}
```

---

### 3.2 Diagnosis History
Fetches historical foliar scans recorded in the farmer's workspace.

- **URL:** `GET /api/ai/diagnosis-history`
- **Headers:** `Authorization: Bearer <token>`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "clyabc1234567890",
      "observerId": "usr_farmer_01",
      "imageUrl": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "symptomDescription": "Water-soaked lesions on leaf margins",
      "aiPredictionClass": "rice_bacterial_blight",
      "aiConfidence": 92.4,
      "riskLevel": "Medium",
      "recommendedAction": "Organic: Spray cow dung extract. Chemical: Streptocycline",
      "preventionAdvice": "Avoid excess nitrogen application",
      "expertReviewStatus": "RESOLVED",
      "createdAt": "2026-10-12T16:00:00.000Z"
    }
  ]
}
```

---

### 3.3 Historical Diagnosis Comparison & Temporal Progression
Performs differential analysis on two past diagnostic records to track lesion progression or treatment effectiveness.

- **URL:** `POST /api/ai/diagnosis-compare`
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "id1": "clyabc1234567890",
  "id2": "clyxyz9876543210"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "sample1": {
      "id": "clyabc1234567890",
      "aiPredictionClass": "rice_bacterial_blight",
      "aiConfidence": 92.4,
      "riskLevel": "Medium",
      "createdAt": "2026-10-04T10:00:00.000Z"
    },
    "sample2": {
      "id": "clyxyz9876543210",
      "aiPredictionClass": "rice_bacterial_blight",
      "aiConfidence": 74.1,
      "riskLevel": "Low",
      "createdAt": "2026-10-12T16:00:00.000Z"
    },
    "comparison": {
      "daysApart": 8,
      "isSamePathogen": true,
      "confidenceDifference": -18.3,
      "progressionSummary": "Pathogen persistence observed (rice_bacterial_blight). Model confidence decreased by 18.3%, indicating potential treatment suppression.",
      "riskProgression": "Medium -> Low"
    }
  }
}
```

---

### 3.4 Machine Learning Crop Recommendation (Random Forest)
Predicts the optimal crop to cultivate given soil nutrients and environmental conditions.

- **URL:** `POST /api/ai/ml-crop-recommendation` (via Gateway) or `POST /api/ml/recommend-crop` (direct ML service)
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "N": 85.0,
  "P": 58.0,
  "K": 41.0,
  "temperature": 26.5,
  "humidity": 82.0,
  "ph": 6.8,
  "rainfall": 202.0
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "recommended_crop": "rice",
    "display_name": "Paddy / Basmati Rice (Oryza sativa)",
    "confidence_percent": 98.64,
    "top_candidates": [
      {
        "crop": "rice",
        "display_name": "Paddy / Basmati Rice (Oryza sativa)",
        "probability_percent": 98.64,
        "suitability_tier": "Highly Recommended"
      },
      {
        "crop": "jute",
        "display_name": "Jute (Corchorus olitorius)",
        "probability_percent": 0.82,
        "suitability_tier": "Viable Alternative"
      },
      {
        "crop": "maize",
        "display_name": "Corn / Maize (Zea mays)",
        "probability_percent": 0.41,
        "suitability_tier": "Marginal Alternative"
      }
    ],
    "influencing_factors": {
      "Rainfall": 23.05,
      "Humidity": 20.67,
      "Potassium (K)": 16.21,
      "Phosphorus (P)": 14.62,
      "Nitrogen (N)": 12.49,
      "Temperature": 7.53,
      "Soil pH": 5.43
    },
    "agronomic_advisory": "Agronomic analysis indicates Paddy / Basmati Rice matches your soil nutrient profile and moisture conditions with high viability.",
    "regional_disclaimer": "Trained on standard national agro-climatic benchmark data. For regional farming in Tamil Nadu, verify local seasonal sowing windows with TNAU advisory.",
    "model_version": "agritwin-crop-rec-rf-v1.0"
  }
}
```

---

### 3.5 Harvest Yield Prediction & Risk Analysis (Random Forest Regressor)
Forecasts expected harvest yield in Quintals/Acre with confidence bounds.

- **URL:** `POST /api/ai/predict-yield` (via Gateway) or `POST /api/ml/predict-yield` (direct ML service)
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "crop": "Basmati Rice",
  "soil_type": "Clay Loam",
  "irrigation_type": "Drip",
  "area_acres": 5.0,
  "rainfall_mm": 750.0,
  "temperature_c": 28.0,
  "nitrogen_kg": 120.0,
  "phosphorus_kg": 50.0,
  "potassium_kg": 50.0
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "crop": "Basmati Rice",
    "area_acres": 5.0,
    "estimated_yield_per_acre": 26.4,
    "total_estimated_yield": 132.0,
    "unit": "Quintals",
    "confidence_interval_min": 24.3,
    "confidence_interval_max": 28.5,
    "r2_score": 0.9891,
    "key_factors": [
      "Irrigation Method: Drip boosts water efficiency and grain test weight",
      "Balanced NPK application maintains vegetative-reproductive balance",
      "Soil moisture retention in Clay Loam prevents terminal drought stress"
    ],
    "model_version": "agritwin-yield-rf-v1.0"
  }
}
```

---

## 4. HTTP Error Handling Contract

All error responses return standard HTTP status codes accompanied by a descriptive JSON payload:

| Status Code | Reason | Example Payload |
|:---:|:---|:---|
| `400 Bad Request` | Missing or invalid parameters | `{"success": false, "message": "All parameters (N, P, K, temperature, humidity, ph, rainfall) are required."}` |
| `401 Unauthorized` | Missing or invalid JWT | `{"success": false, "message": "Authentication token missing or expired"}` |
| `404 Not Found` | Requested observation record not found | `{"success": false, "message": "One or both diagnosis records not found."}` |
| `500 Server Error` | Unexpected backend or model error | `{"success": false, "message": "Inference exception during model execution"}` |
