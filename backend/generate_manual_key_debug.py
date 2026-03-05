import asyncio
import secrets
import traceback
from database import AsyncSessionLocal
from models import AdminUser
from auth import get_password_hash
from sqlalchemy.future import select
from sqlalchemy import text
from config import settings

async def main():
    try:
        async with AsyncSessionLocal() as db:
            # 1. Generate Raw Key
            raw_key = secrets.token_hex(8).upper() # 16 chars
            hashed_key = get_password_hash(raw_key)

            print(f"DEBUG: Username is {settings.ADMIN_USERNAME}")
            
            # 2. Update AdminUser
            res = await db.execute(select(AdminUser).where(AdminUser.username == settings.ADMIN_USERNAME))
            user = res.scalars().first()
            
            if not user:
                print("DEBUG: Admin user not found. Creating...")
                user = AdminUser(username=settings.ADMIN_USERNAME, hashed_password=get_password_hash("TEMP_PW_123"))
                db.add(user)
                await db.flush()

            user.recovery_key = hashed_key
            await db.commit()
            
            print(f"MASTER_RECOVERY_KEY_GENERATED: {raw_key}")
    except Exception as e:
        print(f"ERROR: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
