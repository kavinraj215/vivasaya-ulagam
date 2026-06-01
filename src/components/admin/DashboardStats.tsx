"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { X, TrendingUp, ShoppingBag, Users, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  recentOrders: any[];
}

export default function DashboardStats({ totalRevenue, totalOrders, totalUsers, recentOrders }: Props) {
  const [activePanel, setActivePanel] = useState<"revenue" | "orders" | "users" | null>(null);

  const togglePanel = (panel: "revenue" | "orders" | "users") => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <button
          onClick={() => togglePanel("revenue")}
          className={`bg-white p-6 rounded-xl shadow-sm border-2 text-left transition-all hover:shadow-md ${activePanel === "revenue" ? "border-primary" : "border-gray-100 hover:border-primary/30"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <TrendingUp size={20} strokeWidth={1.75} className="text-primary" />
            </div>
            <ChevronDown size={16} strokeWidth={1.75} className={`text-gray-400 transition-transform duration-250 ${activePanel === "revenue" ? "rotate-180 text-primary" : ""}`} />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-bold text-primary mt-1">{formatPrice(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">From paid orders</p>
        </button>

        {/* Orders Card */}
        <button
          onClick={() => togglePanel("orders")}
          className={`bg-white p-6 rounded-xl shadow-sm border-2 text-left transition-all hover:shadow-md ${activePanel === "orders" ? "border-blue-500" : "border-gray-100 hover:border-blue-200"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShoppingBag size={20} strokeWidth={1.75} className="text-blue-600" />
            </div>
            <ChevronDown size={16} strokeWidth={1.75} className={`text-gray-400 transition-transform duration-250 ${activePanel === "orders" ? "rotate-180 text-blue-600" : ""}`} />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalOrders}</p>
          <p className="text-xs text-gray-400 mt-1">All time orders</p>
        </button>

        {/* Users Card */}
        <button
          onClick={() => togglePanel("users")}
          className={`bg-white p-6 rounded-xl shadow-sm border-2 text-left transition-all hover:shadow-md ${activePanel === "users" ? "border-purple-500" : "border-gray-100 hover:border-purple-200"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users size={20} strokeWidth={1.75} className="text-purple-600" />
            </div>
            <ChevronDown size={16} strokeWidth={1.75} className={`text-gray-400 transition-transform duration-250 ${activePanel === "users" ? "rotate-180 text-purple-600" : ""}`} />
          </div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered Users</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{totalUsers}</p>
          <p className="text-xs text-gray-400 mt-1">Total members</p>
        </button>
      </div>

      {/* Expandable Panel */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-800 text-lg">
                  {activePanel === "revenue" && "💰 Revenue Breakdown — Recent Orders"}
                  {activePanel === "orders" && "📦 Recent Orders"}
                  {activePanel === "users" && "👥 User Statistics"}
                </h3>
                <button onClick={() => setActivePanel(null)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-250">
                  <X size={18} strokeWidth={1.75} className="text-gray-500" />
                </button>
              </div>

              {/* Revenue Panel */}
              {activePanel === "revenue" && (
                <div className="space-y-3">
                  {recentOrders.filter(o => o.isPaid).length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No paid orders yet.</p>
                  ) : (
                    recentOrders.filter(o => o.isPaid).map((order: any) => (
                      <div key={order._id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                        <div>
                          <p className="font-bold text-sm text-green-800">{order.orderId}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                          <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">PAID</span>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="border-t pt-3 flex justify-between font-bold text-sm">
                    <span>Total Revenue</span>
                    <span className="text-primary text-lg">{formatPrice(totalRevenue)}</span>
                  </div>
                </div>
              )}

              {/* Orders Panel */}
              {activePanel === "orders" && (
                <div className="space-y-3">
                  {recentOrders.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">No orders yet.</p>
                  ) : (
                    recentOrders.map((order: any) => (
                      <div key={order._id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div>
                          <p className="font-bold text-sm text-blue-800">{order.orderId}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{formatPrice(order.totalAmount)}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'processing' ? 'bg-blue-200 text-blue-800' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>{order.status.toUpperCase()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Users Panel */}
              {activePanel === "users" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-purple-700">{totalUsers}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Total Registered</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold text-blue-700">{recentOrders.length}</p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Customers Who Ordered</p>
                  </div>
                  <div className="col-span-2 bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-xl font-bold text-gray-700">
                      {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(0) : 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Average Order Value (₹)</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
