from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
import models
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone

router = APIRouter()

from pydantic import BaseModel, EmailStr, Field

class ContactForm(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(..., min_length=5, max_length=2000)

@router.get("/profile")
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SiteMetadata).limit(1))
    return result.scalars().first()

@router.get("/contact/emails")
async def get_emails(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactEmail))
    return result.scalars().all()

@router.get("/contact/phones")
async def get_phones(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.ContactPhone))
    return result.scalars().all()

@router.get("/skills")
async def get_skills(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Skill))
    return result.scalars().all()

@router.get("/projects")
async def get_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Project))
    return result.scalars().all()

@router.get("/journey")
async def get_journey(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.JourneyTimeline).order_by(models.JourneyTimeline.year.desc()))
    return result.scalars().all()

@router.get("/socials")
async def get_social_links(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SocialLink).order_by(models.SocialLink.order.asc()))
    return result.scalars().all()

@router.get("/services")
async def get_services(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Service))
    return result.scalars().all()

@router.get("/education")
async def get_education(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Education))
    return result.scalars().all()

@router.get("/hobbies")
async def get_hobbies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Hobby))
    return result.scalars().all()

@router.get("/languages")
async def get_languages(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Language))
    return result.scalars().all()

@router.post("/contact")
async def submit_contact(form: ContactForm, db: AsyncSession = Depends(get_db)):
    msg = models.ContactMessage(
        name=form.name,
        email=form.email,
        message=form.message,
        created_at=datetime.now(timezone.utc).isoformat()
    )
    db.add(msg)
    await db.commit()
    return {"status": "ok", "detail": "Message sent!"}
