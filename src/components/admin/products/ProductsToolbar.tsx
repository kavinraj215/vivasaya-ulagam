'use client';

import { Search, Filter, ArrowUpDown, Trash2, CheckSquare } from 'lucide-react';

type Props = {
  search: string;
  setSearch: (v: string) => void;
  statusFilter: 'all' | 'active' | 'draft';
  setStatusFilter: (v: 'all' | 'active' | 'draft') => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  uniqueCategories: string[];
  sortKey: string;
  setSortKey: (v: any) => void;
  sortDir: 'asc' | 'desc';
  selected: Set<string>;
  onBulkDelete: () => void;
  onBulkStatus: (s: 'active' | 'draft') => void;
  totalFiltered: number;
};

export default function ProductsToolbar({
  search, setSearch, statusFilter, setStatusFilter,
  categoryFilter, setCategoryFilter, uniqueCategories,
  sortKey, setSortKey, selected, onBulkDelete, onBulkStatus, totalFiltered
}: Props) {
  const hasSelection = selected.size > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 space-y-3">
      {/* Search + Filters row */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products by name or SKU…"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-2">
          <Filter size={13} className="text-gray-450 shrink-0" />
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="py-1.5 pr-6 border-none bg-transparent text-xs text-gray-600 font-semibold focus:outline-none focus:ring-0 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'active', 'draft'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown size={14} className="text-gray-400" />
          <select value={sortKey} onChange={e => setSortKey(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-gray-900/10 bg-white">
            <option value="createdAt">Date</option>
            <option value="title">Name A–Z</option>
            <option value="price">Price</option>
            <option value="quantity">Stock</option>
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {hasSelection && (
        <div className="flex items-center gap-3 py-2 px-3 bg-gray-900 text-white rounded-lg text-sm">
          <CheckSquare size={15} className="text-gray-400" />
          <span className="font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <button onClick={() => onBulkStatus('active')}
            className="px-3 py-1.5 bg-green-500 hover:bg-green-400 rounded-lg text-xs font-semibold transition-colors">
            Set Active
          </button>
          <button onClick={() => onBulkStatus('draft')}
            className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded-lg text-xs font-semibold transition-colors">
            Set Draft
          </button>
          <button onClick={onBulkDelete}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-400 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}

      {/* Result count */}
      {!hasSelection && (
        <p className="text-xs text-gray-400 px-1">{totalFiltered} result{totalFiltered !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}
