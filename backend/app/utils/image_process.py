import os
import uuid
from io import BytesIO

from PIL import Image

from app.config import settings


class ImageProcessor:
    """图片处理工具"""

    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    MAX_WIDTH = 1920
    MAX_HEIGHT = 1080
    THUMB_SIZE = (400, 400)

    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)

    def validate(self, content_type: str, file_size: int) -> bool:
        if content_type not in self.ALLOWED_TYPES:
            return False
        if file_size > settings.MAX_UPLOAD_SIZE:
            return False
        return True

    async def save(self, file_bytes: bytes, original_name: str, content_type: str, module_type: str = "general") -> dict:
        """保存并处理图片，返回文件信息"""
        ext = original_name.rsplit(".", 1)[-1].lower() if "." in original_name else "jpg"
        if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
            ext = "jpg"

        file_name = f"{uuid.uuid4().hex}.{ext}"
        sub_dir = module_type
        save_dir = os.path.join(self.upload_dir, sub_dir)
        os.makedirs(save_dir, exist_ok=True)

        file_path = os.path.join(save_dir, file_name)

        # 打开图片
        image = Image.open(BytesIO(file_bytes))
        width, height = image.size

        # 压缩大图片
        if width > self.MAX_WIDTH or height > self.MAX_HEIGHT:
            ratio = min(self.MAX_WIDTH / width, self.MAX_HEIGHT / height)
            new_size = (int(width * ratio), int(height * ratio))
            image = image.resize(new_size, Image.LANCZOS)
            width, height = new_size

        # 转换为 RGB（去除透明通道）
        if image.mode in ("RGBA", "P"):
            background = Image.new("RGB", image.size, (255, 255, 255))
            if image.mode == "P":
                image = image.convert("RGBA")
            background.paste(image, mask=image.split()[-1] if image.mode == "RGBA" else None)
            image = background

        # 保存
        save_format = "JPEG" if ext in ("jpg", "jpeg") else ext.upper()
        if save_format == "JPEG":
            image.save(file_path, "JPEG", quality=85, optimize=True)
        else:
            image.save(file_path, save_format, optimize=True)

        file_size = os.path.getsize(file_path)
        relative_path = f"{sub_dir}/{file_name}"
        file_url = f"/uploads/{relative_path}"

        return {
            "original_name": original_name,
            "file_name": file_name,
            "file_path": relative_path,
            "file_url": file_url,
            "mime_type": content_type,
            "file_size": file_size,
            "width": width,
            "height": height,
        }

    def delete(self, file_path: str) -> bool:
        """删除图片文件"""
        full_path = os.path.join(self.upload_dir, file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
            return True
        return False


image_processor = ImageProcessor()
