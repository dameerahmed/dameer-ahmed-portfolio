import asyncio
import secrets
import bcrypt
from database import AsyncSessionLocal
from sqlalchemy import text

def get_password_hash(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

async def main():
    raw_key = secrets.token_hex(8).upper() # 16 chars
    hashed_key = get_password_hash(raw_key)
    
    async with AsyncSessionLocal() as db:
        # Use raw SQL to update the recovery_key for user 'dameer'
        await db.execute(text("UPDATE admin_users SET recovery_key = :key WHERE username = :user"), {"key": hashed_key, "user": "dameer"})
        await db.commit()
        print(f"MASTER_RECOVERY_KEY_GENERATED: {raw_key}")

if __name__ == "__main__":
    asyncio.run(main())
