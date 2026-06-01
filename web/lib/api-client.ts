const API_BASE = "/api/v1";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("session_id", id);
  }
  return id;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Session-Id": getSessionId(),
      ...options.headers,
    },
  });

  if (res.status === 402) {
    throw new Error("INSUFFICIENT_CREDITS");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }

  // Handle binary responses (PDF)
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/pdf")) {
    return res.blob() as unknown as T;
  }

  return res.json();
}

export const api = {
  // Industries
  getIndustries: (category?: string) =>
    request<{ items: import("./types").Industry[] }>(
      `/industries${category ? `?category=${encodeURIComponent(category)}` : ""}`
    ),

  getIndustry: (slug: string) =>
    request<import("./types").Industry & { prompt_config: Record<string, unknown> }>(
      `/industries/${slug}`
    ),

  // Resumes
  createResume: (data: {
    industry_slug: string;
    raw_data: import("./types").ResumeRawData;
    position_level?: string;
    target_company_type?: string;
  }) =>
    request<import("./types").Resume>("/resumes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getResume: (id: string) => request<import("./types").Resume>(`/resumes/${id}`),

  getResumeStatus: (id: string) =>
    request<{ status: string; progress: string }>(`/resumes/${id}/status`),

  downloadResumePdf: (id: string) =>
    request<Blob>(`/resumes/${id}/pdf`),

  listResumes: (page = 1, pageSize = 10) =>
    request<{ items: import("./types").Resume[]; total: number }>(
      `/resumes?page=${page}&page_size=${pageSize}`
    ),

  // Interviews
  createInterview: (data: {
    industry_slug: string;
    position_level?: string;
    role_type?: string;
    company_type?: string;
    resume_id?: string;
  }) =>
    request<import("./types").InterviewQuestionSet>("/interviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getInterview: (id: string) =>
    request<import("./types").InterviewQuestionSet>(`/interviews/${id}`),

  listInterviews: (page = 1, pageSize = 10) =>
    request<{ items: import("./types").InterviewQuestionSet[]; total: number }>(
      `/interviews?page=${page}&page_size=${pageSize}`
    ),

  // Orders
  createOrder: (data: {
    product_type: string;
    industry_slug: string;
    payment_method?: string;
  }) =>
    request<import("./types").Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getOrder: (id: string) => request<import("./types").Order>(`/orders/${id}`),

  listOrders: (page = 1, pageSize = 10) =>
    request<{ items: import("./types").Order[]; total: number }>(
      `/orders?page=${page}&page_size=${pageSize}`
    ),
};
