import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "True"

import uvicorn
from app import app

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000, workers=1)
