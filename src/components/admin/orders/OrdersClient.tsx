"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import OrdersStatsBar from "./OrdersStatsBar";
import OrdersToolbar, { type OrderFilters } from "./OrdersToolbar";
import OrdersTable from "./OrdersTable";

interface Props { orders: any[]; }

const DEFAULT_FILTERS: OrderFilters = {
  search: "", status: "all", payment: "all", sort: "date_desc",
};

// CSV export helper
function exportToCSV(orders: any[], selectedIds: Set<string>) {
  const targets = selectedIds.size > 0 ? orders.filter((o) => selectedIds.has(o._id)) : orders;
  const rows = [
    ["Order ID", "Customer", "Email", "Date", "Payment", "Status", "Total (₹)"],
    ...targets.map((o) => [
      o.orderId || "—",
      o.user?.name || "Guest",
      o.user?.email || "—",
      new Date(o.createdAt).toLocaleDateString("en-IN"),
      o.isPaid ? "Paid" : "COD",
      o.status,
      (o.totalAmount / 100).toFixed(2),
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function OrdersClient({ orders }: Props) {
  const [filters, setFilters]       = useState<OrderFilters>(DEFAULT_FILTERS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleExport = useCallback(() => exportToCSV(orders, selectedIds), [orders, selectedIds]);
  const handleClearSelection = useCallback(() => setSelectedIds(new Set()), []);

  return (
    <div>
      {/* Stats bar */}
      <OrdersStatsBar orders={orders} />

      {/* Card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="bg-white border border-[#e5e5e5] rounded-[14px] p-5"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
      >
        {/* Toolbar */}
        <div className="mb-4">
          <OrdersToolbar
            filters={filters}
            onFiltersChange={setFilters}
            selectedCount={selectedIds.size}
            totalCount={orders.length}
            onBulkExport={handleExport}
            onClearSelection={handleClearSelection}
          />
        </div>

        {/* Table */}
        <OrdersTable
          orders={orders}
          filters={filters}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </motion.div>
    </div>
  );
}
