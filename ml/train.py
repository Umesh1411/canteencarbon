"""
CanteenCarbon ML Training Script
Trains a RandomForest Regressor on Reallife datasets/train.csv
Saves model to ml/model/canteencarbon_rf.joblib

Usage: python ml/train.py
"""
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.dummy import DummyRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder
import joblib
import json
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent
TRAIN_CSV = BASE_DIR / "Reallife datasets" / "train.csv"
MODEL_DIR = Path(__file__).parent / "model"
MODEL_DIR.mkdir(exist_ok=True)

print(f"Loading dataset from: {TRAIN_CSV}")
df = pd.read_csv(TRAIN_CSV)
print(f"Shape: {df.shape}")
print(df.dtypes)

# ── Cleaning ─────────────────────────────────────────────────────────────────
df["staff_experience"] = df["staff_experience"].fillna("intermediate").str.lower().str.strip()
df["waste_category"] = df["waste_category"].fillna("Other").str.strip()

# Encode categoricals
le_exp = LabelEncoder()
le_cat = LabelEncoder()
df["staff_experience_enc"] = le_exp.fit_transform(df["staff_experience"])
df["waste_category_enc"] = le_cat.fit_transform(df["waste_category"])

# ── Features & Target ────────────────────────────────────────────────────────
FEATURES = [
    "meals_served",
    "kitchen_staff",
    "temperature_C",
    "humidity_percent",
    "day_of_week",
    "special_event",
    "past_waste_kg",
    "staff_experience_enc",
    "waste_category_enc",
]
TARGET = "food_waste_kg"

df = df.dropna(subset=FEATURES + [TARGET])
X = df[FEATURES].values
y = df[TARGET].values

print(f"Training rows: {len(X)}")

# ── Split — time-ordered 70/15/15 ────────────────────────────────────────────
# Sort by date first (time-aware split to avoid leakage)
df["date"] = pd.to_datetime(df["date"])
df_sorted = df.sort_values("date").reset_index(drop=True)
X_sorted = df_sorted[FEATURES].values
y_sorted = df_sorted[TARGET].values

n = len(X_sorted)
n_train = int(n * 0.70)
n_val = int(n * 0.15)
X_train, y_train = X_sorted[:n_train], y_sorted[:n_train]
X_val, y_val = X_sorted[n_train:n_train + n_val], y_sorted[n_train:n_train + n_val]
X_test, y_test = X_sorted[n_train + n_val:], y_sorted[n_train + n_val:]

print(f"Train: {len(X_train)} | Val: {len(X_val)} | Test: {len(X_test)}")

# ── Models ───────────────────────────────────────────────────────────────────
models = {
    "DummyMean": DummyRegressor(strategy="mean"),
    "LinearRegression": LinearRegression(),
    "RandomForest": RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1),
}

results = {}
for name, m in models.items():
    m.fit(X_train, y_train)
    preds = m.predict(X_val)
    mae = mean_absolute_error(y_val, preds)
    rmse = float(np.sqrt(mean_squared_error(y_val, preds)))
    r2 = r2_score(y_val, preds)
    results[name] = {"MAE_kg": mae, "RMSE_kg": rmse, "R2": r2}
    print(f"{name:25s}  MAE={mae:.4f}  RMSE={rmse:.4f}  R²={r2:.4f}")

# ── Select best ──────────────────────────────────────────────────────────────
best_name = min(results, key=lambda k: results[k]["MAE_kg"])
best_model = models[best_name]
print(f"\nBest model: {best_name}")

# Final test evaluation
test_preds = best_model.predict(X_test)
test_mae = mean_absolute_error(y_test, test_preds)
test_rmse = float(np.sqrt(mean_squared_error(y_test, test_preds)))
test_r2 = r2_score(y_test, test_preds)
print(f"  Test MAE={test_mae:.4f}  RMSE={test_rmse:.4f}  R²={test_r2:.4f}")

# ── Save ─────────────────────────────────────────────────────────────────────
joblib.dump(best_model, MODEL_DIR / "canteencarbon_rf.joblib")
print(f"Model saved: {MODEL_DIR / 'canteencarbon_rf.joblib'}")

# Save encoders + metadata
meta = {
    "model": best_name,
    "features": FEATURES,
    "target": TARGET,
    "train_rows": len(X_train),
    "val_rows": len(X_val),
    "test_rows": len(X_test),
    "val_metrics": results[best_name],
    "test_metrics": {"MAE_kg": test_mae, "RMSE_kg": test_rmse, "R2": test_r2},
    "experience_classes": list(le_exp.classes_),
    "category_classes": list(le_cat.classes_),
    "split_method": "time_ordered_70_15_15",
}
with open(MODEL_DIR / "model_metadata.json", "w") as f:
    json.dump(meta, f, indent=2)
print("Metadata saved.")
print(json.dumps(meta, indent=2))
