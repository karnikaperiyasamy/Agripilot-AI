# AgriPilot AI: An Intelligent Crop Health Diagnosis and Agricultural Prediction System Using Machine Learning

**Final-Year Major Project in Computer Science and Engineering (CSE)**  
**Tagline:** Smarter Decisions. Sustainable Farming. Better Opportunities.  
**Domain Focus:** Computer Vision, Supervised Machine Learning, Predictive Analytics, Agricultural Data Engineering, and Multi-Tier Cloud Microservices.  
**Technology Stack:** PyTorch, scikit-learn, FastAPI, Python 3.10+, Node.js, Express, TypeScript, Prisma ORM, SQLite/PostgreSQL, React 18, Vite, Tailwind CSS.

---

## 1. Project Overview & Academic Focus

**AgriPilot AI** is an advanced, production-grade agricultural intelligence software ecosystem engineered to replace static rule sets and administrative CRUD dashboards with genuine, data-driven machine learning inference pipelines.

The platform provides end-to-end intelligent decision support across three fundamental agricultural dimensions:
1. **Intelligent Crop Disease Detection (Computer Vision):** A custom PyTorch Convolutional Neural Network (CNN) diagnosing 14 foliar pathology classes with softmax top-3 distribution, uncertainty alerts (<70%), and historical temporal progression comparison.
2. **Data-Driven Crop Recommendation (Supervised Classification):** A 100-tree scikit-learn Random Forest ensemble trained on 2,200 Indian soil-climate trial samples across 22 crops, rigorously benchmarked against Gaussian Naive Bayes, Logistic Regression, and Decision Trees with feature importance explainability.
3. **Harvest Yield Prediction & Risk Analysis (Supervised Regression):** A multivariate Random Forest regressor trained on 2,500 trials achieving **$R^2 = 0.9891$** and **MAE = 6.40 Qtl/Acre** (outperforming a naive mean baseline by 92.1%), outputting 90% confidence prediction intervals and agronomic risk indicators.

---

## 2. System Architecture

AgriPilot AI employs a decoupled three-tier microservice architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   React 18 + Vite + TypeScript Client                  │
│             [Port 3000 · 3 ML Studios · Mobile-First UI]               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / Multipart
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│              Node.js Express + TypeScript API Gateway                  │
│   [Port 5000 · JWT Auth · RBAC · Prisma ORM · Resilient ML Fallbacks]  │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
                    ▼                               ▼
       ┌────────────────────────┐      ┌─────────────────────────┐
       │   SQLite / PostgreSQL  │      │  FastAPI ML Microservice│
       │   Database Persistence │      │       [Port 8000]       │
       └────────────────────────┘      └────────────┬────────────┘
                                                    │
                 ┌──────────────────────────────────┼──────────────────────────────────┐
                 ▼                                  ▼                                  ▼
      ┌───────────────────────┐          ┌──────────────────────┐          ┌──────────────────────┐
      │  Module 1: PyTorch    │          │  Module 2: RF Crop   │          │  Module 3: RF Yield  │
      │  Foliar Disease CNN   │          │  Recommender (22 Cls)│          │  Regressor (R² 0.989)│
      │  (14 Foliar Classes)  │          │  [98.64% Accuracy]   │          │  [MAE 6.40 Qtl/Acre] │
      └───────────────────────┘          └──────────────────────┘          └──────────────────────┘
```

---

## 3. Core Machine Learning Modules & Benchmarks

### Module 1: Foliar Crop Disease Vision Classifier (PyTorch CNN)
- **Model Architecture:** Custom 4-layer Deep CNN (`CropDiseaseCNN`) with 357,774 parameters.
- **Inference Latency:** 1.15 ms on modern CPU.
- **Taxonomy:** 14 foliar pathology classes across Rice, Tomato, Potato, Corn, Wheat, and Apple (including healthy controls).
- **Clinical Uncertainty Rejection:** Rejects / alerts when maximum softmax confidence is below 70%.
- **Persistence & Temporal Progression:** Saves thumbnail scans and enables side-by-side comparative analysis of historical scans to assess disease trajectory.

### Module 2: Crop Suitability Recommendation Ensemble (scikit-learn)
Trained and validated on 2,200 curated Indian agro-climatic trial records across 22 crops (N, P, K, pH, Temperature, Humidity, Rainfall):

| Algorithm | Test Accuracy | Precision (Macro) | Recall (Macro) | F1-Score |
|:---|:---:|:---:|:---:|:---:|
| **Gaussian Naive Bayes** | 98.86% | 0.9912 | 0.9886 | 0.9889 |
| **Random Forest (100 Trees)** *(Selected)* | **98.64%** | **0.9890** | **0.9864** | **0.9865** |
| **Logistic Regression** | 97.95% | 0.9814 | 0.9795 | 0.9791 |
| **Decision Tree (CART)** | 94.09% | 0.9462 | 0.9409 | 0.9411 |

*Feature Importances (Gini):* Rainfall (23.05%), Humidity (20.67%), Potassium (16.21%), Phosphorus (14.62%), Nitrogen (12.49%), Temperature (7.53%), Soil pH (5.43%).

### Module 3: Harvest Yield Prediction & Risk Regressor (scikit-learn)
Trained on 2,500 trials evaluating non-linear interactions between crop variety, soil classification, irrigation method, acreage, weather indices, and NPK inputs:

| Metric | Dummy Mean Baseline | Random Forest Regressor | Performance Delta |
|:---|:---:|:---:|:---:|
| **Mean Absolute Error (MAE)** | 80.86 Qtl/Acre | **6.40 Qtl/Acre** | **92.08% Error Reduction** |
| **Root Mean Squared Error (RMSE)** | 111.45 | **11.69** | **89.51% Error Reduction** |
| **Coefficient of Determination ($R^2$)** | -0.0013 | **0.9891** | **+0.9904 Variance Captured** |

---

## 4. Comprehensive Project Documentation

Detailed academic and engineering documentation files are located in the `docs/` directory:
- 🏛️ [`docs/SYSTEM_ARCHITECTURE.md`](docs/SYSTEM_ARCHITECTURE.md): Multi-tier microservice architecture, sequence diagrams, and fallback mechanism.
- 🔬 [`docs/ML_METHODOLOGY.md`](docs/ML_METHODOLOGY.md): Mathematical formulations, datasets, loss functions, benchmarks, and model explainability.
- 📡 [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md): Complete OpenAPI REST contract with request/response JSON schemas.
- 🧪 [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md): Consolidated test logs across Python unittest (12/12), Node.js integration tests (7/7), and Vite build.
- 🔭 [`docs/LIMITATIONS_AND_FUTURE_WORK.md`](docs/LIMITATIONS_AND_FUTURE_WORK.md): Field lighting constraints, IoT LoRaWAN telemetry, edge quantization, and satellite remote sensing.

---

## 5. Quickstart & Installation Guide

### Prerequisites
- Python 3.10+ with `pip`
- Node.js 18+ with `npm`

### Step 1: Python ML Microservice Setup
```bash
# Navigate to ai-service directory
cd ai-service

# Create and activate virtual environment (optional)
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/macOS: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Python Unit Tests (12 tests)
python tests/test_api_unittest.py

# Launch FastAPI microservice (port 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 2: Backend API Gateway Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run Prisma database migrations
npx prisma generate
npx prisma db push

# Run Backend Integration Tests (7 tests)
npm test

# Launch Express Gateway (port 5000)
npm run dev
```

### Step 3: Frontend Client Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Launch Vite development server (port 3000)
npm run dev
```

---

## 6. Demo Accounts for Evaluation

All evaluation accounts use default password: `password123`

| Role | Account Email | Purpose |
|:---|:---|:---|
| 🌾 **Farmer** | `farmer@farmprofit.com` | Primary access to ML Disease Vision Studio, Crop Recommender, and Yield Engine |
| 🔬 **Expert** | `expert@agritwin.com` | Agronomic diagnosis review queue, verification, and prescriptions |
| 💼 **Merchant** | `merchant@agritwin.com` | Market demands, purchase bids, and harvest procurement |
| 🚚 **Transporter** | `transporter@agritwin.com` | Load pooling, route telemetry, and delivery tracking |
| 🛡️ **Administrator** | `admin@agritwin.com` | Model registry status telemetry, governance, and user RBAC |

---

## 7. Verification & Quality Assurance

To execute the entire automated test suite:
```bash
# 1. Run Python ML Unit Tests
python ai-service/tests/test_api_unittest.py

# 2. Build and run Backend Integration Tests
cd backend && npm run build && node --test dist/tests/aiEcosystem.test.js

# 3. Verify Frontend Static Types & Bundle
cd ../frontend && npm run build
```
All suites pass with **100% success rate**.
