"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { useResumeDraftStore } from "@/lib/store";
import type { Industry } from "@/lib/types";

export default function SelectIndustryPage() {
  const router = useRouter();
  const { setIndustry } = useResumeDraftStore();
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getIndustries().then((res) => {
      setIndustries(res.items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = industries.filter((i) =>
    i.name_zh.includes(search) || i.category.includes(search)
  );

  const categories = [...new Set(industries.map((i) => i.category))];

  const handleSelect = (industry: Industry) => {
    setIndustry(industry.slug);
    router.push("/resume/fill");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
          <div className="h-12 bg-gray-200 rounded max-w-md mx-auto" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-8">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-center mb-2">选择你的目标行业</h1>
      <p className="text-center text-gray-500 mb-8">
        我们支持50+行业，AI会根据行业特点为你定制简历和面试题
      </p>

      {/* Search */}
      <div className="relative max-w-md mx-auto mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索行业..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
      </div>

      {/* Industry grid by category */}
      {categories.map((cat) => {
        const catIndustries = filtered.filter((i) => i.category === cat);
        if (catIndustries.length === 0) return null;

        return (
          <div key={cat} className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {cat}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {catIndustries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => handleSelect(ind)}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition text-left group"
                >
                  <div>
                    <span className="text-2xl">{ind.icon}</span>
                    <p className="text-sm font-medium mt-1">{ind.name_zh}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition shrink-0" />
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">未找到匹配的行业，试试其他关键词</p>
      )}
    </div>
  );
}
