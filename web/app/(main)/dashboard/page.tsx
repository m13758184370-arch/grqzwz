"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, MessageSquare, Plus } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import type { Resume, InterviewQuestionSet } from "@/lib/types";

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<InterviewQuestionSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.listResumes(1, 5),
      api.listInterviews(1, 5),
    ]).then(([r, i]) => {
      setResumes(r.items);
      setInterviews(i.items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-32" />
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">工作台</h1>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <Link
          href="/resume/create"
          className="flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold">创建简历</p>
            <p className="text-sm text-gray-500">AI生成行业定制化专业简历</p>
          </div>
          <Plus className="w-5 h-5 text-gray-300 ml-auto group-hover:text-blue-500" />
        </Link>

        <Link
          href="/interview/create"
          className="flex items-center gap-4 p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition group"
        >
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition">
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold">生成面试题库</p>
            <p className="text-sm text-gray-500">30道面试题+答题框架</p>
          </div>
          <Plus className="w-5 h-5 text-gray-300 ml-auto group-hover:text-green-500" />
        </Link>
      </div>

      {/* Recent Resumes */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">最近简历</h2>
          {resumes.length > 0 && (
            <Link href="/resume/create" className="text-sm text-blue-600 hover:underline">
              创建新简历
            </Link>
          )}
        </div>
        {resumes.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">还没有简历</p>
            <Link href="/resume/create" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
              创建第一份简历
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {resumes.map((r) => (
              <Link
                key={r.id}
                href={`/resume/${r.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 transition"
              >
                <div>
                  <p className="font-medium text-sm">
                    {(r.raw_data as Record<string, string>)?.name || "未命名简历"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {r.position_level || ""} · {formatDate(r.created_at)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  r.status === "completed" ? "bg-green-100 text-green-700" :
                  r.status === "generating" ? "bg-blue-100 text-blue-700" :
                  r.status === "failed" ? "bg-red-100 text-red-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {r.status === "completed" ? "已完成" :
                   r.status === "generating" ? "生成中" :
                   r.status === "failed" ? "失败" : "草稿"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Interviews */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">最近面试题库</h2>
          {interviews.length > 0 && (
            <Link href="/interview/create" className="text-sm text-blue-600 hover:underline">
              生成新题库
            </Link>
          )}
        </div>
        {interviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-100">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">还没有面试题库</p>
            <Link href="/interview/create" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
              生成第一份题库
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((iv) => (
              <Link
                key={iv.id}
                href={`/interview/${iv.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-green-200 transition"
              >
                <div>
                  <p className="font-medium text-sm">
                    {iv.position_level || ""} · {iv.role_type || "通用"} · {iv.company_type || "不限"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(iv.created_at)}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {(iv.questions as Record<string, unknown>)?.behavioral ? "30题" : "生成中"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
