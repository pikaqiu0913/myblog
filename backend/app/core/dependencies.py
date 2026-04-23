from typing import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import AsyncSessionLocal
from app.middleware.auth_jwt import get_current_user


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# 常用依赖组合
current_user = Depends(get_current_user)
db_session = Depends(get_db_session)
