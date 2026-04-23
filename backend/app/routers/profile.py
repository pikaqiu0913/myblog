from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.profile import Profile
from app.models.education import Education
from app.models.photo_album import PhotoAlbum
from app.models.media import Media
from app.schemas.profile import (
    ProfileResponse, ProfileUpdate,
    EducationResponse, EducationCreate, EducationUpdate,
    PhotoAlbumResponse, PhotoAlbumCreate, PhotoAlbumUpdate
)
from app.schemas.common import ResponseModel
from app.middleware.auth_jwt import get_current_user
from app.utils.image_sign import image_signer

router = APIRouter()


@router.get("/", response_model=ResponseModel[ProfileResponse])
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Profile).limit(1))
    profile = result.scalar_one_or_none()

    if not profile:
        # 返回空结构
        return ResponseModel(data=ProfileResponse(id=0, real_name="", view_count=0))

    # 构建响应
    avatar = None
    if profile.avatar_media_id:
        media_result = await db.execute(select(Media).where(Media.id == profile.avatar_media_id))
        media = media_result.scalar_one_or_none()
        if media:
            avatar = {
                "id": media.id,
                "original_name": media.original_name,
                "file_name": media.file_name,
                "file_url": image_signer.sign(media.file_url),
                "mime_type": media.mime_type,
                "file_size": media.file_size,
                "width": media.width,
                "height": media.height,
                "alt_text": media.alt_text,
                "description": media.description,
                "created_at": media.created_at,
            }

    return ResponseModel(data=ProfileResponse(
        id=profile.id,
        real_name=profile.real_name,
        nick_name=profile.nick_name,
        motto=profile.motto,
        bio=profile.bio,
        bio_html=profile.bio_html,
        birth_date=profile.birth_date,
        location=profile.location,
        email_public=profile.email_public,
        phone_public=profile.phone_public,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        wechat_qr_url=profile.wechat_qr_url,
        avatar=avatar,
        resume_url=profile.resume_url,
        is_public=profile.is_public,
        view_count=profile.view_count,
    ))


@router.put("/", response_model=ResponseModel[ProfileResponse])
async def update_profile(
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Profile).limit(1))
    profile = result.scalar_one_or_none()

    if not profile:
        profile = Profile(real_name=data.real_name or "")
        db.add(profile)
        await db.flush()

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    await db.commit()
    await db.refresh(profile)

    return ResponseModel(data=ProfileResponse(
        id=profile.id,
        real_name=profile.real_name,
        nick_name=profile.nick_name,
        motto=profile.motto,
        bio=profile.bio,
        bio_html=profile.bio_html,
        birth_date=profile.birth_date,
        location=profile.location,
        email_public=profile.email_public,
        phone_public=profile.phone_public,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        wechat_qr_url=profile.wechat_qr_url,
        resume_url=profile.resume_url,
        is_public=profile.is_public,
        view_count=profile.view_count,
    ))


@router.get("/education", response_model=ResponseModel[list[EducationResponse]])
async def get_education_list(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Education).order_by(asc(Education.sort_order), desc(Education.start_date))
    )
    items = result.scalars().all()
    return ResponseModel(data=[EducationResponse.model_validate(item) for item in items])


@router.post("/education", response_model=ResponseModel[EducationResponse])
async def create_education(
    data: EducationCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    edu = Education(**data.model_dump())
    db.add(edu)
    await db.commit()
    await db.refresh(edu)
    return ResponseModel(data=EducationResponse.model_validate(edu))


@router.put("/education/{edu_id}", response_model=ResponseModel[EducationResponse])
async def update_education(
    edu_id: int,
    data: EducationUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Education).where(Education.id == edu_id))
    edu = result.scalar_one_or_none()
    if not edu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(edu, key, value)

    await db.commit()
    await db.refresh(edu)
    return ResponseModel(data=EducationResponse.model_validate(edu))


@router.delete("/education/{edu_id}")
async def delete_education(
    edu_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Education).where(Education.id == edu_id))
    edu = result.scalar_one_or_none()
    if not edu:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Education not found")

    await db.delete(edu)
    await db.commit()
    return ResponseModel(message="Deleted successfully")


@router.get("/photo_albums", response_model=ResponseModel[list[PhotoAlbumResponse]])
async def get_photo_albums(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PhotoAlbum).order_by(asc(PhotoAlbum.sort_order))
    )
    items = result.scalars().all()

    data = []
    for album in items:
        cover = None
        if album.cover_media_id:
            mr = await db.execute(select(Media).where(Media.id == album.cover_media_id))
            media = mr.scalar_one_or_none()
            if media:
                cover = {
                    "id": media.id,
                    "original_name": media.original_name,
                    "file_name": media.file_name,
                    "file_url": image_signer.sign(media.file_url),
                    "mime_type": media.mime_type,
                    "file_size": media.file_size,
                    "width": media.width,
                    "height": media.height,
                    "alt_text": media.alt_text,
                    "description": media.description,
                    "created_at": media.created_at,
                }
        data.append(PhotoAlbumResponse(
            id=album.id,
            name=album.name,
            slug=album.slug,
            description=album.description,
            cover=cover,
            sort_order=album.sort_order,
            is_public=album.is_public,
            created_at=album.created_at,
        ))

    return ResponseModel(data=data)


@router.post("/photo_albums", response_model=ResponseModel[PhotoAlbumResponse])
async def create_photo_album(
    data: PhotoAlbumCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    album = PhotoAlbum(**data.model_dump())
    db.add(album)
    await db.commit()
    await db.refresh(album)
    return ResponseModel(data=PhotoAlbumResponse(
        id=album.id, name=album.name, slug=album.slug,
        description=album.description, sort_order=album.sort_order,
        is_public=album.is_public, created_at=album.created_at
    ))


@router.put("/photo_albums/{album_id}", response_model=ResponseModel[PhotoAlbumResponse])
async def update_photo_album(
    album_id: int,
    data: PhotoAlbumUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(PhotoAlbum).where(PhotoAlbum.id == album_id))
    album = result.scalar_one_or_none()
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(album, key, value)

    await db.commit()
    await db.refresh(album)
    return ResponseModel(data=PhotoAlbumResponse(
        id=album.id, name=album.name, slug=album.slug,
        description=album.description, sort_order=album.sort_order,
        is_public=album.is_public, created_at=album.created_at
    ))


@router.delete("/photo_albums/{album_id}")
async def delete_photo_album(
    album_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(PhotoAlbum).where(PhotoAlbum.id == album_id))
    album = result.scalar_one_or_none()
    if not album:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

    await db.delete(album)
    await db.commit()
    return ResponseModel(message="Deleted successfully")
