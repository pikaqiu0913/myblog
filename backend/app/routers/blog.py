from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.article import Article
from app.models.category import Category
from app.models.media import Media
from app.schemas.article import (
    ArticleResponse, ArticleListResponse, ArticleCreate, ArticleUpdate,
    CategoryResponse, CategoryCreate, CategoryUpdate
)
from app.schemas.common import ResponseModel, PaginatedResponse
from app.middleware.auth_jwt import get_current_user
from app.utils.image_sign import image_signer

router = APIRouter()


@router.get("/articles", response_model=ResponseModel[PaginatedResponse[ArticleListResponse]])
async def get_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    category: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * page_size

    # 构建查询
    base_query = select(Article).where(Article.status == "published")

    if category:
        cat_result = await db.execute(select(Category).where(Category.slug == category))
        cat = cat_result.scalar_one_or_none()
        if cat:
            base_query = base_query.where(Article.category_id == cat.id)

    # 总数
    count_result = await db.execute(select(func.count()).select_from(base_query.subquery()))
    total = count_result.scalar()

    # 分页查询
    result = await db.execute(
        base_query.order_by(desc(Article.is_top), desc(Article.published_at))
        .offset(offset).limit(page_size)
    )
    items = result.scalars().all()

    data = []
    for article in items:
        cover = None
        if article.cover_media_id:
            mr = await db.execute(select(Media).where(Media.id == article.cover_media_id))
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

        cat_resp = None
        if article.category_id:
            cr = await db.execute(select(Category).where(Category.id == article.category_id))
            c = cr.scalar_one_or_none()
            if c:
                cat_resp = CategoryResponse(id=c.id, name=c.name, slug=c.slug, description=c.description, sort_order=c.sort_order, created_at=c.created_at)

        data.append(ArticleListResponse(
            id=article.id,
            title=article.title,
            slug=article.slug,
            summary=article.summary,
            cover=cover,
            category=cat_resp,
            view_count=article.view_count,
            is_top=article.is_top,
            published_at=article.published_at,
            created_at=article.created_at,
        ))

    return ResponseModel(data=PaginatedResponse(
        items=data, total=total, page=page, page_size=page_size
    ))


@router.get("/articles/{slug}", response_model=ResponseModel[ArticleResponse])
async def get_article_detail(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.slug == slug, Article.status == "published"))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    # 增加浏览量
    article.view_count += 1
    await db.commit()

    cover = None
    if article.cover_media_id:
        mr = await db.execute(select(Media).where(Media.id == article.cover_media_id))
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

    cat_resp = None
    if article.category_id:
        cr = await db.execute(select(Category).where(Category.id == article.category_id))
        c = cr.scalar_one_or_none()
        if c:
            cat_resp = CategoryResponse(id=c.id, name=c.name, slug=c.slug, description=c.description, sort_order=c.sort_order, created_at=c.created_at)

    return ResponseModel(data=ArticleResponse(
        id=article.id,
        title=article.title,
        slug=article.slug,
        summary=article.summary,
        content=article.content,
        html_content=article.html_content,
        cover=cover,
        category=cat_resp,
        author_id=article.author_id,
        status=article.status,
        view_count=article.view_count,
        is_top=article.is_top,
        meta_keywords=article.meta_keywords,
        meta_description=article.meta_description,
        published_at=article.published_at,
        created_at=article.created_at,
        updated_at=article.updated_at,
    ))


@router.post("/articles", response_model=ResponseModel[ArticleResponse])
async def create_article(
    data: ArticleCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    article = Article(**data.model_dump())
    db.add(article)
    await db.commit()
    await db.refresh(article)
    return ResponseModel(data=ArticleResponse.model_validate(article))


@router.put("/articles/{article_id}", response_model=ResponseModel[ArticleResponse])
async def update_article(
    article_id: int,
    data: ArticleUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(article, key, value)

    await db.commit()
    await db.refresh(article)
    return ResponseModel(data=ArticleResponse.model_validate(article))


@router.delete("/articles/{article_id}")
async def delete_article(
    article_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Article).where(Article.id == article_id))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found")

    await db.delete(article)
    await db.commit()
    return ResponseModel(message="Deleted successfully")


@router.get("/categories", response_model=ResponseModel[list[CategoryResponse]])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).order_by(asc(Category.sort_order)))
    items = result.scalars().all()
    return ResponseModel(data=[CategoryResponse.model_validate(item) for item in items])


@router.post("/categories", response_model=ResponseModel[CategoryResponse])
async def create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    cat = Category(**data.model_dump())
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return ResponseModel(data=CategoryResponse.model_validate(cat))


@router.put("/categories/{cat_id}", response_model=ResponseModel[CategoryResponse])
async def update_category(
    cat_id: int,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(cat, key, value)

    await db.commit()
    await db.refresh(cat)
    return ResponseModel(data=CategoryResponse.model_validate(cat))


@router.delete("/categories/{cat_id}")
async def delete_category(
    cat_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user)
):
    result = await db.execute(select(Category).where(Category.id == cat_id))
    cat = result.scalar_one_or_none()
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    await db.delete(cat)
    await db.commit()
    return ResponseModel(message="Deleted successfully")
