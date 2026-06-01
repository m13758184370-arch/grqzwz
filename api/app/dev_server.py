"""Simplified dev server - no database required, returns mock data."""
import json
import uuid
from datetime import datetime

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

app = FastAPI(title="AI Resume API (Dev)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Industries ────────────────────────────────────────────

INDUSTRIES = [
    {"id": str(uuid.uuid4()), "slug": "internet-pm", "name_zh": "互联网-产品经理", "category": "互联网", "icon": "📱", "sort_order": 1},
    {"id": str(uuid.uuid4()), "slug": "internet-dev", "name_zh": "互联网-软件开发", "category": "互联网", "icon": "💻", "sort_order": 2},
    {"id": str(uuid.uuid4()), "slug": "internet-design", "name_zh": "互联网-UI/UX设计", "category": "互联网", "icon": "🎨", "sort_order": 3},
    {"id": str(uuid.uuid4()), "slug": "internet-ops", "name_zh": "互联网-运营", "category": "互联网", "icon": "📊", "sort_order": 4},
    {"id": str(uuid.uuid4()), "slug": "internet-data", "name_zh": "互联网-数据分析", "category": "互联网", "icon": "📈", "sort_order": 5},
    {"id": str(uuid.uuid4()), "slug": "finance-banking", "name_zh": "金融-银行", "category": "金融", "icon": "🏦", "sort_order": 10},
    {"id": str(uuid.uuid4()), "slug": "finance-securities", "name_zh": "金融-证券/基金", "category": "金融", "icon": "📉", "sort_order": 11},
    {"id": str(uuid.uuid4()), "slug": "education-k12", "name_zh": "教育-K12", "category": "教育", "icon": "📚", "sort_order": 20},
    {"id": str(uuid.uuid4()), "slug": "healthcare-clinical", "name_zh": "医疗-临床医学", "category": "医疗", "icon": "🏥", "sort_order": 30},
    {"id": str(uuid.uuid4()), "slug": "healthcare-nursing", "name_zh": "医疗-护理", "category": "医疗", "icon": "💊", "sort_order": 31},
    {"id": str(uuid.uuid4()), "slug": "manufacturing-mechanical", "name_zh": "制造-机械工程", "category": "制造", "icon": "⚙️", "sort_order": 40},
    {"id": str(uuid.uuid4()), "slug": "retail-ecommerce", "name_zh": "零售-电商运营", "category": "零售", "icon": "🛒", "sort_order": 60},
    {"id": str(uuid.uuid4()), "slug": "media-advertising", "name_zh": "媒体-广告/营销", "category": "媒体", "icon": "📢", "sort_order": 70},
    {"id": str(uuid.uuid4()), "slug": "legal-lawyer", "name_zh": "法律-律师/法务", "category": "法律", "icon": "⚖️", "sort_order": 80},
    {"id": str(uuid.uuid4()), "slug": "government-civil-service", "name_zh": "公务员-国考/省考", "category": "政府", "icon": "🏛️", "sort_order": 90},
]

# ── Mock generated resume data ────────────────────────────

MOCK_RESUME_SECTIONS = {
    "个人信息": {
        "name": "张三",
        "phone": "138-0000-1234",
        "email": "zhangsan@email.com",
        "location": "北京",
        "years_of_exp": "6年"
    },
    "个人总结": "6年产品经理经验，先后在字节跳动和美团负责C端产品，主导过日活千万级产品的0到1搭建。擅长数据驱动增长，主导的推荐策略优化项目实现DAU提升35%、用户留存提升12%。具备从需求挖掘到产品上线的完整闭环能力，熟悉敏捷开发流程。",
    "工作经历": [
        {
            "company": "字节跳动",
            "title": "高级产品经理",
            "duration": "2021.08 - 至今",
            "bullets": [
                "主导抖音电商推荐策略产品，通过AB测试优化推荐算法，CTR提升28%，日均GMV增长1500万",
                "从0到1搭建直播带货数据看板，覆盖50+核心指标，成为运营团队每日决策工具",
                "推动跨部门（算法、运营、设计）协作项目，缩短需求上线周期40%"
            ]
        },
        {
            "company": "美团",
            "title": "产品经理",
            "duration": "2019.03 - 2021.07",
            "bullets": [
                "负责外卖商家端产品，主导商家运营工具改版，商家月活跃度提升22%",
                "基于用户调研优化商家入驻流程，将入驻完成率从62%提升至85%"
            ]
        }
    ],
    "项目经验": [
        {
            "name": "智能推荐策略优化",
            "role": "产品负责人",
            "duration": "2022.03 - 2022.09",
            "bullets": [
                "设计多目标优化推荐模型，平衡点击率、转化率和用户时长三个指标",
                "通过A/B测试验证策略效果，最终实现CTR+28%、人均观看时长+15%",
                "项目获公司年度最佳产品创新奖"
            ]
        }
    ],
    "教育背景": [
        {"school": "北京大学", "degree": "硕士", "major": "计算机科学与技术", "duration": "2016.09 - 2019.07"},
        {"school": "武汉大学", "degree": "学士", "major": "软件工程", "duration": "2012.09 - 2016.07"}
    ],
    "专业技能": ["需求分析", "产品规划", "SQL", "Figma", "AB测试", "用户研究", "PRD撰写", "敏捷开发", "数据分析"],
    "自我评价": "自驱力强，善于在模糊场景下找到破局点。注重团队协作和知识分享，曾在团队内部发起产品方法论分享会。热爱产品设计，相信优秀的产品源于对用户的深刻理解。"
}

MOCK_KEYWORDS = ["需求分析", "产品规划", "数据驱动", "AB测试", "用户增长", "推荐策略", "PRD", "Figma", "SQL", "跨团队协作"]
MOCK_ATS_SCORE = 87

MOCK_INTERVIEW_QUESTIONS = {
    "metadata": {
        "industry": "互联网-产品经理",
        "position_level": "高级",
        "role_type": "C端产品经理",
        "company_type": "大厂",
        "generated_at": datetime.now().isoformat()
    },
    "behavioral": [
        {
            "id": "b1",
            "question": "请做一个简单的自我介绍",
            "category": "自我介绍",
            "difficulty": "中级",
            "what_interviewer_looks_for": "考察候选人的表达逻辑、自我认知、以及过往经历与岗位的匹配度。重点关注最近1-2段工作经历的核心成果",
            "suggested_framework": "STAR法则的变体：现在-过去-未来。先概述当前角色，再回溯关键经历，最后表达求职动机",
            "answer_outline": "1. 当前职位和核心职责（30秒）\n2. 1-2个最具代表性的项目成果（60秒）\n3. 为什么对这个岗位感兴趣（30秒）\n4. 与岗位匹配的核心能力概述（15秒）",
            "common_mistakes": "流水账式罗列经历、时间过长超过2分钟、没有突出核心成果"
        },
        {
            "id": "b2",
            "question": "请描述一次你推动跨部门协作的经历",
            "category": "团队协作",
            "difficulty": "高级",
            "what_interviewer_looks_for": "考察跨部门影响力、冲突处理能力、以及在无权力情况下推动项目的能力",
            "suggested_framework": "STAR法则：情境（为什么需要跨部门协作）、任务（目标和挑战）、行动（如何说服和推动）、结果（项目成果和关系维护）",
            "answer_outline": "1. 项目背景和涉及的部门\n2. 遇到的主要阻力和冲突点\n3. 你采取的沟通策略和推动方法\n4. 最终达成的结果\n5. 事后建立的长效协作机制",
            "common_mistakes": "只讲结果不说过程、把功劳全归于自己、没有提到如何处理分歧"
        },
        {
            "id": "b3",
            "question": "请分享一次你产品决策失败的案例",
            "category": "失败经历",
            "difficulty": "高级",
            "what_interviewer_looks_for": "考察复盘能力、诚实度和成长性思维。面试官想看到你能否客观分析失败原因并从中学习",
            "suggested_framework": "STAR + 反思框架：失败决策 → 当时的判断依据 → 实际结果 → 根因分析 → 后续改进 → 对之后决策的影响",
            "answer_outline": "1. 具体产品和决策内容\n2. 当时为什么做出这个判断\n3. 上线后的实际数据表现\n4. 复盘发现的核心问题\n5. 从这次失败中学到的方法论\n6. 这一经验如何改变了后续的决策方式",
            "common_mistakes": "归因于外部因素（老板/资源/时间）、没有展示具体的学习成果、选择太小的失败显得不够坦诚"
        },
    ],
    "professional": [
        {
            "id": "p1",
            "question": "你如何决定产品需求的优先级？",
            "topic": "需求分析与优先级排序",
            "difficulty": "高级",
            "scenario": "假设你是抖音的产品经理，同时收到来自运营团队、算法团队和用户反馈的三个需求，资源只能支持做一个，你如何决策？",
            "what_interviewer_looks_for": "考察候选人的需求评估框架、数据驱动决策能力、以及ROI思维",
            "suggested_framework": "RICE框架（Reach触达、Impact影响、Confidence信心、Effort成本）或KANO模型",
            "answer_outline": "1. 明确评估维度：用户价值、商业价值、实现成本、战略对齐\n2. 对三个需求进行量化评估\n3. 结合当前产品阶段和OKR做出选择\n4. 说明如何处理被拒绝方的预期\n5. 提出后续跟进方案",
            "common_mistakes": "只凭直觉判断、没有量化的评估标准、忽略了战略方向",
            "related_to_resume": True
        },
        {
            "id": "p2",
            "question": "如何设计一个AB测试来验证推荐策略的效果？",
            "topic": "数据分析与AB实验",
            "difficulty": "高级",
            "scenario": "你负责优化一个内容推荐feed流，假设将推荐算法从A版本升级到B版本，你需要设计一个实验来验证B版本是否更优。",
            "what_interviewer_looks_for": "考察AB测试的完整流程理解：假设设定、样本量计算、指标选择、实验周期、统计显著性判断",
            "suggested_framework": "AB测试5步法：假设 → 设计 → 执行 → 分析 → 决策",
            "answer_outline": "1. 明确核心指标(北极星)和护栏指标\n2. 计算所需样本量和实验周期\n3. 确定分桶策略和灰度方案\n4. 实验期间的监控机制\n5. 统计显著性判断（p值、置信区间）\n6. 实验结果解读和决策建议",
            "common_mistakes": "忽略样本量计算导致实验无效、只看核心指标忽略护栏指标、过早停止实验",
            "related_to_resume": True
        },
    ],
    "company_type": [
        {
            "id": "c1",
            "question": "在大厂做产品经理，你认为跟创业公司最大的区别是什么？",
            "focus": "组织适应能力",
            "what_interviewer_looks_for": "考察候选人是否理解大厂的组织运作方式、是否有正确的工作预期",
            "suggested_framework": "对比分析法：资源 → 决策流程 → 协作模式 → 成长路径",
            "answer_outline": "1. 资源层面：大厂有更成熟的基础设施和数据平台\n2. 决策层面：更需要跨部门共识和向上管理\n3. 协作层面：更强调分工和专业性\n4. 成长层面：深度vs广度的权衡\n5. 结合自身经历说明更适合哪种环境",
            "common_mistakes": "一味贬低创业公司或大厂、没有展示对组织运作的理解"
        },
    ],
    "preparation_tips": "1. 重点准备2-3个核心项目案例，用STAR法则梳理清楚\n2. 提前了解目标公司的核心产品和近期动态\n3. 准备3-5个有深度的问题反问面试官\n4. 练习产品估算题的逻辑框架（如市场规模估算）"
}

# Store generated resumes and interviews in memory
_RESUMES: dict = {}
_INTERVIEWS: dict = {}
_ORDERS: dict = {}
_ENTITLEMENTS: dict[str, list[dict]] = {}  # session_id -> list of entitlements
_USAGE: list[dict] = []  # usage records


def _get_session(request: Request) -> str:
    return request.headers.get("x-session-id", "anonymous")


def _has_entitlement(session_id: str, etype: str) -> bool:
    """Check if user has an active entitlement of the given type with remaining count > 0."""
    entitlements = _ENTITLEMENTS.get(session_id, [])
    for e in entitlements:
        if e["type"] == etype and e["status"] == "ACTIVE" and e["remaining_count"] > 0:
            return True
    return False


def _use_entitlement(session_id: str, etype: str, action: str, resume_id: str = "") -> bool:
    """Consume one use of an entitlement. Returns False if none available."""
    entitlements = _ENTITLEMENTS.get(session_id, [])
    for e in entitlements:
        if e["type"] == etype and e["status"] == "ACTIVE" and e["remaining_count"] > 0:
            e["remaining_count"] -= 1
            if e["remaining_count"] <= 0:
                e["status"] = "USED"
            _USAGE.append({
                "session_id": session_id,
                "entitlement_type": etype,
                "action": action,
                "resume_id": resume_id,
                "created_at": datetime.now().isoformat(),
            })
            return True
    return False


def _grant_entitlements(session_id: str, order_id: str, product_type: str):
    """Grant entitlements based on product type after successful payment."""
    now = datetime.now().isoformat()
    entitlements = _ENTITLEMENTS.get(session_id, [])

    if product_type in ("resume_generation", "bundle"):
        entitlements.append({
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "type": "resume_generate",
            "remaining_count": 1,
            "status": "ACTIVE",
            "created_at": now,
        })
        entitlements.append({
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "type": "resume_download",
            "remaining_count": 1,
            "status": "ACTIVE",
            "created_at": now,
        })

    if product_type in ("interview_questions", "bundle"):
        entitlements.append({
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "type": "interview_full",
            "remaining_count": 1,
            "status": "ACTIVE",
            "created_at": now,
        })
        entitlements.append({
            "id": str(uuid.uuid4()),
            "order_id": order_id,
            "type": "answer_review",
            "remaining_count": 10,
            "status": "ACTIVE",
            "created_at": now,
        })

    _ENTITLEMENTS[session_id] = entitlements


# ── API Routes ────────────────────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok", "mode": "dev"}


@app.get("/api/v1/industries")
async def list_industries(category: str | None = None):
    items = [i for i in INDUSTRIES if not category or i["category"] == category]
    return {"items": items}


@app.get("/api/v1/industries/{slug}")
async def get_industry(slug: str):
    for i in INDUSTRIES:
        if i["slug"] == slug:
            return {**i, "prompt_config": {}}
    return {"error": "not found"}


@app.post("/api/v1/resumes")
async def create_resume(request: Request):
    body = await request.json()
    sid = _get_session(request)
    resume_id = str(uuid.uuid4())
    now = datetime.now().isoformat()
    has_access = _has_entitlement(sid, "resume_generate")

    if has_access:
        _use_entitlement(sid, "resume_generate", "generate_resume", resume_id)

    resume = {
        "id": resume_id,
        "user_id": "dev-user",
        "industry_id": "mock-industry-id",
        "raw_data": body.get("raw_data", {}),
        "generated_sections": {**MOCK_RESUME_SECTIONS, "keywords": MOCK_KEYWORDS, "ats_score_estimate": MOCK_ATS_SCORE},
        "generated_full_text": "Mock resume text",
        "pdf_url": None,
        "status": "completed",
        "position_level": body.get("position_level", "中级"),
        "target_company_type": body.get("target_company_type", ""),
        "tokens_used": 1200,
        "trial": not has_access,
        "created_at": now,
        "updated_at": now,
    }
    _RESUMES[resume_id] = resume
    return resume


@app.get("/api/v1/resumes/{resume_id}")
async def get_resume(resume_id: str):
    if resume_id in _RESUMES:
        return _RESUMES[resume_id]
    return {"error": "not found"}


@app.get("/api/v1/resumes/{resume_id}/status")
async def get_resume_status(resume_id: str):
    return {"status": "completed", "progress": "done"}


@app.get("/api/v1/resumes/{resume_id}/pdf")
async def download_resume_pdf(request: Request, resume_id: str):
    sid = _get_session(request)
    if not _has_entitlement(sid, "resume_download"):
        return Response('{"error":"no_entitlement","message":"请先付费后再下载PDF"}', status_code=402,
                        media_type="application/json")
    _use_entitlement(sid, "resume_download", "download_pdf", resume_id)

    resume = _RESUMES.get(resume_id)
    if not resume:
        return Response("not found", status_code=404)

    sections = resume.get("generated_sections", {})
    info = sections.get("个人信息", {})
    summary = sections.get("个人总结", "")
    work_exps = sections.get("工作经历", [])
    projects = sections.get("项目经验", [])
    education = sections.get("教育背景", [])
    skills = sections.get("专业技能", [])
    self_eval = sections.get("自我评价", "")

    try:
        from fpdf import FPDF

        pdf = FPDF()
        pdf.add_page()
        # Use SimHei for Chinese text support
        # Cross-platform Chinese font detection
        import os as _os
        font_paths = [
            "C:/Windows/Fonts/simhei.ttf",
            "/System/Library/Fonts/PingFang.ttc",
            "/usr/share/fonts/truetype/wqy/wqy-microhei.ttc",
            "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        ]
        font_path = ""
        for fp in font_paths:
            if _os.path.exists(fp):
                font_path = fp
                break
        if not font_path:
            raise Exception("NO_CHINESE_FONT")
        pdf.add_font("SimHei", "", font_path, uni=True)
        pdf.add_font("SimHei", "B", font_path, uni=True)
        pdf.set_auto_page_break(auto=True, margin=15)

        # Header
        pdf.set_font("SimHei", "B", 18)
        name = info.get("name", "")
        pdf.cell(0, 12, name, new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.set_font("SimHei", "", 9)
        contact = f"{info.get('phone','')}  |  {info.get('email','')}  |  {info.get('location','')}  |  {info.get('years_of_exp','')}"
        pdf.cell(0, 7, contact, new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.line(pdf.l_margin, pdf.get_y() + 2, pdf.w - pdf.r_margin, pdf.get_y() + 2)
        pdf.ln(6)

        # Section helper
        def section_title(title: str):
            pdf.set_font("SimHei", "B", 11)
            pdf.set_text_color(37, 99, 235)
            pdf.cell(0, 8, title, new_x="LMARGIN", new_y="NEXT")
            pdf.set_draw_color(200, 200, 200)
            pdf.line(pdf.l_margin, pdf.get_y(), pdf.w - pdf.r_margin, pdf.get_y())
            pdf.ln(4)

        def body_text(text: str, size: int = 10):
            pdf.set_font("SimHei", "", size)
            pdf.set_text_color(50, 50, 50)
            pdf.multi_cell(0, 5.5, text, align="L")
            pdf.ln(2)

        # Summary
        section_title("个人总结")
        body_text(summary)

        # Work Experience
        section_title("工作经历")
        for exp in work_exps:
            pdf.set_font("SimHei", "B", 10)
            pdf.set_text_color(30, 30, 30)
            pdf.cell(0, 6, f"{exp.get('company','')}  |  {exp.get('title','')}  |  {exp.get('duration','')}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("SimHei", "", 9.5)
            pdf.set_text_color(60, 60, 60)
            for bullet in exp.get("bullets", []):
                x0 = pdf.get_x()
                pdf.set_x(x0 + 4)
                pdf.multi_cell(pdf.w - pdf.r_margin - x0 - 4, 5, f"-  {bullet}", align="L")
                pdf.set_x(x0)
            pdf.ln(2)

        # Projects
        if projects:
            section_title("项目经验")
            for proj in projects:
                pdf.set_font("SimHei", "B", 10)
                pdf.set_text_color(30, 30, 30)
                pdf.cell(0, 6, f"{proj.get('name','')}  |  {proj.get('role','')}  |  {proj.get('duration','')}", new_x="LMARGIN", new_y="NEXT")
                pdf.set_font("SimHei", "", 9.5)
                pdf.set_text_color(60, 60, 60)
                for bullet in proj.get("bullets", []):
                    x0 = pdf.get_x()
                    pdf.set_x(x0 + 4)
                    pdf.multi_cell(pdf.w - pdf.r_margin - x0 - 4, 5, f"-  {bullet}", align="L")
                    pdf.set_x(x0)
                pdf.ln(2)

        # Education
        if education:
            section_title("教育背景")
            for edu in education:
                pdf.set_font("SimHei", "", 10)
                pdf.set_text_color(50, 50, 50)
                pdf.cell(0, 6, f"{edu.get('school','')}  |  {edu.get('degree','')} · {edu.get('major','')}  |  {edu.get('duration','')}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)

        # Skills
        section_title("专业技能")
        body_text(" · ".join(skills))

        # Self Evaluation
        if self_eval:
            section_title("自我评价")
            body_text(self_eval)

        pdf_bytes = bytes(pdf.output())
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="resume-{resume_id[:8]}.pdf"'},
        )
    except Exception as e:
        # Fallback: return HTML page that auto-opens print dialog
        html = f"""<!DOCTYPE html><html lang="zh-CN">
<head><meta charset="utf-8"><title>简历</title>
<style>
  body {{ font-family:"PingFang SC","Microsoft YaHei",sans-serif; padding:30px 40px; color:#1a1a1a; }}
  h2 {{ color:#2563eb; border-bottom:1px solid #ccc; padding-bottom:2px; font-size:13pt; margin-top:14pt; }}
  .name {{ font-size:20pt; font-weight:700; text-align:center; }}
  .contact {{ text-align:center; color:#555; font-size:9pt; margin-bottom:12pt; }}
  ul {{ padding-left:16pt; }}
  li {{ font-size:10pt; margin-bottom:2pt; }}
  .exp {{ margin-bottom:8pt; }}
  .exp-title {{ font-weight:700; font-size:10pt; }}
  .exp-meta {{ color:#888; font-size:9pt; }}
</style></head><body>
<div class="name">{info.get('name','')}</div>
<div class="contact">{info.get('phone','')} | {info.get('email','')} | {info.get('location','')} | {info.get('years_of_exp','')}</div>
<h2>个人总结</h2><p style="font-size:10pt;">{summary}</p>
<h2>工作经历</h2>
{''.join(f'<div class="exp"><div class="exp-title">{e.get("company","")} | {e.get("title","")} <span class="exp-meta">{e.get("duration","")}</span></div><ul>{"".join(f"<li>{b}</li>" for b in e.get("bullets",[]))}</ul></div>' for e in work_exps)}
<h2>教育背景</h2>{''.join(f'<div style="font-size:10pt;">{e.get("school","")} | {e.get("degree","")} · {e.get("major","")} <span style="color:#888;font-size:9pt;">{e.get("duration","")}</span></div>' for e in education)}
<h2>专业技能</h2><p style="font-size:10pt;">{' · '.join(skills)}</p>
{'<h2>自我评价</h2><p style="font-size:10pt;">' + self_eval + '</p>' if self_eval else ''}
<script>window.onload=function(){{window.print()}}</script>
</body></html>"""
        return Response(content=html, media_type="text/html; charset=utf-8")


@app.get("/api/v1/resumes")
async def list_resumes(page: int = 1, page_size: int = 10):
    items = list(_RESUMES.values())
    return {"items": items, "total": len(items), "page": page, "page_size": page_size}


@app.post("/api/v1/interviews")
async def create_interview(request: Request):
    body = await request.json()
    sid = _get_session(request)
    qid = str(uuid.uuid4())
    now = datetime.now().isoformat()
    has_access = _has_entitlement(sid, "interview_full")

    if has_access:
        _use_entitlement(sid, "interview_full", "view_full_interview")
        questions = MOCK_INTERVIEW_QUESTIONS
    else:
        # Trial mode: 3 free questions
        questions = {
            "metadata": MOCK_INTERVIEW_QUESTIONS["metadata"],
            "behavioral": MOCK_INTERVIEW_QUESTIONS["behavioral"][:1],
            "professional": MOCK_INTERVIEW_QUESTIONS["professional"][:1],
            "company_type": MOCK_INTERVIEW_QUESTIONS["company_type"][:1],
            "preparation_tips": "这是试用版，可体验3道样题。付费 ¥3 解锁全部30道题目及AI批改功能。",
            "trial": True,
        }

    qs = {
        "id": qid,
        "user_id": "dev-user",
        "resume_id": body.get("resume_id"),
        "industry_id": "mock-industry-id",
        "position_level": body.get("position_level", "中级"),
        "role_type": body.get("role_type", ""),
        "company_type": body.get("company_type", ""),
        "questions": questions,
        "tokens_used": 3500 if has_credits else 500,
        "status": "completed",
        "trial": not has_access,
        "created_at": now,
    }
    _INTERVIEWS[qid] = qs
    return qs


@app.get("/api/v1/interviews/{qid}")
async def get_interview(qid: str):
    if qid in _INTERVIEWS:
        return _INTERVIEWS[qid]
    return {"error": "not found"}


@app.get("/api/v1/interviews")
async def list_interviews(page: int = 1, page_size: int = 10):
    items = list(_INTERVIEWS.values())
    return {"items": items, "total": len(items), "page": page, "page_size": page_size}


@app.post("/api/v1/orders")
async def create_order(request: Request):
    body = await request.json()
    sid = _get_session(request)
    oid = str(uuid.uuid4())
    now = datetime.now().isoformat()
    order_no = f"RV{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:6].upper()}"

    prices = {"resume_generation": 200, "interview_questions": 300, "bundle": 400}
    amount = prices.get(body.get("product_type", "resume_generation"), 200)

    order = {
        "id": oid,
        "user_id": "dev-user",
        "order_no": order_no,
        "product_type": body.get("product_type", "resume_generation"),
        "amount_cents": amount,
        "amount_display": f"{amount/100:.2f}",
        "payment_status": "PENDING",
        "paid_at": None,
        "session_id": sid,
        "created_at": now,
    }
    _ORDERS[oid] = order
    return order


@app.get("/api/v1/orders/{oid}")
async def get_order(oid: str):
    if oid in _ORDERS:
        return _ORDERS[oid]
    return {"error": "not found"}


# Add status polling endpoint keyed by order_no (for frontend polling)
@app.get("/api/v1/orders/status/{order_no}")
async def get_order_status(order_no: str):
    for o in _ORDERS.values():
        if o["order_no"] == order_no:
            return {
                "status": o["payment_status"],
                "next": "/resume/create" if o["payment_status"] == "PAID" else None,
            }
    return {"status": "NOT_FOUND"}


@app.get("/api/v1/admin/orders")
async def admin_list_orders():
    pending = [o for o in _ORDERS.values() if o.get("payment_status") == "PENDING"]
    return {"orders": pending}


@app.post("/api/v1/admin/approve")
async def admin_approve(request: Request):
    """Admin approves payment -> order becomes PAID -> entitlements granted."""
    body = await request.json()
    order_no = body.get("order_no", "")
    for o in _ORDERS.values():
        if o["order_no"] == order_no:
            o["payment_status"] = "PAID"
            o["paid_at"] = datetime.now().isoformat()
            sid = o.get("session_id", "anonymous")
            _grant_entitlements(sid, o["id"], o["product_type"])
            return {"code": "SUCCESS", "message": "OK"}
    return {"code": "FAIL", "message": "Order not found"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
