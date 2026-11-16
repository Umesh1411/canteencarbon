"""
CanteenCarbon ML Service — FastAPI
Serves the trained RandomForest model via REST API.
Train script: ml/train.py
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os
from pathlib import Path

app = FastAPI(title="CanteenCarbon ML Service", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = Path(__file__).parent / "model" / "canteencarbon_rf.joblib"
ENCODER_PATH = Path(__file__).parent / "model" / "label_encoders.joblib"

model = None
encoders = None

EXPERIENCE_MAP = {"beginner": 0, "intermediate": 1, "expert": 2, "nan": 1}
CATEGORY_MAP = {
    "dairy": 0, "MeAt": 1, "meat": 1, "poultry": 2,
    "vegetables": 3, "fruits": 4, "grains": 5, "legumes": 6,
    "rice": 7, "seafood": 8, "Other": 9
}


@app.on_event("startup")
async def load_model():
    global model, encoders
    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        print(f"✓ Model loaded from {MODEL_PATH}")
    else:
        print(f"⚠ Model not found at {MODEL_PATH}. Run ml/train.py first.")


class PredictRequest(BaseModel):
    meals_served: float = 200
    kitchen_staff: float = 12
    temperature_C: float = 25.0
    humidity_percent: float = 60.0
    day_of_week: int = 1  # 0=Mon ... 6=Sun
    special_event: int = 0
    past_waste_kg: float = 30.0
    staff_experience: str = "intermediate"
    waste_category: str = "Other"


@app.post("/predict")
async def predict(req: PredictRequest):
    if model is None:
        # Deterministic fallback
        predicted = req.past_waste_kg * 0.85 + req.meals_served * 0.05
        return {
            "predicted_waste_kg": round(predicted, 2),
            "model": "deterministic_fallback",
            "note": "Model not loaded. Run ml/train.py.",
            "confidence_interval": [round(predicted * 0.8, 2), round(predicted * 1.2, 2)],
        }

    exp_enc = EXPERIENCE_MAP.get(str(req.staff_experience).lower(), 1)
    cat_enc = CATEGORY_MAP.get(req.waste_category, 9)

    features = np.array([[
        req.meals_served,
        req.kitchen_staff,
        req.temperature_C,
        req.humidity_percent,
        req.day_of_week,
        req.special_event,
        req.past_waste_kg,
        exp_enc,
        cat_enc,
    ]])

    prediction = float(model.predict(features)[0])
    # Estimate confidence interval using tree variance
    if hasattr(model, "estimators_"):
        tree_preds = np.array([t.predict(features)[0] for t in model.estimators_])
        std = float(np.std(tree_preds))
    else:
        std = prediction * 0.1

    return {
        "predicted_waste_kg": round(max(0, prediction), 2),
        "confidence_interval": [
            round(max(0, prediction - 1.96 * std), 2),
            round(prediction + 1.96 * std, 2),
        ],
        "std_dev": round(std, 2),
        "model": "RandomForest",
        "features_used": [
            "meals_served", "kitchen_staff", "temperature_C",
            "humidity_percent", "day_of_week", "special_event",
            "past_waste_kg", "staff_experience", "waste_category"
        ],
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
