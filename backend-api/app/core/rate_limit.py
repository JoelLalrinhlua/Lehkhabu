"""
Rate-limiting configuration using slowapi (a FastAPI-compatible wrapper
around the `limits` library).

The limiter is created here as a module-level singleton so that route
decorators like @limiter.limit("5/minute") can import it without circular
dependencies.

Redis is used as the backend when REDIS_URL is set; otherwise the limiter
falls back to in-memory storage (suitable for development only).
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL,
    default_limits=["200/minute"],  # Global safety cap per IP
)
