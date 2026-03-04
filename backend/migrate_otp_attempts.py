"""Migration: Add failed_attempts to admin_otps table"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from config import settings

async def migrate():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        await conn.execute(text(
            "ALTER TABLE admin_otps ADD COLUMN IF NOT EXISTS failed_attempts INTEGER NOT NULL DEFAULT 0"
        ))
        print("  ✓ Column failed_attempts added to admin_otps")
    await engine.dispose()
    print("Migration complete!")

asyncio.run(migrate())
