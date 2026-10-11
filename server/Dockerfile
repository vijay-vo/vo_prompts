# Optional: run the server on a cloud host instead of your laptop.
# The SQLite memory lives in /data; mount a volume there so it survives restarts.
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY prompts ./prompts
ENV DB_PATH=/data/memory.db
VOLUME /data
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers"]
