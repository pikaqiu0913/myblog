from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.family_member import FamilyMember
from app.models.family_member_photo import FamilyMemberPhoto
from app.models.media import Media
from app.schemas.family import (
    FamilyMemberResponse, FamilyMemberDetailResponse,
    FamilyMemberCreate, FamilyMemberUpdate,
    FamilyMemberPhotoResponse
)
from app.schemas.common import ResponseModel
from app.middleware.auth_jwt import get_current_user
from app.utils.image_sign import image_signer

router = APIRouter()


@router.get("/members", response_model=ResponseModel[list[FamilyMemberResponse]])
async def get_family_members(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(FamilyMember).order_by(asc(FamilyMember.sort_order))
    )
    items = result.scalars().all()

    data = []
    for member in items:
        avatar = None
        if member.avatar_media_id:
            mr = await db.execute(select(Media).where(Media.id == member.avatar_media_id))
            media = mr.scalar_one_or_none()
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

        # 获取照片数量
        cnt_result = await db.execute(
            select(func.count(FamilyMemberPhoto.id)).where(FamilyMemberPhoto.family_member_id == member.id)
        )
        photo_count = cnt_result.scalar() or 0

        # 获取摘要（前 100 字符）
        bio_summary = member.bio[:100] + "..." if member.bio and len(member.bio) > 100 else member.bio

        data.append(FamilyMemberResponse(
            id=member.id,
            name=member.name,
            relation=member.relation,
            avatar=avatar,
            bio_summary=bio_summary,
            photo_count=photo_count,
            sort_order=member.sort_order,
        ))

    return ResponseModel(data=data)


@router.get("/members/{member_id}", response_model=ResponseModel[FamilyMemberDetailResponse])
async def get_family_member_detail(member_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FamilyMember).where(FamilyMember.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    avatar = None
    if member.avatar_media_id:
        mr = await db.execute(select(Media).where(Media.id == member.avatar_media_id))
        media = mr.scalar_one_or_none()
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

    # 获取照片
    photos_result = await db.execute(
        select(FamilyMemberPhoto).where(FamilyMemberPhoto.family_member_id == member_id)
        .order_by(asc(FamilyMemberPhoto.sort_order))
    )
    photos = []
    for fp in photos_result.scalars().all():
        mr = await db.execute(select(Media).where(Media.id == fp.media_id))
        media = mr.scalar_one_or_none()
        if media:
            photos.append(FamilyMemberPhotoResponse(
                id=fp.id,
                media_id=fp.media_id,
                file_url=image_signer.sign(media.file_url),
                caption=fp.caption,
                sort_order=fp.sort_order,
                created_at=fp.created_at,
            ))

    # 解析 hobbies JSON
    hobbies = []
    if member.hobbies:
        import json
        try:
            hobbies = json.loads(member.hobbies)
        except:
            hobbies = []

    return ResponseModel(data=FamilyMemberDetailResponse(
        id=member.id,
        name=member.name,
        relation=member.relation,
        avatar=avatar,
        bio=member.bio,
        bio_html=member.bio_html,
        birth_date=member.birth_date,
        hobbies=hobbies,
        photos=photos,
        view_count=member.view_count,
        sort_order=member.sort_order,
        created_at=member.created_at,
    ))


@router.post("/members", response_model=ResponseModel[FamilyMemberResponse])
async def create_family_member(
    data: FamilyMemberCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    import json
    dump = data.model_dump()
    if dump.get("hobbies"):
        dump["hobbies"] = json.dumps(dump["hobbies"])

    member = FamilyMember(**dump)
    db.add(member)
    await db.commit()
    await db.refresh(member)

    return ResponseModel(data=FamilyMemberResponse(
        id=member.id, name=member.name, relation=member.relation,
        sort_order=member.sort_order
    ))


@router.put("/members/{member_id}", response_model=ResponseModel[FamilyMemberResponse])
async def update_family_member(
    member_id: int,
    data: FamilyMemberUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(FamilyMember).where(FamilyMember.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    update_data = data.model_dump(exclude_unset=True)
    if "hobbies" in update_data and update_data["hobbies"] is not None:
        import json
        update_data["hobbies"] = json.dumps(update_data["hobbies"])

    for key, value in update_data.items():
        setattr(member, key, value)

    await db.commit()
    await db.refresh(member)
    return ResponseModel(data=FamilyMemberResponse(
        id=member.id, name=member.name, relation=member.relation,
        sort_order=member.sort_order
    ))


@router.delete("/members/{member_id}")
async def delete_family_member(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(FamilyMember).where(FamilyMember.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    await db.delete(member)
    await db.commit()
    return ResponseModel(message="Deleted successfully")


@router.post("/members/{member_id}/photos")
async def add_member_photo(
    member_id: int,
    media_id: int,
    caption: str = "",
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(FamilyMember).where(FamilyMember.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    photo = FamilyMemberPhoto(
        family_member_id=member_id,
        media_id=media_id,
        caption=caption,
    )
    db.add(photo)
    await db.commit()
    await db.refresh(photo)
    return ResponseModel(message="Photo added")


@router.delete("/members/{member_id}/photos/{photo_id}")
async def delete_member_photo(
    member_id: int,
    photo_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(
        select(FamilyMemberPhoto).where(
            FamilyMemberPhoto.id == photo_id,
            FamilyMemberPhoto.family_member_id == member_id
        )
    )
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")

    await db.delete(photo)
    await db.commit()
    return ResponseModel(message="Photo deleted")
