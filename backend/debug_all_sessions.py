import asyncio
from database import AsyncSessionLocal
from models import AdminSession
from sqlalchemy.future import select

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(AdminSession))
        sessions = res.scalars().all()
        print("ALL SESSIONS IN DB:")
        for s in sessions:
            print(f"ID: {s.id}, DeviceID: {s.device_id}, Active: {s.is_active}, Protected: {s.is_protected}, IP: {s.ip_address}")

if __name__ == "__main__":
    asyncio.run(main())
