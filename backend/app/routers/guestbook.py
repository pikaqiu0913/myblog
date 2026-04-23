from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy import select, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.guestbook_message import GuestbookMessage
from app.schemas.guestbook import (
    GuestbookMessageResponse, GuestbookMessageCreate, GuestbookMessageUpdate
)
from app.schemas.common import ResponseModel
from app.middleware.auth_jwt import get_current_user
from app.redis_client import redis_client

router = APIRouter()

RATE_LIMIT_WINDOW = 600  # 10 minutes
RATE_LIMIT_MAX = 3


@router.get("/messages", response_model=ResponseModel[list[GuestbookMessageResponse]])
async def get_messages(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(GuestbookMessage)
        .where(GuestbookMessage.is_public == True)
        .order_by(desc(GuestbookMessage.created_at))
        .limit(limit)
    )
    items = result.scalars().all()
    return ResponseModel(data=[
        GuestbookMessageResponse.model_validate(item) for item in items
    ])


@router.get("/messages/all", response_model=ResponseModel[list[GuestbookMessageResponse]])
async def get_all_messages(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(GuestbookMessage).order_by(desc(GuestbookMessage.created_at))
    )
    items = result.scalars().all()
    return ResponseModel(data=[
        GuestbookMessageResponse.model_validate(item) for item in items
    ])


@router.post("/messages", response_model=ResponseModel[GuestbookMessageResponse])
async def create_message(
    data: GuestbookMessageCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    fingerprint = getattr(request.state, 'fingerprint', None)

    # 限流检查
    key = f"guestbook:{client_ip}"
    try:
        count = await redis_client.client.incr(key)
        if count == 1:
            await redis_client.client.expire(key, RATE_LIMIT_WINDOW)
        if count > RATE_LIMIT_MAX:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="提交过于频繁，请10分钟后再试"
            )
    except HTTPException:
        raise
    except Exception:
        # Redis 异常时放行，避免阻断正常功能
        pass

    message = GuestbookMessage(
        **data.model_dump(),
        ip_address=client_ip,
        fingerprint=fingerprint,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)

    return ResponseModel(data=GuestbookMessageResponse.model_validate(message))


@router.put("/messages/{message_id}", response_model=ResponseModel[GuestbookMessageResponse])
async def update_message(
    message_id: int,
    data: GuestbookMessageUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(GuestbookMessage).where(GuestbookMessage.id == message_id)
    )
    message = result.scalar_one_or_none()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(message, key, value)

    await db.commit()
    await db.refresh(message)
    return ResponseModel(data=GuestbookMessageResponse.model_validate(message))


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(GuestbookMessage).where(GuestbookMessage.id == message_id)
    )
    message = result.scalar_one_or_none()
    if not message:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")

    await db.delete(message)
    await db.commit()
    return ResponseModel(message="Deleted successfully")
