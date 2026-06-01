import Link from "next/link";
import { FileText, MessageSquare, LayoutDashboard } from "lucide-react";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg text-blue-600">
            AI简历助手
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">工作台</span>
            </Link>
            <Link
              href="/resume/create"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">简历</span>
            </Link>
            <Link
              href="/interview/create"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">面试</span>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
