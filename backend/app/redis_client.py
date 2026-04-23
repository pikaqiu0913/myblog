from redis.asyncio import Redis

from app.config import settings


class RedisClient:
    def __init__(self):
        self._redis: Redis | None = None

    async def connect(self):
        self._redis = Redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
        )

    async def disconnect(self):
        if self._redis:
            await self._redis.close()

    @property
    def client(self) -> Redis:
        if self._redis is None:
            raise RuntimeError("Redis not connected")
        return self._redis


redis_client = RedisClient()
