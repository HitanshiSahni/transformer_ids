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
MODEL_PATH = "models/transformer_ids_sampled.pt"
try:
    state = torch.load(MODEL_PATH, map_location=torch.device('cpu'), weights_only=False)
    # The dictionary was saved wrapped in a 'model_state_dict' key
    if 'model_state_dict' in state:
        model.load_state_dict(state['model_state_dict'])
    else:
        model.load_state_dict(state)
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")

class FeatureVector(BaseModel):
    features: List[float] = None

@app.post("/predict")
async def predict_traffic(data: FeatureVector):
    # If no features provided, mock a 78-column dummy vector
    if not data.features or len(data.features) != 78:
        # Mocking an arbitrary numerical distribution
        test_vector = np.random.rand(1, 78).astype(np.float32)
    else:
        test_vector = np.array(data.features, dtype=np.float32).reshape(1, 78)

    # Convert to Tensor
    tensor_input = torch.from_numpy(test_vector)

    # Inference without tracking gradients
    with torch.no_grad():
        output = model(tensor_input)
        # Apply Softmax since we removed it from the model architecture earlier
        probabilities = torch.softmax(output, dim=1)
        predicted_class_idx = torch.argmax(probabilities, dim=1).item()

    classes = ["Benign Traffic", "Suspicious / Attack Traffic"]
    
    return {
        "prediction": classes[predicted_class_idx],
        "confidence": float(probabilities[0][predicted_class_idx])
    }

@app.get("/")
def health_check():
    return {"status": "RTIDS Backend Active"}
