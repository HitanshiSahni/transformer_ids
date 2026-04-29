import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
from typing import List
import numpy as np
from transformer import IDS_Encoder_Only

app = FastAPI(title="RTIDS Anomaly Detection Demo")

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Model Structure
d_model = 32
heads = 8
N = 2
trg_vocab = 2
dropout_rate = 0.5
model = IDS_Encoder_Only(trg_vocab, d_model, N, heads, dropout_rate)
model.eval()

# Load Weights
MODEL_PATH = "models/best_model.pt"
SCALER_PATH = "data/preprocessed/scaler.save"

# Threshold Tuning (Adjustable to favor precision vs recall)
# 0.5 is balanced. 0.7-0.8 heavily reduces false positives (improves precision).
THRESHOLD = 0.7

try:
    state = torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=False)
    if 'model_state_dict' in state:
        model.load_state_dict(state['model_state_dict'])
    else:
        model.load_state_dict(state)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")

try:
    import joblib
    scaler = joblib.load(SCALER_PATH)
    print("Scaler loaded successfully.")
except Exception as e:
    print(f"Error loading scaler. Inference will fail or be extremely inaccurate! Error: {e}")
    scaler = None

class FeatureVector(BaseModel):
    features: List[float] = None

@app.post("/predict")
async def predict_traffic(data: FeatureVector):
    # Mock fallback or validation
    if not data.features or len(data.features) != 78:
        test_vector = np.random.rand(1, 78).astype(np.float32)
    else:
        test_vector = np.array(data.features, dtype=np.float32).reshape(1, 78)

    # STRICTLY SCALE INPUT (CRITICAL FIX)
    if scaler is not None:
        try:
            test_vector = scaler.transform(test_vector)
        except Exception as e:
            print(f"Scaling failed during inference: {e}")

    tensor_input = torch.from_numpy(test_vector)

    with torch.no_grad():
        output = model(tensor_input)
        # Apply Softmax strictly during inference
        probabilities = torch.softmax(output, dim=1)
        
        attack_prob = probabilities[0, 0].item()
        
        # Predict 0 (Attack) if probability >= THRESHOLD, else 1 (Benign)
        if attack_prob >= THRESHOLD:
            predicted_class_idx = 0
            confidence = attack_prob
        else:
            predicted_class_idx = 1
            confidence = probabilities[0, 1].item()

    classes = ["Attack", "Benign"] # 0 = Attack, 1 = Benign
    
    return {
        "prediction": classes[predicted_class_idx],
        "confidence": float(confidence)
    }

@app.get("/")
def health_check():
    return {"status": "RTIDS Backend Active"}

# Trigger Reload
