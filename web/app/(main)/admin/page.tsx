"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, RefreshCw, User, Hash } from "lucide-react";
import { toast } from "sonner";

interface PendingOrder {
  id: string;
  order_no: string;
  product_type: string;
  amount_cents: number;
  amount_display: string;
  wechat_name?: string;
  payment_status: string;
  session_id: string;
  created_at: string;
}

const productLabels: Record<string, string> = {
  resume_generation: "简历生成 ¥2",
  interview_questions: "面试题库 ¥3",
  bundle: "超值套餐 ¥4",
};

export default function AdminPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/v1/admin/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleApprove = async (orderNo: string) => {
    try {
      const res = await fetch("/api/v1/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_no: orderNo }),
      });
      const data = await res.json();
      if (data.code === "SUCCESS") {
        toast.success("已确认收款，权益已发放");
        setOrders((prev) => prev.filter((o) => o.order_no !== orderNo));
      } else {
        toast.error("确认失败");
      }
    } catch {
      toast.error("操作失败");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">管理员面板</h1>
          <p className="text-gray-500 text-sm mt-1">核对微信收款记录并确认用户付款</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          <RefreshCw className="w-3.5 h-3.5" /> 刷新
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-3" />
          <p className="text-gray-500">没有待确认的订单</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border-2 border-blue-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {productLabels[order.product_type] || order.product_type}
                    </span>
                    <span className="text-lg font-bold">¥{order.amount_display}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {order.order_no}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleTimeString("zh-CN")}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg mb-3 text-xs text-amber-700">
                <strong>操作步骤：</strong>在微信中查找对应的 ¥{order.amount_display} 付款记录，确认收款后点击下方按钮发放权益。
              </div>

              <button
                onClick={() => handleApprove(order.order_no)}
                className="w-full py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> 确认已收款，发放权益
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
