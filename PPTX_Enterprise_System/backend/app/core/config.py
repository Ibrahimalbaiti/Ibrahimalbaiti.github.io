from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "pptx_ai"
    redis_url: str = "redis://redis:6379/0"
    gemini_api_key: str | None = None

    @property
    def postgres_dsn(self) -> str:
        return (
            f"dbname={self.postgres_db} user={self.postgres_user} "
            f"password={self.postgres_password} host=db port=5432"
        )


settings = Settings()
