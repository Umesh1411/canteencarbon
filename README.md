# CanteenCarbon — Sustainability Intelligence & Multi-Agent Decision Support

**Measure Waste. Understand Impact. Drive Change.**

An end-to-end multi-agent AI system and decision-support web application for institutional university canteens to quantify food waste, assess Scope 3 carbon footprints, predict demand, and implement targeted waste-reduction interventions aligned with **UN SDG 12 (Target 12.3)**.

---

## 🏛️ System Architecture & Technology Stack

| Layer | Technology | Functionality |
| :--- | :--- | :--- |
| **Frontend UI** | **React 18 + Vite + TailwindCSS + Recharts** | High-contrast multi-role dashboard, real-time analytics visualizations, scale logging, and scenario planner. |
| **Backend API** | **Node.js + Express** | Token-based auth middleware, audit trails, and data integration. |
| **Database** | **Firebase Firestore / Auth** | Role-based authorization, scalable document storage for scale weigh-ins. |
| **Machine Learning** | **Python (FastAPI + scikit-learn)** | RandomForest Regressor trained on 911 empirical service observations ($R^2 = 0.93 - 0.95$). |
| **Multi-Agent AI** | **Google Gemini API / Deterministic Engine** | Specialized agents for Root Cause Analysis, Strategy Evaluation, and Reporting with empirical grounding. |
| **Deployment** | **Vercel** | Production-ready serverless and static deployment configured via `vercel.json`. |

---

## 👥 Role Hierarchy & Capabilities

1. **👨‍🍳 Canteen Manager**
   - **Full Executive Overview**: Live waste tracking, waste per meal served ($g/\text{meal}$), gross production metrics.
   - **Historical Audit**: Review and manage kitchen logs with full deletion and correction privileges.
   - **ML Demand Forecast**: Predict anticipated discards based on attendance, weather, and day of week.
   - **AI Root Cause & Interventions**: Review agent-generated operational hypotheses.

2. **🥣 Kitchen Staff**
   - **Quick Service Scale Entry**: High-speed, mobile-friendly input for dish-level weigh-ins (prepared mass, unserved leftovers, scraps, plate waste).
   - **Personal Log History**: View logs recorded during assigned shifts.

3. **🌱 Sustainability Officer**
   - **Carbon Footprint Accounting**: Scope 3 Category 1 emissions calculated using IPCC and FAO cradle-to-gate factors.
   - **SDG 12 Target 12.3 Progress**: Continuous indicators tracking progress toward halving per-capita food waste.
   - **Intervention Analysis**: Evaluate low-carbon meal planning alternatives.

4. **🏛️ University Administrator**
   - **Executive Briefing & Reports**: High-level university summaries and PDF/print export capabilities.
   - **Campus ESG Accountability**: Traceable emissions reporting for annual university audits.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Quick Launch
Run the automated launcher:
```cmd
run_all.bat
```
This starts:
- **ML Microservice**: `http://localhost:8000`
- **Node.js API**: `http://localhost:4000`
- **React Frontend**: `http://localhost:5173`

### 3. Training the ML Model
To retrain the model on the primary dataset (`Reallife datasets/train.csv`):
```bash
python ml/train.py
```
This evaluates baseline algorithms (Dummy, Linear Regression, Random Forest) using a time-ordered 70/15/15 train/val/test split and serializes the winning model to `ml/model/canteencarbon_rf.joblib`.

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Set the required Environment Variables in the Vercel Project Settings:
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, etc.
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
   - `GEMINI_API_KEY`
4. Deploy with zero configuration using the included `vercel.json`.
