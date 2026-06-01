"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, MessageSquare, Sparkles, CheckCircle, ArrowLeft, Smartphone, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { PRICES } from "@/lib/constants";

const products = [
  { type: "resume_generation", name: "简历生成", desc: "AI 生成一份行业定制化专业简历，可下载 PDF", price: PRICES.resume_generation, icon: FileText, color: "blue" },
  { type: "interview_questions", name: "面试题库", desc: "30道面试真题 + AI 逐题批改评分", price: PRICES.interview_questions, icon: MessageSquare, color: "green" },
  { type: "bundle", name: "超值套餐", desc: "简历 + 面试题库 + 综合评估报告，立省 ¥1", price: PRICES.bundle, icon: Sparkles, color: "purple", badge: "最省钱" },
];

function OrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlProduct = searchParams.get("product") || "";

  const [step, setStep] = useState<"loading" | "select" | "pay" | "done">("loading");
  const [productType, setProductType] = useState(urlProduct || "bundle");
  const [orderNo, setOrderNo] = useState("");

  // Auto-create order if product specified in URL
  useEffect(() => {
    if (urlProduct && products.some(p => p.type === urlProduct)) {
      setProductType(urlProduct);
      createAndPay(urlProduct);
    } else {
      setStep("select");
    }
  }, [urlProduct]);

  // Poll order status every 2 seconds
  useEffect(() => {
    if (step !== "pay" || !orderNo) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/orders/status/${orderNo}`);
        const data = await res.json();
        if (data.status === "PAID") {
          setStep("done");
          toast.success("支付成功！现在可以使用全部功能了");
        }
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(timer);
  }, [step, orderNo]);

  const createAndPay = async (ptype: string) => {
    setProductType(ptype);
    try {
      const order = await api.createOrder({
        product_type: ptype,
        industry_slug: "internet-pm",
        payment_method: "wechat_pay",
      });
      setOrderNo(order.order_no);
      setStep("pay");
    } catch {
      toast.error("创建订单失败，请重试");
      setStep("select");
    }
  };

  const product = products.find(p => p.type === productType) || products[0];

  if (step === "loading") {
    return <div className="max-w-lg mx-auto px-4 py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {step === "pay" && (
        <button onClick={() => setStep("select")} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-6 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> 重新选择套餐
        </button>
      )}

      <h1 className="text-2xl font-bold mb-2">
        {step === "select" ? "选择套餐" : step === "pay" ? "微信扫码支付" : "支付成功"}
      </h1>
      <p className="text-gray-500 mb-8">
        {step === "select" ? "按次付费，不订阅，不自动续费"
          : step === "pay" ? `订单号: ${orderNo}`
          : "现在可以使用全部功能了"}
      </p>

      {/* Select product */}
      {step === "select" && (
        <div className="space-y-4">
          {products.map((p) => (
            <button key={p.type} onClick={() => createAndPay(p.type)}
              className={`w-full text-left p-5 rounded-xl border-2 transition ${p.type === "bundle" ? "border-purple-300 hover:border-purple-400 bg-purple-50/30" : "border-gray-100 hover:border-blue-200 bg-white"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color === "blue" ? "bg-blue-100" : p.color === "green" ? "bg-green-100" : "bg-purple-100"}`}>
                    <p.icon className={`w-5 h-5 ${p.color === "blue" ? "text-blue-600" : p.color === "green" ? "text-green-600" : "text-purple-600"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{p.name}</span>
                      {p.badge && <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 font-medium">{p.badge}</span>}
                    </div>
                    <p className="text-sm text-gray-500">{p.desc}</p>
                  </div>
                </div>
                <div className="text-right"><div className="text-xl font-bold">¥{p.price.label}</div><div className="text-xs text-gray-400">/次</div></div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Payment: QR code + polling */}
      {step === "pay" && (
        <div className="bg-white rounded-2xl border-2 border-green-200 p-8 text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">¥{product.price.label}</div>
          <p className="text-sm text-gray-500 mb-2">{product.name}</p>

          {/* WeChat QR code */}
          <div className="w-64 h-64 mx-auto mb-4 rounded-2xl overflow-hidden border-2 border-green-200 shadow-sm">
            <img src="/af7bac1e682084ad1b956a7f45dfe27a.png" alt="微信收款码" className="w-full h-full object-contain" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-4 text-sm text-gray-500">
            <Smartphone className="w-4 h-4" />
            <span>打开微信扫一扫，扫描上方二维码支付 <strong className="text-gray-700">¥{product.price.label}</strong></span>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl mb-6 text-left">
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>支付步骤：</strong><br />
              1. 截图或使用另一台手机打开此页面<br />
              2. 打开微信"扫一扫"，扫描上方收款码<br />
              3. 支付 <strong>¥{product.price.label}</strong> 完成付款<br />
              4. 支付成功后，管理员核对收款记录后自动确认
            </p>
          </div>

          {/* Polling indicator */}
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700">等待支付确认中...</p>
              <p className="text-xs text-gray-400">支付成功后自动进入下一步，请勿关闭页面</p>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">如有疑问，请联系管理员。订单号: {orderNo}</p>
        </div>
      )}

      {/* Done */}
      {step === "done" && (
        <div className="bg-white rounded-2xl border-2 border-green-200 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">支付成功！</h2>
          <p className="text-gray-500 mb-6">管理员已确认收款，你现在可以使用全部功能了</p>
          <div className="flex flex-col gap-3">
            <Link href="/resume/create" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
              <FileText className="w-4 h-4" /> 立即生成简历
            </Link>
            <Link href="/interview/create" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition">
              <MessageSquare className="w-4 h-4" /> 获取面试题库
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-20 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}>
      <OrderContent />
    </Suspense>
  );
}
