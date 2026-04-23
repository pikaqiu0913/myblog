from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.friend_member import FriendMember
from app.models.media import Media
from app.schemas.friend import (
    FriendMemberResponse, FriendMemberDetailResponse,
    FriendMemberCreate, FriendMemberUpdate
)
from app.schemas.common import ResponseModel
from app.middleware.auth_jwt import get_current_user
from app.utils.image_sign import image_signer

router = APIRouter()

CATEGORY_LABELS = {
    "high_school": "高中",
    "undergraduate": "本科",
    "internship": "实习",
}


async def _build_member_response(member: FriendMember, db: AsyncSession):
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
    bio_summary = member.bio[:100] + "..." if member.bio and len(member.bio) > 100 else member.bio
    return FriendMemberResponse(
        id=member.id,
        name=member.name,
        category=member.category,
        avatar=avatar,
        bio_summary=bio_summary,
        sort_order=member.sort_order,
    )


@router.get("/members", response_model=ResponseModel[dict])
async def get_friend_members(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(FriendMember).order_by(asc(FriendMember.sort_order))
    )
    items = result.scalars().all()

    grouped = {"high_school": [], "undergraduate": [], "internship": []}
    for member in items:
        resp = await _build_member_response(member, db)
        if member.category in grouped:
            grouped[member.category].append(resp)

    data = {
        "categories": [
            {"key": "high_school", "label": CATEGORY_LABELS["high_school"], "members": grouped["high_school"]},
            {"key": "undergraduate", "label": CATEGORY_LABELS["undergraduate"], "members": grouped["undergraduate"]},
            {"key": "internship", "label": CATEGORY_LABELS["internship"], "members": grouped["internship"]},
        ]
    }
    return ResponseModel(data=data)


@router.get("/members/{member_id}", response_model=ResponseModel[FriendMemberDetailResponse])
async def get_friend_member_detail(member_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(FriendMember).where(FriendMember.id == member_id))
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

    return ResponseModel(data=FriendMemberDetailResponse(
        id=member.id,
        name=member.name,
        category=member.category,
        avatar=avatar,
        bio=member.bio,
        bio_html=member.bio_html,
        sort_order=member.sort_order,
        created_at=member.created_at,
    ))


@router.post("/members", response_model=ResponseModel[FriendMemberResponse])
async def create_friend_member(
    data: FriendMemberCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    member = FriendMember(**data.model_dump())
    db.add(member)
    await db.commit()
    await db.refresh(member)
    resp = await _build_member_response(member, db)
    return ResponseModel(data=resp)


@router.put("/members/{member_id}", response_model=ResponseModel[FriendMemberResponse])
async def update_friend_member(
    member_id: int,
    data: FriendMemberUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(FriendMember).where(FriendMember.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(member, key, value)

    await db.commit()
    await db.refresh(member)
    resp = await _build_member_response(member, db)
    return ResponseModel(data=resp)


@router.delete("/members/{member_id}")
async def delete_friend_member(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(FriendMember).where(FriendMember.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    await db.delete(member)
    await db.commit()
    return ResponseModel(message="Deleted successfully")
