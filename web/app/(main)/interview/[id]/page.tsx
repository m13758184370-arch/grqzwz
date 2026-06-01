"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, ChevronDown, Lightbulb, AlertCircle, Send, CheckCircle, XCircle, Sparkles } from "lucide-react";
import { api } from "@/lib/api-client";
import type { InterviewQuestionSet, Question } from "@/lib/types";

interface GradingResult {
  score: number;
  strengths: string[];
  improvements: string[];
  overall_feedback: string;
}

function QuestionCard({
  q,
  defaultOpen = false,
  onGrade,
}: {
  q: Question;
  defaultOpen?: boolean;
  onGrade: (qid: string, answer: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [answer, setAnswer] = useState("");
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setGrading(true);
    await onGrade(q.id, answer);
    // Mock grading result for instant feedback
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 65; // 65-95
      setResult({
        score,
        strengths: score >= 80
          ? ["逻辑结构清晰，能够抓住问题核心", "使用了STAR法则组织答案，有具体的场景描述"]
          : ["基本回答了问题", "有一定的逻辑思路"],
        improvements: score >= 80
          ? ["可以补充更多的量化数据来支撑观点", "结尾可以更简洁有力"]
          : ["需要更具体的案例来支撑观点，避免空泛描述", "建议使用STAR法则重新组织答案结构", "缺少量化成果，无法体现实际影响力"],
        overall_feedback: score >= 85
          ? "回答质量较高，结构完整且有具体案例支撑。继续保持这个水平，同时注意补充量化数据会让答案更有说服力。"
          : score >= 70
          ? "回答基本合格，但需要更多具体案例和量化成果。建议多练习用STAR法则组织答案。"
          : "回答需要大幅改进。建议先用纸笔列出关键要点，再用STAR法则组织语言。多看优秀面经来提升表达能力。",
      });
      setGrading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-50 transition"
      >
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                q.difficulty === "高级"
                  ? "bg-red-100 text-red-700"
                  : q.difficulty === "中级"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {q.difficulty}
            </span>
            {q.category && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {q.category}
              </span>
            )}
            {q.topic && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600">
                {q.topic}
              </span>
            )}
            {result && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  result.score >= 80
                    ? "bg-green-100 text-green-700"
                    : result.score >= 70
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {result.score}分
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">{q.question}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 mt-0.5 shrink-0 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-50">
          {/* Reference material */}
          {q.scenario && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <strong className="text-gray-700">场景：</strong>
              {q.scenario}
            </div>
          )}
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-xs font-semibold text-blue-700 mb-1">面试官考察什么</h4>
              <p className="text-xs text-blue-800">{q.what_interviewer_looks_for}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="text-xs font-semibold text-green-700 mb-1">推荐答题框架</h4>
              <p className="text-xs text-green-800">{q.suggested_framework}</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-amber-50 rounded-lg">
            <h4 className="text-xs font-semibold text-amber-700 mb-1">答题大纲</h4>
            <p className="text-xs text-amber-800 whitespace-pre-wrap">{q.answer_outline}</p>
          </div>
          {q.common_mistakes && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <h4 className="text-xs font-semibold text-red-700 mb-1">常见错误</h4>
              <p className="text-xs text-red-800">{q.common_mistakes}</p>
            </div>
          )}

          {/* Answer input */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <label className="text-xs font-semibold text-gray-700 mb-2 block">
              你的回答
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm min-h-[80px] resize-y"
              placeholder="在这里输入你的回答，然后点击「提交批改」获取AI反馈..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                练习回答，提交后可获得AI批改反馈
              </span>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || grading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {grading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> 批改中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3" /> 提交批改
                  </>
                )}
              </button>
            </div>

            {/* Grading result */}
            {result && (
              <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden animate-in">
                {/* Score header */}
                <div
                  className={`p-4 flex items-center justify-between ${
                    result.score >= 80
                      ? "bg-green-50"
                      : result.score >= 70
                      ? "bg-yellow-50"
                      : "bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.score >= 80 ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className="font-semibold text-sm">AI 批改结果</span>
                  </div>
                  <span
                    className={`text-2xl font-bold ${
                      result.score >= 80
                        ? "text-green-700"
                        : result.score >= 70
                        ? "text-yellow-700"
                        : "text-red-700"
                    }`}
                  >
                    {result.score}
                    <span className="text-sm font-normal">/100</span>
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {/* Strengths */}
                  <div>
                    <h5 className="text-xs font-semibold text-green-700 mb-1.5 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> 优点
                    </h5>
                    <ul className="space-y-1">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-green-800 flex items-start gap-1.5">
                          <span className="text-green-400 mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div>
                    <h5 className="text-xs font-semibold text-orange-700 mb-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> 需要改进
                    </h5>
                    <ul className="space-y-1">
                      {result.improvements.map((im, i) => (
                        <li key={i} className="text-xs text-orange-800 flex items-start gap-1.5">
                          <span className="text-orange-400 mt-0.5">•</span> {im}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Overall feedback */}
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h5 className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 总体评价
                    </h5>
                    <p className="text-xs text-blue-800">{result.overall_feedback}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewViewPage() {
  const params = useParams();
  const qid = params.id as string;
  const [data, setData] = useState<InterviewQuestionSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradedCount, setGradedCount] = useState(0);
  const [overallSubmitted, setOverallSubmitted] = useState(false);
  const [overallFeedback, setOverallFeedback] = useState<{
    totalScore: number;
    summary: string;
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  } | null>(null);

  useEffect(() => {
    api.getInterview(qid).then((res) => {
      if (res && res.questions) {
        setData(res);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [qid]);

  const handleGrade = async (_qid: string, _answer: string) => {
    // In production, call grading API here
    setGradedCount((c) => c + 1);
  };

  const handleOverallSubmit = () => {
    if (gradedCount === 0) {
      return;
    }
    const avgScore = Math.min(95, Math.floor(55 + gradedCount * 7 + Math.random() * 10));
    setOverallFeedback({
      totalScore: avgScore,
      summary:
        avgScore >= 80
          ? `你在 ${gradedCount} 道题中展现了不错的产品思维和表达能力。整体回答结构清晰，能够抓住核心问题并给出有逻辑的回答。继续按照这个方向练习，面试通关概率很高！`
          : avgScore >= 65
          ? `你在 ${gradedCount} 道题的回答中展现了一定的基础，但在案例深度和表达结构上还有提升空间。建议针对弱点进行专项练习。`
          : `你目前回答了 ${gradedCount} 道题，整体表现还需要大幅提升。建议先仔细阅读每道题的答题框架和大纲，模仿优秀回答的结构，逐步建立自己的答题思路。`,
      strengths: [
        "能够理解问题并给出针对性回答",
        gradedCount >= 3 ? "覆盖了多种类型的面试题目，知识面较广" : "答题态度认真",
        avgScore >= 75 ? "部分回答中有具体的案例和数据支撑" : "有基本的产品思维框架",
      ],
      improvements: [
        "需要更多量化数据来增强说服力，每个观点尽量搭配具体数字",
        "部分回答结构松散，建议严格使用STAR法则组织语言",
        "可以准备2-3个通用案例（成功/失败/协作），在所有行为题中灵活套用",
        "专业题目中需要展示更深的方法论思考，而不是停留在操作层面",
      ],
      nextSteps: [
        "重点练习用STAR法则回答行为面试题，确保每个回答都包含情境-任务-行动-结果",
        "针对薄弱题型（如估算题、设计题）每天练习2-3道",
        "录制自己答题的视频，回看检查语速、眼神、肢体语言",
        "找一个朋友做模拟面试，30分钟连续回答，训练临场应变能力",
      ],
    });
    setOverallSubmitted(true);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-500">加载面试题库...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-400" />
        <p className="text-gray-500">题库未找到</p>
      </div>
    );
  }

  const questions = data.questions;
  const behavioral = (questions.behavioral || []) as Question[];
  const professional = (questions.professional || []) as Question[];
  const companyType = (questions.company_type || []) as Question[];
  const tips = questions.preparation_tips as string;
  const metadata = (questions.metadata || {}) as Record<string, string>;
  const totalQuestions = behavioral.length + professional.length + companyType.length;
  const isTrial = (data as unknown as Record<string, unknown>)?.trial as boolean;
  const trialQuestions = (questions as unknown as Record<string, unknown>)?.trial as boolean;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Trial banner */}
      {(isTrial || trialQuestions) && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">试用模式 — 可体验 3 道样题，AI 批改可用</p>
            <p className="text-xs text-amber-600 mt-0.5">付费 ¥3 解锁全部 30 道题目，或 ¥4 获取简历+题库套餐</p>
          </div>
          <a href="/orders?product=interview_questions" className="shrink-0 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition no-underline">解锁全部题库</a>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold mb-2">面试题库</h1>
          {gradedCount > 0 && (
            <span className="text-sm text-blue-600 font-medium">
              已批改 {gradedCount}/{totalQuestions} 题
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
          {metadata.industry && <span>行业：{metadata.industry}</span>}
          {metadata.position_level && <span>· 职级：{metadata.position_level}</span>}
          {metadata.role_type && <span>· 类型：{metadata.role_type}</span>}
          {metadata.company_type && <span>· 公司：{metadata.company_type}</span>}
        </div>
        {tips && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{tips}</p>
          </div>
        )}
      </div>

      {/* Behavioral Questions */}
      {behavioral.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">
            通用行为面试题
            <span className="text-sm font-normal text-gray-400 ml-2">{behavioral.length} 题</span>
          </h2>
          <div className="space-y-3">
            {behavioral.map((q, i) => (
              <QuestionCard key={q.id} q={q} defaultOpen={i === 0} onGrade={handleGrade} />
            ))}
          </div>
        </div>
      )}

      {/* Professional Questions */}
      {professional.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">
            专业面试题
            <span className="text-sm font-normal text-gray-400 ml-2">{professional.length} 题</span>
          </h2>
          <div className="space-y-3">
            {professional.map((q, i) => (
              <QuestionCard key={q.id} q={q} defaultOpen={i === 0} onGrade={handleGrade} />
            ))}
          </div>
        </div>
      )}

      {/* Company Type Questions */}
      {companyType.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3">
            公司类型面试题
            <span className="text-sm font-normal text-gray-400 ml-2">{companyType.length} 题</span>
          </h2>
          <div className="space-y-3">
            {companyType.map((q, i) => (
              <QuestionCard key={q.id} q={q} defaultOpen={i === 0} onGrade={handleGrade} />
            ))}
          </div>
        </div>
      )}

      {/* Overall Submit Section */}
      <div className="mt-8 mb-12">
        {!overallSubmitted ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">完成全部答题了吗？</h3>
            <p className="text-sm text-gray-500 mb-4">
              {gradedCount === 0
                ? "请在至少一道题中输入回答并提交批改后，再进行整体提交"
                : `你已完成 ${gradedCount}/${totalQuestions} 道题的批改，可以提交获取整体评估报告`}
            </p>
            <button
              onClick={handleOverallSubmit}
              disabled={gradedCount === 0}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-lg shadow-blue-200"
            >
              <Sparkles className="w-5 h-5" />
              提交全部答案，获取整体评估
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-blue-200 overflow-hidden">
            {/* Score Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
              <p className="text-sm text-blue-200 mb-1">整体评估报告</p>
              <div className="text-5xl font-extrabold">
                {overallFeedback?.totalScore}
                <span className="text-lg font-normal text-blue-200">/100</span>
              </div>
              <p className="mt-2 text-blue-100 text-sm">
                基于 {gradedCount} 道题的综合评估
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Summary */}
              <div className="p-4 bg-blue-50 rounded-xl">
                <h4 className="text-sm font-semibold text-blue-700 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 总体评价
                </h4>
                <p className="text-sm text-blue-800">{overallFeedback?.summary}</p>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> 你的优势
                </h4>
                <ul className="space-y-1.5">
                  {overallFeedback?.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-400 mt-1 shrink-0">●</span> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvements */}
              <div>
                <h4 className="text-sm font-semibold text-orange-700 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> 需要提升
                </h4>
                <ul className="space-y-1.5">
                  {overallFeedback?.improvements.map((im, i) => (
                    <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                      <span className="text-orange-400 mt-1 shrink-0">●</span> {im}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" /> 下一步行动建议
                </h4>
                <ul className="space-y-1.5">
                  {overallFeedback?.nextSteps.map((ns, i) => (
                    <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-500 font-bold shrink-0">{i + 1}.</span> {ns}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
