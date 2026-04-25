FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Install Python and base tooling.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    ca-certificates \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies from requirements.txt, using CUDA 12.1 wheels.
COPY requirements.txt ./
RUN pip3 install --upgrade pip && \
    pip3 install -r requirements.txt && \
    pip3 install --index-url https://download.pytorch.org/whl/cu121 torch==2.5.1+cu121

# Copy project files.
COPY . .

EXPOSE 8000

CMD ["python3", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
