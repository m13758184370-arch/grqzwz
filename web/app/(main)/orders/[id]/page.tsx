"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle, Clock } from "lucide-react";
import { api } from "@/lib/api-client";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetch = async () => {
      try {
        const o = await api.getOrder(orderId);
        setOrder(o);
        if (o.payment_status === "paid") {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };

    fetch();
    interval = setInterval(fetch, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading && !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-gray-500">
        订单未找到
      </div>
    );
  }

  const productLabels: Record<string, string> = {
    resume_generation: "简历生成",
    interview_questions: "面试题库",
    bundle: "超值套餐（简历+面试）",
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-xl font-bold mb-6">订单详情</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">订单编号</span>
          <span className="font-mono">{order.order_no}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">产品</span>
          <span>{productLabels[order.product_type] || order.product_type}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">金额</span>
          <span className="font-semibold">¥{formatPrice(order.amount_cents)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">支付方式</span>
          <span>{order.payment_method === "wechat_pay" ? "微信支付" : order.payment_method || "-"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">状态</span>
          <span className={order.payment_status === "paid" ? "text-green-600 font-medium" : "text-yellow-600"}>
            {order.payment_status === "paid" ? (
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> 已支付</span>
            ) : order.payment_status === "pending" ? (
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 待支付</span>
            ) : order.payment_status}
          </span>
        </div>
        {order.paid_at && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">支付时间</span>
            <span>{formatDate(order.paid_at)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">创建时间</span>
          <span>{formatDate(order.created_at)}</span>
        </div>
      </div>

      {order.payment_status === "pending" && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl text-center">
          <p className="text-sm text-yellow-700 mb-3">
            在模拟环境中，点击下方按钮确认支付
          </p>
          <button
            onClick={async () => {
              await fetch(`/api/v1/payments/callback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  order_no: order.order_no,
                  transaction_id: `SIM${Date.now()}`,
                }),
              });
              const updated = await api.getOrder(orderId);
              setOrder(updated);
            }}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            模拟支付
          </button>
        </div>
      )}

      {order.payment_status === "paid" && (
        <div className="mt-6 text-center">
          <p className="text-green-600 font-medium mb-3">支付成功！</p>
          <a href="/resume/create" className="text-blue-600 text-sm hover:underline">
            立即使用 →
          </a>
        </div>
      )}
    </div>
  );
}
