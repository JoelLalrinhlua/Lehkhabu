from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────
    APP_NAME: str = "Lehkhabu API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Database (local PostgreSQL via asyncpg) ──────
    DATABASE_URL: str = "postgresql+asyncpg://localhost/lehkhabu_dev"
    # Sync URL for Alembic migrations
    @property
    def SYNC_DATABASE_URL(self) -> str:
        return self.DATABASE_URL.replace(
            "postgresql+asyncpg://", "postgresql+psycopg2://"
        )

    # ── Redis ────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── JWT ──────────────────────────────────────────
    JWT_SECRET: str = "change_this_to_a_long_random_string"
    ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080  # 7 days

    # ── Supabase (storage + auth) ────────────────────
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # ── Razorpay ─────────────────────────────────────
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    # ── Storage buckets ──────────────────────────────
    SUPABASE_BUCKET_COVERS: str = "book-covers"
    SUPABASE_BUCKET_FILES: str = "book-files"
    SUPABASE_BUCKET_AVATARS: str = "avatars"

    # ── CORS ─────────────────────────────────────────
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
    ]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
