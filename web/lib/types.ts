export interface Industry {
  id: string;
  slug: string;
  name_zh: string;
  category: string;
  icon?: string;
  sort_order: number;
}

export interface Education {
  school: string;
  degree: string;
  major: string;
  duration: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  duration: string;
  responsibilities: string[];
}

export interface Project {
  name: string;
  role: string;
  duration: string;
  description: string;
  results: string;
}

export interface ResumeRawData {
  name: string;
  phone: string;
  email: string;
  location: string;
  education: Education[];
  work_experience: WorkExperience[];
  projects: Project[];
  skills: string[];
  self_evaluation: string;
}

export interface ResumeSection {
  [key: string]: unknown;
}

export interface Resume {
  id: string;
  user_id: string;
  industry_id: string;
  raw_data: ResumeRawData;
  generated_sections: Record<string, unknown> | null;
  generated_full_text: string | null;
  pdf_url: string | null;
  status: "draft" | "generating" | "completed" | "failed";
  position_level: string | null;
  target_company_type: string | null;
  tokens_used: number;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  what_interviewer_looks_for: string;
  suggested_framework: string;
  answer_outline: string;
  common_mistakes: string;
  topic?: string;
  scenario?: string;
  focus?: string;
  related_to_resume?: boolean;
}

export interface InterviewQuestionSet {
  id: string;
  user_id: string;
  resume_id: string | null;
  industry_id: string;
  position_level: string | null;
  role_type: string | null;
  company_type: string | null;
  questions: {
    behavioral: Question[];
    professional: Question[];
    company_type: Question[];
    preparation_tips: string;
    metadata?: Record<string, string>;
  };
  tokens_used: number;
  status: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_no: string;
  product_type: "resume_generation" | "interview_questions" | "bundle";
  amount_cents: number;
  amount_display: string;
  payment_method: string | null;
  payment_status: "pending" | "paid" | "expired" | "refunded";
  qr_code_url: string | null;
  paid_at: string | null;
  created_at: string;
}

export const POSITION_LEVELS = ["初级", "中级", "高级", "资深", "总监"] as const;

export const COMPANY_TYPES = [
  { slug: "big-tech", name: "大厂" },
  { slug: "startup", name: "创业公司" },
  { slug: "unicorn", name: "独角兽" },
  { slug: "foreign", name: "外企" },
  { slug: "state-owned", name: "国企/央企" },
] as const;
