from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    FRONTEND_URL: str = "http://localhost:3000"
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost/dbname"
    JWT_SECRET_KEY: str = "supersecretkey"
    JWT_ALGORITHM: str = "HS256"
    CLOUDINARY_CLOUD_NAME: str = "cloud_name"
    CLOUDINARY_API_KEY: str = "api_key"
    CLOUDINARY_API_SECRET: str = "api_secret"
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "changeme"
    ADMIN_EMAIL: str = "your-email@gmail.com"
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
