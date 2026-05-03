# Robust Transformer Based Intrusion Detection

This project implements a transformer-based network intrusion detection system (IDS) for CICIDS-style flow data. It includes:

- a PyTorch model for training and evaluation
- a FastAPI backend for inference
- a React frontend for demo and visualization

## Dataset

It is recommended to download the [CICIDS2017](https://www.unb.ca/cic/datasets/ids-2017.html) into a folder named `data` in the root directory of the project. This dataset is the main source of training and validation data for this project.

The repository already contains preprocessed artifacts under `data/preprocessed/` and trained model weights under `models/`.

## Requirements

The project is built around Python, PyTorch, FastAPI, and a Vite/React frontend.

## Project Layout

- `main.py` trains and evaluates the encoder-only transformer model
- `app.py` exposes the inference API
- `run_server.py` starts the FastAPI server with Uvicorn
- `frontend/` contains the React client
- `util/` contains the model utilities and data preprocessing code

## Run the Backend

From the project root, activate the Python environment and start the API:

```powershell
pip install -r requirements.txt
python run_server.py
```

You can also use the helper script:

```powershell
.\run_backend.ps1
```

The backend listens on `http://127.0.0.1:8000`.

## Run the Frontend

Install frontend dependencies and start the dev server:

```powershell
cd frontend
npm install
npm run dev
```

The frontend is a Vite app and expects the backend to be running locally.

## Train or Evaluate

The current training and evaluation workflow lives in `main.py` and related helper modules. In its present form, the repository supports:

- loading and preprocessing CICIDS CSV data
- training the transformer classifier
- loading the saved model for evaluation or inference

## Notes

- The model expects 78 input features per flow.
- Inference applies the saved scaler before classification.
- The repository includes sample payloads and frontend demo data for quick testing.
