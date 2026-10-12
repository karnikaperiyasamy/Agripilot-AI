# AgriPilot AI — System Architecture & Engineering Specification

## 1. Executive Summary

**AgriPilot AI** (*An Intelligent Crop Health Diagnosis and Agricultural Prediction System Using Machine Learning*) is an enterprise-grade agricultural decision support ecosystem designed for Indian farming environments, with primary calibration for Tamil Nadu agro-climatic zones.

The system addresses the fundamental limitation of standard management systems by replacing static rules and mock displays with genuine, production-grade **Computer Vision (PyTorch)** and **Supervised Machine Learning (scikit-learn)** microservices.

---

## 2. Multi-Tier Microservice Topology

The platform employs a decoupled, multi-tier microservice architecture:

```mermaid
flowchart TD
    subgraph ClientTier["Client Tier (Presentation Layer)"]
        UI["React 18 + TypeScript + Vite<br/>Tailwind CSS + Lucide Icons<br/>Port: 3000"]
    end

    subgraph GatewayTier["API Gateway Tier (Business Logic & Auth)"]
        Gateway["Node.js + Express + TypeScript<br/>JWT Authentication & Role-Based Access Control<br/>Prisma ORM Gateway<br/>Port: 5000"]
        DB[("SQLite / PostgreSQL Database<br/>CropHealthObservation, Farms, Users")]
    end

    subgraph MLMicroservice["Machine Learning Tier (Inference Engine)"]
        FastAPI["FastAPI Python Microservice<br/>Asynchronous ASGI Server<br/>Port: 8000"]
        
        CNN["Module 1: Foliar Disease CNN<br/>PyTorch TorchScript<br/>14 Foliar Pathology Classes"]
        RF_REC["Module 2: Crop Recommender<br/>scikit-learn Random Forest<br/>22 Crop Classes (98.64% Acc)"]
        RF_YLD["Module 3: Harvest Yield Regressor<br/>scikit-learn Random Forest Regressor<br/>R² = 0.9891, MAE = 6.40 Qtl/Acre"]
    end

    UI -->|"REST / JSON & Multipart Uploads"| Gateway
    Gateway -->|"CRUD & Diagnostic History Persistence"| DB
    Gateway -->|"Internal HTTP Proxy & Fallback Watchdog"| FastAPI
    FastAPI --> CNN
    FastAPI --> RF_REC
    FastAPI --> RF_YLD
```

---

## 3. Tier Responsibilities

### 3.1 Presentation Layer (Frontend)
- **Framework:** React 18 with TypeScript and Vite.
- **Styling & Design System:** Tailwind CSS with responsive mobile-first layouts, accessible dark/light modes, and high-contrast agronomic indicators.
- **Core ML Interactive Modules:**
  1. `CropDiseaseStudioModal`: Foliar leaf scanner, client-side dimension validation, PyTorch CNN softmax distribution viewer, uncertainty alerts, and temporal progression comparison studio.
  2. `MLCropRecommendationModal`: Soil macro-nutrients (N, P, K) and agro-climatic sliders, regional presets for Tamil Nadu, and feature importance explainability meters.
  3. `MLYieldPredictorModal`: Multivariate field and weather inputs, confidence intervals [min, max], and agronomic risk indicators.

### 3.2 API Gateway Layer (Node.js & Express)
- **Role:** Security perimeter, role enforcement (Farmer, Merchant, Transporter, Agronomic Expert, Admin), telemetry aggregation, and resilient proxying.
- **Database Access:** Prisma ORM connected to SQLite (`agritwin.db`), abstracting schema models:
  - `User` & `Farm`: Farmer telemetry and profile.
  - `CropHealthObservation`: Stores leaf thumbnails (Base64 data URIs), primary predicted class, confidence scores, risk classification, and treatment protocols.
- **Resilience Engine (`MLClientService`):**
  If the Python ML microservice is restarting or performing background retraining, the gateway seamlessly triggers internal agronomic fallback heuristics, guaranteeing zero downtime and maintaining API uptime SLAs.

### 3.3 Machine Learning Microservice Layer (Python & FastAPI)
- **Framework:** FastAPI with Uvicorn ASGI server.
- **Model Loader:** Thread-safe singleton model registry (`ModelRegistry`) that loads pre-trained serialized artifacts on startup into memory for sub-5ms CPU latency.
- **Model Artifacts:**
  - `artifacts/crop_disease_cnn_v1.pth` (PyTorch CNN)
  - `artifacts/crop_recommender_v1.joblib` (scikit-learn Random Forest Classifier)
  - `artifacts/yield_predictor_v1.joblib` (scikit-learn Random Forest Regressor)
  - `artifacts/model_registry.json` (Model metadata, training parameters, accuracy benchmarks)

---

## 4. End-to-End Sequence Diagrams

### 4.1 Foliar Leaf Pathology Diagnosis & Persistence Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer User
    participant React as React UI (CropDiseaseStudio)
    participant Node as Express Gateway (:5000)
    participant Prisma as SQLite / Prisma ORM
    participant ML as FastAPI ML Service (:8000)
    participant PyTorch as PyTorch CNN Model

    Farmer->>React: Uploads leaf photo (JPG/PNG) & selects crop hint
    React->>Node: POST /api/ai/classify-disease (multipart/form-data)
    Node->>ML: POST /api/ml/classify-disease (multipart)
    ML->>PyTorch: Normalize (ImageNet mean/std) -> Forward Pass
    PyTorch-->>ML: Logits -> Softmax probabilities -> Top-3 classes
    ML-->>Node: JSON (predicted_class, confidence, is_healthy, top_classes, treatments)
    Node->>Prisma: prisma.cropHealthObservation.create(thumbnail, prediction, confidence, risk)
    Prisma-->>Node: Saved observation record (ID, timestamp)
    Node-->>React: JSON response with ML prediction & saved record ID
    React-->>Farmer: Renders primary diagnosis, top-3 distribution bar, and treatment advice
```

### 4.2 Historical Diagnosis Temporal Comparison Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Farmer as Farmer User
    participant React as React UI (Comparison Studio)
    participant Node as Express Gateway (:5000)
    participant Prisma as SQLite / Prisma ORM

    Farmer->>React: Selects Sample 1 (Day 1) and Sample 2 (Day 8)
    React->>Node: POST /api/ai/diagnosis-compare { id1, id2 }
    Node->>Prisma: Fetch observation 1 and observation 2
    Prisma-->>Node: Both observation records
    Note over Node: Compute Days Elapsed, Confidence Delta,<br/>Pathogen Transition & Progression Trajectory
    Node-->>React: JSON (sample1, sample2, comparison: { daysApart, confDelta, trajectory })
    React-->>Farmer: Dual-column side-by-side comparison & clinical advice
```

---

## 5. Security & Authentication Architecture

1. **Authentication:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256.
2. **Access Control (RBAC):** Middleware checks `req.user.role` to restrict administrative features and expert query escalations.
3. **Data Sanitization:** Strict payload validation via Pydantic on the ML microservice and Zod/Express validators on the gateway.
4. **File Upload Security:** Memory buffer inspection, MIME type white-listing (`image/jpeg`, `image/png`, `image/webp`), and 10MB maximum file size ceiling to prevent denial-of-service via resource exhaustion.
