from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserLogin, Token, CaptchaResponse
from app.schemas.common import ResponseModel
from app.middleware.auth_jwt import verify_password, create_access_token, create_refresh_token
from app.utils.captcha import captcha_generator
from app.config import settings

router = APIRouter()


@router.get("/captcha", response_model=ResponseModel[CaptchaResponse])
async def get_captcha():
    captcha_id, _, captcha_image = await captcha_generator.generate()
    return ResponseModel(data=CaptchaResponse(captcha_id=captcha_id, captcha_image=captcha_image))


@router.post("/login", response_model=ResponseModel[Token])
async def login(form_data: UserLogin, db: AsyncSession = Depends(get_db)):
    # 验证验证码
    if not await captcha_generator.verify(form_data.captcha_id, form_data.captcha_code):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid captcha")

    # 验证用户
    result = await db.execute(select(User).where(User.username == form_data.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    # 生成 Token
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})

    return ResponseModel(data=Token(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    ))


@router.post("/refresh", response_model=ResponseModel[Token])
async def refresh_token():
    # 简化实现，实际需要从 refresh token 中提取用户信息
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented")
