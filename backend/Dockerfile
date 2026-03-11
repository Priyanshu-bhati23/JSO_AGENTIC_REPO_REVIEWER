# HuggingFace Spaces - Docker SDK
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# HuggingFace Spaces uses port 7860
EXPOSE 7860

# Environment variables (set via HF Spaces secrets UI)
# OPENAI_API_KEY=...
# GITHUB_TOKEN=...   (optional, increases rate limits)

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
