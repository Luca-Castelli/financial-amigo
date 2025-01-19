from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database settings
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "admin"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "financial_amigo"
    DATABASE_URL: Optional[str] = None

    # JWT settings
    SECRET_KEY: str = "your-secret-key-for-jwt"  # Change this in production!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # API Keys
    NEWSAPI_KEY: Optional[str] = None

    class Config:
        env_file = ".env"

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings()
