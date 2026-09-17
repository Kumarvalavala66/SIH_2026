FROM python:3.10-slim

WORKDIR /app

# Install system deps if needed
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the whole project
COPY . .

# Critical: make sure Python can find the 'backend' package
ENV PYTHONPATH=/app

# Or if your code is under a subfolder:
# ENV PYTHONPATH=/app/backend

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]