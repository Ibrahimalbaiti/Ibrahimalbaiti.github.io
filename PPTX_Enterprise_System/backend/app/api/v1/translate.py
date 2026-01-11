import os
import uuid
from pathlib import Path

from celery import Celery
from celery.result import AsyncResult
from fastapi import APIRouter, File, Form, UploadFile

from app.core.config import settings

router = APIRouter()
celery_app = Celery("pptx", broker=settings.redis_url, backend=settings.redis_url)

UPLOAD_DIR = Path("/app/data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/translate")
async def translate_presentation(
    file: UploadFile = File(...),
    source_lang: str = Form(...),
    target_lang: str = Form(...),
    engine: str = Form("gemini"),
):
    file_id = f"{uuid.uuid4()}_{file.filename}"
    file_path = UPLOAD_DIR / file_id
    with file_path.open("wb") as buffer:
        buffer.write(await file.read())

    task = celery_app.send_task(
        "process_presentation_task",
        args=[str(file_path), source_lang, target_lang, engine],
    )
    return {"task_id": task.id}


@router.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    result = AsyncResult(task_id, app=celery_app)
    response = {"task_id": task_id, "status": result.status}
    if isinstance(result.info, dict):
        response["progress"] = result.info.get("progress")
    return response


@router.get("/tasks/{task_id}/result")
def get_task_result(task_id: str):
    result = AsyncResult(task_id, app=celery_app)
    if not result.ready():
        return {"task_id": task_id, "status": result.status}
    return {"task_id": task_id, "status": result.status, "result": result.result}
