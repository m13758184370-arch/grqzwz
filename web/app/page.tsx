"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, MessageSquare, Zap, ArrowRight, CheckCircle, Star, Users, Eye, Edit3, Download, Search, ClipboardCheck, Sparkles, CreditCard } from "lucide-react";

const features = [
  {
    icon: Edit3,
    title: "AI 简历生成",
    desc: "输入经历，AI 自动改写为量化成果的专业表达，ATS 关键词匹配，一页 PDF 排版",
  },
  {
    icon: ClipboardCheck,
    title: "面试题库 + 批改",
    desc: "每行业 30 道真题，含行为/专业/公司类型题，在线答题后 AI 逐题批改评分",
  },
  {
    icon: CreditCard,
    title: "按次付费 ¥2 起",
    desc: "不订阅、不自动续费，用一次付一次。支持微信扫码支付",
  },
  {
    icon: Zap,
    title: "30 秒出结果",
    desc: "从填写到生成简历 PDF + 面试题库，全程不超过 30 秒",
  },
];

const pricing = [
  {
    name: "简历生成",
    price: "2",
    desc: "一份行业定制化专业简历",
    cta: "2元生成简历",
    features: ["AI 智能改写每条经历", "ATS 关键词自动注入", "单页 PDF 下载", "覆盖 50+ 行业"],
    icon: FileText,
    color: "blue",
  },
  {
    name: "面试题库",
    price: "3",
    desc: "30道面试题 + AI 批改",
    cta: "3元获取题库",
    features: ["10道行为面试题", "15道专业面试题", "5道公司类型题", "AI 逐题批改反馈"],
    icon: MessageSquare,
    color: "green",
  },
  {
    name: "超值套餐",
    price: "4",
    desc: "简历 + 面试题库 + 批改",
    cta: "4元打包带走",
    features: ["简历生成全部功能", "面试题库全部功能", "简历关联定制题目", "综合能力评估报告"],
    icon: Sparkles,
    color: "purple",
    highlighted: true,
  },
];

const steps = [
  {
    icon: Search,
    title: "1. 选择行业",
    desc: "从 50+ 行业中选择你的目标行业，AI 会根据行业特点定制内容",
  },
  {
    icon: Edit3,
    title: "2. 填写经历",
    desc: "输入教育背景、工作经历、项目经验，越详细效果越好",
  },
  {
    icon: Eye,
    title: "3. 预览效果",
    desc: "AI 自动生成专业简历，量化成果、ATS 友好，不满意可重新生成",
  },
  {
    icon: Download,
    title: "4. 付费下载",
    desc: "预览满意后，¥2 起扫码支付，即可下载 PDF 简历或面试题库",
  },
];

export default function LandingPage() {
  const [showGuide, setShowGuide] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-blue-600">AI简历助手</span>
          <nav className="flex items-center gap-3 sm:gap-6 text-sm text-gray-600">
            <a href="#guide" className="hover:text-gray-900 transition">使用指南</a>
            <a href="#pricing" className="hover:text-gray-900 transition">价格</a>
            <Link href="/resume/create" className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm whitespace-nowrap">
              免费试用
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
              用 AI 生成<span className="text-blue-600">专业简历</span>
              <br />
              和<span className="text-blue-600">面试题库</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-lg mb-8">
              选行业、填信息，AI 为你生成 ATS 友好、量化成果的专业简历和面试题库。
              <strong className="text-gray-700">可免费试用预览</strong>，满意后再付费下载。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <Link
                href="/resume/create"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 text-lg"
              >
                免费试用，生成我的简历 <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#guide" className="inline-flex items-center gap-2 text-gray-600 px-6 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition">
                查看使用指南
              </a>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-6 text-sm text-gray-400">
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 可预览后付费</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> ¥2起</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> 50+行业</span>
            </div>
          </div>

          {/* Right: Resume Preview Panel */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl blur-lg opacity-20" />
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-xs text-gray-400 ml-2">简历预览</span>
                  <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                    <Star className="w-3 h-3 fill-green-500 text-green-500" /> ATS 评分 87
                  </span>
                </div>
                <div className="p-6 space-y-4 text-xs">
                  <div className="text-center border-b border-gray-100 pb-3">
                    <div className="text-base font-bold text-gray-900">张三</div>
                    <div className="text-gray-400 mt-0.5">138-0000-1234 | zhangsan@email.com | 北京 | 6年</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">个人总结</div>
                    <p className="text-gray-600 leading-relaxed">6年产品经验…主导推荐策略优化实现 <span className="bg-yellow-100 text-yellow-800 px-1 rounded">DAU提升35%</span></p>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">工作经历</div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between"><span><strong>字节跳动</strong> | 高级产品经理</span><span className="text-gray-300">2021.08-至今</span></div>
                        <ul className="mt-1 space-y-0.5 text-gray-500 pl-3">
                          <li className="before:content-['-'] before:mr-1">主导抖音电商推荐策略，CTR <span className="bg-yellow-100 text-yellow-800 px-0.5 rounded">提升28%</span></li>
                          <li className="before:content-['-'] before:mr-1">从0到1搭建数据看板，覆盖50+核心指标</li>
                        </ul>
                      </div>
                      <div>
                        <div className="flex justify-between"><span><strong>美团</strong> | 产品经理</span><span className="text-gray-300">2019.03-2021.07</span></div>
                        <ul className="mt-1 space-y-0.5 text-gray-500 pl-3">
                          <li className="before:content-['-'] before:mr-1">外卖商家端改版，月活跃度<span className="bg-yellow-100 text-yellow-800 px-0.5 rounded">提升22%</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1.5">专业技能</div>
                    <div className="flex flex-wrap gap-1 text-gray-500">
                      {["SQL", "Figma", "AB测试", "用户研究", "PRD撰写", "数据分析"].map(s => (
                        <span key={s} className="px-1.5 py-0.5 bg-gray-50 rounded text-[11px]">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Guide */}
      <section id="guide" className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">使用指南</h2>
          <p className="text-center text-gray-500 mb-12">四步搞定你的专业简历和面试准备</p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {steps.map((s) => (
              <div key={s.title} className="p-5 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition text-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ-style details */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <details className="bg-white rounded-xl border border-gray-100 p-5 group">
              <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between">
                怎么试用？需要付费吗？
                <span className="text-gray-300 group-open:hidden">+</span>
                <span className="text-gray-300 hidden group-open:inline">−</span>
              </summary>
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p>✅ <strong>完全免费试用</strong>：选择行业 → 填写信息 → AI 生成简历预览。</p>
                <p>📝 试用中你可以：完整填写表单、查看 AI 生成的简历内容、体验 2 道面试样题。</p>
                <p>💳 满意后付费：简历 ¥2/份、面试题库 ¥3/份、套餐 ¥4（立省 ¥1），微信扫码即付。</p>
              </div>
            </details>
            <details className="bg-white rounded-xl border border-gray-100 p-5 group">
              <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between">
                付费后能得到什么？
                <span className="text-gray-300 group-open:hidden">+</span>
                <span className="text-gray-300 hidden group-open:inline">−</span>
              </summary>
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p>📄 <strong>简历套餐（¥2）</strong>：下载单页 PDF 简历，ATS 评分 80+</p>
                <p>📚 <strong>面试题库（¥3）</strong>：30 道真题 + 答题框架 + AI 批改反馈</p>
                <p>🎁 <strong>超值套餐（¥4）</strong>：上述全部 + 简历关联定制题目 + 综合评估报告</p>
              </div>
            </details>
            <details className="bg-white rounded-xl border border-gray-100 p-5 group">
              <summary className="font-semibold text-sm cursor-pointer list-none flex items-center justify-between">
                支持哪些行业？
                <span className="text-gray-300 group-open:hidden">+</span>
                <span className="text-gray-300 hidden group-open:inline">−</span>
              </summary>
              <div className="mt-3 text-sm text-gray-600 space-y-2">
                <p>目前覆盖 <strong>50+ 行业</strong>，包括：互联网产品/开发/设计/运营、金融银行/证券/保险、教育K12、医疗临床/护理、制造机械、建筑土木、零售电商、媒体广告、法律法务、公务员国考等。</p>
                <p>每个行业都有专属的 AI Prompt 配置，确保生成的简历和面试题高度贴合行业特点。</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">不只是生成，更是全流程面试准备</h2>
          <p className="text-center text-gray-500 mb-12 max-w-lg mx-auto">从简历到面试，一个工具帮你搞定求职全流程</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="p-5 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition">
                <f.icon className="w-7 h-7 text-blue-600 mb-3" />
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">简单透明的定价</h2>
          <p className="text-center text-gray-500 mb-10">按次付费，不订阅，不自动续费。支持微信扫码支付</p>
          <div className="grid sm:grid-cols-3 gap-5">
            {pricing.map((p) => (
              <div
                key={p.name}
                className={`relative p-6 rounded-2xl border-2 ${
                  p.highlighted
                    ? "border-purple-400 shadow-xl shadow-purple-100 bg-white"
                    : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                {p.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-3 py-0.5 rounded-full font-medium">
                    最省钱
                  </span>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    p.color === "blue" ? "bg-blue-100" : p.color === "green" ? "bg-green-100" : "bg-purple-100"
                  }`}>
                    <p.icon className={`w-4 h-4 ${
                      p.color === "blue" ? "text-blue-600" : p.color === "green" ? "text-green-600" : "text-purple-600"
                    }`} />
                  </div>
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">{p.desc}</p>
                <div className="text-4xl font-bold mb-5">
                  ¥{p.price}
                  <span className="text-sm font-normal text-gray-300">/次</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/orders?product=${p.name === "简历生成" ? "resume_generation" : p.name === "面试题库" ? "interview_questions" : "bundle"}`}
                  className={`block text-center py-2.5 rounded-xl font-medium text-sm transition ${
                    p.highlighted
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                      : p.color === "blue"
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>AI简历助手 — 让你的简历脱颖而出</p>
      </footer>
    </div>
  );
}
