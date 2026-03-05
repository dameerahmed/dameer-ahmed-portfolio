import asyncio
import bcrypt
from database import AsyncSessionLocal
from sqlalchemy import text

def get_password_hash(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")

async def main():
    # Hardcoded known key for the user to use as rescue
    raw_key = "DAMEER-SAFE-RECOVERY-2026"
    hashed_key = get_password_hash(raw_key)
    
    async with AsyncSessionLocal() as db:
        await db.execute(text("UPDATE admin_users SET recovery_key = :key WHERE username = :user"), {"key": hashed_key, "user": "dameer"})
        await db.commit()
        print(f"DEFINITIVE_KEY_SET_IN_DB: {raw_key}")

if __name__ == "__main__":
    asyncio.run(main())
