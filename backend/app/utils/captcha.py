import base64
import io
import random
import string
from PIL import Image, ImageDraw, ImageFont

from app.redis_client import redis_client
from app.config import settings


class CaptchaGenerator:
    """图形验证码生成器"""

    def __init__(self, width: int = 120, height: int = 40):
        self.width = width
        self.height = height

    async def generate(self) -> tuple[str, str, str]:
        """生成验证码，返回 (captcha_id, captcha_code, base64_image)"""
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        captcha_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=16))

        # 创建图片
        image = Image.new('RGB', (self.width, self.height), self._random_bg_color())
        draw = ImageDraw.Draw(image)

        # 绘制干扰线
        for _ in range(5):
            x1 = random.randint(0, self.width)
            y1 = random.randint(0, self.height)
            x2 = random.randint(0, self.width)
            y2 = random.randint(0, self.height)
            draw.line([(x1, y1), (x2, y2)], fill=self._random_line_color(), width=1)

        # 绘制干扰点
        for _ in range(30):
            x = random.randint(0, self.width)
            y = random.randint(0, self.height)
            draw.point((x, y), fill=self._random_line_color())

        # 绘制文字
        font_size = 24
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()

        for i, char in enumerate(code):
            x = 20 + i * 25 + random.randint(-3, 3)
            y = random.randint(5, 10)
            draw.text((x, y), char, font=font, fill=self._random_text_color())

        # 转为 base64
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()

        # 存入 Redis
        await redis_client.client.setex(f"captcha:{captcha_id}", 300, code)

        return captcha_id, code, f"data:image/png;base64,{img_str}"

    async def verify(self, captcha_id: str, captcha_code: str) -> bool:
        """验证验证码"""
        try:
            key = f"captcha:{captcha_id}"
            stored_code = await redis_client.client.get(key)
            if stored_code and stored_code.upper() == captcha_code.upper():
                await redis_client.client.delete(key)
                return True
        except Exception:
            pass
        return False

    def _random_bg_color(self):
        return (random.randint(200, 255), random.randint(200, 255), random.randint(200, 255))

    def _random_text_color(self):
        return (random.randint(0, 100), random.randint(0, 100), random.randint(0, 100))

    def _random_line_color(self):
        return (random.randint(100, 200), random.randint(100, 200), random.randint(100, 200))


captcha_generator = CaptchaGenerator()
