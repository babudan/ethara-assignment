from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Inventory & Order Management API"
    environment: str = "development"

    database_url: str | None = None
    cors_origins: str = "*"
    auto_create_tables: bool = True
    low_stock_threshold: int = 5


settings = Settings()
