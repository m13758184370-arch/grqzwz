from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.industry import Industry

router = APIRouter(prefix="/api/v1/industries", tags=["industries"])


@router.get("")
async def list_industries(
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Industry).where(Industry.is_active == True)
    if category:
        query = query.where(Industry.category == category)
    query = query.order_by(Industry.sort_order, Industry.name_zh)

    result = await db.execute(query)
    industries = result.scalars().all()

    return {
        "items": [
            {
                "id": str(i.id),
                "slug": i.slug,
                "name_zh": i.name_zh,
                "category": i.category,
                "icon": i.icon,
                "sort_order": i.sort_order,
            }
            for i in industries
        ]
    }


@router.get("/{slug}")
async def get_industry(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Industry).where(Industry.slug == slug))
    industry = result.scalar_one_or_none()
    if not industry:
        return {"error": "Industry not found"}, 404

    return {
        "id": str(industry.id),
        "slug": industry.slug,
        "name_zh": industry.name_zh,
        "category": industry.category,
        "icon": industry.icon,
        "prompt_config": industry.prompt_config,
    }
