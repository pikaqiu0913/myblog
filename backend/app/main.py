import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base
from app.redis_client import redis_client
from app.routers import auth, profile, family, blog, upload, admin, friend, guestbook
from app.middleware.anti_spider import AntiSpiderMiddleware
from app.middleware.rate_limit import RateLimitMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await redis_client.connect()
    yield
    # Shutdown
    await redis_client.disconnect()
    await engine.dispose()


app = FastAPI(
    title=settings.SITE_NAME,
    description="个人网站 API",
    version="1.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", settings.SITE_URL] if settings.SITE_URL else ["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 反爬虫中间件
app.add_middleware(AntiSpiderMiddleware)
app.add_middleware(RateLimitMiddleware)

# 静态文件
upload_dir = os.environ.get("UPLOAD_DIR", "./uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

# 路由注册
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(profile.router, prefix="/api/v1/profile", tags=["个人介绍"])
app.include_router(family.router, prefix="/api/v1/family", tags=["家庭成员"])
app.include_router(blog.router, prefix="/api/v1/blog", tags=["博客"])
app.include_router(upload.router, prefix="/api/v1/upload", tags=["文件上传"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["管理"])
app.include_router(friend.router, prefix="/api/v1/friends", tags=["朋友"])
app.include_router(guestbook.router, prefix="/api/v1/guestbook", tags=["留言板"])


@app.get("/health")
async def health_check():
    return {"status": "ok"}
