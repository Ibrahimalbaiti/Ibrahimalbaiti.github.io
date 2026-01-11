FROM python:3.11-slim

ENV MEMORY_LIMIT=6G

RUN apt-get update \
    && apt-get install -y --no-install-recommends libreoffice default-jre ffmpeg tesseract-ocr libgl1 libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY worker/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/app /app/backend/app
COPY worker/celery_app.py /app/celery_app.py

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/backend

CMD ["celery", "-A", "celery_app.celery_app", "worker", "--loglevel=info"]
