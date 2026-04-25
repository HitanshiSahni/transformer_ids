#!/usr/bin/env bash
set -euo pipefail

MODEL_PATH="/app/models/best_model_no_leakage.pt"
SCALER_PATH="/app/data/preprocessed/scaler.save"

if [[ ! -f "$MODEL_PATH" || ! -f "$SCALER_PATH" ]]; then
  echo "[startup] Model or scaler missing. Running one-time training..."
  python3 main.py
else
  echo "[startup] Found existing model/scaler. Skipping training."
fi

echo "[startup] Starting backend server..."
exec python3 -m uvicorn app:app --host 0.0.0.0 --port 8000
