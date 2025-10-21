from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    app_name: str = Field(default="Hybrid Search Backend API", alias="APP_NAME")
    app_version: str = Field(default="1.0.0", alias="APP_VERSION")
    debug: bool = Field(default=False, alias="DEBUG")
    database_url: str = Field(default="postgresql+asyncpg://tms_user:tms_pwd@localhost:5432/ultraship_tms_db", alias="DATABASE_URL")
    db_schema: str = Field(default="tms_schema", alias="DB_SCHEMA")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()