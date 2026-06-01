"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { POSITION_LEVELS, COMPANY_TYPES } from "@/lib/types";
import type { Industry } from "@/lib/types";

export default function CreateInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industrySlug, setIndustrySlug] = useState(searchParams.get("industry") || "");
  const [positionLevel, setPositionLevel] = useState("中级");
  const [roleType, setRoleType] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [resumeId, setResumeId] = useState(searchParams.get("resume_id") || "");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.getIndustries().then((res) => {
      setIndustries(res.items);
      // Set first industry as default if none selected
      if (!industrySlug && res.items.length > 0) {
        setIndustrySlug(res.items[0].slug);
      }
    }).catch(() => {});
  }, []);

  const selectedIndustry = industries.find((i) => i.slug === industrySlug);
  const roleTypes = selectedIndustry
    ? ((selectedIndustry as unknown as { prompt_config?: { interview_role_types?: Array<{ slug: string; name_zh: string }> } })?.prompt_config
        ?.interview_role_types || [])
    : [];

  const handleSubmit = async () => {
    if (!industrySlug) {
      toast.error("请选择行业");
      return;
    }
    setGenerating(true);
    try {
      const result = await api.createInterview({
        industry_slug: industrySlug,
        position_level: positionLevel,
        role_type: roleType,
        company_type: companyType,
        resume_id: resumeId || undefined,
      });
      router.push(`/interview/${result.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "生成失败";
      if (msg === "INSUFFICIENT_CREDITS") {
        toast.error("余额不足，请先购买次数");
        router.push("/orders");
      } else {
        toast.error(msg);
      }
      setGenerating(false);
    }
  };

  const selectClass =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm bg-white";

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">生成面试题库</h1>
      <p className="text-gray-500 mb-8">选择行业和职位信息，AI生成30道面试题+答题框架</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">行业 *</label>
          <select className={selectClass} value={industrySlug} onChange={(e) => setIndustrySlug(e.target.value)}>
            {industries.map((ind) => (
              <option key={ind.id} value={ind.slug}>{ind.icon} {ind.name_zh}</option>
            ))}
          </select>
        </div>

        {roleTypes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">职位类型</label>
            <select className={selectClass} value={roleType} onChange={(e) => setRoleType(e.target.value)}>
              <option value="">不限</option>
              {roleTypes.map((rt: { slug: string; name_zh: string }) => (
                <option key={rt.slug} value={rt.slug}>{rt.name_zh}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">目标职级</label>
          <select className={selectClass} value={positionLevel} onChange={(e) => setPositionLevel(e.target.value)}>
            {POSITION_LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">目标公司类型</label>
          <select className={selectClass} value={companyType} onChange={(e) => setCompanyType(e.target.value)}>
            <option value="">不限</option>
            {COMPANY_TYPES.map((ct) => (
              <option key={ct.slug} value={ct.slug}>{ct.name}</option>
            ))}
          </select>
        </div>

        {resumeId && (
          <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700">
            已关联你的简历，AI会基于你的实际项目经验定制题目
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={generating}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> AI正在生成面试题库...
            </>
          ) : (
            <>
              生成面试题库 <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
