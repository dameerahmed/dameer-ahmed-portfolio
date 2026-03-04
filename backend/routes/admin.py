from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from database import get_db
import models
import schemas
from auth import create_access_token, verify_access_token, get_current_admin, verify_password, get_password_hash
from config import settings
import cloudinary
import cloudinary.uploader
from cloudinary.utils import cloudinary_url
from datetime import datetime, timedelta, timezone
from utils.email import send_otp_email, generate_otp

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

router = APIRouter()

# In-memory login attempt tracker (resets on server restart — good enough for single-admin)
_login_attempts: dict = {}  # key: IP, value: {count, locked_until}
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_SECONDS = 60

@router.post("/login")
async def login(login_data: schemas.LoginData, request: Request, db: AsyncSession = Depends(get_db)):
    client_ip = request.client.host if request.client else "unknown"
    now = datetime.now(timezone.utc)

    # Check lockout
    attempt_info = _login_attempts.get(client_ip, {"count": 0, "locked_until": None})
    if attempt_info["locked_until"] and now < attempt_info["locked_until"]:
        wait = int((attempt_info["locked_until"] - now).total_seconds())
        raise HTTPException(status_code=429, detail=f"Too many failed attempts. Try again in {wait}s.")

    # 1. Check username
    if login_data.username != settings.ADMIN_USERNAME:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # 2. Check password — DB override (set via forgot-password) takes priority over .env
    override_result = await db.execute(select(models.AdminPasswordOverride).limit(1))
    override = override_result.scalars().first()

    is_valid = False
    if override:
        is_valid = verify_password(login_data.password, override.hashed_password)
    else:
        raw_pw = settings.ADMIN_PASSWORD
        if raw_pw.startswith("$2b$") or raw_pw.startswith("$2a$"):
            is_valid = verify_password(login_data.password, raw_pw)
        else:
            is_valid = (login_data.password == raw_pw)

    if not is_valid:
        # Increment failed attempts
        attempt_info["count"] = attempt_info.get("count", 0) + 1
        if attempt_info["count"] >= MAX_LOGIN_ATTEMPTS:
            attempt_info["locked_until"] = now + timedelta(seconds=LOCKOUT_SECONDS)
            attempt_info["count"] = 0
        _login_attempts[client_ip] = attempt_info
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Reset on successful login
    _login_attempts.pop(client_ip, None)

    # 2. Generate OTP
    otp_code = generate_otp()
    expiry = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=10)
    
    # Clean old OTPs
    await db.execute(models.AdminOTP.__table__.delete())
    
    db_otp = models.AdminOTP(otp_code=otp_code, expires_at=expiry)
    db.add(db_otp)
    await db.commit()

    # 3. Send Email
    email_sent = send_otp_email(settings.ADMIN_EMAIL, otp_code)
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send OTP email")

    return {"status": "otp_sent", "message": "Check your email for OTP"}

@router.post("/verify-otp")
async def verify_otp(otp_data: schemas.OTPVerify, db: AsyncSession = Depends(get_db)):
    # Fetch OTP by code — do NOT reject wrong codes silently, track attempts
    result = await db.execute(select(models.AdminOTP).limit(1))
    db_otp = result.scalars().first()

    MAX_ATTEMPTS = 5

    # No OTP exists or it's expired
    if not db_otp or db_otp.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
        if db_otp:
            await db.delete(db_otp)
            await db.commit()
        raise HTTPException(status_code=400, detail="OTP expired. Please log in again to get a new code.")

    # Wrong code — increment failed counter
    if db_otp.otp_code != otp_data.code:
        db_otp.failed_attempts += 1
        remaining = MAX_ATTEMPTS - db_otp.failed_attempts
        if db_otp.failed_attempts >= MAX_ATTEMPTS:
            await db.delete(db_otp)
            await db.commit()
            raise HTTPException(status_code=429, detail="Too many wrong attempts. OTP invalidated. Please log in again.")
        await db.commit()
        raise HTTPException(status_code=400, detail=f"Incorrect OTP. {remaining} attempt(s) remaining.")

    # Correct — single-use: delete immediately
    await db.delete(db_otp)
    await db.commit()

    # Create 7-day token with Device ID
    access_token = create_access_token(
        data={"sub": settings.ADMIN_USERNAME, "device_id": otp_data.device_id},
        expires_delta=timedelta(days=7)
    )

    from fastapi import Response
    response = Response(content='{"status": "ok"}', media_type="application/json")
    
    # Set HTTP-only Cookie
    # secure=True in production (HTTPS), False in local dev
    is_production = not settings.FRONTEND_URL.startswith("http://localhost")
    response.set_cookie(
        key="admin_session",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    return response

@router.post("/logout")
async def logout():
    from fastapi import Response
    response = Response(content='{"status": "ok"}', media_type="application/json")
    response.delete_cookie("admin_session")
    return response

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/change-password")
async def change_password(data: ChangePasswordRequest, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    if data.current_password == data.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from current password")

    # Check current password — DB override first, then .env
    override_result = await db.execute(select(models.AdminPasswordOverride).limit(1))
    override = override_result.scalars().first()

    is_valid = False
    if override:
        is_valid = verify_password(data.current_password, override.hashed_password)
    else:
        raw_pw = settings.ADMIN_PASSWORD
        if raw_pw.startswith("$2b$") or raw_pw.startswith("$2a$"):
            is_valid = verify_password(data.current_password, raw_pw)
        else:
            is_valid = (data.current_password == raw_pw)

    if not is_valid:
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # Store new hashed password
    hashed = get_password_hash(data.new_password)
    await db.execute(models.AdminPasswordOverride.__table__.delete())
    db.add(models.AdminPasswordOverride(hashed_password=hashed))
    await db.commit()
    return {"status": "ok", "message": "Password changed successfully"}

# ─── FORGOT / RESET PASSWORD ────────────────────────────
class ForgotPasswordRequest(BaseModel):
    pass  # No body needed — we always send to the registered ADMIN_EMAIL

class ResetPasswordRequest(BaseModel):
    otp_code: str
    new_password: str

@router.post("/forgot-password")
async def forgot_password(db: AsyncSession = Depends(get_db)):
    otp_code = generate_otp()
    expiry = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=10)

    # Clear any previous reset OTPs
    await db.execute(models.AdminOTP.__table__.delete())
    db_otp = models.AdminOTP(otp_code=otp_code, expires_at=expiry)
    db.add(db_otp)
    await db.commit()

    email_sent = send_otp_email(settings.ADMIN_EMAIL, otp_code)
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send reset email")

    return {"status": "otp_sent", "message": f"Reset code sent to your admin email"}

@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    # Fetch latest OTP
    result = await db.execute(select(models.AdminOTP).limit(1))
    db_otp = result.scalars().first()

    MAX_ATTEMPTS = 5

    if not db_otp or db_otp.expires_at < datetime.now(timezone.utc).replace(tzinfo=None):
        if db_otp:
            await db.delete(db_otp)
            await db.commit()
        raise HTTPException(status_code=400, detail="OTP expired. Request a new reset code.")

    # Wrong code — track and limit attempts
    if db_otp.otp_code != data.otp_code:
        db_otp.failed_attempts += 1
        remaining = MAX_ATTEMPTS - db_otp.failed_attempts
        if db_otp.failed_attempts >= MAX_ATTEMPTS:
            await db.delete(db_otp)
            await db.commit()
            raise HTTPException(status_code=429, detail="Too many wrong attempts. Reset code invalidated. Request a new one.")
        await db.commit()
        raise HTTPException(status_code=400, detail=f"Incorrect OTP. {remaining} attempt(s) remaining.")

    # OTP correct — delete it (single-use)
    await db.delete(db_otp)

    # Hash and store new password
    hashed = get_password_hash(data.new_password)
    await db.execute(models.AdminPasswordOverride.__table__.delete())
    db.add(models.AdminPasswordOverride(hashed_password=hashed))
    await db.commit()

    return {"status": "ok", "message": "Password updated successfully"}


@router.get("/me")
async def get_me(admin=Depends(get_current_admin)):
    """Lightweight auth check — returns 200 if session is valid, 401/403 if not."""
    return {"status": "authenticated", "user": admin.get("sub")}

# ─── MESSAGES ───────────────────────────────────────────
@router.get("/messages")
async def get_messages(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactMessage).order_by(models.ContactMessage.id.desc()))
    return result.scalars().all()

@router.patch("/messages/{msg_id}/read")
async def mark_read(msg_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactMessage).where(models.ContactMessage.id == msg_id))
    msg = result.scalars().first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    msg.is_read = True
    await db.commit()
    return {"status": "ok"}

@router.patch("/messages/{msg_id}/flag")
async def toggle_flag(msg_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactMessage).where(models.ContactMessage.id == msg_id))
    msg = result.scalars().first()
    if not msg:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail="Not found")
    msg.is_flagged = not msg.is_flagged
    await db.commit()
    return {"status": "ok", "is_flagged": msg.is_flagged}

@router.delete("/messages/{msg_id}")
async def delete_message(msg_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactMessage).where(models.ContactMessage.id == msg_id))
    msg = result.scalars().first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await db.delete(msg)
    await db.commit()
    return {"status": "deleted"}

# ─── PROFILE ────────────────────────────────────────────
@router.get("/profile")
async def get_admin_profile(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SiteMetadata).limit(1))
    return result.scalars().first()

@router.put("/profile")
async def update_profile(profile: schemas.ProfileUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SiteMetadata).limit(1))
    existing = result.scalars().first()
    if existing:
        for key, val in profile.model_dump(exclude_unset=True).items():
            setattr(existing, key, val)
    else:
        existing = models.SiteMetadata(**profile.model_dump(exclude_unset=True))
        db.add(existing)
    await db.commit()
    await db.refresh(existing)
    return existing

# ─── SKILLS ─────────────────────────────────────────────
@router.get("/skills")
async def get_skills(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Skill))
    return result.scalars().all()

@router.post("/skills")
async def create_skill(skill: schemas.SkillBase, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_skill = models.Skill(**skill.model_dump())
    db.add(db_skill)
    await db.commit()
    await db.refresh(db_skill)
    return db_skill

@router.put("/skills/{skill_id}")
async def update_skill(skill_id: int, skill: schemas.SkillBase, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Skill).where(models.Skill.id == skill_id))
    db_skill = result.scalars().first()
    if not db_skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    db_skill.name = skill.name
    db_skill.percentage = skill.percentage
    await db.commit()
    return db_skill

@router.delete("/skills/{skill_id}")
async def delete_skill(skill_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Skill).where(models.Skill.id == skill_id))
    db_skill = result.scalars().first()
    if not db_skill:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await db.delete(db_skill)
    await db.commit()
    return {"status": "deleted"}

# ─── JOURNEY ────────────────────────────────────────────
@router.get("/journey")
async def get_journey(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.JourneyTimeline).order_by(models.JourneyTimeline.year.desc()))
    return result.scalars().all()

@router.post("/journey")
async def create_journey(item: schemas.JourneyBase, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_item = models.JourneyTimeline(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.put("/journey/{item_id}")
async def update_journey(item_id: int, item: schemas.JourneyUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.JourneyTimeline).where(models.JourneyTimeline.id == item_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    for key, val in item.model_dump(exclude_unset=True).items():
        setattr(db_item, key, val)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.delete("/journey/{item_id}")
async def delete_journey(item_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.JourneyTimeline).where(models.JourneyTimeline.id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await db.delete(item)
    await db.commit()
    return {"status": "deleted"}

# ─── PROJECTS ───────────────────────────────────────────
@router.get("/projects")
async def get_projects(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Project))
    return result.scalars().all()

@router.post("/projects")
async def create_project(project: schemas.ProjectCreate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.put("/projects/{project_id}")
async def update_project(project_id: int, project: schemas.ProjectUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Project).where(models.Project.id == project_id))
    db_project = result.scalars().first()
    if not db_project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    for key, val in project.model_dump(exclude_unset=True).items():
        setattr(db_project, key, val)
    await db.commit()
    await db.refresh(db_project)
    return db_project

@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Project).where(models.Project.id == project_id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await db.delete(project)
    await db.commit()
    return {"status": "deleted"}

# ─── SOCIAL LINKS ───────────────────────────────────────
@router.get("/socials")
async def get_socials(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SocialLink).order_by(models.SocialLink.order.asc()))
    return result.scalars().all()

@router.post("/socials")
async def create_social(social: schemas.SocialLinkCreate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_social = models.SocialLink(**social.model_dump())
    db.add(db_social)
    await db.commit()
    await db.refresh(db_social)
    return db_social

@router.put("/socials/{social_id}")
async def update_social(social_id: int, social: schemas.SocialLinkUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SocialLink).where(models.SocialLink.id == social_id))
    db_social = result.scalars().first()
    if not db_social:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    for key, val in social.model_dump(exclude_unset=True).items():
        setattr(db_social, key, val)
    await db.commit()
    await db.refresh(db_social)
    return db_social

@router.delete("/socials/{social_id}")
async def delete_social(social_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SocialLink).where(models.SocialLink.id == social_id))
    social = result.scalars().first()
    if not social:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    await db.delete(social)
    await db.commit()
    return {"status": "deleted"}

# ─── CONTACT EMAILS ─────────────────────────────────────
@router.get("/contact/emails")
async def get_emails(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactEmail))
    return result.scalars().all()

@router.post("/contact/emails")
async def add_email(email_data: schemas.ContactEmailCreate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_email = models.ContactEmail(**email_data.model_dump())
    db.add(db_email)
    await db.commit()
    await db.refresh(db_email)
    return db_email

@router.put("/contact/emails/{email_id}")
async def update_email(email_id: int, email_data: schemas.ContactEmailUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactEmail).where(models.ContactEmail.id == email_id))
    db_email = result.scalars().first()
    if not db_email:
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in email_data.model_dump(exclude_unset=True).items():
        setattr(db_email, key, val)
    await db.commit()
    await db.refresh(db_email)
    return db_email

@router.delete("/contact/emails/{email_id}")
async def delete_email(email_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactEmail).where(models.ContactEmail.id == email_id))
    db_email = result.scalars().first()
    if not db_email:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(db_email)
    await db.commit()
    return {"status": "deleted"}

# ─── CONTACT PHONES ─────────────────────────────────────
@router.get("/contact/phones")
async def get_phones(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactPhone))
    return result.scalars().all()

@router.post("/contact/phones")
async def add_phone(phone_data: schemas.ContactPhoneCreate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_phone = models.ContactPhone(**phone_data.model_dump())
    db.add(db_phone)
    await db.commit()
    await db.refresh(db_phone)
    return db_phone

@router.put("/contact/phones/{phone_id}")
async def update_phone(phone_id: int, phone_data: schemas.ContactPhoneUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactPhone).where(models.ContactPhone.id == phone_id))
    db_phone = result.scalars().first()
    if not db_phone:
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in phone_data.model_dump(exclude_unset=True).items():
        setattr(db_phone, key, val)
    await db.commit()
    await db.refresh(db_phone)
    return db_phone

@router.delete("/contact/phones/{phone_id}")
async def delete_phone(phone_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactPhone).where(models.ContactPhone.id == phone_id))
    db_phone = result.scalars().first()
    if not db_phone:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(db_phone)
    await db.commit()
    return {"status": "deleted"}

# ─── SERVICES ───────────────────────────────────────────
@router.get("/services", response_model=list[schemas.ServiceBase])
async def get_services(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Service))
    return result.scalars().all()

@router.post("/services", response_model=schemas.ServiceBase)
async def create_service(service: schemas.ServiceCreate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_service = models.Service(**service.model_dump())
    db.add(db_service)
    await db.commit()
    await db.refresh(db_service)
    return db_service

@router.put("/services/{service_id}", response_model=schemas.ServiceBase)
async def update_service(service_id: int, service: schemas.ServiceUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Service).where(models.Service.id == service_id))
    db_service = result.scalars().first()
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    
    for key, value in service.model_dump(exclude_unset=True).items():
        setattr(db_service, key, value)
    
    await db.commit()
    await db.refresh(db_service)
    return db_service

@router.delete("/services/{service_id}")
async def delete_service(service_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Service).where(models.Service.id == service_id))
    db_service = result.scalars().first()
    if not db_service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    await db.delete(db_service)
    await db.commit()
    return {"status": "deleted"}

# ─── EDUCATION ──────────────────────────────────────────
@router.get("/education")
async def get_education(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Education))
    return result.scalars().all()

@router.post("/education")
async def create_education(edu: schemas.EducationCreate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_edu = models.Education(**edu.model_dump())
    db.add(db_edu)
    await db.commit()
    await db.refresh(db_edu)
    return db_edu

@router.put("/education/{edu_id}")
async def update_education(edu_id: int, edu: schemas.EducationUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Education).where(models.Education.id == edu_id))
    db_edu = result.scalars().first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in edu.model_dump(exclude_unset=True).items():
        setattr(db_edu, key, val)
    await db.commit()
    await db.refresh(db_edu)
    return db_edu

@router.delete("/education/{edu_id}")
async def delete_education(edu_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Education).where(models.Education.id == edu_id))
    db_edu = result.scalars().first()
    if not db_edu:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(db_edu)
    await db.commit()
    return {"status": "deleted"}

# ─── HOBBIES ────────────────────────────────────────────
@router.get("/hobbies")
async def get_hobbies(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Hobby))
    return result.scalars().all()

@router.post("/hobbies")
async def create_hobby(hobby: schemas.HobbyCreate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_hobby = models.Hobby(**hobby.model_dump())
    db.add(db_hobby)
    await db.commit()
    await db.refresh(db_hobby)
    return db_hobby

@router.put("/hobbies/{hobby_id}")
async def update_hobby(hobby_id: int, hobby: schemas.HobbyUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Hobby).where(models.Hobby.id == hobby_id))
    db_hobby = result.scalars().first()
    if not db_hobby:
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in hobby.model_dump(exclude_unset=True).items():
        setattr(db_hobby, key, val)
    await db.commit()
    await db.refresh(db_hobby)
    return db_hobby

@router.delete("/hobbies/{hobby_id}")
async def delete_hobby(hobby_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Hobby).where(models.Hobby.id == hobby_id))
    db_hobby = result.scalars().first()
    if not db_hobby:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(db_hobby)
    await db.commit()
    return {"status": "deleted"}



# ─── LANGUAGES ──────────────────────────────────────────
@router.get("/languages")
async def get_languages(admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Language))
    return result.scalars().all()

@router.post("/languages")
async def create_language(lang: schemas.LanguageCreate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    db_lang = models.Language(**lang.model_dump())
    db.add(db_lang)
    await db.commit()
    await db.refresh(db_lang)
    return db_lang

@router.put("/languages/{lang_id}")
async def update_language(lang_id: int, lang: schemas.LanguageUpdate, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Language).where(models.Language.id == lang_id))
    db_lang = result.scalars().first()
    if not db_lang:
        raise HTTPException(status_code=404, detail="Not found")
    for key, val in lang.model_dump(exclude_unset=True).items():
        setattr(db_lang, key, val)
    await db.commit()
    await db.refresh(db_lang)
    return db_lang

@router.delete("/languages/{lang_id}")
async def delete_language(lang_id: int, admin=Depends(get_current_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Language).where(models.Language.id == lang_id))
    db_lang = result.scalars().first()
    if not db_lang:
        raise HTTPException(status_code=404, detail="Not found")
    await db.delete(db_lang)
    await db.commit()
    return {"status": "deleted"}

from fastapi import Form, HTTPException

# ─── FILE UPLOAD ────────────────────────────────────────
@router.post("/upload")
async def upload_file(
    admin=Depends(get_current_admin),
    file: UploadFile = File(...),
    remove_bg: bool = Form(False)
):
    MAX_SIZE_MB = 5
    contents = await file.read()
    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large. Maximum allowed size is {MAX_SIZE_MB}MB.")
    upload_params = {"resource_type": "auto"}
    
    if remove_bg:
        upload_params["background_removal"] = "cloudinary_ai"
        upload_params["format"] = "png"
        
    try:
        result = cloudinary.uploader.upload(contents, **upload_params)
        
        custom_url = result.get("secure_url")
        warning_msg = None
        
        if remove_bg:
            bg_info = result.get("info", {}).get("background_removal", {}).get("cloudinary_ai", {})
            bg_status = bg_info.get("status")
            if bg_status in ("pending", "completed"):
                custom_url, _ = cloudinary_url(
                    result["public_id"],
                    secure=True,
                    format="png",
                    effect="background_removal",
                    version=result.get("version")
                )
            else:
                warning_msg = "AI Background Removal not enabled. Enable the 'Cloudinary AI Background Removal' add-on in your Cloudinary Dashboard."
            
        return {"url": custom_url, "warning": warning_msg}
    except Exception as e:
        print("Cloudinary Exception:", str(e))
        if remove_bg:
            print("Falling back to normal upload...")
            # Fallback to simple upload if the add-on is not available or fails
            upload_params.pop("background_removal", None)
            result = cloudinary.uploader.upload(contents, **upload_params)
            return {
                "url": result.get("secure_url"), 
                "warning": "Cloudinary AI Add-on not available. Uploaded original image."
            }
        else:
            raise HTTPException(status_code=500, detail=str(e))
