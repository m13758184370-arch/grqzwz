export const PRICES: Record<string, { cents: number; label: string }> = {
  resume_generation: { cents: 200, label: "2" },
  interview_questions: { cents: 300, label: "3" },
  bundle: { cents: 400, label: "4" },
};

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const TRIAL_INTERVIEW_LIMIT = 3;
