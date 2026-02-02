import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { SortOption } from '@/hooks/useSidebarFilters';

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'created-desc', label: 'Newest first' },
  { value: 'created-asc', label: 'Oldest first' },
  { value: 'requests-desc', label: 'Most requests' },
  { value: 'requests-asc', label: 'Least requests' },
];

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLabel = SORT_OPTIONS.find((opt) => opt.value === value)?.label || 'Sort';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 h-7 bg-(--background) border border-(--border) rounded text-xs text-(--text-secondary) hover:text-(--text-primary) hover:border-(--border-hover) transition-colors"
        aria-label="Sort options"
      >
        {currentLabel}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-36 bg-(--surface) border border-(--border) rounded shadow-lg z-50">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-2 py-1.5 text-left text-xs transition-colors ${
                option.value === value
                  ? 'bg-(--accent-blue)/10 text-(--accent-blue)'
                  : 'text-(--text-secondary) hover:bg-(--background) hover:text-(--text-primary)'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
