import time
import hashlib
import asyncio
import random
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.redis_client import redis_client
from app.config import settings


class AntiSpiderMiddleware(BaseHTTPMiddleware):
    """反爬虫中间件：行为分析 + 动态评分 + 分级处置"""

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        request_id = request.headers.get("x-request-id", "")

        # 1. 检查 IP 是否在封禁列表
        block_key = f"block:{client_ip}"
        try:
            if await redis_client.client.exists(block_key):
                return Response(
                    content='{"code":403,"message":"Access denied"}',
                    status_code=403,
                    media_type="application/json"
                )
        except Exception:
            pass

        # 2. 浏览器指纹生成
        fingerprint = self._generate_fingerprint(request, client_ip)
        request.state.fingerprint = fingerprint

        # 3. 请求频率检测
        is_limited = await self._check_rate_limit(client_ip, request.url.path)
        if is_limited:
            return Response(
                content='{"code":429,"message":"Rate limit exceeded","challenge":"captcha"}',
                status_code=429,
                media_type="application/json"
            )

        # 4. 行为评分
        bot_score = await self._calculate_bot_score(request, client_ip, fingerprint)
        if bot_score >= 80:
            try:
                await redis_client.client.setex(block_key, 3600, "behavior_score")
            except Exception:
                pass
            return Response(
                content='{"code":403,"message":"Suspicious activity detected"}',
                status_code=403,
                media_type="application/json"
            )
        elif bot_score >= 50:
            await asyncio.sleep(random.uniform(2, 5))

        # 继续处理请求
        response = await call_next(request)
        response.headers["X-Request-Id"] = request_id
        response.headers["X-Bot-Score"] = str(bot_score)
        return response

    def _generate_fingerprint(self, request: Request, client_ip: str) -> str:
        components = [
            client_ip,
            request.headers.get("user-agent", ""),
            request.headers.get("accept", ""),
            request.headers.get("accept-language", ""),
            request.headers.get("accept-encoding", ""),
            request.headers.get("sec-ch-ua", ""),
        ]
        raw = "|".join(components)
        return hashlib.sha256(raw.encode()).hexdigest()[:32]

    async def _check_rate_limit(self, ip: str, path: str) -> bool:
        key = f"rate_limit:{ip}:{path.split('?')[0]}"
        try:
            now = time.time()
            bucket_data = await redis_client.client.hgetall(key)

            bucket = bucket_data if bucket_data else {"tokens": "10", "last_update": str(now)}
            tokens = float(bucket.get("tokens", "10"))
            last_update = float(bucket.get("last_update", str(now)))

            tokens = min(20, tokens + (now - last_update) * 2)

            if tokens < 1:
                return True

            tokens -= 1
            await redis_client.client.hset(key, mapping={
                "tokens": str(tokens),
                "last_update": str(now)
            })
            await redis_client.client.expire(key, 60)
        except Exception:
            return False

        return False

    async def _calculate_bot_score(self, request: Request, client_ip: str, fingerprint: str) -> int:
        score = 0
        try:
            pipe = redis_client.client.pipeline()

            # 维度 1: 同一 IP 短时间内请求次数
            ip_key = f"req_count:{client_ip}"
            pipe.incr(ip_key)
            pipe.expire(ip_key, 60)

            # 维度 2: 指纹关联的 IP 数量
            fp_key = f"fingerprint:{fingerprint}"
            pipe.sadd(fp_key, client_ip)
            pipe.scard(fp_key)

            results = await pipe.execute()
            req_count = results[0]
            fp_ip_count = results[3]

            if req_count > 100:
                score += 40
            elif req_count > 50:
                score += 20

            if fp_ip_count > 5:
                score += 30
            elif fp_ip_count > 2:
                score += 10

            # 维度 3: Header 异常检测
            headers = request.headers
            if not headers.get("accept-language"):
                score += 10
            if not headers.get("referer") and str(request.url.path) != "/":
                score += 5
            if "sec-fetch-site" not in headers:
                score += 10
        except Exception:
            pass

        return min(100, score)
