import asyncio
from database import AsyncSessionLocal
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as db:
        try:
            # 1. Add recovery_key column to admin_users table
            await db.execute(text("ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS recovery_key VARCHAR"))
            # 2. Add device_name column to admin_sessions table (just in case)
            await db.execute(text("ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS device_name VARCHAR"))
            # 3. Add is_protected column to admin_sessions table (just in case)
            await db.execute(text("ALTER TABLE admin_sessions ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT FALSE"))
            
            await db.commit()
            print("SUCCESS: Database schema updated.")
        except Exception as e:
            print(f"ERROR updating schema: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
