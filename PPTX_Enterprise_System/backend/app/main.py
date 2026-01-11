import logging
import time

import psycopg2
import redis
from fastapi import FastAPI

from app.api.v1 import feedback, translate
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="PPTX Enterprise System")

app.include_router(translate.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")


def _connect_db():
    return psycopg2.connect(settings.postgres_dsn)


def _connect_redis():
    return redis.Redis.from_url(settings.redis_url)


@app.on_event("startup")
def startup_wait_for_db() -> None:
    for attempt in range(5):
        try:
            conn = _connect_db()
            conn.close()
            logger.info("Database connected")
            break
        except Exception as exc:  # noqa: BLE001
            logger.warning("Database not ready (%s), retrying", exc)
            time.sleep(2)
    try:
        client = _connect_redis()
        client.ping()
        logger.info("Redis connected")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Redis not ready (%s)", exc)


@app.get("/health")
def health_check():
    db_status = "disconnected"
    redis_status = "disconnected"
    try:
        conn = _connect_db()
        conn.close()
        db_status = "connected"
    except Exception:  # noqa: BLE001
        pass
    try:
        client = _connect_redis()
        client.ping()
        redis_status = "connected"
    except Exception:  # noqa: BLE001
        pass
    return {"status": "ok", "db": db_status, "redis": redis_status}
