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
    JWT_SECRET_KEY: str = (
        "YEHnzRUTGgm82MXfuzP3lKW7LAJE30LWug1Xod0VNkg="  # Same as NEXTAUTH_SECRET
    )
    JWT_ALGORITHM: str = "HS256"

    # API Keys
    NEWSAPI_KEY: Optional[str] = None

    class Config:
        env_file = ".env"

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def jwt_secret_key(self) -> str:
        return self.JWT_SECRET_KEY

    @property
    def jwt_algorithm(self) -> str:
        return self.JWT_ALGORITHM


settings = Settings()
