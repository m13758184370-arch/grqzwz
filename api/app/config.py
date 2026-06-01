from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:54322/postgres"
    anthropic_api_key: str = ""
    supabase_url: str = ""
    supabase_service_key: str = ""
    wechat_pay_app_id: str = ""
    wechat_pay_mch_id: str = ""
    wechat_pay_api_key: str = ""
    wechat_pay_notify_url: str = ""
    app_env: str = "development"
    api_base_url: str = "http://localhost:8000"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
