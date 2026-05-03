"use client";

import { useState } from "react";
import { Search, Bell, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchHeaderProps {
  query: string;
  onQuery: (q: string) => void;
  onAdd: () => void;
  onBell: () => void;
  expiringCount: number;
}

export function SearchHeader({ query, onQuery, onAdd, onBell, expiringCount }: SearchHeaderProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <div
        className={cn(
          "flex flex-1 items-center gap-2 h-10 px-3 bg-white dark:bg-[#262626] rounded-xl border transition-colors",
          focused
            ? "border-[#18181B] dark:border-white"
            : "border-[#e5e5e5] dark:border-[#3f3f46]"
        )}
      >
        <Search size={15} className="text-[#a3a3a3] shrink-0" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search inventory"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[14px] text-[#18181B] dark:text-white placeholder:text-[#a3a3a3]"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="text-[#a3a3a3] hover:text-[#18181B] dark:hover:text-white flex items-center -m-1 p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onBell}
        className="relative h-10 w-10 flex items-center justify-center bg-white dark:bg-[#262626] border border-[#e5e5e5] dark:border-[#3f3f46] rounded-xl shrink-0 text-[#18181B] dark:text-white"
        aria-label="Expiring items"
      >
        <Bell size={16} />
        {expiringCount > 0 && (
          <span className="absolute top-2 right-2 h-[7px] w-[7px] rounded-full bg-[#EF4444] border-[1.5px] border-white dark:border-[#262626]" />
        )}
      </button>

      <button
        type="button"
        onClick={onAdd}
        className="h-10 w-10 flex items-center justify-center bg-[#18181B] dark:bg-white border border-[#18181B] dark:border-white rounded-xl shrink-0 text-white dark:text-[#18181B]"
        aria-label="Add item"
      >
        <Plus size={18} />
      </button>
    </div>
  );
}
