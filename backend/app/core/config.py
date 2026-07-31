import os
import logging
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Interview Intelligence System"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://neondb_owner:npg_pDjsaV1H8NkX@ep-restless-dawn-azcfig7n-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    )
    
    # Auth
    JWT_SECRET: str = os.getenv(
        "JWT_SECRET", 
        "4f8a1c9e2b7d3f5a6b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Gemini AI
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    
    # Frontend CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Storage Configuration
    GOOGLE_CLOUD_PROJECT: str = os.getenv("GOOGLE_CLOUD_PROJECT", "ai-interview-503607")
    STORAGE_BUCKET: str = os.getenv("STORAGE_BUCKET", "ai-interview-503607")
    STORAGE_ACCESS_KEY: Optional[str] = os.getenv("STORAGE_ACCESS_KEY", "")
    STORAGE_SECRET_KEY: Optional[str] = os.getenv("STORAGE_SECRET_KEY", "")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def validate_required_env_vars(self):
        """Validate critical environment variables on startup."""
        missing = []
        if not self.DATABASE_URL or "USERNAME:PASSWORD" in self.DATABASE_URL:
            missing.append("DATABASE_URL")
        if not self.JWT_SECRET or "your_jwt_secret" in self.JWT_SECRET:
            missing.append("JWT_SECRET")
        if not self.STORAGE_BUCKET or "your_storage_bucket" in self.STORAGE_BUCKET:
            missing.append("STORAGE_BUCKET")

        if missing:
            logger.warning(
                f"[CONFIG VALIDATION WARNING] Missing or unconfigured environment variables: {', '.join(missing)}. "
                "Defaulting to secure fallback / development mode."
            )
        else:
            logger.info("[CONFIG VALIDATION SUCCESS] All required backend environment variables validated.")

settings = Settings()
settings.validate_required_env_vars()
