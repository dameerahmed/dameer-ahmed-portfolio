import asyncio
from database import AsyncSessionLocal
from models import AdminSession
from sqlalchemy.future import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(AdminSession).where(AdminSession.is_active == True))
        sessions = res.scalars().all()
        print("Active Sessions:")
        for s in sessions:
            print(f"ID: {s.id}, DeviceID: {s.device_id}, Protected: {s.is_protected}, Name: {s.device_name}")

if __name__ == "__main__":
    asyncio.run(main())
