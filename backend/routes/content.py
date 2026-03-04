from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
import models
import schemas
from auth import get_current_admin
from typing import Optional
import httpx

router = APIRouter()

@router.get("/home", response_model=schemas.SiteContentBase)
async def get_home_content(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.SiteContent).limit(1))
    content = result.scalars().first()
    if not content:
        # Fallback values
        return {
            "hero_title": "Dameer Ahmed Malik",
            "typing_tags": ["AI Agent Developer", "Data Scientist", "ML Engineer"],
            "hero_description": "Building intelligent systems and autonomous AI agents that transform data into decisions. Specializing in scalable ML pipelines and next-gen AI solutions."
        }
    return content

@router.put("/home", response_model=schemas.SiteContentBase)
async def update_home_content(
    content_update: schemas.SiteContentUpdate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.SiteContent).limit(1))
    existing = result.scalars().first()
    
    if existing:
        for key, value in content_update.model_dump().items():
            setattr(existing, key, value)
    else:
        existing = models.SiteContent(**content_update.model_dump())
        db.add(existing)
    
    await db.commit()
    await db.refresh(existing)
    return existing

# --- STATISTICS ---
@router.get("/stats", response_model=list[schemas.HomeStatBase])
async def get_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.HomeStat).order_by(models.HomeStat.order.asc()))
    return result.scalars().all()

@router.post("/stats", response_model=schemas.HomeStatBase)
async def create_stat(
    stat: schemas.HomeStatCreate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    db_stat = models.HomeStat(**stat.model_dump())
    db.add(db_stat)
    await db.commit()
    await db.refresh(db_stat)
    return db_stat

@router.put("/stats/{stat_id}", response_model=schemas.HomeStatBase)
async def update_stat(
    stat_id: int,
    stat_update: schemas.HomeStatUpdate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.HomeStat).where(models.HomeStat.id == stat_id))
    db_stat = result.scalars().first()
    if not db_stat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stat not found")
    
    for key, value in stat_update.model_dump(exclude_unset=True).items():
        setattr(db_stat, key, value)
    
    await db.commit()
    await db.refresh(db_stat)
    return db_stat

@router.delete("/stats/{stat_id}")
async def delete_stat(
    stat_id: int,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.HomeStat).where(models.HomeStat.id == stat_id))
    db_stat = result.scalars().first()
    if not db_stat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stat not found")
    
    await db.delete(db_stat)
    await db.commit()
    return {"status": "deleted"}

# --- TECH STACK ---
@router.get("/tech-stack", response_model=list[schemas.TechStackBase])
async def get_tech_stack(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.TechStack).order_by(models.TechStack.years_of_experience.desc()))
    return result.scalars().all()

@router.post("/tech-stack", response_model=schemas.TechStackBase)
async def create_tech_tag(
    tech: schemas.TechStackCreate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    db_tech = models.TechStack(**tech.model_dump())
    db.add(db_tech)
    try:
        await db.commit()
        await db.refresh(db_tech)
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag already exists or invalid data")
    return db_tech

@router.put("/tech-stack/{tech_id}", response_model=schemas.TechStackBase)
async def update_tech_tag(
    tech_id: int,
    tech_update: schemas.TechStackUpdate,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.TechStack).where(models.TechStack.id == tech_id))
    db_tech = result.scalars().first()
    if not db_tech:
        raise HTTPException(status_code=404, detail="Tech tag not found")
    
    for key, value in tech_update.model_dump(exclude_unset=True).items():
        setattr(db_tech, key, value)
    
    await db.commit()
    await db.refresh(db_tech)
    return db_tech

@router.delete("/tech-stack/{tech_id}")
async def delete_tech_tag(
    tech_id: int,
    admin=Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.TechStack).where(models.TechStack.id == tech_id))
    db_tech = result.scalars().first()
    if not db_tech:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    
    await db.delete(db_tech)
    await db.commit()
    return {"status": "deleted"}

@router.get("/github-stats")
async def get_github_stats():
    # Only Total Public Repositories and Total Contributions (Commits) for the last year
    # Username: dameerahmed
    username = "dameerahmed"
    try:
        async with httpx.AsyncClient() as client:
            # Fetch user info for repo count
            user_res = await client.get(f"https://api.github.com/users/{username}")
            user_data = user_res.json()
            public_repos = user_data.get("public_repos", 0)
            
            # Simple contribution placeholder as requested by user's "900+" example
            # Getting full contribution count accurately requires GraphQL auth
            return {
                "public_repos": public_repos,
                "contributions": "900+" 
            }
    except Exception:
        return {"public_repos": 0, "contributions": "0"}
