import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { PLATFORMS, PRESET_TAGS } from '@/lib/constants';

export default function SearchFilter({ search, setSearch, filters, setFilters }) {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search problem..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-md pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <button
          onClick={() => setFilterOpen((o) => !o)}
          className="flex items-center gap-1.5 border border-border bg-card px-4 py-2.5 rounded-md text-sm font-medium hover:bg-black/[0.02] transition-colors"
        >
          Filter
          <ChevronDown
            className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {filterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          <Select
            value={filters.platform}
            onChange={(v) => setFilters((f) => ({ ...f, platform: v }))}
            options={['All', ...PLATFORMS]}
            label="Platform"
          />
          <Select
            value={filters.tag}
            onChange={(v) => setFilters((f) => ({ ...f, tag: v }))}
            options={['All', ...PRESET_TAGS]}
            label="Topic"
          />
          <Select
            value={filters.confidence}
            onChange={(v) => setFilters((f) => ({ ...f, confidence: v }))}
            options={['All', '1', '2', '3', '4', '5']}
            label="Confidence"
          />
        </div>
      )}
    </div>
  );
}

function Select({ value, onChange, options, label }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt === 'All' ? `${label}: All` : opt}
        </option>
      ))}
    </select>
  );
}
