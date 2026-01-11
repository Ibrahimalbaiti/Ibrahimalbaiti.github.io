import json
import os
import fcntl
from pathlib import Path

import psycopg2
from fastapi import APIRouter
from pydantic import BaseModel

from app.core.config import settings

router = APIRouter()

TRAINING_DIR = Path("/app/data/training")
TRAINING_DIR.mkdir(parents=True, exist_ok=True)
DATASET_PATH = TRAINING_DIR / "dataset.jsonl"


class FeedbackPayload(BaseModel):
    slide_id: str
    corrected_text: str
    corrected_bounding_boxes: list[dict]
    user_rating: int


@router.post("/feedback")
def submit_feedback(payload: FeedbackPayload):
    conn = psycopg2.connect(settings.postgres_dsn)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS feedback_table (
            id SERIAL PRIMARY KEY,
            slide_id TEXT NOT NULL,
            corrected_text TEXT NOT NULL,
            corrected_bounding_boxes JSONB NOT NULL,
            user_rating INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
        """
    )
    cursor.execute(
        """
        INSERT INTO feedback_table (slide_id, corrected_text, corrected_bounding_boxes, user_rating)
        VALUES (%s, %s, %s, %s)
        """,
        (
            payload.slide_id,
            payload.corrected_text,
            json.dumps(payload.corrected_bounding_boxes),
            payload.user_rating,
        ),
    )
    conn.commit()
    cursor.close()
    conn.close()

    record = payload.model_dump()
    with DATASET_PATH.open("a", encoding="utf-8") as file_handle:
        fcntl.flock(file_handle, fcntl.LOCK_EX)
        file_handle.write(json.dumps(record) + "\n")
        fcntl.flock(file_handle, fcntl.LOCK_UN)

    return {"status": "saved"}
