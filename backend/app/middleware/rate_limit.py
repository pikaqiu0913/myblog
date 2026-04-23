from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.redis_client import redis_client


class RateLimitMiddleware(BaseHTTPMiddleware):
    """全局限流中间件：对公开接口做更严格的限流"""

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        path = request.url.path

        # 公开接口更严格限流
        is_public_api = path.startswith("/api/v1/profile") or \
                        path.startswith("/api/v1/family") or \
                        path.startswith("/api/v1/blog")

        if is_public_api and request.method == "GET":
            key = f"global_rate:{client_ip}"
            try:
                count = await redis_client.client.incr(key)
                if count == 1:
                    await redis_client.client.expire(key, 60)
                if count > 120:  # 公开接口每分钟最多 120 请求
                    return Response(
                        content='{"code":429,"message":"Too many requests"}',
                        status_code=429,
                        media_type="application/json"
                    )
            except Exception:
                pass

        return await call_next(request)
