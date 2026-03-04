import os
# Fix: Render environment sometimes has an invalid/empty CLOUDINARY_URL that crashes the app on import.
if "CLOUDINARY_URL" in os.environ and not os.environ["CLOUDINARY_URL"].startswith("cloudinary://"):
    del os.environ["CLOUDINARY_URL"]

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes.api import router as api_router
from routes.admin import router as admin_router
from routes.upload import router as upload_router
from routes.content import router as content_router
import cloudinary_config

# Initialize cloudinary
cloudinary_config.init_cloudinary()

from database import engine, Base
import models

app = FastAPI(title="Futuristic Neon-Cyberpunk Portfolio API")

@app.on_event("startup")
async def startup():
    # Safety check: refuse to start with default insecure JWT secret
    if settings.JWT_SECRET_KEY in ("supersecretkey", "secret", "", "changeme"):
        import sys
        print("FATAL: JWT_SECRET_KEY is set to an insecure default. Set a strong secret in .env before running.")
        sys.exit(1)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Configure CORS
# We allow the main domain and all vercel.app subdomains for preview/branch deploys
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",  # Allow all Vercel previews
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Device-ID"],
)

app.include_router(api_router, prefix="/api", tags=["Public"])
app.include_router(admin_router, prefix="/api/admin", tags=["Admin"])
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(content_router, prefix="/api/v1/content", tags=["Content"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Neon-Cyberpunk API Backend"}
