import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "AI简历助手 - 智能生成专业简历和面试题库",
  description: "选择行业，填写信息，AI自动生成专业简历和面试题目。覆盖50+行业。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head><link rel="icon" href="/favicon.svg" type="image/svg+xml" /></head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
