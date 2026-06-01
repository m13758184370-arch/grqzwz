"""Seed the industries table with initial data."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))

from sqlalchemy import select
from app.database import async_session, engine, Base
from app.models.industry import Industry
from app.prompts.base import prompt_loader

INDUSTRIES = [
    # 互联网
    {"slug": "internet-pm", "name_zh": "互联网-产品经理", "category": "互联网", "icon": "📱", "sort_order": 1},
    {"slug": "internet-dev", "name_zh": "互联网-软件开发", "category": "互联网", "icon": "💻", "sort_order": 2},
    {"slug": "internet-design", "name_zh": "互联网-UI/UX设计", "category": "互联网", "icon": "🎨", "sort_order": 3},
    {"slug": "internet-ops", "name_zh": "互联网-运营", "category": "互联网", "icon": "📊", "sort_order": 4},
    {"slug": "internet-data", "name_zh": "互联网-数据分析", "category": "互联网", "icon": "📈", "sort_order": 5},
    # 金融
    {"slug": "finance-banking", "name_zh": "金融-银行", "category": "金融", "icon": "🏦", "sort_order": 10},
    {"slug": "finance-securities", "name_zh": "金融-证券/基金", "category": "金融", "icon": "📉", "sort_order": 11},
    {"slug": "finance-insurance", "name_zh": "金融-保险", "category": "金融", "icon": "🛡️", "sort_order": 12},
    # 教育
    {"slug": "education-k12", "name_zh": "教育-K12", "category": "教育", "icon": "📚", "sort_order": 20},
    {"slug": "education-higher", "name_zh": "教育-高等教育", "category": "教育", "icon": "🎓", "sort_order": 21},
    # 医疗
    {"slug": "healthcare-clinical", "name_zh": "医疗-临床医学", "category": "医疗", "icon": "🏥", "sort_order": 30},
    {"slug": "healthcare-nursing", "name_zh": "医疗-护理", "category": "医疗", "icon": "💊", "sort_order": 31},
    # 制造/建筑
    {"slug": "manufacturing-mechanical", "name_zh": "制造-机械工程", "category": "制造", "icon": "⚙️", "sort_order": 40},
    {"slug": "construction-civil", "name_zh": "建筑-土木工程", "category": "建筑", "icon": "🏗️", "sort_order": 50},
    # 零售/电商
    {"slug": "retail-ecommerce", "name_zh": "零售-电商运营", "category": "零售", "icon": "🛒", "sort_order": 60},
    # 媒体/广告
    {"slug": "media-advertising", "name_zh": "媒体-广告/营销", "category": "媒体", "icon": "📢", "sort_order": 70},
    # 法律
    {"slug": "legal-lawyer", "name_zh": "法律-律师/法务", "category": "法律", "icon": "⚖️", "sort_order": 80},
    # 公务员
    {"slug": "government-civil-service", "name_zh": "公务员-国考/省考", "category": "政府", "icon": "🏛️", "sort_order": 90},
]


async def seed():
    async with async_session() as db:
        for ind in INDUSTRIES:
            existing = await db.execute(
                select(Industry).where(Industry.slug == ind["slug"])
            )
            if existing.scalar_one_or_none():
                print(f"  Skipping existing: {ind['slug']}")
                continue

            # Load prompt config from YAML if available for this industry
            prompt_config = {}
            try:
                config = prompt_loader.load_industry_config(ind["slug"])
                prompt_config = {
                    "resume_keywords": config.get("resume", {}).get("keywords", {}),
                    "interview_topics": config.get("interview", {}).get("professional_topics", []),
                }
            except FileNotFoundError:
                pass  # No YAML config yet for this industry

            industry = Industry(
                slug=ind["slug"],
                name_zh=ind["name_zh"],
                category=ind["category"],
                icon=ind["icon"],
                prompt_config=prompt_config,
                sort_order=ind["sort_order"],
            )
            db.add(industry)
            print(f"  Created: {ind['slug']}")

        await db.commit()
        print(f"Seeded {len(INDUSTRIES)} industries.")


if __name__ == "__main__":
    asyncio.run(seed())
