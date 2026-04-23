from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    sub: str | None = None
    exp: int | None = None


class UserLogin(BaseModel):
    username: str
    password: str
    captcha_id: str
    captcha_code: str


class CaptchaResponse(BaseModel):
    captcha_id: str
    captcha_image: str  # base64
