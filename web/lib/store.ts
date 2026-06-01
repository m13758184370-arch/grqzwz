import { create } from "zustand";
import type { ResumeRawData } from "./types";

interface SessionStore {
  sessionId: string;
  setSessionId: (id: string) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId:
    typeof window !== "undefined" ? localStorage.getItem("session_id") || "" : "",
  setSessionId: (id: string) => {
    localStorage.setItem("session_id", id);
    set({ sessionId: id });
  },
}));

interface ResumeDraftStore {
  industrySlug: string;
  rawData: ResumeRawData;
  setIndustry: (slug: string) => void;
  updateField: (field: keyof ResumeRawData, value: unknown) => void;
  reset: () => void;
}

const emptyRawData: ResumeRawData = {
  name: "",
  phone: "",
  email: "",
  location: "",
  education: [],
  work_experience: [],
  projects: [],
  skills: [],
  self_evaluation: "",
};

export const useResumeDraftStore = create<ResumeDraftStore>((set) => ({
  industrySlug: "",
  rawData: { ...emptyRawData },
  setIndustry: (slug: string) => set({ industrySlug: slug }),
  updateField: (field, value) =>
    set((s) => ({ rawData: { ...s.rawData, [field]: value } })),
  reset: () => set({ industrySlug: "", rawData: { ...emptyRawData } }),
}));
