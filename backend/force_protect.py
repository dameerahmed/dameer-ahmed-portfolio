import asyncio
from database import AsyncSessionLocal
from models import AdminSession
from sqlalchemy.future import select
from sqlalchemy import update

async def main():
    async with AsyncSessionLocal() as db:
        # 1. Find the absolute latest active session
        res = await db.execute(select(AdminSession).where(AdminSession.is_active == True).order_by(AdminSession.last_active.desc()))
        sessions = res.scalars().all()
        
        if not sessions:
            print("No active sessions found.")
            return

        latest = sessions[0]
        print(f"Targeting Latest Session: ID {latest.id}, Device: {latest.device_id}")

        # 2. Clear all other protections (to be safe)
        await db.execute(update(AdminSession).values(is_protected=False))
        
        # 3. Protect the latest one
        latest.is_protected = True
        await db.commit()
        print(f"SUCCESS: Session {latest.id} is now PROTECTED.")

if __name__ == "__main__":
    asyncio.run(main())
