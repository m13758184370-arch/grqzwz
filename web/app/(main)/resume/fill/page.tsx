"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Loader2, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useResumeDraftStore } from "@/lib/store";
import { POSITION_LEVELS, COMPANY_TYPES } from "@/lib/types";
import type { Education, WorkExperience, Project } from "@/lib/types";

type Errors = Record<string, string>;

const STEPS = [
  { label: "选择行业", done: true },
  { label: "填写信息", done: false },
  { label: "AI 生成", done: false },
  { label: "下载简历", done: false },
];

function validate(rawData: typeof useResumeDraftStore.getState extends () => infer S ? never : never, email: string): Errors {
  const errs: Errors = {};
  // Type gymnastics aside — validate the form data directly
  return errs;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3 shrink-0" /> {msg}
    </p>
  );
}

export default function FillResumePage() {
  const router = useRouter();
  const { industrySlug, rawData, updateField } = useResumeDraftStore();
  const [generating, setGenerating] = useState(false);
  const [positionLevel, setPositionLevel] = useState("中级");
  const [companyType, setCompanyType] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!industrySlug) {
      router.replace("/resume/create");
    }
  }, [industrySlug, router]);

  const markTouched = (field: string) => {
    setTouched((prev) => new Set(prev).add(field));
  };

  const validateForm = useCallback((): Errors => {
    const errs: Errors = {};
    if (!rawData.name?.trim()) errs.name = "请输入姓名";
    if (!rawData.phone?.trim()) {
      errs.phone = "请输入手机号";
    } else if (!/^1[3-9]\d{9}$/.test(rawData.phone.trim())) {
      errs.phone = "请输入正确的手机号格式";
    }
    if (rawData.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawData.email.trim())) {
      errs.email = "请输入正确的邮箱格式";
    }
    return errs;
  }, [rawData]);

  useEffect(() => {
    if (touched.size > 0) {
      setErrors(validateForm());
    }
  }, [rawData, touched, validateForm]);

  const handleBlur = (field: string) => markTouched(field);

  // --- Education ---
  const addEducation = () => {
    updateField("education", [
      ...rawData.education,
      { school: "", degree: "", major: "", duration: "" },
    ]);
  };
  const updateEducation = (idx: number, field: keyof Education, value: string) => {
    const updated = [...rawData.education];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField("education", updated);
  };
  const removeEducation = (idx: number) => {
    updateField("education", rawData.education.filter((_, i) => i !== idx));
  };

  // --- Work Experience ---
  const addWork = () => {
    updateField("work_experience", [
      ...rawData.work_experience,
      { company: "", title: "", duration: "", responsibilities: [""] },
    ]);
  };
  const updateWork = (idx: number, field: keyof WorkExperience, value: string) => {
    const updated = [...rawData.work_experience];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField("work_experience", updated);
  };
  const updateResponsibility = (workIdx: number, respIdx: number, value: string) => {
    const updated = [...rawData.work_experience];
    const resp = [...updated[workIdx].responsibilities];
    resp[respIdx] = value;
    updated[workIdx] = { ...updated[workIdx], responsibilities: resp };
    updateField("work_experience", updated);
  };
  const addResponsibility = (workIdx: number) => {
    const updated = [...rawData.work_experience];
    updated[workIdx] = { ...updated[workIdx], responsibilities: [...updated[workIdx].responsibilities, ""] };
    updateField("work_experience", updated);
  };
  const removeWork = (idx: number) => {
    updateField("work_experience", rawData.work_experience.filter((_, i) => i !== idx));
  };

  // --- Projects ---
  const addProject = () => {
    updateField("projects", [
      ...rawData.projects,
      { name: "", role: "", duration: "", description: "", results: "" },
    ]);
  };
  const updateProject = (idx: number, field: keyof Project, value: string) => {
    const updated = [...rawData.projects];
    updated[idx] = { ...updated[idx], [field]: value };
    updateField("projects", updated);
  };
  const removeProject = (idx: number) => {
    updateField("projects", rawData.projects.filter((_, i) => i !== idx));
  };

  // --- Skills ---
  const [skillInput, setSkillInput] = useState("");
  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !rawData.skills.includes(s)) {
      updateField("skills", [...rawData.skills, s]);
    }
    setSkillInput("");
  };
  const removeSkill = (skill: string) => {
    updateField("skills", rawData.skills.filter((s) => s !== skill));
  };

  // --- Submit ---
  const handleSubmit = async () => {
    const errs = validateForm();
    setErrors(errs);
    setTouched(new Set(["name", "phone", "email"]));
    if (Object.keys(errs).length > 0) {
      toast.error("请修正表单中的错误后再提交");
      return;
    }

    setGenerating(true);
    try {
      const resume = await api.createResume({
        industry_slug: industrySlug,
        raw_data: rawData,
        position_level: positionLevel,
        target_company_type: companyType,
      });
      router.push(`/resume/${resume.id}`);
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

  const hasErrors = Object.keys(errors).length > 0 && touched.size > 0;

  const inputClass = (field: string) =>
    `w-full px-3 py-2 rounded-lg border outline-none transition text-sm ${
      errors[field] && touched.has(field)
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30"
        : "border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
    }`;
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionClass = "bg-white rounded-xl border border-gray-100 p-6 mb-4";

  if (!industrySlug) {
    return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">请先选择行业</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress Stepper */}
      <div className="flex items-center justify-center gap-1 mb-8">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                i === 1
                  ? "bg-blue-600 text-white shadow-sm"
                  : i === 0
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i === 0 && <Check className="w-3 h-3" />}
              {step.label}
            </div>
            {i < STEPS.length - 1 && <div className="w-4 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> 返回选择行业
      </button>

      <h1 className="text-2xl font-bold mb-1">填写简历信息</h1>
      <p className="text-gray-500 mb-8">填写越详细，AI生成效果越好。标 * 为必填项</p>

      {/* Basic Info */}
      <div className={sectionClass}>
        <h2 className="font-semibold mb-4">基本信息</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-name" className={labelClass}>姓名 *</label>
            <input
              id="field-name"
              className={inputClass("name")}
              value={rawData.name}
              onChange={(e) => { updateField("name", e.target.value); markTouched("name"); }}
              onBlur={() => handleBlur("name")}
              placeholder="张三"
              aria-label="姓名"
              aria-required="true"
            />
            <FieldError msg={touched.has("name") ? errors.name : undefined} />
          </div>
          <div>
            <label htmlFor="field-phone" className={labelClass}>手机号 *</label>
            <input
              id="field-phone"
              className={inputClass("phone")}
              value={rawData.phone}
              onChange={(e) => { updateField("phone", e.target.value); markTouched("phone"); }}
              onBlur={() => handleBlur("phone")}
              placeholder="13800138000"
              aria-label="手机号"
              aria-required="true"
            />
            <FieldError msg={touched.has("phone") ? errors.phone : undefined} />
          </div>
          <div>
            <label htmlFor="field-email" className={labelClass}>邮箱</label>
            <input
              id="field-email"
              className={inputClass("email")}
              value={rawData.email}
              onChange={(e) => { updateField("email", e.target.value); markTouched("email"); }}
              onBlur={() => handleBlur("email")}
              placeholder="zhangsan@email.com"
              aria-label="邮箱"
            />
            <FieldError msg={touched.has("email") ? errors.email : undefined} />
          </div>
          <div>
            <label htmlFor="field-location" className={labelClass}>所在城市</label>
            <input
              id="field-location"
              className={inputClass("location")}
              value={rawData.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="北京"
              aria-label="所在城市"
            />
          </div>
          <div>
            <label htmlFor="field-level" className={labelClass}>目标职级</label>
            <select
              id="field-level"
              className={inputClass("level")}
              value={positionLevel}
              onChange={(e) => setPositionLevel(e.target.value)}
              aria-label="目标职级"
            >
              {POSITION_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="field-company-type" className={labelClass}>目标公司类型</label>
            <select
              id="field-company-type"
              className={inputClass("company")}
              value={companyType}
              onChange={(e) => setCompanyType(e.target.value)}
              aria-label="目标公司类型"
            >
              <option value="">不限</option>
              {COMPANY_TYPES.map((ct) => (
                <option key={ct.slug} value={ct.slug}>{ct.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">教育背景</h2>
          <button onClick={addEducation} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700" aria-label="添加教育经历">
            <Plus className="w-3.5 h-3.5" /> 添加
          </button>
        </div>
        {rawData.education.length === 0 && (
          <p className="text-sm text-gray-400">点击"添加"添加教育经历</p>
        )}
        {rawData.education.map((edu, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
            <button onClick={() => removeEducation(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500" aria-label="删除此条教育经历">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid sm:grid-cols-2 gap-3">
              <input className={inputClass(`edu-${i}`)} value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} placeholder="学校名称" aria-label="学校名称" />
              <input className={inputClass(`edu-${i}`)} value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} placeholder="学位（如 硕士）" aria-label="学位" />
              <input className={inputClass(`edu-${i}`)} value={edu.major} onChange={(e) => updateEducation(i, "major", e.target.value)} placeholder="专业" aria-label="专业" />
              <input className={inputClass(`edu-${i}`)} value={edu.duration} onChange={(e) => updateEducation(i, "duration", e.target.value)} placeholder="时间（如 2018.09 - 2021.07）" aria-label="就读时间" />
            </div>
          </div>
        ))}
      </div>

      {/* Work Experience */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">工作经历</h2>
          <button onClick={addWork} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700" aria-label="添加工作经历">
            <Plus className="w-3.5 h-3.5" /> 添加
          </button>
        </div>
        {rawData.work_experience.map((work, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
            <button onClick={() => removeWork(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500" aria-label="删除此条工作经历">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <input className={inputClass(`work-${i}`)} value={work.company} onChange={(e) => updateWork(i, "company", e.target.value)} placeholder="公司名称" aria-label="公司名称" />
              <input className={inputClass(`work-${i}`)} value={work.title} onChange={(e) => updateWork(i, "title", e.target.value)} placeholder="职位" aria-label="职位" />
              <input className={inputClass(`work-${i}`)} value={work.duration} onChange={(e) => updateWork(i, "duration", e.target.value)} placeholder="时间（如 2021.08 - 至今）" aria-label="工作时间" />
            </div>
            <label className={labelClass}>工作职责</label>
            {work.responsibilities.map((resp, ri) => (
              <div key={ri} className="flex gap-2 mb-2">
                <input
                  className={inputClass(`resp-${i}-${ri}`)}
                  value={resp}
                  onChange={(e) => updateResponsibility(i, ri, e.target.value)}
                  placeholder={`职责 ${ri + 1}（如：负责抖音推荐策略产品，DAU提升20%）`}
                  aria-label={`工作职责 ${ri + 1}`}
                />
              </div>
            ))}
            <button onClick={() => addResponsibility(i)} className="text-xs text-blue-600 hover:text-blue-700" aria-label="添加更多职责">+ 添加职责</button>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">项目经验</h2>
          <button onClick={addProject} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700" aria-label="添加项目经验">
            <Plus className="w-3.5 h-3.5" /> 添加
          </button>
        </div>
        {rawData.projects.map((proj, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
            <button onClick={() => removeProject(i)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500" aria-label="删除此条项目经验">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <input className={inputClass(`proj-${i}`)} value={proj.name} onChange={(e) => updateProject(i, "name", e.target.value)} placeholder="项目名称" aria-label="项目名称" />
              <input className={inputClass(`proj-${i}`)} value={proj.role} onChange={(e) => updateProject(i, "role", e.target.value)} placeholder="担任角色" aria-label="担任角色" />
              <input className={inputClass(`proj-${i}`)} value={proj.duration} onChange={(e) => updateProject(i, "duration", e.target.value)} placeholder="项目周期" aria-label="项目周期" />
            </div>
            <input className={`${inputClass(`proj-desc-${i}`)} mb-2`} value={proj.description} onChange={(e) => updateProject(i, "description", e.target.value)} placeholder="项目描述" aria-label="项目描述" />
            <input className={inputClass(`proj-result-${i}`)} value={proj.results} onChange={(e) => updateProject(i, "results", e.target.value)} placeholder="项目成果（量化数据）" aria-label="项目成果" />
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className={sectionClass}>
        <h2 className="font-semibold mb-4">专业技能</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {rawData.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm cursor-pointer hover:bg-red-50 hover:text-red-700 transition"
              onClick={() => removeSkill(skill)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && removeSkill(skill)}
              aria-label={`删除技能 ${skill}`}
            >
              {skill} &times;
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className={inputClass("skill-input")}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="输入技能，按回车添加（如 SQL、Figma）"
            aria-label="输入技能"
          />
          <button onClick={addSkill} className="px-3 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200 transition" aria-label="添加技能">添加</button>
        </div>
      </div>

      {/* Self Evaluation */}
      <div className={sectionClass}>
        <h2 className="font-semibold mb-4">自我评价</h2>
        <textarea
          className={inputClass("self_eval")}
          rows={3}
          value={rawData.self_evaluation}
          onChange={(e) => updateField("self_evaluation", e.target.value)}
          placeholder="简单描述你的职业特点和优势（可选，AI会帮你润色）"
          aria-label="自我评价"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={generating}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
        aria-label="生成简历"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> AI正在生成简历...
          </>
        ) : (
          "生成简历"
        )}
      </button>
    </div>
  );
}
