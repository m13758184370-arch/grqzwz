"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Download, Loader2, RefreshCw, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { Resume } from "@/lib/types";

export default function ResumeViewPage() {
  const params = useParams();
  const router = useRouter();
  const resumeId = params.id as string;
  const [resume, setResume] = useState<Resume | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const poll = async () => {
      try {
        const r = await api.getResume(resumeId);
        setResume(r);
        if (r.status === "completed" || r.status === "failed") {
          setPolling(false);
        }
      } catch {
        setPolling(false);
      }
    };

    poll();
    interval = setInterval(poll, 2000);

    return () => clearInterval(interval);
  }, [resumeId]);

  const handleDownloadPdf = () => {
    const trial = (resume as unknown as Record<string, unknown>)?.trial;
    if (trial) {
      router.push("/orders?product=resume_generation");
      return;
    }
    window.open(`/api/v1/resumes/${resumeId}/pdf`, "_blank");
  };

  const handleGoToInterview = () => {
    if (resume) {
      router.push(`/interview/create?resume_id=${resume.id}&industry=${resume.industry_id}`);
    }
  };

  if (polling && !resume) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-500">正在加载简历...</p>
      </div>
    );
  }

  if (resume?.status === "generating") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-semibold mb-2">AI 正在生成你的简历</h2>
        <p className="text-gray-500">正在分析你的经历，生成专业简历内容...</p>
        <div className="mt-8 space-y-3">
          {["分析用户信息...", "生成简历各模块...", "优化关键词和表达..."].map((step, i) => (
            <div key={i} className="flex items-center gap-3 justify-center text-sm text-gray-500">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
              </div>
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (resume?.status === "failed") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-400" />
        <h2 className="text-lg font-semibold mb-2">生成失败</h2>
        <p className="text-gray-500 mb-4">请检查信息是否完整，然后重试</p>
        <button onClick={() => router.back()} className="text-blue-600 hover:underline">
          返回修改
        </button>
      </div>
    );
  }

  if (!resume?.generated_sections) return null;

  const sections = resume.generated_sections as Record<string, unknown>;
  const info = sections["个人信息"] as Record<string, string> | undefined;
  const summary = sections["个人总结"] as string | undefined;
  const workExps = (sections["工作经历"] as Array<Record<string, unknown>>) || [];
  const projects = (sections["项目经验"] as Array<Record<string, unknown>>) || [];
  const education = (sections["教育背景"] as Array<Record<string, string>>) || [];
  const skills = (sections["专业技能"] as string[]) || [];
  const selfEval = sections["自我评价"] as string | undefined;
  const keywords = (resume.generated_sections as Record<string, unknown>)["keywords"] as string[] | undefined;
  const atsScore = (resume.generated_sections as Record<string, unknown>)["ats_score_estimate"] as number | undefined;
  const isTrial = (resume as unknown as Record<string, unknown>)?.trial as boolean;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Trial banner */}
      {isTrial && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">试用模式 — 可预览简历，不可下载 PDF</p>
            <p className="text-xs text-amber-600 mt-0.5">付费 ¥2 即可下载 PDF 简历，或 ¥4 获取简历+面试题库套餐</p>
          </div>
          <button onClick={() => router.push("/orders")} className="shrink-0 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition">立即付费</button>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between mb-8 bg-white rounded-xl border border-gray-100 p-3">
        <div className="flex items-center gap-3">
          {atsScore && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              atsScore >= 80 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              ATS 评分: {atsScore}
            </span>
          )}
          {keywords && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
              {keywords.slice(0, 6).map((k) => (
                <span key={k} className="px-2 py-0.5 bg-gray-100 rounded-full">{k}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToInterview}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
          >
            <MessageSquare className="w-4 h-4" /> 生成面试题
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" /> 下载PDF
          </button>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-blue-500">
          <h1 className="text-2xl font-bold mb-1">{info?.name || ""}</h1>
          <div className="text-sm text-gray-500 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {info?.phone && <span>{info.phone}</span>}
            {info?.email && <span>{info.email}</span>}
            {info?.location && <span>{info.location}</span>}
            {info?.years_of_exp && <span>{info.years_of_exp}</span>}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <>
            <h3 className="text-sm font-bold text-blue-600 mb-2">个人总结</h3>
            <p className="text-sm text-gray-700 mb-5">{summary}</p>
          </>
        )}

        {/* Work Experience */}
        {workExps.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-blue-600 mt-5 mb-3 border-b border-gray-100 pb-1">工作经历</h3>
            {workExps.map((exp, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline text-sm">
                  <span>
                    <strong>{exp.company as string}</strong>
                    <span className="text-gray-500 mx-1">|</span>
                    <span className="text-gray-600">{exp.title as string}</span>
                  </span>
                  <span className="text-xs text-gray-400">{exp.duration as string}</span>
                </div>
                <ul className="mt-1.5 pl-4 space-y-0.5">
                  {(exp.bullets as string[])?.map((b, bi) => (
                    <li key={bi} className="text-sm text-gray-700 list-disc">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-blue-600 mt-5 mb-3 border-b border-gray-100 pb-1">项目经验</h3>
            {projects.map((proj, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between items-baseline text-sm">
                  <span>
                    <strong>{proj.name as string}</strong>
                    <span className="text-gray-500 mx-1">|</span>
                    <span className="text-gray-600">{proj.role as string}</span>
                  </span>
                  <span className="text-xs text-gray-400">{proj.duration as string}</span>
                </div>
                <ul className="mt-1.5 pl-4 space-y-0.5">
                  {(proj.bullets as string[])?.map((b, bi) => (
                    <li key={bi} className="text-sm text-gray-700 list-disc">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {/* Education */}
        {education.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-blue-600 mt-5 mb-3 border-b border-gray-100 pb-1">教育背景</h3>
            {education.map((edu, i) => (
              <div key={i} className="flex justify-between text-sm mb-1">
                <span>
                  {edu.school} | {edu.degree} · {edu.major}
                </span>
                <span className="text-xs text-gray-400">{edu.duration}</span>
              </div>
            ))}
          </>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <>
            <h3 className="text-sm font-bold text-blue-600 mt-5 mb-3 border-b border-gray-100 pb-1">专业技能</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-gray-700">
              {skills.map((s, i) => (
                <span key={i}>
                  {s}{i < skills.length - 1 && <span className="text-gray-300"> · </span>}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Self Evaluation */}
        {selfEval && (
          <>
            <h3 className="text-sm font-bold text-blue-600 mt-5 mb-3 border-b border-gray-100 pb-1">自我评价</h3>
            <p className="text-sm text-gray-600">{selfEval}</p>
          </>
        )}
      </div>

      {/* Bottom actions */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={() => router.push("/resume/create")}
          className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
        >
          <RefreshCw className="w-4 h-4" /> 重新生成
        </button>
        <button
          onClick={handleGoToInterview}
          className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <MessageSquare className="w-4 h-4" /> 生成面试题库
        </button>
      </div>
    </div>
  );
}
