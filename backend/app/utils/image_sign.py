import time
import hmac
import hashlib

from app.config import settings


class ImageUrlSigner:
    """照片 URL 时效签名，防止直链批量爬取"""

    def __init__(self):
        self.secret = settings.IMAGE_SIGN_SECRET
        self.expire_seconds = settings.IMAGE_SIGN_EXPIRE_SECONDS

    def sign(self, file_path: str) -> str:
        """为图片路径生成时效签名 URL"""
        expire_ts = int(time.time()) + self.expire_seconds
        data = f"{file_path}:{expire_ts}"
        signature = hmac.new(
            self.secret.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()[:16]

        return f"{file_path}?sign={signature}&t={expire_ts}"

    def verify(self, file_path: str, sign: str, t: str) -> bool:
        """验证签名是否有效"""
        try:
            expire_ts = int(t)
            if time.time() > expire_ts:
                return False

            data = f"{file_path}:{expire_ts}"
            expected = hmac.new(
                self.secret.encode(),
                data.encode(),
                hashlib.sha256
            ).hexdigest()[:16]

            return hmac.compare_digest(sign, expected)
        except (ValueError, TypeError):
            return False


image_signer = ImageUrlSigner()
