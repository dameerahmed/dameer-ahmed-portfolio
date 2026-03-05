import asyncio
import secrets
from database import AsyncSessionLocal
from models import AdminUser
from auth import get_password_hash
from sqlalchemy.future import select
from config import settings

async def main():
    async with AsyncSessionLocal() as db:
        # 1. Generate Raw Key
        raw_key = secrets.token_hex(8).upper() # 16 chars
        hashed_key = get_password_hash(raw_key)

        # 2. Update AdminUser
        res = await db.execute(select(AdminUser).where(AdminUser.username == settings.ADMIN_USERNAME))
        user = res.scalars().first()
        
        if not user:
            print("Admin user not found in DB. Creating one...")
            user = AdminUser(username=settings.ADMIN_USERNAME, hashed_password=get_password_hash(settings.ADMIN_PASSWORD))
            db.add(user)
            await db.flush()

        user.recovery_key = hashed_key
        await db.commit()
        
        print(f"MASTER_RECOVERY_KEY_GENERATED: {raw_key}")
        print("This key has been hashed and saved to the database.")

if __name__ == "__main__":
    asyncio.run(main())
