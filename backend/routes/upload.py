from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
import cloudinary.uploader
from routes.admin import get_current_admin

router = APIRouter()

@router.post("/video")
async def upload_video(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin)
):
    if not file.content_type.startswith("video/") and not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be a video or image")

    try:
        # FastAPI's UploadFile exposes a spooled file object via `file.file`
        # Cloudinary accepts file-like objects for uploading
        result = cloudinary.uploader.upload(
            file.file, 
            resource_type="auto", 
            folder="portfolio"
        )
        return {"url": result.get("secure_url")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
