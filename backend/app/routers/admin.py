from fastapi import APIRouter, Depends
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.article import Article
from app.models.family_member import FamilyMember
from app.models.access_log import AccessLog
from app.models.bot_block import BotBlock
from app.schemas.common import ResponseModel
from app.middleware.auth_jwt import get_current_user

router = APIRouter()


@router.get("/dashboard/stats", response_model=ResponseModel[dict])
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    # 文章统计
    article_result = await db.execute(select(func.count(Article.id)))
    article_count = article_result.scalar()

    # 家庭成员统计
    family_result = await db.execute(select(func.count(FamilyMember.id)))
    family_count = family_result.scalar()

    # 今日访问
    from datetime import datetime, timedelta
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    access_result = await db.execute(
        select(func.count(AccessLog.id)).where(AccessLog.created_at >= today)
    )
    today_access = access_result.scalar()

    # 疑似爬虫
    bot_result = await db.execute(
        select(func.count(AccessLog.id)).where(
            AccessLog.is_suspected_bot == True,
            AccessLog.created_at >= today
        )
    )
    today_bots = bot_result.scalar()

    return ResponseModel(data={
        "article_count": article_count,
        "family_count": family_count,
        "today_access": today_access,
        "today_bots": today_bots,
    })


@router.get("/access_logs", response_model=ResponseModel[list[dict]])
async def get_access_logs(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(AccessLog).order_by(desc(AccessLog.created_at)).limit(limit)
    )
    items = result.scalars().all()
    return ResponseModel(data=[{
        "id": item.id,
        "ip_address": item.ip_address,
        "request_path": item.request_path,
        "request_method": item.request_method,
        "response_status": item.response_status,
        "is_suspected_bot": item.is_suspected_bot,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    } for item in items])


@router.get("/bot_blocks", response_model=ResponseModel[list[dict]])
async def get_bot_blocks(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(BotBlock).order_by(desc(BotBlock.created_at)).limit(100)
    )
    items = result.scalars().all()
    return ResponseModel(data=[{
        "id": item.id,
        "ip_address": item.ip_address,
        "block_reason": item.block_reason,
        "expires_at": item.expires_at.isoformat() if item.expires_at else None,
        "created_at": item.created_at.isoformat() if item.created_at else None,
    } for item in items])


@router.post("/bot_blocks/{ip}/unblock", response_model=ResponseModel[dict])
async def unblock_ip(
    ip: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    # 删除数据库记录
    result = await db.execute(select(BotBlock).where(BotBlock.ip_address == ip))
    blocks = result.scalars().all()
    for block in blocks:
        await db.delete(block)
    await db.commit()

    # 删除 Redis 记录
    from app.redis_client import redis_client
    await redis_client.client.delete(f"block:{ip}")

    return ResponseModel(data={"unblocked": True})
