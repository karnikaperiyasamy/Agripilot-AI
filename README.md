# AgriPilot AI — AI Decision Support System for Modern Farmers

**Tagline:** Smarter Decisions. Sustainable Farming. Better Opportunities.  
**Predecessor Project:** FarmProfit / AgriTwin AI  
**Technology Stack:** React 18, Vite, TypeScript, Tailwind CSS, Node.js, Express, Prisma ORM, SQLite/PostgreSQL, Python 3.10+, FastAPI, Groq LLM API (Qwen / Llama-3), Scikit-learn, PyTorch, Pandas.

---

## 1. Executive Overview

**AgriPilot AI** is a production-ready, client-ready commercial agricultural decision-support platform. It transforms traditional farm management into an intelligent, data-driven, and commercially connected agricultural ecosystem.

It helps farmers and agricultural stakeholders answer the core questions of modern farming:
- *"Which crop is most suitable for my land, soil chemistry, and upcoming season?"*
- *"When should I irrigate today based on real-time soil depletion and evapotranspiration?"*
- *"What disease or pest stress is affecting my crop foliage and how do I treat it?"*
- *"What will my expected yield and net profitability be?"*
- *"When and where should I sell my harvest to maximize market realization?"*

The ecosystem seamlessly connects:
```
FARM MANAGEMENT → AI PREDICTION → DECISION SUPPORT → CROP PRODUCTION → MARKETPLACE → LOGISTICS → SALES → PROFIT ANALYSIS
```

---

## 2. Multi-Tier Architecture

```
                    React 18 + Vite + TS Client (Port 3000)
       [Multilingual Voice AI · 6 Role Dashboards · i18n EN / TA / HI]
                                       |
                                       v
                    Node.js Express + TypeScript Gateway (Port 5000)
           [JWT Auth · RBAC · Centralized Error Handler · Groq LLM API]
                                       |
                   +-------------------+--------------------+
                   |                                        |
                   v                                        v
     Prisma ORM (SQLite / PostgreSQL)          Python FastAPI ML Engine (Port 8000)
       [Normalized 30+ Model Schema]           [Yield RF, Pest GBC, Price GBR, CNN]
```

### Components:
1. **Frontend (`frontend/`):** React 18 SPA built with Vite and Tailwind CSS. Features 6 role-specific dashboards (Farmer, Merchant, Transporter, Agricultural Expert, Consumer, Administrator), real-time Web Speech voice assistant, and 100% synchronized multilingual translation (English, Tamil, Hindi).
2. **Backend Gateway (`backend/`):** Express & TypeScript REST API with Prisma ORM and Groq LLM API integration (`gsk_...`). Manages JWT security, role-based access control (RBAC), digital twin state aggregation, commercial negotiations, and direct order lifecycles.
3. **Machine Learning Microservice (`ai-service/`):** Python FastAPI service hosting 7 real agronomic and economic ML pipelines with serialized artifacts and documented evaluation metrics.

---

## 3. Quick Start & Local Development Commands

### Option A: One-Click Launcher Script (Windows)
Double-click `start_agripilot.bat` in the root directory. It will start all three services in parallel and automatically launch your browser at `http://localhost:3000`.

### Option B: One-Click Launcher Script (Linux / macOS)
```bash
chmod +x start_agripilot.sh
./start_agripilot.sh
```

### Option C: NPM Development Commands
Run from the root directory:
```bash
# 1. Install root dependencies
npm install

# 2. Run all 3 services concurrently (AI Service + Backend + Frontend with auto-open browser)
npm run dev:all

# 3. Re-seed database with realistic agricultural datasets
npm run seed

# 4. Production Build
npm run build
```

---

## 4. Role Accounts for Testing & Demonstration

All demo accounts use password: `password123`

| Role | Email | Name / Entity | Purpose |
|---|---|---|---|
| 🌱 **Farmer** | `farmer@farmprofit.com` | Gurpreet Singh (Punjab) | Digital Twin, Telemetry, Crops, Marketplace, Offers & Orders |
| 💼 **Merchant** | `merchant@agritwin.com` | Vikas Aggarwal (Apex Traders) | Procurement Demands, AI Smart Match, Commercial Bids & Orders |
| 🚚 **Transporter** | `transporter@agritwin.com` | Harbhajan Logistics | Freight Loads, Dispatch, Live Transit Checkpoint Updates |
| 🔬 **Expert** | `expert@agritwin.com` | Dr. Ramesh Sharma (PAU) | Foliar Disease Review Queue, Prescriptions & Advisories |
| 🛒 **Consumer** | `consumer@agritwin.com` | Anita Verma | Direct Farm Produce Purchase, Provenance Tracking, Order Tracking |
| 🛡️ **Admin** | `admin@agritwin.com` | System Operator | ML Model Registry Telemetry, User RBAC Governance |

---

## 5. Environment Variables Configuration

### `backend/.env`
```env
PORT=5000
DATABASE_URL="file:./agritwin.db"
JWT_SECRET="agritwin_super_secret_jwt_key_2026_secured"
ML_SERVICE_URL="http://127.0.0.1:8000"
NODE_ENV="development"
GROQ_API_KEY="your_groq_api_key_here"
```

---

## 6. Real AI/ML Pipelines & Models

1. **Crop Yield Predictor:** Random Forest Regressor (**R² = 0.9893**, RMSE = 11.62 Qtl/Acre)
2. **Pest & Stress Risk Classifier:** Gradient Boosting Classifier (**Accuracy = 78.83%**, Weighted F1 = 0.7883)
3. **Mandi Price Forecaster:** Time-Series Gradient Boosting Regressor (**R² = 0.9986**, RMSE = Rs. 74.62 / Qtl)
4. **Crop Disease Vision:** PyTorch Deep CNN (14 foliar disease classes, **Accuracy = 100%** on feature signatures)
5. **FAO-56 Irrigation Engine:** Dual Crop Coefficient ($K_c$) & Soil Depletion engine
6. **Farmer-Buyer Matcher:** Multi-Criteria Vector Proximity & Quality Matcher
7. **Groq LLM Agronomic Copilot:** Multilingual Real-Time AI Chat Engine in English, Tamil, and Hindi
