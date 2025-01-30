from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    API_VERSION: str
    DEBUG: bool
    MODEL_ID: str
    DEVICE: str
    MAX_IMAGE_SIZE: int

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings() 