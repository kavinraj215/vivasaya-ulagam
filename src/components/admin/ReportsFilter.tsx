"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Filter } from "lucide-react";

export default function ReportsFilter({ currentParams, cities }: { currentParams: any, cities: string[] }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentParams.status || "all");
  const [city, setCity] = useState(currentParams.city || "all");
  const [date, setDate] = useState(currentParams.date || "all");

  const handleApply = () => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    if (city !== 'all') params.set('city', city);
    if (date !== 'all') params.set('date', date);
    
    router.push(`/admin/reports?${params.toString()}`);
  };

  const handleReset = () => {
    setStatus("all");
    setCity("all");
    setDate("all");
    router.push("/admin/reports");
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Order Status</label>
        <select 
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-primary bg-gray-50"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location (City)</label>
        <select 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-primary bg-gray-50 capitalize"
        >
          <option value="all">All Locations</option>
          {cities.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[150px]">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time Period</label>
        <select 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-md p-2 text-sm outline-none focus:border-primary bg-gray-50"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      </div>

      <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
        <button 
          onClick={handleApply}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-bold text-sm hover:bg-primary-dark transition-colors"
        >
          <Filter size={16} /> Apply Filters
        </button>
        <button 
          onClick={handleReset}
          className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 rounded-md transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
