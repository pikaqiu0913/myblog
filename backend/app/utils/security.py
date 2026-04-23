import uuid
import secrets
import string

from app.utils.validators import validate_password_strength


def generate_random_string(length: int = 32) -> str:
    """生成随机字符串"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def generate_uuid() -> str:
    """生成 UUID"""
    return str(uuid.uuid4())
