import os
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.media import Media
from app.schemas.media import MediaUploadResponse, MediaResponse
from app.schemas.common import ResponseModel
from app.middleware.auth_jwt import get_current_user
from app.utils.image_process import image_processor
from app.utils.image_sign import image_signer

router = APIRouter()


@router.post("/image", response_model=ResponseModel[MediaUploadResponse])
async def upload_image(
    file: UploadFile = File(...),
    module_type: str = "general",
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    # 验证文件
    content = await file.read()
    file_size = len(content)

    if not image_processor.validate(file.content_type or "", file_size):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type or size exceeds limit"
        )

    # 保存文件
    file_info = await image_processor.save(content, file.filename, file.content_type or "image/jpeg", module_type)

    # 记录到数据库
    media = Media(
        original_name=file_info["original_name"],
        file_name=file_info["file_name"],
        file_path=file_info["file_path"],
        file_url=file_info["file_url"],
        mime_type=file_info["mime_type"],
        file_size=file_info["file_size"],
        width=file_info.get("width"),
        height=file_info.get("height"),
        module_type=module_type,
        uploaded_by=None,  # 简化处理
    )
    db.add(media)
    await db.commit()
    await db.refresh(media)

    media_resp = MediaResponse(
        id=media.id,
        original_name=media.original_name,
        file_name=media.file_name,
        file_url=media.file_url,
        mime_type=media.mime_type,
        file_size=media.file_size,
        width=media.width,
        height=media.height,
        alt_text=media.alt_text,
        description=media.description,
        created_at=media.created_at,
    )

    return ResponseModel(data=MediaUploadResponse(
        media=media_resp,
        signed_url=image_signer.sign(media.file_url)
    ))


@router.post("/images")
async def upload_images(
    files: list[UploadFile] = File(...),
    module_type: str = "general",
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    results = []
    for file in files:
        content = await file.read()
        file_size = len(content)

        if not image_processor.validate(file.content_type or "", file_size):
            continue

        file_info = await image_processor.save(content, file.filename, file.content_type or "image/jpeg", module_type)

        media = Media(
            original_name=file_info["original_name"],
            file_name=file_info["file_name"],
            file_path=file_info["file_path"],
            file_url=file_info["file_url"],
            mime_type=file_info["mime_type"],
            file_size=file_info["file_size"],
            width=file_info.get("width"),
            height=file_info.get("height"),
            module_type=module_type,
        )
        db.add(media)
        await db.flush()

        results.append({
            "id": media.id,
            "original_name": media.original_name,
            "signed_url": image_signer.sign(media.file_url),
        })

    await db.commit()
    return ResponseModel(data=results)


@router.get("/list", response_model=ResponseModel[list[MediaResponse]])
async def list_media(
    module_type: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    from sqlalchemy import select, desc
    query = select(Media).order_by(desc(Media.created_at))
    if module_type:
        query = query.where(Media.module_type == module_type)
    result = await db.execute(query)
    items = result.scalars().all()

    data = []
    for item in items:
        resp = MediaResponse.model_validate(item)
        resp.file_url = image_signer.sign(resp.file_url)
        data.append(resp)

    return ResponseModel(data=data)


@router.delete("/{media_id}")
async def delete_media(
    media_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    from sqlalchemy import select
    result = await db.execute(select(Media).where(Media.id == media_id))
    media = result.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")

    # 删除物理文件
    image_processor.delete(media.file_path)

    await db.delete(media)
    await db.commit()
    return ResponseModel(message="Deleted successfully")
