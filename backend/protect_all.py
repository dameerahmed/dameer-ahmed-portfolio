import asyncio
from database import AsyncSessionLocal
from models import AdminSession
from sqlalchemy.future import select
from sqlalchemy import update

async def main():
    async with AsyncSessionLocal() as db:
        # Protect all active sessions
        await db.execute(update(AdminSession).where(AdminSession.is_active == True).values(is_protected=True))
        await db.commit()
        print("SUCCESS: All active sessions are now PROTECTED.")

if __name__ == "__main__":
    asyncio.run(main())
